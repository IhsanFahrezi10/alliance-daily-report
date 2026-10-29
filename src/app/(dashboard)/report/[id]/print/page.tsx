"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ReportPdfData } from "@/components/pdf/daily-report-pdf";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Lazy-load PDF viewer — cuma di-download saat halaman print dibuka
const PrintViewer = dynamic(() => import("@/components/pdf/print-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 border border-brand-primary/25 bg-white/40">
      <p className="mono text-[10px] uppercase tracking-[0.25em] text-ink/60">Memuat PDF viewer...</p>
    </div>
  ),
});

export default function PrintReportPage() {
  const params = useParams();
  const supabase = createClient();
  const [report, setReport] = useState<ReportPdfData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      const { data, error } = await supabase
        .from("reports")
        .select(
          `
          *,
          profiles:user_id (
            nama,
            role,
            mentor_nama,
            avatar_url,
            batch,
            departemen:departemen_id (nama)
          ),
          report_activities (*)
        `,
        )
        .eq("id", params.id as string)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setReport(data as ReportPdfData);
      }
      setLoading(false);
    };

    fetchReport();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="mono text-[10px] uppercase tracking-[0.25em] text-ink/60">Memuat data...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.2em] text-brand-primary">
          <ArrowLeft size={12} /> Kembali
        </Link>
        <div className="border border-red-300 bg-red-50 text-red-700 p-4 text-sm">Gagal memuat logbook: {error || "Data tidak ditemukan"}</div>
      </div>
    );
  }

  const filename = `Logbook-${report.profiles?.nama?.replace(/\s+/g, "_")}-${report.tanggal}.pdf`;

  return (
    <div className="max-w-5xl space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 md:gap-4 pb-5 md:pb-6 border-b border-brand-primary/25">
        <Link href={`/report/${params.id}`} className="p-2 hover:bg-ink/[0.05] transition-colors shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 md:gap-3 mb-1.5 flex-wrap">
            <span className="mono text-[10px] uppercase tracking-[0.25em] text-brand-primary font-medium">Export PDF</span>
            <div className="h-px w-6 md:w-8 bg-brand-primary" />
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/60">A4</span>
          </div>
          <h1 className="text-2xl font-light tracking-tight">Preview Logbook</h1>
        </div>
      </div>

      {/* LAZY PDF VIEWER */}
      <PrintViewer report={report} filename={filename} />
    </div>
  );
}
