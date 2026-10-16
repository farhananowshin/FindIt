"use client";

import React from "react";
import { Compass, Shield, Heart, ExternalLink, Sparkles, MapPin } from "lucide-react";

interface FooterProps {
  onOpenProposal?: () => void;
}

export default function Footer({ onOpenProposal }: FooterProps) {
  return (
    <footer className="w-full border-t border-slate-200 bg-white pt-14 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1 & 2: Branding & Mission (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-100">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Find<span className="text-indigo-600">It</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Sylhet AI
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Reuniting Sylhet with what matters most. A centralized, multimodal AI-driven lost and found 
              matching platform connecting citizens and university campuses across Sylhet, Bangladesh.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>All 11 Sylhet Metropolitan Hubs Active</span>
            </div>
          </div>

          {/* Col 3: Platform Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Platform
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <a href="#recent-items" className="hover:text-indigo-600 transition">
                  Browse Active Items
                </a>
              </li>
              <li>
                <a href="#report-form" className="hover:text-indigo-600 transition">
                  Report a Lost Item
                </a>
              </li>
              <li>
                <a href="#report-form" className="hover:text-indigo-600 transition">
                  Report a Found Item
                </a>
              </li>
              <li>
                <a href="#recent-items" className="hover:text-indigo-600 transition">
                  Interactive Sylhet Map
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Multimodal AI & Tech */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              AI Technology
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <span className="hover:text-indigo-600 transition cursor-default">
                  OpenCLIP Vision Embeddings
                </span>
              </li>
              <li>
                <span className="hover:text-indigo-600 transition cursor-default">
                  S-BERT Semantic Text Vectors
                </span>
              </li>
              <li>
                <span className="hover:text-indigo-600 transition cursor-default">
                  Spatiotemporal Proximity Scoring
                </span>
              </li>
              <li>
                <span className="hover:text-indigo-600 transition cursor-default">
                  Human-in-the-Loop Ownership Verification
                </span>
              </li>
            </ul>
          </div>

          {/* Col 5: Academic & Credits */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Academic Project
            </h3>
            <p className="text-xs text-slate-600">
              Department of Computer Science &amp; Engineering
            </p>
            <p className="text-[11px] text-slate-400">
              Metropolitan University, Sylhet
            </p>

            {onOpenProposal && (
              <button
                onClick={onOpenProposal}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Project Specs &amp; Credits
              </button>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="flex items-center gap-1">
            &copy; 2026 FindIt Platform &bull; Built with
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline mx-0.5" />
            in Sylhet, Bangladesh.
          </p>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Privacy Policy</span>
            <span>&bull;</span>
            <span>Terms of Service</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Verified Ownership Protection
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
