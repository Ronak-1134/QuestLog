import { cn } from '@/lib/utils.js';

export const Container = ({ children, className, size = 'default' }) => {
  const sizes = {
    sm:      'max-w-2xl',
    default: 'max-w-5xl',
    lg:      'max-w-7xl',
    full:    'max-w-none',
  };

  return (
    <div className={cn('mx-auto w-full px-5 md:px-8', sizes[size], className)}>
      {children}
    </div>
  );
};