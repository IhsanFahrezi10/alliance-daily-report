import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const ALLOWED_ROLES = ["user", "super_admin", "admin"];

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pastikan user memiliki akses (intern / admin / super_admin)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, nama")
      .eq("id", user.id)
      .single();

    if (!ALLOWED_ROLES.includes(profile?.role)) {
      return NextResponse.json(
        { error: "Akses terbatas: Chat ini khusus untuk anak intern & admin." },
        { status: 403 }
      );
    }

    // Ambil pesan chat terakhir (maks 100)
    const { data: messages, error } = await supabase
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

    if (error) {
      // Jika tabel belum dibuat di database
      if (error.code === "PGRST205" || error.message.includes("does not exist")) {
        return NextResponse.json({ needsSetup: true, messages: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ needsSetup: false, messages: messages || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pastikan user adalah anak intern atau admin
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("id, nama, role, avatar_url, departemen:departemen_id (nama)")
      .eq("id", user.id)
      .single();

    if (!ALLOWED_ROLES.includes(senderProfile?.role)) {
      return NextResponse.json(
        { error: "Akses terbatas: Anda tidak memiliki izin mengirim pesan." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    const mentions = Array.isArray(body?.mentions) ? body.mentions : [];

    if (!content) {
      return NextResponse.json(
        { error: "Isi pesan tidak boleh kosong" },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "Pesan terlalu panjang (maksimum 2000 karakter)" },
        { status: 400 }
      );
    }

    // Insert pesan baru
    const { data: newMessage, error: insertError } = await supabase
      .from("intern_messages")
      .insert({
        user_id: user.id,
        content,
        mentions,
        reactions: {},
      })
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
      .single();

    if (insertError) {
      if (insertError.code === "PGRST205") {
        return NextResponse.json(
          {
            needsSetup: true,
            error:
              "Tabel intern_messages belum dibuat di database Supabase. Jalankan query supabase_intern_chat.sql terlebih dahulu.",
          },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Kirim notifikasi jika ada intern yang di-mention
    if (mentions.length > 0) {
      try {
        // Cari user yang ditag berdasarkan nama atau id
        const cleanMentions = mentions
          .map((m: any) => (typeof m === "string" ? m.replace(/^@/, "").trim() : ""))
          .filter(Boolean);

        if (cleanMentions.length > 0) {
          const { data: taggedUsers } = await supabase
            .from("profiles")
            .select("id, nama")
            .in("role", ["user", "super_admin", "admin"])
            .in("nama", cleanMentions);

          if (taggedUsers && taggedUsers.length > 0) {
            const notifPayloads = taggedUsers
              .filter((u) => u.id !== user.id)
              .map((u) => ({
                user_id: u.id,
                type: "chat",
                title: `Mention dari ${senderProfile?.nama || "Seseorang"}`,
                message:
                  content.length > 80 ? content.slice(0, 80) + "..." : content,
                link: "/chat",
                is_read: false,
              }));

            if (notifPayloads.length > 0) {
              await supabase.from("notifications").insert(notifPayloads);
            }
          }
        }
      } catch (notifErr) {
        console.error("Gagal mengirim notifikasi mention:", notifErr);
      }
    }

    return NextResponse.json({ success: true, message: newMessage });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("id");

    if (!messageId) {
      return NextResponse.json({ error: "ID pesan diperlukan" }, { status: 400 });
    }

    // Hapus pesan (hanya pengirim yang boleh menghapus)
    const { error: deleteError } = await supabase
      .from("intern_messages")
      .delete()
      .eq("id", messageId)
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

