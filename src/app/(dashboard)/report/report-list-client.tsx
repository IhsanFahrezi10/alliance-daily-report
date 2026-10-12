"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Eye, Pencil, Printer, ArrowUpRight, CheckSquare, Square, X, Trash2 } from "lucide-react";

type ReportItem = {
  id: string;
  tanggal: string;
  created_at: string;
  report_activities: { id: string; status: string }[];
};

export default function ReportListClient({ reports: initialReports }: { reports: ReportItem[] }) {
  const supabase = createClient();
  const [reports, setReports] = useState(initialReports);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = reports.length > 0 && selected.size === reports.length;
  const someSelected = selected.size > 0;

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(reports.map((r) => r.id)));
  };

  const clearSelection = () => setSelected(new Set());

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus logbook ini? Bisa dipulihkan dari menu Sampah.")) return;

    const prev = reports;
    setReports((r) => r.filter((x) => x.id !== id));
    setSelected((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });

    const { error } = await supabase.from("reports").update({ deleted_at: new Date().toISOString() }).eq("id", id);

    if (error) {
      setReports(prev);
      toast.error("Gagal menghapus: " + error.message);
      return;
    }

    toast.success("Logbook dipindah ke Sampah");
  };

  const bulkPrintUrl = useMemo(() => {
    if (!someSelected) return "#";
    return `/report/bulk-print?ids=${Array.from(selected).join(",")}`;
  }, [selected, someSelected]);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 md:pb-6 border-b border-ink/15">
        <div>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="mono text-[10px] uppercase tracking-[0.25em] text-brand-primary font-medium">Logbook</span>
            <div className="h-px w-8 bg-brand-primary" />
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/40">{String(reports.length).padStart(3, "0")} Entri</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight">
            Logbook <span className="font-serif italic text-brand-primary">Saya</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-2">Pilih beberapa logbook untuk di-print sekaligus</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/trash" className="flex items-center gap-1.5 border border-ink/20 hover:bg-ink/[0.03] transition-colors px-3 py-2.5 mono text-[10px] uppercase tracking-[0.2em]">
            <Trash2 size={12} /> Sampah
          </Link>
          <Link href="/report/new" className="flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-hover transition-colors px-4 py-2.5 mono text-[10px] uppercase tracking-[0.2em]">
            <Plus size={13} /> Buat
          </Link>
        </div>
      </div>

      {/* TOOLBAR */}
      {reports.length > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 border border-ink/15 bg-white/40">
          <button type="button" onClick={toggleAll} className="flex items-center gap-2 mono text-[10px] uppercase tracking-[0.15em] text-ink/70 hover:text-brand-primary transition-colors shrink-0">
            {allSelected ? <CheckSquare size={14} className="text-brand-primary" /> : <Square size={14} />}
            <span className="hidden sm:inline">{allSelected ? "Batal Pilih Semua" : "Pilih Semua"}</span>
            <span className="sm:hidden">{allSelected ? "Batal" : "Semua"}</span>
          </button>

          {someSelected ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="mono text-[10px] uppercase tracking-[0.15em] text-brand-primary font-medium">{selected.size} dipilih</span>
              <button type="button" onClick={clearSelection} className="flex items-center gap-1 mono text-[10px] uppercase tracking-[0.15em] text-ink/50 hover:text-red-600 transition-colors">
                <X size={12} />
                <span className="hidden sm:inline">Batal</span>
              </button>
              <Link href={bulkPrintUrl} className="flex items-center gap-1.5 bg-brand-primary text-white hover:bg-brand-hover transition-colors px-3 py-1.5 mono text-[10px] uppercase tracking-[0.15em]">
                <Printer size={12} /> Print
              </Link>
            </div>
          ) : (
            <span className="mono text-[10px] uppercase tracking-[0.15em] text-ink/40">Ceklis untuk print sekaligus</span>
          )}
        </div>
      )}

      {/* LIST */}
      {reports.length ? (
        <>
          {/* Desktop */}
          <div className="hidden md:block border border-ink/15 bg-white/40">
            <div className="grid grid-cols-12 px-5 py-3 border-b border-ink/15 mono text-[9px] uppercase tracking-[0.2em] text-ink/40">
              <div className="col-span-1">#</div>
              <div className="col-span-6">Tanggal</div>
              <div className="col-span-2">Aktivitas</div>
              <div className="col-span-3 text-right">Aksi</div>
            </div>

            {reports.map((r, idx) => {
              const isChecked = selected.has(r.id);
              return (
                <div key={r.id} className={`grid grid-cols-12 px-5 py-4 border-b last:border-0 border-ink/10 items-center transition-colors group ${isChecked ? "bg-brand-primary/[0.06]" : "hover:bg-brand-primary/[0.03]"}`}>
                  <div className="col-span-1 flex items-center gap-3">
                    <button type="button" onClick={() => toggleOne(r.id)} className="text-ink/40 hover:text-brand-primary transition-colors shrink-0">
                      {isChecked ? <CheckSquare size={16} className="text-brand-primary" /> : <Square size={16} />}
                    </button>
                    <span className="mono text-[10px] text-ink/40">{String(idx + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="col-span-6">
                    <Link href={`/report/${r.id}`} className="block">
                      <p className="font-serif italic text-lg leading-none group-hover:text-brand-primary transition-colors">
                        {format(new Date(r.tanggal), "d MMMM yyyy", {
                          locale: localeId,
                        })}
                      </p>
                      <p className="mono text-[9px] uppercase tracking-[0.15em] text-ink/40 mt-1">
                        {format(new Date(r.tanggal), "EEEE", {
                          locale: localeId,
                        })}
                      </p>
                    </Link>
                  </div>
                  <div className="col-span-2">
                    <span className="mono text-[10px] text-ink-muted">{String(r.report_activities?.length || 0).padStart(2, "0")} entri</span>
                  </div>
                  <div className="col-span-3 flex justify-end gap-1">
                    <Link href={`/report/${r.id}`} title="Lihat" className="p-2 hover:bg-brand-primary/10 text-brand-primary transition-colors">
                      <Eye size={14} />
                    </Link>
                    <Link href={`/report/${r.id}/edit`} title="Edit" className="p-2 hover:bg-yellow-100 text-yellow-700 transition-colors">
                      <Pencil size={14} />
                    </Link>
                    <Link href={`/report/${r.id}/print`} title="Print PDF" className="p-2 hover:bg-green-100 text-green-700 transition-colors">
                      <Printer size={14} />
                    </Link>
                    <button type="button" onClick={() => handleDelete(r.id)} title="Hapus" className="p-2 hover:bg-red-100 text-red-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {reports.map((r) => {
              const isChecked = selected.has(r.id);
              return (
                <div key={r.id} className={`border bg-white/40 transition-colors ${isChecked ? "border-brand-primary bg-brand-primary/[0.06]" : "border-ink/15"}`}>
                  <div className="flex items-stretch">
                    <button
                      type="button"
                      onClick={() => toggleOne(r.id)}
                      className={`flex items-center justify-center px-3 border-r transition-colors shrink-0 ${isChecked ? "border-brand-primary bg-brand-primary text-white" : "border-ink/15 text-ink/40"}`}
                    >
                      {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>

                    <Link href={`/report/${r.id}`} className="block p-4 flex-1 min-w-0 active:bg-brand-primary/[0.05]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-serif italic text-base leading-tight">
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
                        </div>
                        <ArrowUpRight size={14} className="text-ink/30 shrink-0 mt-1" />
                      </div>
                    </Link>
                  </div>

                  <div className="flex border-t border-ink/10 divide-x divide-ink/10">
                    <Link href={`/report/${r.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-3 text-brand-primary active:bg-brand-primary/10 transition-colors">
                      <Eye size={13} />
                      <span className="mono text-[9px] uppercase tracking-[0.15em]">Lihat</span>
                    </Link>
                    <Link href={`/report/${r.id}/edit`} className="flex-1 flex items-center justify-center gap-1.5 py-3 text-yellow-700 active:bg-yellow-50 transition-colors">
                      <Pencil size={13} />
                      <span className="mono text-[9px] uppercase tracking-[0.15em]">Edit</span>
                    </Link>
                    <Link href={`/report/${r.id}/print`} className="flex-1 flex items-center justify-center gap-1.5 py-3 text-green-700 active:bg-green-50 transition-colors">
                      <Printer size={13} />
                      <span className="mono text-[9px] uppercase tracking-[0.15em]">Print</span>
                    </Link>
                    <button type="button" onClick={() => handleDelete(r.id)} className="flex-1 flex items-center justify-center gap-1.5 py-3 text-red-600 active:bg-red-50 transition-colors">
                      <Trash2 size={13} />
                      <span className="mono text-[9px] uppercase tracking-[0.15em]">Hapus</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="border border-dashed border-ink/25 p-8 md:p-12 text-center">
          <p className="mono text-[10px] uppercase tracking-[0.25em] text-ink/40 mb-4">Belum ada logbook</p>
          <Link href="/report/new" className="inline-flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-hover transition-colors px-5 py-3 mono text-[10px] uppercase tracking-[0.2em]">
            Buat logbook pertama
            <ArrowUpRight size={13} />
          </Link>
        </div>
      )}
    </div>
  );
}
