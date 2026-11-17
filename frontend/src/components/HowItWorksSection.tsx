"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

interface HowItWorksSectionProps {
  onOpenReport?: (type: "lost" | "found") => void;
  onExploreFeed?: () => void;
}

export default function HowItWorksSection({
  onOpenReport,
  onExploreFeed,
}: HowItWorksSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasEntered, setHasEntered] = useState(false);

  // Precision Viewport Observer:
  // Smoothly reveals when the section is at active reading height (-60px offset)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    const currentEl = sectionRef.current;
    if (currentEl) observer.observe(currentEl);

    return () => {
      if (currentEl) observer.unobserve(currentEl);
    };
  }, []);

  const steps = [
    {
      step: "01",
      title: "Snap & Report",
      description: "Upload a photo and tag your Sylhet location in seconds.",
      icon: Camera,
      action: () => onOpenReport?.("lost"),
      actionLabel: "Start a report",
    },
    {
      step: "02",
      title: "Smart Matching",
      description: "AI cross-references photos and details across the city.",
      icon: Sparkles,
      action: onExploreFeed,
      actionLabel: "Browse live feed",
    },
    {
      step: "03",
      title: "Verify & Recover",
      description: "Answer private proof questions and collect your item safely.",
      icon: ShieldCheck,
      action: onExploreFeed,
      actionLabel: "Learn about safety",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative py-20 sm:py-28 bg-[#141715] border-b border-[#242C26] overflow-hidden"
    >
      {/* Ambient Radial Spotlight: Soft, Deep, Non-distracting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[380px] bg-[#45B58A]/5 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* ======================================================== */}
        {/* 1. SECTION HEADER: SNAPPY LINEAR-GRADE REVEAL (500ms)    */}
        {/* ======================================================== */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          {/* Header Pill */}
          <div
            style={{ transitionDelay: hasEntered ? "0ms" : "0ms" }}
            className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              hasEntered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <div className="linear-shimmer-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#1A211D] text-[#45B58A] border border-[#2D3A30] shadow-sm cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-[#45B58A] animate-pulse" />
              <span className="tracking-wider uppercase text-[11px] font-bold">How It Works</span>
            </div>
          </div>

          {/* Header Title with Flowing Emerald Gleam */}
          <h2
            style={{ transitionDelay: hasEntered ? "80ms" : "0ms" }}
            className={`text-3xl sm:text-4xl lg:text-5xl font-black text-[#F3F4EF] tracking-tight leading-tight transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              hasEntered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Simple{" "}
            <span className="text-[#45B58A] font-black">3-Step Recovery</span>{" "}
            in{" "}
            <span className="relative inline-block">
              <span className="animate-linear-text-shimmer font-black">Sylhet</span>
            </span>
          </h2>

          {/* Header Description */}
          <p
            style={{ transitionDelay: hasEntered ? "160ms" : "0ms" }}
            className={`text-sm sm:text-base text-[#9EA8A0] max-w-lg mx-auto leading-relaxed transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              hasEntered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            A trustworthy,{" "}
            <span className="text-[#F3F4EF] font-semibold">community-powered</span>{" "}
            lost and found network connecting citizens across{" "}
            <span className="text-[#45B58A] font-semibold">Sylhet City</span>.
          </p>
        </div>

        {/* ======================================================== */}
        {/* 2. 3-COLUMN CARDS: SNAPPY STAGGER + LINEAR SPOTLIGHT     */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            // Snappy stagger delays: 200ms, 280ms, 360ms (Linear standard)
            const cardDelay = 200 + index * 80;

            return (
              /* Outer Wrapper: Handles Scroll Reveal Smoothly */
              <div
                key={item.step}
                style={{ transitionDelay: hasEntered ? `${cardDelay}ms` : "0ms" }}
                className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  hasEntered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
              >
                {/* Inner Card: True Linear-Grade Glass Surface */}
                <div
                  onClick={() => item.action?.()}
                  className="group relative rounded-2xl p-7 h-full flex flex-col justify-between space-y-6 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer overflow-hidden bg-[#161B18] hover:bg-gradient-to-b hover:from-[#1D2520] hover:to-[#141815] border border-[#263128] hover:border-[#45B58A]/50 hover:-translate-y-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_6px_20px_rgba(0,0,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(69,181,138,0.35),0_20px_40px_-15px_rgba(0,0,0,0.7),0_0_24px_rgba(69,181,138,0.14)]"
                >
                  {/* Top Specular Line: Subtly Illuminates on Hover (Linear Signature) */}
                  <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-[#45B58A] transition-all duration-500" />

                  {/* Card Content Body */}
                  <div className="space-y-4">
                    {/* Header: Tactile Keycap Step Badge & Icon Box */}
                    <div className="flex items-center justify-between">
                      {/* Step Keycap Badge */}
                      <div className="px-3 py-1 rounded-lg text-xs font-bold font-mono tracking-wider border border-[#28332A] group-hover:border-[#45B58A]/40 bg-[#121614] text-[#8F9991] group-hover:text-[#45B58A] shadow-[0_2px_0_0_#151B17,inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-all duration-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#414E44] group-hover:bg-[#45B58A] group-hover:animate-pulse transition-colors" />
                        <span>STEP {item.step}</span>
                      </div>

                      {/* Icon Container with Dual Glow on Hover */}
                      <div className="w-11 h-11 rounded-xl border border-[#2A342C] group-hover:border-[#45B58A]/60 bg-[#141815] group-hover:bg-[#1A231D] text-[#8F9991] group-hover:text-[#45B58A] group-hover:shadow-[0_0_20px_rgba(69,181,138,0.3)] flex items-center justify-center transition-all duration-300">
                        <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-[#F3F4EF] group-hover:text-white transition-colors">
                      {item.title}
                    </h3>

                    {/* Clean 1-Line Description (Linear & Apple Style) */}
                    <p className="text-sm text-[#9EA8A0] leading-relaxed group-hover:text-[#C4CBC5] transition-colors">
                      {item.description}
                    </p>
                  </div>

                  {/* Bottom Action Link with Spring Arrow */}
                  <div className="pt-4 border-t border-[#232B25] group-hover:border-[#2D3A2F] transition-colors flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-[#C4CBC5] group-hover:text-[#45B58A] transition-colors">
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}