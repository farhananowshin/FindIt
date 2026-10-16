"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  FilePlus2,
  Sparkles,
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo / Branding */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-violet-600 text-white shadow-lg shadow-sky-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Find<span className="text-sky-400">It</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <button
              onClick={() => scrollTo("recent-items")}
              className="hover:text-white transition"
            >
              How it works
            </button>
            <button
              onClick={onOpenWeights}
              className="hover:text-white transition flex items-center gap-1.5"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo("recent-items")}
              className="hover:text-white transition"
            >
              Recent reports
            </button>
            <button
              onClick={onOpenProposal}
              className="hover:text-white transition text-xs text-slate-400"
              title="Project Specs"
            >
              Project Specs
            </button>

            {user && (
              <Link
                href="/my-claims"
                className="hover:text-white transition text-xs text-sky-400"
              >
                My Claims
              </Link>
            )}

            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right Auth Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200">
                  <UserIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenAuth?.("login")}
                  className="text-sm font-semibold text-slate-300 hover:text-white transition px-2 py-1"
                >
                  Log in
                </button>
                <button
                  onClick={() => onOpenAuth?.("register")}
                  className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition shadow-lg shadow-indigo-600/30"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
