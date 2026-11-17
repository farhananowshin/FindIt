"use client";

import React, { useState } from "react";
import { Compass, Shield, Heart, Sparkles, X, Lock, FileText, ArrowUpRight } from "lucide-react";

interface FooterProps {
  onOpenProposal?: () => void;
  onOpenWeights?: () => void;
}

export default function Footer({ onOpenProposal, onOpenWeights }: FooterProps) {
  const [legalModal, setLegalModal] = useState<"privacy" | "terms" | null>(null);

  return (
    <>
      <footer className="w-full border-t border-[#2C342E] bg-transparent text-[#C4CBC5] pt-10 pb-8 mt-auto relative overflow-hidden">
        {/* Subtle Top Ambient Gradient */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#45B58A]/30 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8">

            {/* Branding */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#1C221E] border border-[#313A33] text-[#45B58A] shadow-xs">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-lg font-bold tracking-tight text-[#F3F4EF]">
                  Find<span className="text-[#45B58A]">It</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#1C221E] text-[#C4CBC5] border border-[#313A33]">
                  SYLHET
                </span>
              </div>
              <p className="text-xs text-[#7A837B] leading-relaxed max-w-xs">
                AI-powered lost &amp; found for Sylhet City.
              </p>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#45B58A]">
                <span className="flex h-1.5 w-1.5 rounded-full bg-[#45B58A] animate-pulse" />
                <span>Sylhet Network Active</span>
              </div>
            </div>

            {/* Nav links */}
            <div className="flex flex-wrap gap-x-8 gap-y-5 text-xs">
              {/* Platform */}
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#5A6360]">Platform</h3>
                <ul className="space-y-1.5 text-[#A2ABA4]">
                  <li>
                    <a href="#recent-items" className="hover:text-[#F3F4EF] transition flex items-center gap-1 group">
                      <span>Browse Items</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#45B58A] transition" />
                    </a>
                  </li>
                  <li>
                    <a href="#report-form" className="hover:text-[#F3F4EF] transition flex items-center gap-1 group">
                      <span>Report Lost Item</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#45B58A] transition" />
                    </a>
                  </li>
                  <li>
                    <a href="#report-form" className="hover:text-[#F3F4EF] transition flex items-center gap-1 group">
                      <span>Report Found Item</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#45B58A] transition" />
                    </a>
                  </li>
                  <li>
                    <a href="/map" className="hover:text-[#F3F4EF] transition flex items-center gap-1 group">
                      <span>Interactive Map</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#45B58A] transition" />
                    </a>
                  </li>
                  <li>
                    <a href="/benchmark" className="hover:text-[#45B58A] transition flex items-center gap-1 group text-[#45B58A] font-medium">
                      <span>AI Benchmark</span>
                      <ArrowUpRight className="w-3 h-3 transition" />
                    </a>
                  </li>
                </ul>
              </div>

              {/* AI Tech */}
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#5A6360]">AI Stack</h3>
                <ul className="space-y-1.5 text-[#A2ABA4]">
                  <li>
                    <button type="button" onClick={onOpenWeights} className="hover:text-[#F3F4EF] transition cursor-pointer text-left">
                      OpenCLIP Vision
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={onOpenWeights} className="hover:text-[#F3F4EF] transition cursor-pointer text-left">
                      S-BERT Embeddings
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={onOpenWeights} className="hover:text-[#F3F4EF] transition cursor-pointer text-left">
                      Location Scoring
                    </button>
                  </li>
                  {onOpenProposal && (
                    <li>
                      <button type="button" onClick={onOpenProposal} className="hover:text-[#45B58A] transition cursor-pointer text-left flex items-center gap-1 text-[#45B58A] font-medium">
                        <Sparkles className="w-3 h-3" />
                        System Architecture
                      </button>
                    </li>
                  )}
                </ul>
              </div>

              {/* Developer */}
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#5A6360]">Developer</h3>
                <div className="space-y-1.5 text-[#A2ABA4]">
                  <p className="text-xs font-medium text-[#C4CBC5]">Farhana Nowshin</p>
                  <p className="text-[11px]">CSE, Metropolitan University</p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <a
                      href="https://github.com/farhananowshin"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#F3F4EF] transition"
                    >
                      GitHub
                    </a>
                    <span className="text-[#2C342E]">·</span>
                    <a
                      href="https://www.linkedin.com/in/farhana-nowshin-b36413298/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#F3F4EF] transition"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-5 border-t border-[#1E2520] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#5A6360]">
            <p className="flex items-center gap-1.5">
              &copy; 2026 FindIt &bull; Built with
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline mx-0.5" />
              in Sylhet, Bangladesh.
            </p>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setLegalModal("privacy")}
                className="hover:text-[#A2ABA4] transition cursor-pointer"
              >
                Privacy Policy
              </button>
              <span className="text-[#2C342E]">&bull;</span>
              <button
                type="button"
                onClick={() => setLegalModal("terms")}
                className="hover:text-[#A2ABA4] transition cursor-pointer"
              >
                Terms of Service
              </button>
              <span className="text-[#2C342E]">&bull;</span>
              <span className="inline-flex items-center gap-1 text-[#45B58A]">
                <Shield className="w-3 h-3" />
                Verified Ownership
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Privacy & Terms Modal */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171A18]/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[#252B27] text-[#F3F4EF] rounded-3xl shadow-2xl border border-[#383E39] overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#383E39] bg-[#171A18]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#45B58A]/10 text-[#45B58A] border border-[#45B58A]/20">
                  {legalModal === "privacy" ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>
                <h3 className="text-base font-semibold text-[#F3F4EF]">
                  {legalModal === "privacy" ? "Privacy & Verification Policy" : "Platform Terms of Service"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="p-1.5 rounded-lg text-[#A9B0AA] hover:text-[#F3F4EF] hover:bg-[#383E39] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#A9B0AA] leading-relaxed">
              {legalModal === "privacy" ? (
                <>
                  <div className="p-3 rounded-xl bg-[#171A18] border border-[#383E39] text-[#F3F4EF] font-medium">
                    🛡️ FindIt uses privacy-preserving ownership verification. Sensitive identifying details are never shown to the public.
                  </div>
                  <h4 className="font-semibold text-[#F3F4EF] text-sm">1. Secret Question &amp; Verification Shield</h4>
                  <p>
                    When a found item is submitted, the unique identifying answers (e.g. serial numbers, wallpaper descriptions, private engraving) are stored securely. Claimants must answer these privately without seeing the answer upfront.
                  </p>
                  <h4 className="font-semibold text-[#F3F4EF] text-sm">2. Contact Information Security</h4>
                  <p>
                    Personal phone numbers and student email addresses are masked by default and only disclosed to authenticated administrators or when a claim has been verified and approved.
                  </p>
                  <h4 className="font-semibold text-[#F3F4EF] text-sm">3. Multimodal Vector Processing</h4>
                  <p>
                    Photographs and item descriptions are transformed into mathematical vector embeddings (512-dim visual, 384-dim textual) for similarity computation. No biometric or user surveillance data is collected.
                  </p>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-[#171A18] border border-[#383E39] text-[#F3F4EF] font-medium">
                    🤝 FindIt operates as a trusted community recovery network for citizens and students across Sylhet.
                  </div>
                  <h4 className="font-semibold text-[#F3F4EF] text-sm">1. Community Good Samaritan Guidelines</h4>
                  <p>
                    All items turned in should be treated with care. When finding valuable electronics, wallets, or government identification, submit a report promptly to facilitate swift return.
                  </p>
                  <h4 className="font-semibold text-[#F3F4EF] text-sm">2. Safe Handover Points in Sylhet</h4>
                  <p>
                    All physical item exchanges should take place at official, well-lit public hubs—such as university proctor offices, library reception desks, or verified transit desks in Zindabazar, Amberkhana, and Shibganj.
                  </p>
                  <h4 className="font-semibold text-[#F3F4EF] text-sm">3. Fraud Prevention</h4>
                  <p>
                    Submitting false claims or pretending to own another student&apos;s lost device is strictly prohibited and subject to account suspension and campus disciplinary referral.
                  </p>
                </>
              )}
            </div>

            <div className="p-4 border-t border-[#383E39] bg-[#171A18] flex justify-end">
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="px-4 py-2 rounded-xl bg-[#45B58A] hover:bg-[#3ca37c] text-[#171A18] font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
