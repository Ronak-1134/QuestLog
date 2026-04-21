import { cn } from '@/lib/utils.js';

export const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default:  'tag',
    playing:  'tag text-emerald-400/70 border-emerald-400/20',
    completed:'tag text-blue-400/70 border-blue-400/20',
    backlog:  'tag text-[var(--color-subtle)] border-[var(--color-border)]',
    dropped:  'tag text-red-400/60 border-red-400/20',
  };

  return (
    <span className={cn(variants[variant] ?? variants.default, className)}>
      {children}
    </span>
  );
};