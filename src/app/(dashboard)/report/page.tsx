import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReportListClient from "./report-list-client";

export default async function ReportListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: reports } = await supabase
    .from("reports")
    .select(
      `
      id,
      tanggal,
      created_at,
      report_activities (id, status)
    `,
    )
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("tanggal", { ascending: false });

  return <ReportListClient reports={reports || []} />;
}
