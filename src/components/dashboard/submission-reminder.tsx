"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export default function SubmissionReminder({ hasSubmitted, role }: { hasSubmitted: boolean; role: string }) {
  useEffect(() => {
    // Cuma untuk intern (bukan admin/HR)
    if (role !== "user") return;
    if (hasSubmitted) return;

    // Cek apakah sudah show reminder hari ini (via localStorage)
    const today = new Date().toISOString().split("T")[0];
    const lastShown = localStorage.getItem("reminder-shown-date");
    if (lastShown === today) return;

    // Delay 2 detik biar page ke-load dulu
    const timer = setTimeout(() => {
      toast.warning("Kamu belum isi logbook hari ini", {
        description: "Jangan lupa catat aktivitas kamu sebelum pulang",
        action: {
          label: "Isi Sekarang",
          onClick: () => {
            window.location.href = "/report/new";
          },
        },
        duration: 10000,
        id: "submission-reminder",
      });
      localStorage.setItem("reminder-shown-date", today);
    }, 2000);

    return () => clearTimeout(timer);
  }, [hasSubmitted, role]);

  return null;
}
