import mongoose from "mongoose";

let gfs; // Variable to hold the GridFS bucket

const connectDB = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // 2. Initialize GridFS Bucket
    // Use the existing Mongoose connection to create a GridFS bucket
    gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads' // You can customize the bucket name
    });
    console.log("✅ GridFS Bucket Initialized");

  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
// Export gfs for use in other files (like routes/files.js)
export { gfs };