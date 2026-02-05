# Secure Hospital File Management Portal

A secure, minimalist web application developed for healthcare providers to safely manage, upload, and share sensitive patient documents. This project prioritizes data privacy with PIN-protected file access and a clean, professional user interface.

## 🚀 Features

- **🔒 PIN-Protected Access**: Enhanced security layer requiring a unique PIN to decrypt and view or download files.
- **📂 Secure File Management**: robust upload and deletion capabilities for images (JPG, PNG, WebP) and documents (PDF, DOCX, TXT).
- **🛡️ Authenticated Workspace**: Secure login and session management for hospital staff.
- **🎨 Modern Aesthetic**: A high-end, black-and-white minimalist "SaaS" design with responsive layouts and smooth interactions.
- **⚡ Real-time Updates**: Instant feedback on uploads and file status.

## 🛠️ Tech Stack

### Frontend
- **React**: Component-based UI architecture.
- **Tailwind CSS**: Utility-first styling for a custom, responsive design.
- **Lucide React**: Clean, consistent iconography.
- **Axios**: Efficient HTTP client for API interactions.

### Backend
- **Node.js & Express**: Scalable server-side runtime and framework.
- **MongoDB & Mongoose**: Flexible NoSQL database schema for storing file metadata and user profiles.
- **Multer**: Middleware for handling `multipart/form-data` and file uploads.
- **JSON Web Token (JWT)**: Stateless authentication mechanism.
- **Bcrypt**: Password hashing for security.
