"use client";

import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { FileText, Users, CheckCircle2, Clock, ArrowUpRight, TrendingUp, PieChart as PieIcon, Award, UserX } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

type Stat = {
  totalLogbooks: number;
  totalInterns: number;
  totalReviewed: number;
  totalPending: number;
};

type TrendPoint = {
  tanggal: string;
  label: string;
  count: number;
};

type AttendanceStats = {
  present: number;
  excused: number;
  sick: number;
};

type DeptStat = {
  nama: string;
  count: number;
};

type InternStat = {
  user_id: string;
  nama: string;
  departemen: string;
  batch: number;
  logbook_count: number;
};

export default function HrDashboard({
  stats,
  thirtyDayChart,
  attendanceStats,
  deptStats,
  allInterns,
  recentReports,
}: {
  stats: Stat;
  thirtyDayChart: TrendPoint[];
  attendanceStats: AttendanceStats;
  deptStats: DeptStat[];
  allInterns: InternStat[];
  recentReports: Array<{
    id: string;
    tanggal: string;
    user_nama: string;
    departemen: string;
    is_reviewed: boolean;
  }>;
}) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  // Chart colors — adaptive
  const chartColors = {
    grid: isDark ? "rgba(255,255,255,0.08)" : "rgba(26,26,26,0.1)",
    tick: isDark ? "#A3A3A3" : "#666",
    tooltipBg: isDark ? "#1F1F1F" : "#F5F1EA",
    tooltipBorder: isDark ? "rgba(255,255,255,0.15)" : "rgba(26,26,26,0.15)",
    tooltipText: isDark ? "#F5F5F5" : "#1A1A1A",
    bar: isDark ? "#4a7bc8" : "#1b4f8a",
    areaStroke: isDark ? "#4dcbff" : "#1b4f8a",
    areaFill: isDark ? "rgba(77,203,255,0.25)" : "rgba(27,79,138,0.15)",
  };

  // Palette chart (donut + bar)
  const palette = isDark ? ["#4a7bc8", "#4dcbff", "#5c8ad4", "#7bb8e0", "#a3d0e8", "#cbdcf0"] : ["#1b4f8a", "#00aeef", "#4a7bc8", "#5ba8d4", "#7bb8e0", "#a3d0e8"];

  // Attendance data (3 slice)
  const attendanceData = [
    { name: "Hadir", value: attendanceStats.present, color: "#22c55e" },
    { name: "Izin", value: attendanceStats.excused, color: "#eab308" },
    { name: "Sakit", value: attendanceStats.sick, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  // Dept data (donut)
  const deptPieData = deptStats.slice(0, 6).map((d, i) => ({
    name: d.nama,
    value: d.count,
    color: palette[i % palette.length],
  }));

  // Top interns bar (horizontal)
  const topForChart = allInterns.slice(0, 10).map((i) => ({
    name: i.nama.length > 15 ? i.nama.slice(0, 15) + "…" : i.nama,
    fullName: i.nama,
    count: i.logbook_count,
  }));

  const maxLogbook = Math.max(...allInterns.map((i) => i.logbook_count), 1);
  const inactiveInterns = allInterns.filter((i) => i.logbook_count === 0);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-5 md:pb-6 border-b border-brand-primary/25">
        <div>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="mono text-[11px] uppercase tracking-[0.15em] text-brand-primary font-medium">HR Approver</span>
            <div className="h-px w-8 bg-brand-primary/30" />
            <span className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60">Analytics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight">
            Dashboard <span className="font-serif italic text-brand-primary">HR</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-2">Pantau aktivitas magang seluruh peserta</p>
        </div>
        <Link href="/reviews" className="flex items-center gap-1.5 bg-brand-primary text-white hover:bg-brand-hover transition-colors px-4 py-2.5 mono text-[10px] uppercase tracking-[0.15em] shrink-0">
          Ke Review <ArrowUpRight size={12} />
        </Link>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-brand-primary/25 bg-white/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={14} className="text-brand-primary" />
            <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60">Total Logbook</p>
          </div>
          <p className="text-3xl font-light tracking-tight">{stats.totalLogbooks}</p>
        </div>

        <div className="border border-brand-primary/25 bg-white/40 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-brand-accent" />
            <p className="mono text-[10px] uppercase tracking-[0.15em] text-ink/60">Total Intern</p>
          </div>
          <p className="text-3xl font-light tracking-tight">{stats.totalInterns}</p>
        </div>

        <div className="border border-green-200 bg-green-50/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={14} className="text-green-700" />
            <p className="mono text-[10px] uppercase tracking-[0.15em] text-green-800/70">Sudah Ditinjau</p>
          </div>
          <p className="text-3xl font-light tracking-tight text-green-800">{stats.totalReviewed}</p>
        </div>

        <div className="border border-orange-200 bg-orange-50/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-orange-600" />
            <p className="mono text-[10px] uppercase tracking-[0.15em] text-orange-800/70">Belum Ditinjau</p>
          </div>
          <p className="text-3xl font-light tracking-tight text-orange-800">{stats.totalPending}</p>
        </div>
      </div>

      {/* 30-DAY TREND */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/70 font-medium flex items-center gap-1.5">
            <TrendingUp size={12} className="text-brand-primary" />
            Trend 30 Hari Terakhir
          </span>
          <div className="flex-1 h-px bg-brand-primary/30" />
          <span className="mono text-[10px] uppercase tracking-[0.15em] text-ink/50 shrink-0">Total: {thirtyDayChart.reduce((s, d) => s + d.count, 0)}</span>
        </div>

        <div className="border border-brand-primary/25 bg-white/40 p-4 md:p-6">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={thirtyDayChart}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.areaStroke} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={chartColors.areaStroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: chartColors.tick }} tickLine={false} stroke={chartColors.grid} interval={4} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: chartColors.tick }} tickLine={false} stroke={chartColors.grid} />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartColors.tooltipBg,
                  border: `1px solid ${chartColors.tooltipBorder}`,
                  fontSize: 11,
                  color: chartColors.tooltipText,
                }}
                labelStyle={{
                  fontWeight: 600,
                  color: chartColors.tooltipText,
                }}
                itemStyle={{ color: chartColors.tooltipText }}
              />
              <Area type="monotone" dataKey="count" stroke={chartColors.areaStroke} strokeWidth={2} fill="url(#areaGradient)" name="Logbook" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2 DONUT CHARTS */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* ATTENDANCE */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/70 font-medium flex items-center gap-1.5">
              <PieIcon size={12} className="text-brand-primary" />
              Kehadiran
            </span>
            <div className="flex-1 h-px bg-brand-primary/30" />
          </div>

          <div className="border border-brand-primary/25 bg-white/40 p-4 md:p-6">
            {attendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    {attendanceData.map((d, i) => (
                      <Cell key={`cell-${i}`} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      border: `1px solid ${chartColors.tooltipBorder}`,
                      fontSize: 11,
                      color: chartColors.tooltipText,
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: 11,
                      color: chartColors.tooltipText,
                    }}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-ink-muted py-10">Belum ada data</p>
            )}
          </div>
        </div>

        {/* DEPT DISTRIBUTION */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/70 font-medium flex items-center gap-1.5">
              <PieIcon size={12} className="text-brand-primary" />
              Distribusi Departemen
            </span>
            <div className="flex-1 h-px bg-brand-primary/30" />
          </div>

          <div className="border border-brand-primary/25 bg-white/40 p-4 md:p-6">
            {deptPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={deptPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    {deptPieData.map((d, i) => (
                      <Cell key={`cell-${i}`} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      border: `1px solid ${chartColors.tooltipBorder}`,
                      fontSize: 11,
                      color: chartColors.tooltipText,
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: 10,
                      color: chartColors.tooltipText,
                    }}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-ink-muted py-10">Belum ada data</p>
            )}
          </div>
        </div>
      </div>

      {/* TOP 10 INTERNS BAR CHART */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/70 font-medium flex items-center gap-1.5">
            <Award size={12} className="text-brand-primary" />
            Top 10 Intern Paling Rajin
          </span>
          <div className="flex-1 h-px bg-brand-primary/30" />
        </div>

        <div className="border border-brand-primary/25 bg-white/40 p-4 md:p-6">
          {topForChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topForChart} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: chartColors.tick }} tickLine={false} stroke={chartColors.grid} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: chartColors.tick }} tickLine={false} stroke={chartColors.grid} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.tooltipBg,
                    border: `1px solid ${chartColors.tooltipBorder}`,
                    fontSize: 11,
                    color: chartColors.tooltipText,
                  }}
                  labelStyle={{
                    fontWeight: 600,
                    color: chartColors.tooltipText,
                  }}
                  itemStyle={{ color: chartColors.tooltipText }}
                />
                <Bar dataKey="count" fill={chartColors.bar} radius={[0, 4, 4, 0]} name="Logbook" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-sm text-ink-muted py-10">Belum ada data</p>
          )}
        </div>
      </div>

      {/* ALL INTERNS LEADERBOARD */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/70 font-medium flex items-center gap-1.5">
            <Users size={12} className="text-brand-primary" />
            Semua Intern
          </span>
          <div className="flex-1 h-px bg-brand-primary/30" />
          <span className="mono text-[10px] uppercase tracking-[0.15em] text-ink/50 shrink-0">{allInterns.length} intern</span>
        </div>

        <div className="border border-brand-primary/25 bg-white/40">
          {allInterns.length > 0 ? (
            <div className="divide-y divide-ink/10">
              {allInterns.map((intern, idx) => {
                const percentage = Math.round((intern.logbook_count / maxLogbook) * 100);
                const isInactive = intern.logbook_count === 0;

                return (
                  <div key={intern.user_id} className="p-3 md:p-4 flex items-center gap-3">
                    <span className="mono text-[10px] text-ink/40 w-5 shrink-0">{String(idx + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                          <p className="text-sm font-medium truncate">{intern.nama}</p>
                          <span className="mono text-[9px] uppercase tracking-[0.1em] text-ink/50">{intern.departemen}</span>
                          <span className="mono text-[9px] uppercase tracking-[0.1em] text-brand-accent">Batch {intern.batch}</span>
                        </div>
                        <p className={`mono text-sm shrink-0 ${isInactive ? "text-red-500" : "text-brand-primary"}`}>{intern.logbook_count}</p>
                      </div>

                      {/* Progress bar */}
                      <div className="h-1.5 w-full bg-ink/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${isInactive ? "bg-red-500/40" : "bg-brand-primary"}`} style={{ width: `${Math.max(percentage, 3)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-sm text-ink-muted py-8">Belum ada intern</p>
          )}
        </div>
      </div>

      {/* INACTIVE WARNING */}
      {inactiveInterns.length > 0 && (
        <div className="border border-orange-200 bg-orange-50/50 p-4 md:p-5">
          <div className="flex items-start gap-3">
            <UserX size={18} className="text-orange-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-800 mb-1">{inactiveInterns.length} intern belum pernah isi logbook</p>
              <p className="text-xs text-orange-800/80">{inactiveInterns.map((i) => i.nama).join(", ")}</p>
            </div>
          </div>
        </div>
      )}

      {/* RECENT 10 */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink/70 font-medium">10 Logbook Terbaru</span>
          <div className="flex-1 h-px bg-brand-primary/30" />
          <Link href="/reviews" className="mono text-[10px] uppercase tracking-[0.15em] text-brand-primary hover:underline shrink-0">
            Lihat semua →
          </Link>
        </div>

        <div className="border border-brand-primary/25 bg-white/40">
          {recentReports.length > 0 ? (
            <div className="divide-y divide-ink/10">
              {recentReports.map((r) => (
                <Link key={r.id} href={`/report/${r.id}`} className="p-3 md:p-4 flex items-center justify-between gap-3 hover:bg-brand-primary/[0.03] transition-colors group">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <p className="font-serif italic text-sm md:text-base leading-none truncate">
                      {format(new Date(r.tanggal), "d MMM yyyy", {
                        locale: localeId,
                      })}
                    </p>
                    <span className="mono text-[10px] text-ink/40 hidden sm:inline">·</span>
                    <p className="text-xs md:text-sm truncate hidden sm:block">{r.user_nama}</p>
                    <span className="mono text-[10px] text-ink/40 hidden md:inline">·</span>
                    <p className="mono text-[10px] uppercase tracking-[0.1em] text-ink/60 truncate hidden md:block">{r.departemen}</p>
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
            <p className="text-center text-sm text-ink-muted py-8">Belum ada logbook</p>
          )}
        </div>
      </div>
    </div>
  );
}
