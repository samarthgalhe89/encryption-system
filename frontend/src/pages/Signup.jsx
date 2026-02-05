// src/pages/Signup.jsx - Minimal BnW SaaS Theme

import { useState } from "react";
import { Eye, EyeOff, ArrowRight, Loader2, Shield } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api/auth/signup';

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();
    const buttonDisabled = !(name && email && password);

    const handleSignup = async () => {
        if (buttonDisabled) return;

        setLoading(true);
        setMessage("");

        try {
            const res = await axios.post(API_BASE_URL, { name, email, password });

            setMessage(res.data.msg + " Redirecting to login...");

            setTimeout(() => {
                navigate("/");
            }, 1500);

        } catch (err) {
            const errorMsg = err.response?.data?.msg || "Signup failed. Please try again.";
            setMessage(errorMsg);
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !buttonDisabled && !loading) {
            handleSignup();
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

                {/* Features list */}
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3 text-neutral-500">
                        <div className="w-1 h-1 bg-neutral-500 rounded-full"></div>
                        <span className="text-sm">Secure file storage</span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-500">
                        <div className="w-1 h-1 bg-neutral-500 rounded-full"></div>
                        <span className="text-sm">End-to-end encryption</span>
                    </div>
                </div>

                {/* Bottom badge */}
                <div className="relative z-10 flex items-center gap-2 text-neutral-600 text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Protected Workspace</span>
                </div>
            </div>

            {/* Right Panel - Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
                <div className="w-full max-w-md">
                    {/* Form Container */}
                    <div className="border border-neutral-800 rounded-lg p-8 lg:p-10 bg-neutral-950/50">
                        {/* Header */}
                        <div className="mb-8">
                            <p className="text-xs text-neutral-500 tracking-widest mb-2">SIGN <span className="text-white">UP</span></p>
                            <h2 className="text-2xl font-semibold text-white mb-1">Create account</h2>
                            <p className="text-neutral-500 text-sm">Register your hospital to get started</p>
                        </div>

                        {/* Status message */}
                        {message && (
                            <div className={`text-sm mb-6 p-3 rounded-lg border ${message.includes("successful") || message.includes("Redirecting")
                                    ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20"
                                    : "bg-red-500/5 text-red-400 border-red-500/20"
                                }`}>
                                {message}
                            </div>
                        )}

                        {/* Form */}
                        <div className="space-y-5">
                            {/* Hospital Name field */}
                            <div>
                                <label className="block text-xs text-neutral-400 mb-2 tracking-wide">
                                    Hospital Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="City General Hospital"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors text-sm"
                                />
                            </div>

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

                            {/* Signup button */}
                            <button
                                onClick={handleSignup}
                                disabled={buttonDisabled || loading}
                                className={`w-full mt-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${buttonDisabled || loading
                                        ? "bg-neutral-800 cursor-not-allowed text-neutral-500"
                                        : "bg-white hover:bg-neutral-200 text-black"
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Creating account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Login link */}
                        <div className="mt-8 pt-6 border-t border-neutral-800">
                            <p className="text-sm text-neutral-500 text-center">
                                Already have an account?{" "}
                                <Link to="/" className="text-white hover:text-neutral-300 transition-colors">
                                    Sign In
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