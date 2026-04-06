interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-stone-200/70 dark:bg-slate-700/50 ${className}`}
    />
  );
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`rounded-3xl border border-stone-200/80 bg-white/82 p-6 shadow-[0_18px_48px_-32px_rgba(28,25,23,0.45)] dark:border-slate-800/70 dark:bg-slate-900/78 sm:p-7 ${className}`}>
      <Skeleton className="mb-3 h-4 w-24" />
      <Skeleton className="h-9 w-32" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-2 py-3">
      <Skeleton className="h-9 w-9 !rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  );
}

export function SkeletonTableRow({ cols = 6 }: { cols?: number }) {
  return (
    <tr className="border-b border-stone-200/60 dark:border-slate-800/50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <Skeleton className="h-5 w-20" />
        </td>
      ))}
    </tr>
  );
}
