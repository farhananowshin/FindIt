"use client";

import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  User,
  Hash,
  Phone,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Zap,
  MapPin,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "register">(defaultTab);

  React.useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, defaultTab]);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phone, setPhone] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const handleTabChange = (newTab: "login" | "register") => {
    resetForm();
    setTab(newTab);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      setSuccessMsg("Logged in successfully!");
      setTimeout(() => {
        onClose();
        resetForm();
      }, 700);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in. Please verify your credentials.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        studentId,
        phone,
      });
      setSuccessMsg("Account registered successfully!");
      setTimeout(() => {
        onClose();
        resetForm();
      }, 700);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md transition-all animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-700/60 overflow-hidden grid grid-cols-1 md:grid-cols-12 text-left">
        {/* Left Column: Animated AI Security Showcase (5 Cols on md) */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 flex-col justify-between text-white relative overflow-hidden border-r border-slate-800">
          {/* Ambient Glows */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Branding */}
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sylhet AI Portal
            </div>
            <h4 className="text-xl font-black tracking-tight text-white mt-1">
              Find<span className="text-sky-400">It</span> Security
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sylhet Metropolitan Area Lost &amp; Found AI Infrastructure
            </p>
          </div>

          {/* Centerpiece: Animated AI Security Scanner & Neural Mesh */}
          <div className="relative z-10 py-6 text-center">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              {/* Pulsing radar rings */}
              <div className="absolute inset-0 rounded-full bg-sky-500/10 animate-ping duration-1000" />
              <div className="absolute -inset-2 rounded-full border border-sky-400/25 animate-spin duration-7000" />
              <div className="absolute -inset-4 rounded-full border border-indigo-500/15" />

              {/* Glowing Shield Center */}
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-[0_0_25px_rgba(99,102,241,0.6)]">
                <ShieldCheck className="w-9 h-9 text-white animate-pulse" />
              </div>
            </div>

            <p className="mt-3 text-xs font-bold text-slate-200">
              Multimodal Verification Gate
            </p>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              OpenCLIP • S-BERT • Spatiotemporal
            </span>
          </div>

          {/* Feature Badges */}
          <div className="relative z-10 space-y-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/70 border border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="text-slate-300 text-[11px]">Vision &amp; Semantic Embeddings</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/70 border border-slate-800">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-300 text-[11px]">Confidential Proof Verification</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/70 border border-slate-800">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-slate-300 text-[11px]">Transit Hubs &amp; Campus Coverage</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Form Panel (7 Cols on md) */}
        <div className="md:col-span-7 flex flex-col justify-between p-6 sm:p-7 relative bg-white">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {tab === "login" ? "Account Access" : "New Registration"}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {tab === "login" ? "Sign In to FindIt" : "Create FindIt Account"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sylhet Metropolitan Area Identity &amp; Verification
            </p>

            {/* Tab Switcher */}
            <div className="flex p-1 mt-4 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleTabChange("login")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  tab === "login"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("register")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  tab === "register"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Create Account (Citizen / Student)
              </button>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mt-3 flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-3 flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Forms */}
          {tab === "login" ? (
            <form onSubmit={handleLogin} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@gmail.com or admin@campus.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  "Sign In to FindIt"
                )}
              </button>

              {/* 1-Click Quick Demo Login Credentials for Defense & Testing */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  1-Click Demo Credentials (Defense &amp; Testing)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("admin@campus.edu");
                      setPassword("admin123");
                    }}
                    className="py-1.5 px-2 rounded-xl border border-amber-500/30 bg-amber-50/70 hover:bg-amber-100/90 text-[11px] font-extrabold text-amber-900 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Zap className="w-3 h-3 text-amber-600" />
                    ⚡ Fill Demo Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("student@campus.edu");
                      setPassword("student123");
                    }}
                    className="py-1.5 px-2 rounded-xl border border-indigo-500/30 bg-indigo-50/70 hover:bg-indigo-100/90 text-[11px] font-extrabold text-indigo-900 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <User className="w-3 h-3 text-indigo-600" />
                    🎓 Fill Demo Citizen
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student ID / NID (Optional)
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. 2026-CSE or NID"
                      className="w-full pl-9 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 01711-XXXXXX"
                      className="w-full pl-9 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. your.email@gmail.com"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Create Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-600 flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span>Registration creates a verified <strong>Citizen / Student</strong> account across Sylhet Metropolitan Hubs.</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  "Create FindIt Account"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
