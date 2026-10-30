"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sun, Moon, Loader2 } from "lucide-react";

const MODES = [
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
];

export default function ThemeModeToggle({ current }: { current: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [selected, setSelected] = useState(current);
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelect = async (value: string) => {
    if (value === selected) return;
    setLoading(value);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(null);
      toast.error("Sesi habis, login ulang");
      return;
    }

    const { error } = await supabase.from("profiles").update({ theme_mode: value }).eq("id", user.id);

    setLoading(null);

    if (error) {
      toast.error("Gagal ubah mode: " + error.message);
      return;
    }

    setSelected(value);
    toast.success(`Mode ${value === "dark" ? "gelap" : "terang"} diaktifkan`);
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <span className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 font-medium">Mode Tampilan</span>
        <div className="flex-1 h-px bg-brand-primary/30" />
      </div>

      <div className="border border-brand-primary/25 bg-white/40 p-6">
        <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 mb-1">Pilih Mode</p>
        <p className="text-xs text-ink-muted mb-4">Ubah tampilan jadi terang atau gelap</p>

        <div className="grid grid-cols-2 gap-3">
          {MODES.map((m) => {
            const Icon = m.icon;
            const isActive = selected === m.value;
            const isProcessing = loading === m.value;

            return (
              <button
                key={m.value}
                type="button"
                onClick={() => handleSelect(m.value)}
                disabled={!!loading}
                className={`flex items-center justify-center gap-2 py-3 border transition-colors disabled:opacity-50 ${isActive ? "bg-brand-primary text-white border-brand-primary" : "border-brand-primary/25 hover:bg-ink/[0.03]"}`}
              >
                {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
                <span className="mono text-[10px] uppercase tracking-[0.15em]">{m.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60">Aktif: {MODES.find((m) => m.value === selected)?.label || "Terang"}</p>
        </div>
      </div>
    </div>
  );
}
