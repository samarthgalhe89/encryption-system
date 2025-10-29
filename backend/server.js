import express from "express";
import dotenv from "dotenv"; // 1. Import dotenv
import cors from "cors";
import connectDB from "./config/db.js";

// --- THIS IS THE FIX ---
// 2. Load environment variables FIRST.
dotenv.config();
// --- END OF FIX ---

// 3. NOW import routes that need those variables.
import authRoutes from "./routes/auth.js";
import fileRoutes from "./routes/files.js"; 

// (Your console.log in server.js can be removed now if you want)

// 4. Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("✅ Backend API is running...");
});

// Server setup
const PORT = process.env.PORT || 5000; // Use port 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));