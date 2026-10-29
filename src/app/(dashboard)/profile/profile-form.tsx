"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save } from "lucide-react";

type Props = {
  profile: {
    nama: string;
    departemen_id: string;
    mentor_nama: string;
    role: string;
  };
  departemenList: Array<{ id: string; nama: string }>;
};

export default function ProfileForm({ profile, departemenList }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [nama, setNama] = useState(profile.nama);
  const [departemenId, setDepartemenId] = useState(profile.departemen_id);
  const [mentorNama, setMentorNama] = useState(profile.mentor_nama);
  const [loading, setLoading] = useState(false);

  const isHrApprover = profile.role === "hr_approver";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Sesi habis, silakan login ulang");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        nama: nama.trim(),
        departemen_id: departemenId || null,
        mentor_nama: isHrApprover ? null : mentorNama.trim() || null,
      })
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      toast.error("Gagal update profil: " + error.message);
      return;
    }

    toast.success("Profil berhasil diupdate!");
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <span className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60 font-medium">Edit Profil</span>
        <div className="flex-1 h-px bg-brand-primary/30" />
      </div>

      <form onSubmit={handleSubmit} className="border border-brand-primary/25 bg-white/40 divide-y divide-ink/10">
        <div className="p-6">
          <label className="block mono text-[10px] uppercase tracking-[0.15em] text-ink/60 mb-2">Nama Lengkap</label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama lengkap kamu"
            className="w-full bg-transparent border-0 border-b border-ink/25 focus:border-brand-primary focus:outline-none py-3 text-base transition-colors placeholder:text-ink/30"
          />
        </div>

        <div className="p-6">
          <label className="block mono text-[10px] uppercase tracking-[0.15em] text-ink/60 mb-2">Departemen</label>
          <select
            value={departemenId}
            onChange={(e) => setDepartemenId(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-ink/25 focus:border-brand-primary focus:outline-none py-3 text-base transition-colors cursor-pointer"
          >
            <option value="">— Pilih Departemen —</option>
            {departemenList.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Mentor field — hanya untuk non-HR Approver */}
        {!isHrApprover && (
          <div className="p-6">
            <label className="block mono text-[10px] uppercase tracking-[0.15em] text-ink/60 mb-2">Nama Mentor</label>
            <input
              type="text"
              value={mentorNama}
              onChange={(e) => setMentorNama(e.target.value)}
              placeholder="Nama mentor yang membimbing kamu"
              className="w-full bg-transparent border-0 border-b border-ink/25 focus:border-brand-primary focus:outline-none py-3 text-base transition-colors placeholder:text-ink/30"
            />
            <p className="mono text-[9px] uppercase tracking-[0.15em] text-ink/40 mt-2">Nama ini akan muncul di header laporan PDF</p>
          </div>
        )}

        <div className="p-6">
          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-hover disabled:opacity-60 transition-colors px-6 py-3.5 mono text-[11px] uppercase tracking-[0.15em]">
            <Save size={13} />
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
