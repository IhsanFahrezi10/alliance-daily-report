import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Eye, Pencil, Printer, ArrowUpRight } from "lucide-react";

export default async function AllReportsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string; user?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (!myProfile || !["admin", "super_admin"].includes(myProfile.role)) {
    redirect("/dashboard");
  }

  // Query reports
  let query = supabase
    .from("reports")
    .select(
      `
      id,
      tanggal,
      user_id,
      report_activities (id)
    `,
    )
    .is("deleted_at", null)
    .order("tanggal", { ascending: false });

  if (params.from) query = query.gte("tanggal", params.from);
  if (params.to) query = query.lte("tanggal", params.to);
  if (params.user) query = query.eq("user_id", params.user);

  const { data: reportsRaw } = await query;

  // Fetch semua profiles untuk lookup
  const { data: profiles } = await supabase.from("profiles").select("id, nama, departemen_id");

  // Fetch semua departemen untuk lookup
  const { data: departemenList } = await supabase.from("departemen").select("id, nama");

  // Bikin map
  const profileMap = new Map<string, { nama: string; departemen_id: string | null }>();
  profiles?.forEach((p) => {
    profileMap.set(p.id, { nama: p.nama, departemen_id: p.departemen_id });
  });

  const departemenMap = new Map<string, string>();
  departemenList?.forEach((d) => {
    departemenMap.set(d.id, d.nama);
  });

  // Gabungin manual
  const reports = (reportsRaw || []).map((r) => {
    const profile = profileMap.get(r.user_id);
    const departemenNama = profile?.departemen_id ? departemenMap.get(profile.departemen_id) || "—" : "—";

    return {
      ...r,
      user_nama: profile?.nama || "—",
      departemen_nama: departemenNama,
    };
  });

  // List user untuk filter dropdown
  const { data: users } = await supabase.from("profiles").select("id, nama").order("nama");

  return (
    <div className="space-y-6 md:space-y-8">
      {/* HEADER */}
      <div className="pb-5 md:pb-6 border-b border-ink/15">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="mono text-[11px] uppercase tracking-[0.15em] text-brand-primary font-medium">Admin</span>
          <div className="h-px w-8 bg-brand-primary" />
          <span className="mono text-[11px] uppercase tracking-[0.2em] text-ink/60">{String(reports.length).padStart(3, "0")} Entri</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight">
          Semua <span className="font-serif italic text-brand-primary">Logbook</span>
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-2">Pantau aktivitas magang seluruh peserta</p>
      </div>

      {/* FILTER */}
      <form className="border border-ink/15 bg-white/40">
        <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <div>
            <label className="block mono text-[11px] uppercase tracking-[0.2em] text-ink/60 mb-2">Dari Tanggal</label>
            <input type="date" name="from" defaultValue={params.from} className="w-full bg-transparent border-0 border-b border-ink/25 focus:border-brand-primary focus:outline-none py-2.5 text-sm font-mono transition-colors" />
          </div>
          <div>
            <label className="block mono text-[11px] uppercase tracking-[0.2em] text-ink/60 mb-2">Sampai Tanggal</label>
            <input type="date" name="to" defaultValue={params.to} className="w-full bg-transparent border-0 border-b border-ink/25 focus:border-brand-primary focus:outline-none py-2.5 text-sm font-mono transition-colors" />
          </div>
          <div>
            <label className="block mono text-[11px] uppercase tracking-[0.2em] text-ink/60 mb-2">Peserta</label>
            <select name="user" defaultValue={params.user || ""} className="w-full bg-transparent border-0 border-b border-ink/25 focus:border-brand-primary focus:outline-none py-2.5 text-sm transition-colors cursor-pointer">
              <option value="">Semua Peserta</option>
              {users?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="px-4 md:px-6 pb-4 md:pb-6 grid grid-cols-2 gap-2">
          <button type="submit" className="bg-brand-primary text-white hover:bg-brand-hover transition-colors px-4 py-3 mono text-[11px] uppercase tracking-[0.2em]">
            Filter
          </button>
          <Link href="/reports" className="text-center border border-ink/20 hover:bg-ink/[0.03] transition-colors px-4 py-3 mono text-[11px] uppercase tracking-[0.2em]">
            Reset
          </Link>
        </div>
      </form>

      {/* TABLE / CARDS */}
      {reports.length ? (
        <>
          {/* Desktop */}
          <div className="hidden md:block border border-ink/15 bg-white/40">
            <div className="grid grid-cols-12 px-5 py-3 border-b border-ink/15 mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
              <div className="col-span-1">#</div>
              <div className="col-span-3">Tanggal</div>
              <div className="col-span-3">Nama</div>
              <div className="col-span-2">Departemen</div>
              <div className="col-span-1">Entri</div>
              <div className="col-span-2 text-right">Aksi</div>
            </div>

            {reports.map((r: any, idx: number) => (
              <div key={r.id} className="grid grid-cols-12 px-5 py-4 border-b last:border-0 border-ink/10 items-center hover:bg-brand-primary/[0.03] transition-colors group">
                <div className="col-span-1 mono text-[11px] text-ink/60">{String(idx + 1).padStart(2, "0")}</div>
                <div className="col-span-3">
                  <Link href={`/report/${r.id}`}>
                    <p className="font-serif italic text-base leading-none group-hover:text-brand-primary transition-colors">
                      {format(new Date(r.tanggal), "d MMM yyyy", {
                        locale: localeId,
                      })}
                    </p>
                    <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 mt-1">{format(new Date(r.tanggal), "EEEE", { locale: localeId })}</p>
                  </Link>
                </div>
                <div className="col-span-3">
                  <p className="text-sm truncate">{r.user_nama}</p>
                </div>
                <div className="col-span-2">
                  <p className="mono text-[11px] uppercase tracking-[0.1em] text-ink-muted truncate">{r.departemen_nama}</p>
                </div>
                <div className="col-span-1">
                  <span className="mono text-[11px] text-ink-muted">{String(r.report_activities?.length || 0).padStart(2, "0")}</span>
                </div>
                <div className="col-span-2 flex justify-end gap-1">
                  <Link href={`/report/${r.id}`} title="Lihat" className="p-2 hover:bg-brand-primary/10 text-brand-primary transition-colors">
                    <Eye size={14} />
                  </Link>
                  <Link href={`/report/${r.id}/edit`} title="Edit" className="p-2 hover:bg-yellow-100 text-yellow-700 transition-colors">
                    <Pencil size={14} />
                  </Link>
                  <Link href={`/report/${r.id}/print`} title="Print PDF" className="p-2 hover:bg-green-100 text-green-700 transition-colors">
                    <Printer size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {reports.map((r: any, idx: number) => (
              <div key={r.id} className="border border-ink/15 bg-white/40">
                <Link href={`/report/${r.id}`} className="block p-4 active:bg-brand-primary/[0.05]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <span className="mono text-[11px] text-ink/60 mt-1 shrink-0">{String(idx + 1).padStart(2, "0")}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-serif italic text-base leading-tight">
                          {format(new Date(r.tanggal), "d MMMM yyyy", {
                            locale: localeId,
                          })}
                        </p>
                        <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 mt-1">
                          {format(new Date(r.tanggal), "EEEE", {
                            locale: localeId,
                          })}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight size={14} className="text-ink/30 shrink-0 mt-1" />
                  </div>

                  <div className="mt-3 pt-3 border-t border-ink/10 grid grid-cols-2 gap-x-3 gap-y-2">
                    <div>
                      <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 mb-0.5">Nama</p>
                      <p className="text-xs truncate">{r.user_nama}</p>
                    </div>
                    <div>
                      <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 mb-0.5">Departemen</p>
                      <p className="text-xs truncate">{r.departemen_nama}</p>
                    </div>
                    <div>
                      <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 mb-0.5">Aktivitas</p>
                      <p className="mono text-xs">{String(r.report_activities?.length || 0).padStart(2, "0")} entri</p>
                    </div>
                  </div>
                </Link>

                <div className="flex border-t border-ink/10 divide-x divide-ink/10">
                  <Link href={`/report/${r.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-3 text-brand-primary active:bg-brand-primary/10 transition-colors">
                    <Eye size={13} />
                    <span className="mono text-[10px] uppercase tracking-[0.15em]">Lihat</span>
                  </Link>
                  <Link href={`/report/${r.id}/edit`} className="flex-1 flex items-center justify-center gap-1.5 py-3 text-yellow-700 active:bg-yellow-50 transition-colors">
                    <Pencil size={13} />
                    <span className="mono text-[10px] uppercase tracking-[0.15em]">Edit</span>
                  </Link>
                  <Link href={`/report/${r.id}/print`} className="flex-1 flex items-center justify-center gap-1.5 py-3 text-green-700 active:bg-green-50 transition-colors">
                    <Printer size={13} />
                    <span className="mono text-[10px] uppercase tracking-[0.15em]">Print</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="border border-dashed border-ink/25 p-8 md:p-12 text-center">
          <p className="mono text-[11px] uppercase tracking-[0.15em] text-ink/60">Tidak ada logbook untuk filter ini</p>
        </div>
      )}
    </div>
  );
}
