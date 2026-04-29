import { useEffect }     from 'react';
import { useNavigate }   from 'react-router-dom';
import { motion }        from 'framer-motion';
import { Search }        from 'lucide-react';
import { useAuthStore }  from '@/store/auth.store.js';
import { useUserStats }  from '@/hooks/useUserStats.js';
import { staggerContainer, staggerItem } from '@/lib/motion.js';
import { formatHours }   from '@/lib/utils.js';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5)  return 'Still up?';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export const DashboardHeader = () => {
  const { user, firebaseUser } = useAuthStore();
  const { data }               = useUserStats();
  const navigate               = useNavigate();

  // Get the best available name
  const displayName =
    user?.username                                    // MongoDB username
    ?? firebaseUser?.displayName                      // Google display name
    ?? firebaseUser?.email?.split('@')[0]             // email prefix
    ?? 'Player';

  const totals = data?.totals;

  return (
    <motion.div
      variants={staggerContainer(0.07)}
      initial="initial"
      animate="animate"
      className="mb-10 flex flex-col md:flex-row md:items-end
                 justify-between gap-6"
    >
      <div>
        <motion.p variants={staggerItem}
          className="text-[var(--color-subtle)] text-xs font-mono
                     uppercase tracking-widest mb-2">
          {greeting()}
        </motion.p>
        <motion.h2 variants={staggerItem} className="text-foreground">
          {displayName}
        </motion.h2>
        {totals && (
          <motion.div variants={staggerItem}
            className="flex items-center gap-4 mt-2 flex-wrap">
            {[
              { v: totals.totalGames,                    l: 'games' },
              { v: formatHours(totals.totalHours),       l: 'logged' },
              { v: `${totals.completionRate ?? 0}%`,     l: 'complete' },
            ].map(({ v, l }) => (
              <span key={l} className="text-sm font-mono text-[var(--color-subtle)]">
                <span className="text-[var(--color-secondary)]">{v}</span> {l}
              </span>
            ))}
          </motion.div>
        )}
      </div>

      {/* Quick search */}
      <motion.div variants={staggerItem} className="relative max-w-xs w-full">
        <Search size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2
                     text-[var(--color-muted)] pointer-events-none" />
        <input
          placeholder="Quick search…"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
              navigate(`/search?q=${encodeURIComponent(e.target.value.trim())}`);
            }
          }}
          className="input-base pl-9 py-2 text-sm w-full"
        />
      </motion.div>
    </motion.div>
  );
};