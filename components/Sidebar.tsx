"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FolderOpen,
  Image as ImageIcon,
  Info,
  Palette,
  X,
  FileText,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

type PanelId = "new" | "projects" | "media" | "about" | "themes" | null;

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PROJECTS: { id: number; title: string; slides: number; date: string }[] = [];

const MOCK_THEMES = [
  { id: "minimal", label: "Minimal", from: "#f5f5f5", to: "#e0e0e0", text: "#111" },
  { id: "dark",    label: "Dark",    from: "#1a1a2e", to: "#16213e", text: "#fff" },
  { id: "ocean",   label: "Ocean",   from: "#0077b6", to: "#023e8a", text: "#fff" },
  { id: "sunset",  label: "Sunset",  from: "#f77f00", to: "#d62828", text: "#fff" },
  { id: "forest",  label: "Forest",  from: "#2d6a4f", to: "#1b4332", text: "#fff" },
  { id: "violet",  label: "Violet",  from: "#7c3aed", to: "#4338ca", text: "#fff" },
];

// ─── Panel content ────────────────────────────────────────────────────────────

function PanelHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between mb-1">
      <h3 className="text-sm text-gray-900 dark:text-white/90">{title}</h3>
      <button
        onClick={onClose}
        className="h-6 w-6 rounded-lg flex items-center justify-center text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all"
      >
        <X size={13} />
      </button>
    </div>
  );
}

function NewPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-5 space-y-4">
      <PanelHeader title="New Project" onClose={onClose} />
      <p className="text-sm text-gray-500 dark:text-white/40 leading-relaxed">
        Start fresh with a new AI-generated presentation.
      </p>
      <button
        onClick={onClose}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:opacity-90 transition-opacity"
      >
        <Plus size={15} />
        New Presentation
      </button>
    </div>
  );
}

function ProjectsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-5 space-y-3">
      <PanelHeader title="Projects" onClose={onClose} />
      <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
        <FolderOpen size={28} className="text-gray-300 dark:text-white/20" />
        <p className="text-sm text-gray-400 dark:text-white/30">No projects yet</p>
        <p className="text-xs text-gray-300 dark:text-white/20">Generate your first presentation to see it here</p>
      </div>
    </div>
  );
}

function MediaPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-5 space-y-3">
      <PanelHeader title="Media" onClose={onClose} />
      <p className="text-xs text-gray-400 dark:text-white/30">Images used in past presentations</p>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg overflow-hidden cursor-pointer border border-black/[0.06] dark:border-white/[0.06] bg-gray-100 dark:bg-white/[0.04] hover:border-violet-400 dark:hover:border-violet-500/40 transition-all duration-200 flex items-center justify-center"
          >
            <ImageIcon size={16} className="text-gray-300 dark:text-white/20" />
          </div>
        ))}
      </div>
      <label className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm cursor-pointer border border-dashed border-black/[0.1] dark:border-white/[0.1] text-gray-400 dark:text-white/30 hover:border-violet-400 hover:text-violet-500 dark:hover:border-violet-500/50 dark:hover:text-violet-400 transition-all duration-200">
        <Plus size={14} />
        Upload image
        <input type="file" accept="image/*" multiple className="hidden" />
      </label>
    </div>
  );
}

function AboutPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-5 space-y-4">
      <PanelHeader title="About" onClose={onClose} />
      <div className="flex flex-col items-center text-center py-3 space-y-3">
        <Image
          src="/logo.png"
          alt="PitchWorx"
          width={100}
          height={100}
          className="dark:brightness-0 dark:invert transition-all duration-300"
        />
        <p className="text-xs text-gray-400 dark:text-white/30">v0.1.0</p>
      </div>
      <div className="border-t border-black/[0.06] dark:border-white/[0.06] pt-4">
        <p className="text-sm text-gray-600 dark:text-white/50 leading-relaxed">
          At PitchWorx, we take boring presentations, bland designs, and yawn-worthy visuals and flip them into showstoppers! We&apos;re your go-to creative mischief-makers, turning ideas into head-turning designs, killer explainer videos, and branding that slaps (in the best way, of course).
        </p>
      </div>
    </div>
  );
}

function ThemesPanel({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState("minimal");
  return (
    <div className="p-5 space-y-3">
      <PanelHeader title="Themes" onClose={onClose} />
      <p className="text-xs text-gray-400 dark:text-white/30">Choose a style for your slides</p>
      <div className="grid grid-cols-3 gap-2.5">
        {MOCK_THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id)}
            className={`relative rounded-xl overflow-hidden h-20 cursor-pointer border-2 transition-all duration-200 ${
              selected === t.id
                ? "border-violet-500 shadow-[0_0_0_3px_rgba(139,92,246,0.2)]"
                : "border-transparent hover:border-violet-300 dark:hover:border-violet-500/40"
            }`}
            style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
          >
            <span className="absolute inset-x-0 bottom-2 text-center text-[11px]" style={{ color: t.text, opacity: 0.9 }}>
              {t.label}
            </span>
            {selected === t.id && (
              <span className="absolute top-2 right-2 h-4 w-4 rounded-full bg-violet-500 flex items-center justify-center">
                <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Sidebar icon button ──────────────────────────────────────────────────────

function SidebarIcon({
  icon: Icon,
  label,
  active,
  onClick,
  layout,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  layout: "vertical" | "horizontal";
}) {
  if (layout === "horizontal") {
    // Mobile bottom bar — icon + label stacked
    return (
      <button
        onClick={onClick}
        className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 ${
          active
            ? "text-violet-600 dark:text-violet-400"
            : "text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70"
        }`}
      >
        <Icon size={20} strokeWidth={1.8} />
        <span className="text-[10px] leading-none">{label}</span>
      </button>
    );
  }

  // Desktop vertical — icon with tooltip
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all duration-200 ${
          active
            ? "bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-400/30"
            : "text-gray-500 dark:text-white/50 hover:bg-violet-50 dark:hover:bg-white/[0.07] hover:text-violet-600 dark:hover:text-violet-400 border border-transparent hover:border-violet-200 dark:hover:border-violet-500/30"
        }`}
      >
        <Icon size={18} strokeWidth={1.8} />
      </button>
      <div className="pointer-events-none absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap bg-gray-900 dark:bg-white/10 text-white dark:text-white/90 border border-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50">
        {label}
      </div>
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export default function Sidebar() {
  const [activePanel, setActivePanel] = useState<PanelId>(null);

  const toggle = (id: PanelId) =>
    setActivePanel((prev) => (prev === id ? null : id));

  const icons: { id: PanelId; icon: React.ElementType; label: string }[] = [
    { id: "new",      icon: Plus,       label: "New"      },
    { id: "projects", icon: FolderOpen, label: "Projects" },
    { id: "media",    icon: ImageIcon,  label: "Media"    },
    { id: "themes",   icon: Palette,    label: "Themes"   },
    { id: "about",    icon: Info,       label: "About"    },
  ];

  const panelContent = (
    <>
      {activePanel === "new"      && <NewPanel      onClose={() => setActivePanel(null)} />}
      {activePanel === "projects" && <ProjectsPanel onClose={() => setActivePanel(null)} />}
      {activePanel === "media"    && <MediaPanel    onClose={() => setActivePanel(null)} />}
      {activePanel === "themes"   && <ThemesPanel   onClose={() => setActivePanel(null)} />}
      {activePanel === "about"    && <AboutPanel    onClose={() => setActivePanel(null)} />}
    </>
  );

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {activePanel && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30"
            onClick={() => setActivePanel(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Desktop: vertical left strip (md+) ── */}
      <div className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-40 flex-col gap-1.5 p-2 rounded-2xl bg-white dark:bg-[#16161e] border border-black/[0.09] dark:border-white/[0.1] shadow-[0_4px_24px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        {icons.map(({ id, icon, label }) => (
          <SidebarIcon key={id} icon={icon} label={label} active={activePanel === id} onClick={() => toggle(id)} layout="vertical" />
        ))}
      </div>

      {/* Desktop panel — slides in from left */}
      <AnimatePresence>
        {activePanel && (
          <motion.div
            key={`desktop-${activePanel}`}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="hidden md:block fixed left-[80px] top-1/2 -translate-y-1/2 z-40 w-96 max-h-[75vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#16161e] border border-black/[0.07] dark:border-white/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.14)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
          >
            {panelContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile: horizontal bottom tab bar ── */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 flex justify-around items-center px-2 py-2 bg-white dark:bg-[#16161e] border-t border-black/[0.08] dark:border-white/[0.1] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
        {icons.map(({ id, icon, label }) => (
          <SidebarIcon key={id} icon={icon} label={label} active={activePanel === id} onClick={() => toggle(id)} layout="horizontal" />
        ))}
      </div>

      {/* Mobile panel — slides up from bottom */}
      <AnimatePresence>
        {activePanel && (
          <motion.div
            key={`mobile-${activePanel}`}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden fixed inset-x-3 bottom-[72px] z-40 max-h-[65vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#16161e] border border-black/[0.07] dark:border-white/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
          >
            {panelContent}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
