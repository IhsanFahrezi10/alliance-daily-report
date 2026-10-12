"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reportSchema, ReportInput } from "@/lib/validations/report-schema";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function EditReportPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [loadingData, setLoadingData] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReportInput>({
    resolver: zodResolver(reportSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "activities",
  });

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("reports")
        .select(`*, report_activities (*)`)
        .eq("id", params.id as string)
        .single();

      if (error || !data) {
        toast.error("Gagal memuat logbook: " + error?.message);
        setLoadingData(false);
        return;
      }

      const activities = (data.report_activities || [])
        .sort((a: any, b: any) => a.urutan - b.urutan)
        .map((a: any) => ({
          waktu: a.waktu?.slice(0, 5) || "",
          deskripsi: a.deskripsi,
          status: a.status,
        }));

      reset({
        tanggal: data.tanggal,
        attendance: data.attendance || "Present",
        lesson_learned: data.lesson_learned || "",
        challenges: data.kendala || "",
        catatan: data.catatan || "",
        activities: activities.length ? activities : [{ waktu: "", deskripsi: "", status: "selesai" }],
      });

      setLoadingData(false);
    };

    load();
  }, [params.id, reset]);

  const onSubmit = async (data: ReportInput) => {
    const { error: reportErr } = await supabase
      .from("reports")
      .update({
        tanggal: data.tanggal,
        attendance: data.attendance,
        lesson_learned: data.lesson_learned || null,
        kendala: data.challenges || null,
        catatan: data.catatan || null,
      })
      .eq("id", params.id as string);

    if (reportErr) {
      toast.error("Gagal update logbook: " + reportErr.message);
      return;
    }

    const { error: delErr } = await supabase
      .from("report_activities")
      .delete()
      .eq("report_id", params.id as string);

    if (delErr) {
      toast.error("Gagal update aktivitas: " + delErr.message);
      return;
    }

    const activities = data.activities.map((a, i) => ({
      report_id: params.id as string,
      waktu: a.waktu,
      deskripsi: a.deskripsi,
      status: a.status,
      urutan: i,
    }));

    const { error: actErr } = await supabase.from("report_activities").insert(activities);

    if (actErr) {
      toast.error("Gagal simpan aktivitas: " + actErr.message);
      return;
    }

    toast.success("Logbook berhasil diupdate!");
    router.push(`/report/${params.id}`);
    router.refresh();
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="mono text-[10px] uppercase tracking-[0.25em] text-ink/40">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 md:space-y-8">
      {/* HEADER */}
      <div className="flex items-center gap-3 md:gap-4 pb-5 md:pb-6 border-b border-ink/15">
        <Link href={`/report/${params.id}`} className="p-2 hover:bg-ink/[0.05] transition-colors shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 md:gap-3 mb-1.5 flex-wrap">
            <span className="mono text-[10px] uppercase tracking-[0.25em] text-brand-primary font-medium">Edit Entry</span>
            <div className="h-px w-6 md:w-8 bg-brand-primary" />
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/40 truncate">#{String(params.id).slice(0, 8)}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight">Edit Logbook</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
        {/* SECTION 01 */}
        <div>
          <div className="flex items-center gap-3 mb-4 md:mb-5">
            <span className="mono text-[10px] uppercase tracking-[0.3em] text-ink/50 font-medium">01 — Info Hari</span>
            <div className="flex-1 h-px bg-ink/15" />
          </div>

          <div className="border border-ink/15 bg-white/40 divide-y divide-ink/10">
            <div className="p-5 md:p-6">
              <label className="block mono text-[10px] uppercase tracking-[0.2em] text-ink/60 mb-2">Tanggal</label>
              <input type="date" {...register("tanggal")} className="w-full bg-transparent border-0 border-b border-ink/25 focus:border-brand-primary focus:outline-none py-3 text-base transition-colors font-mono" />
              {errors.tanggal && <p className="text-red-600 text-xs mt-2">{errors.tanggal.message}</p>}
            </div>

            <div className="p-5 md:p-6">
              <label className="block mono text-[10px] uppercase tracking-[0.2em] text-ink/60 mb-2">Attendance</label>
              <select {...register("attendance")} className="w-full bg-transparent border-0 border-b border-ink/25 focus:border-brand-primary focus:outline-none py-3 text-base transition-colors cursor-pointer">
                <option value="Hadir">Hadir</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
              </select>
              {errors.attendance && <p className="text-red-600 text-xs mt-2">{errors.attendance.message}</p>}
            </div>
          </div>
        </div>

        {/* SECTION 02 */}
        <div>
          <div className="flex items-center gap-3 mb-4 md:mb-5">
            <span className="mono text-[10px] uppercase tracking-[0.3em] text-ink/50 font-medium">02 — Aktivitas</span>
            <div className="flex-1 h-px bg-ink/15" />
            <button
              type="button"
              onClick={() => append({ waktu: "", deskripsi: "", status: "selesai" })}
              className="flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.2em] bg-brand-primary text-white hover:bg-brand-hover px-3 py-2 transition-colors shrink-0"
            >
              <Plus size={12} />
              <span className="hidden sm:inline">Tambah Kegiatan</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>

          {errors.activities && <p className="text-red-600 text-xs mb-3">{errors.activities.message}</p>}

          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div key={field.id} className="border border-ink/15 bg-white/40">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink/10 bg-ink/[0.02]">
                  <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/50">Kegiatan {String(idx + 1).padStart(2, "0")}</span>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(idx)} className="flex items-center gap-1 mono text-[9px] uppercase tracking-[0.15em] text-ink/40 hover:text-red-600 transition-colors">
                      <Trash2 size={12} /> Hapus
                    </button>
                  )}
                </div>

                <div className="p-4 md:p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="mono text-[9px] uppercase tracking-[0.15em] text-ink/50 block mb-1.5">Waktu</label>
                      <input type="time" {...register(`activities.${idx}.waktu`)} className="w-full bg-transparent border-0 border-b border-ink/25 focus:border-brand-primary focus:outline-none py-2 text-sm font-mono transition-colors" />
                    </div>
                    <div>
                      <label className="mono text-[9px] uppercase tracking-[0.15em] text-ink/50 block mb-1.5">Status</label>
                      <select
                        {...register(`activities.${idx}.status`)}
                        className="w-full bg-transparent border-0 border-b border-ink/25 focus:border-brand-primary focus:outline-none py-2 text-xs mono uppercase tracking-[0.1em] transition-colors cursor-pointer"
                      >
                        <option value="selesai">Selesai</option>
                        <option value="on_progress">Progress</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mono text-[9px] uppercase tracking-[0.15em] text-ink/50 block mb-1.5">Deskripsi Kegiatan</label>
                    <textarea
                      {...register(`activities.${idx}.deskripsi`)}
                      rows={4}
                      placeholder="Ceritakan detail kegiatan kamu di sini... (bisa multi-baris)"
                      className="w-full border border-ink/20 bg-white focus:border-brand-primary focus:outline-none p-3 text-sm transition-colors resize-y leading-relaxed placeholder:text-ink/30"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 03 */}
        <div>
          <div className="flex items-center gap-3 mb-4 md:mb-5">
            <span className="mono text-[10px] uppercase tracking-[0.3em] text-ink/50 font-medium">03 — Catatan Refleksi</span>
            <div className="flex-1 h-px bg-ink/15" />
          </div>

          <div className="border border-ink/15 bg-white/40 divide-y divide-ink/10">
            <div className="p-5 md:p-6">
              <label className="block mono text-[10px] uppercase tracking-[0.2em] text-ink/60 mb-2">Lesson Learned</label>
              <textarea
                {...register("lesson_learned")}
                rows={3}
                placeholder="Apa yang kamu pelajari hari ini?"
                className="w-full border border-ink/20 bg-white focus:border-brand-primary focus:outline-none p-3 text-sm resize-y transition-colors placeholder:text-ink/30"
              />
            </div>

            <div className="p-5 md:p-6">
              <label className="block mono text-[10px] uppercase tracking-[0.2em] text-ink/60 mb-2">Challenges</label>
              <textarea
                {...register("challenges")}
                rows={3}
                placeholder="Ada kendala atau tantangan hari ini?"
                className="w-full border border-ink/20 bg-white focus:border-brand-primary focus:outline-none p-3 text-sm resize-y transition-colors placeholder:text-ink/30"
              />
            </div>

            <div className="p-5 md:p-6">
              <label className="block mono text-[10px] uppercase tracking-[0.2em] text-ink/60 mb-2">Catatan Lain (opsional)</label>
              <textarea
                {...register("catatan")}
                rows={2}
                placeholder="Hal lain yang perlu dicatat..."
                className="w-full border border-ink/20 bg-white focus:border-brand-primary focus:outline-none p-3 text-sm resize-y transition-colors placeholder:text-ink/30"
              />
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-ink/15">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-brand-primary text-white hover:bg-brand-hover disabled:opacity-60 transition-colors px-6 py-3.5 mono text-[11px] uppercase tracking-[0.2em]"
          >
            <Save size={13} />
            {isSubmitting ? "Menyimpan..." : "Update Logbook"}
          </button>
          <button type="button" onClick={() => router.back()} className="border border-ink/20 hover:bg-ink/[0.03] transition-colors px-6 py-3.5 mono text-[11px] uppercase tracking-[0.2em]">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
