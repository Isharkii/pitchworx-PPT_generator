"use client";

import { motion } from "framer-motion";
import type { Slide } from "@/app/api/generate/route";

interface SlideCardProps {
  slide: Slide;
  index: number;
}

// Maps slide title keywords to a relevant Unsplash topic image + gradient overlay
function getSlideVisual(title: string, index: number): { imageUrl: string; gradient: string } {
  const t = title.toLowerCase();

  const topics: { keywords: string[]; imageUrl: string; gradient: string }[] = [
    { keywords: ["executive", "summary", "overview", "intro", "agenda"],      imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=300&fit=crop&auto=format", gradient: "from-violet-900/80 to-indigo-900/70" },
    { keywords: ["problem", "challenge", "pain", "issue", "gap"],             imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=300&fit=crop&auto=format", gradient: "from-red-900/80 to-orange-900/70" },
    { keywords: ["solution", "approach", "feature", "product", "platform"],   imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=300&fit=crop&auto=format", gradient: "from-blue-900/80 to-cyan-900/70" },
    { keywords: ["market", "audience", "growth", "opportunity", "size"],      imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=300&fit=crop&auto=format", gradient: "from-emerald-900/80 to-teal-900/70" },
    { keywords: ["strategy", "roadmap", "plan", "phase", "timeline"],         imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=300&fit=crop&auto=format", gradient: "from-indigo-900/80 to-blue-900/70" },
    { keywords: ["metric", "kpi", "data", "analytics", "performance"],        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=300&fit=crop&auto=format", gradient: "from-violet-900/80 to-purple-900/70" },
    { keywords: ["team", "people", "talent", "resource", "execution"],        imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=300&fit=crop&auto=format", gradient: "from-slate-900/80 to-zinc-900/70" },
    { keywords: ["next", "action", "step", "call", "conclusion"],             imageUrl: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=800&h=300&fit=crop&auto=format", gradient: "from-violet-900/80 to-indigo-900/70" },
    { keywords: ["finance", "revenue", "investment", "funding", "money"],     imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=300&fit=crop&auto=format", gradient: "from-green-900/80 to-emerald-900/70" },
    { keywords: ["technology", "ai", "tech", "software", "digital"],          imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=300&fit=crop&auto=format", gradient: "from-blue-900/80 to-indigo-900/70" },
  ];

  const fallbacks = [
    { imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=300&fit=crop&auto=format", gradient: "from-violet-900/80 to-indigo-900/70" },
    { imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=300&fit=crop&auto=format", gradient: "from-slate-900/80 to-zinc-800/70" },
    { imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=300&fit=crop&auto=format", gradient: "from-blue-900/80 to-cyan-900/70" },
    { imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=300&fit=crop&auto=format", gradient: "from-indigo-900/80 to-violet-900/70" },
  ];

  const match = topics.find(({ keywords }) => keywords.some((k) => t.includes(k)));
  return match ?? fallbacks[index % fallbacks.length];
}

export default function SlideCard({ slide, index }: SlideCardProps) {
  const visual = getSlideVisual(slide.title, index);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: "easeOut" }}
      className="
        w-full rounded-2xl overflow-hidden
        border border-black/[0.07] dark:border-white/[0.07]
        shadow-[0_2px_16px_rgba(0,0,0,0.07)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        bg-white dark:bg-[#111]
        hover:shadow-[0_4px_28px_rgba(139,92,246,0.12)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]
        hover:border-violet-300/50 dark:hover:border-violet-500/20
        transition-all duration-300
      "
    >
      {/* Visual header — image + gradient overlay + title */}
      <div className="relative w-full h-44 overflow-hidden">
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={visual.imageUrl}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${visual.gradient}`} />

        {/* Slide number badge */}
        <div className="absolute top-4 left-4 z-10">
          <span
            className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-xs text-white bg-white/20 backdrop-blur-sm border border-white/20"
            style={{ fontFamily: '"Helvetica Neue", Helvetica, sans-serif', fontWeight: 500 }}
          >
            {slide.slideNumber}
          </span>
        </div>

        {/* Font label */}
        <div className="absolute top-4 right-4 z-10">
          <span
            className="text-[9px] tracking-widest uppercase text-white/50"
            style={{ fontFamily: '"Helvetica Neue", Helvetica, sans-serif', fontWeight: 500 }}
          >
            {slide.font}
          </span>
        </div>

        {/* Title on image */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          <h3
            className="text-white text-base leading-snug line-clamp-2 drop-shadow-sm"
            style={{ fontFamily: '"Helvetica Neue", Helvetica, sans-serif', fontWeight: 500 }}
          >
            {slide.title}
          </h3>
        </div>
      </div>

      {/* Bullet content */}
      <div className="p-5">
        <ul className="space-y-2.5">
          {slide.bullets.map((bullet, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm text-gray-600 dark:text-white/50"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, sans-serif', fontWeight: 500 }}
            >
              <span className="mt-[6px] flex-shrink-0 h-1.5 w-1.5 rounded-full bg-violet-400 dark:bg-violet-500/70" />
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
