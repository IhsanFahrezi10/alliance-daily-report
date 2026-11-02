"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Send, CheckCircle2, Clock, Copy, Users, ArrowLeft, Bell, AlertCircle, Shield, ShieldCheck } from "lucide-react";

type Intern = {
  id: string;
  nama: string;
  no_wa: string | null;
  role: string;
  batch: number;
  departemen: string;
  has_submitted: boolean;
};

type Filter = "pending" | "all" | "submitted";

// ============ Normalize phone ============
function normalizePhone(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("8")) return "62" + digits;
  return null;
}

function generateMessage(nama: string, tanggal: string): string {
  const logbookUrl = "https://alliance-daily-report.vercel.app/report/new";
  const monevUrl = "https://monev.maganghub.kemnaker.go.id/";
  return `Halo ${nama}!

Reminder untuk *${tanggal}* — jangan lupa isi 2 hal ini ya:
- Logbook harian:
${logbookUrl}

- Monev:
${monevUrl}

Kalau sudah diisi, abaikan pesan ini.

Terima kasih.
— Admin / HR Team`;
}

export default function ReminderListClient({ interns, today, todayFormatted }: { interns: Intern[]; today: string; todayFormatted: string }) {
  const [filter, setFilter] = useState<Filter>("pending");

  const submittedCount = interns.filter((i) => i.has_submitted).length;
  const pendingCount = interns.length - submittedCount;

  const filteredInterns = useMemo(() => {
    if (filter === "pending") return interns.filter((i) => !i.has_submitted);
    if (filter === "submitted") return interns.filter((i) => i.has_submitted);
    return interns;
  }, [interns, filter]);

  const handleCopy = async (intern: Intern) => {
    const msg = generateMessage(intern.nama, todayFormatted);
    try {
      await navigator.clipboard.writeText(msg);
      toast.success("Pesan disalin ke clipboard");
    } catch {
      toast.error("Gagal salin pesan");
    }
  };

  const buildWaLink = (intern: Intern): string | null => {
    const phone = normalizePhone(intern.no_wa);
    if (!phone) return null;
    const msg = generateMessage(intern.nama, todayFormatted);
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="max-w-5xl space-y-6 md:space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 pb-5 md:pb-6 border-b border-brand-primary/25 flex-wrap">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <Link href="/dashboard" className="p-2 hover:bg-ink/[0.05] transition-colors shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 md:gap-3 mb-1.5 flex-wrap">
              <span className="mono text-[11px] uppercase tracking-[0.15em] text-brand-primary font-medium">Admin</span>
              <div className="h-px w-6 md:w-8 bg-brand-primary/30" />
              <span className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60">{pendingCount} belum isi</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight flex items-center gap-2">
              <Bell size={20} className="text-brand-primary" />
              Reminder <span className="font-serif italic text-brand-primary">Center</span>
            </h1>
            <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/50 mt-1.5">{todayFormatted}</p>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-brand-primary/25 bg-white/40 p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={12} className="text-brand-primary" />
            <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60">Total</p>
          </div>
          <p className="text-2xl font-light text-brand-primary">{interns.length}</p>
        </div>

        <div className="border border-orange-200 bg-orange-50/50 p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={12} className="text-orange-600" />
            <p className="mono text-[10px] uppercase tracking-[0.15em] text-orange-800/70">Belum Isi</p>
          </div>
          <p className="text-2xl font-light text-orange-800">{pendingCount}</p>
        </div>

        <div className="border border-green-200 bg-green-50/50 p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={12} className="text-green-700" />
            <p className="mono text-[10px] uppercase tracking-[0.15em] text-green-800/70">Sudah Isi</p>
          </div>
          <p className="text-2xl font-light text-green-800">{submittedCount}</p>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60">Filter:</span>
        {[
          { value: "pending", label: `Belum (${pendingCount})` },
          { value: "submitted", label: `Sudah (${submittedCount})` },
          { value: "all", label: `Semua (${interns.length})` },
        ].map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value as Filter)}
            className={`mono text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 border transition-colors ${
              filter === f.value ? "bg-brand-primary text-white border-brand-primary" : "border-brand-primary/30 text-ink/60 hover:bg-ink/[0.03]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      {filteredInterns.length === 0 ? (
        <div className="border border-dashed border-brand-primary/30 p-12 text-center">
          <CheckCircle2 size={32} className="mx-auto text-green-600 mb-3" />
          <p className="mono text-[11px] uppercase tracking-[0.15em] text-green-700 mb-2 font-medium">{filter === "pending" ? "Semua sudah isi logbook! 🎉" : filter === "submitted" ? "Belum ada yang isi" : "Belum ada data"}</p>
          <p className="text-xs text-ink-muted">{filter === "pending" ? "Nggak ada yang perlu di-reminder hari ini" : "Coba filter lain"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredInterns.map((intern, idx) => {
            const waLink = buildWaLink(intern);
            const hasPhone = !!normalizePhone(intern.no_wa);
            const isSubmitted = intern.has_submitted;
            const isStaff = intern.role === "admin" || intern.role === "super_admin";

            return (
              <div key={intern.id} className={`border bg-white/40 ${isSubmitted ? "border-green-200 bg-green-50/30" : "border-brand-primary/25"}`}>
                <div className="p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  {/* LEFT — Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="mono text-[10px] text-ink/40 mt-1 shrink-0">{String(idx + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium truncate">{intern.nama}</p>
                        <span className="mono text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 border border-ink/20 text-ink/60">Batch {intern.batch}</span>
                        {isStaff && (
                          <span className="mono text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 bg-brand-accent/15 text-brand-primary flex items-center gap-1 border border-brand-accent/30">
                            {intern.role === "super_admin" ? <ShieldCheck size={9} /> : <Shield size={9} />}
                            {intern.role.replace("_", " ")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="mono text-[10px] uppercase tracking-[0.1em] text-ink/50">{intern.departemen}</span>
                        <span className="mono text-[10px] text-ink/30">·</span>
                        {hasPhone ? (
                          <span className="mono text-[10px] text-green-700">{intern.no_wa}</span>
                        ) : (
                          <span className="mono text-[10px] text-red-500 flex items-center gap-1">
                            <AlertCircle size={9} />
                            No. WA belum diisi
                          </span>
                        )}
                      </div>
                      {isSubmitted && (
                        <p className="mono text-[10px] text-green-700 mt-1 flex items-center gap-1">
                          <CheckCircle2 size={10} />
                          Sudah isi logbook hari ini
                        </p>
                      )}
                    </div>
                  </div>

                  {/* RIGHT — Actions */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap md:justify-end">
                    {!isSubmitted ? (
                      <>
                        {hasPhone && waLink ? (
                          <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-green-600 text-white hover:bg-green-700 transition-colors px-3 py-2 mono text-[10px] uppercase tracking-[0.15em]">
                            <Send size={11} />
                            Kirim WA
                          </a>
                        ) : (
                          <span className="flex items-center gap-1.5 px-3 py-2 mono text-[10px] uppercase tracking-[0.15em] text-red-500 border border-red-200 bg-red-50/50">
                            <AlertCircle size={11} />
                            No WA kosong
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopy(intern)}
                          className="flex items-center gap-1.5 border border-brand-primary/30 hover:bg-ink/[0.03] transition-colors px-3 py-2 mono text-[10px] uppercase tracking-[0.15em]"
                          title="Salin pesan (kirim manual)"
                        >
                          <Copy size={11} />
                          Copy
                        </button>
                      </>
                    ) : (
                      <span className="flex items-center gap-1.5 text-green-700 px-3 py-2 mono text-[10px] uppercase tracking-[0.15em]">
                        <CheckCircle2 size={11} />
                        Sudah
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INFO BOTTOM */}
      <div className="border border-blue-200 bg-blue-50/50 p-4 text-xs text-blue-900/80 leading-relaxed">
        <p className="mono text-[10px] uppercase tracking-[0.15em] text-blue-700 mb-1 font-medium">💡 Cara Pakai</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>
            Klik <strong>Kirim WA</strong> → WhatsApp kebuka dengan pesan terisi otomatis, tinggal pencet Send
          </li>
          <li>
            Klik <strong>Copy</strong> → pesan disalin ke clipboard, tempel manual kalau WA nggak kebuka
          </li>
          <li>
            Kalau <strong>No. WA kosong</strong> → isi dulu via Supabase Table Editor (kolom `no_wa`)
          </li>
        </ul>
      </div>
    </div>
  );
}
