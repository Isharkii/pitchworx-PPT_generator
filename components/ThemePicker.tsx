"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GammaTheme } from "@/app/api/themes/route";

interface ThemePickerProps {
  selected: string | null;
  onSelect: (themeId: string | null) => void;
}

type LocalTheme = GammaTheme & { colors: [string, string, string] };

// Rich local theme library with visual color swatches
const LOCAL_THEMES: LocalTheme[] = [
  { id: "local-midnight",   name: "Midnight",    type: "dark",  colorKeywords: ["dark blue", "navy"],     toneKeywords: ["professional"], colors: ["#0f172a","#1e3a5f","#3b82f6"] },
  { id: "local-aurora",     name: "Aurora",      type: "dark",  colorKeywords: ["violet", "indigo"],      toneKeywords: ["creative"],     colors: ["#4c1d95","#6d28d9","#a78bfa"] },
  { id: "local-slate",      name: "Slate",       type: "light", colorKeywords: ["gray", "slate"],         toneKeywords: ["minimal"],      colors: ["#f1f5f9","#64748b","#0f172a"] },
  { id: "local-ocean",      name: "Ocean",       type: "dark",  colorKeywords: ["teal", "cyan"],          toneKeywords: ["calm"],         colors: ["#0c4a6e","#0891b2","#67e8f9"] },
  { id: "local-forest",     name: "Forest",      type: "dark",  colorKeywords: ["green", "emerald"],      toneKeywords: ["natural"],      colors: ["#14532d","#16a34a","#86efac"] },
  { id: "local-ember",      name: "Ember",       type: "dark",  colorKeywords: ["orange", "amber"],       toneKeywords: ["energetic"],    colors: ["#7c2d12","#ea580c","#fbbf24"] },
  { id: "local-rose",       name: "Rose",        type: "light", colorKeywords: ["pink", "rose"],          toneKeywords: ["warm"],         colors: ["#fff1f2","#f43f5e","#881337"] },
  { id: "local-mono",       name: "Monochrome",  type: "light", colorKeywords: ["black", "white"],        toneKeywords: ["clean"],        colors: ["#ffffff","#71717a","#09090b"] },
  { id: "local-sapphire",   name: "Sapphire",    type: "dark",  colorKeywords: ["blue", "royal"],         toneKeywords: ["trustworthy"],  colors: ["#1e3a8a","#2563eb","#93c5fd"] },
  { id: "local-gold",       name: "Gold",        type: "light", colorKeywords: ["gold", "yellow"],        toneKeywords: ["premium"],      colors: ["#1c1917","#d97706","#fef3c7"] },
  { id: "local-lavender",   name: "Lavender",    type: "light", colorKeywords: ["lavender", "purple"],    toneKeywords: ["soft"],         colors: ["#f5f3ff","#8b5cf6","#4c1d95"] },
  { id: "local-crimson",    name: "Crimson",     type: "dark",  colorKeywords: ["red", "crimson"],        toneKeywords: ["bold"],         colors: ["#450a0a","#dc2626","#fca5a5"] },
  { id: "local-arctic",     name: "Arctic",      type: "light", colorKeywords: ["ice", "sky"],            toneKeywords: ["clear"],        colors: ["#e0f2fe","#38bdf8","#0369a1"] },
  { id: "local-obsidian",   name: "Obsidian",    type: "dark",  colorKeywords: ["black", "charcoal"],     toneKeywords: ["luxury"],       colors: ["#09090b","#27272a","#71717a"] },
  { id: "local-mint",       name: "Mint",        type: "light", colorKeywords: ["mint", "green"],         toneKeywords: ["fresh"],        colors: ["#f0fdf4","#4ade80","#15803d"] },
  { id: "local-dusk",       name: "Dusk",        type: "dark",  colorKeywords: ["purple", "orange"],      toneKeywords: ["vivid"],        colors: ["#2e1065","#7c3aed","#fb923c"] },
];

const COLOR_MAP: Record<string, string> = {
  blue: "#3b82f6", navy: "#1e3a8a", "dark blue": "#1e3a5f",
  violet: "#7c3aed", indigo: "#4f46e5", purple: "#9333ea",
  teal: "#0d9488", cyan: "#06b6d4", green: "#16a34a", emerald: "#10b981",
  orange: "#ea580c", amber: "#d97706", yellow: "#eab308",
  red: "#dc2626", crimson: "#b91c1c", pink: "#ec4899", rose: "#f43f5e",
  gray: "#6b7280", slate: "#64748b", black: "#09090b", white: "#f8fafc",
  gold: "#d97706", lavender: "#a78bfa",
};

function toColor(keyword: string): string {
  return COLOR_MAP[keyword.toLowerCase()] ?? "#6b7280";
}

function getSwatchColors(theme: GammaTheme | LocalTheme): string[] {
  if ("colors" in theme) return theme.colors;
  const cols = theme.colorKeywords.slice(0, 3).map(toColor);
  while (cols.length < 3) cols.push("#e5e7eb");
  return cols;
}

export default function ThemePicker({ selected, onSelect }: ThemePickerProps) {
  const [gammaThemes, setGammaThemes] = useState<GammaTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/themes?limit=50")
      .then((r) => r.json())
      .then((data) => setGammaThemes(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allThemes: (GammaTheme | LocalTheme)[] = [
    ...LOCAL_THEMES,
    ...gammaThemes.filter(
      (g) => !LOCAL_THEMES.some((l) => l.name.toLowerCase() === g.name.toLowerCase())
    ),
  ];

  const selectedTheme = allThemes.find((t) => t.id === selected);
  const selectedColors = selectedTheme ? getSwatchColors(selectedTheme) : null;

  return (
    <div className="relative">
      {/* Trigger — compact icon button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        title={selectedTheme ? selectedTheme.name : "Choose theme"}
        className="
          flex items-center gap-1.5 h-8 px-2 rounded-lg
          border border-black/[0.08] dark:border-white/[0.08]
          text-gray-400 dark:text-white/30
          hover:bg-gray-100 dark:hover:bg-white/[0.07]
          hover:text-violet-600 dark:hover:text-violet-400
          hover:border-violet-300 dark:hover:border-violet-500/40
          transition-all duration-200
        "
      >
        {selectedTheme && selectedColors ? (
          <>
            <div className="flex gap-[2px]">
              {selectedColors.map((c, i) => (
                <div key={i} className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span
              onClick={(e) => { e.stopPropagation(); onSelect(null); }}
              className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-white/60 leading-none"
            >×</span>
          </>
        ) : (
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="
                absolute bottom-full mb-2 left-0 z-50
                w-80 max-h-96 overflow-y-auto
                rounded-2xl border border-black/[0.08] dark:border-white/[0.08]
                bg-white dark:bg-[#111]
                shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)]
                p-2
              "
            >
              {loading && (
                <p className="text-xs text-gray-400 dark:text-white/30 px-3 py-3 text-center"
                  style={{ fontFamily: '"Helvetica Neue", Helvetica, sans-serif', fontWeight: 500 }}>
                  Loading…
                </p>
              )}

              <div className="grid grid-cols-2 gap-1.5 p-1">
                {allThemes.map((theme) => {
                  const swatches = getSwatchColors(theme);
                  const isSelected = theme.id === selected;

                  return (
                    <button
                      key={theme.id}
                      onClick={() => { onSelect(isSelected ? null : theme.id); setOpen(false); }}
                      className={`
                        text-left p-3 rounded-xl transition-all duration-150 border
                        ${isSelected
                          ? "border-violet-400 dark:border-violet-500 bg-violet-50 dark:bg-violet-500/10"
                          : "border-transparent hover:border-black/[0.07] dark:hover:border-white/[0.07] hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                        }
                      `}
                    >
                      {/* Color bar preview */}
                      <div className="w-full h-8 rounded-md overflow-hidden flex">
                        {swatches.map((c, i) => (
                          <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <p
                        className="text-xs mt-2 text-gray-700 dark:text-white/70 truncate"
                        style={{ fontFamily: '"Helvetica Neue", Helvetica, sans-serif', fontWeight: 500 }}
                      >
                        {theme.name}
                      </p>
                      <p
                        className="text-[9px] text-gray-400 dark:text-white/25 truncate mt-0.5 capitalize"
                        style={{ fontFamily: '"Helvetica Neue", Helvetica, sans-serif', fontWeight: 500 }}
                      >
                        {[...theme.colorKeywords, ...theme.toneKeywords].slice(0, 3).join(" · ")}
                      </p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
