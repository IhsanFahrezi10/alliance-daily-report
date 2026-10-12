import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format } from "date-fns";
import { getDepartemenName } from '@/lib/utils'
import { id as localeId } from "date-fns/locale";
import { ArrowUpRight, CheckCircle2, Circle } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = format(new Date(), "yyyy-MM-dd");

  const { data: todayReport } = await supabase.from("reports").select("id").eq("user_id", user!.id).eq("tanggal", today).is("deleted_at", null).maybeSingle();

  const { count: totalReports } = await supabase.from("reports").select("*", { count: "exact", head: true }).eq("user_id", user!.id).is("deleted_at", null);

  const { data: recent } = await supabase.from("reports").select("id, tanggal, report_activities(id)").eq("user_id", user!.id).is("deleted_at", null).order("tanggal", { ascending: false }).limit(5);

  const { data: profile } = (await supabase.from("profiles").select("nama, departemen:departemen_id (nama)").eq("id", user!.id).single()) as { data: any };

  const tanggalHariIni = format(new Date(), "EEEE, d MMMM yyyy", {
    locale: localeId,
  });

  const todayString = format(new Date(), "dd.MM.yyyy");

  return (
    <div className="space-y-8 md:space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 md:pb-6 border-b border-ink/15">
        <div>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="mono text-[10px] uppercase tracking-[0.25em] text-brand-primary font-medium">Dashboard</span>
            <div className="h-px w-8 bg-brand-primary" />
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/40">{todayString}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
            Hai, <span className="font-serif italic text-brand-primary">{profile?.nama?.split(" ")[0] || "Kamu"}</span>.
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-2 md:mt-3">{tanggalHariIni}</p>
        </div>

        <div className="md:text-right">
          <p className="mono text-[10px] uppercase tracking-[0.25em] text-ink/40 mb-1.5">Departemen</p>
          <p className="font-serif italic text-base md:text-lg">{getDepartemenName(profile?.departemen) === "—" ? "Belum diatur" : getDepartemenName(profile?.departemen)}</p>
        </div>
      </div>

      {/* STATUS */}
      <div>
        <div className="flex items-center gap-3 mb-4 md:mb-5">
          <span className="mono text-[10px] uppercase tracking-[0.3em] text-ink/50 font-medium">01 — Status Hari Ini</span>
          <div className="flex-1 h-px bg-ink/15" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {todayReport ? (
            <div className="md:col-span-2 border border-ink/15 bg-white/40 p-5 md:p-6 flex items-start gap-3 md:gap-4 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-600" />
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-700 mt-0.5 shrink-0" strokeWidth={1.75} />
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-medium mb-1">Logbook sudah diisi</p>
                <p className="text-xs md:text-sm text-ink-muted leading-relaxed">Terima kasih sudah mengisi aktivitas hari ini.</p>
                <Link href={`/report/${todayReport.id}`} className="inline-flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.2em] text-brand-primary mt-3 md:mt-4 hover:gap-2.5 transition-all">
                  Lihat detail <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="md:col-span-2 border border-ink/15 bg-white/40 p-5 md:p-6 flex items-start gap-3 md:gap-4 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent" />
              <Circle className="w-5 h-5 md:w-6 md:h-6 text-brand-primary mt-0.5 shrink-0" strokeWidth={1.75} />
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-medium mb-1">Belum isi logbook</p>
                <p className="text-xs md:text-sm text-ink-muted leading-relaxed">Yuk catat aktivitas hari ini biar nggak lupa.</p>
                <Link href="/report/new" className="inline-flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.2em] text-brand-primary mt-3 md:mt-4 hover:gap-2.5 transition-all">
                  Isi sekarang <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>
          )}

          <div className="border border-ink/15 bg-white/40 p-5 md:p-6">
            <p className="mono text-[10px] uppercase tracking-[0.25em] text-ink/50 mb-2 md:mb-3">Total Entri</p>
            <p className="mono text-4xl md:text-5xl font-light tracking-tight text-brand-primary">{String(totalReports ?? 0).padStart(3, "0")}</p>
            <div className="mt-2 md:mt-3 h-px bg-ink/15" />
            <p className="mono text-[10px] uppercase tracking-[0.2em] text-ink/40 mt-2 md:mt-3">logbook tercatat</p>
          </div>
        </div>
      </div>

      {/* RECENT */}
      <div>
        <div className="flex items-center gap-3 mb-4 md:mb-5">
          <span className="mono text-[10px] uppercase tracking-[0.3em] text-ink/50 font-medium">02 — Logbook Terakhir</span>
          <div className="flex-1 h-px bg-ink/15" />
          <Link href="/report" className="mono text-[10px] uppercase tracking-[0.25em] text-brand-primary hover:underline shrink-0">
            Lihat semua →
          </Link>
        </div>

        {recent?.length ? (
          <>
            {/* Desktop */}
            <div className="hidden md:block border border-ink/15 bg-white/40">
              <div className="grid grid-cols-12 px-5 py-3 border-b border-ink/15 mono text-[9px] uppercase tracking-[0.2em] text-ink/40">
                <div className="col-span-1">#</div>
                <div className="col-span-6">Tanggal</div>
                <div className="col-span-3">Aktivitas</div>
                <div className="col-span-2 text-right">Aksi</div>
              </div>

              {recent.map((r: any, idx: number) => (
                <Link key={r.id} href={`/report/${r.id}`} className="group grid grid-cols-12 items-center px-5 py-4 border-b last:border-0 border-ink/10 hover:bg-brand-primary/[0.03] transition-colors">
                  <div className="col-span-1 mono text-[10px] text-ink/40">{String(idx + 1).padStart(2, "0")}</div>
                  <div className="col-span-6">
                    <p className="font-serif italic text-lg leading-none">
                      {format(new Date(r.tanggal), "d MMMM yyyy", {
                        locale: localeId,
                      })}
                    </p>
                    <p className="mono text-[9px] uppercase tracking-[0.15em] text-ink/40 mt-1">{format(new Date(r.tanggal), "EEEE", { locale: localeId })}</p>
                  </div>
                  <div className="col-span-3">
                    <span className="mono text-[10px] text-ink-muted">{String(r.report_activities?.length || 0).padStart(2, "0")} entri</span>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <ArrowUpRight size={14} className="text-ink/30 group-hover:text-brand-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile */}
            <div className="md:hidden border border-ink/15 bg-white/40 divide-y divide-ink/10">
              {recent.map((r: any, idx: number) => (
                <Link key={r.id} href={`/report/${r.id}`} className="flex items-center justify-between p-4 active:bg-brand-primary/[0.05] transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="mono text-[10px] text-ink/40 w-6 shrink-0">{String(idx + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif italic text-base leading-tight truncate">
                        {format(new Date(r.tanggal), "d MMMM yyyy", {
                          locale: localeId,
                        })}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="mono text-[9px] uppercase tracking-[0.15em] text-ink/40">
                          {format(new Date(r.tanggal), "EEEE", {
                            locale: localeId,
                          })}
                        </span>
                        <span className="mono text-[9px] text-ink/30">·</span>
                        <span className="mono text-[9px] uppercase tracking-[0.15em] text-ink/40">{String(r.report_activities?.length || 0).padStart(2, "0")} entri</span>
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight size={14} className="text-ink/30 shrink-0 ml-2" />
                </Link>
              ))}
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
    </div>
  );
}
