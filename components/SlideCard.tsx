"use client";

import { motion } from "framer-motion";
import type { Slide } from "@/app/api/generate/route";

interface SlideCardProps {
  slide: Slide;
  index: number;
}

export default function SlideCard({ slide, index }: SlideCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: "easeOut" }}
      className="
        group relative rounded-xl overflow-hidden p-6
        bg-white border border-black/[0.07]
        dark:bg-gradient-to-b dark:from-white/[0.05] dark:to-white/[0.02] dark:border-white/[0.07]
        shadow-[0_2px_16px_rgba(0,0,0,0.06)]
        dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]
        hover:border-violet-300 dark:hover:border-violet-500/30
        hover:shadow-[0_4px_24px_rgba(139,92,246,0.1)]
        dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(139,92,246,0.15)]
        transition-all duration-300
      "
    >
      {/* Top highlight line (dark mode only) */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent dark:block hidden" />

      {/* Slide number + font label */}
      <div className="flex items-center gap-2 mb-4">
        <span className="
          inline-flex items-center justify-center
          h-6 w-6 rounded-md text-xs
          bg-violet-100 text-violet-600 border border-violet-200
          dark:bg-violet-500/20 dark:text-violet-400 dark:border-violet-500/20
        ">
          {slide.slideNumber}
        </span>
        {/* Calibri declared in data per branding spec */}
        <span className="text-[10px] text-gray-300 dark:text-white/20 tracking-widest uppercase">
          slide · {slide.font}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-gray-900 dark:text-white/90 text-base mb-3 leading-snug">
        {slide.title}
      </h3>

      {/* Bullets */}
      <ul className="space-y-1.5">
        {slide.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500 dark:text-white/45">
            <span className="mt-[5px] flex-shrink-0 h-1.5 w-1.5 rounded-full bg-violet-400 dark:bg-violet-500/60" />
            {bullet}
          </li>
        ))}
      </ul>

      {/* Hover glow overlay */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-violet-500/[0.03] to-blue-500/[0.03]" />
    </motion.div>
  );
}
