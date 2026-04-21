import { motion, AnimatePresence } from 'framer-motion';
import { useLocation }             from 'react-router-dom';

const variants = {
  initial:  { opacity: 0, y: 6 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit:     { opacity: 0, y: -4, transition: { duration: 0.2,  ease: [0.4, 0, 1, 1]   } },
};

export const PageTransition = ({ children }) => {
  const { pathname } = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};