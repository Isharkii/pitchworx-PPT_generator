"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";

interface InputBoxProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

interface ImagePreview {
  id: string;
  url: string;
  name: string;
}

export default function InputBox({ value, onChange, onSubmit, loading }: InputBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImagePreview[]>([]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!loading && value.trim()) onSubmit();
    }
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const previews: ImagePreview[] = files.map((f) => ({
      id: `${f.name}-${f.size}`,
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    setImages((prev) => [...prev, ...previews].slice(0, 8)); // cap at 8
    e.target.value = "";
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        className="
          relative rounded-2xl
          bg-white border border-black/[0.08]
          dark:bg-white/[0.04] dark:border-white/[0.08]
          shadow-[0_2px_16px_rgba(0,0,0,0.07)]
          dark:shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]
          backdrop-blur-xl transition-all duration-300
          focus-within:border-violet-400/60 dark:focus-within:border-violet-500/50
          focus-within:shadow-[0_2px_16px_rgba(0,0,0,0.07),0_0_0_1px_rgba(139,92,246,0.2)]
          dark:focus-within:shadow-[0_4px_24px_rgba(0,0,0,0.4),0_0_0_1px_rgba(139,92,246,0.25)]
        "
      >
        {/* Image thumbnails */}
        <AnimatePresence>
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 px-4 pt-4"
            >
              {images.map((img) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="relative group h-14 w-14 rounded-lg overflow-hidden border border-black/[0.08] dark:border-white/[0.1] flex-shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Describe your presentation…"
          rows={3}
          className="
            w-full resize-none bg-transparent px-5 py-4
            text-gray-900 placeholder-gray-400
            dark:text-white/90 dark:placeholder-white/25
            text-base leading-relaxed outline-none rounded-2xl
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        />

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-4 pb-4 pt-1">
          <div className="flex items-center gap-2">
            {/* + image upload button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              title="Add images"
              className="
                flex items-center justify-center h-8 w-8 rounded-xl
                border border-black/[0.08] dark:border-white/[0.08]
                text-gray-400 dark:text-white/30
                hover:bg-gray-100 dark:hover:bg-white/[0.07]
                hover:text-violet-600 dark:hover:text-violet-400
                hover:border-violet-300 dark:hover:border-violet-500/40
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200
              "
            >
              <Plus size={15} strokeWidth={2} />
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFiles}
            />

            <span className="text-xs text-gray-400 dark:text-white/20 select-none">
              ⌘ Enter to generate
            </span>
          </div>

          <motion.button
            onClick={onSubmit}
            disabled={loading || !value.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="
              btn-glow px-5 py-2 rounded-xl text-sm text-white
              bg-gradient-to-r from-blue-500 to-blue-600
              hover:from-green-500 hover:to-green-600
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-300
            "
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                </svg>
                Generating…
              </span>
            ) : (
              "Generate"
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
