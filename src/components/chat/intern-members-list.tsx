"use client";

import { useState } from "react";
import { Users, Search, AtSign, X } from "lucide-react";
import { InternProfile } from "./mention-popup";

type Props = {
  interns: InternProfile[];
  currentUserId: string;
  onTagIntern?: (intern: InternProfile) => void;
  onClose?: () => void;
};

export default function InternMembersList({
  interns,
  currentUserId,
  onTagIntern,
  onClose,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = interns.filter((i) => {
    const q = search.toLowerCase();
    return (
      i.nama.toLowerCase().includes(q) ||
      (i.departemen_nama && i.departemen_nama.toLowerCase().includes(q))
    );
  });

  return (
    <aside className="h-full flex flex-col bg-paper border-l border-brand-primary/25 w-72 sm:w-80 max-w-[85vw] shadow-2xl md:shadow-none">
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-brand-primary/20 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-brand-primary" />
            <span className="mono text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-brand-primary font-semibold">
              Anak Intern
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="mono text-[9px] sm:text-[10px] uppercase tracking-[0.15em] bg-brand-primary/10 text-brand-primary px-2 py-0.5 font-bold">
              {interns.length} Orang
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-ink/50 hover:text-ink md:hidden transition-colors rounded hover:bg-ink/[0.05]"
                aria-label="Tutup panel"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        <p className="text-[11px] sm:text-xs text-ink/60 leading-relaxed">
          Semua rekan magang aktif di Maganghub
        </p>

        {/* Search */}
        <div className="relative mt-2.5">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari teman / divisi..."
            className="w-full pl-7 pr-3 py-1.5 text-xs bg-white/70 border border-brand-primary/20 focus:border-brand-primary focus:outline-none placeholder:text-ink/40"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-ink/5 p-1.5 sm:p-2">
        {filtered.map((intern) => {
          const isMe = intern.id === currentUserId;
          const initial = intern.nama.charAt(0).toUpperCase();

          return (
            <div
              key={intern.id}
              className={`p-2 sm:p-2.5 flex items-center justify-between gap-2.5 transition-colors group ${
                isMe ? "bg-brand-primary/[0.04]" : "hover:bg-brand-primary/[0.03]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="relative shrink-0">
                  {intern.avatar_url ? (
                    <div className="w-8 h-8 overflow-hidden border border-brand-primary/25">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={intern.avatar_url}
                        alt={intern.nama}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-brand-primary text-white flex items-center justify-center text-xs font-medium">
                      {initial}
                    </div>
                  )}
                  {/* Active dot */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-paper" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate flex items-center gap-1.5">
                    <span className="truncate">{intern.nama}</span>
                    {isMe && (
                      <span className="mono text-[8px] uppercase tracking-[0.1em] text-brand-primary bg-brand-primary/10 px-1 py-0.2 shrink-0">
                        Kamu
                      </span>
                    )}
                  </p>
                  <p className="mono text-[9px] uppercase tracking-[0.1em] text-ink/50 truncate mt-0.5">
                    {intern.departemen_nama || "Magang"}
                  </p>
                </div>
              </div>

              {/* Quick Tag Button: Visible on touch / hover on desktop */}
              {onTagIntern && !isMe && (
                <button
                  type="button"
                  onClick={() => onTagIntern(intern)}
                  className="opacity-70 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 hover:bg-brand-primary/10 text-brand-primary transition-all shrink-0 rounded"
                  title={`Tag @${intern.nama}`}
                >
                  <AtSign size={14} />
                </button>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-6 text-center">
            <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/40">
              Tidak ada hasil
            </p>
          </div>
        )}
      </div>

      <div className="p-2.5 sm:p-3 border-t border-brand-primary/20 shrink-0 bg-paper/80">
        <p className="mono text-[9px] uppercase tracking-[0.15em] text-ink/40 text-center">
          🔒 Ruang obrolan khusus intern
        </p>
      </div>
    </aside>
  );
}
