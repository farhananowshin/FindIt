"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import ItemUploadForm from "../components/ItemUploadForm";
import RecentItemsList from "../components/RecentItemsList";
import AdminPreview from "../components/AdminPreview";
import WeightsModal from "../components/WeightsModal";
import MatchesModal from "../components/MatchesModal";
import AuthModal from "../components/AuthModal";
import ClaimModal from "../components/ClaimModal";
import ProposalModal from "../components/ProposalModal";
import HowItWorksModal from "../components/HowItWorksModal";
import HowItWorksSection from "../components/HowItWorksSection";
import SearchModal from "../components/SearchModal";
import Footer from "../components/Footer";
import { SAMPLE_CAMPUS_ITEMS } from "../data/sampleItems";
import { StoredItemReport, ReportType } from "../types/item";
import { fetchItems } from "../services/api";
import {
  Sparkles,
  ArrowRight,
  MapPin,
  Database,
  Lock,
  ShieldCheck,
  Search,
} from "lucide-react";

export default function Home() {
  const [items, setItems] = useState<StoredItemReport[]>(SAMPLE_CAMPUS_ITEMS);
  const [isWeightsOpen, setIsWeightsOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
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
  const [feedViewMode, setFeedViewMode] = useState<"grid" | "map">("grid");

  // Category & search filter sync with feed
  const [heroCategory, setHeroCategory] = useState("all");
  const [feedTypeFilter, setFeedTypeFilter] = useState<"all" | "lost" | "found">("all");
  const [heroSearch, setHeroSearch] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Step-by-step AI matching simulation states for the live showcase card
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [scanStep, setScanStep] = useState<number>(3); // 0: laser sweep, 1: visual match, 2: semantic match, 3: completed
  const [visualProgress, setVisualProgress] = useState<number>(98.2);
  const [semanticProgress, setSemanticProgress] = useState<number>(94.5);

  const triggerLiveMatchSimulation = useCallback(() => {
    if (isSimulatingScan) return;
    setIsSimulatingScan(true);
    setScanStep(0);
    setVisualProgress(0);
    setSemanticProgress(0);

    setTimeout(() => {
      setScanStep(1);
      setVisualProgress(98.2);
    }, 850);

    setTimeout(() => {
      setScanStep(2);
      setSemanticProgress(94.5);
    }, 1800);

    setTimeout(() => {
      setScanStep(3);
      setIsSimulatingScan(false);
    }, 2700);
  }, [isSimulatingScan]);

  // Global Ctrl+K / Cmd+K listener to open Search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    } else if (id === "map" || id === "map-view") {
      setActiveTab("feed");
      setFeedViewMode("map");
    } else if (id === "recent-items") {
      setActiveTab("feed");
      setFeedViewMode("grid");
    } else if (id === "how-it-works") {
      setActiveTab("feed");
    } else if (id === "admin-preview") {
      setActiveTab("admin");
    }
    setTimeout(() => {
      const targetId = (id === "map" || id === "map-view") ? "recent-items" : id;
      const el = document.getElementById(targetId);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenFoundReport = () => {
    setReportFormType("found");
    setActiveTab("report");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };



  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[#F3F4EF] selection:bg-[#45B58A] selection:text-[#141715]">
      {/* Navigation Header */}
      <Navbar
        onOpenWeights={() => setIsWeightsOpen(true)}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenProposal={() => setIsProposalOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onNavigateSection={scrollToSection}
        onOpenAuth={(tab) => {
          setAuthModalTab(tab);
          setAuthModalOpen(true);
        }}
      />

      {/* Hero Section: Centered, Focused Sylhet Lost & Found Network (Visible on Feed Tab) */}
      {activeTab === "feed" && (
        <section className="relative min-h-[calc(100vh-4.5rem)] flex flex-col justify-center overflow-hidden py-16 lg:py-24 border-b border-[#2C342E] bg-transparent">
          {/* Real Sylhet Cityscape Skyline Backdrop with Calm Ambient Glow (No mouse movement aura) */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Real Sylhet Cityscape Skyline - Clearer & brighter opacity */}
            <img
              src="/images/sylhet_city_hero.jpg"
              alt="Sylhet Keane Bridge Cityscape"
              className="w-full h-full object-cover object-center opacity-65 transform scale-100 transition-opacity duration-700"
            />
            
            {/* Lighter, balanced gradient overlays (less muddy black, more vibrant visual flow) */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#121513] via-[#121513]/40 to-[#121513]/25" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#121513_85%)] opacity-60" />

            {/* Central Emerald Radiant Ambient Glow - Gives life and eliminates flat heavy dark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] rounded-full bg-[#45B58A]/16 blur-[140px] pointer-events-none" />
            <div className="absolute top-1/4 right-1/4 w-[420px] h-[420px] rounded-full bg-[#45B58A]/12 blur-[110px] pointer-events-none" />
            <div className="absolute top-1/3 left-10 w-[360px] h-[360px] rounded-full bg-[#45B58A]/10 blur-[100px] pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            {/* 1. Top Pill: Linear Staggered Blur Entrance & Shimmer */}
            <div>
              <div className="animate-linear-blur animation-delay-100 linear-shimmer-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#1C221E]/90 text-[#45B58A] border border-[#313A33] hover:border-[#45B58A]/50 backdrop-blur-md shadow-sm transition-colors cursor-default">
                <span className="w-1.5 h-1.5 rounded-full bg-[#45B58A] animate-pulse" />
                <span>Sylhet Lost &amp; Found Network</span>
              </div>
            </div>

            {/* 2. Headline: Linear Blur Entrance + Trademark Flowing Light Shimmer */}
            <h1 className="animate-linear-blur animation-delay-200 text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] select-none">
              <span className="animate-headline-shimmer transition-transform duration-300 hover:scale-[1.02]">
                Lost it?
              </span>{" "}
              <span className="relative inline-block">
                <span className="animate-linear-text-shimmer font-black transition-transform duration-300 hover:scale-[1.03]">
                  FindIt.
                </span>
              </span>
            </h1>

            {/* 3. Subtitle: Linear Staggered Blur Entrance */}
            <p className="animate-linear-blur animation-delay-300 text-sm sm:text-base text-[#C4CBC5] max-w-lg mx-auto leading-relaxed">
              Report lost or found items across Sylhet and get instant community matches.
            </p>

            {/* 4. Action Buttons: Linear Staggered Blur Entrance + Tactile Micro-Interactions */}
            <div className="animate-linear-blur animation-delay-400 flex flex-wrap items-center justify-center gap-3.5 pt-4">
              <button
                type="button"
                onClick={handleOpenFoundReport}
                className="linear-btn-primary px-7 py-3.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer shadow-lg shadow-[#45B58A]/25"
              >
                Report Found Item
              </button>
              <button
                type="button"
                onClick={handleOpenLostReport}
                className="linear-btn-secondary px-7 py-3.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Report Lost Item
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3-Step Interactive How It Works Section */}
      {activeTab === "feed" && (
        <HowItWorksSection
          onOpenReport={(type) => {
            if (type === "lost") handleOpenLostReport();
            else handleOpenFoundReport();
          }}
          onExploreFeed={() => scrollToSection("recent-items")}
        />
      )}

      {/* Main Content Area */}
      <main ref={contentRef} className="flex-1 pb-16 pt-8 bg-[#171A18]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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
                externalViewMode={feedViewMode}
              />
            </div>
          )}

          {/* Tab 2: Item Upload Form */}
          {activeTab === "report" && (
            <div id="report-form" className="animate-in fade-in duration-200 space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#252B27] border border-[#383E39] rounded-2xl">
                <h2 className="text-sm font-semibold text-[#F3F4EF]">
                  {reportFormType === "lost" ? "Lost Item Report" : "Found Item Report"}
                </h2>
                <button
                  onClick={() => setActiveTab("feed")}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#F3F4EF] bg-[#171A18] border border-[#383E39] hover:bg-[#252B27] transition cursor-pointer"
                >
                  &larr; Back to Items Feed
                </button>
              </div>

              <ItemUploadForm
                initialType={reportFormType}
                onReportCreated={handleReportCreated}
                onFindMatches={(item) => setSelectedLostItem(item)}
                onRequireAuth={() => {
                  setAuthModalTab("login");
                  setAuthModalOpen(true);
                }}
                onTypeChange={(type) => setReportFormType(type)}
              />
            </div>
          )}

          {/* Tab 3: Admin & Verification Preview */}
          {activeTab === "admin" && (
            <div id="admin-preview" className="animate-in fade-in duration-200 space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#252B27] text-[#F3F4EF] rounded-2xl border border-[#383E39]">
                <div>
                  <h2 className="text-sm font-semibold text-[#F3F4EF]">
                    Verification &amp; Recovery Management Portal
                  </h2>
                  <p className="text-xs text-[#A9B0AA]">
                    Review incoming claims, inspect match confidence scores, and verify legitimate ownership.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("feed")}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#F3F4EF] bg-[#171A18] border border-[#383E39] hover:bg-[#252B27] transition cursor-pointer"
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

      {/* Public Civic How It Works Guide */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onOpenReport={(type) => {
          if (type === "lost") handleOpenLostReport();
          else handleOpenFoundReport();
        }}
        onBrowseFeed={() => {
          setActiveTab("feed");
          setTimeout(() => {
            contentRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 80);
        }}
      />

      {/* Project Proposal & Features Modal (Academic / Defense Specs) */}
      <ProposalModal
        isOpen={isProposalOpen}
        onClose={() => setIsProposalOpen(false)}
      />

      {/* Explainable Matches Modal */}
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

      {/* Dedicated Linear-Style Search & Discovery Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        items={items}
        onFindMatches={(item) => setSelectedLostItem(item)}
        onClaimItem={(item) => setClaimItem(item)}
        onApplySearch={(query, type, cat) => {
          setHeroSearch(query);
          setFeedTypeFilter(type);
          setHeroCategory(cat);
          setActiveTab("feed");
          setFeedViewMode("grid");
          setTimeout(() => {
            document.getElementById("recent-items")?.scrollIntoView({ behavior: "smooth" });
          }, 60);
        }}
      />

      {/* Platform Footer */}
      <Footer
        onOpenProposal={() => setIsProposalOpen(true)}
        onOpenWeights={() => setIsWeightsOpen(true)}
      />
    </div>
  );
}
