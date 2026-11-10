import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatRoom, { ChatMessage } from "@/components/chat/chat-room";
import { InternProfile } from "@/components/chat/mention-popup";

export const metadata = {
  title: "Chat Global Anak Intern | Maganghub",
  description: "Ruang obrolan khusus anak intern Maganghub",
};

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Ambil profil user saat ini
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nama, role, avatar_url")
    .eq("id", user.id)
    .single();

  // Proteksi hak akses: HANYA role 'user' (anak intern)
  if (profile?.role !== "user") {
    redirect("/dashboard");
  }

  // Ambil semua daftar anak intern (role === 'user')
  const { data: internsRaw } = await supabase
    .from("profiles")
    .select("id, nama, avatar_url, departemen:departemen_id(nama)")
    .eq("role", "user")
    .order("nama", { ascending: true });

  const interns: InternProfile[] = (internsRaw || []).map((u: any) => ({
    id: u.id,
    nama: u.nama,
    avatar_url: u.avatar_url,
    departemen_nama: Array.isArray(u.departemen)
      ? u.departemen[0]?.nama
      : u.departemen?.nama || "Magang",
  }));

  // Ambil histori pesan chat
  let initialMessages: ChatMessage[] = [];
  let needsSetup = false;

  const { data: messagesData, error: messagesError } = await supabase
    .from("intern_messages")
    .select(
      `
      id,
      content,
      mentions,
      reactions,
      created_at,
      user_id,
      author:user_id (
        id,
        nama,
        avatar_url,
        departemen:departemen_id (nama)
      )
    `
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(100);

  if (messagesError) {
    if (messagesError.code === "PGRST205" || messagesError.message?.includes("does not exist")) {
      needsSetup = true;
    }
  } else if (messagesData) {
    initialMessages = messagesData as unknown as ChatMessage[];
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="pb-3 border-b border-brand-primary/25">
        <div className="flex items-center gap-3 mb-1.5 flex-wrap">
          <span className="mono text-[10px] uppercase tracking-[0.2em] text-brand-primary font-medium">
            Fitur Utama Intern
          </span>
          <div className="h-px w-8 bg-brand-primary/30" />
          <span className="mono text-[10px] uppercase tracking-[0.15em] text-ink/50">
            {interns.length} Rekan Magang
          </span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight">
            Ruang Obrolan <span className="font-serif italic text-brand-primary">Intern</span>
          </h1>
        </div>
      </div>

      {/* Main Chat Container */}
      <ChatRoom
        initialMessages={initialMessages}
        interns={interns}
        currentUserId={user.id}
        currentUserName={profile.nama || "Anak Intern"}
        initialNeedsSetup={needsSetup}
      />
    </div>
  );
}

