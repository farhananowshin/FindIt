"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Search,
  MapPin,
  Clock,
  HelpCircle,
  RefreshCw,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  LayoutGrid,
  Laptop,
  CreditCard,
  BookOpen,
  Briefcase,
  Coffee,
  Key,
  Shirt,
  Tag,
  X,
  ArrowRight,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { StoredItemReport, CAMPUS_LOCATIONS } from "../types/item";
import { resolveImageUrl } from "../services/api";

const CampusMapView = dynamic(() => import("./CampusMapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] bg-[#161B18] rounded-3xl flex items-center justify-center text-[#9EA8A0] text-sm animate-pulse border border-[#2B352E]">
      Loading Sylhet &amp; Campus Interactive Map...
    </div>
  ),
});

interface RecentItemsListProps {
  items: StoredItemReport[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  isLive?: boolean;
  onFindMatches?: (item: StoredItemReport) => void;
  onClaimItem?: (item: StoredItemReport) => void;
  externalSearch?: string;
  externalCategory?: string;
  externalType?: "all" | "lost" | "found";
  externalViewMode?: "grid" | "map";
}

export default function RecentItemsList({
  items,
  isLoading = false,
  error = null,
  onRefresh,
  isLive = false,
  onFindMatches,
  onClaimItem,
  externalSearch,
  externalCategory,
  externalType,
  externalViewMode,
}: RecentItemsListProps) {
  const DEFAULT_PAGE_SIZE = 6;
  const [filterType, setFilterType] = useState<"all" | "lost" | "found">(externalType || "all");
  const [searchQuery, setSearchQuery] = useState(externalSearch || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(externalCategory || "all");
  const [viewMode, setViewMode] = useState<"grid" | "map">(externalViewMode || "grid");
  const [visibleCount, setVisibleCount] = useState<number>(DEFAULT_PAGE_SIZE);

  // Sync external filters
  const [prevExternalSearch, setPrevExternalSearch] = useState(externalSearch);
  if (externalSearch !== prevExternalSearch) {
    setPrevExternalSearch(externalSearch);
    if (externalSearch !== undefined) setSearchQuery(externalSearch);
  }

  const [prevExternalCategory, setPrevExternalCategory] = useState(externalCategory);
  if (externalCategory !== prevExternalCategory) {
    setPrevExternalCategory(externalCategory);
    if (externalCategory !== undefined) setSelectedCategory(externalCategory);
  }

  const [prevExternalType, setPrevExternalType] = useState(externalType);
  if (externalType !== prevExternalType) {
    setPrevExternalType(externalType);
    if (externalType !== undefined) setFilterType(externalType);
  }

  const [prevExternalViewMode, setPrevExternalViewMode] = useState(externalViewMode);
  if (externalViewMode !== prevExternalViewMode) {
    setPrevExternalViewMode(externalViewMode);
    if (externalViewMode !== undefined) setViewMode(externalViewMode);
  }

  // Reset pagination count on filter change
  const filterKey = `${searchQuery}|${selectedCategory}|${filterType}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(DEFAULT_PAGE_SIZE);
  }

  // Human-friendly location name resolution
  const formatLocationName = (locationIdOrName?: string) => {
    if (!locationIdOrName) return "Sylhet Metropolitan";
    const raw = locationIdOrName.trim();

    const knownMap: Record<string, string> = {
      syl_zinda: "Zindabazar Point",
      syl_amber: "Amberkhana Stand",
      syl_bandar: "Bandarbazar / Court Point",
      syl_mu: "Metropolitan University",
      syl_sust: "SUST Campus Hub",
      syl_rail_bus: "Kadamtali Transit Hub",
      syl_shibganj: "Shibganj / Tilagarh",
      syl_osmani_med: "Osmani Medical College",
      syl_dargah: "Shah Jalal Dargah",
      syl_upashahar: "Shahjalal Upashahar",
      syl_airport: "Osmani Airport (ZIA)",
      lib_main: "Central University Library",
      sci_eng: "Science & Engineering Complex",
      dining_hall: "Campus Cafeteria",
      stu_union: "Central Community Hub",
      sports_rec: "Sports & Recreation Center",
      dorm_east: "East Residence Halls",
      dorm_west: "West Residence Halls",
      auditorium: "Grand Auditorium",
      admin_bldg: "Admin Registrar Building",
      bus_stop: "Campus Shuttle Stop",
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

  // Category Icon & label helper
  const getCategoryMeta = (cat?: string) => {
    switch (cat?.toLowerCase()) {
      case "electronics":
        return { label: "Electronics", icon: <Laptop className="w-5 h-5 text-[#45B58A]" /> };
      case "id_cards":
        return { label: "ID & Docs", icon: <CreditCard className="w-5 h-5 text-[#45B58A]" /> };
      case "books_notes":
        return { label: "Books & Notes", icon: <BookOpen className="w-5 h-5 text-[#45B58A]" /> };
      case "bags_wallets":
        return { label: "Wallets & Bags", icon: <Briefcase className="w-5 h-5 text-[#45B58A]" /> };
      case "bottles_accessories":
        return { label: "Accessories", icon: <Coffee className="w-5 h-5 text-[#45B58A]" /> };
      case "keys":
        return { label: "Keys", icon: <Key className="w-5 h-5 text-[#45B58A]" /> };
      case "clothing":
        return { label: "Clothing", icon: <Shirt className="w-5 h-5 text-[#45B58A]" /> };
      default:
        return { label: "Belonging", icon: <Tag className="w-5 h-5 text-[#45B58A]" /> };
    }
  };

  const filteredItems = items.filter((item) => {
    const rawUrl =
      (item.imageUrls && item.imageUrls.length > 0 && item.imageUrls[0]) ||
      (item.images && item.images.length > 0 && item.images[0].previewUrl) ||
      null;
    if (!rawUrl || typeof rawUrl !== "string" || rawUrl.trim() === "") return false;

    const itemType = (item.type || item.reportType || "lost").toLowerCase();
    const matchesType = filterType === "all" || itemType === filterType;

    const q = searchQuery.toLowerCase().trim();
    const locZone = item.location?.campusZone || item.campusLocation || "";
    const locSpot = item.location?.specificLocation || item.specificLocation || "";

    const matchesSearch =
      q === "" ||
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.brand && item.brand.toLowerCase().includes(q)) ||
      (item.primaryColor && item.primaryColor.toLowerCase().includes(q)) ||
      locZone.toLowerCase().includes(q) ||
      locSpot.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;

    return matchesType && matchesSearch && matchesCategory;
  });

  const displayedItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  const CATEGORY_PILLS = [
    { id: "all", label: "All Items" },
    { id: "electronics", label: "Electronics" },
    { id: "bags_wallets", label: "Wallets & Bags" },
    { id: "id_cards", label: "ID Cards" },
    { id: "keys", label: "Keys" },
    { id: "bottles_accessories", label: "Accessories" },
    { id: "books_notes", label: "Books & Notes" },
    { id: "clothing", label: "Clothing" },
  ];

  // Only show categories that have items in the dataset or is "all" to prevent empty zero-count pill clutter
  const activeCategories = CATEGORY_PILLS.filter(
    (pill) => pill.id === "all" || items.some((it) => it.category === pill.id)
  );

  const lostCount = items.filter((i) => (i.type || i.reportType) === "lost").length;
  const foundCount = items.filter((i) => (i.type || i.reportType) === "found").length;

  return (
    <section className="relative w-full py-6">
      {/* Ambient background glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#45B58A]/5 blur-[140px] rounded-full pointer-events-none -z-10" />

      {/* ======================================================== */}
      {/* 1. CLEAN AIRBNB / LINEAR STYLE HEADER                    */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#242C26]">
        {/* Left: Prominent Clean Title */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black text-[#F3F4EF] tracking-tight">
              Lost &amp; Found Reports
            </h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1C241E] text-[#45B58A] border border-[#2E3B31]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#45B58A] animate-pulse" />
              {isLive ? `Live in Sylhet · ${items.length} items` : `Sylhet Network · ${items.length} items`}
            </span>
          </div>
          <p className="text-xs text-[#8A968D] font-medium tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#45B58A] shadow-[0_0_8px_#45B58A]" />
            Real-time multimodal intake &amp; automated AI matching active
          </p>
        </div>

        {/* Right: Unified Linear-Grade Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Minimal Search Bar with Keyboard Hint */}
          <div className="relative w-full sm:w-60 group">
            <Search className="w-4 h-4 text-[#7A857C] group-focus-within:text-[#45B58A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports or items..."
              className="w-full pl-9 pr-12 py-2 rounded-xl border border-[#2B352E] bg-[#161B18]/90 text-xs text-[#F3F4EF] placeholder:text-[#6E7870] focus:outline-none focus:border-[#45B58A]/80 focus:ring-1 focus:ring-[#45B58A]/30 transition-all shadow-xs"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7A857C] hover:text-[#F3F4EF] cursor-pointer p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#202722] text-[#717E75] border border-[#2B362F] pointer-events-none">
                ⌘K
              </span>
            )}
          </div>

          {/* Unified Segmented Filter: All / Lost / Found */}
          <div className="inline-flex items-center p-1 bg-[#161B18]/90 rounded-xl border border-[#2B352E] shadow-inner">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                filterType === "all"
                  ? "bg-[#28322A] text-[#F3F4EF] shadow-sm"
                  : "text-[#88938A] hover:text-[#F3F4EF] hover:bg-[#1C231F]"
              }`}
            >
              <span>All</span>
              <span className="text-[10px] opacity-75 font-mono">({items.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType("lost")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                filterType === "lost"
                  ? "bg-amber-950/70 text-amber-300 border border-amber-800/60 shadow-sm"
                  : "text-[#88938A] hover:text-amber-300 hover:bg-[#1C231F]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Lost</span>
              <span className="text-[10px] opacity-75 font-mono">({lostCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType("found")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                filterType === "found"
                  ? "bg-[#45B58A] text-[#111412] font-bold shadow-sm shadow-[#45B58A]/20"
                  : "text-[#88938A] hover:text-[#45B58A] hover:bg-[#1C231F]"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#111412]" />
              <span>Found</span>
              <span className="text-[10px] opacity-90 font-mono">({foundCount})</span>
            </button>
          </div>

          {/* Clean View Mode Switcher (Grid / Map) */}
          <div className="inline-flex items-center p-1 bg-[#161B18]/90 rounded-xl border border-[#2B352E]">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                viewMode === "grid"
                  ? "bg-[#28322A] text-[#F3F4EF] shadow-xs"
                  : "text-[#7A857C] hover:text-[#F3F4EF]"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                viewMode === "map"
                  ? "bg-[#45B58A] text-[#111412] font-bold shadow-xs"
                  : "text-[#7A857C] hover:text-[#F3F4EF]"
              }`}
              title="Interactive Map View"
            >
              <MapPin className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Minimal Refresh Action */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh reports"
              className="p-2 rounded-xl border border-[#2B352E] bg-[#161B18]/90 hover:border-[#45B58A]/50 text-[#7A857C] hover:text-[#F3F4EF] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#45B58A]" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. REFINED HORIZONTAL CATEGORY BAR (No 0-item clutter)   */}
      {/* ======================================================== */}
      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
          {activeCategories.map((pill) => {
            const count =
              pill.id === "all"
                ? items.length
                : items.filter((it) => it.category === pill.id).length;
            const isSelected = selectedCategory === pill.id;

            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setSelectedCategory(pill.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? "bg-[#45B58A] text-[#111412] font-bold shadow-md shadow-[#45B58A]/15 scale-102"
                    : "bg-[#161B18] text-[#9EA8A0] border border-[#262F29] hover:border-[#45B58A]/40 hover:text-[#F3F4EF]"
                }`}
              >
                <span>{pill.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? "bg-[#111412]/20 text-[#111412]" : "bg-[#121513] text-[#7A857C]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <span className="text-xs font-medium text-[#7A857C] shrink-0 hidden md:block">
          Showing <strong className="text-[#F3F4EF]">{Math.min(visibleCount, filteredItems.length)}</strong> of{" "}
          <strong className="text-[#F3F4EF]">{filteredItems.length}</strong>
        </span>
      </div>

      {/* Backend fallback notice */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-[#1C221E] border border-[#313A33] text-[#9EA8A0] text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Displaying local preview data. Live backend is currently unreachable.</span>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-2.5 py-1 bg-[#28322A] hover:bg-[#344137] text-[#F3F4EF] rounded-lg font-medium text-xs transition"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. CONTENT AREA: MAP OR MINIMALIST AIRBNB-STYLE CARDS    */}
      {/* ======================================================== */}
      {viewMode === "map" ? (
        <div className="mt-6">
          <CampusMapView
            items={filteredItems}
            onFindMatches={onFindMatches}
            onClaimItem={onClaimItem}
          />
        </div>
      ) : filteredItems.length === 0 ? (
        /* Clean Empty State */
        <div className="mt-8 p-12 text-center rounded-3xl border border-[#242C26] bg-[#161B18]">
          <div className="w-12 h-12 rounded-2xl bg-[#121513] border border-[#242C26] flex items-center justify-center mx-auto mb-3">
            <HelpCircle className="w-6 h-6 text-[#45B58A]" />
          </div>
          <h4 className="text-base font-bold text-[#F3F4EF]">No matching reports found</h4>
          <p className="text-xs text-[#88938A] mt-1 max-w-sm mx-auto">
            Try adjusting your search query, selecting another category, or reset filters.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setFilterType("all");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#202722] hover:bg-[#28322A] text-[#F3F4EF] font-semibold text-xs border border-[#2B352E] transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#45B58A]" />
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* 4. MINIMALIST AIRBNB-STYLE CARD GRID                     */
        /* ======================================================== */
        <div className="space-y-8">
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedItems.map((item, index) => {
              const isLost = (item.type || item.reportType) === "lost";
              const rawUrl =
                (item.imageUrls && item.imageUrls.length > 0 && item.imageUrls[0]) ||
                (item.images && item.images.length > 0 && item.images[0].previewUrl) ||
                null;
              const imageUrl = resolveImageUrl(rawUrl);

              const zoneName = formatLocationName(
                item.location?.campusZone || item.campusLocation || item.location?.specificLocation
              );
              const dateLabel = formatReportDate(item.dateTime);
              const categoryMeta = getCategoryMeta(item.category);
              const displayId = item._id || item.id;

              // Clean brand and color formatting to prevent 'None • Blue'
              const rawBrand = item.brand?.trim() || "";
              const hasValidBrand = rawBrand && !/^none$/i.test(rawBrand);
              const rawColor = item.primaryColor?.trim() || "";
              const hasValidColor = rawColor && !/^none$/i.test(rawColor);
              const itemSubtitle = [
                hasValidBrand ? rawBrand : null,
                hasValidColor ? rawColor : null,
              ].filter(Boolean).join(" · ") || categoryMeta.label;

              const handleCardClick = () => {
                if (isLost && onFindMatches) {
                  onFindMatches(item);
                } else if (!isLost && item.status !== "claimed" && onClaimItem) {
                  onClaimItem(item);
                }
              };

              return (
                <div
                  key={displayId}
                  onClick={handleCardClick}
                  style={{ animationDelay: `${(index % 6) * 60}ms` }}
                  className="animate-linear-up group rounded-3xl border border-[#242D26] bg-[#161B18] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_24px_rgba(0,0,0,0.45)] hover:border-[#45B58A]/60 hover:-translate-y-1.5 hover:shadow-[inset_0_1px_0_rgba(69,181,138,0.4),0_20px_48px_-12px_rgba(0,0,0,0.85),0_0_24px_rgba(69,181,138,0.14)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden flex flex-col justify-between cursor-pointer"
                >
                  {/* Visual Top Preview */}
                  <div>
                    <div className="relative h-52 bg-[#111412] overflow-hidden flex items-center justify-center">
                      {/* Pulse Shimmer Skeleton Placeholder while loading */}
                      <div className="absolute inset-0 bg-[#161C18] animate-pulse pointer-events-none" />

                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.title}
                          loading="lazy"
                          onLoad={(e) => {
                            e.currentTarget.style.opacity = "1";
                          }}
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src.includes(":3000/dataset_images/")) {
                              target.src = target.src.replace(":3000/dataset_images/", ":5000/uploads/");
                            } else if (target.src.includes(":5000/uploads/")) {
                              target.src = target.src.replace(":5000/uploads/", ":5000/dataset_images/");
                            } else {
                              target.style.display = "none";
                              const fallback = target.parentElement?.querySelector(".item-card-placeholder") as HTMLElement;
                              if (fallback) fallback.style.display = "flex";
                            }
                          }}
                          style={{ opacity: 0 }}
                          className="w-full h-full object-cover group-hover:scale-106 transition-all duration-700 ease-out relative z-1"
                        />
                      ) : null}

                      {/* Sophisticated Glass-Morphism Placeholder when no photo is attached */}
                      <div
                        style={{ display: imageUrl ? "none" : "flex" }}
                        className="item-card-placeholder w-full h-full relative flex-col items-center justify-center gap-2.5 bg-gradient-to-br from-[#1B221E] via-[#141815] to-[#0F1210] overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(#45B58A_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
                        <div className="relative p-3.5 rounded-2xl bg-[#1C2520] border border-[#2B372E] text-[#45B58A] shadow-inner group-hover:scale-110 transition-transform duration-300">
                          {categoryMeta.icon}
                        </div>
                        <span className="relative text-[10px] font-semibold text-[#7E8880] uppercase tracking-wider">
                          Verified Report
                        </span>
                      </div>

                      {/* Subtle Bottom Vignette Gradient for smooth visual flow into card body */}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#161B18] via-[#161B18]/40 to-transparent pointer-events-none" />

                      {/* Floating Glass Status Pill (Clean & Minimalist - Category box removed) */}
                      <div className="absolute top-3.5 left-3.5 z-10">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur-xl shadow-lg transition-transform duration-300 group-hover:scale-105 ${
                            isLost
                              ? "bg-black/65 text-amber-300 border border-amber-500/35"
                              : "bg-black/65 text-[#45B58A] border border-[#45B58A]/45"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isLost
                                ? "bg-amber-400 animate-pulse"
                                : "bg-[#45B58A] shadow-[0_0_8px_#45B58A]"
                            }`}
                          />
                          <span className="capitalize">{isLost ? "Lost" : "Found"}</span>
                        </span>
                      </div>
                    </div>

                    {/* Card Body (Clean, High Contrast, Spaced) */}
                    <div className="p-5 space-y-1.5">
                      <h4 className="text-base font-bold text-[#F3F4EF] line-clamp-1 group-hover:text-[#45B58A] transition-colors duration-200">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#8A958D] line-clamp-1 font-medium tracking-wide">
                        {itemSubtitle}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom Meta & Interactive Action Bar */}
                  <div className="px-5 pb-5 pt-0">
                    <div className="pt-3 border-t border-[#202722] flex items-center justify-between text-xs text-[#8A958D]">
                      {/* Location & Relative Time */}
                      <div className="flex items-center gap-1.5 min-w-0 pr-2">
                        <MapPin className="w-3.5 h-3.5 text-[#45B58A] shrink-0" />
                        <span className="truncate font-medium text-[#C4CBC5]">{zoneName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[#717A73] shrink-0 font-medium">
                        <Clock className="w-3 h-3 text-[#717A73]" />
                        <span>{dateLabel}</span>
                      </div>
                    </div>

                    {/* Action Bar (Tactile Linear Button with Hover Shift) */}
                    <div className="mt-3.5">
                      {isLost ? (
                        <div className="w-full py-2.5 px-3 rounded-xl bg-[#1D2520] group-hover:bg-[#45B58A] text-[#C4CBC5] group-hover:text-[#111412] border border-[#2B352E] group-hover:border-[#45B58A] text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-xs group-hover:shadow-md group-hover:shadow-[#45B58A]/20">
                          <Sparkles className="w-3.5 h-3.5 text-[#45B58A] group-hover:text-[#111412] transition-colors" />
                          <span>View AI Matches</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
                        </div>
                      ) : item.status === "claimed" ? (
                        <div className="w-full py-2.5 px-3 rounded-xl bg-[#141815] text-[#717A73] text-xs font-medium flex items-center justify-center gap-2 border border-[#222823]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#45B58A]" />
                          <span>Claimed &amp; Resolved</span>
                        </div>
                      ) : (
                        <div className="w-full py-2.5 px-3 rounded-xl bg-[#45B58A]/10 group-hover:bg-[#45B58A] text-[#45B58A] group-hover:text-[#111412] border border-[#45B58A]/30 group-hover:border-[#45B58A] text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-xs group-hover:shadow-md group-hover:shadow-[#45B58A]/25">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#45B58A] group-hover:text-[#111412] transition-colors" />
                          <span>Claim Item</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {filteredItems.length > DEFAULT_PAGE_SIZE && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#242C26]">
              <div className="text-xs text-[#8F9991] font-medium">
                Showing <strong className="text-[#F3F4EF]">{displayedItems.length}</strong> of{" "}
                <strong className="text-[#F3F4EF]">{filteredItems.length}</strong> reports
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/explore"
                  className="px-4 py-2 rounded-xl bg-[#161B18] hover:bg-[#1E2520] text-[#F3F4EF] border border-[#2B352E] font-semibold text-xs transition active:scale-95 flex items-center gap-1.5 shadow-xs"
                >
                  <span>Full Explorer</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#45B58A]" />
                </Link>

                {hasMore && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => Math.min(prev + 6, filteredItems.length))}
                    className="px-5 py-2 rounded-xl bg-[#45B58A] hover:bg-[#3ca37c] text-[#111412] font-bold text-xs shadow-md shadow-[#45B58A]/15 transition active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <span>Load More</span>
                  </button>
                )}

                {visibleCount > DEFAULT_PAGE_SIZE && (
                  <button
                    type="button"
                    onClick={() => {
                      setVisibleCount(DEFAULT_PAGE_SIZE);
                      document.getElementById("recent-items")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-3.5 py-2 rounded-xl border border-[#2B352E] bg-[#161B18] hover:bg-[#1E2520] text-[#8F9991] hover:text-[#F3F4EF] font-semibold text-xs transition cursor-pointer"
                  >
                    Show Less
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
