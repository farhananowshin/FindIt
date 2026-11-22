"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import MatchesModal from "../../components/MatchesModal";
import ClaimModal from "../../components/ClaimModal";
import AuthModal from "../../components/AuthModal";
import WeightsModal from "../../components/WeightsModal";
import { SAMPLE_CAMPUS_ITEMS } from "../../data/sampleItems";
import { StoredItemReport, CAMPUS_LOCATIONS } from "../../types/item";
import { fetchItems, resolveImageUrl } from "../../services/api";
import {
  MapPin,
  Sparkles,
  ShieldCheck,
  Search,
  Compass,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Layers,
  X,
  Clock,
} from "lucide-react";

// Dynamically import Leaflet map component to prevent SSR issues
const DynamicLeafletMap = dynamic(() => import("./MapCanvas"), {
  ssr: false,
          loading: () => (
    <div className="w-full h-full bg-[#121513] flex flex-col items-center justify-center text-[#9EA8A0] gap-3">
      <div className="w-8 h-8 border-2 border-[#45B58A]/20 border-t-[#45B58A] rounded-full animate-spin" />
      <span className="text-xs font-medium tracking-wide text-[#8EA295]">
        Loading map...
      </span>
    </div>
  ),
});

export default function MapPage() {
  const [items, setItems] = useState<StoredItemReport[]>(SAMPLE_CAMPUS_ITEMS);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "lost" | "found">("all");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);

  // Layout states for Breathing Space & Mobile Bottom Sheet
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // Modals
  const [selectedLostItem, setSelectedLostItem] = useState<StoredItemReport | null>(null);
  const [claimItem, setClaimItem] = useState<StoredItemReport | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [isWeightsOpen, setIsWeightsOpen] = useState(false);

  const handleFindMatches = useCallback((item: StoredItemReport) => {
    setSelectedLostItem(item);
  }, []);

  const handleClaimItem = useCallback((item: StoredItemReport) => {
    setClaimItem(item);
  }, []);

  const handleSelectZone = useCallback((zoneId: string) => {
    setSelectedZone(zoneId);
  }, []);

  const loadItems = useCallback(async () => {
    try {
      const data = await fetchItems();
      if (data && data.length > 0) {
        setItems(data);
      }
    } catch (err: unknown) {
      console.warn("Using sample items for map:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchItems()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setItems(data);
        }
      })
      .catch((err: unknown) => {
        console.warn("Using sample items for map:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Friendly human-readable location resolver
  const formatLocationName = (locationIdOrName?: string) => {
    if (!locationIdOrName) return "Sylhet Metropolitan";
    const raw = locationIdOrName.trim();

    const knownMap: Record<string, string> = {
      syl_zinda: "Zindabazar Point",
      syl_amber: "Amberkhana Stand",
      syl_bandar: "Bandarbazar / Court Point",
      syl_mu: "Bateshwar Area",
      syl_sust: "Kumargaon Hub",
      syl_rail_bus: "Kadamtali Transit Hub",
      syl_shibganj: "Shibganj / Tilagarh",
      syl_osmani_med: "Osmani Hospital Area",
      syl_dargah: "Shah Jalal Dargah",
      syl_upashahar: "Shahjalal Upashahar",
      syl_airport: "Osmani Airport (ZIA)",
      other: "Sylhet City Center",
    };

    if (knownMap[raw.toLowerCase()]) {
      return knownMap[raw.toLowerCase()];
    }

    const found = CAMPUS_LOCATIONS.find(
      (l) => l.id.toLowerCase() === raw.toLowerCase() || l.name.toLowerCase() === raw.toLowerCase()
    );
    if (found) {
      return found.name.split(" (")[0];
    }

    if (raw.startsWith("syl_")) {
      const clean = raw.replace("syl_", "");
      return clean.charAt(0).toUpperCase() + clean.slice(1) + " Hub";
    }

    return raw;
  };

  // Helper to strip redundant "Found" or "Lost" prefix from item titles
  const cleanItemTitle = (title?: string) => {
    if (!title) return "Item";
    return title.replace(/^(Found|Lost)\s*[:-]?\s*/i, "").trim();
  };

  // Clean date formatting without unstable new Date() render calls (Next.js 16 compliant)
  const formatReportDate = (dateTimeVal?: string | Date) => {
    if (!dateTimeVal) return "Recently";
    try {
      const d = new Date(dateTimeVal);
      if (isNaN(d.getTime())) {
        return typeof dateTimeVal === "string" ? dateTimeVal.slice(0, 10) : "Recently";
      }

      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  // Filter items based on active criteria
  const filteredItems = items.filter((item) => {
    const itemType = (item.type || item.reportType || "lost").toLowerCase();
    if (filterType !== "all" && itemType !== filterType) return false;

    const locZone = item.location?.campusZone || item.campusLocation || "";
    const locId = item.campusLocation || "";

    if (
      selectedZone !== "all" &&
      locId !== selectedZone &&
      !locZone.toLowerCase().includes(selectedZone.toLowerCase())
    ) {
      return false;
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      const matches =
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.brand && item.brand.toLowerCase().includes(q)) ||
        locZone.toLowerCase().includes(q);
      if (!matches) return false;
    }

    return true;
  });

  return (
    <div className="h-screen flex flex-col bg-[#141715] text-[#F3F4EF] selection:bg-[#45B58A] selection:text-[#111412] overflow-hidden">
      {/* Top Navbar */}
      <Navbar
        onOpenWeights={() => setIsWeightsOpen(true)}
        onOpenAuth={(tab) => {
          setAuthModalTab(tab);
          setAuthModalOpen(true);
        }}
      />

      {/* Main Workspace (Full Viewport) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ======================================================== */}
        {/* DESKTOP SIDEBAR: Strict 340px - 360px Width (Canva Spec) */}
        {/* ======================================================== */}
        <aside
          className={`hidden md:flex flex-col z-10 shrink-0 bg-[#181D1A] border-r border-[#273029] transition-all duration-300 relative ${
            isSidebarCollapsed ? "w-0 -translate-x-full overflow-hidden" : "w-[340px] lg:w-[350px]"
          }`}
        >
          {/* Header & Filter Controls */}
          <div className="p-4 border-b border-[#273029] space-y-3 bg-[#181D1A]/95 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#45B58A]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#F3F4EF]">
                  Sylhet Locations
                </h2>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#202823] text-[#8EA295] border border-[#2B372F]">
                {filteredItems.length} Items on Map
              </span>
            </div>

            {/* Keyword Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#7E8880] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items by name, zone..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-[#141715] border border-[#2B352E] text-xs text-[#F3F4EF] placeholder-[#7E8880] focus:outline-none focus:border-[#45B58A] transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7E8880] hover:text-[#F3F4EF]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Segmented Filter Pills (All / Lost / Found) */}
            <div className="flex items-center gap-2">
              <div className="flex-1 grid grid-cols-3 gap-1 p-0.5 bg-[#141715] rounded-xl border border-[#2B352E] text-xs">
                <button
                  type="button"
                  onClick={() => setFilterType("all")}
                  className={`py-1 rounded-lg font-semibold transition cursor-pointer text-center ${
                    filterType === "all"
                      ? "bg-[#252E27] text-[#F3F4EF] shadow-xs"
                      : "text-[#88938A] hover:text-[#F3F4EF]"
                  }`}
                >
                  All ({items.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("lost")}
                  className={`py-1 rounded-lg font-semibold transition cursor-pointer text-center ${
                    filterType === "lost"
                      ? "bg-amber-950/70 text-amber-300 border border-amber-800/60"
                      : "text-[#88938A] hover:text-amber-300"
                  }`}
                >
                  Lost
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("found")}
                  className={`py-1 rounded-lg font-semibold transition cursor-pointer text-center ${
                    filterType === "found"
                      ? "bg-[#45B58A] text-[#111412] font-bold"
                      : "text-[#88938A] hover:text-[#45B58A]"
                  }`}
                >
                  Found
                </button>
              </div>

              {/* Zone dropdown */}
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-[#141715] border border-[#2B352E] text-xs text-[#F3F4EF] focus:outline-none focus:border-[#45B58A] cursor-pointer max-w-[125px] truncate"
              >
                <option value="all">All Zones</option>
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name.split(" (")[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scrollable Item Cards List: Essential Info Only */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-[#88938A] text-xs space-y-2">
                <Compass className="w-8 h-8 text-[#88938A] mx-auto opacity-60" />
                <p>No mapped items match your current filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterType("all");
                    setSelectedZone("all");
                  }}
                  className="text-[#45B58A] font-semibold hover:underline"
                >
                  Reset Map Filters
                </button>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isLost = (item.type || item.reportType) === "lost";
                const isFocused = (item._id || item.id) === focusedItemId;
                const rawUrl =
                  (item.imageUrls && item.imageUrls[0]) ||
                  (item.images && item.images[0]?.previewUrl) ||
                  null;
                const imageUrl = resolveImageUrl(rawUrl);
                const locZone = formatLocationName(
                  item.location?.campusZone || item.campusLocation
                );
                const dateLabel = formatReportDate(item.dateTime);

                return (
                  <div
                    key={item._id || item.id}
                    onClick={() => setFocusedItemId(item._id || item.id)}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer flex gap-3 ${
                      isFocused
                        ? "bg-[#1E2520] border-l-4 border-l-[#45B58A] border-t border-r border-b border-[#36443A] shadow-md ring-1 ring-[#45B58A]/30"
                        : "bg-[#141715]/80 hover:bg-[#161B18] border border-[#242C26]"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#1D241F] shrink-0 border border-[#2B352E] flex items-center justify-center">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Compass className="w-5 h-5 text-[#45B58A]" />
                      )}
                    </div>

                    {/* Essential Info Only (Canva Clean Card Spec) */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              isLost
                                ? "bg-amber-950/60 text-amber-300 border border-amber-800/40"
                                : "bg-[#45B58A]/15 text-[#45B58A] border border-[#45B58A]/30"
                            }`}
                          >
                            <span
                              className={`w-1 h-1 rounded-full ${
                                isLost ? "bg-amber-400" : "bg-[#45B58A]"
                              }`}
                            />
                            {isLost ? "Lost" : "Found"}
                          </span>
                          <span className="text-[10px] text-[#7A857C] truncate flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {dateLabel}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#F3F4EF] truncate mt-1">
                          {cleanItemTitle(item.title)}
                        </h4>
                        <p className="text-[11px] text-[#9EA8A0] truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#45B58A] shrink-0" />
                          <span className="truncate">{locZone}</span>
                        </p>
                      </div>

                      {/* Focused Pin Cue */}
                      {isFocused && (
                        <span className="text-[10px] font-semibold text-[#45B58A] flex items-center gap-1 mt-1">
                          <span>Active on Map</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Sidebar Collapse / Expand Toggle Button (Desktop Breathing Space) */}
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          className="hidden md:flex absolute top-5 z-20 items-center justify-center w-6 h-9 rounded-r-lg bg-[#181D1A] border-y border-r border-[#2B352E] text-[#9EA8A0] hover:text-[#F3F4EF] transition-all cursor-pointer shadow-md"
          style={{ left: isSidebarCollapsed ? "0px" : "340px" }}
          title={isSidebarCollapsed ? "Expand Reports Sidebar" : "Collapse Sidebar for Full Map"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-[#45B58A]" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-[#7A857C]" />
          )}
        </button>

        {/* ======================================================== */}
        {/* RIGHT: EXPANSIVE FULL-HEIGHT LEAFLET MAP CANVAS          */}
        {/* ======================================================== */}
        <main className="flex-1 h-full relative overflow-hidden bg-[#121513]">
          <DynamicLeafletMap
            items={filteredItems}
            focusedItemId={focusedItemId}
            onFindMatches={handleFindMatches}
            onClaimItem={handleClaimItem}
            selectedZone={selectedZone}
            onSelectZone={handleSelectZone}
          />

          {/* Floating Back to Explorer Link (Top Right) */}
          <div className="absolute top-4 right-4 z-20">
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181D1A]/90 hover:bg-[#202722] border border-[#2B352E] text-xs font-semibold text-[#F3F4EF] shadow-md backdrop-blur-md transition active:scale-95"
            >
              <span>View as List</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#45B58A]" />
            </Link>
          </div>
        </main>

        {/* ======================================================== */}
        {/* MOBILE VIEW: MODERN BOTTOM SHEET DRAWER (Canva Spec)     */}
        {/* ======================================================== */}
        <div
          className={`md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#181D1A]/95 backdrop-blur-xl border-t border-[#2B352E] rounded-t-3xl shadow-2xl transition-all duration-300 flex flex-col ${
            isMobileSheetOpen ? "h-[62vh]" : "h-16"
          }`}
        >
          {/* Bottom Sheet Handle Bar (Tappable to Toggle) */}
          <button
            type="button"
            onClick={() => setIsMobileSheetOpen((prev) => !prev)}
            className="w-full py-2.5 px-4 flex flex-col items-center justify-center shrink-0 cursor-pointer"
          >
            <div className="w-10 h-1 bg-[#3A463E] rounded-full mb-1.5" />
            <div className="w-full flex items-center justify-between text-xs font-bold text-[#F3F4EF]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#45B58A]" />
                {filteredItems.length} Items in Sylhet
              </span>
              <span className="text-[#45B58A] flex items-center gap-1 text-[11px]">
                {isMobileSheetOpen ? (
                  <>
                    <span>Collapse</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Browse List</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </>
                )}
              </span>
            </div>
          </button>

          {/* Expanded Mobile List */}
          {isMobileSheetOpen && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2 border-t border-[#242C26]">
              {filteredItems.map((item) => {
                const isLost = (item.type || item.reportType) === "lost";
                const isFocused = (item._id || item.id) === focusedItemId;
                const rawUrl =
                  (item.imageUrls && item.imageUrls[0]) ||
                  (item.images && item.images[0]?.previewUrl) ||
                  null;
                const imageUrl = resolveImageUrl(rawUrl);
                const locZone = formatLocationName(
                  item.location?.campusZone || item.campusLocation
                );

                return (
                  <div
                    key={item._id || item.id}
                    onClick={() => {
                      setFocusedItemId(item._id || item.id);
                      setIsMobileSheetOpen(false); // Auto-collapse to reveal map pin!
                    }}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer flex gap-3 ${
                      isFocused
                        ? "bg-[#1E2520] border-l-4 border-l-[#45B58A] border border-[#36443A]"
                        : "bg-[#141715] border border-[#242C26]"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#1D241F] shrink-0 border border-[#2B352E] flex items-center justify-center">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Compass className="w-4 h-4 text-[#45B58A]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                            isLost ? "bg-amber-950/60 text-amber-300" : "bg-[#45B58A]/20 text-[#45B58A]"
                          }`}
                        >
                          {isLost ? "Lost" : "Found"}
                        </span>
                        <span className="text-[10px] text-[#7A857C]">
                          {formatReportDate(item.dateTime)}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#F3F4EF] truncate mt-0.5">
                        {cleanItemTitle(item.title)}
                      </h4>
                      <p className="text-[11px] text-[#88938A] truncate flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-[#45B58A] shrink-0" />
                        <span>{locZone}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Shared Modals */}
      <MatchesModal
        lostItem={selectedLostItem}
        isOpen={Boolean(selectedLostItem)}
        onClose={() => setSelectedLostItem(null)}
      />

      <ClaimModal
        item={claimItem}
        isOpen={Boolean(claimItem)}
        onClose={() => setClaimItem(null)}
        onClaimSubmitted={() => {
          setClaimItem(null);
          loadItems();
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />

      <WeightsModal
        isOpen={isWeightsOpen}
        onClose={() => setIsWeightsOpen(false)}
      />
    </div>
  );
}
