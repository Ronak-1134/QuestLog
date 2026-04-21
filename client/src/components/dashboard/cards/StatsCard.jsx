import { useEffect }    from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStats } from '@/hooks/useUserStats.js';
import { useAuthStore } from '@/store/auth.store.js';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card.jsx';
import { formatHours }  from '@/lib/utils.js';
import { staggerContainer, staggerItem } from '@/lib/motion.js';

export const StatsCard = () => {
  const { user }  = useAuthStore();
  const { data }  = useUserStats();

  const stats  = data?.totals ?? user?.stats ?? {};
  const counts = data?.statusCounts ?? {};

  const rows = [
    { label: 'Total games',  value: stats.totalGames     ?? 0 },
    { label: 'Completed',    value: stats.completedGames ?? 0 },
    { label: 'Hours logged', value: formatHours(stats.totalHours) },
    { label: 'Completion',   value: `${stats.completionRate ?? stats.avgCompletion ?? 0}%` },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Your stats</CardTitle>
      </CardHeader>

      <motion.div
        variants={staggerContainer(0.05)}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-3"
      >
        {rows.map(({ label, value }) => (
          <motion.div
            key={label}
            variants={staggerItem}
            className="bg-[var(--color-surface-2)]
                       border border-[var(--color-border)]
                       rounded p-4"
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={String(value)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{    opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="stat-value text-xl mb-1"
              >
                {value}
              </motion.p>
            </AnimatePresence>
            <p className="stat-label">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Status pill strip */}
      {Object.keys(counts).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {Object.entries(counts).map(([status, count]) =>
            count > 0 ? (
              <span key={status}
                className="tag capitalize"
              >
                {status} {count}
              </span>
            ) : null
          )}
        </div>
      )}
    </Card>
  );
};