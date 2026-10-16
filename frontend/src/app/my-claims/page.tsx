"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Lock,
  MapPin,
  Calendar,
  RefreshCw,
  Tag,
  ArrowLeft,
  ShieldCheck,
  Info,
  UserCheck,
  LogIn,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AuthModal from "../../components/AuthModal";
import { useAuth } from "../../context/AuthContext";
import { fetchMyClaims } from "../../services/api";
import { Claim, StoredItemReport, CAMPUS_LOCATIONS } from "../../types/item";

export default function MyClaimsPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  const loadClaims = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMyClaims(token);
      setClaims(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load your ownership claims. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading) {
      if (token) {
        loadClaims();
      } else {
        setIsLoading(false);
      }
    }
  }, [authLoading, token, loadClaims]);

  const getLocationName = (locId: string) => {
    return CAMPUS_LOCATIONS.find((l) => l.id === locId)?.name || locId;
  };

  const formatDate = (dateStr: string) => {
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        onOpenAuth={(tab) => {
          setAuthModalTab(tab);
          setAuthModalOpen(true);
        }}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campus Feed
          </Link>

          {user && (
            <button
              onClick={loadClaims}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          )}
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-violet-100 text-violet-700 rounded-2xl shrink-0">
                <ClipboardList className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  My Ownership Claims
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Track the status of items you have claimed. All claims undergo mandatory human-in-the-loop review by campus administrators.
                </p>
              </div>
            </div>

            {user && (
              <div className="self-start sm:self-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 block">Logged in as</span>
                <span className="font-bold text-slate-900">{user.name}</span>
                <span className="text-slate-500 block text-[11px]">{user.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content States */}
        {authLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Verifying campus session...</p>
          </div>
        ) : !user ? (
          /* Unauthenticated State */
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-xs">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Student Authentication Required</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
              Please log in or register with your student account to view and manage your filed ownership claims.
            </p>
            <button
              onClick={() => {
                setAuthModalTab("login");
                setAuthModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition"
            >
              <LogIn className="w-4 h-4" />
              Log In to FindIt
            </button>
          </div>
        ) : error ? (
          /* Error State */
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Error loading claims:</span>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        ) : isLoading ? (
          /* Loading Claims */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Loading your ownership claims...</p>
          </div>
        ) : claims.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Claims Submitted Yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              You haven&apos;t filed any ownership claims yet. If you see a found item that belongs to you on campus, submit a claim with your confidential verification proof.
            </p>
            <Link
              href="/#recent-items"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition"
            >
              Browse Campus Found Items
            </Link>
          </div>
        ) : (
          /* Claims List */
          <div className="space-y-6">
            {claims.map((claim) => {
              const claimId = claim._id || (claim as unknown as { id: string }).id;
              const item =
                typeof claim.itemId === "object" && claim.itemId
                  ? (claim.itemId as StoredItemReport)
                  : null;
              return (
                <div
                  key={claimId}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition hover:shadow-md"
                >
                  {/* Claim Status Header Bar */}
                  <div
                    className={`px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 ${
                      claim.status === "approved"
                        ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                        : claim.status === "rejected"
                        ? "bg-rose-50/80 border-rose-200 text-rose-900"
                        : "bg-amber-50/80 border-amber-200 text-amber-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {claim.status === "approved" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : claim.status === "rejected" ? (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                      )}
                      <span className="font-bold text-sm tracking-wide capitalize">
                        Claim Status: {claim.status}
                      </span>
                    </div>

                    <div className="text-xs font-medium">
                      <span>Submitted: {formatDate(claim.createdAt)}</span>
                    </div>
                  </div>

                  {/* Claim Details Body */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Left: Item Information */}
                      <div className="md:col-span-1 space-y-3 pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-slate-200 md:pr-6">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Target Item
                        </span>
                        {item ? (
                          <>
                            <h3 className="text-lg font-bold text-slate-900 leading-snug">
                              {item.title}
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                                {item.category}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  item.status === "claimed"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 space-y-1 pt-1">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{getLocationName(item.campusLocation)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{formatDate(item.dateTime)}</span>
                              </div>
                            </div>
                            {item.description && (
                              <p className="text-xs text-slate-500 line-clamp-3 pt-1">
                                {item.description}
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="text-xs text-slate-400 italic">
                            Item report #{typeof claim.itemId === "string" ? claim.itemId : "Linked Report"}
                          </div>
                        )}
                      </div>

                      {/* Middle & Right: Submitted Evidence & Review Outcome */}
                      <div className="md:col-span-2 space-y-5">
                        {/* Submitted Evidence */}
                        <div className="space-y-3">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-indigo-600" />
                            Your Confidential Proof
                          </span>

                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/90 space-y-3">
                            <div>
                              <span className="text-xs font-semibold text-slate-700 block">
                                Secret Verification Answer:
                              </span>
                              <p className="text-sm font-medium text-slate-900 mt-0.5 bg-white p-2.5 rounded-lg border border-slate-200">
                                {claim.secretVerificationAnswer}
                              </p>
                            </div>

                            <div>
                              <span className="text-xs font-semibold text-slate-700 block">
                                Proof / Unique Identifying Details:
                              </span>
                              <p className="text-xs text-slate-700 mt-0.5 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed whitespace-pre-wrap">
                                {claim.proofDetails}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Admin Review Outcome */}
                        {claim.status === "approved" && (
                          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                            <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <span>Ownership Approved — Action Required</span>
                            </div>
                            <p className="text-emerald-900 mt-1 leading-relaxed">
                              Your ownership claim has been verified by the campus administration. Please visit the campus lost & found facility with your university ID to retrieve your item.
                            </p>
                            {claim.reviewNotes && (
                              <div className="mt-2.5 pt-2 border-t border-emerald-200/80">
                                <span className="font-semibold text-emerald-950 block">Administrator Instructions:</span>
                                <p className="mt-0.5 text-emerald-900 italic font-medium">
                                  &ldquo;{claim.reviewNotes}&rdquo;
                                </p>
                              </div>
                            )}
                            {claim.reviewedAt && (
                              <span className="text-[10px] text-emerald-700 block mt-2">
                                Verified on {formatDate(claim.reviewedAt)}
                              </span>
                            )}
                          </div>
                        )}

                        {claim.status === "rejected" && (
                          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                            <div className="flex items-center gap-2 text-rose-800 font-bold mb-1">
                              <XCircle className="w-4 h-4 text-rose-600" />
                              <span>Claim Rejected</span>
                            </div>
                            <p className="text-rose-900 mt-1 leading-relaxed">
                              The submitted verification answers or proof details did not match the physical item records on file.
                            </p>
                            {claim.reviewNotes && (
                              <div className="mt-2.5 pt-2 border-t border-rose-200/80">
                                <span className="font-semibold text-rose-950 block">Reason / Staff Notes:</span>
                                <p className="mt-0.5 text-rose-900 italic font-medium">
                                  &ldquo;{claim.reviewNotes}&rdquo;
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {claim.status === "pending" && (
                          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                            <div className="flex items-center gap-2 text-amber-900 font-bold mb-1">
                              <Info className="w-4 h-4 text-amber-700" />
                              <span>Pending Human Review</span>
                            </div>
                            <p className="text-amber-800 leading-relaxed">
                              Your claim is in the verification queue. A campus administrator will review your secret answer against the finder&apos;s hidden verification details. Multimodal AI never automatically confirms ownership.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />

      <Footer />
    </div>
  );
}
