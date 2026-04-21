export const GameCardSkeleton = () => (
  <div className="flex flex-col gap-2 animate-pulse">
    <div className="aspect-[3/4] rounded bg-[var(--color-surface-2)]
                    border border-[var(--color-border)]" />
    <div className="space-y-1.5">
      <div className="h-2.5 bg-[var(--color-surface-2)] rounded w-4/5" />
      <div className="h-2 bg-[var(--color-surface-2)] rounded w-1/3" />
    </div>
  </div>
);