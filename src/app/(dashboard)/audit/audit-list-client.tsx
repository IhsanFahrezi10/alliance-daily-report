"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ArrowLeft, FileText, CheckCircle2, MessageSquare, Trash2, RotateCcw, Pencil, Plus, X, Filter, History, Shield, ShieldCheck } from "lucide-react";

type AuditLog = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  description: string | null;
  metadata: any;
  created_at: string;
  user_id: string | null;
  user_nama: string;
  user_role: string | null;
  user_batch: number | null;
};

type UserOption = { id: string; nama: string };

type ActionFilter = "all" | "create" | "update" | "delete" | "restore" | "review" | "unreview" | "comment" | "delete_comment" | "permanent_delete";

export default function AuditListClient({ logs, users }: { logs: AuditLog[]; users: UserOption[] }) {
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
  const [userFilter, setUserFilter] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      // Action filter
      if (actionFilter !== "all" && l.action !== actionFilter) return false;

      // User filter
      if (userFilter && l.user_id !== userFilter) return false;

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches = l.user_nama.toLowerCase().includes(q) || (l.description || "").toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Date range
      if (dateFrom) {
        const d = parseISO(l.created_at.slice(0, 10));
        const from = parseISO(dateFrom);
        if (d < from) return false;
      }
      if (dateTo) {
        const d = parseISO(l.created_at.slice(0, 10));
        const to = parseISO(dateTo);
        if (d > to) return false;
      }

      return true;
    });
  }, [logs, actionFilter, userFilter, search, dateFrom, dateTo]);

  const activeFilterCount = [actionFilter !== "all" ? 1 : 0, userFilter ? 1 : 0, search ? 1 : 0, dateFrom ? 1 : 0, dateTo ? 1 : 0].reduce((s, n) => s + n, 0);

  const resetFilters = () => {
    setActionFilter("all");
    setUserFilter("");
    setSearch("");
    setDateFrom("");
    setDateTo("");
  };

  // Action metadata
  const actionMeta: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    create: {
      label: "Buat",
      icon: Plus,
      color: "text-blue-700",
      bg: "bg-blue-50 border-blue-200",
    },
    update: {
      label: "Edit",
      icon: Pencil,
      color: "text-yellow-700",
      bg: "bg-yellow-50 border-yellow-200",
    },
    delete: {
      label: "Hapus",
      icon: Trash2,
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
    },
    restore: {
      label: "Pulihkan",
      icon: RotateCcw,
      color: "text-green-700",
      bg: "bg-green-50 border-green-200",
    },
    review: {
      label: "Ditinjau",
      icon: CheckCircle2,
      color: "text-green-700",
      bg: "bg-green-50 border-green-200",
    },
    unreview: {
      label: "Batal Tinjau",
      icon: RotateCcw,
      color: "text-orange-600",
      bg: "bg-orange-50 border-orange-200",
    },
    comment: {
      label: "Komentar",
      icon: MessageSquare,
      color: "text-purple-700",
      bg: "bg-purple-50 border-purple-200",
    },
    delete_comment: {
      label: "Hapus Komentar",
      icon: Trash2,
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
    },
    permanent_delete: {
      label: "Hapus Permanen",
      icon: Trash2,
      color: "text-red-800",
      bg: "bg-red-100 border-red-300",
    },
  };

  return (
    <div className="max-w-5xl space-y-6 md:space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 pb-5 md:pb-6 border-b border-brand-primary/25 flex-wrap">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <Link href="/dashboard" className="p-2 hover:bg-ink/[0.05] transition-colors shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 md:gap-3 mb-1.5 flex-wrap">
              <span className="mono text-[11px] uppercase tracking-[0.15em] text-brand-primary font-medium">Admin</span>
              <div className="h-px w-6 md:w-8 bg-brand-primary/30" />
              <span className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60">{logs.length} log</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight flex items-center gap-2">
              <History size={20} className="text-brand-primary" />
              Audit <span className="font-serif italic text-brand-primary">Log</span>
            </h1>
            <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/50 mt-1.5">Rekam jejak aktivitas sistem</p>
          </div>
        </div>
      </div>

      {/* FILTER */}
      <div className="border border-brand-primary/25 bg-white/40 p-4 md:p-5 space-y-4">
        <div>
          <label className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 block mb-2">Cari</label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama user atau deskripsi..."
              className="w-full bg-transparent border border-brand-primary/30 focus:border-brand-primary focus:outline-none py-2.5 pl-3 pr-9 text-sm transition-colors placeholder:text-ink/30"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 block mb-2">Aksi</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as ActionFilter)}
              className="w-full bg-transparent border border-brand-primary/30 focus:border-brand-primary focus:outline-none py-2 px-3 text-sm transition-colors cursor-pointer"
            >
              <option value="all">Semua Aksi</option>
              <option value="create">Buat</option>
              <option value="update">Edit</option>
              <option value="delete">Hapus</option>
              <option value="restore">Pulihkan</option>
              <option value="review">Ditinjau</option>
              <option value="unreview">Batal Tinjau</option>
              <option value="comment">Komentar</option>
              <option value="delete_comment">Hapus Komentar</option>
              <option value="permanent_delete">Hapus Permanen</option>
            </select>
          </div>

          <div>
            <label className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 block mb-2">User</label>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full bg-transparent border border-brand-primary/30 focus:border-brand-primary focus:outline-none py-2 px-3 text-sm transition-colors cursor-pointer"
            >
              <option value="">Semua User</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 block mb-2">Dari Tanggal</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-transparent border border-brand-primary/30 focus:border-brand-primary focus:outline-none py-2 px-3 text-sm font-mono transition-colors"
            />
          </div>

          <div>
            <label className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 block mb-2">Sampai Tanggal</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-transparent border border-brand-primary/30 focus:border-brand-primary focus:outline-none py-2 px-3 text-sm font-mono transition-colors"
            />
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-brand-primary/20 flex-wrap">
            <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60">
              <Filter size={11} className="inline mr-1" />
              {activeFilterCount} filter aktif · {filteredLogs.length}/{logs.length} hasil
            </p>
            <button type="button" onClick={resetFilters} className="flex items-center gap-1 mono text-[10px] uppercase tracking-[0.15em] text-red-600 hover:text-red-700 transition-colors">
              <X size={11} /> Reset
            </button>
          </div>
        )}
      </div>

      {/* LIST */}
      {filteredLogs.length === 0 ? (
        <div className="border border-dashed border-brand-primary/30 p-12 text-center">
          <History size={32} className="mx-auto text-ink/20 mb-3" />
          <p className="mono text-[11px] uppercase tracking-[0.15em] text-ink/60 mb-2">{logs.length === 0 ? "Belum ada aktivitas tercatat" : "Tidak ada hasil"}</p>
          {activeFilterCount > 0 && (
            <button type="button" onClick={resetFilters} className="mt-3 inline-flex items-center gap-1.5 border border-brand-primary/30 hover:bg-ink/[0.03] transition-colors px-4 py-2 mono text-[10px] uppercase tracking-[0.15em]">
              <X size={11} /> Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="border border-brand-primary/25 bg-white/40 divide-y divide-ink/10">
          {filteredLogs.map((log) => {
            const meta = actionMeta[log.action] || {
              label: log.action,
              icon: FileText,
              color: "text-ink/60",
              bg: "bg-ink/5 border-ink/20",
            };
            const Icon = meta.icon;
            const isStaff = log.user_role === "admin" || log.user_role === "super_admin";

            return (
              <div key={log.id} className="p-4 flex items-start gap-3">
                {/* Icon */}
                <div className={`w-8 h-8 shrink-0 flex items-center justify-center border ${meta.bg} ${meta.color}`}>
                  <Icon size={14} strokeWidth={2} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-medium truncate">{log.user_nama}</p>
                    {isStaff && log.user_role && (
                      <span className="mono text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 bg-brand-accent/15 text-brand-primary flex items-center gap-1 border border-brand-accent/30">
                        {log.user_role === "super_admin" ? <ShieldCheck size={9} /> : <Shield size={9} />}
                        {log.user_role.replace("_", " ")}
                      </span>
                    )}
                    <span className={`mono text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 border ${meta.bg} ${meta.color}`}>{meta.label}</span>
                  </div>

                  <p className="text-xs text-ink/70 leading-relaxed">{log.description || "-"}</p>

                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span
                      className="mono text-[10px] text-ink/40"
                      title={format(new Date(log.created_at), "PPpp", {
                        locale: localeId,
                      })}
                    >
                      {formatDistanceToNow(new Date(log.created_at), {
                        addSuffix: true,
                        locale: localeId,
                      })}
                    </span>
                    {log.entity_type === "report" && log.entity_id && (
                      <>
                        <span className="mono text-[10px] text-ink/30">·</span>
                        <Link href={`/report/${log.entity_id}`} className="mono text-[10px] uppercase tracking-[0.1em] text-brand-primary hover:underline">
                          Lihat Logbook →
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INFO */}
      <div className="border border-blue-200 bg-blue-50/50 p-4 text-xs text-blue-900/80 leading-relaxed">
        <p className="mono text-[10px] uppercase tracking-[0.15em] text-blue-700 mb-1 font-medium">💡 Tentang Audit Log</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>
            Semua aktivitas tercatat <strong>otomatis</strong> oleh sistem (trigger database)
          </li>
          <li>
            Menampilkan <strong>200 log terbaru</strong> — filter dengan tanggal untuk lihat history lama
          </li>
          <li>Aksi yang tercatat: buat, edit, hapus, pulihkan, tinjau, komentar</li>
          <li>
            Cocok untuk <strong>audit trail</strong> kalau ada pertanyaan "siapa yang ubah logbook ini?"
          </li>
        </ul>
      </div>
    </div>
  );
}
