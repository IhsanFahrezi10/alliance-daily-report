"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessagesSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatFloatingButton({ role }: { role?: string }) {
  const pathname = usePathname();

  const allowed = ["user", "super_admin", "admin"].includes(role || "");
  if (!allowed || pathname === "/chat" || pathname.startsWith("/chat/")) {
    return null;
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Link
        href="/chat"
        className="group flex items-center gap-2.5 bg-brand-primary text-white pl-4 pr-5 py-3 shadow-2xl hover:bg-brand-hover hover:scale-105 active:scale-95 transition-all border border-brand-accent/30"
        title="Buka Chat Anak Intern"
      >
        <div className="relative">
          <MessagesSquare size={19} className="text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-brand-primary animate-pulse" />
        </div>
        <div className="flex flex-col text-left">
          <span className="mono text-[10px] uppercase tracking-[0.2em] font-semibold text-white leading-none">
            Chat Intern
          </span>
          <span className="mono text-[8px] text-white/70 uppercase tracking-[0.1em] mt-0.5">
            Komunitas Magang
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

