"use client";

import React, { useEffect, useRef, useState } from "react";
import { StoredItemReport, CAMPUS_LOCATIONS } from "../types/item";
import {
  MapPin,
  Sparkles,
  ShieldCheck,
  Layers,
  Info,
  Compass,
  Play,
  RotateCcw,
  Zap,
} from "lucide-react";

interface CampusMapViewProps {
  items: StoredItemReport[];
  onFindMatches?: (item: StoredItemReport) => void;
  onClaimItem?: (item: StoredItemReport) => void;
}

// Sylhet Metropolitan City central coordinates (Kin Bridge / Zindabazar Hub)
const SYLHET_CENTER: [number, number] = [24.8949, 91.8687];

export default function CampusMapView({
  items,
  onFindMatches,
  onClaimItem,
}: CampusMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const [selectedHub, setSelectedHub] = useState<string>("all");
  const [mounted, setMounted] = useState(false);
  const [isTouring, setIsTouring] = useState(false);
  const [activeSurpriseItem, setActiveSurpriseItem] = useState<StoredItemReport | null>(null);
  const tourIntervalRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapContainerRef.current) return;

    let isSubscribed = true;

    // Dynamically load Leaflet on the client side only
    import("leaflet").then((L) => {
      if (!isSubscribed || !mapContainerRef.current) return;

      // Clean up previous map instance if it exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map centered over Sylhet Metropolitan Area
      const map = L.map(mapContainerRef.current, {
        center: SYLHET_CENTER,
        zoom: 13,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      // Add modern CartoDB Dark or OpenStreetMap tile layer
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://carto.com/">CARTO</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | FindIt Sylhet',
          maxZoom: 19,
        }
      ).addTo(map);

      // LayerGroup for markers
      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;

      // Add visual animated rings for Sylhet Metropolitan Hubs
      CAMPUS_LOCATIONS.forEach((loc) => {
        if (!loc.lat || !loc.lng) return;

        const hubCircle = L.circle([loc.lat, loc.lng], {
          color: "#4f46e5",
          fillColor: "#818cf8",
          fillOpacity: 0.15,
          radius: 180,
          weight: 1.5,
          dashArray: "4, 4",
        }).addTo(map);

        hubCircle.bindTooltip(
          `<div style="font-family: inherit; font-size: 11px; font-weight: 700; color: #1e1b4b;">
            📍 ${loc.name}
            <div style="font-size: 9px; color: #6366f1; font-weight: 600;">${loc.zone}</div>
          </div>`,
          {
            permanent: false,
            direction: "top",
            className: "sylhet-hub-tooltip",
          }
        );
      });

      // Group items by location to jitter overlapping markers slightly
      const locationCounts: { [key: string]: number } = {};

      items.forEach((item, index) => {
        const itemType = item.type || item.reportType || "lost";
        const isLost = itemType === "lost";
        const locId = item.campusLocation || item.location?.campusZone || "other";
        const campusLoc =
          CAMPUS_LOCATIONS.find(
            (l) => l.id === locId || l.name.toLowerCase().includes(locId.toLowerCase())
          ) || CAMPUS_LOCATIONS[CAMPUS_LOCATIONS.length - 1];

        const baseLat = campusLoc.lat || SYLHET_CENTER[0];
        const baseLng = campusLoc.lng || SYLHET_CENTER[1];

        const count = locationCounts[campusLoc.id] || 0;
        locationCounts[campusLoc.id] = count + 1;
        const angle = count * 1.3;
        const radius = count > 0 ? 0.00035 * Math.sqrt(count) : 0;
        const itemLat = baseLat + radius * Math.cos(angle);
        const itemLng = baseLng + radius * Math.sin(angle);

        // Marker color and icon
        const markerBg = isLost ? "#f43f5e" : "#10b981";
        const markerBorder = isLost ? "#be123c" : "#047857";
        const markerSymbol = isLost ? "🔍" : "🎁";
        const typeLabel = isLost ? "LOST ITEM" : "FOUND ITEM";
        const typeBadgeColor = isLost
          ? "background: #ffe4e6; color: #9f1239;"
          : "background: #d1fae5; color: #065f46;";

        const customIcon = L.divIcon({
          className: "custom-map-pin",
          html: `
            <div class="marker-surprise-pop" style="position: relative; cursor: pointer; animation-delay: ${index * 0.04}s;">
              <div style="
                position: absolute;
                top: -6px;
                left: -6px;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: ${isLost ? "rgba(244, 63, 94, 0.25)" : "rgba(16, 185, 129, 0.25)"};
                animation: radarPing 2.5s infinite;
                pointer-events: none;
              "></div>
              <div style="
                background: ${markerBg};
                width: 34px;
                height: 34px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 6px 16px rgba(0,0,0,0.3);
                border: 2px solid white;
                font-size: 14px;
                transform: scale(1);
                transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
              " onmouseover="this.style.transform='scale(1.25)'" onmouseout="this.style.transform='scale(1)'">
                ${markerSymbol}
              </div>
              <div style="
                position: absolute;
                bottom: -4px;
                left: 13px;
                width: 8px;
                height: 8px;
                background: ${markerBorder};
                transform: rotate(45deg);
                border-radius: 1px;
              "></div>
            </div>
          `,
          iconSize: [34, 38],
          iconAnchor: [17, 38],
          popupAnchor: [0, -38],
        });

        // Determine image thumbnail
        const imageUrl =
          item.imageUrls?.[0] ||
          (item.images?.[0] ? item.images[0].previewUrl : null);

        const imageHtml = imageUrl
          ? `<div style="width: 100%; height: 110px; overflow: hidden; border-radius: 10px; margin-bottom: 8px; background: #0f172a;">
               <img src="${imageUrl}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'" />
             </div>`
          : "";

        const actionBtnHtml = isLost
          ? `<button class="btn-find-matches" data-item-id="${item._id || item.id}" style="
               display: flex;
               align-items: center;
               justify-content: center;
               gap: 6px;
               width: 100%;
               padding: 8px 12px;
               margin-top: 8px;
               border-radius: 10px;
               background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
               color: white;
               font-weight: 700;
               font-size: 11px;
               border: none;
               cursor: pointer;
               box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
             ">
               ✨ Scan AI Matches (OpenCLIP + S-BERT)
             </button>`
          : `<button class="btn-claim-item" data-item-id="${item._id || item.id}" style="
               display: flex;
               align-items: center;
               justify-content: center;
               gap: 6px;
               width: 100%;
               padding: 8px 12px;
               margin-top: 8px;
               border-radius: 10px;
               background: linear-gradient(135deg, #059669 0%, #10b981 100%);
               color: white;
               font-weight: 700;
               font-size: 11px;
               border: none;
               cursor: pointer;
               box-shadow: 0 4px 10px rgba(5, 150, 105, 0.3);
             ">
               🛡️ Claim This Item
             </button>`;

        const popupContent = `
          <div style="font-family: inherit; width: 230px; padding: 4px;">
            ${imageHtml}
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="${typeBadgeColor} font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 6px; letter-spacing: 0.5px;">
                ${typeLabel}
              </span>
              <span style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase;">
                ${item.category || "General"}
              </span>
            </div>
            <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3;">
              ${item.title}
            </h4>
            <p style="font-size: 11px; color: #475569; margin: 0 0 6px 0; line-height: 1.35; max-height: 38px; overflow: hidden;">
              ${item.description}
            </p>
            <div style="font-size: 10px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 6px; margin-top: 6px;">
              📍 <b>${campusLoc.name}</b><br/>
              ${item.specificLocation ? `📌 ${item.specificLocation}` : ""}
            </div>
            ${actionBtnHtml}
          </div>
        `;

        const marker = L.marker([itemLat, itemLng], { icon: customIcon });
        marker.bindPopup(popupContent, {
          maxWidth: 250,
          className: "findit-sylhet-popup",
        });

        // Click marker surprise trigger
        marker.on("click", () => {
          setActiveSurpriseItem(item);
        });

        markersGroup.addLayer(marker);
      });

      // Handle popup action button clicks
      map.on("popupopen", (e: any) => {
        const popupEl = e.popup.getElement();
        if (!popupEl) return;

        const matchBtn = popupEl.querySelector(".btn-find-matches");
        if (matchBtn) {
          matchBtn.addEventListener("click", () => {
            const itemId = matchBtn.getAttribute("data-item-id");
            const target = items.find((i) => (i._id || i.id) === itemId);
            if (target && onFindMatches) {
              onFindMatches(target);
            }
          });
        }

        const claimBtn = popupEl.querySelector(".btn-claim-item");
        if (claimBtn) {
          claimBtn.addEventListener("click", () => {
            const itemId = claimBtn.getAttribute("data-item-id");
            const target = items.find((i) => (i._id || i.id) === itemId);
            if (target && onClaimItem) {
              onClaimItem(target);
            }
          });
        }
      });
    });

    return () => {
      isSubscribed = false;
      if (tourIntervalRef.current) {
        clearInterval(tourIntervalRef.current);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [items, mounted, onFindMatches, onClaimItem]);

  // Animated Surprise Hub Tour: Flies through Sylhet hubs one by one!
  const startSurpriseTour = () => {
    if (!mapInstanceRef.current) return;
    setIsTouring(true);

    const hubsWithItems = CAMPUS_LOCATIONS.filter((loc) =>
      items.some(
        (it) =>
          it.campusLocation === loc.id ||
          it.location?.campusZone === loc.id ||
          loc.name.toLowerCase().includes((it.campusLocation || "").toLowerCase())
      )
    );

    const tourTargets = hubsWithItems.length > 0 ? hubsWithItems : CAMPUS_LOCATIONS.slice(0, 6);
    let step = 0;

    const runStep = () => {
      if (step >= tourTargets.length) {
        setIsTouring(false);
        mapInstanceRef.current.flyTo(SYLHET_CENTER, 13, { duration: 1.5 });
        return;
      }

      const currentHub = tourTargets[step];
      if (currentHub.lat && currentHub.lng) {
        mapInstanceRef.current.flyTo([currentHub.lat, currentHub.lng], 16, {
          duration: 1.5,
        });

        // Find an item in this hub for surprise spotlight
        const hubItem = items.find(
          (it) =>
            it.campusLocation === currentHub.id ||
            it.location?.campusZone === currentHub.id
        );
        if (hubItem) {
          setActiveSurpriseItem(hubItem);
        }
      }

      step++;
      tourIntervalRef.current = setTimeout(runStep, 3500);
    };

    runStep();
  };

  const stopTour = () => {
    setIsTouring(false);
    if (tourIntervalRef.current) {
      clearTimeout(tourIntervalRef.current);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(SYLHET_CENTER, 13, { duration: 1.2 });
    }
  };

  const handlePanToHub = (hubId: string) => {
    setSelectedHub(hubId);
    if (!mapInstanceRef.current) return;

    if (hubId === "all") {
      mapInstanceRef.current.flyTo(SYLHET_CENTER, 13, { duration: 1.2 });
      setActiveSurpriseItem(null);
    } else {
      const loc = CAMPUS_LOCATIONS.find((l) => l.id === hubId);
      if (loc && loc.lat && loc.lng) {
        mapInstanceRef.current.flyTo([loc.lat, loc.lng], 16, { duration: 1.2 });
        // Spotlight first item in this hub
        const hubItem = items.find(
          (it) => it.campusLocation === hubId || it.location?.campusZone === hubId
        );
        if (hubItem) {
          setActiveSurpriseItem(hubItem);
        }
      }
    }
  };

  const lostCount = items.filter((i) => (i.type || i.reportType) === "lost").length;
  const foundCount = items.filter((i) => (i.type || i.reportType) === "found").length;

  return (
    <div className="w-full bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col text-slate-100">
      {/* Map Control Bar */}
      <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white">
                Sylhet City &amp; Campus Interactive Radar Map
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Spatial Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-400">
              জিন্দাবাজার, আম্বরখানা, কদমতলী রেলস্টেশন ও ক্যাম্পাসের হারানো-পাওয়া জিনিসের রিয়েল-টাইম ম্যাপ
            </p>
          </div>
        </div>

        {/* Action Controls: Animated Surprise Tour + Jump to Hub */}
        <div className="flex flex-wrap items-center gap-2.5">
          {!isTouring ? (
            <button
              onClick={startSurpriseTour}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 transition transform hover:scale-105"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Surprise Animated Tour ✨</span>
            </button>
          ) : (
            <button
              onClick={stopTour}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/60 border border-rose-500/40 hover:bg-rose-900/60 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Stop Tour</span>
            </button>
          )}

          <select
            value={selectedHub}
            onChange={(e) => handlePanToHub(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 font-semibold text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="all">📍 All Sylhet Metropolitan Hubs</option>
            {CAMPUS_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                📍 {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Canvas with Animated Surprise Spotlight Side Panel */}
      <div className="relative w-full h-[500px] sm:h-[580px] bg-slate-950">
        {!mounted ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm animate-pulse">
            Loading Sylhet Spatial Map...
          </div>
        ) : (
          <div ref={mapContainerRef} className="w-full h-full z-0" />
        )}

        {/* Surprise Spotlight Card Popup when marker or tour is active */}
        {activeSurpriseItem && (
          <div className="absolute top-4 left-4 z-[400] max-w-xs sm:max-w-sm bg-slate-900/95 border border-indigo-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                <Sparkles className="w-3 h-3 text-indigo-300 animate-spin" /> Surprise Spotlight
              </span>
              <button
                onClick={() => setActiveSurpriseItem(null)}
                className="text-slate-400 hover:text-white transition text-xs"
              >
                &times; Close
              </button>
            </div>

            <div className="flex gap-3 items-center">
              {activeSurpriseItem.imageUrls?.[0] ? (
                <img
                  src={activeSurpriseItem.imageUrls[0]}
                  alt={activeSurpriseItem.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-700"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-xl shrink-0">
                  {activeSurpriseItem.type === "lost" ? "🔍" : "🎁"}
                </div>
              )}
              <div className="overflow-hidden">
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                    activeSurpriseItem.type === "lost"
                      ? "bg-rose-500/20 text-rose-300"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {activeSurpriseItem.type === "lost" ? "Lost Report" : "Found Item"}
                </span>
                <h4 className="text-xs font-bold text-white truncate mt-1">
                  {activeSurpriseItem.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  {activeSurpriseItem.location?.specificLocation || activeSurpriseItem.specificLocation}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800 flex gap-2">
              {activeSurpriseItem.type === "lost" ? (
                <button
                  onClick={() => onFindMatches && onFindMatches(activeSurpriseItem)}
                  className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition text-center shadow-md shadow-indigo-600/30"
                >
                  ✨ AI Matches
                </button>
              ) : (
                <button
                  onClick={() => onClaimItem && onClaimItem(activeSurpriseItem)}
                  className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition text-center shadow-md shadow-emerald-600/30"
                >
                  🛡️ Claim Item
                </button>
              )}
            </div>
          </div>
        )}

        {/* Floating Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-700/80 shadow-xl flex flex-wrap items-center gap-3.5 text-xs">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Radar Legend:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-300 shadow-sm inline-block animate-ping" />
            <span className="font-semibold text-rose-300">Lost Items ({lostCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-300 shadow-sm inline-block animate-ping" />
            <span className="font-semibold text-emerald-300">Found Items ({foundCount})</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-300 border-l border-slate-700 pl-3">
            <span className="text-[11px] font-bold">📍 11 Sylhet Metropolitan Zones</span>
          </div>
        </div>

        {/* Tip Badge */}
        <div className="absolute top-4 right-4 z-[400] bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 shadow-lg text-[11px] text-slate-300 flex items-center gap-1.5 hidden md:flex">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          Click any pulsing radar marker or click &ldquo;Surprise Animated Tour&rdquo;
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
          Sylhet Metropolitan Area: Zindabazar, Amberkhana, Bandarbazar, Kadamtali Station &bull; 24.8949° N, 91.8687° E
        </span>
        <span className="font-bold text-indigo-400">
          Total Mapped: {items.length} Reports across Sylhet
        </span>
      </div>
    </div>
  );
}
