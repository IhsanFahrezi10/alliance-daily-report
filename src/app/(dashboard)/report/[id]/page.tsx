import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Printer, Pencil, ArrowLeft, CheckCircle2, Circle, Clock } from "lucide-react";

export default async function ViewReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: report } = await supabase
    .from("reports")
    .select(
      `
      *,
      profiles:user_id (
        nama,
        role,
        mentor_nama,
        departemen:departemen_id (nama)
      ),
      report_activities (*)
    `,
    )
    .eq("id", id)
    .single();

  if (!report) notFound();

  const activities = (report.report_activities || []).sort((a: any, b: any) => a.urutan - b.urutan);

  const statusLabel: Record<string, string> = {
    selesai: "Selesai",
    on_progress: "Progress",
    pending: "Pending",
  };

  const statusIcon: Record<string, any> = {
    selesai: CheckCircle2,
    on_progress: Clock,
    pending: Circle,
  };

  const statusColor: Record<string, string> = {
    selesai: "text-green-700",
    on_progress: "text-yellow-700",
    pending: "text-ink/40",
  };

  const tanggalFormatted = format(new Date(report.tanggal), "EEEE, d MMMM yyyy", { locale: localeId });

  return (
    <div className="max-w-4xl space-y-6 md:space-y-8">
      {/* HEADER */}
      <div className="flex items-center gap-3 md:gap-4 pb-5 md:pb-6 border-b border-ink/15">
        <Link href="/report" className="p-2 hover:bg-ink/[0.05] transition-colors shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 md:gap-3 mb-1.5 flex-wrap">
            <span className="mono text-[10px] uppercase tracking-[0.25em] text-brand-primary font-medium">Detail Logbook</span>
            <div className="h-px w-6 md:w-8 bg-brand-primary" />
            <span className="mono text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-ink/40 truncate">#{report.id.slice(0, 8)}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight">
            {format(new Date(report.tanggal), "d MMMM yyyy", {
              locale: localeId,
            })}
          </h1>
        </div>
      </div>

      {/* INFO */}
      <div>
        <div className="flex items-center gap-3 mb-4 md:mb-5">
          <span className="mono text-[10px] uppercase tracking-[0.3em] text-ink/50 font-medium">01 — Informasi</span>
          <div className="flex-1 h-px bg-ink/15" />
        </div>

        <div className="border border-ink/15 bg-white/40">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-ink/15">
            <div className="p-5 md:p-6">
              <p className="mono text-[9px] uppercase tracking-[0.25em] text-ink/40 mb-2">Nama</p>
              <p className="text-base md:text-lg font-medium">{report.profiles?.nama || "-"}</p>
            </div>
            <div className="p-5 md:p-6">
              <p className="mono text-[9px] uppercase tracking-[0.25em] text-ink/40 mb-2">Departemen</p>
              <p className="text-base md:text-lg font-serif italic">{report.profiles?.departemen?.[0]?.nama || "-"}</p>
            </div>
            <div className="p-5 md:p-6">
              <p className="mono text-[9px] uppercase tracking-[0.25em] text-ink/40 mb-2">Tanggal</p>
              <p className="text-base md:text-lg font-serif italic">{tanggalFormatted}</p>
            </div>
          </div>

          {/* Action bar */}
          <div className="flex border-t border-ink/15 divide-x divide-ink/10">
            <Link href={`/report/${report.id}/edit`} className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-yellow-700 hover:bg-yellow-50 active:bg-yellow-50 transition-colors">
              <Pencil size={14} />
              <span className="mono text-[10px] uppercase tracking-[0.15em]">Edit</span>
            </Link>
            <Link href={`/report/${report.id}/print`} className="flex-1 flex items-center justify-center gap-1.5 py-3.5 bg-brand-primary text-white hover:bg-brand-hover active:bg-brand-hover transition-colors">
              <Printer size={14} />
              <span className="mono text-[10px] uppercase tracking-[0.15em]">Print PDF</span>
            </Link>
          </div>
        </div>
      </div>

      {/* AKTIVITAS */}
      <div>
        <div className="flex items-center gap-3 mb-4 md:mb-5">
          <span className="mono text-[10px] uppercase tracking-[0.3em] text-ink/50 font-medium">02 — Aktivitas</span>
          <div className="flex-1 h-px bg-ink/15" />
          <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/40 shrink-0">{String(activities.length).padStart(2, "0")} entri</span>
        </div>

        <div className="border border-ink/15 bg-white/40">
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-12 px-5 py-3 border-b border-ink/15 mono text-[9px] uppercase tracking-[0.2em] text-ink/40">
            <div className="col-span-1">#</div>
            <div className="col-span-2">Waktu</div>
            <div className="col-span-7">Deskripsi</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {activities.length ? (
            activities.map((a: any, idx: number) => {
              const Icon = statusIcon[a.status] || Circle;
              return (
                <div key={a.id} className="border-b last:border-0 border-ink/10 p-4 md:p-0 md:grid md:grid-cols-12 md:px-5 md:py-4 md:items-center">
                  {/* Mobile */}
                  <div className="md:hidden space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="mono text-[10px] text-ink/40">#{String(idx + 1).padStart(2, "0")}</span>
                      <span className={`flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.15em] ${statusColor[a.status]}`}>
                        <Icon size={12} strokeWidth={2} />
                        {statusLabel[a.status]}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mono text-sm shrink-0 mt-0.5">{a.waktu?.slice(0, 5)}</span>
                      <div className="h-4 w-px bg-ink/20 mt-0.5 shrink-0" />
                      <span className="text-sm flex-1 whitespace-pre-wrap">{a.deskripsi}</span>
                    </div>
                  </div>

                  {/* Desktop */}
                  <div className="hidden md:contents">
                    <div className="col-span-1 mono text-[10px] text-ink/40">{String(idx + 1).padStart(2, "0")}</div>
                    <div className="col-span-2 mono text-sm">{a.waktu?.slice(0, 5)}</div>
                    <div className="col-span-7 text-sm whitespace-pre-wrap">{a.deskripsi}</div>
                    <div className="col-span-2 flex justify-end">
                      <span className={`flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.15em] ${statusColor[a.status]}`}>
                        <Icon size={12} strokeWidth={2} />
                        {statusLabel[a.status]}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center mono text-[10px] uppercase tracking-[0.25em] text-ink/40">Tidak ada aktivitas</div>
          )}
        </div>
      </div>

      {/* CATATAN */}
      {(report.kendala || report.lesson_learned || report.catatan) && (
        <div>
          <div className="flex items-center gap-3 mb-4 md:mb-5">
            <span className="mono text-[10px] uppercase tracking-[0.3em] text-ink/50 font-medium">03 — Catatan</span>
            <div className="flex-1 h-px bg-ink/15" />
          </div>

          <div className="border border-ink/15 bg-white/40 divide-y divide-ink/10">
            {report.lesson_learned && (
              <div className="p-5 md:p-6">
                <p className="mono text-[10px] uppercase tracking-[0.25em] text-ink/40 mb-2">Lesson Learned</p>
                <p className="text-sm whitespace-pre-wrap">{report.lesson_learned}</p>
              </div>
            )}
            {report.kendala && (
              <div className="p-5 md:p-6">
                <p className="mono text-[10px] uppercase tracking-[0.25em] text-ink/40 mb-2">Challenges</p>
                <p className="text-sm whitespace-pre-wrap">{report.kendala}</p>
              </div>
            )}
            {report.catatan && (
              <div className="p-5 md:p-6">
                <p className="mono text-[10px] uppercase tracking-[0.25em] text-ink/40 mb-2">Catatan Lain</p>
                <p className="text-sm whitespace-pre-wrap">{report.catatan}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
