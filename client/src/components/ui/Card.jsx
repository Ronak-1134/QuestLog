import { motion }  from 'framer-motion';
import { cn }      from '@/lib/utils.js';
import { hoverLift } from '@/lib/motion.js';

export const Card = ({ children, className, hoverable = false, ...props }) => (
  <motion.div
    className={cn('card p-5', className)}
    {...(hoverable ? hoverLift : {})}
    {...props}
  >
    {children}
  </motion.div>
);

export const CardHeader = ({ children, className }) => (
  <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
    {children}
  </div>
);

export const CardTitle = ({ children, className }) => (
  <h3 className={cn('text-sm font-medium text-[var(--color-secondary)] font-mono uppercase tracking-widest', className)}>
    {children}
  </h3>
);