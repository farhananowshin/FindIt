"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
  RefreshCw,
  Info,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { StoredItemReport, MatchResponse, MatchCandidate, CAMPUS_LOCATIONS } from "../types/item";
import { fetchMatchesForItem, resolveImageUrl } from "../services/api";

interface MatchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  lostItem: StoredItemReport | null;
  onClaimCandidate?: (candidate: MatchCandidate) => void;
}

export default function MatchesModal({
  isOpen,
  onClose,
  lostItem,
  onClaimCandidate,
}: MatchesModalProps) {
  const [matchData, setMatchData] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        const message = err instanceof Error ? err.message : "Could not load matching items.";
        setError(message);
        setLoading(false);
      });
  }, [lostItem]);

  useEffect(() => {
    if (!isOpen || !lostItem) return;
    loadMatches();
  }, [isOpen, lostItem, loadMatches]);

  if (!isOpen || !lostItem) return null;

  const getLocationName = (id?: string) => {
    if (!id) return "Sylhet";
    return CAMPUS_LOCATIONS.find((l) => l.id === id)?.name?.split(" (")[0] || id;
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (score >= 60) return "text-emerald-300 bg-emerald-500/10 border-emerald-500/20";
    return "text-[#9DA8A0] bg-[#1F2722] border-[#2E3B32]";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#18201B] rounded-2xl shadow-2xl border border-[#2B3A2F] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#253228] bg-[#141A16]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#45B58A]/15 text-[#45B58A] border border-[#45B58A]/30 rounded-xl">
              <Sparkles className="w-5 h-5 text-[#45B58A]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F3F4EF]">
                Matching Items
              </h3>
              <p className="text-xs text-[#8A978E]">
                Found belongings that closely resemble your lost item.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8A978E] hover:text-[#F3F4EF] hover:bg-[#202923] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Lost Item Summary Bar */}
        <div className="px-6 py-3 bg-[#131815] border-b border-[#222E25] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-[#718074] uppercase tracking-wider">
              Lost Item:
            </span>
            <span className="font-bold text-[#F3F4EF]">{lostItem.title}</span>
          </div>
          <div className="flex items-center gap-3 text-[#8A978E]">
            {lostItem.category && (
              <span className="capitalize">{lostItem.category.replace("_", " ")}</span>
            )}
            <span>•</span>
            <span>{getLocationName(lostItem.location?.campusZone || lostItem.campusLocation)}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-[#18201B]">
          {/* Loading State */}
          {loading && (
            <div className="py-14 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#45B58A] animate-spin mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-[#F3F4EF]">
                  Finding matching items...
                </h4>
                <p className="text-xs text-[#8A978E] mt-1 max-w-sm mx-auto">
                  Comparing item photos, descriptions, brand, and reported locations.
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-5 rounded-xl bg-[#141A16] border border-[#2B3A2F] text-xs space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-bold text-sm text-[#F3F4EF]">
                  <AlertCircle className="w-4 h-4 text-[#45B58A] shrink-0" />
                  <span>Matching temporarily unavailable</span>
                </div>
                <button
                  type="button"
                  onClick={loadMatches}
                  className="px-3 py-1 rounded-lg bg-[#45B58A] hover:bg-[#3ca37c] text-[#111412] font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Try Again</span>
                </button>
              </div>

              <p className="text-[#8A978E] leading-relaxed">
                Could not load automated matches right now. You can still browse all found items directly in the catalog.
              </p>
            </div>
          )}

          {/* Empty Candidates State */}
          {!loading && !error && matchData && matchData.matches.length === 0 && (
            <div className="py-12 text-center rounded-xl p-8 bg-[#141A16] border border-[#253228] space-y-2">
              <Info className="w-8 h-8 text-[#738277] mx-auto mb-1" />
              <h4 className="text-sm font-bold text-[#F3F4EF]">No matching items found yet</h4>
              <p className="text-xs text-[#8A978E] max-w-xs mx-auto">
                No found items currently match this report. Check back later as new found items are reported.
              </p>
            </div>
          )}

          {/* Ranked Candidates Feed */}
          {!loading && !error && matchData && matchData.matches.length > 0 && (
            <div className="space-y-4">
              <div className="text-xs text-[#8A978E] pb-1 border-b border-[#232F26]">
                Showing top <strong className="text-[#F3F4EF]">{matchData.matches.length}</strong> matching found items:
              </div>

              {matchData.matches.map((match: MatchCandidate, index: number) => {
                const rawUrl = match.imageUrls && match.imageUrls.length > 0 ? match.imageUrls[0] : null;
                const imageUrl = resolveImageUrl(rawUrl);
                const scorePercent = Math.round(match.matchScore || (match.matchScoreNormalized * 100));

                return (
                  <div
                    key={match.itemId}
                    className="p-4 rounded-xl border border-[#27352B] bg-[#141A16] space-y-3 hover:border-[#38483B] transition-colors"
                  >
                    {/* Top Row: Rank, Title, Score */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-[#1F2922] text-[#45B58A] font-bold text-xs flex items-center justify-center shrink-0">
                          #{index + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-[#F3F4EF]">
                            {match.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#8A978E]">
                            <span className="capitalize">{match.category.replace("_", " ")}</span>
                            {match.brand && <span>· Brand: <strong className="text-[#F3F4EF]">{match.brand}</strong></span>}
                            <span>· Location: <strong className="text-[#F3F4EF]">{getLocationName(match.campusZone)}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getScoreBadge(scorePercent)}`}>
                          {scorePercent}% Match
                        </span>

                        {onClaimCandidate && (
                          <button
                            type="button"
                            onClick={() => onClaimCandidate(match)}
                            className="px-3 py-1 rounded-lg bg-[#45B58A] hover:bg-[#3ca37c] text-[#111412] font-semibold text-xs transition cursor-pointer"
                          >
                            Claim
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Middle: Photo & Explanation */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-[#222E25]">
                      {imageUrl && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#1B221D] border border-[#26332A] shrink-0">
                          <img
                            src={imageUrl}
                            alt={match.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      )}

                      <div className="space-y-1 text-xs text-[#8A978E] flex-1">
                        {match.explanation && (
                          <p className="text-xs text-[#C5D0C8] leading-relaxed">
                            {match.explanation}
                          </p>
                        )}

                        {match.visualCues && match.visualCues.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {match.visualCues.map((cue, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded text-[11px] bg-[#1B241E] text-[#9BA89F] border border-[#27352B]"
                              >
                                {cue}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Simple Bottom Tip */}
          <div className="p-3.5 rounded-xl bg-[#141A16] border border-[#253228] text-xs text-[#8A978E] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#45B58A] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              If you recognize your item among these matches, click <strong>&ldquo;Claim&rdquo;</strong> to file an ownership claim.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#253228] bg-[#141A16] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-[#F3F4EF] bg-[#1E2620] border border-[#2B382F] rounded-lg hover:bg-[#253028] transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
