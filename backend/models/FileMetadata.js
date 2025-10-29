import mongoose from 'mongoose';

const FileMetadataSchema = new mongoose.Schema({
  // Reference to the GridFS file ID
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  // The user/hospital who uploaded the file
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Hospital' // Assuming your hospital model is named 'Hospital'
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  fileSize: {
    type: Number,
    required: true
  }
});

const FileMetadata = mongoose.model('FileMetadata', FileMetadataSchema);
export default FileMetadata;