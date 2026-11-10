"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import { Bell, MessageSquare, Eye, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Notification = {
  id: string;
  type: "comment" | "review";
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [animating, setAnimating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter((n) => !n.is_read).length;

  // Fetch notifications
  const fetchNotifs = async () => {
    const { data } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20);

    if (data) setNotifs(data as Notification[]);
  };

  useEffect(() => {
    fetchNotifs();

    // Poll every 30s
    const interval = setInterval(fetchNotifs, 30000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Click outside to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const markAllRead = async () => {
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);

    if (error) {
      toast.error("Gagal tandai: " + error.message);
      return;
    }

    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success("Semua notifikasi ditandai dibaca");
  };

  const handleClickNotif = async (notif: Notification) => {
    if (!notif.is_read) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id);

      setNotifs((prev) => prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)));
    }

    if (notif.link) {
      setOpen(false);
      router.push(notif.link);
    }
  };

  const typeIcon = (type: string) => {
    if (type === "comment") return <MessageSquare size={12} />;
    if (type === "review") return <Eye size={12} />;
    return <Bell size={12} />;
  };

  const typeColor = (type: string) => {
    if (type === "comment") return "text-blue-600";
    if (type === "review") return "text-green-600";
    return "text-brand-primary";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button type="button" onClick={() => setOpen(!open)} className={`relative p-2 hover:bg-ink/[0.05] transition-colors ${animating ? "animate-bell-shake" : ""}`} aria-label="Notifikasi">
        <Bell size={18} className="text-ink/70" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-paper">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-paper border border-brand-primary/25 shadow-xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-brand-primary/25">
              <div className="flex items-center gap-2">
                <Bell size={13} className="text-brand-primary" />
                <p className="text-sm font-medium">Notifikasi</p>
                {unreadCount > 0 && <span className="mono text-[9px] uppercase tracking-[0.15em] text-brand-primary bg-brand-primary/10 px-1.5 py-0.5">{unreadCount} baru</span>}
              </div>
              {unreadCount > 0 && (
                <button type="button" onClick={markAllRead} className="mono text-[9px] uppercase tracking-[0.15em] text-brand-primary hover:underline flex items-center gap-1" title="Tandai semua dibaca">
                  <CheckCheck size={10} /> Semua
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto">
              {notifs.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={24} className="mx-auto text-ink/20 mb-2" />
                  <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/40">Belum ada notifikasi</p>
                </div>
              ) : (
                <div className="divide-y divide-ink/10">
                  {notifs.map((n) => (
                    <button key={n.id} type="button" onClick={() => handleClickNotif(n)} className={`w-full text-left p-3 hover:bg-ink/[0.03] transition-colors ${!n.is_read ? "bg-brand-primary/[0.04]" : ""}`}>
                      <div className="flex items-start gap-2">
                        <span className={`mt-0.5 shrink-0 ${typeColor(n.type)}`}>{typeIcon(n.type)}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium mb-0.5">{n.title}</p>
                          <p className="text-xs text-ink/70 line-clamp-2 leading-relaxed">{n.message}</p>
                          <p className="mono text-[9px] text-ink/40 mt-1">
                            {formatDistanceToNow(new Date(n.created_at), {
                              addSuffix: true,
                              locale: localeId,
                            })}
                          </p>
                        </div>
                        {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0 mt-1.5" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifs.length > 0 && (
              <div className="border-t border-brand-primary/25 p-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push("/report");
                  }}
                  className="w-full py-1.5 mono text-[10px] uppercase tracking-[0.15em] text-brand-primary hover:bg-brand-primary/10 transition-colors"
                >
                  Lihat semua logbook
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
