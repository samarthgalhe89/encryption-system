// routes/files.js
import express from "express";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import authMiddleware from "../middlewares/auth.middleware.js";
import FileMetadata from "../models/FileMetadata.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // ✅ make sure .env is loaded

const router = express.Router();

// ✅ Properly initialize GridFS storage using your Mongo URI
const storage = new GridFsStorage({
  url: process.env.MONGO_URI, // <-- This must exist in your .env
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "uploads",
      metadata: {
        uploaderId: req.hospitalId,
        originalName: file.originalname,
        mimeType: file.mimetype
      }
    };
  },
});

const upload = multer({ storage });

// @route POST /api/files/upload
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: "No file selected for upload." });

  try {
    const newFileMetadata = new FileMetadata({
      fileId: req.file.id,
      uploader: req.hospitalId,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size
    });

    await newFileMetadata.save();

    res.json({
      msg: "File uploaded successfully",
      fileId: req.file.id,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error("Error saving metadata:", error.message);
    res.status(500).json({ msg: "Server error during metadata save." });
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

export default router;
