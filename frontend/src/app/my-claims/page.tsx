"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  MapPin,
  Calendar,
  RefreshCw,
  ArrowLeft,
  LogIn,
  Search,
  Tag,
  Printer,
  X,
  Building2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AuthModal from "../../components/AuthModal";
import { useAuth } from "../../context/AuthContext";
import { fetchMyClaims, resolveImageUrl } from "../../services/api";
import { Claim, StoredItemReport, CAMPUS_LOCATIONS } from "../../types/item";

export default function MyClaimsPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isFetchingClaims, setIsFetchingClaims] = useState(false);
  const isLoading = authLoading || isFetchingClaims;
  const [error, setError] = useState<string | null>(null);

  // Modals & UI States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePassClaim, setActivePassClaim] = useState<Claim | null>(null);
  const [expandedClaims, setExpandedClaims] = useState<{ [id: string]: boolean }>({});

  const toggleDetails = (id: string) => {
    setExpandedClaims((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const loadClaims = useCallback(async () => {
    if (!token) return;

    setIsFetchingClaims(true);
    setError(null);
    try {
      const data = await fetchMyClaims(token);
      setClaims(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not load claims. Please try again.";
      setError(message);
    } finally {
      setIsFetchingClaims(false);
    }
  }, [token]);

  useEffect(() => {
    let isMounted = true;
    if (!authLoading && token) {
      fetchMyClaims(token)
        .then((data) => {
          if (isMounted) setClaims(data);
        })
        .catch((err: unknown) => {
          if (isMounted) {
            const message =
              err instanceof Error
                ? err.message
                : "Could not load claims. Please try again.";
            setError(message);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [authLoading, token]);

  const getLocationText = (item: StoredItemReport) => {
    const zoneId = item.location?.campusZone || item.campusLocation || "";
    const specific = item.location?.specificLocation || item.specificLocation || "";
    const matched = CAMPUS_LOCATIONS.find((l) => l.id === zoneId);
    const zoneName = matched ? matched.name.split(" (")[0] : zoneId;

    if (specific && zoneName) return `${specific}, ${zoneName}`;
    return specific || zoneName || "Sylhet";
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Metrics calculation
  const stats = useMemo(() => {
    const total = claims.length;
    const approved = claims.filter((c) => c.status === "approved").length;
    const pending = claims.filter((c) => c.status === "pending").length;
    const rejected = claims.filter((c) => c.status === "rejected").length;
    return { total, approved, pending, rejected };
  }, [claims]);

  // Filtered claims
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      if (filterStatus !== "all" && claim.status !== filterStatus) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const item = typeof claim.itemId === "object" && claim.itemId ? (claim.itemId as StoredItemReport) : null;
        const titleMatch = item?.title?.toLowerCase().includes(q);
        const categoryMatch = item?.category?.toLowerCase().includes(q);
        if (!titleMatch && !categoryMatch) return false;
      }
      return true;
    });
  }, [claims, filterStatus, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#141715] text-[#F3F4EF]">
      <Navbar
        onOpenAuth={(tab) => {
          setAuthModalTab(tab);
          setAuthModalOpen(true);
        }}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Simple Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#8A968D] hover:text-[#45B58A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          {user && (
            <button
              onClick={loadClaims}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2B352E] bg-[#1B221D] hover:bg-[#232D26] text-xs text-[#F3F4EF] transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#45B58A] ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>

        {/* Clean, Simple Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232D26]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F4EF] tracking-tight">
              My Claims
            </h1>
            <p className="text-xs sm:text-sm text-[#8A968D] mt-1">
              Check the status of your claimed items and view pickup instructions.
            </p>
          </div>

          {user && (
            <div className="text-xs text-[#8A968D] bg-[#1A221D] border border-[#263229] px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
              Logged in as <span className="font-semibold text-[#F3F4EF]">{user.name}</span>
            </div>
          )}
        </div>

        {/* Easy Filter Buttons & Search */}
        {user && claims.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {[
                { id: "all", label: "All", count: stats.total },
                { id: "approved", label: "Approved", count: stats.approved },
                { id: "pending", label: "Under Review", count: stats.pending },
                { id: "rejected", label: "Declined", count: stats.rejected },
              ].map((tab) => {
                const isActive = filterStatus === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilterStatus(tab.id as typeof filterStatus)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-[#45B58A] text-[#111412]"
                        : "bg-[#1B221D] text-[#8A968D] hover:text-[#F3F4EF] border border-[#27332A]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="text-[10px] opacity-75">({tab.count})</span>
                  </button>
                );
              })}
            </div>

            <div className="relative sm:w-56">
              <Search className="w-3.5 h-3.5 text-[#738277] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#1A221D] border border-[#2A372E] rounded-lg text-[#F3F4EF] placeholder-[#738277] focus:outline-none focus:border-[#45B58A]"
              />
            </div>
          </div>
        )}

        {/* Content States */}
        {authLoading ? (
          <div className="rounded-xl bg-[#1B221D] border border-[#263229] p-12 text-center text-xs text-[#8A968D]">
            <RefreshCw className="w-6 h-6 animate-spin text-[#45B58A] mx-auto mb-2" />
            Loading your account...
          </div>
        ) : !user ? (
          <div className="rounded-xl bg-[#1B221D] border border-[#263229] p-10 text-center space-y-3 max-w-sm mx-auto">
            <LogIn className="w-8 h-8 text-[#45B58A] mx-auto" />
            <h2 className="text-base font-bold text-[#F3F4EF]">Please log in</h2>
            <p className="text-xs text-[#8A968D]">Log in to see and manage your submitted claims.</p>
            <button
              onClick={() => {
                setAuthModalTab("login");
                setAuthModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-[#45B58A] hover:bg-[#3ca37c] text-[#111412] font-semibold text-xs cursor-pointer"
            >
              Log In
            </button>
          </div>
        ) : error ? (
          <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-900/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        ) : isLoading ? (
          <div className="rounded-xl bg-[#1B221D] border border-[#263229] p-12 text-center text-xs text-[#8A968D]">
            <RefreshCw className="w-6 h-6 animate-spin text-[#45B58A] mx-auto mb-2" />
            Loading claims...
          </div>
        ) : claims.length === 0 ? (
          <div className="rounded-xl bg-[#1B221D] border border-[#263229] p-10 text-center space-y-3">
            <h3 className="text-sm font-bold text-[#F3F4EF]">No claims submitted yet</h3>
            <p className="text-xs text-[#8A968D] max-w-xs mx-auto">
              If you found your item in the lost &amp; found feed, submit a claim to get it back.
            </p>
            <Link
              href="/explore"
              className="inline-block px-4 py-1.5 rounded-lg bg-[#45B58A] text-[#111412] font-semibold text-xs"
            >
              Browse Items
            </Link>
          </div>
        ) : (
          /* Simplified, Clean Cards */
          <div className="space-y-4">
            {filteredClaims.map((claim) => {
              const claimId = claim._id || (claim as unknown as { id: string }).id;
              const item =
                typeof claim.itemId === "object" && claim.itemId ? (claim.itemId as StoredItemReport) : null;

              const isApproved = claim.status === "approved";
              const isRejected = claim.status === "rejected";
              const isPending = claim.status === "pending";
              const isExpanded = !!expandedClaims[claimId];

              const rawUrl =
                (item?.imageUrls && item.imageUrls.length > 0 && item.imageUrls[0]) ||
                (item?.images && item.images.length > 0 && item.images[0].previewUrl) ||
                null;
              const imageUrl = resolveImageUrl(rawUrl);

              return (
                <div
                  key={claimId}
                  className="rounded-xl bg-[#1B221D] border border-[#27352B] p-5 space-y-4 hover:border-[#38483B] transition-colors"
                >
                  {/* Top Item Summary Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      {/* Photo Thumbnail */}
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg overflow-hidden bg-[#141A16] border border-[#28352C] shrink-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item?.title || "Item"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#738277]">
                            <Tag className="w-5 h-5 text-[#45B58A]" />
                          </div>
                        )}
                      </div>

                      {/* Title & Metadata */}
                      <div className="space-y-1">
                        <span className="text-[11px] text-[#7E8C82]">
                          Claim #{claimId.slice(-6).toUpperCase()} · Filed {formatDate(claim.createdAt)}
                        </span>
                        <h3 className="text-base font-bold text-[#F3F4EF] leading-snug">
                          {item?.title || "Claimed Item"}
                        </h3>
                        {item && (
                          <p className="text-xs text-[#8A968D] flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#45B58A] shrink-0" />
                            <span>{getLocationText(item)}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="self-start sm:self-auto">
                      {isApproved && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-semibold border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Under Review</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-semibold border border-rose-500/30">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Declined</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Clean Status Box */}
                  {isApproved && (
                    <div className="rounded-lg bg-emerald-950/20 border border-emerald-500/30 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-emerald-400">Ready for Collection</h4>
                        <p className="text-[#9DAEA1]">
                          Your ownership is confirmed. Please bring a photo ID to the Lost &amp; Found desk to pick up your item.
                        </p>
                        {claim.reviewNotes && (
                          <p className="text-[11px] text-emerald-300/90 italic pt-1">
                            Note from staff: &ldquo;{claim.reviewNotes}&rdquo;
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => setActivePassClaim(claim)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#45B58A] hover:bg-[#3ca37c] text-[#111412] font-semibold text-xs transition cursor-pointer shrink-0 self-start sm:self-auto"
                      >
                        View Pickup Slip
                      </button>
                    </div>
                  )}

                  {isPending && (
                    <div className="rounded-lg bg-amber-950/15 border border-amber-500/25 p-3 text-xs text-[#9DA8A0]">
                      <span className="font-semibold text-amber-300 block mb-0.5">Review in Progress</span>
                      An administrator is reviewing your details against the physical item. You will be notified once verified.
                    </div>
                  )}

                  {isRejected && (
                    <div className="rounded-lg bg-rose-950/15 border border-rose-900/30 p-3 text-xs text-[#A89899]">
                      <span className="font-semibold text-rose-300 block mb-0.5">Claim Declined</span>
                      The information provided did not match the records for this item.
                      {claim.reviewNotes && (
                        <p className="italic text-rose-200 mt-1">&ldquo;{claim.reviewNotes}&rdquo;</p>
                      )}
                    </div>
                  )}

                  {/* Collapsible Accordion: Clean Submission Details */}
                  <div className="pt-2 border-t border-[#232D26]">
                    <button
                      type="button"
                      onClick={() => toggleDetails(claimId)}
                      className="text-xs text-[#8A968D] hover:text-[#F3F4EF] transition flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <span>{isExpanded ? "Hide my submitted details" : "View what I submitted"}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 p-3 rounded-lg bg-[#141A16] border border-[#242E27] space-y-2 text-xs">
                        <div>
                          <span className="text-[#738277] block text-[11px]">Your Security Answer:</span>
                          <span className="text-[#F3F4EF] font-medium">{claim.secretVerificationAnswer}</span>
                        </div>
                        {claim.proofDetails && (
                          <div>
                            <span className="text-[#738277] block text-[11px]">Additional Details You Gave:</span>
                            <span className="text-[#A4B1A7]">{claim.proofDetails}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Clean, Simple Pickup Slip Modal */}
      {activePassClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-xl bg-[#1B221D] border border-[#2D3A30] p-5 shadow-2xl space-y-4">
            <button
              onClick={() => setActivePassClaim(null)}
              className="absolute top-4 right-4 p-1 rounded-md text-[#8A968D] hover:text-[#F3F4EF] hover:bg-[#253027] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-[#45B58A] uppercase tracking-wider">
                Authorized Collection
              </span>
              <h3 className="text-lg font-bold text-[#F3F4EF]">Item Pickup Slip</h3>
              <p className="text-xs text-[#8A968D]">
                Show this slip at the desk to collect your item.
              </p>
            </div>

            <div className="rounded-lg bg-[#141B16] border border-[#242E27] p-3.5 space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-[#738277] uppercase block">Item</span>
                <span className="font-bold text-[#F3F4EF] text-sm block">
                  {typeof activePassClaim.itemId === "object" ? activePassClaim.itemId?.title : "Item"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#738277] uppercase block">Claimant</span>
                  <span className="font-semibold text-[#F3F4EF] block truncate">{user?.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#738277] uppercase block">Claim ID</span>
                  <span className="font-mono text-[#45B58A] font-semibold block">
                    #{activePassClaim._id.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-md bg-[#18211A] border border-[#222E25] space-y-0.5">
                <span className="font-semibold text-[#F3F4EF] flex items-center gap-1.5 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-[#45B58A]" />
                  Pickup Desk:
                </span>
                <p className="text-[11px] text-[#8A968D]">
                  Lost &amp; Found Office (Please bring a photo ID or NID)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-1.5 rounded-lg bg-[#232D26] hover:bg-[#2C3830] text-[#F3F4EF] font-semibold text-xs border border-[#2F3E33] transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#45B58A]" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePassClaim(null)}
                className="flex-1 py-1.5 rounded-lg bg-[#45B58A] hover:bg-[#3ca37c] text-[#111412] font-semibold text-xs transition cursor-pointer"
              >
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />

      <Footer />
    </div>
  );
}
