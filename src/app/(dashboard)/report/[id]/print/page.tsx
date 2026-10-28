"use client";

import { useEffect, useState } from "react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DailyReportPDF, { ReportPdfData } from "@/components/pdf/daily-report-pdf";
import { ArrowLeft, Download, FileText } from "lucide-react";
import Link from "next/link";

export default function PrintReportPage() {
  const params = useParams();
  const router = useRouter();
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
        <p className="mono text-[11px] uppercase tracking-[0.15em] text-ink/60">Memuat data...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 mono text-[11px] uppercase tracking-[0.2em] text-brand-primary">
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
      <div className="flex items-center justify-between pb-6 border-b border-ink/15">
        <div className="flex items-center gap-4">
          <Link href={`/report/${params.id}`} className="p-2 hover:bg-ink/[0.05] transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <span className="mono text-[11px] uppercase tracking-[0.15em] text-brand-primary font-medium">Export PDF</span>
              <div className="h-px w-8 bg-brand-primary" />
              <span className="mono text-[11px] uppercase tracking-[0.2em] text-ink/60">A4</span>
            </div>
            <h1 className="text-2xl font-light tracking-tight">Preview Logbook</h1>
          </div>
        </div>

        <PDFDownloadLink
          document={<DailyReportPDF report={report} />}
          fileName={filename}
          className="flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-hover transition-colors px-5 py-3 mono text-[11px] uppercase tracking-[0.2em]"
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

      {/* PREVIEW */}
      <div className="border border-ink/15 bg-white">
        <div className="px-5 py-3 border-b border-ink/15 flex items-center gap-2 mono text-[11px] uppercase tracking-[0.2em] text-ink/70">
          <FileText size={12} />
          Preview — {filename}
        </div>
        <PDFViewer width="100%" height="900" showToolbar={false}>
          <DailyReportPDF report={report} />
        </PDFViewer>
      </div>
    </div>
  );
}
