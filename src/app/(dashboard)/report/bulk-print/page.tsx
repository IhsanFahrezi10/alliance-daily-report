"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/client";
import WeeklyReportPDF, { WeeklyReportData } from "@/components/pdf/weekly-report-pdf";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Download, FileText, ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";

function BulkPrintContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const idsParam = searchParams.get("ids") || "";
  const ids = idsParam.split(",").filter(Boolean);

  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<WeeklyReportData[]>([]);

  useEffect(() => {
    if (!ids.length) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const { data } = await supabase
        .from("reports")
        .select(
          `
          *,
          profiles:user_id (
            nama, role, mentor_nama, batch,
            departemen:departemen_id (nama)
          ),
          report_activities (*)
        `,
        )
        .in("id", ids)
        .is("deleted_at", null)
        .order("tanggal", { ascending: true });

      setReports((data as WeeklyReportData[]) || []);
      setLoading(false);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsParam]);

  if (!ids.length) {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="border border-dashed border-ink/25 p-12 text-center">
          <p className="mono text-[10px] uppercase tracking-[0.25em] text-ink/40 mb-4">Tidak ada logbook dipilih</p>
          <Link href="/report" className="inline-flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-hover transition-colors px-5 py-3 mono text-[10px] uppercase tracking-[0.2em]">
            <ArrowLeft size={13} /> Kembali ke Logbook
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="mono text-[10px] uppercase tracking-[0.25em] text-ink/40">Memuat data...</p>
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="border border-dashed border-ink/25 p-12 text-center">
          <p className="mono text-[10px] uppercase tracking-[0.25em] text-ink/40 mb-4">Data tidak ditemukan</p>
          <Link href="/report" className="inline-flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-hover transition-colors px-5 py-3 mono text-[10px] uppercase tracking-[0.2em]">
            <ArrowLeft size={13} /> Kembali
          </Link>
        </div>
      </div>
    );
  }

  const first = reports[0];
  const last = reports[reports.length - 1];
  const periodLabel = `${format(new Date(first.tanggal), "d MMM yyyy", {
    locale: localeId,
  })} — ${format(new Date(last.tanggal), "d MMM yyyy", {
    locale: localeId,
  })}`;

  const userName = first.profiles?.nama || "user";
  const filename = `Logbook-${userName.replace(/\s+/g, "_")}-${first.tanggal}_to_${last.tanggal}.pdf`;

  return (
    <div className="max-w-6xl space-y-6 md:space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 md:pb-6 border-b border-ink/15">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <Link href="/report" className="p-2 hover:bg-ink/[0.05] transition-colors shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 md:gap-3 mb-1.5 flex-wrap">
              <span className="mono text-[10px] uppercase tracking-[0.25em] text-brand-primary font-medium">Bulk Print</span>
              <div className="h-px w-6 md:w-8 bg-brand-primary" />
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/40">{reports.length} Logbook</span>
            </div>
            <h1 className="text-xl md:text-2xl font-light tracking-tight">Preview Print Gabungan</h1>
            <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/50 mt-1">Periode: {periodLabel}</p>
          </div>
        </div>

        <PDFDownloadLink
          document={<WeeklyReportPDF reports={reports} periodLabel={periodLabel} />}
          fileName={filename}
          className="flex items-center justify-center gap-2 bg-brand-primary text-white hover:bg-brand-hover transition-colors px-5 py-3 mono text-[10px] uppercase tracking-[0.2em] shrink-0"
        >
          {({ loading }) =>
            loading ? (
              "Menyiapkan..."
            ) : (
              <>
                <Download size={13} /> Download PDF
              </>
            )
          }
        </PDFDownloadLink>
      </div>

      {/* SUMMARY */}
      <div className="border border-ink/15 bg-white/40 p-4 md:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Printer size={14} className="text-brand-primary" />
          <p className="mono text-[10px] uppercase tracking-[0.2em] text-ink/60">Logbook yang akan digabung:</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {reports.map((r, idx) => (
            <span key={r.id} className="flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.15em] border border-ink/20 px-2.5 py-1.5 text-ink/70">
              <span className="text-ink/40">{String(idx + 1).padStart(2, "0")}</span>
              {format(new Date(r.tanggal), "EEE, d MMM", {
                locale: localeId,
              })}
              <span className="text-ink/30">·</span>
              <span className="text-brand-primary font-medium">{r.report_activities?.length || 0}x</span>
            </span>
          ))}
        </div>
      </div>

      {/* PREVIEW */}
      <div className="border border-ink/15 bg-white">
        <div className="px-4 md:px-5 py-3 border-b border-ink/15 flex items-center gap-2 mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-ink/50 overflow-hidden">
          <FileText size={12} className="shrink-0" />
          <span className="truncate">Preview — {filename}</span>
        </div>

        <div className="md:hidden">
          <PDFViewer width="100%" height="600" showToolbar={false}>
            <WeeklyReportPDF reports={reports} periodLabel={periodLabel} />
          </PDFViewer>
        </div>
        <div className="hidden md:block">
          <PDFViewer width="100%" height="900" showToolbar={false}>
            <WeeklyReportPDF reports={reports} periodLabel={periodLabel} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}

export default function BulkPrintPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <p className="mono text-[10px] uppercase tracking-[0.25em] text-ink/40">Memuat...</p>
        </div>
      }
    >
      <BulkPrintContent />
    </Suspense>
  );
}
