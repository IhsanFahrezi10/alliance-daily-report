import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import ReminderListClient from "./reminder-list-client";

export default async function ReminderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Cek role — hanya admin & super_admin yang bisa akses
  const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (!myProfile || !["admin", "super_admin"].includes(myProfile.role)) {
    redirect("/dashboard");
  }

  // Tanggal hari ini
  const today = format(new Date(), "yyyy-MM-dd");
  const todayFormatted = format(new Date(), "EEEE, d MMMM yyyy", {
    locale: localeId,
  });

  // Fetch semua profiles yang JUGA wajib isi logbook
  // → user (intern), admin (Zahwa), super_admin (Ihsan)
  // → EXCLUDE hr_approver (pure staff, bukan intern)
  const { data: internsRaw } = await supabase.from("profiles").select("id, nama, no_wa, batch, departemen_id, role").in("role", ["user", "admin", "super_admin"]).order("nama");

  // Fetch departemen
  const { data: departemenList } = await supabase.from("departemen").select("id, nama");

  const departemenMap = new Map<string, string>();
  departemenList?.forEach((d) => departemenMap.set(d.id, d.nama));

  // Fetch reports hari ini
  const { data: todayReports } = await supabase.from("reports").select("user_id").eq("tanggal", today).is("deleted_at", null);

  const submittedUserIds = new Set<string>();
  todayReports?.forEach((r) => submittedUserIds.add(r.user_id));

  // Combine data
  const interns = (internsRaw || []).map((i) => ({
    id: i.id,
    nama: i.nama,
    no_wa: i.no_wa,
    role: i.role,
    batch: i.batch || 1,
    departemen: i.departemen_id ? departemenMap.get(i.departemen_id) || "—" : "—",
    has_submitted: submittedUserIds.has(i.id),
  }));

  return <ReminderListClient interns={interns} today={today} todayFormatted={todayFormatted} />;
}
