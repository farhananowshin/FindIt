"use client";

import React, { useState } from "react";
import {
  X,
  ShieldAlert,
  Lock,
  FileText,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar,
  MapPin,
  Tag,
} from "lucide-react";
import { StoredItemReport } from "../types/item";
import { submitClaim } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface ClaimModalProps {
  item: StoredItemReport | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimSubmitted?: () => void;
}

export default function ClaimModal({
  item,
  isOpen,
  onClose,
  onClaimSubmitted,
}: ClaimModalProps) {
  const { user, token } = useAuth();
  const [secretAnswer, setSecretAnswer] = useState("");
  const [proofDetails, setProofDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("You must be logged in as a student to file an ownership claim.");
      return;
    }

    if (!secretAnswer.trim() || !proofDetails.trim()) {
      setError("Please fill in both the secret verification answer and proof details.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitClaim(
        {
          itemId: item._id || item.id,
          secretVerificationAnswer: secretAnswer.trim(),
          proofDetails: proofDetails.trim(),
        },
        token
      );

      setIsSuccess(true);
      if (onClaimSubmitted) {
        onClaimSubmitted();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to submit ownership claim.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSecretAnswer("");
    setProofDetails("");
    setError(null);
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Submit Ownership Claim
              </h3>
              <p className="text-xs text-slate-500">
                Human-in-the-Loop Campus Security Verification
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Item Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row gap-4">
            {item.imageUrls && item.imageUrls.length > 0 ? (
              <img
                src={item.imageUrls[0]}
                alt={item.title}
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-slate-200 shrink-0 bg-white"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-indigo-100/50 border border-indigo-200 flex items-center justify-center text-indigo-500 shrink-0">
                <Tag className="w-8 h-8" />
              </div>
            )}
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                Found Item
              </div>
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {item.title}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-2">
                {item.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {item.location?.campusZone || item.campusLocation}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(item.dateTime).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Core Ethics Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-3">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Confidential Ownership Proof</span>
              <p className="text-amber-800 leading-relaxed text-[11px]">
                Your answers and evidence are <strong>strictly confidential</strong> and visible only to campus administrators. Our multimodal AI matching service helps locate candidate pairs, but <strong>never unilaterally confirms ownership</strong>. Physical verification at the campus security desk is required.
              </p>
            </div>
          </div>

          {/* Success Screen */}
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Claim Submitted Successfully!
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Campus security staff have received your private evidence. You can monitor the review outcome under <strong>My Claims</strong> in the navigation bar.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Secret Answer */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                    Secret Verification Answer
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Required</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  Describe confidential details known only to the real owner (e.g., lockscreen wallpaper, passcode hint, engraving, unique scratches, internal contents).
                </p>
                <textarea
                  required
                  rows={3}
                  value={secretAnswer}
                  onChange={(e) => setSecretAnswer(e.target.value)}
                  placeholder="e.g. The wallpaper is a photo of a golden retriever; there is a small blue sticker on the back..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>

              {/* Distinguishing Proof */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    Proof & Ownership Evidence
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Required</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  List any serial numbers, purchase receipt details, dates of purchase, or prior photos you can produce when claiming the item in person.
                </p>
                <textarea
                  required
                  rows={3}
                  value={proofDetails}
                  onChange={(e) => setProofDetails(e.target.value)}
                  placeholder="e.g. Serial #C02D1234MD6R; purchased from campus bookstore on Sept 15 with receipt available..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>

              {/* Claimant info preview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Claimant</span>
                  <span className="font-bold text-slate-800">{user?.name}</span> ({user?.studentId || user?.email})
                </div>
                <span className="text-[11px] text-indigo-600 font-medium">Logged in Student</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-100 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting Claim...</span>
                    </>
                  ) : (
                    "Submit Ownership Claim"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
