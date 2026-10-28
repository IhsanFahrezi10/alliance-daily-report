"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Eye, CheckCheck, RotateCcw, CheckCircle2 } from "lucide-react";

type ReviewItem = {
  id: string;
  tanggal: string;
  attendance: string;
  user_nama: string;
  departemen_nama: string;
  activity_count: number;
  review: {
    id: string;
    reviewed_at: string;
    reviewer_nama: string;
    notes: string | null;
  } | null;
};

export default function ReviewsListClient({ reports: initialReports }: { reports: ReviewItem[] }) {
  const supabase = createClient();
  const [reports, setReports] = useState(initialReports);
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("all");
  const [processing, setProcessing] = useState<string | null>(null);

  const handleToggleReview = async (reportId: string, currentReview: any) => {
    setProcessing(reportId);

    if (currentReview) {
      // Batalin review
      const { error } = await supabase.from("report_reviews").delete().eq("id", currentReview.id);

      setProcessing(null);

      if (error) {
        toast.error("Gagal batalin: " + error.message);
        return;
      }

      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, review: null } : r)));
      toast.success("Tanda tinjau dibatalkan");
    } else {
      // Tandai review
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setProcessing(null);
        toast.error("Sesi habis, login ulang");
        return;
      }

      const { data, error } = await supabase.from("report_reviews").insert({ report_id: reportId, reviewed_by: user.id }).select(`id, reviewed_at, reviewed_by, notes, profiles:reviewed_by (nama)`).single();

      setProcessing(null);

      if (error) {
        toast.error("Gagal tandai: " + error.message);
        return;
      }

      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? {
                ...r,
                review: {
                  id: data.id,
                  reviewed_at: data.reviewed_at,
                  reviewer_nama: (data as any).profiles?.nama || "—",
                  notes: data.notes,
                },
              }
            : r,
        ),
      );
      toast.success("Logbook ditandai sudah ditinjau");
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filter === "pending") return !r.review;
    if (filter === "reviewed") return !!r.review;
    return true;
  });

  const reviewedCount = reports.filter((r) => r.review).length;
  const pendingCount = reports.length - reviewedCount;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* HEADER */}
      <div className="pb-5 md:pb-6 border-b border-ink/15">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="mono text-[10px] uppercase tracking-[0.15em] text-brand-primary font-medium">HR Approver</span>
          <div className="h-px w-8 bg-brand-primary" />
          <span className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60">{reports.length} Logbook</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight">
          Review <span className="font-serif italic text-brand-primary">Logbook</span>
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-2">Pantau dan tandai logbook yang sudah ditinjau</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-ink/15 bg-white/40 p-4">
          <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 mb-1">Sudah Ditinjau</p>
          <p className="text-2xl font-light text-green-700">{reviewedCount}</p>
        </div>
        <div className="border border-ink/15 bg-white/40 p-4">
          <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 mb-1">Belum Ditinjau</p>
          <p className="text-2xl font-light text-orange-600">{pendingCount}</p>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60">Filter:</span>
        {[
          { value: "all", label: `Semua (${reports.length})` },
          { value: "pending", label: `Belum (${pendingCount})` },
          { value: "reviewed", label: `Sudah (${reviewedCount})` },
        ].map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value as any)}
            className={`mono text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 border transition-colors ${filter === f.value ? "bg-brand-primary text-white border-brand-primary" : "border-ink/20 text-ink/60 hover:bg-ink/[0.03]"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      {filteredReports.length === 0 ? (
        <div className="border border-dashed border-ink/25 p-12 text-center">
          <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/40">Tidak ada logbook</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredReports.map((r, idx) => {
            const isReviewed = !!r.review;
            const isProcessing = processing === r.id;

            return (
              <div key={r.id} className={`border bg-white/40 ${isReviewed ? "border-green-200 bg-green-50/30" : "border-ink/15"}`}>
                <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
                  {/* Left — Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <span className="mono text-[10px] text-ink/60 mt-0.5 shrink-0">{String(idx + 1).padStart(2, "0")}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-serif italic text-base md:text-lg leading-tight">
                          {format(new Date(r.tanggal), "d MMMM yyyy", {
                            locale: localeId,
                          })}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs font-medium">{r.user_nama}</span>
                          <span className="mono text-[10px] text-ink/30">·</span>
                          <span className="mono text-[10px] uppercase tracking-[0.1em] text-ink/60">{r.departemen_nama}</span>
                          <span className="mono text-[10px] text-ink/30">·</span>
                          <span className="mono text-[10px] text-ink/60">{r.activity_count} aktivitas</span>
                        </div>
                        {isReviewed && (
                          <p className="mono text-[10px] text-green-700 mt-1.5 flex items-center gap-1.5 flex-wrap">
                            <CheckCircle2 size={11} />
                            <span>
                              Ditinjau oleh {r.review?.reviewer_nama} ·{" "}
                              {r.review
                                ? format(new Date(r.review.reviewed_at), "d MMM yyyy", {
                                    locale: localeId,
                                  })
                                : ""}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right — Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/report/${r.id}`} className="flex items-center gap-1.5 border border-ink/20 hover:bg-ink/[0.03] transition-colors px-3 py-2 mono text-[10px] uppercase tracking-[0.15em]">
                      <Eye size={12} /> Lihat
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleToggleReview(r.id, r.review)}
                      disabled={isProcessing}
                      className={`flex items-center gap-1.5 px-3 py-2 mono text-[10px] uppercase tracking-[0.15em] transition-colors disabled:opacity-50 ${
                        isReviewed ? "border border-ink/20 hover:bg-ink/[0.03]" : "bg-brand-primary text-white hover:bg-brand-hover"
                      }`}
                    >
                      {isReviewed ? (
                        <>
                          <RotateCcw size={12} /> Batal
                        </>
                      ) : (
                        <>
                          <CheckCheck size={12} /> Tandai
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
