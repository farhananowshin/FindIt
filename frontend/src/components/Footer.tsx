import React from "react";
import { Compass, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold text-slate-900">
                  Find<span className="text-indigo-600">It</span>
                </span>
                <span className="text-xs italic font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  &ldquo;Lost it? FindIt.&rdquo;
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                An Explainable Multimodal Web-Based Lost and Found Matching and Verification System
              </p>
            </div>
          </div>

          {/* Tech stack badge list from Section 8 */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
            <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-medium text-slate-700">Next.js</span>
            <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-medium text-slate-700">Node.js &amp; Express</span>
            <span className="px-2.5 py-1 bg-slate-100 rounded-lg font-medium text-slate-700">MongoDB</span>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-semibold border border-indigo-200">Python FastAPI</span>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-semibold border border-indigo-200">OpenCLIP &amp; S-BERT</span>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-semibold border border-emerald-200">Leaflet Maps</span>
          </div>
        </div>

        {/* Academic Project Credits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          {/* Institutional Info */}
          <div className="space-y-1">
            <p className="font-bold text-slate-900 text-sm">Metropolitan University, Bangladesh</p>
            <p>Department of Computer Science &amp; Engineering</p>
            <p className="text-indigo-600 font-semibold">Course: Project (CSE 300)</p>
            <p className="text-slate-400">Date of Submission: 03.10.26</p>
          </div>

          {/* Supervisor */}
          <div className="space-y-1">
            <p className="font-bold text-slate-900 text-sm uppercase tracking-wider text-[11px] text-slate-400">
              Submitted To
            </p>
            <p className="font-bold text-slate-800 text-xs">Md Shamihul Islam Khan Limon</p>
            <p className="text-slate-500">Assistant Professor</p>
            <p className="text-slate-500">Department of Computer Science &amp; Engineering</p>
          </div>

          {/* Submitted By */}
          <div className="space-y-1">
            <p className="font-bold text-slate-900 text-sm uppercase tracking-wider text-[11px] text-slate-400">
              Submitted By (Batch: 59th-I)
            </p>
            <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
              <span className="font-semibold text-slate-800">Farhana Nowshin</span>
              <span className="font-mono text-slate-500">ID: 232-115-322</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span className="font-semibold text-slate-800">Adrita Chakraborty</span>
              <span className="font-mono text-slate-500">ID: 232-115-324</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          <p>&copy; 2026 FindIt Project Team. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-500">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Human-in-the-Loop Ownership Verification (Section 6.7)
          </p>
        </div>
      </div>
    </footer>
  );
}
