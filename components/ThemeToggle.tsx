"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // On mount: apply system preference and listen for changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = (dark: boolean) => {
      document.documentElement.classList.toggle("dark", dark);
      setIsDark(dark);
    };

    // Set initial state from system
    apply(mq.matches);

    // Keep in sync if user changes OS theme while the tab is open
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    setIsDark(next);
  };

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.92 }}
      aria-label="Toggle theme"
      className="
        flex items-center justify-center
        h-9 w-9 rounded-xl
        border border-black/[0.08] bg-white/80 text-gray-600
        dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white/60
        hover:bg-gray-100 dark:hover:bg-white/10
        shadow-sm dark:shadow-none
        transition-all duration-200 backdrop-blur-sm
      "
    >
      {isDark ? <Sun size={15} strokeWidth={2} /> : <Moon size={15} strokeWidth={2} />}
    </motion.button>
  );
}
