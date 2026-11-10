import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

    // Role check: intern & admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const allowedRoles = ["user", "super_admin", "admin"];
    if (!allowedRoles.includes(profile?.role)) {
      return NextResponse.json(
        { error: "Akses terbatas" },
        { status: 403 }
      );
    }

    const { messageId, emoji } = await request.json();

    if (!messageId || !emoji) {
      return NextResponse.json(
        { error: "messageId dan emoji diperlukan" },
        { status: 400 }
      );
    }

    // Fetch existing message reactions
    const { data: msg, error: fetchError } = await supabase
      .from("intern_messages")
      .select("reactions")
      .eq("id", messageId)
      .single();

    if (fetchError || !msg) {
      return NextResponse.json(
        { error: "Pesan tidak ditemukan" },
        { status: 404 }
      );
    }

    const reactions = (msg.reactions as Record<string, string[]>) || {};
    const userList: string[] = Array.isArray(reactions[emoji])
      ? [...reactions[emoji]]
      : [];

    const existingIdx = userList.indexOf(user.id);
    if (existingIdx > -1) {
      // Toggle off
      userList.splice(existingIdx, 1);
    } else {
      // Toggle on
      userList.push(user.id);
    }

    const updatedReactions = { ...reactions };
    if (userList.length === 0) {
      delete updatedReactions[emoji];
    } else {
      updatedReactions[emoji] = userList;
    }

    const { error: updateError } = await supabase
      .from("intern_messages")
      .update({ reactions: updatedReactions })
      .eq("id", messageId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, reactions: updatedReactions });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

