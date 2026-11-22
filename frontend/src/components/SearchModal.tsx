"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  X,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Tag,
  Laptop,
  CreditCard,
  Briefcase,
  Key,
  Smartphone,
  FileText,
  CornerDownLeft,
} from "lucide-react";
import { StoredItemReport } from "../types/item";
import { resolveImageUrl } from "../services/api";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: StoredItemReport[];
  onFindMatches?: (item: StoredItemReport) => void;
  onClaimItem?: (item: StoredItemReport) => void;
  onApplySearch?: (query: string, type: "all" | "lost" | "found", category: string) => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  items,
  onFindMatches,
  onClaimItem,
  onApplySearch,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "lost" | "found">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTypeFilter("all");
      setCategoryFilter("all");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 40);
    }
  }, [isOpen]);

  // Real-time filtered items
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const itemType = (item.type || item.reportType || "lost").toLowerCase();
      const matchesType = typeFilter === "all" || itemType === typeFilter;
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

      const q = query.toLowerCase().trim();
      if (!q) return matchesType && matchesCategory;

      const locZone = item.location?.campusZone || item.campusLocation || "";
      const locSpot = item.location?.specificLocation || item.specificLocation || "";

      const matchesQuery =
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.brand && item.brand.toLowerCase().includes(q)) ||
        (item.primaryColor && item.primaryColor.toLowerCase().includes(q)) ||
        locZone.toLowerCase().includes(q) ||
        locSpot.toLowerCase().includes(q);

      return matchesType && matchesCategory && matchesQuery;
    });
  }, [items, query, typeFilter, categoryFilter]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, typeFilter, categoryFilter]);

  const handleSelectItem = (item: StoredItemReport) => {
    const isLost = (item.type || item.reportType) === "lost";
    if (isLost && onFindMatches) {
      onFindMatches(item);
    } else if (!isLost && onClaimItem) {
      onClaimItem(item);
    } else {
      onApplySearch?.(query, typeFilter, categoryFilter);
    }
    onClose();
  };

  const handleSelectAllInFeed = () => {
    onApplySearch?.(query, typeFilter, categoryFilter);
    onClose();
  };

  // Keyboard navigation: Escape, Arrow Up/Down, Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && filtered.length > 0) {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          handleSelectItem(filtered[selectedIndex]);
        } else {
          handleSelectAllInFeed();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  const getCategoryIcon = (cat?: string) => {
    switch (cat?.toLowerCase()) {
      case "electronics":
        return <Smartphone className="w-3.5 h-3.5" />;
      case "id_cards":
        return <FileText className="w-3.5 h-3.5" />;
      case "bags_wallets":
        return <Briefcase className="w-3.5 h-3.5" />;
      case "keys":
        return <Key className="w-3.5 h-3.5" />;
      default:
        return <Tag className="w-3.5 h-3.5" />;
    }
  };

  const quickChips = [
    { label: "Phones", query: "phone" },
    { label: "Wallets", query: "wallet" },
    { label: "Keys", query: "keys" },
    { label: "ID Cards", query: "id" },
    { label: "Amberkhana", query: "amberkhana" },
    { label: "Zindabazar", query: "zindabazar" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Spotlight Command Dialog */}
      <div className="relative w-full max-w-xl bg-[#161917] border border-[#2E3630] rounded-2xl shadow-2xl shadow-black/90 overflow-hidden z-10 flex flex-col max-h-[76vh]">
        
        {/* Top Search Input */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-[#2A312B] bg-[#141715]">
          <Search className="w-4 h-4 text-[#45B58A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lost or found items in Sylhet..."
            className="w-full text-sm bg-transparent text-[#F3F4EF] placeholder:text-[#6C766E] focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-[#78827A] hover:text-[#F3F4EF] hover:bg-[#202621] transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-[#78827A] bg-[#1C221E] border border-[#2A312B]">
              ESC
            </kbd>
          )}
        </div>

        {/* Minimal Type Switcher & Quick Keywords */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-2.5 border-b border-[#252C26] bg-[#141715]/60 text-xs">
          {/* Clean Type Pills */}
          <div className="flex items-center gap-1">
            {(
              [
                { id: "all", label: "All" },
                { id: "lost", label: "Lost" },
                { id: "found", label: "Found" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTypeFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  typeFilter === tab.id
                    ? "bg-[#252C26] text-[#45B58A] shadow-xs"
                    : "text-[#828B84] hover:text-[#F3F4EF]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Keywords Chips */}
          <div className="hidden sm:flex items-center gap-1 text-[11px]">
            <span className="text-[#656E67] mr-1">Suggestions:</span>
            {quickChips.slice(0, 3).map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => setQuery(chip.query)}
                className="px-2 py-0.5 rounded-md bg-[#1C221E] hover:bg-[#252C26] text-[#939D95] hover:text-[#F3F4EF] border border-[#272F29] transition cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Stream or Clean Search Prompt */}
        <div ref={listRef} className="p-2 overflow-y-auto divide-y divide-[#212722] flex-1">
          {!query.trim() ? (
            /* Clean Empty Search Prompt (No dumped recent items) */
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#141715] border border-[#272E28] flex items-center justify-center text-[#45B58A] mx-auto shadow-inner">
                <Search className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-medium text-[#D3DAD4]">
                  Search lost or found items across Sylhet
                </p>
                <p className="text-[11px] text-[#6E7871] max-w-xs mx-auto">
                  Type an item title, category, or area (e.g. &ldquo;wallet&rdquo;, &ldquo;backpack&rdquo;, &ldquo;Amberkhana&rdquo;).
                </p>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5 max-w-sm mx-auto">
                {quickChips.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setQuery(chip.query)}
                    className="px-2.5 py-1 rounded-lg bg-[#141715] hover:bg-[#202721] text-[#8F9991] hover:text-[#45B58A] border border-[#272F29] hover:border-[#45B58A]/30 text-xs transition cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2">
              <Search className="w-6 h-6 text-[#4A524C] mx-auto" />
              <p className="text-xs sm:text-sm font-medium text-[#A9B3AB]">
                No items match &quot;{query}&quot;
              </p>
              <p className="text-[11px] text-[#6E7770]">
                Try searching for a different item name, color, or location like Amberkhana or Zindabazar.
              </p>
            </div>
          ) : (
            <>
              {/* Category Header */}
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#69736B] flex items-center justify-between">
                <span>Matching Reports</span>
                <span>{filtered.length} found</span>
              </div>

              {filtered.slice(0, 7).map((item, index) => {
                const isLost = (item.type || item.reportType) === "lost";
                const isSelected = selectedIndex === index;
                const rawUrl =
                  (item.imageUrls && item.imageUrls.length > 0 && item.imageUrls[0]) ||
                  (item.images && item.images.length > 0 && item.images[0].previewUrl) ||
                  null;
                const imageUrl = resolveImageUrl(rawUrl);
                const zone = item.location?.campusZone || item.campusLocation || "Sylhet";
                const dateStr = item.dateTime
                  ? String(item.dateTime).replace("T", " ").slice(5, 16)
                  : "Recent";

                return (
                  <div
                    key={item._id || item.id}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => handleSelectItem(item)}
                    className={`px-3 py-2.5 rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                      isSelected
                        ? "bg-[#202722] text-[#F3F4EF]"
                        : "hover:bg-[#1C221E] text-[#C4CBC5]"
                    }`}
                  >
                    {/* Left: Thumbnail & Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#141715] border border-[#2A312B] overflow-hidden shrink-0 flex items-center justify-center text-[#45B58A]">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getCategoryIcon(item.category)
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isLost ? "bg-amber-400" : "bg-[#45B58A]"
                            }`}
                          />
                          <h4
                            className={`text-xs sm:text-sm font-medium truncate ${
                              isSelected ? "text-[#F3F4EF]" : "text-[#D3DAD4]"
                            }`}
                          >
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-[#78827A] truncate">
                          {zone} &bull; {dateStr}
                        </p>
                      </div>
                    </div>

                    {/* Right: Badge & Keyboard Hint */}
                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                          isLost
                            ? "bg-amber-400/10 text-amber-300"
                            : "bg-[#45B58A]/10 text-[#45B58A]"
                        }`}
                      >
                        {isLost ? "Lost" : "Found"}
                      </span>

                      {isSelected ? (
                        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-[#8F9991] bg-[#141715] border border-[#2F3731]">
                          <span>↵</span>
                        </kbd>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Clean Footer Bar */}
        <div className="px-4 py-2.5 border-t border-[#252C26] bg-[#141715] flex items-center justify-between text-[11px] text-[#717B74]">
          <div className="hidden sm:flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded bg-[#1C221E] border border-[#272F29] font-mono text-[9px] text-[#869089]">
                ↑↓
              </kbd>{" "}
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded bg-[#1C221E] border border-[#272F29] font-mono text-[9px] text-[#869089]">
                ↵
              </kbd>{" "}
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded bg-[#1C221E] border border-[#272F29] font-mono text-[9px] text-[#869089]">
                esc
              </kbd>{" "}
              close
            </span>
          </div>

          <button
            type="button"
            onClick={handleSelectAllInFeed}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#45B58A] hover:underline cursor-pointer ml-auto"
          >
            <span>View all in feed</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
