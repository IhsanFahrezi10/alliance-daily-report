import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import ProfileForm from "./profile-form";
import AvatarUpload from "@/components/profile/avatar-upload";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Query profile base dulu
  const { data: profileBase, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  // 🔍 DEBUG — bakal muncul di terminal
  console.log("=== DEBUG PROFILE ===");
  console.log("Profile error:", profileError);
  console.log("Profile base:", profileBase);
  console.log("Departemen ID:", profileBase?.departemen_id);

  // Query departemen terpisah
  let departemen: { id: string; nama: string } | null = null;
  if (profileBase?.departemen_id) {
    const { data: deptData, error: deptError } = await supabase.from("departemen").select("id, nama").eq("id", profileBase.departemen_id).single();

    console.log("Dept error:", deptError);
    console.log("Dept data:", deptData);

    departemen = deptData;
  }

  // Query semua departemen
  const { data: departemenList, error: listError } = await supabase.from("departemen").select("id, nama").order("nama");

  console.log("Dept list error:", listError);
  console.log("Dept list:", departemenList);
  console.log("=== END DEBUG ===");

  const profile = profileBase as any;
  const departemenName = departemen?.nama || "—";
  const departemenId = departemen?.id || "";

  return (
    <div className="max-w-3xl space-y-6 md:space-y-8">
      {/* HEADER */}
      <div className="pb-5 md:pb-6 border-b border-ink/15">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="mono text-[10px] uppercase tracking-[0.25em] text-brand-primary font-medium">Akun</span>
          <div className="h-px w-8 bg-brand-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight">
          Profil <span className="font-serif italic text-brand-primary">Saya</span>
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-2">Kelola informasi akun magang kamu</p>
      </div>

      {/* IDENTITY CARD */}
      <div className="border border-ink/15 bg-white/40">
        <div className="hidden md:grid md:grid-cols-12">
          <div className="col-span-4 p-6 border-r border-ink/15 flex flex-col items-center justify-center">
            <AvatarUpload userId={user.id} currentAvatarUrl={profile?.avatar_url || null} userName={profile?.nama || "User"} />
            <p className="mono text-[10px] uppercase tracking-[0.25em] text-brand-accent mt-5">{profile?.role?.replace("_", " ")}</p>
          </div>

          <div className="col-span-8 grid grid-cols-2">
            <div className="p-6 border-b border-r border-ink/15">
              <p className="mono text-[9px] uppercase tracking-[0.25em] text-ink/40 mb-2">Email</p>
              <p className="text-sm font-medium break-all">{user.email}</p>
            </div>
            <div className="p-6 border-b border-ink/15">
              <p className="mono text-[9px] uppercase tracking-[0.25em] text-ink/40 mb-2">Terdaftar</p>
              <p className="text-sm font-medium">
                {profile?.created_at
                  ? format(new Date(profile.created_at), "d MMM yyyy", {
                      locale: localeId,
                    })
                  : "-"}
              </p>
            </div>
            <div className="p-6 border-r border-ink/15">
              <p className="mono text-[9px] uppercase tracking-[0.25em] text-ink/40 mb-2">Departemen</p>
              <p className="font-serif italic text-lg">{departemenName}</p>
            </div>
            <div className="p-6">
              <p className="mono text-[9px] uppercase tracking-[0.25em] text-ink/40 mb-2">Status</p>
              <span className="inline-flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.15em] text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                Aktif
              </span>
            </div>
          </div>
        </div>

        <div className="md:hidden">
          <div className="p-5 flex flex-col items-center border-b border-ink/15">
            <AvatarUpload userId={user.id} currentAvatarUrl={profile?.avatar_url || null} userName={profile?.nama || "User"} />
            <p className="text-base font-medium text-center mt-3">{profile?.nama}</p>
            <p className="mono text-[10px] uppercase tracking-[0.25em] text-brand-accent mt-1">{profile?.role?.replace("_", " ")}</p>
          </div>

          <div className="divide-y divide-ink/10">
            <div className="p-4">
              <p className="mono text-[9px] uppercase tracking-[0.25em] text-ink/40 mb-1.5">Email</p>
              <p className="text-sm font-medium break-all">{user.email}</p>
            </div>
            <div className="p-4">
              <p className="mono text-[9px] uppercase tracking-[0.25em] text-ink/40 mb-1.5">Departemen</p>
              <p className="font-serif italic text-base">{departemenName}</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <div>
                <p className="mono text-[9px] uppercase tracking-[0.25em] text-ink/40 mb-1.5">Terdaftar</p>
                <p className="text-sm font-medium">
                  {profile?.created_at
                    ? format(new Date(profile.created_at), "d MMM yyyy", {
                        locale: localeId,
                      })
                    : "-"}
                </p>
              </div>
              <div>
                <p className="mono text-[9px] uppercase tracking-[0.25em] text-ink/40 mb-1.5">Status</p>
                <span className="inline-flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.15em] text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                  Aktif
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileForm
        profile={{
          nama: profile?.nama || "",
          departemen_id: departemenId,
          mentor_nama: profile?.mentor_nama || "",
        }}
        departemenList={departemenList || []}
      />
    </div>
  );
}
