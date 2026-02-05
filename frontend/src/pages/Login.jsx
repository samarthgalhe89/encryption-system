// src/pages/Login.jsx - Minimal BnW SaaS Theme

import { useState } from "react";
import { Eye, EyeOff, ArrowRight, Loader2, Shield } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api/auth/login';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const buttonDisabled = !(email && password);

  const handleLogin = async () => {
    if (buttonDisabled) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(API_BASE_URL, { email, password });
      const { token, hospital } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("hospital", JSON.stringify(hospital));

      setMessage("Login successful! Redirecting...");
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Login failed. Please try again.";
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
    <div className="min-h-screen bg-black flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative">
        {/* Background subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        {/* Logo and Title */}
        <div className="relative z-10">
          <h1 className="text-4xl font-light tracking-widest text-white mb-2">
            Hospital<span className="font-bold">Portal</span>
          </h1>
          <p className="text-neutral-500 text-sm tracking-wide">
            Secure Data Management System
          </p>
        </div>

        {/* Bottom badge */}
        <div className="relative z-10 flex items-center gap-2 text-neutral-600 text-sm">
          <Shield className="w-4 h-4" />
          <span>Protected Workspace</span>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Form Container */}
          <div className="border border-neutral-800 rounded-lg p-8 lg:p-10 bg-neutral-950/50">
            {/* Header */}
            <div className="mb-8">
              <p className="text-xs text-neutral-500 tracking-widest mb-2">SIGN <span className="text-white">IN</span></p>
              <h2 className="text-2xl font-semibold text-white mb-1">Welcome back</h2>
              <p className="text-neutral-500 text-sm">Authenticate to continue</p>
            </div>

            {/* Status message */}
            {message && (
              <div className={`text-sm mb-6 p-3 rounded-lg border ${
                message.includes("successful") 
                  ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20" 
                  : "bg-red-500/5 text-red-400 border-red-500/20"
              }`}>
                {message}
              </div>
            )}

            {/* Form */}
            <div className="space-y-5">
              {/* Email field */}
              <div>
                <label className="block text-xs text-neutral-400 mb-2 tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="hospital@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors text-sm"
                />
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs text-neutral-400 mb-2 tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors text-sm pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login button */}
              <button
                onClick={handleLogin}
                disabled={buttonDisabled || loading}
                className={`w-full mt-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  buttonDisabled || loading
                    ? "bg-neutral-800 cursor-not-allowed text-neutral-500"
                    : "bg-neutral-700 hover:bg-neutral-600 text-white"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Signup link */}
            <div className="mt-8 pt-6 border-t border-neutral-800">
              <p className="text-sm text-neutral-500 text-center">
                Don't have an account?{" "}
                <Link to="/signup" className="text-white hover:text-neutral-300 transition-colors">
                  Register Hospital
                </Link>
              </p>
            </div>
          </div>

          {/* Mobile branding */}
          <div className="lg:hidden mt-8 text-center">
            <p className="text-neutral-600 text-xs flex items-center justify-center gap-2">
              <Shield className="w-3 h-3" />
              Protected Workspace
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}