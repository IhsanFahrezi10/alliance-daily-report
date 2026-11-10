"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, isToday, isYesterday } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import {
  MessagesSquare,
  Search,
  Users,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  ArrowDown,
  Sparkles,
} from "lucide-react";
import ChatInput from "./chat-input";
import InternMembersList from "./intern-members-list";
import { InternProfile } from "./mention-popup";

export type ChatMessage = {
  id: string;
  user_id: string;
  content: string;
  mentions?: string[];
  reactions?: Record<string, string[]>;
  created_at: string;
  author?: {
    id: string;
    nama: string;
    avatar_url?: string | null;
    departemen?: { nama: string } | null;
  } | null;
  isPending?: boolean;
};

type Props = {
  initialMessages: ChatMessage[];
  interns: InternProfile[];
  currentUserId: string;
  currentUserName: string;
  initialNeedsSetup?: boolean;
};

const QUICK_REACTION_EMOJIS = ["👍", "❤️", "🔥", "😂", "👏", "🚀"];

export default function ChatRoom({
  initialMessages,
  interns,
  currentUserId,
  currentUserName,
  initialNeedsSetup = false,
}: Props) {
  const supabase = createClient();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [needsSetup, setNeedsSetup] = useState(initialNeedsSetup);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMembersMobile, setShowMembersMobile] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Map interns by name for fast mention lookup
  const internNames = useMemo(
    () => new Set(interns.map((i) => i.nama.toLowerCase())),
    [interns]
  );

  // Auto scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom("auto");
  }, []);

  // Detect if user is scrolled up
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    setShowScrollBottom(!isNearBottom);
  };

  // Realtime subscription + polling fallback
  useEffect(() => {
    // 1. Supabase Realtime
    const channel = supabase
      .channel("intern-chat-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "intern_messages" },
        async (payload: any) => {
          const newRow = payload.new;
          if (!newRow || newRow.deleted_at) return;

          // Cek apakah pesan sudah ada (misal dari optimistic update)
          setMessages((prev) => {
            if (prev.some((m) => m.id === newRow.id)) return prev;

            // Fetch author profile
            const author = interns.find((i) => i.id === newRow.user_id);
            const enriched: ChatMessage = {
              ...newRow,
              author: author
                ? {
                    id: author.id,
                    nama: author.nama,
                    avatar_url: author.avatar_url,
                    departemen: author.departemen_nama
                      ? { nama: author.departemen_nama }
                      : null,
                  }
                : null,
            };
            return [...prev, enriched];
          });
          setTimeout(() => scrollToBottom(), 50);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "intern_messages" },
        (payload: any) => {
          const updated = payload.new;
          if (!updated) return;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "intern_messages" },
        (payload: any) => {
          const old = payload.old;
          if (!old) return;
          setMessages((prev) => prev.filter((m) => m.id !== old.id));
        }
      )
      // Broadcast fallback
      .on("broadcast", { event: "new_message" }, ({ payload }: any) => {
        if (!payload) return;
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.id)) return prev;
          return [...prev, payload];
        });
        setTimeout(() => scrollToBottom(), 50);
      })
      .subscribe();

    // 2. Polling interval fallback (setiap 8 detik)
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch("/api/chat/messages");
        const json = await res.json();
        if (json.needsSetup) {
          setNeedsSetup(true);
        } else if (Array.isArray(json.messages)) {
          setNeedsSetup(false);
          setMessages((prev) => {
            // Gabungkan pesan yang belum ada
            const ids = new Set(prev.map((m) => m.id));
            const fresh = json.messages.filter((m: ChatMessage) => !ids.has(m.id));
            if (fresh.length === 0) return prev;
            return [...prev, ...fresh].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          });
        }
      } catch {
        // Abaikan error polling
      }
    }, 8000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [supabase, interns]);

  // Send message handler
  const handleSendMessage = async (content: string, mentions: string[]): Promise<boolean> => {
    const tempId = `temp-${Date.now()}`;
    const myProfile = interns.find((i) => i.id === currentUserId);

    // Optimistic message
    const optimisticMsg: ChatMessage = {
      id: tempId,
      user_id: currentUserId,
      content,
      mentions,
      reactions: {},
      created_at: new Date().toISOString(),
      isPending: true,
      author: {
        id: currentUserId,
        nama: currentUserName,
        avatar_url: myProfile?.avatar_url,
        departemen: myProfile?.departemen_nama
          ? { nama: myProfile.departemen_nama }
          : null,
      },
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => scrollToBottom(), 20);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, mentions }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needsSetup) {
          setNeedsSetup(true);
        }
        toast.error(data.error || "Gagal mengirim pesan");
        // Hapus optimistic
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        return false;
      }

      // Ganti optimistic dengan data dari server
      const confirmedMsg = data.message || optimisticMsg;
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...confirmedMsg, isPending: false } : m))
      );

      // Broadcast ke channel realtime
      try {
        const channel = supabase.channel("intern-chat-room");
        await channel.send({
          type: "broadcast",
          event: "new_message",
          payload: confirmedMsg,
        });
      } catch {
        // Broadcast best-effort
      }

      return true;
    } catch (err: any) {
      toast.error("Gagal terhubung ke server");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      return false;
    }
  };

  // Toggle emoji reaction
  const handleReaction = async (messageId: string, emoji: string) => {
    // Optimistic reaction update
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const currentReactions = { ...(msg.reactions || {}) };
        const users = [...(currentReactions[emoji] || [])];
        const idx = users.indexOf(currentUserId);
        if (idx > -1) {
          users.splice(idx, 1);
        } else {
          users.push(currentUserId);
        }
        if (users.length === 0) {
          delete currentReactions[emoji];
        } else {
          currentReactions[emoji] = users;
        }
        return { ...msg, reactions: currentReactions };
      })
    );

    try {
      const res = await fetch("/api/chat/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, emoji }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Gagal memberi reaksi");
      }
    } catch {
      // rollback handled on next sync
    }
  };

  // Delete message handler
  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm("Hapus pesan ini?")) return;

    // Optimistic remove
    setMessages((prev) => prev.filter((m) => m.id !== messageId));

    try {
      const res = await fetch(`/api/chat/messages?id=${messageId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Gagal menghapus pesan");
      } else {
        toast.success("Pesan dihapus");
      }
    } catch {
      toast.error("Gagal terhubung ke server");
    }
  };

  // Copy SQL script to clipboard
  const handleCopySql = async () => {
    const sql = `-- Jalankan di Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.intern_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mentions JSONB DEFAULT '[]'::jsonb,
  reactions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_intern_messages_created_at ON public.intern_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intern_messages_user_id ON public.intern_messages (user_id);
ALTER TABLE public.intern_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Interns can read chat messages" ON public.intern_messages FOR SELECT USING (deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'user'));
CREATE POLICY "Interns can insert chat messages" ON public.intern_messages FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'user'));
CREATE POLICY "Interns can delete own messages" ON public.intern_messages FOR DELETE USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.intern_messages;`;

    await navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    toast.success("Query SQL disalin ke clipboard!");
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Render message text with highlighted mentions & links
  const renderMessageContent = (text: string) => {
    // Regex untuk memisahkan @Mention dan URL
    const parts = text.split(/(@[\w\s.-]+|https?:\/\/[^\s]+)/g);

    return parts.map((part, idx) => {
      if (part.startsWith("@")) {
        const cleanName = part.slice(1).trim();
        const isInternName = internNames.has(cleanName.toLowerCase());
        const isMe = cleanName.toLowerCase() === currentUserName.toLowerCase();

        if (isInternName) {
          return (
            <span
              key={idx}
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold mr-0.5 transition-colors ${
                isMe
                  ? "bg-brand-accent/25 text-brand-deep border border-brand-accent/40 font-bold"
                  : "bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
              }`}
            >
              {part}
            </span>
          );
        }
      }

      if (part.startsWith("http://") || part.startsWith("https://")) {
        return (
          <a
            key={idx}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-accent underline hover:text-brand-primary break-all"
          >
            {part}
          </a>
        );
      }

      return <span key={idx}>{part}</span>;
    });
  };

  // Filter messages by search query
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter(
      (m) =>
        m.content.toLowerCase().includes(q) ||
        (m.author?.nama && m.author.nama.toLowerCase().includes(q))
    );
  }, [messages, searchQuery]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { dateLabel: string; items: ChatMessage[] }[] = [];
    filteredMessages.forEach((msg) => {
      const d = new Date(msg.created_at);
      let dateLabel = format(d, "EEEE, d MMMM yyyy", { locale: localeId });
      if (isToday(d)) {
        dateLabel = "Hari Ini";
      } else if (isYesterday(d)) {
        dateLabel = "Kemarin";
      }

      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.dateLabel === dateLabel) {
        lastGroup.items.push(msg);
      } else {
        groups.push({ dateLabel, items: [msg] });
      }
    });
    return groups;
  }, [filteredMessages]);

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] border border-brand-primary/25 bg-white/40 overflow-hidden shadow-sm">
      {/* HEADER */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-brand-primary/25 bg-paper/90 backdrop-blur-sm flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-brand-primary text-white flex items-center justify-center shrink-0">
            <MessagesSquare size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-semibold truncate leading-tight">
                Chat Global Anak Intern
              </h2>
              <span className="mono text-[9px] uppercase tracking-[0.15em] bg-emerald-500/15 text-emerald-700 px-2 py-0.5 font-bold shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="mono text-[10px] uppercase tracking-[0.12em] text-ink/50 truncate mt-0.5">
              Khusus {interns.length} anak intern · Tag pakai @ · Kirim emot
            </p>
          </div>
        </div>

        {/* Actions: Search & Toggle members list */}
        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative hidden sm:block w-44 md:w-56">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pesan..."
              className="w-full pl-7 pr-3 py-1 text-xs bg-white/70 border border-brand-primary/20 focus:border-brand-primary focus:outline-none placeholder:text-ink/40"
            />
          </div>

          {/* Toggle Members Button (Mobile & Desktop) */}
          <button
            type="button"
            onClick={() => setShowMembersMobile(!showMembersMobile)}
            className={`p-2 border border-brand-primary/25 transition-colors flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.1em] ${
              showMembersMobile
                ? "bg-brand-primary text-white"
                : "bg-paper hover:bg-brand-primary/10 text-ink/70"
            }`}
            title="Daftar Teman Intern"
          >
            <Users size={14} />
            <span className="hidden md:inline">{interns.length} Teman</span>
          </button>
        </div>
      </div>

      {/* SETUP WARNING BANNER (If table not migrated yet) */}
      {needsSetup && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Setup Database Diperlukan</p>
              <p className="text-ink/70 mt-0.5">
                Tabel <code className="mono text-[11px] bg-white/80 px-1 py-0.5">intern_messages</code> belum
                dibuat di database Supabase. Jalankan query setup di Supabase SQL Editor sekali saja.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopySql}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 mono text-[10px] uppercase tracking-[0.15em] shrink-0 transition-colors"
          >
            {copiedSql ? (
              <>
                <Check size={12} /> Tersalin
              </>
            ) : (
              <>
                <Copy size={12} /> Salin Query SQL
              </>
            )}
          </button>
        </div>
      )}

      {/* BODY: CHAT MESSAGES + MEMBERS SIDEBAR */}
      <div className="flex-1 min-h-0 flex relative">
        {/* Messages Stream */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 space-y-6"
        >
          {/* Welcome message */}
          <div className="border border-dashed border-brand-primary/25 bg-brand-primary/[0.02] p-4 text-center max-w-lg mx-auto">
            <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-2">
              <Sparkles size={16} />
            </div>
            <p className="mono text-[11px] uppercase tracking-[0.15em] text-brand-primary font-medium">
              Selamat datang di Ruang Obrolan Intern
            </p>
            <p className="text-xs text-ink/70 mt-1 leading-relaxed">
              Ruang santai & diskusi bebas untuk sesama anak magang Maganghub. Ketik{" "}
              <strong className="text-brand-primary">@</strong> untuk tag teman dan klik emot untuk kirim reaksi!
            </p>
          </div>

          {/* Grouped Messages */}
          {groupedMessages.map((group) => (
            <div key={group.dateLabel} className="space-y-4">
              {/* Date divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-brand-primary/20" />
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/50 bg-paper px-2 py-0.5 border border-brand-primary/15">
                  {group.dateLabel}
                </span>
                <div className="flex-1 h-px bg-brand-primary/20" />
              </div>

              {/* Messages list */}
              {group.items.map((msg) => {
                const isMe = msg.user_id === currentUserId;
                const authorName = msg.author?.nama || "Anak Intern";
                const authorDept = msg.author?.departemen?.nama || "Magang";
                const initial = authorName.charAt(0).toUpperCase();
                const avatar = msg.author?.avatar_url;
                const timeStr = format(new Date(msg.created_at), "HH:mm");

                // Check if current user was mentioned in this message
                const amIMentioned =
                  msg.content.includes(`@${currentUserName}`) && !isMe;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 group/msg ${
                      isMe ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="shrink-0 mt-0.5">
                      {avatar ? (
                        <div className="w-8 h-8 overflow-hidden border border-brand-primary/25">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={avatar}
                            alt={authorName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-8 h-8 flex items-center justify-center text-xs font-medium text-white ${
                            isMe ? "bg-brand-deep" : "bg-brand-primary"
                          }`}
                        >
                          {initial}
                        </div>
                      )}
                    </div>

                    {/* Bubble Container */}
                    <div
                      className={`max-w-[82%] sm:max-w-[70%] space-y-1.5 ${
                        isMe ? "items-end text-right" : "items-start text-left"
                      }`}
                    >
                      {/* Meta: Name + Dept + Time */}
                      <div
                        className={`flex items-center gap-2 flex-wrap ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span className="text-xs font-semibold text-ink">
                          {isMe ? "Kamu" : authorName}
                        </span>
                        <span className="mono text-[9px] uppercase tracking-[0.1em] text-ink/50 bg-ink/[0.04] px-1.5 py-0.2 border border-ink/10">
                          {authorDept}
                        </span>
                        <span className="mono text-[10px] text-ink/40">{timeStr}</span>
                        {msg.isPending && (
                          <span className="mono text-[9px] text-amber-600 animate-pulse">
                            Mengirim...
                          </span>
                        )}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`relative p-3 text-sm leading-relaxed whitespace-pre-wrap break-words border transition-all ${
                          isMe
                            ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                            : amIMentioned
                            ? "bg-brand-accent/10 border-brand-accent text-ink ring-1 ring-brand-accent/30"
                            : "bg-white border-brand-primary/20 text-ink shadow-sm"
                        }`}
                      >
                        {renderMessageContent(msg.content)}

                        {/* Hover Quick Action Bar */}
                        <div
                          className={`absolute top-0 -translate-y-1/2 opacity-0 group-hover/msg:opacity-100 transition-opacity bg-paper border border-brand-primary/30 shadow-lg px-1.5 py-0.5 flex items-center gap-1 z-10 ${
                            isMe ? "left-2" : "right-2"
                          }`}
                        >
                          {QUICK_REACTION_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleReaction(msg.id, emoji)}
                              className="text-xs hover:scale-130 transition-transform p-0.5"
                              title={`Beri reaksi ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                          {isMe && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="text-ink/40 hover:text-red-600 p-0.5 ml-1 border-l border-ink/20 pl-1"
                              title="Hapus pesan"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Reactions Chips */}
                      {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div
                          className={`flex items-center gap-1.5 flex-wrap pt-0.5 ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          {Object.entries(msg.reactions).map(([emoji, users]) => {
                            if (!users || users.length === 0) return null;
                            const hasReacted = users.includes(currentUserId);

                            return (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleReaction(msg.id, emoji)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border transition-colors ${
                                  hasReacted
                                    ? "bg-brand-primary/15 border-brand-primary text-brand-primary font-medium"
                                    : "bg-white/80 border-ink/20 text-ink/70 hover:bg-brand-primary/10"
                                }`}
                                title={`${users.length} orang`}
                              >
                                <span>{emoji}</span>
                                <span className="mono text-[10px]">{users.length}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {filteredMessages.length === 0 && (
            <div className="p-12 text-center text-ink/40 space-y-2">
              <MessagesSquare size={32} className="mx-auto text-ink/20" />
              <p className="mono text-xs uppercase tracking-[0.15em]">
                {searchQuery ? "Tidak ada pesan yang cocok" : "Belum ada pesan"}
              </p>
              <p className="text-xs text-ink/50">Jadilah yang pertama menyapa teman-teman magang!</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom floating button */}
        {showScrollBottom && (
          <button
            type="button"
            onClick={() => scrollToBottom()}
            className="absolute bottom-20 right-6 bg-brand-primary text-white p-2 shadow-lg border border-white/20 hover:bg-brand-hover transition-colors z-20"
            title="Lihat pesan terbaru"
          >
            <ArrowDown size={16} />
          </button>
        )}

        {/* Members Sidebar (Desktop: visible if toggled or screen wide, Mobile: overlay) */}
        {showMembersMobile && (
          <div className="absolute inset-y-0 right-0 z-30 shadow-2xl md:relative md:shadow-none">
            <InternMembersList
              interns={interns}
              currentUserId={currentUserId}
              onTagIntern={(intern) => {
                // Focus textarea and insert @intern.nama
                setShowMembersMobile(false);
                const el = document.querySelector("textarea") as HTMLTextAreaElement | null;
                if (el) {
                  el.value = `${el.value ? el.value + " " : ""}@${intern.nama} `;
                  el.focus();
                  el.dispatchEvent(new Event("input", { bubbles: true }));
                }
              }}
            />
          </div>
        )}
      </div>

      {/* INPUT BAR */}
      <ChatInput
        interns={interns}
        onSendMessage={handleSendMessage}
        disabled={false}
      />
    </div>
  );
}

