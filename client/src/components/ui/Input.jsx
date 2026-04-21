import { forwardRef } from 'react';
import { cn }         from '@/lib/utils.js';

export const Input = forwardRef(({
  label, error, hint, className, ...props
}, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-xs font-medium text-[var(--color-secondary)] uppercase tracking-widest font-mono">
        {label}
      </label>
    )}
    <input
      ref={ref}
      className={cn('input-base', error && 'border-red-500/50 focus:border-red-500', className)}
      {...props}
    />
    {error && <span className="text-xs text-red-400 font-mono">{error}</span>}
    {hint && !error && <span className="text-xs text-[var(--color-subtle)]">{hint}</span>}
  </div>
));
Input.displayName = 'Input';