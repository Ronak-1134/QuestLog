import { Link }           from 'react-router-dom';
import { motion }         from 'framer-motion';
import { Flame, Clock }   from 'lucide-react';
import { usePileOfShame } from '@/hooks/usePileOfShame.js';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card.jsx';
import { Loader }         from '@/components/ui/Loader.jsx';
import { formatHours }    from '@/lib/utils.js';
import { staggerContainer, staggerItem } from '@/lib/motion.js';

export const PileOfShameCard = () => {
  const { data, isLoading } = usePileOfShame();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Pile of shame</CardTitle>
        <Flame size={14} className="text-[var(--color-muted)]" />
      </CardHeader>

      {isLoading ? <Loader /> : !data?.count ? (
        <p className="text-xs text-[var(--color-subtle)]">
          No unplayed games. Impressive.
        </p>
      ) : (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Unplayed',    value: data.count },
              { label: 'Est. hours',  value: `${data.totalEstimatedHours}h` },
              { label: 'At 3h/day',   value: `${data.yearsAtCasualPace}y` },
            ].map(({ label, value }) => (
              <div key={label}
                className="bg-[var(--color-surface-2)]
                           border border-[var(--color-border)]
                           rounded p-3"
              >
                <p className="stat-value text-lg">{value}</p>
                <p className="stat-label">{label}</p>
              </div>
            ))}
          </div>

          {/* Game list */}
          <motion.div
            variants={staggerContainer(0.04)}
            initial="initial"
            animate="animate"
            className="flex flex-col"
          >
            {data.games.slice(0, 5).map((item) => (
              <motion.div key={item._id} variants={staggerItem}>
                <ShameRow item={item} />
              </motion.div>
            ))}
          </motion.div>

          {data.count > 5 && (
            <Link to="/shame"
              className="text-xs text-[var(--color-subtle)]
                         hover:text-foreground transition-colors mt-3 block"
            >
              View all {data.count} unplayed games →
            </Link>
          )}
        </>
      )}
    </Card>
  );
};

const ShameRow = ({ item }) => (
  <Link to={`/games/${item.game.slug}`}
    className="flex items-center gap-3 py-2.5
               border-b border-[var(--color-border)] last:border-0
               hover:bg-[var(--color-surface-2)] -mx-5 px-5
               transition-colors duration-100 group"
  >
    <div className="w-8 h-11 rounded shrink-0 overflow-hidden
                    border border-[var(--color-border)]
                    bg-[var(--color-surface-2)]">
      {item.game.cover && (
        <img src={item.game.cover} alt=""
             className="w-full h-full object-cover" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-[var(--color-secondary)]
                    group-hover:text-foreground transition-colors truncate">
        {item.game.name}
      </p>
      {item.game.estimatedHours && (
        <div className="flex items-center gap-1 mt-0.5">
          <Clock size={9} className="text-[var(--color-muted)]" />
          <span className="text-2xs font-mono text-[var(--color-muted)]">
            ~{formatHours(item.game.estimatedHours)}
          </span>
        </div>
      )}
    </div>
  </Link>
);