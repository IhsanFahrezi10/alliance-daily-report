import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { DesktopSidebar, MobileNav } from "@/components/layout/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import SubmissionReminder from "@/components/dashboard/submission-reminder";
import NotificationBell from "@/components/layout/notification-bell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*, departemen:departemen_id (nama)").eq("id", user.id).single();

  // Cek status logbook hari ini
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: todayReport } = await supabase.from("reports").select("id").eq("user_id", user.id).eq("tanggal", today).is("deleted_at", null).maybeSingle();

  const hasSubmittedToday = !!todayReport;

  const themeAccent = (profile as any)?.theme_accent || "blue";
  const themeMode = (profile as any)?.theme_mode || "light";

  return (
    <ThemeProvider initialTheme={themeAccent} initialMode={themeMode}>
      <SubmissionReminder hasSubmitted={hasSubmittedToday} role={(profile as any)?.role || "user"} />

      <DesktopSidebar profile={profile} hasSubmittedToday={hasSubmittedToday} />

      <div className="flex-1 min-w-0 flex flex-col">
        <MobileNav profile={profile} hasSubmittedToday={hasSubmittedToday} />

        {/* Desktop top bar dengan bell */}
        <header className="hidden md:flex sticky top-0 z-20 bg-paper/80 backdrop-blur-sm border-b border-brand-primary/25 h-14 items-center justify-between px-6">
          <p className="mono text-[10px] uppercase tracking-[0.2em] text-ink/40">
            {format(new Date(), "EEEE, d MMMM yyyy", {
              locale: (await import("date-fns/locale")).id,
            })}
          </p>
          <NotificationBell userId={user.id} />
        </header>

        <main className="flex-1">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10">{children}</div>
        </main>
      </div>
    </ThemeProvider>
  );
}
