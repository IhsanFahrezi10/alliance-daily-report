export default function DashboardLoading() {
  return (
    <div className="space-y-6 md:space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="pb-5 md:pb-6 border-b border-ink/15">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-3 w-20 bg-ink/10 rounded" />
          <div className="h-px w-8 bg-ink/10" />
          <div className="h-3 w-16 bg-ink/10 rounded" />
        </div>
        <div className="h-10 w-64 bg-ink/10 rounded mb-3" />
        <div className="h-3 w-48 bg-ink/10 rounded" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-3">
        <div className="h-20 bg-ink/[0.04] rounded border border-ink/10" />
        <div className="h-20 bg-ink/[0.04] rounded border border-ink/10" />
        <div className="h-20 bg-ink/[0.04] rounded border border-ink/10" />
        <div className="h-20 bg-ink/[0.04] rounded border border-ink/10" />
      </div>
    </div>
  );
}
