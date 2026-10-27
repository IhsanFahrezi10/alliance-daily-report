"use client";

import { useEffect, useState } from "react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/client";
import WeeklyReportPDF, { WeeklyReportData } from "@/components/pdf/weekly-report-pdf";
import { format, startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Download, FileText, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

export default function RecapPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<WeeklyReportData[]>([]);
  const [userName, setUserName] = useState("");

  const today = new Date();
  const mondayThisWeek = startOfWeek(today, { weekStartsOn: 1 });
  const sundayThisWeek = endOfWeek(today, { weekStartsOn: 1 });

  const [from, setFrom] = useState(format(mondayThisWeek, "yyyy-MM-dd"));
  const [to, setTo] = useState(format(sundayThisWeek, "yyyy-MM-dd"));

  const fetchData = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: reportsData } = await supabase
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
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .gte("tanggal", from)
      .lte("tanggal", to)
      .order("tanggal", { ascending: true });

    setReports((reportsData as WeeklyReportData[]) || []);

    if (reportsData && reportsData.length > 0) {
      setUserName((reportsData[0] as any).profiles?.nama || "");
    } else {
      const { data: profile } = await supabase.from("profiles").select("nama").eq("id", user.id).single();
      setUserName(profile?.nama || "");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  const setThisWeek = () => {
    setFrom(format(mondayThisWeek, "yyyy-MM-dd"));
    setTo(format(sundayThisWeek, "yyyy-MM-dd"));
  };

  const setLastWeek = () => {
    const lastMonday = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
    const lastSunday = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
    setFrom(format(lastMonday, "yyyy-MM-dd"));
    setTo(format(lastSunday, "yyyy-MM-dd"));
  };

  const periodLabel = `${format(new Date(from), "d MMM yyyy", {
    locale: localeId,
  })} — ${format(new Date(to), "d MMM yyyy", {
    locale: localeId,
  })}`;

  const filename = `Weekly-Report-${userName.replace(/\s+/g, "_")}-${from}_to_${to}.pdf`;

  return (
    <div className="max-w-6xl space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 md:pb-6 border-b border-ink/15">
        <div>
          <div className="flex items-center gap-2 md:gap-3 mb-1.5 flex-wrap">
            <span className="mono text-[10px] uppercase tracking-[0.25em] text-brand-primary font-medium">Rekap</span>
            <div className="h-px w-6 md:w-8 bg-brand-primary" />
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/40">{String(reports.length).padStart(2, "0")} Hari</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight">
            Rekap <span className="font-serif italic text-brand-primary">Mingguan</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-2">Gabungkan logbook 1 minggu jadi satu PDF siap print</p>
        </div>

        <Link href="/dashboard" className="flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.2em] text-ink/50 hover:text-brand-primary transition-colors shrink-0">
          <ArrowLeft size={12} /> Kembali
        </Link>
      </div>

      <div className="border border-ink/15 bg-white/40 p-4 md:p-5 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/50 shrink-0">Cepat:</span>
          <button type="button" onClick={setThisWeek} className="mono text-[10px] uppercase tracking-[0.15em] border border-ink/20 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-colors px-3 py-1.5">
            Minggu Ini
          </button>
          <button type="button" onClick={setLastWeek} className="mono text-[10px] uppercase tracking-[0.15em] border border-ink/20 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-colors px-3 py-1.5">
            Minggu Lalu
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mono text-[10px] uppercase tracking-[0.2em] text-ink/60 block mb-1.5">Dari</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-ink/25 focus:border-brand-primary focus:outline-none py-2.5 text-sm font-mono transition-colors"
            />
          </div>
          <div>
            <label className="mono text-[10px] uppercase tracking-[0.2em] text-ink/60 block mb-1.5">Sampai</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full bg-transparent border-0 border-b border-ink/25 focus:border-brand-primary focus:outline-none py-2.5 text-sm font-mono transition-colors" />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-ink/10">
          <Calendar size={13} className="text-brand-primary shrink-0" />
          <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60">Periode: {periodLabel}</p>
          <span className="mono text-[10px] text-ink/30">·</span>
          <p className="mono text-[10px] uppercase tracking-[0.15em] text-brand-primary font-medium">{reports.length} hari terisi</p>
        </div>
      </div>

      {loading ? (
        <div className="border border-ink/15 bg-white/40 p-12 text-center">
          <p className="mono text-[10px] uppercase tracking-[0.25em] text-ink/40">Memuat...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="border border-dashed border-ink/25 p-12 text-center">
          <p className="mono text-[10px] uppercase tracking-[0.25em] text-ink/40 mb-2">Tidak ada logbook</p>
          <p className="text-xs text-ink-muted">Belum ada logbook di periode ini. Coba ubah rentang tanggal atau isi logbook dulu.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {reports.map((r) => (
                <span key={r.id} className="mono text-[9px] uppercase tracking-[0.15em] border border-ink/20 px-2 py-1 text-ink/60">
                  {format(new Date(r.tanggal), "EEE, d MMM", {
                    locale: localeId,
                  })}
                </span>
              ))}
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
                    <Download size={13} /> Download PDF Mingguan
                  </>
                )
              }
            </PDFDownloadLink>
          </div>

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
        </>
      )}
    </div>
  );
}
