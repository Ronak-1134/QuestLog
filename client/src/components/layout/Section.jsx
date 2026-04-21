import { cn } from '@/lib/utils.js';

export const Section = ({ children, className, spacing = 'default' }) => {
  const spacings = {
    sm:      'py-10 md:py-14',
    default: 'py-16 md:py-24',
    lg:      'py-24 md:py-32',
  };

  return (
    <section className={cn(spacings[spacing], className)}>
      {children}
    </section>
  );
};