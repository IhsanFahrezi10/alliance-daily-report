import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AuditListClient from "./audit-list-client";

export default async function AuditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Cek role — hanya admin & super_admin
  const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (!myProfile || !["admin", "super_admin"].includes(myProfile.role)) {
    redirect("/dashboard");
  }

  // Fetch audit logs (100 terbaru)
  const { data: logsRaw } = await supabase
    .from("audit_logs")
    .select(
      `
      id,
      action,
      entity_type,
      entity_id,
      description,
      metadata,
      created_at,
      user_id
    `,
    )
    .order("created_at", { ascending: false })
    .limit(200);

  // Fetch user profiles buat lookup nama
  const { data: profiles } = await supabase.from("profiles").select("id, nama, role, batch");

  const profileMap = new Map<string, { nama: string; role: string; batch: number }>();
  profiles?.forEach((p) => {
    profileMap.set(p.id, {
      nama: p.nama,
      role: p.role,
      batch: p.batch || 1,
    });
  });

  const logs = (logsRaw || []).map((l) => {
    const profile = l.user_id ? profileMap.get(l.user_id) : null;
    return {
      id: l.id,
      action: l.action,
      entity_type: l.entity_type,
      entity_id: l.entity_id,
      description: l.description,
      metadata: l.metadata,
      created_at: l.created_at,
      user_id: l.user_id,
      user_nama: profile?.nama || "System",
      user_role: profile?.role || null,
      user_batch: profile?.batch || null,
    };
  });

  // Ambil daftar user unik buat filter
  const uniqueUsers = Array.from(new Map(logs.filter((l) => l.user_id).map((l) => [l.user_id, { id: l.user_id!, nama: l.user_nama }])).values()).sort((a, b) => a.nama.localeCompare(b.nama));

  return <AuditListClient logs={logs} users={uniqueUsers} />;
}
