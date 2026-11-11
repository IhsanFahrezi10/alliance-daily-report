"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/theme-provider";

const THEMES = [
  {
    value: "classic",
    label: "Classic",
    color: "#1b4f8a",
    accent: "#00aeef",
    emoji: "📐",
    desc: "Profesional & bersih",
    pattern: "grid",
  },
  {
    value: "forest",
    label: "Forest",
    color: "#2d6a4f",
    accent: "#52b788",
    emoji: "🌿",
    desc: "Natural & segar",
    pattern: "diagonal",
  },
  {
    value: "midnight",
    label: "Midnight",
    color: "#7c3aed",
    accent: "#a78bfa",
    emoji: "🌙",
    desc: "Elegan & premium",
    pattern: "dots",
  },
  {
    value: "sunset",
    label: "Sunset",
    color: "#c2410c",
    accent: "#fb923c",
    emoji: "🌅",
    desc: "Hangat & energik",
    pattern: "radial",
  },
  {
    value: "sakura",
    label: "Sakura",
    color: "#db2777",
    accent: "#f472b6",
    emoji: "🌸",
    desc: "Lembut & feminin",
    pattern: "petal",
  },
];

type Ripple = { id: number; x: number; y: number; color: string };

export default function ThemePicker({ current }: { current: string }) {
  const router = useRouter();
  const supabase = createClient();
  const { previewTheme, setPreviewTheme } = useTheme();
  const [loading, setLoading] = useState<string | null>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  // Normalize legacy theme names
  const normalizedCurrent = (() => {
    const map: Record<string, string> = {
      blue: "classic",
      green: "forest",
      purple: "midnight",
      orange: "sunset",
      red: "sunset",
      pink: "sakura",
    };
    return map[current] ?? current;
  })();

  const addRipple = (color: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top, color }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 800);
  };

  const handleSelect = async (value: string, color: string, e: React.MouseEvent) => {
    if (value === normalizedCurrent) return;
    addRipple(color, e);
    setLoading(value);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(null);
      toast.error("Sesi habis, login ulang");
      return;
    }

    const { error } = await supabase.from("profiles").update({ theme_accent: value }).eq("id", user.id);

    setLoading(null);

    if (error) {
      toast.error("Gagal ubah tema: " + error.message);
      return;
    }

    toast.success(`Tema ${value} aktif!`);
    router.refresh();
  };

  const activeTheme = previewTheme
    ? THEMES.find((t) => t.value === previewTheme)
    : THEMES.find((t) => t.value === normalizedCurrent);

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <span className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 font-medium">Pilih Tema</span>
        <div className="flex-1 h-px bg-brand-primary/30" />
      </div>

      <div className="border border-brand-primary/25 bg-white/40 p-6">
        <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 mb-1">5 Tema Tersedia</p>
        <p className="text-xs text-ink-muted mb-5">Hover untuk preview · Klik untuk simpan</p>

        {/* Theme cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {THEMES.map((t) => {
            const isSaved = normalizedCurrent === t.value;
            const isPreviewing = previewTheme === t.value;
            const processing = loading === t.value;
            const swatchRipples = ripples.filter((r) => r.color === t.color);

            return (
              <button
                key={t.value}
                type="button"
                onClick={(e) => handleSelect(t.value, t.color, e)}
                onMouseEnter={() => {
                  if (!loading) setPreviewTheme(t.value);
                }}
                onMouseLeave={() => setPreviewTheme(null)}
                disabled={!!loading}
                className={`relative overflow-hidden flex flex-col items-center gap-2 p-4 transition-all text-white ${
                  isSaved
                    ? "ring-2 ring-offset-2 ring-ink scale-[1.02]"
                    : isPreviewing
                      ? "ring-2 ring-offset-1 ring-ink/60 scale-[1.01]"
                      : "hover:ring-2 hover:ring-offset-1 hover:ring-ink/30 hover:scale-[1.01]"
                } ${processing ? "opacity-60" : ""}`}
                style={{ backgroundColor: t.color }}
                title={`${t.label}${isSaved ? " (aktif)" : ""}`}
                aria-label={t.label}
              >
                {/* Ripple effect */}
                <AnimatePresence>
                  {swatchRipples.map((r) => (
                    <motion.span
                      key={r.id}
                      initial={{ scale: 0, opacity: 0.7 }}
                      animate={{ scale: 10, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="absolute rounded-full pointer-events-none z-0"
                      style={{
                        backgroundColor: "#ffffff",
                        width: 24,
                        height: 24,
                        left: r.x - 12,
                        top: r.y - 12,
                      }}
                    />
                  ))}
                </AnimatePresence>

                {/* Accent stripe */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 opacity-70"
                  style={{ backgroundColor: t.accent }}
                />

                {/* Content */}
                <span className="relative z-10 text-2xl leading-none mt-1">
                  {processing ? <Loader2 size={20} className="animate-spin" /> : t.emoji}
                </span>
                <span className="relative z-10 text-[11px] font-semibold tracking-wide">{t.label}</span>
                <span className="relative z-10 text-[9px] opacity-80 text-center leading-tight">{t.desc}</span>

                {/* Active checkmark */}
                {isSaved && !processing && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center"
                  >
                    <Check size={11} style={{ color: t.color }} />
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>

        {/* Active theme info */}
        {activeTheme && (
          <motion.div
            key={activeTheme.value}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex items-center gap-3"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: activeTheme.color }} />
              <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 truncate">
                {previewTheme ? "Preview" : "Aktif"}: {activeTheme.emoji} {activeTheme.label} — {activeTheme.desc}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
