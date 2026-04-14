"use client";

import { motion } from "framer-motion";
import type { Slide } from "@/app/api/generate/route";

interface SlideCardProps {
  slide: Slide;
  index: number;
}

const SLIDE_STYLES = [
  { headerBg: "bg-violet-600",   headerText: "text-white",       body: "bg-white dark:bg-[#1a1a2e]",     dot: "bg-violet-500",  accent: "border-violet-200 dark:border-violet-900" },
  { headerBg: "bg-slate-800",    headerText: "text-white",       body: "bg-white dark:bg-[#0f172a]",     dot: "bg-slate-500",   accent: "border-slate-200 dark:border-slate-800" },
  { headerBg: "bg-blue-600",     headerText: "text-white",       body: "bg-white dark:bg-[#0c1a2e]",     dot: "bg-blue-500",    accent: "border-blue-200 dark:border-blue-900" },
  { headerBg: "bg-indigo-700",   headerText: "text-white",       body: "bg-white dark:bg-[#12103a]",     dot: "bg-indigo-400",  accent: "border-indigo-200 dark:border-indigo-900" },
  { headerBg: "bg-zinc-800",     headerText: "text-white",       body: "bg-white dark:bg-[#18181b]",     dot: "bg-zinc-400",    accent: "border-zinc-200 dark:border-zinc-800" },
  { headerBg: "bg-purple-700",   headerText: "text-white",       body: "bg-white dark:bg-[#1a0a2e]",     dot: "bg-purple-400",  accent: "border-purple-200 dark:border-purple-900" },
];

export default function SlideCard({ slide, index }: SlideCardProps) {
  const style = SLIDE_STYLES[index % SLIDE_STYLES.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: "easeOut" }}
      className={`
        w-full rounded-xl overflow-hidden border ${style.accent}
        shadow-[0_2px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]
        hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.55)]
        transition-shadow duration-300
      `}
    >
      {/* ── Slide header / title bar ── */}
      <div className={`${style.headerBg} px-5 py-4 relative overflow-hidden`}>
        {/* Decorative circle */}
        <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -right-2 -bottom-8 w-14 h-14 rounded-full bg-white/[0.06] pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <h3
            className={`${style.headerText} text-sm leading-snug flex-1`}
            style={{ fontFamily: '"Helvetica Neue", Helvetica, sans-serif', fontWeight: 500 }}
          >
            {slide.title}
          </h3>
          <span
            className={`flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-md text-[10px] bg-white/20 ${style.headerText}`}
            style={{ fontFamily: '"Helvetica Neue", Helvetica, sans-serif', fontWeight: 500 }}
          >
            {slide.slideNumber}
          </span>
        </div>

        {/* Thin rule beneath title */}
        <div className="relative z-10 mt-3 h-px bg-white/20" />
      </div>

      {/* ── Slide body / content area ── */}
      <div className={`${style.body} px-5 py-4`}>
        <ul className="space-y-2">
          {slide.bullets.map((bullet, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-white/55"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, sans-serif', fontWeight: 500 }}
            >
              <span className={`mt-[6px] flex-shrink-0 h-1.5 w-1.5 rounded-full ${style.dot}`} />
              {bullet}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between">
          <span
            className="text-[9px] tracking-widest uppercase text-gray-300 dark:text-white/20"
            style={{ fontFamily: '"Helvetica Neue", Helvetica, sans-serif', fontWeight: 500 }}
          >
            {slide.font}
          </span>
          {/* Slide progress bar */}
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`h-0.5 w-3 rounded-full transition-colors ${
                  i === (slide.slideNumber - 1) % 5
                    ? style.dot
                    : "bg-gray-200 dark:bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
