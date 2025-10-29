import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Hospital from "../models/Hospital.js";

const router = express.Router();

// Signup (optional)
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await Hospital.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const hospital = new Hospital({ name, email, password: hashed });
    await hospital.save();

    res.json({ msg: "Hospital registered successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hospital = await Hospital.findOne({ email });
    if (!hospital) return res.status(400).json({ msg: "Invalid credentials" });

    const match = await bcrypt.compare(password, hospital.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: hospital._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.json({ token, hospital: { name: hospital.name, email: hospital.email } });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
