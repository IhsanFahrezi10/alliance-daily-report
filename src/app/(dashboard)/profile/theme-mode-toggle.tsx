"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sun, Moon, Loader2 } from "lucide-react";

export default function ThemeModeToggle({ current }: { current: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState(current);
  const [loading, setLoading] = useState(false);

  const isDark = mode === "dark";

  const handleToggle = async () => {
    if (loading) return;

    const newMode = isDark ? "light" : "dark";
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      toast.error("Sesi habis, login ulang");
      return;
    }

    const { error } = await supabase.from("profiles").update({ theme_mode: newMode }).eq("id", user.id);

    setLoading(false);

    if (error) {
      toast.error("Gagal ubah mode: " + error.message);
      return;
    }

    setMode(newMode);
    toast.success(newMode === "dark" ? "Mode gelap diaktifkan" : "Mode terang diaktifkan");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className="relative inline-flex items-center w-[56px] h-[28px] rounded-full transition-colors disabled:opacity-50 shrink-0"
      aria-label="Toggle dark mode"
      title={isDark ? "Mode Gelap" : "Mode Terang"}
    >
      {/* Track */}
      <span className={`absolute inset-0 rounded-full transition-colors duration-300 ${isDark ? "bg-brand-primary" : "bg-ink/30"}`} />

      {/* Knob */}
      <span className={`absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center ${isDark ? "translate-x-[31px]" : "translate-x-[3px]"}`}>
        {loading ? <Loader2 size={12} className="animate-spin text-ink/60" /> : isDark ? <Moon size={12} className="text-brand-primary" strokeWidth={2.5} /> : <Sun size={12} className="text-yellow-600" strokeWidth={2.5} />}
      </span>
    </button>
  );
}
