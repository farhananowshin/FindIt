"use client";

import React, { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker, PopupEvent } from "leaflet";
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
  const markersMapRef = useRef<{ [key: string]: { marker: LeafletMarker; latLng: [number, number] } }>({});

  useEffect(() => {
    let isSubscribed = true;

    import("leaflet").then((L) => {
      if (!isSubscribed || !mapContainerRef.current) return;

      // Clean up previous instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize Leaflet map
      const map = L.map(mapContainerRef.current, {
        center: SYLHET_METRO_CENTER,
        zoom: 13,
        scrollWheelZoom: true,
        zoomControl: false, // Custom position for zoom control
      });

      // Add Zoom control at top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      mapInstanceRef.current = map;

      // Add modern, stylish OpenStreetMap tile layer
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
          fillOpacity: 0.08,
          radius: 140,
          weight: 1.2,
          dashArray: "4, 4",
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

      // Markers store
      const markersObj: { [key: string]: { marker: LeafletMarker; latLng: [number, number] } } = {};
      const validPoints: [number, number][] = [];
      const locationCounts: { [key: string]: number } = {};

      // Count items per location for cluster badges
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

        // Status Colors consistent with the rest of the application
        // Lost = Amber Gold (#F59E0B), Found = Emerald Green (#45B58A)
        const markerBg = isLost ? "#F59E0B" : "#45B58A";
        const markerBorder = isLost ? "#D97706" : "#2E8A66";
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
            <div style="position: relative; cursor: pointer;">
              <div style="
                background: ${markerBg};
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 14px ${markerShadow};
                border: 2px solid #FFFFFF;
                color: #111412;
                font-weight: 800;
                font-size: 11px;
                transition: transform 0.2s ease;
              ">
                <span style="display: block; width: 8px; height: 8px; border-radius: 50%; background: #111412;"></span>
              </div>
              <div style="
                position: absolute;
                bottom: -4px;
                left: 11px;
                width: 8px;
                height: 8px;
                background: ${markerBorder};
                transform: rotate(45deg);
                border-radius: 1px;
              "></div>
              ${clusterBadgeHtml}
            </div>
          `,
          iconSize: [30, 34],
          iconAnchor: [15, 34],
          popupAnchor: [0, -34],
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
               transition: background 0.2s;
             ">
               ✨ View AI Matches
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
               transition: opacity 0.2s;
             ">
               🛡️ Claim Belonging
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
              ${item.title}
            </h4>
            <div style="font-size: 10px; color: #9EA8A0; border-top: 1px solid #2B352E; padding-top: 4px; margin-top: 4px;">
              📍 <b>${campusLoc.name.split(" (")[0]}</b>
              ${item.specificLocation ? `<br/><span style="color: #7A857C;">📌 ${item.specificLocation}</span>` : ""}
            </div>
            ${actionBtnHtml}
          </div>
        `;

        const marker = L.marker([itemLat, itemLng], { icon: customIcon }).addTo(map);
        marker.bindPopup(popupContent, {
          maxWidth: 240,
          className: "custom-dark-popup",
        });

        const itemId = item._id || item.id;
        markersObj[itemId] = { marker, latLng: [itemLat, itemLng] };
      });

      markersMapRef.current = markersObj;

      // Fit map bounds
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }

      // Delegate popup clicks
      map.on("popupopen", (e: PopupEvent) => {
        const popupEl = e.popup.getElement();
        if (!popupEl) return;

        const matchBtn = popupEl.querySelector(".btn-map-matches");
        if (matchBtn) {
          matchBtn.addEventListener("click", () => {
            const id = matchBtn.getAttribute("data-item-id");
            const target = items.find((i) => (i._id || i.id) === id);
            if (target && onFindMatches) onFindMatches(target);
          });
        }

        const claimBtn = popupEl.querySelector(".btn-map-claim");
        if (claimBtn) {
          claimBtn.addEventListener("click", () => {
            const id = claimBtn.getAttribute("data-item-id");
            const target = items.find((i) => (i._id || i.id) === id);
            if (target && onClaimItem) onClaimItem(target);
          });
        }
      });
    });

    return () => {
      isSubscribed = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [items, onFindMatches, onClaimItem]);

  // Focus and pan to specific item when selected from list
  useEffect(() => {
    if (!focusedItemId || !mapInstanceRef.current) return;
    const itemData = markersMapRef.current[focusedItemId];
    if (itemData) {
      mapInstanceRef.current.flyTo(itemData.latLng, 16, { duration: 1.1 });
      setTimeout(() => {
        itemData.marker.openPopup();
      }, 1100);
    }
  }, [focusedItemId]);

  // Pan when zone is changed
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedZone || selectedZone === "all") return;
    const loc = CAMPUS_LOCATIONS.find((l) => l.id === selectedZone);
    if (loc && loc.lat && loc.lng) {
      mapInstanceRef.current.flyTo([loc.lat, loc.lng], 15, { duration: 1 });
    }
  }, [selectedZone]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(SYLHET_METRO_CENTER, 13, { duration: 1 });
      if (onSelectZone) onSelectZone("all");
    }
  };

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Discreet floating reset view control on top-left of map (no clutter at bottom!) */}
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
