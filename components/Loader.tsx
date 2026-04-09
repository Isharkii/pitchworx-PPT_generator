"use client";

import { motion } from "framer-motion";

function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="
        rounded-xl p-6 space-y-4
        border border-black/[0.06] bg-gray-50
        dark:border-white/[0.06] dark:bg-white/[0.03]
      "
    >
      <div className="shimmer h-5 w-16 rounded-md" />
      <div className="shimmer h-6 w-3/4 rounded-lg" />
      <div className="space-y-2.5 pt-1">
        <div className="shimmer h-4 w-full rounded-md" />
        <div className="shimmer h-4 w-5/6 rounded-md" />
        <div className="shimmer h-4 w-2/3 rounded-md" />
      </div>
    </motion.div>
  );
}

export default function Loader({ count = 6 }: { count?: number }) {
  return (
    <div className="w-full space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 px-1 pb-2"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500" />
        </span>
        <span className="text-sm text-gray-400 dark:text-white/50 tracking-wide">
          Generating your presentation via Gamma…
        </span>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
    </div>
  );
}
