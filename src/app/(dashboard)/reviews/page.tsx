import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReviewsListClient from "./reviews-list-client";

export default async function ReviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (myProfile?.role !== "hr_approver") {
    redirect("/dashboard");
  }

  // Fetch reports + reviews
  const { data: reportsRaw } = await supabase
    .from("reports")
    .select(
      `
      id,
      tanggal,
      user_id,
      attendance,
      report_activities (id),
      report_reviews (
        id, reviewed_at, reviewed_by, notes,
        profiles:reviewed_by (nama)
      )
    `,
    )
    .is("deleted_at", null)
    .order("tanggal", { ascending: false });

  // Lookup data
  const { data: profiles } = await supabase.from("profiles").select("id, nama, departemen_id");

  const { data: departemenList } = await supabase.from("departemen").select("id, nama");

  const profileMap = new Map<string, { nama: string; departemen_id: string | null }>();
  profiles?.forEach((p) => {
    profileMap.set(p.id, { nama: p.nama, departemen_id: p.departemen_id });
  });

  const departemenMap = new Map<string, string>();
  departemenList?.forEach((d) => {
    departemenMap.set(d.id, d.nama);
  });

  const reports = (reportsRaw || []).map((r: any) => {
    const profile = profileMap.get(r.user_id);
    const departemenNama = profile?.departemen_id ? departemenMap.get(profile.departemen_id) || "—" : "—";

    const review = Array.isArray(r.report_reviews) ? r.report_reviews[0] : r.report_reviews;

    return {
      id: r.id,
      tanggal: r.tanggal,
      attendance: r.attendance,
      user_nama: profile?.nama || "—",
      departemen_nama: departemenNama,
      activity_count: r.report_activities?.length || 0,
      review: review
        ? {
            id: review.id,
            reviewed_at: review.reviewed_at,
            reviewer_nama: review.profiles?.nama || "—",
            notes: review.notes,
          }
        : null,
    };
  });

  return <ReviewsListClient reports={reports} />;
}
