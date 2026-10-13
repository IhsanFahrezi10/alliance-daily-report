import { z } from "zod";

export const reportSchema = z.object({
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  attendance: z.enum(["Present", "Excused", "Sick"], {
    message: "Attendance wajib dipilih",
  }),
  challenges: z.string().optional(),
  lesson_learned: z.string().optional(),
  catatan: z.string().optional(),
  activities: z
    .array(
      z.object({
        deskripsi: z.string().min(1, "Deskripsi wajib diisi"),
        status: z.enum(["selesai", "on_progress", "pending"]),
      }),
    )
    .min(1, "Minimal 1 aktivitas"),
});

export type ReportInput = z.infer<typeof reportSchema>;
