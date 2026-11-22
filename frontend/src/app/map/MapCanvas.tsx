"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker, LayerGroup as LeafletLayerGroup, PopupEvent } from "leaflet";
import { StoredItemReport, CAMPUS_LOCATIONS } from "../../types/item";
import { resolveImageUrl } from "../../services/api";

interface MapCanvasProps {
  items: StoredItemReport[];
  focusedItemId?: string | null;
  onFindMatches?: (item: StoredItemReport) => void;
  onClaimItem?: (item: StoredItemReport) => void;
  selectedZone?: string;
  onSelectZone?: (zoneId: string) => void;
}

// Sylhet City Center coordinates (Zindabazar / Surma Bridge metropolitan hub)
const SYLHET_METRO_CENTER: [number, number] = [24.896, 91.905];

export default function MapCanvas({
  items,
  focusedItemId,
  onFindMatches,
  onClaimItem,
  selectedZone = "all",
  onSelectZone,
}: MapCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<LeafletLayerGroup | null>(null);
  const leafletModuleRef = useRef<typeof import("leaflet") | null>(null);
  const markersMapRef = useRef<{ [key: string]: { marker: LeafletMarker; latLng: [number, number] } }>({});
  const flyToTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep references to latest callbacks and items to avoid rebuilding map
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const onFindMatchesRef = useRef(onFindMatches);
  onFindMatchesRef.current = onFindMatches;
  const onClaimItemRef = useRef(onClaimItem);
  onClaimItemRef.current = onClaimItem;

  const [mapReady, setMapReady] = useState(false);

  // Helper to strip redundant "Found" or "Lost" prefix from item titles
  const cleanTitle = (title?: string) => {
    if (!title) return "Item";
    return title.replace(/^(Found|Lost)\s*[:-]?\s*/i, "").trim();
  };

  // 1. Initialize Map ONCE on mount
  useEffect(() => {
    let isSubscribed = true;

    import("leaflet").then((L) => {
      if (!isSubscribed || !mapContainerRef.current) return;

      // Clean up previous instance or stale container _leaflet_id
      const container = mapContainerRef.current as HTMLElement & { _leaflet_id?: number };
      if (container._leaflet_id) {
        delete container._leaflet_id;
      }

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop();
          mapInstanceRef.current.remove();
        } catch (e) {
          // ignore cleanup errors
        }
        mapInstanceRef.current = null;
      }

      // Initialize Leaflet map
      const map = L.map(container, {
        center: SYLHET_METRO_CENTER,
        zoom: 13,
        scrollWheelZoom: true,
        zoomControl: false,
      });

      // Add Zoom control at bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Add standard clean OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | FindIt Sylhet',
        maxZoom: 19,
      }).addTo(map);

      // Add campus & hub zone reference circles
      CAMPUS_LOCATIONS.forEach((loc) => {
        if (!loc.lat || !loc.lng) return;

        const zoneCircle = L.circle([loc.lat, loc.lng], {
          color: "#45B58A",
          fillColor: "#45B58A",
          fillOpacity: 0.05,
          radius: 120,
          weight: 1,
          dashArray: "3, 3",
        }).addTo(map);

        zoneCircle.bindTooltip(
          `<div style="font-family: inherit; font-size: 11px;">
             <b style="color: #F3F4EF;">${loc.name}</b><br/>
             <span style="font-size: 10px; color: #45B58A;">${loc.zone}</span>
           </div>`,
          {
            permanent: false,
            direction: "top",
            className: "custom-leaflet-tooltip",
          }
        );
      });

      // Dedicated layer group for dynamic markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      leafletModuleRef.current = L;
      mapInstanceRef.current = map;

      // Delegate popup clicks safely
      map.on("popupopen", (e: PopupEvent) => {
        try {
          const popupEl = e.popup.getElement();
          if (!popupEl) return;

          const matchBtn = popupEl.querySelector(".btn-map-matches");
          if (matchBtn) {
            matchBtn.addEventListener("click", () => {
              const id = matchBtn.getAttribute("data-item-id");
              const target = itemsRef.current.find((i) => (i._id || i.id) === id);
              if (target && onFindMatchesRef.current) onFindMatchesRef.current(target);
            });
          }

          const claimBtn = popupEl.querySelector(".btn-map-claim");
          if (claimBtn) {
            claimBtn.addEventListener("click", () => {
              const id = claimBtn.getAttribute("data-item-id");
              const target = itemsRef.current.find((i) => (i._id || i.id) === id);
              if (target && onClaimItemRef.current) onClaimItemRef.current(target);
            });
          }
        } catch (err) {
          // ignore
        }
      });

      setMapReady(true);
    });

    return () => {
      isSubscribed = false;
      if (flyToTimerRef.current) {
        clearTimeout(flyToTimerRef.current);
        flyToTimerRef.current = null;
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop();
          mapInstanceRef.current.closePopup();
          mapInstanceRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapInstanceRef.current = null;
      }
      markersLayerRef.current = null;
      leafletModuleRef.current = null;
    };
  }, []);

  // 2. Update Markers when items change WITHOUT destroying the map
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !markersLayerRef.current || !leafletModuleRef.current) return;

    const L = leafletModuleRef.current;
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;

    try {
      markersLayer.clearLayers();
    } catch (e) {
      // ignore
    }

    const markersObj: { [key: string]: { marker: LeafletMarker; latLng: [number, number] } } = {};
    const validPoints: [number, number][] = [];
    const locationCounts: { [key: string]: number } = {};

    const itemsPerLocation: { [key: string]: number } = {};
    items.forEach((item) => {
      const locId = item.campusLocation || item.location?.campusZone || "other";
      itemsPerLocation[locId] = (itemsPerLocation[locId] || 0) + 1;
    });

    items.forEach((item) => {
      const itemType = (item.type || item.reportType || "lost").toLowerCase();
      const isLost = itemType === "lost";
      const locId = item.campusLocation || item.location?.campusZone || "other";
      const campusLoc =
        CAMPUS_LOCATIONS.find(
          (l) => l.id === locId || l.name.toLowerCase().includes(locId.toLowerCase())
        ) || CAMPUS_LOCATIONS[CAMPUS_LOCATIONS.length - 1];

      const baseLat = campusLoc.lat || SYLHET_METRO_CENTER[0];
      const baseLng = campusLoc.lng || SYLHET_METRO_CENTER[1];

      // Smooth spiral jitter for items sharing the exact same location coordinate
      const count = locationCounts[campusLoc.id] || 0;
      locationCounts[campusLoc.id] = count + 1;
      const angle = count * 1.35;
      const radius = count > 0 ? 0.00024 * Math.sqrt(count) : 0;
      const itemLat = baseLat + radius * Math.cos(angle);
      const itemLng = baseLng + radius * Math.sin(angle);
      validPoints.push([itemLat, itemLng]);

      const markerShadow = isLost ? "rgba(245, 158, 11, 0.45)" : "rgba(69, 181, 138, 0.45)";
      const typeLabel = isLost ? "LOST" : "FOUND";

      const locTotal = itemsPerLocation[campusLoc.id] || 1;
      const clusterBadgeHtml =
        locTotal > 1 && count === 0
          ? `<div style="
              position: absolute;
              top: -6px;
              right: -6px;
              background: #111412;
              color: #45B58A;
              border: 1.5px solid #45B58A;
              font-size: 9px;
              font-weight: 800;
              width: 17px;
              height: 17px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 6px rgba(0,0,0,0.5);
            ">${locTotal}</div>`
          : "";

      const customIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="position: relative; cursor: pointer; transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);">
            <div style="
              background: ${isLost ? "linear-gradient(135deg, #F59E0B, #D97706)" : "linear-gradient(135deg, #45B58A, #2E8A66)"};
              width: 32px;
              height: 32px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 14px ${markerShadow}, 0 2px 6px rgba(0,0,0,0.4);
              border: 2px solid rgba(255, 255, 255, 0.9);
            ">
              <span style="
                display: block;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #121513;
                border: 2px solid #FFFFFF;
                transform: rotate(45deg);
              "></span>
            </div>
            ${clusterBadgeHtml}
          </div>
        `,
        iconSize: [32, 36],
        iconAnchor: [16, 36],
        popupAnchor: [0, -36],
      });

      const rawUrl =
        (item.imageUrls && item.imageUrls[0]) ||
        (item.images && item.images[0]?.previewUrl) ||
        null;
      const imageUrl = resolveImageUrl(rawUrl);

      const imageHtml = imageUrl
        ? `<div style="width: 100%; height: 110px; overflow: hidden; border-radius: 10px; margin-bottom: 8px; background: #141715;">
             <img src="${imageUrl}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'" />
           </div>`
        : "";

      const actionBtnHtml = isLost
        ? `<button class="btn-map-matches" data-item-id="${item._id || item.id}" style="
             display: flex;
             align-items: center;
             justify-content: center;
             gap: 6px;
             width: 100%;
             padding: 8px 12px;
             margin-top: 8px;
             border-radius: 10px;
             background: #1C241E;
             color: #45B58A;
             border: 1px solid #36443A;
             font-weight: 700;
             font-size: 11px;
             cursor: pointer;
             transition: all 0.2s;
           ">
             View Matches
           </button>`
        : `<button class="btn-map-claim" data-item-id="${item._id || item.id}" style="
             display: flex;
             align-items: center;
             justify-content: center;
             gap: 6px;
             width: 100%;
             padding: 8px 12px;
             margin-top: 8px;
             border-radius: 10px;
             background: #45B58A;
             color: #111412;
             font-weight: 800;
             font-size: 11px;
             border: none;
             cursor: pointer;
             transition: all 0.2s;
           ">
             Claim Item
           </button>`;

      const popupContent = `
        <div style="
          font-family: inherit;
          min-width: 190px;
          max-width: 230px;
          background: #181D1A;
          color: #F3F4EF;
          padding: 4px;
          border-radius: 12px;
        ">
          ${imageHtml}
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="
              background: ${isLost ? "rgba(245, 158, 11, 0.15)" : "rgba(69, 181, 138, 0.15)"};
              color: ${isLost ? "#F59E0B" : "#45B58A"};
              border: 1px solid ${isLost ? "rgba(245, 158, 11, 0.3)" : "rgba(69, 181, 138, 0.3)"};
              font-size: 9px;
              font-weight: 800;
              padding: 2px 7px;
              border-radius: 9999px;
              letter-spacing: 0.05em;
            ">
              ${typeLabel}
            </span>
            <span style="font-size: 10px; color: #8F9991; font-weight: 600;">
              ${item.category?.replace("_", " ") || "Belonging"}
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: 700; color: #F3F4EF; margin: 4px 0 4px 0; line-height: 1.35;">
            ${cleanTitle(item.title)}
          </h4>
          <div style="font-size: 10px; color: #9EA8A0; border-top: 1px solid #2B352E; padding-top: 4px; margin-top: 4px;">
            📍 <b>${campusLoc.name.split(" (")[0]}</b>
            ${item.specificLocation ? `<br/><span style="color: #7A857C;">📌 ${item.specificLocation}</span>` : ""}
          </div>
          ${actionBtnHtml}
        </div>
      `;

      const marker = L.marker([itemLat, itemLng], { icon: customIcon });
      marker.bindPopup(popupContent, {
        maxWidth: 240,
        className: "custom-dark-popup",
      });

      marker.addTo(markersLayer);

      const itemId = item._id || item.id;
      markersObj[itemId] = { marker, latLng: [itemLat, itemLng] };
    });

    markersMapRef.current = markersObj;

    // Fit map bounds safely
    if (validPoints.length > 0) {
      try {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      } catch (e) {
        // ignore
      }
    }
  }, [items, mapReady]);

  // 3. Focus and pan to specific item when selected from list
  useEffect(() => {
    if (flyToTimerRef.current) {
      clearTimeout(flyToTimerRef.current);
      flyToTimerRef.current = null;
    }

    if (!focusedItemId || !mapInstanceRef.current) return;
    const itemData = markersMapRef.current[focusedItemId];
    if (itemData && mapInstanceRef.current) {
      const map = mapInstanceRef.current;
      try {
        map.flyTo(itemData.latLng, 16, { duration: 0.8 });
        flyToTimerRef.current = setTimeout(() => {
          if (mapInstanceRef.current && itemData.marker) {
            try {
              itemData.marker.openPopup();
            } catch (e) {
              // ignore
            }
          }
        }, 850);
      } catch (e) {
        // ignore
      }
    }

    return () => {
      if (flyToTimerRef.current) {
        clearTimeout(flyToTimerRef.current);
        flyToTimerRef.current = null;
      }
    };
  }, [focusedItemId]);

  // 4. Pan when zone is changed
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedZone || selectedZone === "all") return;
    const loc = CAMPUS_LOCATIONS.find((l) => l.id === selectedZone);
    if (loc && loc.lat && loc.lng) {
      try {
        mapInstanceRef.current.flyTo([loc.lat, loc.lng], 15, { duration: 0.8 });
      } catch (e) {
        // ignore
      }
    }
  }, [selectedZone]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.flyTo(SYLHET_METRO_CENTER, 13, { duration: 0.8 });
      } catch (e) {
        // ignore
      }
      if (onSelectZone) onSelectZone("all");
    }
  };

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Discreet floating reset view control on top-left of map */}
      <div className="absolute top-4 left-4 z-20">
        <button
          type="button"
          onClick={handleResetView}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#161B18]/90 hover:bg-[#202722] text-[#45B58A] border border-[#2B352E] backdrop-blur-md shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <span>🎯 Sylhet Center</span>
        </button>
      </div>
    </div>
  );
}
