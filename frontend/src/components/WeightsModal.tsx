"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Image as ImageIcon,
  FileText,
  MapPin,
  Clock,
  Tag,
  ShieldAlert,
  Sliders,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Database,
  Cpu,
  RefreshCw,
} from "lucide-react";
import {
  getAIWeights,
  tuneAIWeights,
  resetAIWeights,
  getAICacheTelemetry,
} from "../services/api";

interface WeightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WeightsModal({ isOpen, onClose }: WeightsModalProps) {
  const [activeTab, setActiveTab] = useState<"tune" | "specs">("tune");

  // Dynamic Weights State (percentages 0-100)
  const [visualWeight, setVisualWeight] = useState(40);
  const [textualWeight, setTextualWeight] = useState(25);
  const [locationWeight, setLocationWeight] = useState(15);
  const [timeWeight, setTimeWeight] = useState(10);
  const [attributeWeight, setAttributeWeight] = useState(10);

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Telemetry state
  const [telemetry, setTelemetry] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadCurrentWeights();
      loadTelemetry();
    }
  }, [isOpen]);

  const loadCurrentWeights = async () => {
    try {
      const data = await getAIWeights();
      if (data.currentWeights) {
        setVisualWeight(Math.round((data.currentWeights.visual ?? 0.4) * 100));
        setTextualWeight(Math.round((data.currentWeights.textual ?? 0.25) * 100));
        setLocationWeight(Math.round((data.currentWeights.location ?? 0.15) * 100));
        setTimeWeight(Math.round((data.currentWeights.time ?? 0.1) * 100));
        setAttributeWeight(Math.round((data.currentWeights.attribute ?? 0.1) * 100));
      }
    } catch (e) {
      // Graceful fallback to initial
    }
  };

  const loadTelemetry = async () => {
    try {
      const data = await getAICacheTelemetry();
      setTelemetry(data);
    } catch (e) {
      // Ignored
    }
  };

  if (!isOpen) return null;

  const totalSum = visualWeight + textualWeight + locationWeight + timeWeight + attributeWeight;
  const isNormalized = totalSum === 100;

  const handleApplyTuning = async () => {
    if (!isNormalized) {
      setStatusMessage({ text: `Total weights sum must equal 100% (currently ${totalSum}%).`, type: "error" });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    try {
      await tuneAIWeights({
        visual: visualWeight / 100,
        textual: textualWeight / 100,
        location: locationWeight / 100,
        time: timeWeight / 100,
        attribute: attributeWeight / 100,
      });
      setStatusMessage({ text: "Multimodal AI weights successfully tuned in real-time!", type: "success" });
      loadTelemetry();
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to update weights.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetBaseline = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      await resetAIWeights();
      setVisualWeight(40);
      setTextualWeight(25);
      setLocationWeight(15);
      setTimeWeight(10);
      setAttributeWeight(10);
      setStatusMessage({ text: "Weights restored to academic default baseline (40/25/15/10/10).", type: "success" });
      loadTelemetry();
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to reset weights.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const weightsSpec = [
    {
      factor: "Visual Similarity (W_img)",
      weight: "0.40 (40%)",
      icon: ImageIcon,
      model: "OpenCLIP ViT-B/32",
      description:
        "Cosine similarity between normalized image embedding vectors. Evaluates shape, texture, color patterns, and visual appearance.",
      fallback: "When no image is provided, weights dynamically re-normalize to text and attributes.",
    },
    {
      factor: "Semantic Description (W_txt)",
      weight: "0.25 (25%)",
      icon: FileText,
      model: "all-MiniLM-L6-v2 (Sentence Transformers)",
      description:
        "Dense semantic vector similarity across titles, descriptions, and distinctive notes. Captures synonyms (e.g. 'rucksack' ≈ 'backpack').",
      fallback: "Zero-shot text-only fallback.",
    },
    {
      factor: "Spatiotemporal Location (W_loc)",
      weight: "0.15 (15%)",
      icon: MapPin,
      model: "Sylhet Geographic Zone & Landmark Proximity",
      description:
        "Proximity between the reported lost location and found location across Sylhet metropolitan hubs.",
      fallback: "Zone-level match score.",
    },
    {
      factor: "Time Proximity (W_time)",
      weight: "0.10 (10%)",
      icon: Clock,
      model: "Exponential Time-Decay Function",
      description:
        "Calculates time interval: |t_found - t_lost|. Items found shortly after being lost score near 1.0; score gradually decays over days.",
      fallback: "Timestamp delta penalty.",
    },
    {
      factor: "Attributes & Brand (W_attr)",
      weight: "0.10 (10%)",
      icon: Tag,
      model: "Exact / Fuzzy Categorical Overlap",
      description:
        "Calculated from category match, brand equality, and primary/secondary color overlap.",
      fallback: "Categorical intersection.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171A18]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#252B27] rounded-3xl shadow-2xl border border-[#383E39] overflow-hidden flex flex-col max-h-[92vh] text-[#F3F4EF]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#383E39] bg-[#1E2320]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#171A18] text-[#45B58A] border border-[#383E39] rounded-2xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F3F4EF]">
                Multimodal AI Weighting & Tuning Console
              </h3>
              <p className="text-xs text-[#A9B0AA]">
                Dynamic Weight Fine-Tuning &bull; In-Memory LRU Cache &bull; Explainable Breakdown
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A9B0AA] hover:text-[#F3F4EF] hover:bg-[#383E39] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#383E39] bg-[#171A18] px-6 pt-2">
          <button
            onClick={() => setActiveTab("tune")}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "tune"
                ? "border-[#45B58A] text-[#45B58A]"
                : "border-transparent text-[#A9B0AA] hover:text-[#F3F4EF]"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Weight Tuning (Live)</span>
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "specs"
                ? "border-[#45B58A] text-[#45B58A]"
                : "border-transparent text-[#A9B0AA] hover:text-[#F3F4EF]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Formulation & Explainability Specs</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-5">
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-fadeIn ${
                statusMessage.type === "success"
                  ? "bg-[#45B58A]/15 border-[#45B58A]/40 text-[#45B58A]"
                  : "bg-red-500/15 border-red-500/40 text-red-300"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab === "tune" ? (
            <div className="space-y-4">
              {/* Formula & Sum Badge */}
              <div className="p-4 rounded-2xl bg-[#171A18] border border-[#383E39] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase text-[#45B58A] block">
                    Active Formula
                  </span>
                  <code className="text-xs sm:text-sm font-mono text-[#F3F4EF] mt-0.5 block">
                    {(visualWeight / 100).toFixed(2)}(S_img) + {(textualWeight / 100).toFixed(2)}(S_txt) + {(locationWeight / 100).toFixed(2)}(S_loc) + {(timeWeight / 100).toFixed(2)}(S_time) + {(attributeWeight / 100).toFixed(2)}(S_attr)
                  </code>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold self-start sm:self-auto ${
                    isNormalized
                      ? "bg-[#45B58A]/15 text-[#45B58A] border-[#45B58A]/30"
                      : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  }`}
                >
                  Sum: {totalSum}% {isNormalized ? "✓ Valid" : "⚠ Must be 100%"}
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-3.5 p-4 rounded-2xl bg-[#171A18] border border-[#383E39]">
                {/* Visual */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#F3F4EF] font-semibold flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#45B58A]" /> Visual Weight (OpenCLIP)
                    </span>
                    <span className="font-mono text-[#45B58A] font-bold">{visualWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="5"
                    value={visualWeight}
                    onChange={(e) => setVisualWeight(Number(e.target.value))}
                    className="w-full accent-[#45B58A] h-1.5 bg-[#252B27] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Textual */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#F3F4EF] font-semibold flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#45B58A]" /> Semantic Text Weight (S-BERT)
                    </span>
                    <span className="font-mono text-[#45B58A] font-bold">{textualWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="5"
                    value={textualWeight}
                    onChange={(e) => setTextualWeight(Number(e.target.value))}
                    className="w-full accent-[#45B58A] h-1.5 bg-[#252B27] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Location */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#F3F4EF] font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#45B58A]" /> Location Proximity Weight
                    </span>
                    <span className="font-mono text-[#45B58A] font-bold">{locationWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={locationWeight}
                    onChange={(e) => setLocationWeight(Number(e.target.value))}
                    className="w-full accent-[#45B58A] h-1.5 bg-[#252B27] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Time */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#F3F4EF] font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#45B58A]" /> Time Decay Weight
                    </span>
                    <span className="font-mono text-[#45B58A] font-bold">{timeWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="5"
                    value={timeWeight}
                    onChange={(e) => setTimeWeight(Number(e.target.value))}
                    className="w-full accent-[#45B58A] h-1.5 bg-[#252B27] rounded-lg cursor-pointer"
                  />
                </div>

                {/* Attributes */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#F3F4EF] font-semibold flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#45B58A]" /> Categorical Attributes & Color
                    </span>
                    <span className="font-mono text-[#45B58A] font-bold">{attributeWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="5"
                    value={attributeWeight}
                    onChange={(e) => setAttributeWeight(Number(e.target.value))}
                    className="w-full accent-[#45B58A] h-1.5 bg-[#252B27] rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetBaseline}
                  disabled={isLoading}
                  className="px-3.5 py-2 text-xs font-bold text-[#A9B0AA] hover:text-[#F3F4EF] bg-[#171A18] hover:bg-[#1E2320] border border-[#383E39] rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Baseline</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyTuning}
                  disabled={isLoading || !isNormalized}
                  className="px-4 py-2 text-xs font-bold text-[#171A18] bg-[#45B58A] hover:bg-[#45B58A]/90 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  {isLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Apply & Tune Weights</span>
                </button>
              </div>

              {/* Cache & Architecture Telemetry Box */}
              {telemetry && (
                <div className="p-3.5 rounded-2xl bg-[#171A18] border border-[#383E39] text-xs text-[#A9B0AA] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F3F4EF] flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[#45B58A]" />
                      Live Cache & Resilience Telemetry:
                    </span>
                    <span className="text-[10px] text-[#45B58A] bg-[#45B58A]/15 px-2 py-0.5 rounded border border-[#45B58A]/30">
                      Active
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded-lg bg-[#252B27]">
                      <span className="block text-[#A9B0AA]">Backend Match TTL</span>
                      <span className="text-[#F3F4EF] font-bold">30s In-Memory</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#252B27]">
                      <span className="block text-[#A9B0AA]">Image Vector Cache</span>
                      <span className="text-[#F3F4EF] font-bold">
                        {telemetry.aiServiceCache?.imageCacheEntries ?? "Active (LRU)"}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#252B27]">
                      <span className="block text-[#A9B0AA]">Text Vector Cache</span>
                      <span className="text-[#F3F4EF] font-bold">
                        {telemetry.aiServiceCache?.textCacheEntries ?? "Active (LRU)"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Formula Display */}
              <div className="p-4 rounded-2xl bg-[#171A18] border border-[#383E39]">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[#45B58A] block mb-1">
                  Baseline Academic Formulation
                </span>
                <code className="text-sm font-mono block text-[#45B58A]">
                  Score = 0.40(S_img) + 0.25(S_txt) + 0.15(S_loc) + 0.10(S_time) + 0.10(S_attr)
                </code>
                <p className="text-xs text-[#A9B0AA] mt-2">
                  Tested and validated on 350 ground-truth lost & found pairs in the Sylhet campus benchmark dataset.
                </p>
              </div>

              {/* Breakdown cards */}
              <div className="space-y-3">
                {weightsSpec.map((w, index) => {
                  const Icon = w.icon;
                  return (
                    <div
                      key={index}
                      className="p-3.5 rounded-2xl border border-[#383E39] bg-[#171A18] flex flex-col sm:flex-row sm:items-start gap-3"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-[200px]">
                        <div className="p-2 rounded-xl bg-[#252B27] border border-[#383E39] text-[#45B58A]">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#F3F4EF]">{w.factor}</h4>
                          <span className="inline-block text-xs font-bold text-[#45B58A]">
                            Default: {w.weight}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 text-xs text-[#A9B0AA]">
                        <p className="leading-relaxed">{w.description}</p>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#A9B0AA] font-mono">
                          <span className="font-semibold text-[#F3F4EF]">Model:</span> {w.model}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ethics / Verification Notice */}
              <div className="p-3.5 rounded-2xl bg-[#171A18] border border-[#383E39] text-[#A9B0AA] flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-[#45B58A] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-[#F3F4EF]">Human-in-the-Loop Safeguard:</span>
                  <p className="mt-0.5 leading-relaxed">
                    The AI system ranks candidates and explains why they match. By design,{" "}
                    <strong>the AI will NEVER automatically confirm ownership or release an item</strong>. Final release requires manual review by authorized verification administrators.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#383E39] bg-[#1E2320] flex items-center justify-between">
          <span className="text-[11px] text-[#A9B0AA] flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#45B58A]" />
            MongoDB Vector Persistent Cache &bull; Resilient Fallbacks
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#F3F4EF] bg-[#252B27] border border-[#383E39] rounded-xl hover:bg-[#383E39] transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
