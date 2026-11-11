import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import ChatRoom, { ChatMessage } from "@/components/chat/chat-room";
import { InternProfile } from "@/components/chat/mention-popup";

function getAdminClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }
  return null;
}

export const metadata = {
  title: "Alliance Daily Report - Maganghub",
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

  // Proteksi hak akses: role 'user' (intern) dan admin / super_admin
  const allowedRoles = ["user", "super_admin", "admin"];
  if (!allowedRoles.includes(profile?.role)) {
    redirect("/dashboard");
  }

  // Ambil semua daftar anak intern + admin untuk mention
  const { data: internsRaw } = await supabase
    .from("profiles")
    .select("id, nama, role, avatar_url, departemen:departemen_id(nama)")
    .in("role", ["user", "super_admin", "admin"])
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

  const db = getAdminClient() || supabase;

  const { data: messagesData, error: messagesError } = await db
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
    <div className="space-y-3 sm:space-y-4">
      {/* Page Header */}
      <div className="pb-2.5 sm:pb-3 border-b border-brand-primary/25">
        <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
          <span className="mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-brand-primary font-medium">
            Fitur Utama Intern
          </span>
          <div className="h-px w-6 sm:w-8 bg-brand-primary/30" />
          <span className="mono text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-ink/50">
            {interns.length} Rekan Magang
          </span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-light tracking-tight">
            Ruang Obrolan <span className="font-serif italic text-brand-primary">Intern</span>
          </h1>
        </div>
      </div>

      {/* Main Chat Container */}
      <ChatRoom
        initialMessages={initialMessages}
        interns={interns}
        currentUserId={user.id}
        currentUserName={profile?.nama || "Anak Intern"}
        initialNeedsSetup={needsSetup}
      />
    </div>
  );
}

