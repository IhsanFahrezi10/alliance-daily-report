"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AtSign, Users } from "lucide-react";

export type InternProfile = {
  id: string;
  nama: string;
  avatar_url?: string | null;
  departemen_nama?: string;
};

type Props = {
  interns: InternProfile[];
  filter: string;
  selectedIndex: number;
  onSelect: (intern: InternProfile) => void;
  open: boolean;
};

export default function MentionPopup({
  interns,
  filter,
  selectedIndex,
  onSelect,
  open,
}: Props) {
  if (!open) return null;

  const cleanFilter = filter.toLowerCase().trim();
  const filtered = interns.filter((intern) =>
    intern.nama.toLowerCase().includes(cleanFilter)
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.12 }}
        className="absolute bottom-full mb-2.5 left-2 right-2 sm:left-4 sm:right-auto sm:w-80 max-w-[calc(100vw-2rem)] bg-paper border border-brand-primary/30 shadow-2xl z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-brand-primary/[0.04] border-b border-brand-primary/20">
          <div className="flex items-center gap-1.5 text-brand-primary">
            <AtSign size={13} />
            <span className="mono text-[10px] uppercase tracking-[0.15em] font-semibold">
              Tag Anak Intern
            </span>
          </div>
          <span className="mono text-[9px] text-ink/40">
            {filtered.length} ditemukan
          </span>
        </div>

        {/* List */}
        <div className="max-h-52 overflow-y-auto divide-y divide-ink/5">
          {filtered.length > 0 ? (
            filtered.map((intern, idx) => {
              const isSelected = idx === selectedIndex;
              const initial = intern.nama.charAt(0).toUpperCase();

              return (
                <button
                  key={intern.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault(); // cegah textarea blur
                    onSelect(intern);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    onSelect(intern);
                  }}
                  className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-colors ${
                    isSelected
                      ? "bg-brand-primary text-white"
                      : "hover:bg-brand-primary/10 active:bg-brand-primary/15 text-ink"
                  }`}
                >
                  {/* Avatar */}
                  {intern.avatar_url ? (
                    <div className="w-7 h-7 overflow-hidden shrink-0 border border-brand-primary/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={intern.avatar_url}
                        alt={intern.nama}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-7 h-7 flex items-center justify-center text-[11px] font-medium shrink-0 ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-brand-primary text-white"
                      }`}
                    >
                      {initial}
                    </div>
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-medium truncate leading-tight ${
                        isSelected ? "text-white" : "text-ink"
                      }`}
                    >
                      {intern.nama}
                    </p>
                    {intern.departemen_nama && (
                      <p
                        className={`mono text-[9px] uppercase tracking-[0.1em] truncate mt-0.5 ${
                          isSelected ? "text-white/80" : "text-ink/50"
                        }`}
                      >
                        {intern.departemen_nama}
                      </p>
                    )}
                  </div>

                  <span
                    className={`mono text-[9px] uppercase tracking-[0.15em] px-1.5 py-0.5 shrink-0 ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-brand-primary/10 text-brand-primary"
                    }`}
                  >
                    @tag
                  </span>
                </button>
              );
            })
          ) : (
            <div className="p-4 text-center">
              <Users size={16} className="mx-auto text-ink/30 mb-1" />
              <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/40">
                Tidak ada intern dengan nama &quot;{filter}&quot;
              </p>
            </div>
          )}
        </div>

        {/* Footer tip */}
        <div className="px-3 py-1.5 bg-ink/[0.02] border-t border-ink/10 flex items-center justify-between text-[9px] mono text-ink/40">
          <span className="hidden sm:inline">Gunakan ↑ ↓ lalu Enter</span>
          <span className="sm:hidden">Ketuk nama untuk tag</span>
          <span>Esc untuk batal</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
