// src/pages/Dashboard.jsx - Minimal BnW SaaS Theme

import { useState, useEffect } from "react";
import { LogOut, Upload, FileText, Loader2, Trash2, Image, X, Shield, Clock, Eye, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";

// API Endpoints
const API_FILE_UPLOAD = 'http://localhost:5000/api/files/upload';
const API_FILE_LIST = 'http://localhost:5000/api/files';
const API_FILE_DELETE = 'http://localhost:5000/api/files';
const API_FILE_DOWNLOAD = 'http://localhost:5000/api/files';
const getToken = () => localStorage.getItem('token');

export default function Dashboard() {
    const navigate = useNavigate();
    const [hospital, setHospital] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("");
    const [recentFiles, setRecentFiles] = useState([]);
    const [deletingId, setDeletingId] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // 🔐 PIN Modal States
    const [showPinModal, setShowPinModal] = useState(false);
    const [viewingFileId, setViewingFileId] = useState(null);
    const [pin, setPin] = useState("");
    const [pinError, setPinError] = useState("");
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [successFileId, setSuccessFileId] = useState(null);

    // Allowed file types
    const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
        'application/pdf', 'text/plain',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.txt', '.doc', '.docx'];

    useEffect(() => {
        const token = getToken();
        const data = localStorage.getItem("hospital");

        if (!token || !data) {
            navigate("/", { replace: true });
            return;
        }

        try {
            setHospital(JSON.parse(data));
            fetchRecentFiles();
        } catch (e) {
            console.error("Could not parse hospital data:", e);
            navigate("/", { replace: true });
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/", { replace: true });
    };

    const fetchRecentFiles = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const res = await axios.get(API_FILE_LIST, {
                headers: { 'x-auth-token': token },
            });
            setRecentFiles(res.data);
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && validateFile(selectedFile)) {
            setFile(selectedFile);
            setUploadMessage("");
        }
    };

    const validateFile = (file) => {
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            setUploadMessage(`Invalid file type. Allowed: Images and Documents (PDF, TXT, DOC)`);
            return false;
        }
        return true;
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile && validateFile(droppedFile)) {
            setFile(droppedFile);
            setUploadMessage("");
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setUploadMessage("Uploading...");
        const token = getToken();

        if (!token) {
            setUploadMessage("Authentication token missing. Logging out...");
            setTimeout(handleLogout, 1000);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(API_FILE_UPLOAD, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-auth-token': token,
                },
            });

            setUploadMessage(`File uploaded successfully`);
            setFile(null);

            await fetchRecentFiles();

            const fileInput = document.getElementById("file-input");
            if (fileInput) fileInput.value = "";

        } catch (err) {
            console.error("Upload Error:", err);
            const errorMsg = err.response?.data?.msg || "Upload failed. Please try again.";
            setUploadMessage(errorMsg);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (fileId) => {
        const token = getToken();
        if (!token) {
            setUploadMessage("Authentication token missing. Logging out...");
            setTimeout(handleLogout, 1000);
            return;
        }

        setDeletingId(fileId);

        try {
            await axios.delete(`${API_FILE_DELETE}/${fileId}`, {
                headers: { 'x-auth-token': token },
            });

            setUploadMessage("File deleted successfully");
            await fetchRecentFiles();
        } catch (err) {
            console.error("Delete Error:", err);
            const errorMsg = err.response?.data?.msg || "Delete failed. Please try again.";
            setUploadMessage(errorMsg);
        } finally {
            setDeletingId(null);
        }
    };

    const clearFile = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setFile(null);
        setUploadMessage("");
        const fileInput = document.getElementById("file-input");
        if (fileInput) fileInput.value = "";
    };

    // 🔐 Handle file view with PIN modal
    const handleViewFile = (fileId) => {
        setViewingFileId(fileId);
        setShowPinModal(true);
        setPin("");
        setPinError("");
    };

    // 🔐 Handle PIN submission
    const handlePinSubmit = async (e) => {
        e.preventDefault();
        if (!pin) {
            setPinError("Please enter PIN");
            return;
        }

        setIsDecrypting(true);
        setPinError("");
        const token = getToken();

        try {
            const res = await axios.post(
                `${API_FILE_DOWNLOAD}/${viewingFileId}/download`,
                { pin },
                {
                    headers: { 'x-auth-token': token },
                    responseType: 'blob'
                }
            );

            // Get the file metadata to find the filename
            const fileMetadata = recentFiles.find(f => f._id === viewingFileId);
            const mimeType = fileMetadata?.mimeType || 'application/octet-stream';
            const filename = fileMetadata?.originalName || 'download';

            // Create blob URL and trigger download or view
            const blob = new Blob([res.data], { type: mimeType });
            const url = window.URL.createObjectURL(blob);

            if (mimeType.startsWith('image/')) {
                // Open image in new tab
                window.open(url, '_blank');
            } else {
                // Download file
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            window.URL.revokeObjectURL(url);

            // Close modal and show success in file card
            setShowPinModal(false);
            setPin("");
            setSuccessFileId(viewingFileId);

            // Clear success indicator after 3 seconds
            setTimeout(() => {
                setSuccessFileId(null);
            }, 3000);
        } catch (err) {
            console.error("Download Error:", err);
            const errorMsg = err.response?.data?.msg || "Invalid PIN or decryption failed";
            setPinError(errorMsg);
        } finally {
            setIsDecrypting(false);
        }
    };

    // Loading State
    if (isLoading || !hospital) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mx-auto mb-4" />
                    <p className="text-neutral-500 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Background grid */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

            {/* Header */}
            <header className="relative z-10 border-b border-neutral-800">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-light tracking-widest text-white">
                                Hospital<span className="font-bold">Portal</span>
                            </h1>
                            <p className="text-neutral-500 text-xs mt-1">{hospital?.name}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600 rounded-lg transition-all text-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
                {/* Upload Section */}
                <section className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <Upload className="w-4 h-4 text-neutral-500" />
                        <h2 className="text-sm text-neutral-400 tracking-wide uppercase">Upload Files</h2>
                    </div>

                    {/* Status message */}
                    {uploadMessage && (
                        <div className={`mb-6 p-3 rounded-lg border text-sm ${uploadMessage.includes("success")
                            ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/5 text-red-400 border-red-500/20"
                            }`}>
                            {uploadMessage}
                        </div>
                    )}

                    {/* Upload Area */}
                    <div className="border border-neutral-800 rounded-lg p-6 bg-neutral-950/50">
                        {/* Allowed types */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <span className="text-xs text-neutral-500">Accepted:</span>
                            {['JPG', 'PNG', 'PDF', 'TXT', 'DOC', 'DOCX'].map((type) => (
                                <span key={type} className="px-2 py-0.5 text-xs text-neutral-400 bg-neutral-800/50 rounded">
                                    .{type.toLowerCase()}
                                </span>
                            ))}
                        </div>

                        {/* Drop zone */}
                        <div>
                            <input
                                type="file"
                                id="file-input"
                                onChange={handleFileChange}
                                accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.doc,.docx"
                                className="hidden"
                            />
                            <label
                                htmlFor="file-input"
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`flex flex-col items-center justify-center w-full py-12 border border-dashed rounded-lg cursor-pointer transition-all duration-200 ${isDragging
                                    ? 'border-white bg-white/5'
                                    : 'border-neutral-700 hover:border-neutral-500'
                                    }`}
                            >
                                {file ? (
                                    <div className="flex items-center justify-between w-full px-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${file.type.startsWith('image/')
                                                ? 'bg-neutral-800'
                                                : 'bg-neutral-800'
                                                }`}>
                                                {file.type.startsWith('image/') ? (
                                                    <Image className="w-5 h-5 text-neutral-400" />
                                                ) : (
                                                    <FileText className="w-5 h-5 text-neutral-400" />
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm text-white">{file.name}</p>
                                                <p className="text-xs text-neutral-500">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={clearFile}
                                            className="p-2 text-neutral-500 hover:text-white transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-neutral-600 mb-3" />
                                        <p className="text-sm text-neutral-400 mb-1">
                                            Drop file here or click to browse
                                        </p>
                                        <p className="text-xs text-neutral-600">
                                            Images and documents supported
                                        </p>
                                    </>
                                )}
                            </label>
                        </div>

                        {/* Upload button */}
                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className={`w-full mt-4 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${!file || uploading
                                ? "bg-neutral-800 cursor-not-allowed text-neutral-500"
                                : "bg-white hover:bg-neutral-200 text-black"
                                }`}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    <span>Upload File</span>
                                </>
                            )}
                        </button>
                    </div>
                </section>

                {/* Files Section */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Clock className="w-4 h-4 text-neutral-500" />
                        <h2 className="text-sm text-neutral-400 tracking-wide uppercase">Recent Files</h2>
                        <span className="text-xs text-neutral-600">({recentFiles.length})</span>
                    </div>

                    {recentFiles.length === 0 ? (
                        <div className="border border-neutral-800 rounded-lg p-12 text-center bg-neutral-950/50">
                            <FileText className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
                            <p className="text-neutral-500 text-sm">No files uploaded yet</p>
                            <p className="text-neutral-600 text-xs mt-1">Upload your first file to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentFiles.map((file) => (
                                <div
                                    key={file._id}
                                    className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg bg-neutral-950/50 hover:border-neutral-700 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                                            {file.mimeType?.startsWith('image/') ? (
                                                <Image className="w-4 h-4 text-neutral-400" />
                                            ) : (
                                                <FileText className="w-4 h-4 text-neutral-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm text-white">{file.originalName}</p>
                                            {successFileId === file._id && (
                                                <p className="text-xs text-emerald-400 mt-1">✅ Decrypted successfully</p>
                                            )}
                                            <p className="text-xs text-neutral-500">
                                                {moment(file.uploadDate).fromNow()} • {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleViewFile(file._id)}
                                            className="p-2 text-neutral-500 hover:text-white transition-colors"
                                            title="View file (requires PIN)"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(file._id)}
                                            disabled={deletingId === file._id}
                                            className="p-2 text-neutral-500 hover:text-red-400 transition-colors disabled:opacity-50"
                                        >
                                            {deletingId === file._id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* 🔐 PIN Modal */}
            {showPinModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                                <Lock className="w-5 h-5 text-neutral-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-medium">Enter Decryption PIN</h3>
                                <p className="text-neutral-500 text-xs mt-0.5">
                                    PIN is required to decrypt patient data
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handlePinSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="password"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    placeholder="Enter PIN"
                                    autoFocus
                                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                                />
                                {pinError && (
                                    <p className="text-red-400 text-xs mt-2">{pinError}</p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPinModal(false);
                                        setPin("");
                                        setPinError("");
                                    }}
                                    disabled={isDecrypting}
                                    className="flex-1 px-4 py-3 border border-neutral-700 hover:border-neutral-600 text-neutral-400 hover:text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isDecrypting || !pin}
                                    className="flex-1 px-4 py-3 bg-white hover:bg-neutral-200 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isDecrypting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Decrypting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-4 h-4" />
                                            <span>Decrypt & View</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="relative z-10 border-t border-neutral-800 mt-12">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-neutral-600 text-xs">
                            <Shield className="w-3 h-3" />
                            <span>Protected Workspace</span>
                        </div>
                        <p className="text-neutral-600 text-xs">
                            © 2026 HospitalPortal
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}