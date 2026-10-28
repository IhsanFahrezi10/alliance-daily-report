"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast.error("Login gagal: " + error.message);
      return;
    }
    toast.success("Login berhasil!");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-paper text-ink grid lg:grid-cols-12">
      {/* LEFT — Editorial Panel */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-between border-r border-ink/15 p-12 relative overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Top — logo Maganghub */}
        <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 flex items-start justify-between">
          <Image src="/logo-maganghub.png" alt="Maganghub" width={180} height={48} className="h-auto" priority />
          <span className="text-[10px] uppercase tracking-[0.15em] text-ink/70 mt-1">Logbook Magang</span>
        </motion.header>

        {/* Center — Heading */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="relative z-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-primary mb-8">Program Magang Nasional</p>

          <h1 className="text-[clamp(3rem,7vw,5.5rem)] leading-[0.95] font-light tracking-tight">
            Catat
            <br />
            <span className="italic font-serif text-brand-primary">setiap</span>
            <br />
            kegiatan.
          </h1>

          <div className="mt-10 h-px w-24 bg-brand-primary" />

          <p className="mt-8 text-base text-ink-muted max-w-md leading-relaxed">Satu tempat untuk mencatat aktivitas harian selama masa magang. Tersusun dalam satu template tabel, siap diunduh sebagai PDF A4 untuk dicetak.</p>
        </motion.div>

        {/* Bottom — partner logos */}
        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} className="relative z-10 flex items-end justify-between border-t border-ink/15 pt-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-ink/70 mb-3">Diselenggarakan oleh</p>
            <div className="flex items-center gap-6">
              <Image src="/logo-kemnaker.png" alt="Kemnaker" width={140} height={36} className="h-8 w-auto" />
              <div className="w-px h-8 bg-ink/15" />
              <Image src="/logo-alliance.png" alt="Alliance World" width={140} height={36} className="h-8 w-auto" />
            </div>
          </div>

          <p className="text-[10px] uppercase tracking-[0.15em] text-ink/60">Est. 2026</p>
        </motion.footer>
      </div>

      {/* RIGHT — Form */}
      <div className="lg:col-span-5 flex flex-col p-6 sm:p-10">
        {/* Mobile brand */}
        <div className="lg:hidden flex items-center justify-between mb-10">
          <Image src="/logo-maganghub.png" alt="Maganghub" width={140} height={38} className="h-8 w-auto" priority />
          <span className="text-[10px] uppercase tracking-[0.15em] text-ink/70">Logbook</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
          {/* Section label */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-primary font-medium">01 — Sign in</span>
            <div className="flex-1 h-px bg-ink/15" />
          </div>

          <h2 className="text-3xl font-light tracking-tight mb-2">Masuk ke akun</h2>
          <p className="text-sm text-ink-muted mb-10">Gunakan akun yang sudah diberikan oleh admin magang.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-ink/60">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border-0 border-b border-ink/25 focus:border-brand-primary focus:outline-none py-3 text-base placeholder:text-ink/30 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] text-ink/60">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent border-0 border-b border-ink/25 focus:border-brand-primary focus:outline-none py-3 text-base placeholder:text-ink/30 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-between bg-brand-primary text-white hover:bg-brand-hover disabled:opacity-60 transition-colors px-6 py-4 text-sm uppercase tracking-[0.2em]"
            >
              <span>{loading ? "Memproses..." : "Masuk"}</span>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Info box */}
          <div className="mt-10 pt-6 border-t border-ink/15">
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink/60 mb-2">Tentang</p>
            <p className="text-xs text-ink-muted leading-relaxed">
              Web ini dibuat untuk mempermudah peserta magang dalam mengisi aktivitas harian selama masa magang. Seluruh catatan otomatis tersusun dalam satu template tabel dan dapat diunduh dalam format{" "}
              <span className="font-medium text-ink">PDF A4</span> yang siap dicetak.
            </p>
          </div>
        </motion.div>

        <div className="text-[10px] uppercase tracking-[0.2em] text-ink/60 mt-10 lg:mt-0 text-center lg:text-left">© {new Date().getFullYear()} Maganghub × Kemnaker</div>
      </div>
    </div>
  );
}
