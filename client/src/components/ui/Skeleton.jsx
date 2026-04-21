import { cn } from '@/lib/utils.js';

export const Skeleton = ({ className, ...props }) => (
  <div
    className={cn(
      'animate-pulse rounded bg-[var(--color-surface-2)]',
      className
    )}
    {...props}
  />
);

export const SkeletonText = ({ lines = 1, className }) => (
  <div className={cn('flex flex-col gap-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className="h-3"
        style={{ width: `${100 - (i % 3) * 15}%` }}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className }) => (
  <div className={cn('card p-5', className)}>
    <div className="flex items-start gap-3 mb-4">
      <Skeleton className="w-10 h-10 rounded" />
      <div className="flex-1">
        <Skeleton className="h-3 w-2/3 mb-2" />
        <Skeleton className="h-2.5 w-1/3" />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
);

export const SkeletonGameCard = () => (
  <div className="flex flex-col gap-2">
    <Skeleton className="aspect-[3/4] rounded w-full" />
    <Skeleton className="h-2.5 w-4/5" />
    <Skeleton className="h-2 w-1/3" />
  </div>
);