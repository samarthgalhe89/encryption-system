// src/pages/Login.jsx (or src/components/Login.jsx)

import { useState } from "react";
import { Mail, Lock, ArrowRight, Loader2, Building2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom"; // Ensure Link is imported
import axios from "axios"; // Ensure axios is imported

const API_BASE_URL = 'http://localhost:5000/api/auth/login'; // Your backend endpoint

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [focusedField, setFocusedField] = useState("");

  const navigate = useNavigate();
  const buttonDisabled = !(email && password);

  const handleLogin = async () => {
    if (buttonDisabled) return;

    setLoading(true);
    setMessage("");

    try {
      // --- REAL API CALL ---
      const res = await axios.post(API_BASE_URL, { email, password });
      
      const { token, hospital } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("hospital", JSON.stringify(hospital));

      setMessage("Login successful! Redirecting...");
      // --- END: REAL API CALL ---
      
      // Navigate to dashboard after short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      // Ensure err.response exists before accessing data
      const errorMsg = err.response?.data?.msg || "Login failed. Check server logs.";
      setMessage(errorMsg);
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !buttonDisabled && !loading) {
      handleLogin();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Main card */}
        <div className="bg-slate-800/90 backdrop-blur-2xl p-10 rounded-3xl shadow-2xl border border-slate-700/50 transform transition-all duration-300 hover:shadow-2xl">
          {/* Header with icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2">
              {loading ? "Authenticating..." : "Hospital Portal"}
            </h1>
            <p className="text-slate-400 text-sm">Secure access to your data management system</p>
          </div>

          {/* Status message */}
          {message && (
            <div className={`text-center text-sm mb-6 p-4 rounded-xl animate-slideDown ${
              message.includes("successful") 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" 
                : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
            }`}>
              {message}
            </div>
          )}

          {/* Form (RE-INSERTED) */}
          <div className="space-y-6">
            {/* Email field */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-200 ${
                  focusedField === "email" ? "text-purple-400 scale-110" : "text-slate-500"
                }`}>
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="hospital@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField("")}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:bg-slate-700/70"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Password
              </label>
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-200 ${
                  focusedField === "password" ? "text-purple-400 scale-110" : "text-slate-500"
                }`}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:bg-slate-700/70"
                />
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                <input type="checkbox" className="mr-2 rounded border-slate-600 bg-slate-700" />
                Remember me
              </label>
              <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={buttonDisabled || loading}
              className={`w-full mt-2 p-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 group ${
                buttonDisabled || loading
                  ? "bg-slate-700 cursor-not-allowed text-slate-500"
                  : "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-violet-600 hover:via-blue-600 hover:to-indigo-600 active:scale-95 text-white hover:shadow-lg hover:shadow-purple-500/20"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-6 h-6 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>


          {/* NEW: Add link to Signup above the final footer */}
          <div className="mt-6 text-center text-sm">
            <p className="text-slate-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors hover:underline">
                Register Your Hospital
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <p className="text-center text-sm text-slate-400">
              Need assistance?{" "}
              <a href="#" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>

        {/* Bottom security badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/50">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <p className="text-xs text-slate-400">
              256-bit encrypted connection
            </p>
          </div>
        </div>
      </div>

      {/* Styles */}
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