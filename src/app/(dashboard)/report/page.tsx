import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReportListClient from "./report-list-client";

export default async function ReportListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Query reports tanpa nested review join
  const { data: reportsRaw } = await supabase
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

  const reports = reportsRaw || [];
  const reportIds = reports.map((r) => r.id);

  // Query reviews terpisah (defensive — no nested join)
  const reviewMap = new Map<string, { id: string; reviewed_at: string }>();
  if (reportIds.length > 0) {
    const { data: reviewsData } = await supabase.from("report_reviews").select("id, report_id, reviewed_at").in("report_id", reportIds);

    reviewsData?.forEach((r) => {
      reviewMap.set(r.report_id, { id: r.id, reviewed_at: r.reviewed_at });
    });
  }

  // Gabungin review ke report
  const reportsWithReview = reports.map((r) => ({
    id: r.id,
    tanggal: r.tanggal,
    created_at: r.created_at,
    report_activities: Array.isArray(r.report_activities) ? r.report_activities : [],
    review: reviewMap.get(r.id) || null,
  }));

  return <ReportListClient reports={reportsWithReview} />;
}
