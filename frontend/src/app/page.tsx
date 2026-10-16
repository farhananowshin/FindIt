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
  Search,
  Sparkles,
  LayoutGrid,
  PlusCircle,
  Shield,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Lock,
  Cpu,
  TrendingUp,
  X,
  Compass,
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

  // Hero search bar state matching clean layout
  const [searchTab, setSearchTab] = useState<"lost" | "found">("lost");
  const [searchCategory, setSearchCategory] = useState<string>("all");
  const [searchLocation, setSearchLocation] = useState<string>("");

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
    setActiveTab("feed");
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const scrollToSection = (id: string) => {
    if (id === "report-form") {
      setActiveTab("report");
    } else if (id === "recent-items" || id === "map-view") {
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab("feed");
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
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

      {/* Cinematic Animated Hero Section with Authentic Sylhet Skyline Backdrop */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-800/80">
        {/* Real Sylhet Cityscape Skyline with Dark Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/sylhet_city_hero.jpg"
            alt="Sylhet Keane Bridge Cityscape"
            className="w-full h-full object-cover object-center opacity-40 transform scale-100 motion-safe:animate-pulse-glow"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/85" />
          <div className="absolute inset-0 bg-radial from-transparent via-slate-950/50 to-slate-950" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Clean Title, Tagline, Unified Search Bar (7 Cols) */}
            <div className="lg:col-span-7 text-left space-y-6">
              {/* Green Dot Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Lost &amp; Found platform for Sylhet</span>
              </div>

              {/* Bold Minimalist Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
                Lost something in <br />
                Sylhet?{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300">
                  Let AI help you
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
                  find it.
                </span>
              </h1>

              {/* Clear English Description + Minimal Bengali Tagline */}
              <div className="space-y-2 max-w-xl">
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  Report lost or found belongings and let FindIt compare photos, descriptions,
                  location and time to rank the most likely matches, with a clear explanation for each.
                </p>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">
                  হারানো জিনিস খুঁজুন, প্রমাণসহ ফিরে পান।
                </p>
              </div>

              {/* Clean Unified Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="p-2 bg-white rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 text-slate-900 border border-slate-200"
              >
                {/* Lost / Found Toggle inside Search Bar */}
                <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setSearchTab("lost")}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition ${
                      searchTab === "lost"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Lost
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchTab("found")}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition ${
                      searchTab === "found"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Found
                  </button>
                </div>

                {/* Categories Dropdown */}
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full sm:w-auto bg-transparent px-3 py-2 text-xs font-semibold text-slate-700 border-b sm:border-b-0 sm:border-r border-slate-200 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All categories</option>
                  <option value="bags_wallets">Bags &amp; Wallets</option>
                  <option value="electronics">Electronics (Phones, Laptops)</option>
                  <option value="id_cards">Student IDs / Cards</option>
                  <option value="keys">Keys</option>
                  <option value="books_notes">Books &amp; Stationary</option>
                  <option value="clothing">Clothing</option>
                  <option value="other">Other Items</option>
                </select>

                {/* Location / Keyword Input */}
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Location, e.g. Zindabazar, SUST, CNG..."
                  className="w-full flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
                />

                {/* Search Button */}
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition shadow-md shadow-indigo-600/30 shrink-0"
                >
                  Search
                </button>
              </form>

              {/* Direct Links: Report a lost item / Report a found item */}
              <div className="flex items-center gap-6 pt-1 text-xs font-bold">
                <button
                  onClick={handleOpenLostReport}
                  className="flex items-center gap-2 text-sky-400 hover:text-sky-300 transition group"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 group-hover:scale-125 transition" />
                  <span>Report a lost item</span>
                </button>

                <button
                  onClick={handleOpenFoundReport}
                  className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition group"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 group-hover:scale-125 transition" />
                  <span>Report a found item</span>
                </button>
              </div>
            </div>

            {/* Right Column: Clean 5-Factor Explainable Multimodal Match Card (5 Cols) */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl p-6 text-left backdrop-blur-xl space-y-4">
                {/* Header: Potential match & 91% Big Score */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Potential match
                  </span>
                  <span className="text-3xl font-black text-amber-400 tracking-tight">
                    91%
                  </span>
                </div>

                {/* Sub-cards comparing Lost vs Found Item */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2.5 h-1 rounded-full bg-sky-400" />
                      <span className="text-[10px] uppercase font-bold text-slate-400">Lost</span>
                    </div>
                    <p className="font-bold text-white text-xs truncate">Black wallet, Zindabazar</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2.5 h-1 rounded-full bg-amber-400" />
                      <span className="text-[10px] uppercase font-bold text-slate-400">Found</span>
                    </div>
                    <p className="font-bold text-white text-xs truncate">Black leather wallet</p>
                  </div>
                </div>

                {/* 5-Weight Multimodal Similarity Bars */}
                <div className="space-y-3 pt-2 text-xs">
                  {/* 1. Image similarity */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Image similarity</span>
                      <span className="font-bold text-sky-400">94%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full" style={{ width: "94%" }} />
                    </div>
                  </div>

                  {/* 2. Text similarity */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Text similarity</span>
                      <span className="font-bold text-indigo-400">89%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: "89%" }} />
                    </div>
                  </div>

                  {/* 3. Location */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Location</span>
                      <span className="font-bold text-sky-400">96%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full" style={{ width: "96%" }} />
                    </div>
                  </div>

                  {/* 4. Time */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Time</span>
                      <span className="font-bold text-sky-400">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>

                  {/* 5. Attributes */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Attributes</span>
                      <span className="font-bold text-cyan-400">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                </div>

                {/* Subtext footnote */}
                <p className="text-[10px] text-slate-500 pt-1 text-center">
                  Sample illustration of the explainable match score.
                </p>
              </div>
            </div>
          </div>

          {/* 4 Clean Feature Pillars */}
          <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white">Multimodal AI</h3>
              <p className="text-xs text-slate-400 mt-1">Image + text matching</p>
            </div>

            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white">Explainable</h3>
              <p className="text-xs text-slate-400 mt-1">Score for every match</p>
            </div>

            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white">Private</h3>
              <p className="text-xs text-slate-400 mt-1">Ownership verification</p>
            </div>

            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white">Reviewed</h3>
              <p className="text-xs text-slate-400 mt-1">Admin-approved claims</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main ref={contentRef} className="flex-1 py-10 sm:py-14 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Section Navigation Tabs */}
          <div className="flex items-center justify-center">
            <div className="inline-flex p-1.5 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl gap-2 text-xs font-bold text-slate-300">
              <button
                onClick={() => setActiveTab("feed")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition duration-200 ${
                  activeTab === "feed"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40"
                    : "hover:text-white hover:bg-slate-800"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Browse Items &amp; Map</span>
                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-indigo-950 text-[10px] text-indigo-300 font-extrabold border border-indigo-500/40">
                  {items.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("report")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition duration-200 ${
                  activeTab === "report"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40"
                    : "hover:text-white hover:bg-slate-800"
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Report an Item</span>
              </button>

              <button
                onClick={() => setActiveTab("admin")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition duration-200 ${
                  activeTab === "admin"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40"
                    : "hover:text-white hover:bg-slate-800"
                }`}
              >
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Admin &amp; Verification</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Live Feed and Map */}
          {activeTab === "feed" && (
            <div id="recent-items" className="animate-in fade-in duration-300">
              <RecentItemsList
                items={items}
                isLoading={isLoading}
                error={error}
                onRefresh={handleRefresh}
                isLive={isLive}
                onFindMatches={(item) => setSelectedLostItem(item)}
                onClaimItem={(item) => setClaimItem(item)}
                externalSearch={searchLocation}
                externalCategory={searchCategory}
                externalType={searchTab}
              />
            </div>
          )}

          {/* Tab 2: Item Upload Form */}
          {activeTab === "report" && (
            <div id="report-form" className="animate-in fade-in duration-300 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <div>
                  <h2 className="text-sm font-bold text-white">
                    Submitting a {reportFormType === "lost" ? "Lost" : "Found"} Item Report
                  </h2>
                  <p className="text-xs text-slate-400">
                    Provide clear details and a photo so our Multimodal AI can match it accurately across Sylhet.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("feed")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
                >
                  &larr; Back to Items Feed
                </button>
              </div>

              <div className="bg-white rounded-3xl p-6 text-slate-900 shadow-2xl">
                <ItemUploadForm
                  initialType={reportFormType}
                  onReportCreated={handleReportCreated}
                  onRequireAuth={() => {
                    setAuthModalTab("login");
                    setAuthModalOpen(true);
                  }}
                />
              </div>
            </div>
          )}

          {/* Tab 3: Admin & Verification Preview */}
          {activeTab === "admin" && (
            <div id="admin-preview" className="animate-in fade-in duration-300 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <div>
                  <h2 className="text-sm font-bold text-white">
                    Explainability &amp; Admin Verification Portal
                  </h2>
                  <p className="text-xs text-slate-400">
                    Review incoming claims, inspect multimodal feature attributions, and manage safety oversight.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("feed")}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
                >
                  &larr; Back to Items Feed
                </button>
              </div>

              <div className="bg-white rounded-3xl p-6 text-slate-900 shadow-2xl">
                <AdminPreview />
              </div>
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

      {/* University & City Footer */}
      <Footer onOpenProposal={() => setIsProposalOpen(true)} />
    </div>
  );
}
