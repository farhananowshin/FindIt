"use client";

import React, { useState } from "react";
import {
  Search,
  MapPin,
  Clock,
  ImageIcon,
  HelpCircle,
} from "lucide-react";
import { StoredItemReport, CAMPUS_LOCATIONS } from "../types/item";

interface RecentItemsListProps {
  items: StoredItemReport[];
}

export default function RecentItemsList({ items }: RecentItemsListProps) {
  const [filterType, setFilterType] = useState<"all" | "lost" | "found">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredItems = items.filter((item) => {
    const matchesType = filterType === "all" || item.reportType === filterType;
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;

    return matchesType && matchesSearch && matchesCategory;
  });

  const getLocationName = (id: string) => {
    return CAMPUS_LOCATIONS.find((l) => l.id === id)?.name || id;
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
            <span className="text-xs text-slate-500 font-medium">
              Live indexed reports: {items.length}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Recent Campus Lost & Found Reports
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Browse recently reported items or test how reports are cataloged for the Day 3 AI matching engine.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Items ({items.length})
          </button>
          <button
            onClick={() => setFilterType("lost")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === "lost"
                ? "bg-rose-50 text-rose-700 shadow-xs font-bold"
                : "text-slate-600 hover:text-rose-600"
            }`}
          >
            Lost ({items.filter((i) => i.reportType === "lost").length})
          </button>
          <button
            onClick={() => setFilterType("found")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === "found"
                ? "bg-emerald-50 text-emerald-700 shadow-xs font-bold"
                : "text-slate-600 hover:text-emerald-600"
            }`}
          >
            Found ({items.filter((i) => i.reportType === "found").length})
          </button>
        </div>
      </div>

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

      {/* Grid of Items */}
      {filteredItems.length === 0 ? (
        <div className="mt-8 p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-700">No matching reports found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or submit a new report using the form above.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isLost = item.reportType === "lost";
            const hasImage = item.images && item.images.length > 0;

            return (
              <div
                key={item.id}
                className="group rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
              >
                {/* Image / Thumbnail Section */}
                <div className="relative h-44 bg-slate-100 overflow-hidden flex items-center justify-center">
                  {hasImage ? (
                    <img
                      src={item.images[0].previewUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                      <ImageIcon className="w-10 h-10 mb-1 stroke-1" />
                      <span className="text-xs font-medium">No photo uploaded</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        Matched via S-BERT text tokens
                      </span>
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
                    {hasImage && item.images.length > 1 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs">
                        +{item.images.length - 1} more
                      </span>
                    )}
                  </div>

                  <span className="absolute top-2.5 right-2.5 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs text-slate-700 border border-slate-200 shadow-xs">
                    {item.id}
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
                        {getLocationName(item.campusLocation)} — {item.specificLocation}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.dateTime ? item.dateTime.replace("T", " ") : "Recently"}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
