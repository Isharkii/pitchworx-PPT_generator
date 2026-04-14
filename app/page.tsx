"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InputBox from "@/components/InputBox";
import SlideCard from "@/components/SlideCard";
import Loader from "@/components/Loader";
import ThemeToggle from "@/components/ThemeToggle";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import type { GenerateResponse, Slide } from "@/app/api/generate/route";

type AppState = "idle" | "loading" | "done" | "error";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [state, setState] = useState<AppState>("idle");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [gammaUrl, setGammaUrl] = useState<string | null>(null);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (themeId?: string | null) => {
    if (!prompt.trim() || state === "loading") return;

    setState("loading");
    setSlides([]);
    setGammaUrl(null);
    setExportUrl(null);
    setErrorMsg(null);

    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), themeId: themeId ?? undefined }),
      });

      const data: GenerateResponse & { error?: string } = await res.json();

      if (!res.ok || data.error) throw new Error(data.error ?? "Generation failed");

      setSlides(data.slides);
      setGammaUrl(data.gammaUrl);
      setExportUrl(data.exportUrl);
      setState("done");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  };

  return (
    <main className="relative min-h-screen bg-[--bg] overflow-x-hidden transition-colors duration-300">

      {/* ── Sidebar ── */}
      <Sidebar />

      {/* Ambient glow — subtle on light, strong on dark */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-violet-400/[0.06] dark:bg-violet-600/[0.07] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-400/[0.05] dark:bg-blue-600/[0.06] blur-[100px]" />
      </div>

      {/* ── Logo — top left ── */}
      <div className="fixed top-3 left-4 z-50">
        <Image
          src="/logo.png"
          alt="Pitchworx"
          width={150}
          height={150}
          className="w-20 md:w-32 h-auto dark:brightness-0 dark:invert transition-all duration-300"
          priority
        />
      </div>

      {/* ── Theme toggle — top right ── */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 pt-20 pb-32 md:pt-24 md:pb-16 md:pl-20">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-2xl sm:text-4xl md:text-5xl text-gray-900 dark:text-white/95 tracking-tight leading-tight mb-3" style={{ fontWeight: 700 }}>
            Pitchworx PPT Generator
          </h1>
          <p className="text-gray-400 dark:text-white/35 text-base max-w-md mx-auto leading-relaxed">
            Describe your presentation. Get polished slides in seconds.
          </p>
        </motion.div>

        {/* ── Input ── */}
        <div className="w-full max-w-2xl">
          <InputBox
            value={prompt}
            onChange={setPrompt}
            onSubmit={(themeId) => handleGenerate(themeId)}
            loading={state === "loading"}
          />
        </div>

        {/* ── Output ── */}
        <AnimatePresence>
          {(state === "loading" || state === "done" || state === "error") && (
            <motion.div
              ref={outputRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-4xl mt-14"
            >
              {state === "loading" && <Loader count={6} />}

              {state === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-red-400/20 bg-red-500/[0.06] p-6 text-center"
                >
                  <p className="text-red-500 dark:text-red-400 text-sm">{errorMsg}</p>
                  <button
                    onClick={() => setState("idle")}
                    className="mt-4 text-xs text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 transition-colors underline underline-offset-2"
                  >
                    Try again
                  </button>
                </motion.div>
              )}

              {state === "done" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Result header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                    <div>
                      <h2 className="text-gray-700 dark:text-white/80 text-sm">
                        Presentation ready
                      </h2>
                      <p className="text-gray-400 dark:text-white/30 text-xs mt-0.5">
                        {slides.length} slides · Calibri font
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {gammaUrl && (
                        <a
                          href={gammaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm
                            bg-violet-50 border border-violet-200 text-violet-600
                            dark:bg-violet-500/15 dark:border-violet-500/25 dark:text-violet-400
                            hover:bg-violet-100 dark:hover:bg-violet-500/25
                            transition-colors
                          "
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          View on Gamma
                        </a>
                      )}
                      {exportUrl && (
                        <a
                          href={exportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="
                            inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm
                            bg-gray-100 border border-gray-200 text-gray-600
                            dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-white/60
                            hover:bg-gray-200 dark:hover:bg-white/[0.08]
                            transition-colors
                          "
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download PPTX
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Slide cards — single column scrollable showcase */}
                  <div className="flex flex-col gap-5">
                    {slides.map((slide, i) => (
                      <SlideCard key={slide.slideNumber} slide={slide} index={i} />
                    ))}
                  </div>

                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => {
                        setPrompt("");
                        setState("idle");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xs text-gray-400 dark:text-white/25 hover:text-gray-600 dark:hover:text-white/50 transition-colors underline underline-offset-2"
                    >
                      Generate another
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
