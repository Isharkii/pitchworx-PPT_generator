"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GammaTheme } from "@/app/api/themes/route";

interface ThemePickerProps {
  selected: string | null;
  onSelect: (themeId: string | null) => void;
}

export default function ThemePicker({ selected, onSelect }: ThemePickerProps) {
  const [themes, setThemes] = useState<GammaTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/themes")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setThemes(data.data ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const selectedTheme = themes.find((t) => t.id === selected);

  return (
    <div className="relative">
      {/* Trigger */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((v) => !v)}
        className="
          flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs
          border border-black/[0.08] dark:border-white/[0.08]
          text-gray-500 dark:text-white/40
          hover:bg-gray-50 dark:hover:bg-white/[0.05]
          hover:text-gray-700 dark:hover:text-white/60
          transition-all duration-200
        "
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        {selectedTheme ? selectedTheme.name : "Theme"}
        {selected && (
          <span
            onClick={(e) => { e.stopPropagation(); onSelect(null); }}
            className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-white/60"
          >
            ×
          </span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="
              absolute bottom-full mb-2 left-0 z-50
              w-72 max-h-72 overflow-y-auto
              rounded-2xl border border-black/[0.08] dark:border-white/[0.08]
              bg-white dark:bg-[#111]
              shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)]
              p-2
            "
          >
            {loading && (
              <p className="text-xs text-gray-400 dark:text-white/30 px-3 py-4 text-center">
                Loading themes…
              </p>
            )}
            {error && (
              <p className="text-xs text-red-400 px-3 py-4 text-center">{error}</p>
            )}
            {!loading && !error && themes.length === 0 && (
              <p className="text-xs text-gray-400 dark:text-white/30 px-3 py-4 text-center">
                No themes found
              </p>
            )}
            {!loading && themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => { onSelect(theme.id === selected ? null : theme.id); setOpen(false); }}
                className={`
                  w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150
                  ${theme.id === selected
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                  }
                `}
              >
                <p className="text-xs font-medium">{theme.name}</p>
                {(theme.colorKeywords?.length > 0 || theme.toneKeywords?.length > 0) && (
                  <p className="text-[10px] text-gray-400 dark:text-white/25 mt-0.5 truncate">
                    {[...theme.colorKeywords, ...theme.toneKeywords].slice(0, 4).join(" · ")}
                  </p>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
