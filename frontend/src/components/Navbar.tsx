"use client";

import React, { useState } from "react";
import {
  Compass,
  FilePlus2,
  Sparkles,
  ShieldCheck,
  Menu,
  X,
  Search,
} from "lucide-react";

interface NavbarProps {
  onOpenWeights?: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export default function Navbar({ onOpenWeights, onNavigateSection }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Branding */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-200">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Find<span className="text-indigo-600">It</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Campus AI
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 font-medium">
                Explainable Multimodal Lost & Found
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => scrollTo("report-form")}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
            >
              <FilePlus2 className="w-4 h-4 text-indigo-500" />
              Report Item
            </button>
            <button
              onClick={() => scrollTo("recent-items")}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
            >
              <Search className="w-4 h-4 text-slate-500" />
              Browse Campus Items
            </button>
            <button
              onClick={onOpenWeights}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              AI Match Logic
            </button>
            <button
              onClick={() => scrollTo("admin-preview")}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Admin Portal
            </button>
          </nav>

          {/* Right Status Indicator & Action */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              CLIP + S-BERT Engine Ready
            </div>
            <button
              onClick={() => scrollTo("report-form")}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition"
            >
              Submit Report
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
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
