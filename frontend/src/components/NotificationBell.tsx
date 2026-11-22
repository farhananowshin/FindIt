"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Sparkles,
  CheckCircle2,
  XCircle,
  Info,
  Check,
  RefreshCw,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { NotificationItem } from "../types/item";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function NotificationBell() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize subtle notification audio chime (synthesized Web Audio API)
  const playChime = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  const loadNotifications = useCallback(
    async (showLoadingSpinner = false) => {
      if (!token) return;
      if (showLoadingSpinner) setIsLoading(true);

      try {
        const res = await fetchNotifications(token);
        const newUnread = res.unreadCount || 0;
        
        // Play gentle audio alert if unread count increased while on screen
        if (newUnread > unreadCount && unreadCount > 0) {
          playChime();
        }

        setNotifications(res.data || []);
        setUnreadCount(newUnread);
      } catch (err) {
        console.warn("Failed to fetch notifications:", err);
      } finally {
        if (showLoadingSpinner) setIsLoading(false);
      }
    },
    [token, unreadCount, playChime]
  );

  // Reset notifications if user logs out
  const [prevToken, setPrevToken] = useState(token);
  if (token !== prevToken) {
    setPrevToken(token);
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
    }
  }

  // Active High-Frequency Polling: Every 10 seconds for instant responsiveness
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    fetchNotifications(token)
      .then((res) => {
        if (isMounted) {
          setNotifications(res.data || []);
          setUnreadCount(res.unreadCount || 0);
        }
      })
      .catch((err) => {
        console.warn("Notification sync notice:", err);
      });

    // Request native Web Push Notification permission if supported
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchNotifications(token)
          .then((res) => {
            if (isMounted) {
              const prev = unreadCount;
              const next = res.unreadCount || 0;
              setNotifications(res.data || []);
              setUnreadCount(next);

              // Trigger desktop web notification if new alert arrived while tab active
              if (next > prev && res.data && res.data.length > 0) {
                const latest = res.data[0];
                if (!latest.isRead && "Notification" in window && Notification.permission === "granted") {
                  new Notification(latest.title, {
                    body: latest.message,
                    icon: "/favicon.ico",
                  });
                }
                playChime();
              }
            }
          })
          .catch(() => {});
      }
    }, 10000); // 10s instant sync

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token, unreadCount, playChime]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && token) {
      loadNotifications(false);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!token) return;

    // Optimistically mark as read in local state
    if (!notif.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Call API
      try {
        await markNotificationAsRead(notif._id, token);
      } catch (err) {
        console.warn("Failed to mark notification as read on server:", err);
      }
    }

    setIsOpen(false);

    // Context-sensitive navigation
    if (notif.type === "claim_approved" || notif.type === "claim_rejected") {
      router.push("/my-claims");
    } else if (notif.type === "match_alert") {
      router.push("/explore");
    }
  };

  const handleMarkAllRead = async () => {
    if (!token || unreadCount === 0 || isMarkingAll) return;
    setIsMarkingAll(true);

    try {
      await markAllNotificationsAsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn("Failed to mark all notifications as read:", err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      const now = new Date();
      const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSecs < 60) return "Just now";
      if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
      if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button with Emerald Glow & Pulse Ping */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="View notifications"
        aria-expanded={isOpen}
        className="relative p-2 rounded-xl text-[#C4CBC5] hover:text-[#45B58A] hover:bg-[#18201B] border border-transparent hover:border-[#2C382F] transition-all cursor-pointer focus:outline-none"
      >
        <Bell className="w-5 h-5 transition-transform duration-200 hover:scale-105" />

        {/* Razor-sharp Crisp Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-extrabold text-[#111412] bg-[#45B58A] rounded-full border-2 border-[#121513] shadow-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel: Matches Dark Linear Theme */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-84 sm:w-96 bg-[#161B18] rounded-2xl shadow-2xl border border-[#2B372F] overflow-hidden z-50 animate-linear-up backdrop-blur-xl">
          {/* Header */}
          <div className="px-4 py-3 bg-[#1B221E] border-b border-[#263129] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-[#F3F4EF] tracking-tight">
                Live Notifications
              </span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#45B58A]/20 text-[#45B58A] border border-[#45B58A]/35">
                  {unreadCount} new
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#222B25] text-[#8C988E]">
                  All caught up
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isMarkingAll}
                className="text-[11px] font-semibold text-[#45B58A] hover:text-[#3da07a] transition flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List with Dark Modern Item Styling */}
          <div className="max-h-88 overflow-y-auto divide-y divide-[#212A23]">
            {isLoading ? (
              <div className="py-10 text-center text-[#8C988E]">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#45B58A]" />
                <span className="text-xs">Checking real-time updates...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-12 h-12 bg-[#1C2420] text-[#717E73] rounded-2xl border border-[#2B382F] flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Bell className="w-5 h-5 text-[#45B58A]" />
                </div>
                <p className="text-xs font-bold text-[#F3F4EF]">No Alerts Yet</p>
                <p className="text-[11px] text-[#8C988E] mt-1 max-w-[220px] mx-auto leading-relaxed">
                  When our multimodal AI identifies matching items or an owner chats, alerts appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.isRead;
                return (
                  <button
                    key={notif._id}
                    type="button"
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full text-left p-3.5 transition-all flex items-start gap-3 hover:bg-[#1E2621] cursor-pointer ${
                      isUnread ? "bg-[#18231C]/65" : "bg-[#161B18]"
                    }`}
                  >
                    {/* Icon based on notification type */}
                    <div className="shrink-0 mt-0.5">
                      {notif.type === "match_alert" ? (
                        <div className="w-8 h-8 rounded-xl bg-[#45B58A]/15 border border-[#45B58A]/35 text-[#45B58A] flex items-center justify-center shadow-xs">
                          <Sparkles className="w-4 h-4" />
                        </div>
                      ) : notif.type === "claim_approved" ? (
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 flex items-center justify-center shadow-xs">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : notif.type === "claim_rejected" ? (
                        <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-400 flex items-center justify-center shadow-xs">
                          <XCircle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-[#232D27] border border-[#313E35] text-[#A7B3A9] flex items-center justify-center shadow-xs">
                          <Info className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`text-xs truncate ${
                            isUnread ? "font-bold text-[#F3F4EF]" : "font-medium text-[#C4CBC5]"
                          }`}
                        >
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-[#717E73] shrink-0 font-medium">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#8F9C92] line-clamp-2 mt-1 leading-snug">
                        {notif.message}
                      </p>

                      {/* AI Match Score Badge if applicable */}
                      {notif.matchScore ? (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#45B58A]/20 text-[#45B58A] border border-[#45B58A]/35">
                            <Sparkles className="w-2.5 h-2.5" />
                            {notif.matchScore}% Match Found
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Unread indicator dot */}
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#45B58A] shrink-0 self-center shadow-[0_0_6px_#45B58A]" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Link to Explore */}
          <div className="p-2.5 bg-[#141815] border-t border-[#232B25] text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push("/explore");
              }}
              className="text-[11px] font-semibold text-[#8F9C92] hover:text-[#45B58A] transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <span>Explore All Live Items in Sylhet</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
