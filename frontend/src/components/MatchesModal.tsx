"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Sparkles,
  MapPin,
  Clock,
  Tag,
  ImageIcon,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Info,
  CheckCircle,
  ExternalLink,
  Sliders,
} from "lucide-react";
import { StoredItemReport, MatchResponse, MatchCandidate, CAMPUS_LOCATIONS } from "../types/item";
import { fetchMatchesForItem } from "../services/api";

interface MatchesModalProps {
  lostItem: StoredItemReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MatchesModal({ lostItem, isOpen, onClose }: MatchesModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<MatchResponse | null>(null);

  const loadMatches = useCallback(() => {
    if (!lostItem) return;
    const itemId = lostItem._id || lostItem.id;
    if (!itemId) return;

    setLoading(true);
    setError(null);

    fetchMatchesForItem(itemId)
      .then((data) => {
        setMatchData(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Failed to load matches.";
        setError(message);
        setLoading(false);
      });
  }, [lostItem]);

  useEffect(() => {
    if (!isOpen || !lostItem) {
      setMatchData(null);
      setError(null);
      return;
    }
    loadMatches();
  }, [isOpen, lostItem, loadMatches]);

  if (!isOpen || !lostItem) return null;

  const getLocationName = (id: string) => {
    return CAMPUS_LOCATIONS.find((l) => l.id === id)?.name || id;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-indigo-700 bg-indigo-50 border-indigo-200";
    if (score >= 40) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-slate-700 bg-slate-50 border-slate-200";
  };

  const getBarColor = (score: number) => {
    if (score >= 0.8) return "bg-emerald-500";
    if (score >= 0.6) return "bg-indigo-500";
    if (score >= 0.4) return "bg-amber-500";
    return "bg-slate-400";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Multimodal AI Match Results
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Day 3 AI Engine
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Evaluating candidate Found reports using OpenCLIP (ViT-B-32) & S-BERT
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

        {/* Source Lost Item Brief Summary */}
        <div className="px-6 py-3 bg-indigo-50/40 border-b border-indigo-100/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded text-[11px]">
              Target Lost Item
            </span>
            <span className="font-bold text-slate-800">{lostItem.title}</span>
            <span className="text-slate-400 font-mono">({lostItem._id || lostItem.id})</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <span><strong>Category:</strong> {lostItem.category.replace("_", " ")}</span>
            <span><strong>Location:</strong> {getLocationName(lostItem.campusLocation)}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-6 overflow-y-auto space-y-6 flex-1">
          {/* Loading State */}
          {loading && (
            <div className="py-16 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  Computing Multimodal AI Similarities...
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Generating OpenCLIP visual embeddings (512-dim) and Sentence Transformers semantic vectors (384-dim) for eligible found items.
                </p>
              </div>
            </div>
          )}

          {/* Error State / AI Offline Graceful Degradation */}
          {error && !loading && (
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Multimodal AI Matching Temporarily Unavailable</span>
                </div>
                <button
                  type="button"
                  onClick={loadMatches}
                  className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry AI Service</span>
                </button>
              </div>

              <p className="leading-relaxed text-amber-900">
                {error}
              </p>

              <div className="p-3.5 bg-white/90 rounded-xl border border-amber-200 text-[11px] text-slate-700 space-y-1">
                <p className="font-semibold text-slate-900">
                  🛡️ Graceful Service Degradation:
                </p>
                <p className="leading-relaxed">
                  Campus item browsing, lost/found reporting, student claims, and administrative review remain 100% operational. Only automated neural similarity rankings are paused until the AI service re-establishes connection.
                </p>
                <p className="font-mono text-[10px] text-slate-500 pt-1">
                  Start service: <code>cd ai-service &amp;&amp; .venv\Scripts\activate &amp;&amp; uvicorn main:app --port 8001 --reload</code>
                </p>
              </div>
            </div>
          )}

          {/* Empty Candidates State */}
          {!loading && !error && matchData && matchData.matches.length === 0 && (
            <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl p-8">
              <Info className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h4 className="text-base font-semibold text-slate-800">No Eligible Found Items Yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                There are currently no active Found reports in MongoDB to match against. Submit a found item report first to test the matching engine!
              </p>
            </div>
          )}

          {/* Ranked Candidates Feed */}
          {!loading && !error && matchData && matchData.matches.length > 0 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
                <span>
                  Evaluated <strong>{matchData.totalCandidatesEvaluated}</strong> candidate reports in MongoDB. Showing top {matchData.matches.length} matches.
                </span>
                <span className="font-semibold text-indigo-600">
                  Ranked by 5-Factor Multimodal Score
                </span>
              </div>

              {matchData.matches.map((match: MatchCandidate, index: number) => {
                const hasImage = match.imageUrls && match.imageUrls.length > 0;
                const isTextOnlyFallback = match.unavailableModalities.includes("visual");

                return (
                  <div
                    key={match.itemId}
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition space-y-4"
                  >
                    {/* Top Row: Rank, Title, Score */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                          #{index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-slate-900">
                              {match.title}
                            </h4>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                              #{match.itemId.slice(-6)}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                            <span className="capitalize text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-medium">
                              {match.category.replace("_", " ")}
                            </span>
                            {match.brand && <span>Brand: <strong>{match.brand}</strong></span>}
                            <span>Zone: <strong>{match.campusZone || "Campus"}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Total Score Badge */}
                      <div className={`px-4 py-2 rounded-2xl border text-center self-start sm:self-auto ${getScoreColor(match.matchScore)}`}>
                        <span className="text-[10px] uppercase font-bold tracking-wider block">
                          Match Score
                        </span>
                        <span className="text-2xl font-black">
                          {match.matchScore}%
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Photo Preview & 5-Weight Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2">
                      {/* Image Thumbnail */}
                      <div className="md:col-span-3 h-28 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                        {hasImage ? (
                          <img
                            src={match.imageUrls[0]}
                            alt={match.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-3 text-slate-400">
                            <ImageIcon className="w-7 h-7 mx-auto mb-1 stroke-1" />
                            <span className="text-[10px] block font-medium">No Photo</span>
                          </div>
                        )}
                      </div>

                      {/* 5-Weight Factors Progress Bars */}
                      <div className="md:col-span-9 space-y-2 text-xs">
                        {/* Visual */}
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                              🖼️ Visual (OpenCLIP ViT-B-32)
                              <span className="text-slate-400 font-normal">
                                [Weight: {(match.effectiveWeights.visual ? match.effectiveWeights.visual * 100 : 0).toFixed(0)}%]
                              </span>
                            </span>
                            <span className="font-bold text-slate-800">
                              {match.scoreBreakdown.visual !== null
                                ? `${(match.scoreBreakdown.visual * 100).toFixed(0)}%`
                                : "Unavailable (Omitted)"}
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full ${getBarColor(match.scoreBreakdown.visual || 0)}`}
                              style={{ width: `${(match.scoreBreakdown.visual || 0) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Textual */}
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                              📝 Text Semantic (all-MiniLM-L6-v2)
                              <span className="text-slate-400 font-normal">
                                [Weight: {(match.effectiveWeights.textual ? match.effectiveWeights.textual * 100 : 0).toFixed(0)}%]
                              </span>
                            </span>
                            <span className="font-bold text-slate-800">
                              {match.scoreBreakdown.textual !== null
                                ? `${(match.scoreBreakdown.textual * 100).toFixed(0)}%`
                                : "N/A"}
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full ${getBarColor(match.scoreBreakdown.textual || 0)}`}
                              style={{ width: `${(match.scoreBreakdown.textual || 0) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                              📍 Campus Location Proximity
                              <span className="text-slate-400 font-normal">
                                [Weight: {(match.effectiveWeights.location ? match.effectiveWeights.location * 100 : 0).toFixed(0)}%]
                              </span>
                            </span>
                            <span className="font-bold text-slate-800">
                              {match.scoreBreakdown.location !== null
                                ? `${(match.scoreBreakdown.location * 100).toFixed(0)}%`
                                : "N/A"}
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full ${getBarColor(match.scoreBreakdown.location || 0)}`}
                              style={{ width: `${(match.scoreBreakdown.location || 0) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Time & Attributes in two columns */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-[10px]">
                              <span className="font-semibold text-slate-600">⏱️ Time Proximity</span>
                              <span className="font-bold">
                                {match.scoreBreakdown.time !== null
                                  ? `${(match.scoreBreakdown.time * 100).toFixed(0)}%`
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full ${getBarColor(match.scoreBreakdown.time || 0)}`}
                                style={{ width: `${(match.scoreBreakdown.time || 0) * 100}%` }}
                              />
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex justify-between text-[10px]">
                              <span className="font-semibold text-slate-600">🏷️ Attributes Match</span>
                              <span className="font-bold">
                                {match.scoreBreakdown.attribute !== null
                                  ? `${(match.scoreBreakdown.attribute * 100).toFixed(0)}%`
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full ${getBarColor(match.scoreBreakdown.attribute || 0)}`}
                                style={{ width: `${(match.scoreBreakdown.attribute || 0) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Weight Re-normalization Banner if Visual is missing */}
                    {isTextOnlyFallback && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                        <Sliders className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>
                          <strong>Missing Modality Re-normalization:</strong> Since one or both items lacked photos, visual weight (40%) was automatically redistributed to semantic text (41.7%), location (25.0%), time (16.7%), and attributes (16.7%).
                        </span>
                      </div>
                    )}

                    {/* Natural Language Explanation Box */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900">Explainable AI Rationale: </span>
                        <span>{match.explanation}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Strict Human-in-the-Loop Ownership Safeguard */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Human-in-the-Loop Safeguard:</span>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                These scores represent mathematical candidate rankings calculated by OpenCLIP and Sentence Transformers. <strong>The AI system will never automatically confirm ownership or change an item status to claimed.</strong> Final physical handover requires manual verification by campus administration in Day 4.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition"
          >
            Close Matches
          </button>
        </div>
      </div>
    </div>
  );
}
