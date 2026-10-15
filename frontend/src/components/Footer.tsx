import React from "react";
import { Compass, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900">
                Find<span className="text-indigo-600">It</span>
              </span>
              <p className="text-xs text-slate-500">
                Explainable Multimodal Lost & Found Matching System
              </p>
            </div>
          </div>

          {/* Tech stack badge list */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span className="px-2.5 py-1 bg-slate-100 rounded-md font-medium text-slate-700">Next.js 16</span>
            <span className="px-2.5 py-1 bg-slate-100 rounded-md font-medium text-slate-700">TypeScript</span>
            <span className="px-2.5 py-1 bg-slate-100 rounded-md font-medium text-slate-700">Tailwind CSS</span>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md font-medium">OpenCLIP</span>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md font-medium">Sentence Transformers</span>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md font-medium">FastAPI & Express</span>
          </div>

          <div className="text-center md:text-right text-xs text-slate-500 space-y-1">
            <p>University Capstone Project &copy; 2026</p>
            <p className="flex items-center justify-center md:justify-end gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Human-in-the-Loop Ownership Verification
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
