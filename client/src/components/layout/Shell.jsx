import { motion, AnimatePresence } from 'framer-motion';
import { useLocation }             from 'react-router-dom';
import { Navbar }                  from './Navbar.jsx';
import { ScrollProgress }          from '@/components/ui/ScrollProgress.jsx';
import { PageTransition }          from '@/components/ui/PageTransition.jsx';

export const Shell = ({ children, withNoise = true }) => (
  <div className={`min-h-dvh flex flex-col ${withNoise ? 'noise' : ''}`}>
    <ScrollProgress />
    <Navbar />
    <PageTransition>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </PageTransition>
  </div>
);