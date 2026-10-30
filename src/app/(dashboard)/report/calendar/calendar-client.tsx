"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, addMonths, subMonths } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ChevronLeft, ChevronRight, ArrowLeft, CheckCircle2, Circle } from "lucide-react";

type ReportItem = {
  id: string;
  tanggal: string;
  is_reviewed: boolean;
};

export default function CalendarClient({ reports }: { reports: ReportItem[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Map tanggal → report
  const reportMap = useMemo(() => {
    const map = new Map<string, ReportItem>();
    reports.forEach((r) => map.set(r.tanggal, r));
    return map;
  }, [reports]);

  // Generate days untuk grid kalender
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Stats bulan ini
  const monthStats = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const thisMonthReports = reports.filter((r) => {
      const d = new Date(r.tanggal);
      return d >= monthStart && d <= monthEnd;
    });

    return {
      total: thisMonthReports.length,
      reviewed: thisMonthReports.filter((r) => r.is_reviewed).length,
      pending: thisMonthReports.filter((r) => !r.is_reviewed).length,
    };
  }, [currentMonth, reports]);

  const weekdays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  return (
    <div className="max-w-3xl space-y-6 md:space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 pb-5 md:pb-6 border-b border-brand-primary/25">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <Link href="/report" className="p-2 hover:bg-ink/[0.05] transition-colors shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 md:gap-3 mb-1.5 flex-wrap">
              <span className="mono text-[11px] uppercase tracking-[0.15em] text-brand-primary font-medium">Kalender</span>
              <div className="h-px w-6 md:w-8 bg-brand-primary/30" />
              <span className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60">{monthStats.total} logbook</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight">
              Kalender <span className="font-serif italic text-brand-primary">Logbook</span>
            </h1>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-brand-primary/25 bg-white/40 p-3 md:p-4">
          <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 mb-1">Bulan Ini</p>
          <p className="text-2xl font-light text-brand-primary">{monthStats.total}</p>
        </div>
        <div className="border border-green-200 bg-green-50/50 p-3 md:p-4">
          <p className="mono text-[10px] uppercase tracking-[0.15em] text-green-800/70 mb-1">Ditinjau</p>
          <p className="text-2xl font-light text-green-800">{monthStats.reviewed}</p>
        </div>
        <div className="border border-orange-200 bg-orange-50/50 p-3 md:p-4">
          <p className="mono text-[10px] uppercase tracking-[0.15em] text-orange-800/70 mb-1">Belum</p>
          <p className="text-2xl font-light text-orange-800">{monthStats.pending}</p>
        </div>
      </div>

      {/* CALENDAR */}
      <div className="border border-brand-primary/25 bg-white/40">
        {/* Month navigation */}
        <div className="flex items-center justify-between p-4 border-b border-brand-primary/25">
          <button type="button" onClick={prevMonth} className="p-2 hover:bg-ink/[0.05] transition-colors" aria-label="Bulan sebelumnya">
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-3">
            <h2 className="font-serif italic text-lg md:text-xl">{format(currentMonth, "MMMM yyyy", { locale: localeId })}</h2>
            <button type="button" onClick={goToToday} className="mono text-[9px] uppercase tracking-[0.15em] px-2 py-1 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors">
              Hari Ini
            </button>
          </div>

          <button type="button" onClick={nextMonth} className="p-2 hover:bg-ink/[0.05] transition-colors" aria-label="Bulan berikutnya">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-brand-primary/25">
          {weekdays.map((day) => (
            <div key={day} className="py-2 md:py-3 text-center mono text-[9px] md:text-[10px] uppercase tracking-[0.15em] text-ink/60">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const report = reportMap.get(dateKey);
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            const baseClasses = "relative aspect-square md:aspect-auto md:h-20 p-1 md:p-2 border-r border-b border-ink/10 last:border-r-0 transition-colors";

            if (!inMonth) {
              return (
                <div key={dateKey} className={`${baseClasses} opacity-30`}>
                  <span className="mono text-xs text-ink/40">{format(day, "d")}</span>
                </div>
              );
            }

            return <CalendarCell key={dateKey} day={day} dateKey={dateKey} report={report} today={today} baseClasses={baseClasses} />;
          })}
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-brand-primary/25 flex items-center gap-4 flex-wrap">
          <span className="mono text-[9px] uppercase tracking-[0.15em] text-ink/50">Legenda:</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-green-700" />
            <span className="mono text-[9px] uppercase tracking-[0.1em] text-ink/70">Sudah Ditinjau</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Circle size={12} className="text-brand-primary" />
            <span className="mono text-[9px] uppercase tracking-[0.1em] text-ink/70">Belum Ditinjau</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 border border-ink/20" />
            <span className="mono text-[9px] uppercase tracking-[0.1em] text-ink/70">Tidak Isi</span>
          </div>
        </div>
      </div>

      {/* Info bawah */}
      <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/50 text-center">Klik tanggal untuk melihat detail logbook</p>
    </div>
  );
}

// ============ CALENDAR CELL ============
function CalendarCell({ day, dateKey, report, today, baseClasses }: { day: Date; dateKey: string; report: ReportItem | undefined; today: boolean; baseClasses: string }) {
  const hasReport = !!report;
  const isReviewed = report?.is_reviewed;

  return (
    <Link
      href={hasReport ? `/report/${report.id}` : "#"}
      className={`${baseClasses} ${hasReport ? "hover:bg-brand-primary/[0.06] cursor-pointer" : ""} ${today ? "bg-brand-primary/[0.04]" : ""}`}
      aria-label={`${format(day, "d MMMM yyyy", {
        locale: localeId,
      })}${hasReport ? " — ada logbook" : " — belum diisi"}`}
    >
      <div className="flex flex-col items-center justify-between h-full gap-1">
        <span className={`mono text-xs md:text-sm leading-none ${today ? "text-brand-primary font-bold" : hasReport ? "text-ink font-medium" : "text-ink/50"}`}>{format(day, "d")}</span>

        {hasReport && (
          <div className="flex items-center justify-center">
            {isReviewed ? <CheckCircle2 size={14} className="text-green-700 md:w-4 md:h-4" strokeWidth={2} /> : <Circle size={14} className="text-brand-primary md:w-4 md:h-4" strokeWidth={2} />}
          </div>
        )}

        {!hasReport && <div className="h-3 md:h-4" />}
      </div>

      {today && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-brand-accent" />}
    </Link>
  );
}
