// src/pages/Dashboard.jsx (or src/components/Dashboard.jsx)

import { useState, useEffect } from "react";
import { Building2, LogOut, Upload, FileText, Clock, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios"; 
import moment from "moment"; 

// API Endpoints - CORRECTED TO PORT 8000
const API_FILE_UPLOAD = 'http://localhost:5000/api/files/upload';
const API_FILE_LIST = 'http://localhost:5000/api/files';
const getToken = () => localStorage.getItem('token');

export default function Dashboard() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [recentFiles, setRecentFiles] = useState([]); 

  // --- Data Fetching and Auth Check ---
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
    if (selectedFile) {
      setFile(selectedFile);
      setUploadMessage("");
    }
  };

  // --- Real Upload Logic ---
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

      setUploadMessage(`File uploaded successfully: ${res.data.filename}`);
      setFile(null);
      
      await fetchRecentFiles(); 
      
      const fileInput = document.getElementById("file-input");
      if (fileInput) fileInput.value = "";

    } catch (err) {
      console.error("Upload Error:", err);
      const errorMsg = err.response?.data?.msg || "Upload failed. Check console for details.";
      setUploadMessage(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  // --- Loading State UI ---
  if (isLoading || !hospital) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  // --- Main Dashboard UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background decoration (unchanged) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header (unchanged) */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                  Hospital Data Portal
                </h1>
                <p className="text-slate-400 text-sm md:text-base mt-1">
                  Welcome back, <span className="font-semibold text-purple-400">{hospital?.name}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all duration-300 active:scale-95 "
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* File Upload Section (RESTORED) */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Upload Files</h2>
          </div>

          {/* Upload message */}
          {uploadMessage && (
            <div className={`mb-6 p-4 rounded-xl animate-slideDown flex items-center gap-3 ${
              uploadMessage.includes("success")
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
            }`}>
              {uploadMessage.includes("success") ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{uploadMessage}</span>
            </div>
          )}

          {/* Upload area */}
          <div className="space-y-4">
            <div className="relative">
              <input
                type="file"
                id="file-input"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-input"
                className="flex flex-col items-center justify-center w-full p-10 border-2 border-dashed border-slate-600 rounded-2xl cursor-pointer hover:border-purple-500 hover:bg-slate-700/30 transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-all duration-300">
                  <FileText className="w-8 h-8 text-slate-400 group-hover:text-purple-400 transition-colors duration-300" />
                </div>
                <p className="text-lg font-semibold text-white mb-2">
                  {file ? file.name : "Click to select a file"}
                </p>
                <p className="text-sm text-slate-400">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "or drag and drop your file here"}
                </p>
              </label>
            </div>

            {/* Upload button */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`w-full p-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                !file || uploading
                  ? "bg-slate-700 cursor-not-allowed text-slate-500"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white shadow-xl shadow-emerald-500/40 hover:shadow-emerald-500/60"
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6" />
                  <span>Upload File</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Uploaded Files Section */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Recent Uploads</h2>
          </div>

          {/* Conditional Rendering for File List or Empty State */}
          {recentFiles.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No files uploaded yet</h3>
              <p className="text-slate-500">
                Upload your first file to see it appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {recentFiles.map((file) => (
                <div key={file._id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600 hover:bg-slate-700/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{file.originalName}</p>
                      <p className="text-sm text-slate-400">
                        Uploaded {moment(file.uploadDate).fromNow()} • {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Styles (RESTORED) */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}