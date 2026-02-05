// routes/files.js
import express from "express";
import multer from "multer";
import authMiddleware from "../middlewares/auth.middleware.js";
import FileMetadata from "../models/FileMetadata.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { encrypt, decrypt } from "../utils/aes.js";

dotenv.config();

const router = express.Router();

// ✅ Use memory storage instead of GridFS storage (we'll encrypt first)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// @route POST /api/files/upload
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: "No file selected for upload." });

  try {
    console.log("\n📤 Starting file upload with encryption...");
    console.log("File:", req.file.originalname, `(${req.file.size} bytes)`);

    // 🔐 Step 1: Encrypt the file buffer
    const PIN = process.env.DECRYPTION_PIN || "admin123"; // Default PIN for development
    const encryptedData = encrypt(req.file.buffer, PIN);

    // 🔐 Step 2: Store encrypted data in GridFS
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "uploads" });

    const filename = `${Date.now()}-${req.file.originalname}`;
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        uploaderId: req.hospitalId,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        isEncrypted: true
      }
    });

    // Write encrypted data to GridFS
    const encryptedBuffer = Buffer.from(encryptedData.ciphertext, 'hex');
    uploadStream.end(encryptedBuffer);

    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });

    // 🔐 Step 3: Save metadata with encryption info
    const newFileMetadata = new FileMetadata({
      fileId: uploadStream.id,
      uploader: req.hospitalId,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      isEncrypted: true,
      iv: encryptedData.iv,
      salt: encryptedData.salt,
      authTag: encryptedData.authTag,
      encryptionAlgorithm: encryptedData.algorithm
    });

    await newFileMetadata.save();

    console.log("✅ File uploaded and encrypted successfully");
    console.log("🔐 Stored in GridFS as encrypted data\n");

    res.json({
      msg: "File uploaded and encrypted successfully",
      fileId: newFileMetadata._id,
      filename: req.file.originalname,
    });
  } catch (error) {
    console.error("❌ Error during upload/encryption:", error.message);
    res.status(500).json({ msg: "Server error during file upload." });
  }
});

// @route GET /api/files
router.get("/", authMiddleware, async (req, res) => {
  try {
    const files = await FileMetadata.find({ uploader: req.hospitalId })
      .sort({ uploadDate: -1 })
      .select('-__v -uploader');
    res.json(files);
  } catch (error) {
    console.error("Error fetching files:", error.message);
    res.status(500).json({ msg: "Server error while fetching files." });
  }
});

// @route POST /api/files/:id/download
// @desc Download and decrypt file with PIN verification
router.post("/:id/download", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { pin } = req.body;

    console.log("\n🔓 Download request for file:", id);

    if (!pin) {
      return res.status(400).json({ msg: "PIN is required to decrypt files." });
    }

    // Verify PIN matches the one in .env
    const CORRECT_PIN = process.env.DECRYPTION_PIN || "admin123";
    if (pin !== CORRECT_PIN) {
      console.log("❌ Invalid PIN provided");
      return res.status(401).json({ msg: "Invalid PIN. Access denied." });
    }

    console.log("✅ PIN verified");

    // Find the file metadata
    const fileMetadata = await FileMetadata.findOne({
      _id: id,
      uploader: req.hospitalId
    });

    if (!fileMetadata) {
      return res.status(404).json({ msg: "File not found or unauthorized." });
    }

    console.log("📄 File found:", fileMetadata.originalName);

    // Fetch encrypted data from GridFS
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "uploads" });

    const chunks = [];
    const downloadStream = bucket.openDownloadStream(fileMetadata.fileId);

    downloadStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    downloadStream.on('error', (error) => {
      console.error("❌ GridFS download error:", error.message);
      res.status(500).json({ msg: "Error downloading file from storage." });
    });

    downloadStream.on('end', async () => {
      try {
        const encryptedBuffer = Buffer.concat(chunks);
        console.log("📥 Encrypted data retrieved:", encryptedBuffer.length, "bytes");

        // Decrypt the file
        const encryptedData = {
          ciphertext: encryptedBuffer.toString('hex'),
          iv: fileMetadata.iv,
          salt: fileMetadata.salt,
          authTag: fileMetadata.authTag
        };

        const decryptedBuffer = decrypt(encryptedData, pin);

        console.log("✅ File decrypted successfully\n");

        // Send decrypted file to client
        res.set({
          'Content-Type': fileMetadata.mimeType,
          'Content-Disposition': `inline; filename="${fileMetadata.originalName}"`,
          'Content-Length': decryptedBuffer.length
        });

        res.send(decryptedBuffer);
      } catch (decryptError) {
        console.error("❌ Decryption error:", decryptError.message);
        res.status(400).json({ msg: "Failed to decrypt file. Invalid PIN or corrupted data." });
      }
    });
  } catch (error) {
    console.error("❌ Error during download:", error.message);
    res.status(500).json({ msg: "Server error while downloading file." });
  }
});

// @route DELETE /api/files/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the file metadata first
    const fileMetadata = await FileMetadata.findOne({
      _id: id,
      uploader: req.hospitalId
    });

    if (!fileMetadata) {
      return res.status(404).json({ msg: "File not found or unauthorized." });
    }

    // Delete from GridFS
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "uploads" });

    try {
      await bucket.delete(fileMetadata.fileId);
    } catch (gridfsError) {
      console.error("GridFS delete error (file may already be removed):", gridfsError.message);
    }

    // Delete the metadata
    await FileMetadata.findByIdAndDelete(id);

    res.json({ msg: "File deleted successfully." });
  } catch (error) {
    console.error("Error deleting file:", error.message);
    res.status(500).json({ msg: "Server error while deleting file." });
  }
});

export default router;
