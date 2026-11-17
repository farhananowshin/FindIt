"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Printer,
  Download,
  X,
  QrCode as QrCodeIcon,
  ShieldCheck,
  MapPin,
  Calendar,
  Tag,
  Sparkles,
} from "lucide-react";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    _id?: string;
    id?: string;
    title: string;
    category?: string;
    primaryColor?: string;
    campusLocation?: string;
    location?: { campusZone?: string; specificLocation?: string };
    dateTime?: string;
    createdAt?: string;
  } | null;
}

export default function QrCodeModal({ isOpen, onClose, item }: QrCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const itemId = item?._id || item?.id || "SYL-ITEM-01";
  const tagCode = `TAG-SYL-${itemId.slice(-6).toUpperCase()}`;
  const verifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/explore?search=${encodeURIComponent(item?.title || "")}`
    : `https://findit.sylhet.gov.bd/items/${itemId}`;

  const locationName =
    item?.location?.campusZone ||
    item?.location?.specificLocation ||
    item?.campusLocation ||
    "Sylhet Municipal Network";

  useEffect(() => {
    if (!isOpen || !item) return;

    setIsGenerating(true);
    QRCode.toDataURL(
      verifyUrl,
      {
        width: 300,
        margin: 2,
        color: {
          dark: "#0F1411",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
      },
      (err, url) => {
        setIsGenerating(false);
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [isOpen, item, verifyUrl]);

  if (!isOpen || !item) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `findit-tag-${itemId.slice(-6)}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141715]/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#1C221E] rounded-3xl max-w-md w-full border border-[#313A33] shadow-2xl overflow-hidden flex flex-col text-[#F3F4EF]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#313A33] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#252B27] border border-[#383E39] text-[#45B58A] rounded-xl">
              <QrCodeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#F3F4EF] flex items-center gap-2">
                Physical Asset QR Tag
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#45B58A]/15 text-[#45B58A] border border-[#45B58A]/30">
                  Print Slip
                </span>
              </h3>
              <p className="text-[11px] text-[#A2ABA4]">
                Printable intake label for physical recovered items
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A2ABA4] hover:text-[#F3F4EF] hover:bg-[#252B27] rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Printable Slip */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Printable Tag Container */}
          <div
            id="printable-tag"
            className="bg-white text-slate-900 rounded-2xl p-5 border-2 border-dashed border-slate-400 shadow-md flex flex-col items-center text-center space-y-3"
          >
            {/* Header / Brand */}
            <div className="w-full border-b border-slate-300 pb-2 flex items-center justify-between text-xs">
              <div className="font-black tracking-widest text-[#141715] uppercase text-[11px]">
                FIND<span className="text-emerald-700">IT</span> • SYLHET
              </div>
              <span className="font-mono text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                {tagCode}
              </span>
            </div>

            {/* QR Code Canvas */}
            <div className="bg-white p-2 rounded-xl border border-slate-200">
              {isGenerating ? (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                  Generating secure QR code...
                </div>
              ) : qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR for ${item.title}`}
                  className="w-48 h-48 object-contain rounded-lg"
                />
              ) : null}
            </div>

            {/* Item Details on Tag */}
            <div className="w-full text-left space-y-1 pt-1 border-t border-slate-200">
              <div className="font-extrabold text-sm text-slate-900 line-clamp-1">
                {item.title}
              </div>
              <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="capitalize font-semibold">{item.category || "General"}</span>
                {item.primaryColor && (
                  <span className="text-slate-400">• {item.primaryColor}</span>
                )}
              </div>
              <div className="text-[11px] text-slate-600 flex items-center gap-1.5 line-clamp-1">
                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">{locationName}</span>
              </div>
            </div>

            {/* Bottom Security Notice */}
            <div className="w-full pt-1.5 border-t border-slate-200 text-[9px] text-slate-500 leading-tight">
              ⚡ Scan with any phone camera to verify intake ground truth or initiate ownership claim.
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-[#313A33] bg-[#141715]/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!qrDataUrl}
            className="px-3.5 py-2 rounded-xl border border-[#313A33] bg-[#1C221E] hover:bg-[#252B27] text-xs font-semibold text-[#F3F4EF] transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-[#45B58A]" />
            Download PNG
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A2ABA4] hover:text-[#F3F4EF] hover:bg-[#252B27] transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={!qrDataUrl}
              className="px-5 py-2 rounded-xl bg-[#45B58A] hover:bg-[#3ca37c] text-[#141715] text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-[#45B58A]/15 cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              Print Sticker Slip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
