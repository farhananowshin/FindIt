"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "../components/Navbar";
import ItemUploadForm from "../components/ItemUploadForm";
import RecentItemsList from "../components/RecentItemsList";
import AdminPreview from "../components/AdminPreview";
import WeightsModal from "../components/WeightsModal";
import MatchesModal from "../components/MatchesModal";
import AuthModal from "../components/AuthModal";
import ClaimModal from "../components/ClaimModal";
import ProposalModal from "../components/ProposalModal";
import Footer from "../components/Footer";
import { SAMPLE_CAMPUS_ITEMS } from "../data/sampleItems";
import { StoredItemReport, ReportType } from "../types/item";
import { fetchItems } from "../services/api";
import {
  Sliders,
  FileText,
  Search,
  Sparkles,
  HelpCircle,
  LayoutGrid,
  PlusCircle,
  Shield,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const [items, setItems] = useState<StoredItemReport[]>(SAMPLE_CAMPUS_ITEMS);
  const [isWeightsOpen, setIsWeightsOpen] = useState(false);
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [selectedLostItem, setSelectedLostItem] = useState<StoredItemReport | null>(null);
  const [claimItem, setClaimItem] = useState<StoredItemReport | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  // Active view tab: "feed" (items & map) | "report" (upload form) | "admin" (preview)
  const [activeTab, setActiveTab] = useState<"feed" | "report" | "admin">("feed");
  const [reportFormType, setReportFormType] = useState<ReportType>("lost");

  // Hero search and category filter sync with feed
  const [heroSearch, setHeroSearch] = useState("");
  const [heroCategory, setHeroCategory] = useState("all");
  const [feedTypeFilter, setFeedTypeFilter] = useState<"all" | "lost" | "found">("all");

  const contentRef = useRef<HTMLDivElement>(null);

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
    // Switch to feed so user immediately sees their report!
    setActiveTab("feed");
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const scrollToSection = (id: string) => {
    if (id === "report-form") {
      setActiveTab("report");
    } else if (id === "recent-items") {
      setActiveTab("feed");
    } else if (id === "admin-preview") {
      setActiveTab("admin");
    }
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        contentRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }, 80);
  };

  const handleOpenLostReport = () => {
    setReportFormType("lost");
    setActiveTab("report");
    setTimeout(() => {
      document.getElementById("report-form")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleOpenFoundReport = () => {
    setReportFormType("found");
    setActiveTab("report");
    setTimeout(() => {
      document.getElementById("report-form")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleCategoryClick = (cat: string) => {
    setHeroCategory(cat);
    setActiveTab("feed");
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab("feed");
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        onOpenWeights={() => setIsWeightsOpen(true)}
        onOpenProposal={() => setIsProposalOpen(true)}
        onNavigateSection={scrollToSection}
        onOpenAuth={(tab) => {
          setAuthModalTab(tab);
          setAuthModalOpen(true);
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-14 lg:pt-14 lg:pb-18 border-b border-slate-200/80 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[320px] bg-indigo-200/25 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Slogan Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-indigo-700 shadow-xs border border-indigo-100 mb-5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold tracking-wide">&ldquo;Lost it? FindIt.&rdquo;</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium">Sylhet Metropolitan &amp; Campus AI Platform</span>
          </div>

          {/* Catchy, Human-Friendly Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Lost Something in Sylhet? <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-rose-500">
              We&apos;ll Help You Find It.
            </span>
          </h1>

          {/* Friendly Bengali & English Description */}
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            সিলেট শহর ও ক্যাম্পাসে হারানো বা পাওয়া যেকোনো জিনিস সহজে খুঁজে পাওয়ার এআই প্ল্যাটফর্ম। 
            ছবি তুলুন অথবা বিবরণ দিন — আমাদের Multimodal AI নিমেষেই সঠিক আইটেম ম্যাচ করে দেবে।
          </p>

          {/* Dual Action Cards: I Lost Something vs I Found Something */}
          <div className="mt-8 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Lost Something */}
            <div
              onClick={handleOpenLostReport}
              className="group cursor-pointer p-5 rounded-2xl bg-white hover:bg-rose-50/40 border-2 border-rose-100 hover:border-rose-300 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-105 transition">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    আমি কিছু হারিয়েছি
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-rose-700 transition">
                  I Lost Something
                </h2>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  মানিব্যাগ, ফোন, চাবি, ব্যাকপ্যাক কিংবা আইডি কার্ড হারিয়েছেন? ৬০ সেকেন্ডে রিপোর্ট করুন।
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-rose-600 group-hover:translate-x-0.5 transition">
                <span>Report Lost Item</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 2: Found Something */}
            <div
              onClick={handleOpenFoundReport}
              className="group cursor-pointer p-5 rounded-2xl bg-white hover:bg-emerald-50/40 border-2 border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    আমি কিছু পেয়েছি
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition">
                  I Found Something
                </h2>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  সিলেটের সিএনজি, ক্যাফে, রাস্তা বা ক্যাম্পাসে কোনো জিনিস পেয়েছেন? মালিকের কাছে ফিরিয়ে দিন।
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition">
                <span>Report Found Item</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Quick Search Bar in Hero */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-6 max-w-2xl mx-auto flex items-center gap-2 p-1.5 bg-white border border-slate-300 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition"
          >
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              placeholder="Search items in Sylhet (e.g., 'wallet in CNG', 'blue backpack', 'student ID')..."
              className="flex-1 bg-transparent px-2 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition"
            >
              Search
            </button>
          </form>

          {/* Quick Category Chips */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-600">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick Filter:</span>
            {[
              { id: "all", label: "All Items" },
              { id: "bags_wallets", label: "👛 Bags & Wallets" },
              { id: "electronics", label: "📱 Electronics" },
              { id: "id_cards", label: "🪪 Student IDs / NID" },
              { id: "keys", label: "🔑 Keys" },
              { id: "books_notes", label: "📚 Books & Notes" },
              { id: "bottles_accessories", label: "🍼 Bottles" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                  heroCategory === cat.id
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 3-Step "How FindIt Works" Visual Ribbon */}
          <div className="mt-10 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="p-4 rounded-xl bg-white/80 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="text-xs font-bold text-slate-900">Report in 60s</h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Take a photo or describe the item with Sylhet location (CNG, cafe, library, bus station).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/80 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="text-xs font-bold text-slate-900">Multimodal AI Match</h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                OpenCLIP vision vectors &amp; S-BERT semantic embeddings pair lost &amp; found items instantly.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/80 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <h3 className="text-xs font-bold text-slate-900">Verify &amp; Safely Claim</h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Secret verification questions (wallpaper, marks) confirm true ownership before return.
              </p>
            </div>
          </div>

          {/* Academic Supervisor & Proposal Access Bar */}
          <div className="mt-8 pt-4 border-t border-slate-200/60 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="text-center sm:text-left">
              <p className="font-semibold text-slate-700">
                Metropolitan University &bull; CSE 300 Project
              </p>
              <p className="text-[11px] text-slate-400">
                Supervisor: Md Shamihul Islam Khan Limon &bull; Team: Farhana &amp; Adrita
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsProposalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
              >
                <FileText className="w-3.5 h-3.5" />
                Proposal Checklist (10/10)
              </button>
              <button
                onClick={() => setIsWeightsOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                AI Weights
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area with Modern Tab Control */}
      <main ref={contentRef} className="flex-1 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Section Navigation Tabs */}
          <div className="flex items-center justify-center">
            <div className="inline-flex p-1.5 bg-slate-200/80 rounded-2xl shadow-inner gap-1.5 text-xs font-bold text-slate-600">
              <button
                onClick={() => setActiveTab("feed")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition ${
                  activeTab === "feed"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-indigo-600" />
                <span>Browse Items &amp; Map</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-50 text-[10px] text-indigo-600 font-extrabold border border-indigo-100">
                  {items.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("report")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition ${
                  activeTab === "report"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Report an Item</span>
              </button>

              <button
                onClick={() => setActiveTab("admin")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition ${
                  activeTab === "admin"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Admin &amp; Verification</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Live Feed and Map */}
          {activeTab === "feed" && (
            <div id="recent-items" className="animate-in fade-in duration-200">
              <RecentItemsList
                items={items}
                isLoading={isLoading}
                error={error}
                onRefresh={handleRefresh}
                isLive={isLive}
                onFindMatches={(item) => setSelectedLostItem(item)}
                onClaimItem={(item) => setClaimItem(item)}
                externalSearch={heroSearch}
                externalCategory={heroCategory}
                externalType={feedTypeFilter}
              />
            </div>
          )}

          {/* Tab 2: Item Upload Form */}
          {activeTab === "report" && (
            <div id="report-form" className="animate-in fade-in duration-200 space-y-4">
              <div className="flex items-center justify-between p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
                <div>
                  <h2 className="text-sm font-bold text-indigo-900">
                    Submitting a {reportFormType === "lost" ? "Lost" : "Found"} Item Report
                  </h2>
                  <p className="text-xs text-indigo-700">
                    Provide clear details and a photo so our Multimodal AI can match it accurately.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("feed")}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition"
                >
                  &larr; Back to Items Feed
                </button>
              </div>

              <ItemUploadForm
                initialType={reportFormType}
                onReportCreated={handleReportCreated}
                onRequireAuth={() => {
                  setAuthModalTab("login");
                  setAuthModalOpen(true);
                }}
              />
            </div>
          )}

          {/* Tab 3: Admin & Verification Preview */}
          {activeTab === "admin" && (
            <div id="admin-preview" className="animate-in fade-in duration-200 space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50/70 border border-purple-100 rounded-2xl">
                <div>
                  <h2 className="text-sm font-bold text-purple-900">
                    Explainability &amp; Admin Verification Portal
                  </h2>
                  <p className="text-xs text-purple-700">
                    Review incoming claims, inspect multimodal feature attributions, and manage safety oversight.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("feed")}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition"
                >
                  &larr; Back to Items Feed
                </button>
              </div>

              <AdminPreview />
            </div>
          )}
        </div>
      </main>

      {/* Weights and Formulation Modal */}
      <WeightsModal
        isOpen={isWeightsOpen}
        onClose={() => setIsWeightsOpen(false)}
      />

      {/* Project Proposal & Features Modal */}
      <ProposalModal
        isOpen={isProposalOpen}
        onClose={() => setIsProposalOpen(false)}
      />

      {/* Explainable Multimodal Matches Modal */}
      <MatchesModal
        lostItem={selectedLostItem}
        isOpen={Boolean(selectedLostItem)}
        onClose={() => setSelectedLostItem(null)}
      />

      {/* User Authentication Modal (Login / Register) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />

      {/* Confidential Ownership Claim Modal */}
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
