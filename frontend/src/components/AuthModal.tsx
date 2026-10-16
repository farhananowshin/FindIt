"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Zap,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
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

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phone, setPhone] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Canvas ref for dynamic neural constellation background
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, defaultTab]);

  // Dynamic interactive neural constellation canvas animation
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.offsetWidth || 400);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 600);

    const resize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener("resize", resize);

    // Neural nodes representing multimodal embedding tokens
    const nodeCount = 26;
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: Math.random() * 2 + 1.2,
      isCyan: Math.random() > 0.45,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connecting neural synapses
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            const alpha = 0.25 * (1 - dist / 90);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      // Draw pulsating nodes
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.isCyan ? "rgba(56, 189, 248, 0.85)" : "rgba(165, 180, 252, 0.85)";
        ctx.shadowBlur = 8;
        ctx.shadowColor = node.isCyan ? "#38bdf8" : "#818cf8";
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, tab]);

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

  const isLoginTab = tab === "login";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md transition-all animate-fadeIn">
      {/* Outer Modal Container */}
      <div className="relative w-full max-w-4xl min-h-[620px] bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col md:flex-row text-left">
        
        {/* Global Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-full transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ======================================================== */}
        {/* LEFT FORM PANE: Sign In Form (Visible when overlay is on right) */}
        {/* ======================================================== */}
        <div
          className={`w-full md:w-1/2 px-7 py-6 sm:px-9 sm:py-8 flex flex-col justify-between bg-slate-900 text-white transition-all duration-500 ${
            !isLoginTab ? "md:opacity-0 md:pointer-events-none md:invisible" : "opacity-100 visible"
          } ${isLoginTab ? "block" : "hidden md:flex"}`}
        >
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Citizen &amp; Student Access
              </span>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight mt-1">
              Sign In to Find<span className="text-sky-400">It</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Enter your credentials to manage reported items and review verified matches.
            </p>

            {/* Mobile Tab Toggle */}
            <div className="flex md:hidden p-1 mt-4 bg-slate-800 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => handleTabChange("login")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  tab === "login" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("register")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  tab === "register" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Alerts */}
            {error && isLoginTab && (
              <div className="mt-3 flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && isLoginTab && (
              <div className="mt-3 flex items-center gap-2.5 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleLogin} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@gmail.com or admin@campus.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition"
                  >
                    {showLoginPassword ? (
                      <>
                        <EyeOff className="w-3 h-3" /> Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" /> Show
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 via-indigo-600 to-violet-600 hover:from-sky-400 hover:to-indigo-500 active:scale-98 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to FindIt</span>
                    <ArrowRight className="w-4 h-4 text-sky-200" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick 1-Click Demo Credentials */}
          <div className="pt-4 border-t border-slate-800/80 mt-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              ⚡ 1-Click Demo Credentials (Defense &amp; Testing)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@campus.edu");
                  setPassword("admin123");
                }}
                className="py-1.5 px-2 rounded-xl border border-amber-500/30 bg-amber-950/40 hover:bg-amber-900/50 text-[11px] font-extrabold text-amber-300 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                Fill Demo Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("student@campus.edu");
                  setPassword("student123");
                }}
                className="py-1.5 px-2 rounded-xl border border-indigo-500/30 bg-indigo-950/40 hover:bg-indigo-900/50 text-[11px] font-extrabold text-indigo-300 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <User className="w-3 h-3 text-indigo-400" />
                Fill Demo Citizen
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT FORM PANE: Create Account Form (Visible when overlay is on left) */}
        {/* ======================================================== */}
        <div
          className={`w-full md:w-1/2 px-7 py-6 sm:px-9 sm:py-8 flex flex-col justify-between bg-slate-900 text-white transition-all duration-500 ${
            isLoginTab ? "md:opacity-0 md:pointer-events-none md:invisible" : "opacity-100 visible"
          } ${!isLoginTab ? "block" : "hidden md:flex"}`}
        >
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                New Registration
              </span>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight mt-1">
              Create Find<span className="text-sky-400">It</span> Account
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Join Sylhet&apos;s verified network for lost and found recovery.
            </p>

            {/* Mobile Tab Toggle */}
            <div className="flex md:hidden p-1 mt-4 bg-slate-800 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => handleTabChange("login")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  tab === "login" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("register")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  tab === "register" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Alerts */}
            {error && !isLoginTab && (
              <div className="mt-3 flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && !isLoginTab && (
              <div className="mt-3 flex items-center gap-2.5 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleRegister} className="mt-3 space-y-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Student ID / NID
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="2026-CSE / NID"
                      className="w-full pl-8 pr-2 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01711-XXXXXX"
                      className="w-full pl-8 pr-2 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Create Password (min 6 chars)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition"
                  >
                    {showRegisterPassword ? (
                      <>
                        <EyeOff className="w-3 h-3" /> Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" /> Show
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400 flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Verified <strong>Citizen / Student</strong> account across Sylhet Metropolitan Hubs.</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-98 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.35)] transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
          </div>
        </div>

        {/* ======================================================== */}
        {/* SLIDING OVERLAY PANEL (DESKTOP): Glides smoothly left/right */}
        {/* ======================================================== */}
        <div
          className={`hidden md:flex absolute top-0 bottom-0 left-0 w-1/2 z-20 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isLoginTab ? "translate-x-full" : "translate-x-0"
          }`}
        >
          <div
            className={`w-full h-full p-8 flex flex-col justify-between text-white relative overflow-hidden border-x border-slate-700/80 shadow-2xl transition-colors duration-700 bg-slate-950 ${
              isLoginTab
                ? "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950"
                : "bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950"
            }`}
          >
            {/* Live Interactive Neural Constellation Canvas Animation */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none opacity-60 z-0"
            />

            {/* Futuristic Perspective Grid Floor */}
            <div className="absolute inset-x-0 bottom-0 h-44 bg-[radial-gradient(ellipse_at_bottom,rgba(56,189,248,0.15),transparent_70%)] pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none z-0" />

            {/* Ambient Nebula Glows */}
            <div
              className={`absolute -top-16 -left-16 w-60 h-60 rounded-full blur-3xl pointer-events-none transition-colors duration-700 ${
                isLoginTab ? "bg-sky-500/25" : "bg-emerald-500/25"
              }`}
            />
            <div
              className={`absolute -bottom-16 -right-16 w-60 h-60 rounded-full blur-3xl pointer-events-none transition-colors duration-700 ${
                isLoginTab ? "bg-purple-500/25" : "bg-cyan-500/25"
              }`}
            />

            {/* Top Status Bar */}
            <div className="relative z-10 flex items-center justify-between">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border transition-colors ${
                  isLoginTab
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-400/40"
                    : "bg-teal-500/20 text-teal-300 border-teal-400/40"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full animate-ping ${
                    isLoginTab ? "bg-cyan-400" : "bg-emerald-400"
                  }`}
                />
                Sylhet Metropolitan Network
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Portal</span>
              </div>
            </div>

            {/* Animated Cyber Hologram Scanner with Multimodal Reticle */}
            <div className="relative z-10 my-auto text-center py-2">
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                {/* Rotating Tech HUD Circle with Compass Reticle */}
                <svg
                  className="absolute inset-0 w-full h-full animate-spin [animation-duration:22s] text-sky-400/30"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="4 6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.8"
                    strokeDasharray="12 12"
                  />
                </svg>

                {/* Pulsing Core Ripple */}
                <div
                  className={`absolute inset-2 rounded-full animate-ping [animation-duration:3s] opacity-20 ${
                    isLoginTab ? "bg-sky-500" : "bg-emerald-500"
                  }`}
                />

                {/* Central Cyber Glowing Shield with Scanning Laser Beam */}
                <div
                  className={`relative w-22 h-22 rounded-3xl flex items-center justify-center text-white shadow-2xl transition-all duration-700 animate-neon-breath overflow-hidden ${
                    isLoginTab
                      ? "bg-gradient-to-tr from-sky-500 via-indigo-600 to-violet-600 shadow-[0_0_35px_rgba(99,102,241,0.7)]"
                      : "bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-600 shadow-[0_0_35px_rgba(16,185,129,0.7)]"
                  }`}
                >
                  <ShieldCheck className="w-11 h-11 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  {/* Moving Cyber Laser Scanline */}
                  <div
                    className={`absolute left-0 right-0 h-1 shadow-[0_0_12px_#38bdf8] animate-cyber-scan ${
                      isLoginTab ? "bg-cyan-300" : "bg-emerald-300"
                    }`}
                  />
                </div>
              </div>

              {/* Dynamic Soundwave Signal Bars */}
              <div className="flex items-center justify-center gap-1.5 mt-3 mb-1">
                {[0.6, 1.0, 0.4, 0.8, 0.5, 0.9, 0.3].map((heightRatio, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-colors ${
                      isLoginTab ? "bg-cyan-400" : "bg-emerald-400"
                    }`}
                    style={{
                      height: `${Math.round(heightRatio * 16)}px`,
                      animation: `cyberWave ${1 + (i % 3) * 0.4}s ease-in-out infinite alternate`,
                    }}
                  />
                ))}
              </div>

              {/* Dynamic Overlay Text depending on Tab */}
              <div className="mt-3 space-y-1.5 px-2">
                {isLoginTab ? (
                  <>
                    <h4 className="text-xl font-black text-white tracking-tight">
                      New to Find<span className="text-sky-400">It</span> Sylhet?
                    </h4>
                    <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                      Create an account to report lost belongings, turn in found items, and get instantly matched across Sylhet metropolitan hubs.
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="text-xl font-black text-white tracking-tight">
                      Already Have an Account?
                    </h4>
                    <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                      Welcome back! Sign in to check the status of your reported items, review match alerts, and securely verify your ownership.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Sliding Overlay Action Button */}
            <div className="relative z-10 pt-2 space-y-2">
              {isLoginTab ? (
                <button
                  type="button"
                  onClick={() => handleTabChange("register")}
                  className="w-full py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-extrabold text-xs backdrop-blur-md transition-all flex items-center justify-center gap-2 shadow-lg group cursor-pointer active:scale-98"
                >
                  <span>Create an Account</span>
                  <ArrowRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleTabChange("login")}
                  className="w-full py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-extrabold text-xs backdrop-blur-md transition-all flex items-center justify-center gap-2 shadow-lg group cursor-pointer active:scale-98"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-1 transition" />
                  <span>Sign In to Your Account</span>
                </button>
              )}

              {/* Trust Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-2 border-t border-slate-800/80 font-medium">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-sky-400" /> Private &amp; Secure
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" /> Sylhet Metropolitan Area
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
