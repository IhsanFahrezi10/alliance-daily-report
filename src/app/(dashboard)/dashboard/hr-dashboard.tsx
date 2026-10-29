'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  FileText,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react'

type Stat = {
  totalLogbooks: number
  totalInterns: number
  totalReviewed: number
  totalPending: number
}

type DailyChart = {
  tanggal: string
  label: string
  count: number
}

type TopIntern = {
  user_id: string
  nama: string
  departemen: string
  batch: number
  logbook_count: number
}

type DeptStat = {
  nama: string
  count: number
}

export default function HrDashboard({
  stats,
  dailyChart,
  topInterns,
  deptStats,
  recentReports,
}: {
  stats: Stat
  dailyChart: DailyChart[]
  topInterns: TopIntern[]
  deptStats: DeptStat[]
  recentReports: Array<{
    id: string
    tanggal: string
    user_nama: string
    departemen: string
    is_reviewed: boolean
  }>
}) {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-5 md:pb-6 border-b border-brand-primary/25">
        <div>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="mono text-[11px] uppercase tracking-[0.15em] text-brand-primary font-medium">
              HR Approver
            </span>
            <div className="h-px w-8 bg-brand-primary/30" />
            <span className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60">
              Analytics
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight">
            Dashboard{' '}
            <span className="font-serif italic text-brand-primary">HR</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-2">
            Pantau aktivitas magang seluruh peserta
          </p>
        </div>
        <Link
          href="/reviews"
          className="flex items-center gap-1.5 bg-brand-primary text-white hover:bg-brand-hover transition-colors px-4 py-2.5 mono text-[10px] uppercase tracking-[0.15em] shrink-0"
        >
          Ke Halaman Review <ArrowUpRight size={12} />
        </Link>
      </div>

      {/* STAT CARDS — 4 kolom */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-brand-primary/25 bg-white/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={14} className="text-brand-primary" />
            <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60">
              Total Logbook
            </p>
          </div>
          <p className="text-3xl font-light tracking-tight">
            {stats.totalLogbooks}
          </p>
        </div>

        <div className="border border-brand-primary/25 bg-white/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-brand-accent" />
            <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60">
              Total Intern
            </p>
          </div>
          <p className="text-3xl font-light tracking-tight">
            {stats.totalInterns}
          </p>
        </div>

        <div className="border border-green-200 bg-green-50/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={14} className="text-green-700" />
            <p className="mono text-[10px] uppercase tracking-[0.15em] text-green-800/70">
              Sudah Ditinjau
            </p>
          </div>
          <p className="text-3xl font-light tracking-tight text-green-800">
            {stats.totalReviewed}
          </p>
        </div>

        <div className="border border-orange-200 bg-orange-50/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-orange-600" />
            <p className="mono text-[10px] uppercase tracking-[0.15em] text-orange-800/70">
              Belum Ditinjau
            </p>
          </div>
          <p className="text-3xl font-light tracking-tight text-orange-800">
            {stats.totalPending}
          </p>
        </div>
      </div>

      {/* CHART — logbook per hari */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/70 font-medium flex items-center gap-1.5">
            <TrendingUp size={12} className="text-brand-primary" />
            Aktivitas 7 Hari Terakhir
          </span>
          <div className="flex-1 h-px bg-brand-primary/30" />
        </div>

        <div className="border border-brand-primary/25 bg-white/40 p-4 md:p-6">
          {dailyChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dailyChart}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(26,26,26,0.1)"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#666' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: '#666' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#F5F1EA',
                    border: '1px solid rgba(26,26,26,0.15)',
                    fontSize: 11,
                  }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar dataKey="count" fill="#1b4f8a" name="Logbook" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-sm text-ink-muted py-10">
              Belum ada aktivitas 7 hari terakhir
            </p>
          )}
        </div>
      </div>

      {/* 2 KOLOM: TOP INTERN + DEPT STATS */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* TOP INTERN */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/70 font-medium">
              Top 5 Paling Rajin
            </span>
            <div className="flex-1 h-px bg-brand-primary/30" />
          </div>

          <div className="border border-brand-primary/25 bg-white/40">
            {topInterns.length > 0 ? (
              <div className="divide-y divide-ink/10">
                {topInterns.map((t, idx) => (
                  <div
                    key={t.user_id}
                    className="p-3 md:p-4 flex items-center gap-3"
                  >
                    <span className="mono text-[10px] text-ink/40 w-5 shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{t.nama}</p>
                      <p className="mono text-[9px] uppercase tracking-[0.15em] text-ink/60 mt-0.5">
                        {t.departemen} · Batch {t.batch}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="mono text-lg font-light text-brand-primary leading-none">
                        {t.logbook_count}
                      </p>
                      <p className="mono text-[9px] uppercase tracking-[0.1em] text-ink/40 mt-0.5">
                        logbook
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-ink-muted py-8">
                Belum ada data
              </p>
            )}
          </div>
        </div>

        {/* DEPT STATS */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/70 font-medium">
              Per Departemen
            </span>
            <div className="flex-1 h-px bg-brand-primary/30" />
          </div>

          <div className="border border-brand-primary/25 bg-white/40">
            {deptStats.length > 0 ? (
              <div className="divide-y divide-ink/10">
                {deptStats.map((d) => (
                  <div
                    key={d.nama}
                    className="p-3 md:p-4 flex items-center justify-between gap-3"
                  >
                    <p className="text-sm font-medium">{d.nama}</p>
                    <p className="mono text-sm text-ink-muted">
                      {d.count} logbook
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-ink-muted py-8">
                Belum ada data
              </p>
            )}
          </div>
        </div>
      </div>

      {/* RECENT REPORTS */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/70 font-medium">
            10 Logbook Terbaru
          </span>
          <div className="flex-1 h-px bg-brand-primary/30" />
          <Link
            href="/reviews"
            className="mono text-[10px] uppercase tracking-[0.15em] text-brand-primary hover:underline shrink-0"
          >
            Lihat semua →
          </Link>
        </div>

        <div className="border border-brand-primary/25 bg-white/40">
          {recentReports.length > 0 ? (
            <div className="divide-y divide-ink/10">
              {recentReports.map((r) => (
                <Link
                  key={r.id}
                  href={`/report/${r.id}`}
                  className="p-3 md:p-4 flex items-center justify-between gap-3 hover:bg-brand-primary/[0.03] transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <p className="font-serif italic text-sm md:text-base leading-none truncate">
                      {format(new Date(r.tanggal), 'd MMM yyyy', {
                        locale: localeId,
                      })}
                    </p>
                    <span className="mono text-[10px] text-ink/40 hidden sm:inline">
                      ·
                    </span>
                    <p className="text-xs md:text-sm truncate hidden sm:block">
                      {r.user_nama}
                    </p>
                    <span className="mono text-[10px] text-ink/40 hidden md:inline">
                      ·
                    </span>
                    <p className="mono text-[10px] uppercase tracking-[0.1em] text-ink/60 truncate hidden md:block">
                      {r.departemen}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {r.is_reviewed ? (
                      <span className="inline-flex items-center gap-1 mono text-[9px] uppercase tracking-[0.1em] text-green-700 px-1.5 py-0.5 bg-green-50 border border-green-200">
                        <CheckCircle2 size={10} /> Ditinjau
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 mono text-[9px] uppercase tracking-[0.1em] text-orange-600 px-1.5 py-0.5 bg-orange-50 border border-orange-200">
                        <Clock size={10} /> Belum
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-ink-muted py-8">
              Belum ada logbook
            </p>
          )}
        </div>
      </div>
    </div>
  )
}