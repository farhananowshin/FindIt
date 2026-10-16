"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
  KeyRound,
  User,
  MapPin,
  Calendar,
  RefreshCw,
  Search,
  Filter,
  ArrowLeft,
  FileText,
  AlertTriangle,
  Info,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AuthModal from "../../components/AuthModal";
import { useAuth } from "../../context/AuthContext";
import { fetchAdminClaims, updateClaimStatus } from "../../services/api";
import { Claim, StoredItemReport, UserProfile, CAMPUS_LOCATIONS } from "../../types/item";

export default function AdminDashboardPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [searchQuery, setSearchQuery] = useState("");

  // Action states
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Auth modal state for login fallback
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const loadClaims = useCallback(async () => {
    if (!token || user?.role !== "admin") {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchAdminClaims(
        token,
        statusFilter === "all" ? undefined : statusFilter
      );
      setClaims(result.data || []);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load administrative claim records.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token, user, statusFilter]);

  useEffect(() => {
    if (!authLoading) {
      if (token && user?.role === "admin") {
        loadClaims();
      } else {
        setIsLoading(false);
      }
    }
  }, [authLoading, token, user, loadClaims]);

  const getLocationName = (locId: string) => {
    return CAMPUS_LOCATIONS.find((l) => l.id === locId)?.name || locId;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const openActionModal = (claim: Claim, type: "approve" | "reject") => {
    setSelectedClaim(claim);
    setActionType(type);
    setActionNotes(
      type === "approve"
        ? "Verified ownership with secret verification detail and claimant evidence. Ready for pickup at Campus Security Lost & Found."
        : "Secret verification details and proof provided do not correspond with the recovered item."
    );
    setActionError(null);
  };

  const closeActionModal = () => {
    setSelectedClaim(null);
    setActionType(null);
    setActionNotes("");
    setActionError(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedClaim || !actionType || !token) return;

    setIsSubmittingAction(true);
    setActionError(null);

    const claimId = selectedClaim._id || (selectedClaim as unknown as { id: string }).id;

    try {
      const updated = await updateClaimStatus(
        claimId,
        actionType === "approve" ? "approved" : "rejected",
        actionNotes.trim(),
        token
      );

      setSuccessBanner(
        actionType === "approve"
          ? `Claim #${claimId.slice(-6)} successfully APPROVED! The item status has been updated to claimed.`
          : `Claim #${claimId.slice(-6)} was REJECTED.`
      );

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessBanner(null), 5000);

      closeActionModal();
      loadClaims();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update claim status.";
      setActionError(message);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Filtered by search query
  const filteredClaims = claims.filter((c) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const claimant = typeof c.claimantId === "object" ? c.claimantId : null;
    const item = typeof c.itemId === "object" ? (c.itemId as StoredItemReport) : null;

    const claimantName = claimant?.name?.toLowerCase() || "";
    const claimantEmail = claimant?.email?.toLowerCase() || "";
    const claimantIdNum = claimant?.studentId?.toLowerCase() || "";
    const itemTitle = item?.title?.toLowerCase() || "";
    const claimNotes = c.proofDetails?.toLowerCase() || "";

    return (
      claimantName.includes(query) ||
      claimantEmail.includes(query) ||
      claimantIdNum.includes(query) ||
      itemTitle.includes(query) ||
      claimNotes.includes(query)
    );
  });

  const pendingCount = claims.filter((c) => c.status === "pending").length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar onOpenAuth={() => setAuthModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campus Feed
          </Link>

          {user?.role === "admin" && (
            <button
              onClick={loadClaims}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh Claims
            </button>
          )}
        </div>

        {/* Dashboard Title & Safety Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl shrink-0">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Admin Ownership Verification Portal
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                    Staff Only
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                  Inspect confidential verification answers, cross-examine claimant proof against finder records, and authorize property release.
                </p>
              </div>
            </div>

            {/* Human-in-the-Loop Policy Reminder */}
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-4 text-xs text-amber-900 max-w-md">
              <div className="flex items-center gap-2 font-bold mb-1 text-amber-950">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Human-in-the-Loop Safety Gate</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Multimodal AI computes similarity scores for candidate matching only. <strong>The AI engine never automatically confirms ownership or releases items.</strong> Every claim requires an authorized campus administrator to review and verify proof.
              </p>
            </div>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successBanner && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successBanner}</span>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="p-1 text-emerald-600 hover:text-emerald-800 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Authentication Gate Check */}
        {authLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Verifying administrative access permissions...</p>
          </div>
        ) : !user ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-xs">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Administrator Sign-In Required</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              You must be logged in with a campus administrator account to access the ownership claim review queue.
            </p>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition"
            >
              <Lock className="w-4 h-4" />
              Sign In to Administrator Console
            </button>
          </div>
        ) : user.role !== "admin" ? (
          <div className="bg-white rounded-2xl border border-rose-200 p-10 text-center shadow-xs">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied: Administrator Privileges Required</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              Your account (<strong>{user.email}</strong>) has the <strong>student</strong> role. Ownership verification and administrative claim inspection are restricted to authorized university staff.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm shadow-sm transition"
            >
              Return to Campus Home
            </Link>
          </div>
        ) : (
          /* Admin Console Main View */
          <div>
            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition flex items-center gap-1.5 shrink-0 ${
                      statusFilter === tab
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>{tab} Claims</span>
                    {tab === "pending" && pendingCount > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                          statusFilter === tab
                            ? "bg-white text-indigo-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {pendingCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search Claimant / Item */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by student, email, item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Error loading claims:</span>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Claims Queue */}
            {isLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700">Loading claims for review...</p>
              </div>
            ) : filteredClaims.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">Queue is Clear</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  {statusFilter === "pending"
                    ? "There are currently no pending ownership claims awaiting review."
                    : `No ${statusFilter} claims found.`}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredClaims.map((claim) => {
                  const claimId = claim._id || (claim as unknown as { id: string }).id;
                  const item =
                    typeof claim.itemId === "object" && claim.itemId
                      ? (claim.itemId as StoredItemReport)
                      : null;
                  const claimant =
                    typeof claim.claimantId === "object" && claim.claimantId
                      ? (claim.claimantId as UserProfile)
                      : null;

                  return (
                    <div
                      key={claimId}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                    >
                      {/* Claim Header Bar */}
                      <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                              claim.status === "approved"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : claim.status === "rejected"
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {claim.status === "approved" ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : claim.status === "rejected" ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5" />
                            )}
                            {claim.status}
                          </span>

                          <span className="text-xs text-slate-500 font-mono">
                            Claim #{claimId.slice(-8)}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500">
                          Submitted: {formatDate(claim.createdAt)}
                        </div>
                      </div>

                      {/* Claim Content Grid */}
                      <div className="p-6 space-y-6">
                        {/* Upper Grid: Claimant Profile & Item Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Claimant Profile */}
                          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                              Claimant Profile
                            </span>
                            {claimant ? (
                              <div className="space-y-1.5 text-xs text-slate-700">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-indigo-600" />
                                  <strong className="text-sm text-slate-900">{claimant.name}</strong>
                                </div>
                                <div className="text-slate-600 pl-6">
                                  <div>Email: <span className="font-medium text-slate-800">{claimant.email}</span></div>
                                  {claimant.studentId && (
                                    <div>Student ID: <span className="font-medium text-slate-800">{claimant.studentId}</span></div>
                                  )}
                                  {claimant.phone && (
                                    <div>Phone: <span className="font-medium text-slate-800">{claimant.phone}</span></div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-slate-400 italic">User #{String(claim.claimantId)}</div>
                            )}
                          </div>

                          {/* Item Under Claim */}
                          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                              Recovered Item
                            </span>
                            {item ? (
                              <div className="space-y-1.5 text-xs text-slate-700">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-800">
                                    {item.category}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{getLocationName(item.campusLocation)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{formatDate(item.dateTime)}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-slate-400 italic">Item Report #{String(claim.itemId)}</div>
                            )}
                          </div>
                        </div>

                        {/* Cross-Examination: Side-by-Side Proof Comparison */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <KeyRound className="w-4 h-4 text-indigo-600" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                              Side-by-Side Ownership Verification Cross-Examination
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Left: Finder's Confidential Record */}
                            <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50/40 p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                                  Finder&apos;s Secret Verification Detail
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-200/80 text-emerald-800">
                                  Intake Ground Truth
                                </span>
                              </div>
                              <p className="text-xs text-emerald-950 bg-white/90 p-3 rounded-lg border border-emerald-200/80 leading-relaxed font-mono">
                                {item?.secretVerificationDetail || (
                                  <span className="italic text-slate-400">
                                    No secret detail was recorded at intake. Review physical proof below.
                                  </span>
                                )}
                              </p>
                              <span className="text-[10px] text-emerald-700 block">
                                Confidential: Hidden from public feed. Visible only to authorized administrators.
                              </span>
                            </div>

                            {/* Right: Claimant's Secret Answer */}
                            <div className="rounded-xl border-2 border-indigo-300 bg-indigo-50/40 p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                                  <KeyRound className="w-3.5 h-3.5 text-indigo-700" />
                                  Claimant&apos;s Submitted Secret Answer
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-indigo-200/80 text-indigo-800">
                                  Claim Evidence
                                </span>
                              </div>
                              <p className="text-xs text-indigo-950 bg-white/90 p-3 rounded-lg border border-indigo-200/80 leading-relaxed font-mono font-medium">
                                {claim.secretVerificationAnswer}
                              </p>
                              <span className="text-[10px] text-indigo-700 block">
                                Answer submitted by claimant when initiating the ownership request.
                              </span>
                            </div>
                          </div>

                          {/* Full Claimant Proof Details */}
                          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                            <span className="text-xs font-bold text-slate-800 block">
                              Claimant&apos;s Unique Marks &amp; Physical Proof Description:
                            </span>
                            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-200">
                              {claim.proofDetails}
                            </p>
                          </div>
                        </div>

                        {/* Admin Decision Bar */}
                        <div className="pt-4 border-t border-slate-200">
                          {claim.status === "pending" ? (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-amber-50/40 p-4 rounded-xl border border-amber-200">
                              <div className="text-xs text-slate-700">
                                <strong className="text-slate-900 block mb-0.5">Decision Required</strong>
                                <span>Compare the intake record against the claimant proof to verify ownership.</span>
                              </div>

                              <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                  type="button"
                                  onClick={() => openActionModal(claim, "reject")}
                                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                                >
                                  <X className="w-4 h-4 text-rose-600" />
                                  Reject Claim
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openActionModal(claim, "approve")}
                                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                  <Check className="w-4 h-4 text-white" />
                                  Approve Ownership
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Already Reviewed */
                            <div
                              className={`p-4 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                                claim.status === "approved"
                                  ? "bg-emerald-50/60 border border-emerald-200 text-emerald-950"
                                  : "bg-rose-50/60 border border-rose-200 text-rose-950"
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="font-bold flex items-center gap-1.5">
                                  {claim.status === "approved" ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-rose-600" />
                                  )}
                                  <span>
                                    Resolved as {claim.status.toUpperCase()} by Campus Staff
                                  </span>
                                </div>
                                {claim.reviewNotes && (
                                  <p className="italic text-slate-700 pl-5">
                                    Notes: &ldquo;{claim.reviewNotes}&rdquo;
                                  </p>
                                )}
                              </div>

                              <div className="text-[11px] text-slate-500 shrink-0">
                                Reviewed on {formatDate(claim.reviewedAt)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Confirmation & Review Notes Modal */}
      {selectedClaim && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                {actionType === "approve" ? (
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                )}
                <h3 className="text-lg font-bold text-slate-900">
                  {actionType === "approve" ? "Approve Ownership Claim" : "Reject Ownership Claim"}
                </h3>
              </div>
              <button
                onClick={closeActionModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <p className="text-xs text-slate-600 leading-relaxed">
              {actionType === "approve" ? (
                <>
                  Approving this claim verifies that the claimant is the legitimate owner. The item status will automatically update to <strong>claimed</strong>, and any conflicting claims for this item will be safely rejected.
                </>
              ) : (
                <>
                  Rejecting this claim will keep the item in the active database so other potential claimants can submit verification proof.
                </>
              )}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Staff Review Notes &amp; Instructions <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Enter pickup details, desk hours, or rejection reason..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                These notes will be visible to the student in their &ldquo;My Claims&rdquo; dashboard.
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeActionModal}
                disabled={isSubmittingAction}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isSubmittingAction || !actionNotes.trim()}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition flex items-center gap-2 disabled:opacity-50 ${
                  actionType === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-200"
                    : "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-rose-200"
                }`}
              >
                {isSubmittingAction ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : actionType === "approve" ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm Approval</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    <span>Confirm Rejection</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal for Quick Login */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="login"
      />

      <Footer />
    </div>
  );
}
