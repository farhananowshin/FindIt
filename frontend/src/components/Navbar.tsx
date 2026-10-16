"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  FilePlus2,
  Sparkles,
  ShieldCheck,
  Menu,
  X,
  Search,
  LogIn,
  LogOut,
  User as UserIcon,
  ClipboardList,
  Shield,
  FileText,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

interface NavbarProps {
  onOpenWeights?: () => void;
  onOpenProposal?: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onOpenAuth?: (tab: "login" | "register") => void;
}

export default function Navbar({ onOpenWeights, onOpenProposal, onNavigateSection, onOpenAuth }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else if (typeof window !== "undefined") {
        window.location.href = `/#${id}`;
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Branding */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-violet-600 text-white shadow-md shadow-sky-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white">
                  Find<span className="text-sky-400">It</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Sylhet AI
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-slate-400 font-medium">
                Smart Lost &amp; Found Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => scrollTo("recent-items")}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition"
            >
              <Search className="w-4 h-4 text-slate-400" />
              Browse Items
            </button>
            <button
              onClick={onOpenWeights}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Matching
            </button>

            <button
              onClick={() => scrollTo("report-form")}
              className="flex items-center gap-1.5 ml-2 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/30 transition"
            >
              <FilePlus2 className="w-3.5 h-3.5 text-white" />
              + Report Item
            </button>

            {/* Student & Admin Protected Nav Links */}
            {user && (
              <Link
                href="/my-claims"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition"
              >
                <ClipboardList className="w-4 h-4 text-sky-400" />
                My Claims
              </Link>
            )}

            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg transition border border-amber-500/30"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                Admin Dashboard
              </Link>
            )}
          </nav>

          {/* Right Status Indicator & Auth Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                {/* Day 5 In-App Notification Bell */}
                <NotificationBell />

                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200">
                  <UserIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                      user.role === "admin"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth?.("login")}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth?.("register")}
                  className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/30 transition"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button & notification */}
          <div className="flex items-center gap-2 md:hidden">
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => scrollTo("report-form")}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md text-left"
          >
            <FilePlus2 className="w-4 h-4 text-indigo-500" />
            Report Lost / Found Item
          </button>
          <button
            onClick={() => scrollTo("recent-items")}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md text-left"
          >
            <Search className="w-4 h-4 text-slate-500" />
            Browse Campus Items
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenWeights) onOpenWeights();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md text-left"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            AI Match Logic & Weights
          </button>
          <button
            onClick={() => scrollTo("admin-preview")}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md text-left"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Admin Verification Portal
          </button>
          <div className="pt-2">
            <button
              onClick={() => scrollTo("report-form")}
              className="w-full flex items-center justify-center py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm"
            >
              Submit Report
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
