import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DesktopSidebar, MobileNav } from "@/components/layout/sidebar";
import { ThemeProvider } from "@/components/theme-provider";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*, departemen:departemen_id (nama)").eq("id", user.id).single();

  const themeAccent = (profile as any)?.theme_accent || "blue";
  const themeMode = (profile as any)?.theme_mode || "light";

  return (
    <ThemeProvider initialTheme={themeAccent} initialMode={themeMode}>
      <DesktopSidebar profile={profile} />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileNav profile={profile} />
        <main className="flex-1">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10">{children}</div>
        </main>
      </div>
    </ThemeProvider>
  );
}
