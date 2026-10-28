"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  userId: string;
  currentRole: string;
  disabled?: boolean;
};

export default function UserRoleSelect({ userId, currentRole, disabled }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);

  const handleChange = async (newRole: string) => {
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);

    setLoading(false);

    if (error) {
      toast.error("Gagal ubah role: " + error.message);
      return;
    }

    setRole(newRole);
    toast.success("Role berhasil diubah");
    router.refresh();
  };

  if (disabled) {
    return <span className="inline-flex mono text-[11px] uppercase tracking-[0.15em] bg-ink/[0.06] text-ink/60 px-2.5 py-1.5">{role.replace("_", " ")} — kamu</span>;
  }

  return (
    <select
      value={role}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className="w-full bg-transparent border-0 border-b border-ink/25 focus:border-brand-primary focus:outline-none py-1.5 text-xs mono uppercase tracking-[0.1em] transition-colors cursor-pointer disabled:opacity-50"
    >
      <option value="user">User</option>
      <option value="admin">Admin</option>
      <option value="super_admin">Super Admin</option>
    </select>
  );
}
