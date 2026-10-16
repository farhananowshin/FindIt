"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Search,
  MapPin,
  Clock,
  ImageIcon,
  HelpCircle,
  RefreshCw,
  AlertCircle,
  Database,
  Sparkles,
  ShieldAlert,
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
} from "lucide-react";
import { StoredItemReport, CAMPUS_LOCATIONS } from "../types/item";
import { resolveImageUrl } from "../services/api";

const CampusMapView = dynamic(() => import("./CampusMapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-sm animate-pulse border border-slate-200">
      Loading Metropolitan University Campus Map...
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
}

export default function RecentItemsList({
  items,
  isLoading = false,
  error = null,
  onRefresh,
  isLive = false,
  onFindMatches,
  onClaimItem,
}: RecentItemsListProps) {
  const [filterType, setFilterType] = useState<"all" | "lost" | "found">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const filteredItems = items.filter((item) => {
    const itemType = item.type || item.reportType;
    const matchesType = filterType === "all" || itemType === filterType;
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;

    return matchesType && matchesSearch && matchesCategory;
  });

  const getLocationName = (locationIdOrName: string) => {
    return (
      CAMPUS_LOCATIONS.find((l) => l.id === locationIdOrName)?.name ||
      locationIdOrName
    );
  };

  const getCategoryFallbackStyle = (cat?: string) => {
    switch (cat?.toLowerCase()) {
      case "electronics":
        return "bg-gradient-to-br from-indigo-100 via-blue-50 to-slate-100 border-b border-indigo-200";
      case "id_cards":
        return "bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 border-b border-sky-200";
      case "books_notes":
        return "bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 border-b border-amber-200";
      case "bags_wallets":
        return "bg-gradient-to-br from-emerald-100 via-teal-50 to-slate-100 border-b border-emerald-200";
      case "bottles_accessories":
        return "bg-gradient-to-br from-cyan-100 via-teal-50 to-blue-100 border-b border-cyan-200";
      case "keys":
        return "bg-gradient-to-br from-yellow-100 via-amber-50 to-orange-100 border-b border-yellow-200";
      case "clothing":
        return "bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100 border-b border-rose-200";
      default:
        return "bg-gradient-to-br from-slate-100 via-gray-50 to-zinc-100 border-b border-slate-200";
    }
  };

  const getCategoryFallbackIcon = (cat?: string) => {
    switch (cat?.toLowerCase()) {
      case "electronics":
        return <Laptop className="w-6 h-6 text-indigo-600" />;
      case "id_cards":
        return <CreditCard className="w-6 h-6 text-sky-600" />;
      case "books_notes":
        return <BookOpen className="w-6 h-6 text-amber-600" />;
      case "bags_wallets":
        return <Briefcase className="w-6 h-6 text-emerald-600" />;
      case "bottles_accessories":
        return <Coffee className="w-6 h-6 text-cyan-600" />;
      case "keys":
        return <Key className="w-6 h-6 text-yellow-600" />;
      case "clothing":
        return <Shirt className="w-6 h-6 text-rose-600" />;
      default:
        return <Tag className="w-6 h-6 text-slate-600" />;
    }
  };

  return (
    <section id="recent-items" className="w-full max-w-6xl mx-auto mt-16 px-4 sm:px-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Campus Feed
            </span>
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                MongoDB Live ({items.length})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <Database className="w-3 h-3" />
                Local Mode
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Recent Campus Lost & Found Reports
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Browse live reports stored in MongoDB or use filters to find your belongings.
          </p>
        </div>

        {/* Action Controls & Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh reports from MongoDB"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-600" : ""}`} />
              Refresh
            </button>
          )}

          {/* View Mode Segmented Control: Grid vs Campus Map */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === "map"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Campus Map
            </button>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilterType("lost")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === "lost"
                  ? "bg-rose-50 text-rose-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-rose-600"
              }`}
            >
              Lost ({items.filter((i) => (i.type || i.reportType) === "lost").length})
            </button>
            <button
              onClick={() => setFilterType("found")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === "found"
                  ? "bg-emerald-50 text-emerald-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-emerald-600"
              }`}
            >
              Found ({items.filter((i) => (i.type || i.reportType) === "found").length})
            </button>
          </div>
        </div>
      </div>

      {/* Error state notification if backend is offline */}
      {error && (
        <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Live Backend Unavailable:</span>
              <p className="mt-0.5 text-amber-800">{error}</p>
              <p className="mt-1 text-[11px] text-amber-700">
                Displaying local preview data. Start the Express backend with <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">npm run dev</code> in the backend folder to connect to MongoDB.
              </p>
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg font-medium text-xs shrink-0 transition"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Search and Secondary Filter Bar */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keywords, brand, or description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="id_cards">Student IDs & Cards</option>
          <option value="keys">Keys</option>
          <option value="bags_wallets">Bags & Wallets</option>
          <option value="clothing">Clothing</option>
          <option value="books_notes">Books & Notes</option>
          <option value="bottles_accessories">Accessories</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Feed Content: Interactive Campus Map View OR Responsive Grid Cards */}
      {viewMode === "map" ? (
        <div className="mt-6">
          <CampusMapView
            items={filteredItems}
            onFindMatches={onFindMatches}
            onClaimItem={onClaimItem}
          />
        </div>
      ) : isLoading && items.length === 0 ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-2xl border border-slate-200 bg-white p-4 animate-pulse space-y-3">
              <div className="h-44 bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
              <div className="h-10 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="mt-8 p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-700">No matching reports found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, selecting another category, or submit a new report using the form above.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isLost = (item.type || item.reportType) === "lost";
            const rawUrl =
              (item.imageUrls && item.imageUrls.length > 0 && item.imageUrls[0]) ||
              (item.images && item.images.length > 0 && item.images[0].previewUrl) ||
              null;
            const imageUrl = resolveImageUrl(rawUrl);
            const imagesCount =
              (item.imageUrls && item.imageUrls.length) ||
              (item.images && item.images.length) ||
              0;

            const campusZone =
              item.location?.campusZone ||
              getLocationName(item.campusLocation);

            const specificSpot =
              item.location?.specificLocation ||
              item.specificLocation;

            const displayId = item._id || item.id;

            return (
              <div
                key={displayId}
                className="group rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
              >
                {/* Image / Thumbnail Section */}
                <div className="relative h-44 bg-slate-100 overflow-hidden flex items-center justify-center">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className={`w-full h-full p-4 flex flex-col justify-between transition duration-300 ${getCategoryFallbackStyle(item.category)}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 backdrop-blur-xs text-slate-800 shadow-2xs">
                          {item.category?.replace("_", " ")}
                        </span>
                        {item.brand && (
                          <span className="text-[10px] font-semibold text-slate-700 bg-white/60 px-1.5 py-0.5 rounded">
                            {item.brand}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 my-auto">
                        <div className="p-3 rounded-2xl bg-white/90 shadow-xs text-slate-800 backdrop-blur-xs shrink-0">
                          {getCategoryFallbackIcon(item.category)}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-slate-600 block mt-0.5">
                            Indexed via S-BERT text tokens
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-black/5">
                        <span>Color: <strong>{item.primaryColor || "Standard"}</strong></span>
                        <span className="text-indigo-700 font-semibold">Semantic Match Active</span>
                      </div>
                    </div>
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-xs ${
                        isLost
                          ? "bg-rose-500 text-white"
                          : "bg-emerald-500 text-white"
                      }`}
                    >
                      {isLost ? "Lost Item" : "Found Item"}
                    </span>
                    {imagesCount > 1 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs">
                        +{imagesCount - 1} more
                      </span>
                    )}
                  </div>

                  <span
                    className="absolute top-2.5 right-2.5 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs text-slate-700 border border-slate-200 shadow-xs truncate max-w-[130px]"
                    title={displayId}
                  >
                    #{displayId.slice(-6)}
                  </span>
                </div>

                {/* Content Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category & Brand tags */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded capitalize">
                        {item.category.replace("_", " ")}
                      </span>
                      {item.brand && (
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {item.brand}
                        </span>
                      )}
                      <span className="text-[11px] font-medium text-slate-500 ml-auto">
                        {item.primaryColor}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {item.uniqueMarks && (
                      <div className="mt-2 text-[11px] text-amber-800 bg-amber-50/80 px-2 py-1 rounded border border-amber-200/60 line-clamp-1">
                        <strong>Distinct mark:</strong> {item.uniqueMarks}
                      </div>
                    )}
                  </div>

                  {/* Metadata footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">
                        {campusZone} {specificSpot ? `— ${specificSpot}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {item.dateTime
                          ? item.dateTime.replace("T", " ").slice(0, 16)
                          : "Recently reported"}
                      </span>
                    </div>
                  </div>

                  {/* Find AI Matches Button for Lost Items */}
                  {isLost && onFindMatches && (
                    <button
                      type="button"
                      onClick={() => onFindMatches(item)}
                      className="mt-3 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-indigo-200/80 shadow-2xs cursor-pointer active:scale-98"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                      Find AI Matches (5-Weight)
                    </button>
                  )}

                  {/* Claim Button for Found Items */}
                  {!isLost && item.status === "claimed" && (
                    <div className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Claimed &amp; Ownership Verified
                    </div>
                  )}

                  {!isLost && item.status !== "claimed" && onClaimItem && (
                    <button
                      type="button"
                      onClick={() => onClaimItem(item)}
                      className="mt-3 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer active:scale-98"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Claim This Item
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
