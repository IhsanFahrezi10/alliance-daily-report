"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, RotateCcw, Trash2, AlertTriangle } from "lucide-react";

type TrashItem = {
  id: string;
  tanggal: string;
  deleted_at: string;
  report_activities: { id: string }[];
};

export default function TrashListClient({ reports: initialReports }: { reports: TrashItem[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [reports, setReports] = useState(initialReports);
  const [processing, setProcessing] = useState<string | null>(null);

  const handleRestore = async (id: string) => {
    setProcessing(id);
    const { error } = await supabase.from("reports").update({ deleted_at: null }).eq("id", id);

    setProcessing(null);

    if (error) {
      toast.error("Gagal memulihkan: " + error.message);
      return;
    }

    setReports((r) => r.filter((x) => x.id !== id));
    toast.success("Logbook dipulihkan");
    router.refresh();
  };

  const handlePermanentDelete = async (id: string) => {
    if (!window.confirm("Hapus PERMANEN logbook ini? Data tidak bisa dikembalikan.")) return;

    setProcessing(id);
    const { error } = await supabase.from("reports").delete().eq("id", id);
    setProcessing(null);

    if (error) {
      toast.error("Gagal menghapus: " + error.message);
      return;
    }

    setReports((r) => r.filter((x) => x.id !== id));
    toast.success("Logbook dihapus permanen");
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 md:pb-6 border-b border-ink/15">
        <div>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="mono text-[10px] uppercase tracking-[0.25em] text-brand-primary font-medium">Arsip</span>
            <div className="h-px w-8 bg-brand-primary" />
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/40">{String(reports.length).padStart(3, "0")} Item</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight">Sampah</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-2">Logbook yang dihapus bisa dipulihkan dari sini</p>
        </div>

        <Link href="/report" className="flex items-center gap-1.5 border border-ink/20 hover:bg-ink/[0.03] transition-colors px-3 py-2.5 mono text-[10px] uppercase tracking-[0.2em] shrink-0">
          <ArrowLeft size={12} /> Kembali
        </Link>
      </div>

      {/* INFO BANNER */}
      {reports.length > 0 && (
        <div className="flex items-start gap-3 border border-yellow-200 bg-yellow-50 p-4">
          <AlertTriangle size={16} className="text-yellow-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-900 font-medium mb-0.5">Data di sini bisa dipulihkan</p>
            <p className="text-xs text-yellow-800/80">
              Klik <strong>Pulihkan</strong> untuk mengembalikan logbook, atau <strong>Hapus Permanen</strong> untuk menghapus selamanya.
            </p>
          </div>
        </div>
      )}

      {/* LIST */}
      {reports.length ? (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="border border-ink/15 bg-white/40">
              <div className="p-4 md:p-5 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-serif italic text-lg leading-tight">
                    {format(new Date(r.tanggal), "d MMMM yyyy", {
                      locale: localeId,
                    })}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="mono text-[9px] uppercase tracking-[0.15em] text-ink/40">
                      {format(new Date(r.tanggal), "EEEE", {
                        locale: localeId,
                      })}
                    </span>
                    <span className="mono text-[9px] text-ink/30">·</span>
                    <span className="mono text-[9px] uppercase tracking-[0.15em] text-ink/40">{String(r.report_activities?.length || 0).padStart(2, "0")} entri</span>
                  </div>
                  <p className="mono text-[9px] uppercase tracking-[0.15em] text-red-500/70 mt-2">
                    Dihapus:{" "}
                    {format(new Date(r.deleted_at), "d MMM yyyy, HH:mm", {
                      locale: localeId,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex border-t border-ink/10 divide-x divide-ink/10">
                <button
                  type="button"
                  onClick={() => handleRestore(r.id)}
                  disabled={processing === r.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 text-brand-primary hover:bg-brand-primary/10 active:bg-brand-primary/10 transition-colors disabled:opacity-50"
                >
                  <RotateCcw size={13} />
                  <span className="mono text-[10px] uppercase tracking-[0.15em]">{processing === r.id ? "..." : "Pulihkan"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePermanentDelete(r.id)}
                  disabled={processing === r.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 text-red-600 hover:bg-red-50 active:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  <span className="mono text-[10px] uppercase tracking-[0.15em]">Hapus Permanen</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-ink/25 p-12 text-center">
          <Trash2 size={32} className="mx-auto text-ink/20 mb-4" />
          <p className="mono text-[10px] uppercase tracking-[0.25em] text-ink/40 mb-2">Sampah kosong</p>
          <p className="text-xs text-ink-muted">Logbook yang lo hapus bakal muncul di sini</p>
        </div>
      )}
    </div>
  );
}
