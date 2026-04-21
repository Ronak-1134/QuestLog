import { motion, useSpring } from 'framer-motion';
import { useScrollProgress } from '@/hooks/useScrollProgress.js';

export const ScrollProgress = () => {
  const progress = useScrollProgress();
  const width    = useSpring(progress * 100, { stiffness: 200, damping: 30 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[200]
                 bg-foreground origin-left"
      style={{ scaleX: progress, transformOrigin: '0%' }}
    />
  );
};