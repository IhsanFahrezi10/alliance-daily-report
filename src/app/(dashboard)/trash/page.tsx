import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TrashListClient from "./trash-list-client";

export default async function TrashPage() {
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
      deleted_at,
      report_activities (id)
    `,
    )
    .eq("user_id", user.id)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  return <TrashListClient reports={reports || []} />;
}
