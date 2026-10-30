"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Home, FileText, Users, LogOut, User, Settings, Menu, X, Calendar, Trash2, CheckCheck } from "lucide-react";

function SidebarContent({ profile, onNavigate }: { profile: any; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isHrApprover = profile?.role === "hr_approver";

  const menu = isHrApprover
    ? [
        {
          href: "/reviews",
          label: "Review Logbook",
          num: "01",
          icon: CheckCheck,
        },
        { href: "/profile", label: "Profil", num: "02", icon: User },
      ]
    : [
        { href: "/dashboard", label: "Dashboard", num: "01", icon: Home },
        { href: "/report", label: "Logbook Saya", num: "02", icon: FileText },
        {
          href: "/report/calendar",
          label: "Kalender",
          num: "03",
          icon: Calendar,
        },
        {
          href: "/recap",
          label: "Rekap Mingguan",
          num: "04",
          icon: Calendar,
        },
        ...(profile?.role === "admin" || profile?.role === "super_admin"
          ? [
              {
                href: "/reports",
                label: "Semua Logbook",
                num: "05",
                icon: Users,
              },
            ]
          : []),
        ...(profile?.role === "super_admin"
          ? [
              {
                href: "/users",
                label: "Kelola User",
                num: "06",
                icon: Settings,
              },
            ]
          : []),
        {
          href: "/trash",
          label: "Sampah",
          num: profile?.role === "super_admin" ? "07" : "05",
          icon: Trash2,
        },
        {
          href: "/profile",
          label: "Profil",
          num: profile?.role === "super_admin" ? "08" : "06",
          icon: User,
        },
      ];

  const initial = profile?.nama?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="flex flex-col h-full w-full">
      {/* TOP */}
      <div className="px-6 pt-6 pb-5 border-b border-brand-primary/25 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <Image src="/logo-maganghub.png" alt="Maganghub" width={130} height={36} className="h-7 w-auto" />
          <span className="mono text-[10px] tracking-[0.15em] text-ink/60 uppercase">v1.0</span>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-ink/10">
          <Image src="/logo-alliance.png" alt="Alliance World" width={100} height={28} className="h-6 w-auto opacity-80" />
          <div className="flex-1 h-px bg-ink/15" />
          <Image src="/logo-kemnaker.png" alt="Kemnaker" width={80} height={22} className="h-5 w-auto opacity-80" />
        </div>
      </div>

      {/* USER */}
      <div className="px-6 py-4 border-b border-brand-primary/25 shrink-0">
        <div className="flex items-center gap-3">
          {profile?.avatar_url ? (
            <div className="w-9 h-9 shrink-0 overflow-hidden">
              <img src={profile.avatar_url} alt={profile.nama} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-9 h-9 bg-brand-primary text-white flex items-center justify-center text-xs font-medium shrink-0">{initial}</div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate leading-tight">{profile?.nama || "-"}</p>
            <p className="mono text-[10px] uppercase tracking-[0.15em] text-brand-accent mt-0.5">{profile?.role?.replace("_", " ")}</p>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto">
        <div className="px-6 pt-5 pb-3">
          <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60">— Menu</p>
        </div>

        <div className="flex flex-col">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} onClick={onNavigate} className="block group">
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.15 }}
                  className={`relative flex items-center gap-4 px-6 py-3 border-l-2 border-b border-b-ink/10 transition-colors ${active ? "border-l-brand-primary bg-brand-primary/[0.04]" : "border-l-transparent hover:border-l-ink/20"}`}
                >
                  <span className={`mono text-[11px] tracking-[0.1em] w-5 ${active ? "text-brand-primary font-semibold" : "text-ink/60"}`}>{item.num}</span>
                  <Icon size={15} className={active ? "text-brand-primary" : "text-ink/60"} strokeWidth={1.75} />
                  <span className={`text-sm flex-1 ${active ? "font-medium text-ink" : "text-ink/70 group-hover:text-ink"}`}>{item.label}</span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* BOTTOM */}
      <div className="border-t border-brand-primary/25 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-6 py-3.5 text-[10px] mono uppercase tracking-[0.2em] text-ink/60 hover:text-brand-primary hover:bg-ink/[0.03] transition-colors group border-b border-brand-primary/25"
        >
          <span>Logout</span>
          <LogOut size={13} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="px-6 py-3">
          <p className="mono text-[10px] uppercase tracking-[0.2em] text-ink/35 leading-relaxed">
            © 2026 Maganghub
            <br />× Kemnaker × Alliance
          </p>
        </div>
      </div>
    </div>
  );
}

export function DesktopSidebar({ profile }: { profile: any }) {
  return (
    <aside className="hidden md:flex w-72 shrink-0 bg-paper border-r border-brand-primary/25 h-screen sticky top-0">
      <SidebarContent profile={profile} />
    </aside>
  );
}

export function MobileNav({ profile }: { profile: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="md:hidden sticky top-0 z-30 bg-paper border-b border-brand-primary/25 px-4 py-3 flex items-center justify-between">
        <Image src="/logo-maganghub.png" alt="Maganghub" width={110} height={30} className="h-6 w-auto" />
        <button onClick={() => setOpen(true)} className="p-2 hover:bg-ink/[0.05] transition-colors" aria-label="Buka menu">
          <Menu size={20} />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setOpen(false)} className="fixed inset-0 bg-ink/50 z-40 md:hidden" />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 w-72 bg-paper border-r border-brand-primary/25 z-50 md:hidden flex flex-col"
            >
              <button onClick={() => setOpen(false)} className="absolute top-3 right-3 p-2 hover:bg-ink/[0.05] transition-colors z-10" aria-label="Tutup menu">
                <X size={18} />
              </button>

              <SidebarContent profile={profile} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Sidebar({ profile }: { profile: any }) {
  return <DesktopSidebar profile={profile} />;
}
