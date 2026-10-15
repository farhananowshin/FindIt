"use client";

import React from "react";
import {
  X,
  Image as ImageIcon,
  FileText,
  MapPin,
  Clock,
  Tag,
  ShieldAlert,
  Sliders,
} from "lucide-react";

interface WeightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WeightsModal({ isOpen, onClose }: WeightsModalProps) {
  if (!isOpen) return null;

  const weights = [
    {
      factor: "Visual Similarity (W_img)",
      weight: "0.40 (40%)",
      color: "bg-indigo-500",
      textColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      icon: ImageIcon,
      model: "OpenCLIP ViT-B/32",
      description:
        "Cosine similarity between normalized image embedding vectors of the lost and found items. Evaluates shape, texture, color patterns, and visual appearance.",
      fallback: "When no image is provided, weights dynamically re-normalize to text.",
    },
    {
      factor: "Semantic Description (W_txt)",
      weight: "0.25 (25%)",
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      icon: FileText,
      model: "all-MiniLM-L6-v2 (Sentence Transformers)",
      description:
        "Dense semantic vector similarity across titles, descriptions, and distinctive notes. Captures semantic synonyms (e.g. 'rucksack' ≈ 'backpack').",
      fallback: "Always evaluated.",
    },
    {
      factor: "Spatiotemporal Location (W_loc)",
      weight: "0.15 (15%)",
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      icon: MapPin,
      model: "Campus Graph & Zone Proximity",
      description:
        "Proximity between the reported lost location and found location. Higher score for exact same building and floor; tiered penalty for neighboring zones.",
      fallback: "Zone-level match score.",
    },
    {
      factor: "Time Proximity (W_time)",
      weight: "0.10 (10%)",
      color: "bg-amber-500",
      textColor: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      icon: Clock,
      model: "Exponential Time-Decay Function",
      description:
        "Calculates time interval: |t_found - t_lost|. Items found shortly after being lost score near 1.0; score gradually decays over days.",
      fallback: "Timestamp delta penalty.",
    },
    {
      factor: "Attributes & Brand (W_attr)",
      weight: "0.10 (10%)",
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      icon: Tag,
      model: "Exact / Fuzzy Categorical Overlap",
      description:
        "Calculated from category match (must match or score is penalized), brand equality, and primary/secondary color overlap.",
      fallback: "Categorical intersection.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Multimodal AI Weighting Formula
              </h3>
              <p className="text-xs text-slate-500">
                Explainable Match Scoring Architecture (Day 3 & Day 5 Grid Search)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-5">
          {/* Formula Display */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-indigo-400 block mb-1">
              Matching Formulation
            </span>
            <code className="text-sm sm:text-base font-mono block text-emerald-400">
              Score = 0.40(S_img) + 0.25(S_txt) + 0.15(S_loc) + 0.10(S_time) + 0.10(S_attr)
            </code>
            <p className="text-xs text-slate-400 mt-2">
              Sum of weights = 1.00 (100%). In Day 5, these initial weights will be tuned via Grid Search over 300–500 labeled pairs to optimize Mean Reciprocal Rank (MRR).
            </p>
          </div>

          {/* Breakdown cards */}
          <div className="space-y-3">
            {weights.map((w, index) => {
              const Icon = w.icon;
              return (
                <div
                  key={index}
                  className={`p-3.5 rounded-xl border ${w.borderColor} ${w.bgColor} flex flex-col sm:flex-row sm:items-start gap-3`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-[200px]">
                    <div className={`p-2 rounded-lg bg-white shadow-xs ${w.textColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{w.factor}</h4>
                      <span className={`inline-block text-xs font-bold ${w.textColor}`}>
                        Weight: {w.weight}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 text-xs text-slate-600">
                    <p className="leading-relaxed">{w.description}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                      <span className="font-semibold text-slate-700">Model:</span> {w.model}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ethics / Verification Notice */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold">Human-in-the-Loop Safeguard:</span>
              <p className="mt-0.5 text-amber-800">
                The AI system ranks candidates and explains why they match. By design, <strong>the AI will NEVER automatically confirm ownership or release an item</strong>. Final release requires manual review by campus administrators.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
}
