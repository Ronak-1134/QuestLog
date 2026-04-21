import { useQuery }    from '@tanstack/react-query';
import { BarChart2 }   from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card.jsx';
import { formatNumber } from '@/lib/utils.js';
import api              from '@/lib/axios.js';

export const CommunityCard = () => {
  const { data } = useQuery({
    queryKey: ['globalStats'],
    queryFn:  async () => {
      const { data } = await api.get('/stats/global');
      return data.data;
    },
    staleTime:          1000 * 60 * 5,
    refetchInterval:    1000 * 60 * 5,    // poll every 5 min
    refetchOnWindowFocus: true,
  });

  const stats   = data ?? {};
  const metrics = [
    { label: 'Games tracked', value: formatNumber(stats.games?.total ?? 0) },
    { label: 'Submissions',   value: formatNumber(stats.games?.totalSubmissions ?? 0) },
    { label: 'Players',       value: formatNumber(stats.users?.total ?? 0) },
    { label: 'Hours logged',  value: formatNumber(stats.users?.totalHours ?? 0) },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Community</CardTitle>
        <BarChart2 size={14} className="text-[var(--color-muted)]" />
      </CardHeader>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map(({ label, value }) => (
          <div key={label}>
            <AnimatePresence mode="wait">
              <motion.p
                key={value}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{    opacity: 0, y: -3 }}
                transition={{ duration: 0.25 }}
                className="stat-value text-2xl mb-0.5"
              >
                {value}
              </motion.p>
            </AnimatePresence>
            <p className="stat-label">{label}</p>
          </div>
        ))}
      </div>

      {stats.topGames?.length > 0 && (
        <div className="mt-5">
          <p className="stat-label mb-3">Most tracked</p>
          <div className="flex gap-2">
            {stats.topGames.slice(0, 5).map((g) => (
              <div key={g.igdbId}
                className="w-9 h-12 rounded overflow-hidden shrink-0
                           border border-[var(--color-border)]
                           bg-[var(--color-surface-2)]"
              >
                {g.cover && (
                  <img src={g.cover} alt={g.name}
                       className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};