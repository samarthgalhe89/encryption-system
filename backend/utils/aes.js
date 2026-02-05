import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12;  // Recommended for GCM
const SALT_LENGTH = 16;
const ITERATIONS = 100000;
const DIGEST = "sha256";

/**
 * Derive a strong key from a password (PIN)
 * @param {string} password - The PIN/password to derive key from
 * @param {Buffer} salt - Random salt for key derivation
 * @returns {Buffer} - Derived encryption key
 */
function deriveKey(password, salt) {
    return crypto.pbkdf2Sync(
        password,
        salt,
        ITERATIONS,
        KEY_LENGTH,
        DIGEST
    );
}

/**
 * Encrypt data (string or buffer) using AES-256-GCM
 * @param {Buffer|string} data - Data to encrypt
 * @param {string} password - PIN/password for encryption
 * @returns {Object} - Encrypted data with metadata (ciphertext, iv, salt, authTag)
 */
function encrypt(data, password) {
    console.log("🔐 Starting encryption...");
    console.log("📤 Original data size:", Buffer.isBuffer(data) ? data.length : data.length, "bytes");

    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = deriveKey(password, salt);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
        cipher.update(data),
        cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    console.log("✅ Encryption successful");
    console.log("🔑 IV:", iv.toString("hex").substring(0, 16) + "...");
    console.log("🧂 Salt:", salt.toString("hex").substring(0, 16) + "...");
    console.log("🔐 Encrypted size:", encrypted.length, "bytes");

    return {
        ciphertext: encrypted.toString("hex"),
        iv: iv.toString("hex"),
        salt: salt.toString("hex"),
        authTag: authTag.toString("hex"),
        algorithm: ALGORITHM
    };
}

/**
 * Decrypt data using AES-256-GCM
 * @param {Object} encryptedData - Object containing ciphertext, iv, salt, authTag
 * @param {string} password - PIN/password for decryption (must match encryption PIN)
 * @returns {Buffer} - Decrypted data as Buffer
 * @throws {Error} - If wrong PIN or data tampering detected
 */
function decrypt(encryptedData, password) {
    console.log("🔓 Starting decryption...");

    const {
        ciphertext,
        iv,
        salt,
        authTag
    } = encryptedData;

    const key = deriveKey(password, Buffer.from(salt, "hex"));

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        key,
        Buffer.from(iv, "hex")
    );

    decipher.setAuthTag(Buffer.from(authTag, "hex"));

    try {
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(ciphertext, "hex")),
            decipher.final()
        ]);

        console.log("✅ Decryption successful");
        console.log("📥 Decrypted size:", decrypted.length, "bytes");

        return decrypted;
    } catch (error) {
        console.error("❌ Decryption failed:", error.message);
        throw new Error("Invalid PIN or corrupted data");
    }
}

export { encrypt, decrypt };
