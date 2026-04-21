import { forwardRef }  from 'react';
import { motion }      from 'framer-motion';
import { Loader2 }     from 'lucide-react';
import { cn }          from '@/lib/utils.js';

export const Button = forwardRef(({
  children,
  variant  = 'primary',
  size     = 'default',
  loading  = false,
  disabled = false,
  className,
  ...props
}, ref) => {
  const variants = {
    primary: 'btn-primary',
    ghost:   'btn-ghost',
    danger:  'bg-transparent text-red-400 border border-[var(--color-border)] hover:border-red-400/30 hover:bg-red-400/5',
  };
  const sizes = {
    sm:      'btn-sm',
    default: '',
    lg:      'btn-lg',
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
      whileTap={{   scale: disabled || loading ? 1 : 0.98 }}
      disabled={disabled || loading}
      className={cn('btn', variants[variant], sizes[size], className)}
      {...props}
    >
      {loading
        ? <><Loader2 size={14} className="animate-spin" /><span>Loading…</span></>
        : children
      }
    </motion.button>
  );
});
Button.displayName = 'Button';