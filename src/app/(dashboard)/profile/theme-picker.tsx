"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/theme-provider";

const THEMES = [
  { value: "blue", label: "Biru", color: "#1b4f8a" },
  { value: "green", label: "Hijau", color: "#1b7a4f" },
  { value: "purple", label: "Ungu", color: "#6b3d91" },
  { value: "orange", label: "Oranye", color: "#c85c0a" },
  { value: "red", label: "Merah", color: "#a03030" },
];

type Ripple = { id: number; x: number; y: number; color: string };

export default function ThemePicker({ current }: { current: string }) {
  const router = useRouter();
  const supabase = createClient();
  const { previewTheme, setPreviewTheme } = useTheme();
  const [loading, setLoading] = useState<string | null>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const addRipple = (color: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const id = Date.now();
    setRipples((prev) => [
      ...prev,
      {
        id,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        color,
      },
    ]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 800);
  };

  const handleSelect = async (value: string, color: string, e: React.MouseEvent) => {
    if (value === current) return;

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

    toast.success("Tema berhasil diubah");
    router.refresh();
  };

  const savedColor = THEMES.find((t) => t.value === current)?.color || "#1b4f8a";
  const savedLabel = THEMES.find((t) => t.value === current)?.label || "Biru";

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <span className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 font-medium">Tema Warna</span>
        <div className="flex-1 h-px bg-brand-primary/30" />
      </div>

      <div className="border border-brand-primary/25 bg-white/40 p-6">
        <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 mb-1">Pilih Aksen Warna</p>
        <p className="text-xs text-ink-muted mb-4">Hover untuk preview · Klik untuk simpan</p>

        {/* Swatch grid */}
        <div className="grid grid-cols-5 gap-3">
          {THEMES.map((t) => {
            const isSaved = current === t.value;
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
                className={`relative aspect-square overflow-hidden flex items-center justify-center transition-all ${
                  isSaved ? "ring-2 ring-offset-2 ring-ink" : isPreviewing ? "ring-2 ring-offset-2 ring-ink/50" : "hover:ring-2 hover:ring-offset-2 hover:ring-ink/30"
                } ${processing ? "opacity-60" : ""}`}
                style={{ backgroundColor: t.color }}
                title={`${t.label}${isSaved ? " (aktif)" : ""}`}
                aria-label={t.label}
              >
                {/* Ripples */}
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

                {/* Icon */}
                <span className="relative z-10">{processing ? <Loader2 size={16} className="text-white animate-spin" /> : isSaved ? <Check size={16} className="text-white" /> : null}</span>
              </button>
            );
          })}
        </div>

        {/* Active indicator */}
        <div className="mt-5 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: savedColor }} />
          <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60">Aktif: {savedLabel}</p>
        </div>
      </div>
    </div>
  );
}
