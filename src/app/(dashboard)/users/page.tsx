import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import UserRoleSelect from "./user-role-select";

export default async function UsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (myProfile?.role !== "super_admin") {
    redirect("/dashboard");
  }

  // Query users dulu
  const { data: usersRaw } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });

  // Query departemen terpisah
  const { data: departemenList } = await supabase.from("departemen").select("id, nama");

  // Bikin map buat lookup cepat
  const departemenMap = new Map<string, string>();
  departemenList?.forEach((d) => {
    departemenMap.set(d.id, d.nama);
  });

  const users = (usersRaw || []).map((u) => {
    // HR Approver selalu tampil sebagai "HR Alliance"
    if (u.role === "hr_approver") {
      return { ...u, departemen_nama: "HR Alliance" };
    }
    return {
      ...u,
      departemen_nama: u.departemen_id ? departemenMap.get(u.departemen_id) || "—" : "—",
    };
  });

  return (
    <div className="space-y-6 md:space-y-8">
      {/* HEADER */}
      <div className="pb-5 md:pb-6 border-b border-brand-primary/25">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="mono text-[11px] uppercase tracking-[0.15em] text-brand-primary font-medium">Super Admin</span>
          <div className="h-px w-8 bg-brand-primary" />
          <span className="mono text-[11px] uppercase tracking-[0.2em] text-ink/60">{String(users.length).padStart(2, "0")} User</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight">
          Kelola <span className="font-serif italic text-brand-primary">User</span>
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-2">Atur role dan akses semua user</p>
      </div>

      {/* LIST */}
      {users.length ? (
        <>
          {/* Desktop */}
          <div className="hidden md:block border border-brand-primary/25 bg-white/40">
            <div className="grid grid-cols-12 px-5 py-3 border-b border-brand-primary/25 mono text-[10px] uppercase tracking-[0.2em] text-ink/60">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Nama</div>
              <div className="col-span-3">Departemen</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Terdaftar</div>
            </div>

            {users.map((u, idx) => (
              <div key={u.id} className="grid grid-cols-12 px-5 py-4 border-b last:border-0 border-ink/10 items-center hover:bg-brand-primary/[0.03] transition-colors">
                <div className="col-span-1 mono text-[11px] text-ink/60">{String(idx + 1).padStart(2, "0")}</div>
                <div className="col-span-4">
                  <div className="flex items-center gap-3">
                    {u.avatar_url ? (
                      <div className="w-8 h-8 shrink-0 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u.avatar_url} alt={u.nama} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-brand-primary text-white flex items-center justify-center text-[10px] font-medium shrink-0">{u.nama?.charAt(0)?.toUpperCase() || "U"}</div>
                    )}
                    <p className="text-sm font-medium truncate">{u.nama}</p>
                  </div>
                </div>
                <div className="col-span-3">
                  <p className="mono text-[11px] uppercase tracking-[0.1em] text-ink-muted truncate">{u.departemen_nama}</p>
                </div>
                <div className="col-span-2">
                  <UserRoleSelect userId={u.id} currentRole={u.role} disabled={u.id === user.id} />
                </div>
                <div className="col-span-2">
                  <p className="mono text-[11px] uppercase tracking-[0.1em] text-ink/70">
                    {format(new Date(u.created_at), "dd.MM.yy", {
                      locale: localeId,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {users.map((u, idx) => (
              <div key={u.id} className="border border-brand-primary/25 bg-white/40">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="mono text-[11px] text-ink/60 mt-1.5 shrink-0">{String(idx + 1).padStart(2, "0")}</span>
                    {u.avatar_url ? (
                      <div className="w-10 h-10 shrink-0 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u.avatar_url} alt={u.nama} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-brand-primary text-white flex items-center justify-center text-sm font-medium shrink-0">{u.nama?.charAt(0)?.toUpperCase() || "U"}</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{u.nama}</p>
                      <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 mt-0.5 truncate">{u.departemen_nama}</p>
                    </div>
                    <span className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 shrink-0 mt-1">
                      {format(new Date(u.created_at), "dd.MM.yy", {
                        locale: localeId,
                      })}
                    </span>
                  </div>
                </div>

                <div className="border-t border-brand-primary/20 px-4 py-3">
                  <label className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 block mb-2">Role</label>
                  <UserRoleSelect userId={u.id} currentRole={u.role} disabled={u.id === user.id} />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="border border-dashed border-ink/25 p-8 md:p-12 text-center">
          <p className="mono text-[11px] uppercase tracking-[0.15em] text-ink/60">Belum ada user</p>
        </div>
      )}

      <p className="mono text-[11px] uppercase tracking-[0.2em] text-ink/60">⚠ Role diri sendiri tidak bisa diubah</p>
    </div>
  );
}
