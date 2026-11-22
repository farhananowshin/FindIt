"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Send,
  ShieldCheck,
  Lock,
  Clock,
  Sparkles,
  MapPin,
  RefreshCw,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Building2,
  FileBadge,
} from "lucide-react";
import {
  fetchClaimMessages,
  sendClaimMessage,
  ChatMessageItem,
} from "../services/api";

interface AnonymousChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimId: string;
  itemTitle: string;
  token: string;
  currentUserRole?: "admin" | "claimant" | "finder" | string;
}

export default function AnonymousChatModal({
  isOpen,
  onClose,
  claimId,
  itemTitle,
  token,
  currentUserRole = "admin",
}: AnonymousChatModalProps) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = useCallback(async () => {
    if (!claimId || !token) return;
    try {
      const data = await fetchClaimMessages(claimId, token);
      setMessages(data);
    } catch (err: unknown) {
      console.warn("Error refreshing chat:", err);
    }
  }, [claimId, token]);

  // Initial load
  useEffect(() => {
    if (!isOpen || !claimId || !token) return;
    setIsLoading(true);
    setError(null);
    loadMessages()
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load channel messages.");
      })
      .finally(() => {
        setIsLoading(false);
        setTimeout(scrollToBottom, 150);
      });
  }, [isOpen, claimId, token, loadMessages]);

  // Polling every 4 seconds while open
  useEffect(() => {
    if (!isOpen || !claimId || !token) return;
    const interval = setInterval(() => {
      loadMessages().then(() => scrollToBottom());
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen, claimId, token, loadMessages]);

  // Scroll on message change
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSending || !token) return;

    setIsSending(true);
    setError(null);
    try {
      const newMsg = await sendClaimMessage(claimId, trimmed, token);
      setMessages((prev) => [...prev, newMsg]);
      setInputText("");
      setTimeout(scrollToBottom, 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not deliver message.");
    } finally {
      setIsSending(false);
    }
  };

  const applyQuickChip = (text: string) => {
    setInputText((prev) => (prev ? `${prev} ${text}` : text));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#141715] border border-[#2B352E] rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#252E27] bg-[#171D19] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#1C2520] border border-[#2F3E33] flex items-center justify-center text-[#45B58A] shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#F3F4EF] truncate">
                  Anonymous Handover Channel
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1C2720] text-[#45B58A] border border-[#45B58A]/30">
                  <Lock className="w-2.5 h-2.5" />
                  Privacy-Protected
                </span>
              </div>
              <p className="text-xs text-[#8A958C] truncate mt-0.5">
                Regarding: <span className="text-[#C4CEC6] font-medium">{itemTitle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadMessages()}
              title="Refresh messages"
              className="p-2 rounded-xl text-[#7E8B81] hover:text-[#F3F4EF] hover:bg-[#202722] transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#45B58A]" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#7E8B81] hover:text-[#F3F4EF] hover:bg-[#202722] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Privacy Notice Banner */}
        <div className="px-4 py-2.5 bg-[#1B221E] border-b border-[#263129] flex items-center gap-2.5 text-xs text-[#9EA9A1]">
          <ShieldCheck className="w-4 h-4 text-[#45B58A] shrink-0" />
          <p className="text-[11px] sm:text-xs">
            Phone numbers and real identities remain strictly private. Coordinate pickup times and safe collection at municipal helpdesks.
          </p>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[260px] sm:min-h-[320px] bg-[#111412]">
          {isLoading && messages.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-xs text-[#8A958C] gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-[#45B58A]" />
              <span>Connecting to secure handover channel...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-xs text-[#8A958C] gap-2">
              <div className="w-10 h-10 rounded-2xl bg-[#171D19] border border-[#2B352E] flex items-center justify-center text-[#45B58A] mb-1">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-[#D3DDD5] font-semibold text-sm">No messages exchanged yet</p>
              <p className="max-w-xs text-[#7F8B82]">
                Start the handover conversation to agree on a verification checkpoint (e.g. City Corporation or Campus Helpdesk).
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isAdmin = msg.senderRole === "admin";
              const isClaimant = msg.senderRole === "claimant";
              const isFinder = msg.senderRole === "finder";

              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${isAdmin ? "items-center" : isClaimant ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 space-y-1.5 shadow-sm border ${
                      isAdmin
                        ? "bg-[#18261F] border-[#375A47] text-[#D8EFE2]"
                        : isClaimant
                        ? "bg-[#141C28] border-[#294263] text-[#D9E6F7]"
                        : "bg-[#252016] border-[#5E4C26] text-[#F9EAD2]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px]">
                      <div className="flex items-center gap-1.5 font-bold tracking-wide">
                        {isAdmin && <ShieldCheck className="w-3 h-3 text-[#45B58A]" />}
                        {isClaimant && <FileBadge className="w-3 h-3 text-blue-400" />}
                        {isFinder && <Building2 className="w-3 h-3 text-amber-400" />}
                        <span>{msg.senderAlias}</span>
                      </div>
                      <span className="text-[10px] opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-[#F3F4EF]">
                      {msg.message}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Coordination Chips */}
        <div className="p-2 sm:px-4 bg-[#141815] border-t border-[#232B25] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-semibold text-[#6E7B71] uppercase tracking-wider shrink-0 pl-1">
            Quick:
          </span>
          <button
            type="button"
            onClick={() => applyQuickChip("Meet at Sylhet City Corporation Helpdesk at 3:00 PM.")}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#1A221D] hover:bg-[#232F27] text-[#C4CEC6] border border-[#2B382F] hover:border-[#45B58A]/40 transition shrink-0"
          >
            📍 City Corp Helpdesk
          </button>
          <button
            type="button"
            onClick={() => applyQuickChip("I will bring my National ID / Photo ID for physical verification.")}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#1A221D] hover:bg-[#232F27] text-[#C4CEC6] border border-[#2B382F] hover:border-[#45B58A]/40 transition shrink-0"
          >
            🆔 Bringing ID
          </button>
          <button
            type="button"
            onClick={() => applyQuickChip("Can we verify at Shahjalal University Surma Gate checkpoint?")}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#1A221D] hover:bg-[#232F27] text-[#C4CEC6] border border-[#2B382F] hover:border-[#45B58A]/40 transition shrink-0"
          >
            🏛️ Campus Gate Checkpoint
          </button>
          <button
            type="button"
            onClick={() => applyQuickChip("Property verified and handover completed successfully. Thank you!")}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#1A221D] hover:bg-[#232F27] text-[#C4CEC6] border border-[#2B382F] hover:border-[#45B58A]/40 transition shrink-0"
          >
            ✅ Handover Confirmed
          </button>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-3 sm:p-4 bg-[#171D19] border-t border-[#252E27] flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type anonymous message (e.g. handover details)..."
            disabled={isSending}
            className="flex-1 bg-[#101311] border border-[#2A342D] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#F3F4EF] placeholder-[#6A766D] focus:outline-none focus:border-[#45B58A] transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="px-4 py-2.5 rounded-2xl bg-[#45B58A] hover:bg-[#3CA37B] disabled:opacity-40 text-[#111412] font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shrink-0 shadow-md shadow-[#45B58A]/15 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="px-4 py-1.5 bg-red-950/60 border-t border-red-800/40 text-red-300 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
