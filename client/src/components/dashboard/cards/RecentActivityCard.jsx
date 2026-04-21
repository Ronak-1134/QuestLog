import { motion }       from 'framer-motion';
import { Link }         from 'react-router-dom';
import { useLibrary }   from '@/hooks/useLibrary.js';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card.jsx';
import { formatRelative } from '@/lib/utils.js';
import { staggerContainer, staggerItem } from '@/lib/motion.js';

const STATUS_LABEL = {
  playing:   'started playing',
  completed: 'completed',
  backlog:   'added to backlog',
  dropped:   'dropped',
  wishlist:  'wishlisted',
  replaying: 'replaying',
};

export const RecentActivityCard = () => {
  const { data, isLoading } = useLibrary({ limit: 6 });
  const items = data?.data ?? [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>

      {!isLoading && items.length === 0 ? (
        <p className="text-xs text-[var(--color-subtle)]">No activity yet.</p>
      ) : (
        <motion.div
          variants={staggerContainer(0.05)}
          initial="initial"
          animate="animate"
          className="flex flex-col"
        >
          {items.map((ug) => {
            const game = ug.gameId;
            return (
              <motion.div
                key={ug._id}
                variants={staggerItem}
                className="flex items-start gap-3 py-2.5
                           border-b border-[var(--color-border)] last:border-0"
              >
                <Link to={`/games/${game?.slug}`}>
                  <div className="w-7 h-7 rounded shrink-0 overflow-hidden
                                  border border-[var(--color-border)]
                                  bg-[var(--color-surface-2)] mt-0.5
                                  hover:border-[var(--color-border-2)]
                                  transition-colors">
                    {game?.cover && (
                      <img src={game.coverThumb ?? game.cover} alt=""
                           className="w-full h-full object-cover" />
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate font-medium">
                    {game?.name}
                  </p>
                  <p className="text-xs text-[var(--color-subtle)]">
                    {STATUS_LABEL[ug.status] ?? ug.status}
                  </p>
                </div>

                <span className="text-xs text-[var(--color-muted)] font-mono
                                 shrink-0 whitespace-nowrap">
                  {formatRelative(ug.updatedAt)}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </Card>
  );
};