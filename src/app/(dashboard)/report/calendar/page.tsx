import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CalendarClient from "./calendar-client";

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch semua reports user
  const { data: reportsRaw } = await supabase.from("reports").select("id, tanggal, report_reviews(id)").eq("user_id", user.id).is("deleted_at", null).order("tanggal", { ascending: false });

  const reports = (reportsRaw || []).map((r: any) => ({
    id: r.id,
    tanggal: r.tanggal,
    is_reviewed: Array.isArray(r.report_reviews) ? r.report_reviews.length > 0 : !!r.report_reviews,
  }));

  return <CalendarClient reports={reports} />;
}
