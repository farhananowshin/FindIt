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
  MapPin,
  Clock,
  Layers,
  CheckCircle2,
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

      {/* Hero Section: 2-Column Split Modern Hero with Authentic Sylhet Skyline Backdrop */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-14 lg:pb-20 border-b border-slate-800 bg-slate-950">
        {/* Real Sylhet Cityscape Skyline with Dark Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/sylhet_city_hero.jpg"
            alt="Sylhet Keane Bridge Cityscape"
            className="w-full h-full object-cover object-center opacity-45 transform scale-100 animate-sunset-glow"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/80" />
          <div className="absolute inset-0 bg-radial from-transparent via-slate-950/40 to-slate-950" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headline, Actions & Search (7 Cols) */}
            <div className="lg:col-span-7 text-left space-y-5">
              {/* Top Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold tracking-wide">FindIt Sylhet</span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-slate-300 font-medium">AI Lost &amp; Found</span>
              </div>

              {/* Bold, Catchy Animated Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
                Lost something in <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 animate-gradient-text">
                  Sylhet? Let AI find it.
                </span>
              </h1>

              {/* Minimal Clean Subtitle */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
                Report lost or found belongings across Sylhet. Our Multimodal AI compares photos, descriptions, and locations to find matches instantly.
              </p>

              {/* Clean Action Cards: Minimal, Sleek, Uncluttered */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* I Lost Something Card */}
                <div
                  onClick={handleOpenLostReport}
                  className="group cursor-pointer p-4 rounded-2xl bg-slate-900/80 hover:bg-rose-950/30 border border-slate-700/80 hover:border-rose-500/50 shadow-lg backdrop-blur-md transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center group-hover:scale-110 transition">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-white group-hover:text-rose-300 transition">
                        I Lost Something
                      </h2>
                      <span className="text-xs text-slate-400 block">Report your lost item</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition" />
                </div>

                {/* I Found Something Card */}
                <div
                  onClick={handleOpenFoundReport}
                  className="group cursor-pointer p-4 rounded-2xl bg-slate-900/80 hover:bg-emerald-950/30 border border-slate-700/80 hover:border-emerald-500/50 shadow-lg backdrop-blur-md transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-white group-hover:text-emerald-300 transition">
                        I Found Something
                      </h2>
                      <span className="text-xs text-slate-400 block">Return a found item</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Quick Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-xl backdrop-blur-md focus-within:ring-2 focus-within:ring-sky-500 transition"
              >
                <div className="pl-3 text-slate-400">
                  <Search className="w-4 h-4 text-sky-400" />
                </div>
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Search 42+ items in Sylhet (e.g., 'wallet in CNG', 'backpack', 'ID card')..."
                  className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition shadow-md shadow-indigo-600/30"
                >
                  Search
                </button>
              </form>

              {/* Quick Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick Filter:</span>
                {[
                  { id: "all", label: "All Items" },
                  { id: "bags_wallets", label: "👛 Bags & Wallets" },
                  { id: "electronics", label: "📱 Electronics" },
                  { id: "id_cards", label: "🪪 Student IDs" },
                  { id: "keys", label: "🔑 Keys" },
                  { id: "books_notes", label: "📚 Books" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      heroCategory === cat.id
                        ? "bg-sky-500 text-white shadow-sm"
                        : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Visual AI Showcase Card (5 Cols) */}
            <div className="lg:col-span-5 relative">
              {/* Glow backdrop */}
              <div className="absolute -inset-2 bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-rose-500/20 rounded-3xl blur-xl" />

              <div className="relative rounded-3xl bg-slate-900/95 border border-slate-700 shadow-2xl overflow-hidden text-left backdrop-blur-xl animate-subtle-float">
                {/* Showcase Header */}
                <div className="px-4 py-3 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold tracking-wide">Live AI Match Demonstration</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                    Sylhet Hub
                  </span>
                </div>

                {/* Real Photo Preview */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950 group">
                  <img
                    src="/images/sylhet_cng_wallet.jpg"
                    alt="Leather wallet left in CNG in Sylhet"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-600 text-white shadow-md flex items-center gap-1 border border-emerald-400/30">
                    <Sparkles className="w-3 h-3" /> Found in Sylhet
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2 rounded-xl bg-slate-950/85 backdrop-blur-md text-white text-xs flex items-center justify-between border border-slate-700/60">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="font-semibold truncate text-[11px] text-slate-200">Amberkhana CNG Stand</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-extrabold text-xs shrink-0">96.4% Match</span>
                  </div>
                </div>

                {/* Match Details & Feature Attribution */}
                <div className="p-4 space-y-3 bg-slate-900/90">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-black text-sm text-white">Black Leather Bifold Wallet</h2>
                      <p className="text-xs text-slate-400">Paired with Lost Report from Zindabazar Center</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      High Confidence
                    </span>
                  </div>

                  {/* AI Feature Weights */}
                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>CLIP Vision Similarity</span>
                      <span className="font-bold text-sky-400">98.2%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full" style={{ width: "98%" }} />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>S-BERT Semantic Text</span>
                      <span className="font-bold text-indigo-400">94.5%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: "94%" }} />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      Human Verification Gate
                    </span>
                    <button
                      onClick={() => setActiveTab("feed")}
                      className="font-bold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-0.5"
                    >
                      Browse Feed &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating secondary badge */}
              <div className="hidden sm:flex absolute -bottom-3 -left-4 p-2 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-xl items-center gap-2.5 text-xs max-w-xs backdrop-blur-md">
                <img
                  src="/images/sylhet_cafe_backpack.jpg"
                  alt="Backpack"
                  className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-700"
                />
                <div className="overflow-hidden">
                  <p className="font-bold text-white text-[11px] truncate">Navy Student Backpack</p>
                  <p className="text-[10px] text-emerald-400 font-semibold truncate">Surma River Cafe &bull; Claimed &check;</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3-Step "How FindIt Works" Visual Ribbon */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                  1
                </span>
                <h3 className="text-xs font-bold text-white">Report in 60s</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Take a photo or describe the item with Sylhet location (CNG, cafe, campus, station).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 font-bold text-xs flex items-center justify-center border border-violet-500/30">
                  2
                </span>
                <h3 className="text-xs font-bold text-white">Multimodal AI Match</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                OpenCLIP vision vectors &amp; S-BERT semantic embeddings pair lost &amp; found items instantly.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                  3
                </span>
                <h3 className="text-xs font-bold text-white">Verify &amp; Safely Claim</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Secret verification questions (wallpaper, marks) confirm true ownership before return.
              </p>
            </div>
          </div>

          {/* Academic Supervisor & Specs Drawer */}
          <div className="mt-6 pt-3 border-t border-slate-200/50 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500">
            <div className="text-center sm:text-left">
              <p className="font-semibold text-slate-700 text-xs">
                Metropolitan University &bull; Dept. of CSE (Project CSE 300)
              </p>
              <p className="text-[11px] text-slate-400">
                Supervisor: Md Shamihul Islam Khan Limon &bull; Team: Farhana Nowshin &amp; Adrita Chakraborty
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsProposalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Project Specs &amp; Proposal
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
      <main ref={contentRef} className="flex-1 py-8 sm:py-10">
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
      <Footer onOpenProposal={() => setIsProposalOpen(true)} />
    </div>
  );
}
