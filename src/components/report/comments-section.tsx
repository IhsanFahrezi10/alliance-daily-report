"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Send, Trash2, MessageSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author: { nama: string; role: string } | { nama: string; role: string }[] | null;
};

function getAuthor(c: Comment): { nama: string; role: string } {
  if (!c.author) return { nama: "—", role: "" };
  if (Array.isArray(c.author)) {
    return c.author[0] || { nama: "—", role: "" };
  }
  return c.author;
}

export default function CommentsSection({ reportId, currentUserId, currentUserRole, initialComments }: { reportId: string; currentUserId: string; currentUserRole: string; initialComments: Comment[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const canComment = ["admin", "super_admin", "hr_approver"].includes(currentUserRole);
  const canDelete = (authorId: string) => authorId === currentUserId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("report_comments")
      .insert({
        report_id: reportId,
        author_id: currentUserId,
        content: content.trim(),
      })
      .select("*, author:author_id (nama, role)")
      .single();

    setLoading(false);

    if (error) {
      toast.error("Gagal kirim komentar: " + error.message);
      return;
    }

    setComments([...comments, data as Comment]);
    setContent("");
    toast.success("Komentar terkirim");
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus komentar ini?")) return;

    const { error } = await supabase.from("report_comments").delete().eq("id", id);

    if (error) {
      toast.error("Gagal hapus: " + error.message);
      return;
    }

    setComments(comments.filter((c) => c.id !== id));
    toast.success("Komentar dihapus");
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 md:mb-5">
        <span className="mono text-[11px] uppercase tracking-[0.2em] text-ink/70 font-medium">04 — Komentar &amp; Feedback</span>
        <div className="flex-1 h-px bg-brand-primary/30" />
        <span className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 shrink-0">{comments.length} komentar</span>
      </div>

      <div className="border border-brand-primary/25 bg-white/40">
        {/* Comment list */}
        {comments.length > 0 ? (
          <div className="divide-y divide-ink/10">
            {comments.map((c) => {
              const author = getAuthor(c);
              return (
                <div key={c.id} className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{author.nama}</span>
                      {author.role && <span className="mono text-[9px] uppercase tracking-[0.1em] text-brand-accent px-1.5 py-0.5 bg-brand-accent/10">{author.role.replace("_", " ")}</span>}
                      <span className="mono text-[10px] text-ink/40">
                        {format(new Date(c.created_at), "d MMM yyyy, HH:mm", {
                          locale: localeId,
                        })}
                      </span>
                    </div>
                    {canDelete(c.author_id) && (
                      <button type="button" onClick={() => handleDelete(c.id)} className="p-1 text-ink/40 hover:text-red-600 transition-colors shrink-0" title="Hapus komentar">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 md:p-8 text-center">
            <MessageSquare size={20} className="mx-auto text-ink/20 mb-2" />
            <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/40">Belum ada komentar</p>
          </div>
        )}

        {/* Form — cuma untuk staff */}
        {canComment && (
          <form onSubmit={handleSubmit} className="border-t border-brand-primary/20 p-4 md:p-5">
            <label className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 block mb-2">Beri Komentar</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="Tulis feedback untuk intern ini..."
              className="w-full border border-brand-primary/20 bg-white focus:border-brand-primary focus:outline-none p-3 text-sm resize-y transition-colors placeholder:text-ink/30"
              disabled={loading}
            />
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-hover disabled:opacity-50 transition-colors px-4 py-2 mono text-[10px] uppercase tracking-[0.15em]"
              >
                {loading ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send size={12} /> Kirim
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
