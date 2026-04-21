import { motion }      from 'framer-motion';
import { Clock }       from 'lucide-react';
import { formatHours } from '@/lib/utils.js';
import { GamePlaytimeDistribution } from '@/components/charts/GamePlaytimeDistribution.jsx';
import { staggerContainer, staggerItem } from '@/lib/motion.js';

const CATEGORIES = [
  { key: 'mainStory',     label: 'Main story',     desc: 'Critical path only'           },
  { key: 'sideContent',   label: 'Main + sides',   desc: 'Story + key side content'     },
  { key: 'completionist', label: 'Completionist',  desc: '100% achievements/collectibles'},
];

export const PlaytimePanel = ({ stats }) => {
  const hasData = stats && CATEGORIES.some((c) => stats[c.key]?.count > 0);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Clock size={14} className="text-[var(--color-subtle)]" />
        <h5 className="text-foreground">How long to beat</h5>
      </div>

      {!hasData
        ? <EmptyPlaytime />
        : (
          <motion.div
            variants={staggerContainer(0.07)}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {CATEGORIES.map(({ key, label, desc }) => {
              const s = stats[key];
              if (!s?.count) return null;
              return (
                <motion.div key={key} variants={staggerItem}>
                  <StatBlock label={label} desc={desc} stat={s}
                             stats={stats} category={key} />
                </motion.div>
              );
            })}
          </motion.div>
        )
      }
    </div>
  );
};

const StatBlock = ({ label, desc, stat, stats, category }) => (
  <div className="card p-5 flex flex-col gap-4">
    <div>
      <p className="text-sm font-medium text-foreground mb-0.5">{label}</p>
      <p className="text-xs text-[var(--color-muted)]">{desc}</p>
    </div>

    <div>
      <p className="stat-value text-3xl">{formatHours(stat.median)}</p>
      <p className="stat-label mt-1">Median · {stat.count} submissions</p>
    </div>

    <div className="divider" />

    <div className="grid grid-cols-3 gap-2">
      {[
        { label: 'Avg',  val: stat.mean },
        { label: 'Fast', val: stat.min  },
        { label: 'Slow', val: stat.max  },
      ].map(({ label: l, val }) => (
        <div key={l}>
          <p className="stat-label">{l}</p>
          <p className="text-xs font-mono text-[var(--color-secondary)] mt-0.5">
            {formatHours(val)}
          </p>
        </div>
      ))}
    </div>

    <GamePlaytimeDistribution stats={stats} category={category} />
  </div>
);

const EmptyPlaytime = () => (
  <div className="card p-8 flex flex-col items-center gap-3 text-center">
    <Clock size={20} className="text-[var(--color-muted)]" />
    <div>
      <p className="text-sm text-[var(--color-secondary)] mb-1">
        No playtime data yet.
      </p>
      <p className="text-xs text-[var(--color-subtle)]">
        Be the first to submit below.
      </p>
    </div>
  </div>
);