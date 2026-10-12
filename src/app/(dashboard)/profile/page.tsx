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

  const { data: profile } = await supabase.from("profiles").select("*, departemen:departemen_id (id, nama)").eq("id", user.id).single();

  const { data: departemenList } = await supabase.from("departemen").select("id, nama").order("nama");

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
        {/* Desktop */}
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
              <p className="font-serif italic text-lg">{profile?.departemen?.nama || "—"}</p>
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

        {/* Mobile */}
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
              <p className="font-serif italic text-base">{profile?.departemen?.nama || "—"}</p>
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

      {/* FORM */}
      <ProfileForm
        profile={{
          nama: profile?.nama || "",
          departemen_id: profile?.departemen?.id || "",
          mentor_nama: profile?.mentor_nama || "",
        }}
        departemenList={departemenList || []}
      />
    </div>
  );
}
