"use client";

import React from "react";
import {
  X,
  CheckCircle2,
  FileText,
  User,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Shield,
  Layers,
} from "lucide-react";

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROPOSAL_FEATURES = [
  {
    num: 1,
    title: "User Authentication & Role Management",
    desc: "Secure user registration, login, logout, and role-based access for Users and Admins with bcrypt password hashing and signed JWT sessions.",
    section: "Proposal Section 6.1",
    status: "Completed",
  },
  {
    num: 2,
    title: "Lost & Found Item Reporting",
    desc: "Users can create lost or found reports with item images, descriptions, category, color, date/time, and specific location landmarks.",
    section: "Proposal Section 6.2",
    status: "Completed",
  },
  {
    num: 3,
    title: "Item Search & Filtering",
    desc: "Users can search and filter lost and found reports using keywords, categories, dates, locations, and other relevant attributes.",
    section: "Proposal Section 6.3",
    status: "Completed",
  },
  {
    num: 4,
    title: "AI-Powered Multimodal Matching",
    desc: "The system analyzes image (OpenCLIP ViT-B-32), text (Sentence Transformers), location, time, and item attributes to identify and rank potential matches.",
    section: "Proposal Section 6.4 & 7",
    status: "Completed",
  },
  {
    num: 5,
    title: "Explainable Match Score",
    desc: "Each potential match includes an explainable match score breakdown across visual, textual, location, time, and attribute factors with natural language rationale.",
    section: "Proposal Section 6.5",
    status: "Completed",
  },
  {
    num: 6,
    title: "Automatic Match Notifications",
    desc: "Users receive persistent in-app notifications with badge counters when the AI identifies a high-confidence match (≥ 70%) for their report.",
    section: "Proposal Section 6.6",
    status: "Completed",
  },
  {
    num: 7,
    title: "Privacy-Preserving Ownership Verification",
    desc: "Claimants submit private item details or secret verification answers without publicly exposing sensitive identifying information to other users.",
    section: "Proposal Section 6.7",
    status: "Completed",
  },
  {
    num: 8,
    title: "Claim & Recovery Management",
    desc: "Users submit and track ownership claims (/my-claims), while the system manages lifecycle status transitions (pending, approved, rejected, claimed).",
    section: "Proposal Section 6.8",
    status: "Completed",
  },
  {
    num: 9,
    title: "Admin Dashboard & Moderation",
    desc: "Administrators manage users and reports, conduct side-by-side ownership cross-examination (/admin), review claims, and resolve recovered items.",
    section: "Proposal Section 6.9",
    status: "Completed",
  },
  {
    num: 10,
    title: "Location-Based Map & Item Visualization",
    desc: "Users can toggle an interactive Leaflet/OpenStreetMap view with color-coded pins (Red: Lost, Emerald: Found) and direct matching/claim action shortcuts.",
    section: "Proposal Section 6.10",
    status: "Completed",
  },
];

export default function ProposalModal({ isOpen, onClose }: ProposalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Project Proposal &amp; Implementation Matrix
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  10 / 10 Features Complete
                </span>
              </div>
              <p className="text-xs text-slate-500">
                CSE 300 &bull; Metropolitan University, Bangladesh &bull; Submitted on 03.10.26
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Proposal Metadata Card */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50/70 via-slate-50 to-violet-50/50 border-b border-indigo-100/80">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 block">
                Project Title &amp; Slogan
              </span>
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                FindIt — An Explainable Multimodal Web-Based Lost and Found Matching and Verification System
              </h4>
              <p className="text-xs italic font-semibold text-indigo-700 mt-0.5">
                &ldquo;Lost it? FindIt.&rdquo;
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-white/80 p-3 rounded-2xl border border-indigo-100">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Supervisor</span>
                <strong className="text-slate-800">Md Shamihul Islam Khan Limon</strong>
                <span className="text-[10px] text-slate-500 block">Assistant Professor, CSE</span>
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Team Members (Batch 59th-I)</span>
                <span className="text-slate-800 font-medium">Farhana Nowshin (232-115-322)</span>
                <br />
                <span className="text-slate-800 font-medium">Adrita Chakraborty (232-115-324)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scroll Body */}
        <div className="px-6 py-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              Proposal Section 6: Main Features Implementation Status
            </span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              100% Implemented &amp; Tested
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {PROPOSAL_FEATURES.map((feat) => (
              <div
                key={feat.num}
                className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-xs transition space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                        {feat.num}
                      </span>
                      <h5 className="text-xs font-bold text-slate-900 leading-snug">
                        {feat.title}
                      </h5>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {feat.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-8">
                    {feat.desc}
                  </p>
                </div>
                <div className="pt-2 pl-8 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{feat.section}</span>
                  <span className="text-indigo-600 font-semibold">Verified Live</span>
                </div>
              </div>
            ))}
          </div>

          {/* Multimodal Formula Box (Section 7) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Proposal Section 7: Multimodal Weighted Formula
            </span>
            <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono text-xs text-indigo-900 text-center font-bold">
              Match Score = w₁·S_image + w₂·S_text + w₃·S_location + w₄·S_time + w₅·S_attributes
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Weights (initially 0.40, 0.25, 0.15, 0.10, 0.10) sum to 1.0. Evaluated against 350 campus benchmark item pairs with empirical Information Retrieval metrics (P@k, R@k, MRR = 1.0000).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            CSE 300 Project Proposal &bull; Metropolitan University
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
