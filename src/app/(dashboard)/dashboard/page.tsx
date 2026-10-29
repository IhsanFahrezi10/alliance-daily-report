import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format, subDays } from "date-fns";
import { id as localeId } from "date-fns/locale";
import HrDashboard from "./hr-dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  // ============ KALAU HR APPROVER → TAMPILIN ANALYTICS ============
  if (myProfile?.role === "hr_approver") {
    // Fetch semua reports + profiles + reviews
    const { data: reportsRaw } = await supabase.from("reports").select("id, tanggal, user_id, report_reviews(id)").is("deleted_at", null);

    const { data: profiles } = await supabase.from("profiles").select("id, nama, role, departemen_id, batch");

    const { data: departemenList } = await supabase.from("departemen").select("id, nama");

    const profileMap = new Map<string, any>();
    profiles?.forEach((p) => profileMap.set(p.id, p));

    const departemenMap = new Map<string, string>();
    departemenList?.forEach((d) => departemenMap.set(d.id, d.nama));

    const reports = (reportsRaw || []).map((r: any) => {
      const prof = profileMap.get(r.user_id);
      const review = Array.isArray(r.report_reviews) ? r.report_reviews[0] : r.report_reviews;
      return {
        id: r.id,
        tanggal: r.tanggal,
        user_id: r.user_id,
        user_nama: prof?.nama || "—",
        departemen: prof?.departemen_id ? departemenMap.get(prof.departemen_id) || "—" : "—",
        batch: prof?.batch || 1,
        is_reviewed: !!review,
      };
    });

    // Stats
    const totalLogbooks = reports.length;
    const totalInterns = profiles?.filter((p) => p.role === "user").length || 0;
    const totalReviewed = reports.filter((r) => r.is_reviewed).length;
    const totalPending = totalLogbooks - totalReviewed;

    // Chart — 7 hari terakhir
    const dailyChart: Array<{
      tanggal: string;
      label: string;
      count: number;
    }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = format(d, "yyyy-MM-dd");
      dailyChart.push({
        tanggal: key,
        label: format(d, "d MMM", { locale: localeId }),
        count: reports.filter((r) => r.tanggal === key).length,
      });
    }

    // Top 5 interns
    const countPerUser = new Map<string, { nama: string; departemen: string; batch: number; count: number }>();
    reports.forEach((r) => {
      const existing = countPerUser.get(r.user_id);
      if (existing) {
        existing.count++;
      } else {
        countPerUser.set(r.user_id, {
          nama: r.user_nama,
          departemen: r.departemen,
          batch: r.batch,
          count: 1,
        });
      }
    });
    const topInterns = Array.from(countPerUser.entries())
      .map(([user_id, v]) => ({
        user_id,
        nama: v.nama,
        departemen: v.departemen,
        batch: v.batch,
        logbook_count: v.count,
      }))
      .sort((a, b) => b.logbook_count - a.logbook_count)
      .slice(0, 5);

    // Dept stats
    const countPerDept = new Map<string, number>();
    reports.forEach((r) => {
      if (r.departemen !== "—") {
        countPerDept.set(r.departemen, (countPerDept.get(r.departemen) || 0) + 1);
      }
    });
    const deptStats = Array.from(countPerDept.entries())
      .map(([nama, count]) => ({ nama, count }))
      .sort((a, b) => b.count - a.count);

    // Recent 10
    const recentReports = [...reports].sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1)).slice(0, 10);

    return (
      <HrDashboard
        stats={{
          totalLogbooks,
          totalInterns,
          totalReviewed,
          totalPending,
        }}
        dailyChart={dailyChart}
        topInterns={topInterns}
        deptStats={deptStats}
        recentReports={recentReports}
      />
    );
  }

  // ============ USER & ADMIN → DASHBOARD BIASA ============
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: todayReport } = await supabase.from("reports").select("id").eq("user_id", user.id).eq("tanggal", today).is("deleted_at", null).maybeSingle();

  const { count: totalReports } = await supabase.from("reports").select("*", { count: "exact", head: true }).eq("user_id", user.id).is("deleted_at", null);

  const { data: recent } = await supabase.from("reports").select("id, tanggal, report_activities(id)").eq("user_id", user.id).is("deleted_at", null).order("tanggal", { ascending: false }).limit(5);

  const { data: profile } = (await supabase.from("profiles").select("nama, departemen:departemen_id (nama)").eq("id", user.id).single()) as { data: any };

  const tanggalHariIni = format(new Date(), "EEEE, d MMMM yyyy", {
    locale: localeId,
  });
  const todayString = format(new Date(), "dd.MM.yyyy");

  return (
    <div className="space-y-8 md:space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 md:pb-6 border-b border-brand-primary/25">
        <div>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="mono text-[10px] uppercase tracking-[0.15em] text-brand-primary font-medium">Dashboard</span>
            <div className="h-px w-8 bg-brand-primary/30" />
            <span className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60">{todayString}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-[1.05]">
            Hai, <span className="font-serif italic text-brand-primary">{profile?.nama?.split(" ")[0] || "Kamu"}</span>.
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-2 md:mt-3">{tanggalHariIni}</p>
        </div>

        <div className="md:text-right">
          <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 mb-1.5">Departemen</p>
          <p className="font-serif italic text-base md:text-lg">{profile?.departemen?.nama || "Belum diatur"}</p>
        </div>
      </div>

      {/* STATUS */}
      <div>
        <div className="flex items-center gap-3 mb-4 md:mb-5">
          <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/70 font-medium">01 — Status Hari Ini</span>
          <div className="flex-1 h-px bg-brand-primary/30" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {todayReport ? (
            <div className="md:col-span-2 border border-brand-primary/25 bg-white/40 p-5 md:p-6 flex items-start gap-3 md:gap-4 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-600" />
              <CheckCircleIcon />
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-medium mb-1">Logbook sudah diisi</p>
                <p className="text-xs md:text-sm text-ink-muted leading-relaxed">Terima kasih sudah mengisi aktivitas hari ini.</p>
                <a href={`/report/${todayReport.id}`} className="inline-flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.2em] text-brand-primary mt-3 md:mt-4">
                  Lihat detail →
                </a>
              </div>
            </div>
          ) : (
            <div className="md:col-span-2 border border-brand-primary/25 bg-white/40 p-5 md:p-6 flex items-start gap-3 md:gap-4 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent" />
              <CircleIcon />
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-medium mb-1">Belum isi logbook</p>
                <p className="text-xs md:text-sm text-ink-muted leading-relaxed">Yuk catat aktivitas hari ini biar nggak lupa.</p>
                <a href="/report/new" className="inline-flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.2em] text-brand-primary mt-3 md:mt-4">
                  Isi sekarang →
                </a>
              </div>
            </div>
          )}

          <div className="border border-brand-primary/25 bg-white/40 p-5 md:p-6">
            <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 mb-2 md:mb-3">Total Entri</p>
            <p className="mono text-4xl md:text-5xl font-light tracking-tight text-brand-primary">{String(totalReports ?? 0).padStart(3, "0")}</p>
            <div className="mt-2 md:mt-3 h-px bg-brand-primary/30" />
            <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/40 mt-2 md:mt-3">logbook tercatat</p>
          </div>
        </div>
      </div>

      {/* RECENT */}
      <div>
        <div className="flex items-center gap-3 mb-4 md:mb-5">
          <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/70 font-medium">02 — Logbook Terakhir</span>
          <div className="flex-1 h-px bg-brand-primary/30" />
          <a href="/report" className="mono text-[10px] uppercase tracking-[0.15em] text-brand-primary hover:underline shrink-0">
            Lihat semua →
          </a>
        </div>

        {recent?.length ? (
          <div className="border border-brand-primary/25 bg-white/40 divide-y divide-ink/10">
            {recent.map((r: any, idx: number) => (
              <a key={r.id} href={`/report/${r.id}`} className="flex items-center justify-between p-4 hover:bg-brand-primary/[0.03] transition-colors group">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="mono text-[10px] text-ink/40 w-6 shrink-0">{String(idx + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-serif italic text-base leading-tight truncate">
                      {format(new Date(r.tanggal), "d MMMM yyyy", {
                        locale: localeId,
                      })}
                    </p>
                    <p className="mono text-[9px] uppercase tracking-[0.15em] text-ink/60 mt-1">
                      {format(new Date(r.tanggal), "EEEE", {
                        locale: localeId,
                      })}
                      {" · "}
                      {String(r.report_activities?.length || 0).padStart(2, "0")} entri
                    </p>
                  </div>
                </div>
                <span className="text-ink/30 shrink-0 ml-2 group-hover:text-brand-primary transition-colors">→</span>
              </a>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-brand-primary/30 p-8 md:p-12 text-center">
            <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 mb-4">Belum ada logbook</p>
            <a href="/report/new" className="inline-flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-hover transition-colors px-5 py-3 mono text-[10px] uppercase tracking-[0.15em]">
              Buat logbook pertama →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline SVG icons — biar nggak perlu import lucide di server component
function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-green-700 mt-0.5 shrink-0">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function CircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-brand-primary mt-0.5 shrink-0">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
