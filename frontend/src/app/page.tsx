"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import ItemUploadForm from "../components/ItemUploadForm";
import RecentItemsList from "../components/RecentItemsList";
import AdminPreview from "../components/AdminPreview";
import WeightsModal from "../components/WeightsModal";
import MatchesModal from "../components/MatchesModal";
import AuthModal from "../components/AuthModal";
import ClaimModal from "../components/ClaimModal";
import Footer from "../components/Footer";
import { SAMPLE_CAMPUS_ITEMS } from "../data/sampleItems";
import { StoredItemReport } from "../types/item";
import { fetchItems } from "../services/api";
import { Sliders } from "lucide-react";

export default function Home() {
  const [items, setItems] = useState<StoredItemReport[]>(SAMPLE_CAMPUS_ITEMS);
  const [isWeightsOpen, setIsWeightsOpen] = useState(false);
  const [selectedLostItem, setSelectedLostItem] = useState<StoredItemReport | null>(null);
  const [claimItem, setClaimItem] = useState<StoredItemReport | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dbItems = await fetchItems();
      if (dbItems && dbItems.length > 0) {
        setItems(dbItems);
      }
      setIsLive(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to connect to backend server.";
      setError(message);
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    let ignore = false;
    fetchItems()
      .then((dbItems) => {
        if (!ignore) {
          if (dbItems && dbItems.length > 0) {
            setItems(dbItems);
          }
          setIsLive(true);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const message =
            err instanceof Error ? err.message : "Failed to connect to backend server.";
          setError(message);
          setIsLive(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleReportCreated = (newReport: StoredItemReport) => {
    setItems((prev) => [newReport, ...prev]);
    setIsLive(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navigation Header */}
      <Navbar
        onOpenWeights={() => setIsWeightsOpen(true)}
        onNavigateSection={scrollToSection}
        onOpenAuth={(tab) => {
          setAuthModalTab(tab);
          setAuthModalOpen(true);
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200/80 bg-gradient-to-b from-white via-indigo-50/30 to-slate-50">
        {/* Subtle decorative circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-200/25 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-indigo-700 shadow-sm border border-indigo-100 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>Next-Generation Multimodal AI Lost & Found</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Recover What&apos;s Lost. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-rose-500">
              Connect What&apos;s Found.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            FindIt connects lost and found reports across Sylhet city, transit hubs (CNG &amp; Bus), and university campuses using explainable multimodal AI. By evaluating images (CLIP), semantic descriptions (Sentence Transformers), location, time, and physical attributes, we help items get returned quickly and securely.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => scrollToSection("report-form")}
              className="w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
            >
              Report Lost or Found Item
            </button>
            <button
              onClick={() => setIsWeightsOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition flex items-center justify-center gap-2"
            >
              <Sliders className="w-4 h-4 text-indigo-500" />
              View 5-Weight AI Formula
            </button>
          </div>

          {/* Core Metrics Banner */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-left">
              <span className="text-xs text-slate-500 font-medium block">Vision Similarity</span>
              <p className="text-xl sm:text-2xl font-black text-indigo-600 mt-1">40% Weight</p>
              <span className="text-[11px] text-slate-500">OpenCLIP ViT-B/32</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-left">
              <span className="text-xs text-slate-500 font-medium block">Semantic Text</span>
              <p className="text-xl sm:text-2xl font-black text-blue-600 mt-1">25% Weight</p>
              <span className="text-[11px] text-slate-500">S-BERT Dense Vectors</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-left">
              <span className="text-xs text-slate-500 font-medium block">Spatiotemporal</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">25% Total</p>
              <span className="text-[11px] text-slate-500">15% Loc + 10% Time</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-left">
              <span className="text-xs text-slate-500 font-medium block">Safety Oversight</span>
              <p className="text-xl sm:text-2xl font-black text-purple-600 mt-1">100% Human</p>
              <span className="text-[11px] text-slate-500">Admin Verification Gate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Section 1: Item Upload Form (Connected to POST /api/items) */}
          <ItemUploadForm
            onReportCreated={handleReportCreated}
            onRequireAuth={() => {
              setAuthModalTab("login");
              setAuthModalOpen(true);
            }}
          />

          {/* Section 2: Recent Campus Items Feed (Connected to GET /api/items) */}
          <RecentItemsList
            items={items}
            isLoading={isLoading}
            error={error}
            onRefresh={handleRefresh}
            isLive={isLive}
            onFindMatches={(item) => setSelectedLostItem(item)}
            onClaimItem={(item) => setClaimItem(item)}
          />

          {/* Section 3: Explainability & Admin Verification Preview */}
          <AdminPreview />
        </div>
      </main>

      {/* Weights and Formulation Modal */}
      <WeightsModal
        isOpen={isWeightsOpen}
        onClose={() => setIsWeightsOpen(false)}
      />

      {/* Day 3 Explainable Multimodal Matches Modal */}
      <MatchesModal
        lostItem={selectedLostItem}
        isOpen={Boolean(selectedLostItem)}
        onClose={() => setSelectedLostItem(null)}
      />

      {/* Day 4 User Authentication Modal (Login / Register) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />

      {/* Day 4 Confidential Ownership Claim Modal */}
      <ClaimModal
        item={claimItem}
        isOpen={Boolean(claimItem)}
        onClose={() => setClaimItem(null)}
        onClaimSubmitted={() => {
          handleRefresh();
        }}
      />

      {/* University Footer */}
      <Footer />
    </div>
  );
}
