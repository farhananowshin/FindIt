"use client";

import React from "react";
import {
  Lock,
  Cpu,
  UserCheck,
} from "lucide-react";

export default function AdminPreview() {
  return (
    <section id="admin-preview" className="w-full max-w-6xl mx-auto mt-20 mb-12 px-4 sm:px-6">
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-4">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            Security & Governance Architecture
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Explainable AI with <span className="text-emerald-400">Strict Human Oversight</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                In academic environments, automated item release carries significant risk of fraudulent claims. In FindIt, our multimodal AI calculates similarity scores and produces granular explanations, but <strong>never unilaterally confirms ownership</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-1">
                    <Cpu className="w-4 h-4" />
                    Multimodal AI Agent
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Computes OpenCLIP visual vectors, Sentence Transformer text similarity, campus graph proximity, and time decay to rank candidate pairs.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                    <UserCheck className="w-4 h-4" />
                    Admin Hand-off Verifier
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Inspects secret verification questions, serial numbers, student IDs, and authorizes physical release from the campus security desk.
                  </p>
                </div>
              </div>
            </div>

            {/* Workflow preview diagram card */}
            <div className="lg:col-span-5 bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80">
              <span className="text-xs font-mono uppercase text-slate-400 block mb-3 font-semibold">
                Match Pipeline Protocol (Day 3 & 4)
              </span>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                    1
                  </span>
                  <div>
                    <span className="font-semibold text-slate-200">Multimodal Intake</span>
                    <p className="text-slate-400 text-[11px]">User reports lost/found item with photos & details (Built in Day 1).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                    2
                  </span>
                  <div>
                    <span className="font-semibold text-slate-200">5-Weight Fusion Scoring</span>
                    <p className="text-slate-400 text-[11px]">0.40(Img) + 0.25(Txt) + 0.15(Loc) + 0.10(Time) + 0.10(Attr).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                    3
                  </span>
                  <div>
                    <span className="font-semibold text-emerald-300">Admin Gatekeeper Verification</span>
                    <p className="text-slate-400 text-[11px]">Campus staff compares secret attributes and authenticates owner.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
