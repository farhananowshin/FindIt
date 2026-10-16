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
  CheckCircle2,
  Lock,
  Cpu,
  TrendingUp,
  X,
  Share2,
  Users,
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

  const handleClearSearch = () => {
    setHeroSearch("");
    setHeroCategory("all");
    setFeedTypeFilter("all");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 selection:bg-indigo-500 selection:text-white">
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

      {/* Cinematic Animated Hero Section with Sylhet Skyline Backdrop */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800">
        {/* Background Sylhet Cityscape with Dark Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/sylhet_city_hero.jpg"
            alt="Sylhet City Skyline and Keane Bridge"
            className="w-full h-full object-cover object-center opacity-30 transform scale-105 motion-safe:animate-pulse-glow"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/85 to-slate-950/90" />
          <div className="absolute inset-0 bg-radial from-indigo-500/10 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Headline, Trust Signals & Action Triggers (7 Cols) */}
            <div className="lg:col-span-7 text-left space-y-6">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 backdrop-blur-md shadow-lg shadow-indigo-950/50">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold tracking-wide">FindIt &bull; Sylhet Metropolitan</span>
                <span className="text-indigo-400/50">|</span>
                <span className="text-slate-300 font-medium">Public Lost &amp; Found AI Infrastructure</span>
              </div>

              {/* Bold Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
                Lost Something in <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-rose-400">
                  Sylhet City or Campus?
                </span>
                <br />
                <span className="text-slate-200 text-2xl sm:text-4xl lg:text-4xl font-extrabold">
                  We&apos;ll Help You Find It.
                </span>
              </h1>

              {/* Multimodal Description */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                সিলেট মহানগরীর ১১টি প্রধান জোন (জিন্দাবাজার, আম্বরখানা, কদমতলী, রেলস্টেশন) এবং বিশ্ববিদ্যালয় ক্যাম্পাসে 
                হারানো জিনিস খুঁজে পাওয়ার জন্য তৈরি এআই প্ল্যাটফর্ম। ছবি তুলুন অথবা বিবরণ দিন — আমাদের 
                <strong> Multimodal AI (Vision + Text + GPS)</strong> মুহূর্তেই সঠিক মিল খুঁজে বের করবে।
              </p>

              {/* Primary Dual Action Cards: Lost vs Found */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* I Lost Something Card */}
                <div
                  onClick={handleOpenLostReport}
                  className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900/90 to-slate-900/90 hover:from-rose-900/50 hover:to-slate-800 border border-rose-500/30 hover:border-rose-400/70 shadow-xl shadow-rose-950/20 backdrop-blur-md transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition duration-300">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block">
                        আমি কিছু হারিয়েছি
                      </span>
                      <h2 className="text-lg font-black text-white group-hover:text-rose-300 transition">
                        I Lost Something
                      </h2>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2.5 line-clamp-2">
                    সিএনজি, মার্কেট, ক্যাফে বা ক্যাম্পাসে মানিব্যাগ, ফোন, চাবি, বা আইডি কার্ড হারিয়েছেন? ৬০ সেকেন্ডে রিপোর্ট করুন।
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-extrabold text-rose-400 group-hover:translate-x-1.5 transition">
                    <span>Report Lost Item</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* I Found Something Card */}
                <div
                  onClick={handleOpenFoundReport}
                  className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-900/90 hover:from-emerald-900/50 hover:to-slate-800 border border-emerald-500/30 hover:border-emerald-400/70 shadow-xl shadow-emerald-950/20 backdrop-blur-md transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition duration-300">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                        আমি কিছু পেয়েছি
                      </span>
                      <h2 className="text-lg font-black text-white group-hover:text-emerald-300 transition">
                        I Found Something
                      </h2>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2.5 line-clamp-2">
                    সিলেটের কোথাও কোনো জিনিস পেয়েছেন? একটি ছবি তুলে জমা দিন এবং প্রকৃত মালিককে ফিরিয়ে দিন।
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 group-hover:translate-x-1.5 transition">
                    <span>Report Found Item</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Integrated Hero Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center gap-2 p-1.5 bg-slate-950/80 border border-slate-700/80 rounded-2xl shadow-2xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition backdrop-blur-md"
              >
                <div className="pl-3 text-slate-400">
                  <Search className="w-5 h-5 text-indigo-400" />
                </div>
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Search 42+ items in Sylhet (e.g., 'wallet in CNG', 'navy backpack', 'ID card')..."
                  className="flex-1 bg-transparent px-2 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-hidden"
                />
                {heroSearch && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="p-1 text-slate-400 hover:text-white transition"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition shadow-md shadow-indigo-600/30"
                >
                  Search
                </button>
              </form>

              {/* Fast Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Filter by category:</span>
                {[
                  { id: "all", label: "All Items" },
                  { id: "bags_wallets", label: "👛 Bags & Wallets" },
                  { id: "electronics", label: "📱 Electronics" },
                  { id: "id_cards", label: "🪪 Student IDs / NID" },
                  { id: "keys", label: "🔑 Keys" },
                  { id: "books_notes", label: "📚 Books" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      heroCategory === cat.id
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40 border border-indigo-400"
                        : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: High-End Live Multimodal AI Demonstration Card (5 Cols) */}
            <div className="lg:col-span-5 relative">
              {/* Animated Floating Card */}
              <div className="relative animate-float">
                {/* Backdrop Glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/30 via-violet-500/30 to-rose-500/30 rounded-3xl blur-2xl opacity-75" />

                <div className="relative rounded-3xl bg-slate-900/95 border border-slate-700 shadow-2xl overflow-hidden text-left backdrop-blur-xl">
                  {/* Top Live Bar */}
                  <div className="px-4 py-3 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold tracking-wide text-slate-200">
                        Live Multimodal AI Match Verification
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                      Sylhet Hub
                    </span>
                  </div>

                  {/* Real Photo Demonstration (Leather Wallet on CNG seat) */}
                  <div className="relative h-52 w-full overflow-hidden bg-slate-950 group">
                    <img
                      src="/images/sylhet_cng_wallet.jpg"
                      alt="Black Leather Wallet left in CNG in Sylhet"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-600/90 text-white shadow-md backdrop-blur-sm flex items-center gap-1.5 border border-emerald-400/40">
                      <Sparkles className="w-3.5 h-3.5" /> Found at Amberkhana CNG Stand
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-slate-950/85 backdrop-blur-md text-white text-xs flex items-center justify-between border border-slate-700/60">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="font-semibold truncate text-[11px] text-slate-200">
                          Matched with Lost Report from Zindabazar Center
                        </span>
                      </div>
                      <span className="font-mono text-emerald-400 font-extrabold text-xs shrink-0 ml-2">
                        96.4% Match
                      </span>
                    </div>
                  </div>

                  {/* AI Explanation & Breakdown Bars */}
                  <div className="p-5 space-y-4 bg-slate-900/90">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-extrabold text-sm text-white">
                          Black Leather Bifold Wallet
                        </h3>
                        <p className="text-xs text-slate-400">
                          Cross-modal OpenCLIP visual &amp; S-BERT semantic verification
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        High Confidence
                      </span>
                    </div>

                    {/* AI Feature Weights Demonstration */}
                    <div className="space-y-2 pt-1 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>CLIP Vision Embeddings (ViT-B-32)</span>
                          <span className="font-bold text-indigo-400">98.2% Similarity</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full" style={{ width: "98%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>S-BERT Semantic Text Vectors</span>
                          <span className="font-bold text-violet-400">94.5% Similarity</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full" style={{ width: "94%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Spatiotemporal Proximity (Amberkhana &harr; Zindabazar)</span>
                          <span className="font-bold text-emerald-400">1.2 km &bull; 92.0%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: "92%" }} />
                        </div>
                      </div>
                    </div>

                    {/* Human Verification Notice */}
                    <div className="pt-3 flex items-center justify-between border-t border-slate-800 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        Human Verification Protected
                      </span>
                      <button
                        onClick={() => setActiveTab("feed")}
                        className="font-bold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
                      >
                        Explore Feed &rarr;
                      </button>
                    </div>
                  </div>
                </div>

                {/* Second Floating Badge for Realism */}
                <div className="hidden sm:flex absolute -bottom-5 -left-5 p-3 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl items-center gap-3 text-xs max-w-xs backdrop-blur-xl animate-float-delayed">
                  <img
                    src="/images/sylhet_cafe_backpack.jpg"
                    alt="Backpack"
                    className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-700"
                  />
                  <div className="overflow-hidden">
                    <p className="font-bold text-white text-xs truncate">Navy Student Backpack</p>
                    <p className="text-[11px] text-emerald-400 font-semibold truncate">
                      Surma Riverfront Cafe &bull; Reunited &check;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Trust Feature Cards */}
          <div className="mt-16 pt-10 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 border border-indigo-500/30">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Multimodal AI Matching</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                OpenCLIP ViT-B-32 এবং Sentence Transformers দিয়ে ছবি ও বিবরণ একসাথে বিশ্লেষণ।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/30">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Privacy &amp; Ownership</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                সিক্রেট ভেরিফিকেশন ডিটেইলস সাধারণ মানুষের কাছে গোপন রাখা হয়; শুধু মালিকই ক্লেইম করতে পারে।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3 border border-sky-500/30">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">11 Sylhet City Hubs</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                জিন্দাবাজার, আম্বরখানা, কদমতলী রেলওয়ে স্টেশন এবং সকল শিক্ষা প্রতিষ্ঠান ম্যাপে সংযুক্ত।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3 border border-rose-500/30">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Empirical Validation</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                ৩৫০-জোড়া ক্যাম্পাসের তথ্যের ওপর গ্রিড সার্চ চালিয়ে অপটিমাইজ করা ৫-ফ্যাক্টর ওয়েটেড ফর্মুলা।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area with Modern Tab Control */}
      <main ref={contentRef} className="flex-1 py-10 sm:py-14 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Section Navigation Tabs */}
          <div className="flex items-center justify-center">
            <div className="inline-flex p-1.5 bg-slate-800/90 rounded-2xl border border-slate-700 shadow-xl gap-2 text-xs font-bold text-slate-300">
              <button
                onClick={() => setActiveTab("feed")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition duration-200 ${
                  activeTab === "feed"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40"
                    : "hover:text-white hover:bg-slate-700/50"
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
                    : "hover:text-white hover:bg-slate-700/50"
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
                    : "hover:text-white hover:bg-slate-700/50"
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
                externalSearch={heroSearch}
                externalCategory={heroCategory}
                externalType={feedTypeFilter}
              />
            </div>
          )}

          {/* Tab 2: Item Upload Form */}
          {activeTab === "report" && (
            <div id="report-form" className="animate-in fade-in duration-300 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/80 border border-slate-700 rounded-2xl">
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 transition"
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
              <div className="flex items-center justify-between p-4 bg-slate-800/80 border border-slate-700 rounded-2xl">
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 transition"
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
