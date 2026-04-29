import { useState }    from 'react';
import { motion }      from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
import { formatHours } from '@/lib/utils.js';
import { cn }          from '@/lib/utils.js';

const CATEGORIES = [
  {
    key:   'mainStory',
    label: 'Main Story',
    desc:  'Critical path only',
    color: '#f4f4f5',
  },
  {
    key:   'sideContent',
    label: 'Main + Sides',
    desc:  'Story + key side quests',
    color: '#a1a1aa',
  },
  {
    key:   'completionist',
    label: 'Completionist',
    desc:  '100% everything',
    color: '#6b6b6b',
  },
];

export const CompletionTimeTracker = ({ stats, userProgress }) => {
  const [active, setActive] = useState('mainStory');

  const hasAny = stats && CATEGORIES.some(
    (c) => stats[c.key]?.count > 0
  );

  if (!hasAny) return null;

  const current = stats[active];

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Clock size={14} className="text-[var(--color-subtle)]" />
        <h5 className="text-foreground">How long to beat</h5>
      </div>

      {/* Category selector */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {CATEGORIES.map(({ key, label, desc, color }) => {
          const s       = stats[key];
          const isActive = active === key;
          if (!s?.count) return null;

          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={cn(
                'flex flex-col items-start p-4 rounded border text-left',
                'transition-all duration-200',
                isActive
                  ? 'bg-[var(--color-surface-2)] border-[var(--color-border-2)]'
                  : 'bg-transparent border-[var(--color-border)] hover:border-[var(--color-border-2)]'
              )}
            >
              <p className={cn(
                'text-xs font-medium mb-1 transition-colors',
                isActive ? 'text-foreground' : 'text-[var(--color-subtle)]'
              )}>
                {label}
              </p>
              <p className="stat-value text-2xl" style={{ color: isActive ? color : '#6b6b6b' }}>
                {formatHours(s.median)}
              </p>
              <p className="text-2xs font-mono text-[var(--color-muted)] mt-0.5">
                {s.count} players
              </p>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      {current?.count > 0 && (
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="card p-5"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Median',  value: formatHours(current.median), big: true },
              { label: 'Average', value: formatHours(current.mean)   },
              { label: 'Fastest', value: formatHours(current.min)    },
              { label: 'Slowest', value: formatHours(current.max)    },
            ].map(({ label, value, big }) => (
              <div key={label}>
                <p className={cn(
                  'font-display font-bold text-foreground leading-none mb-0.5',
                  big ? 'text-4xl' : 'text-xl'
                )}>
                  {value}
                </p>
                <p className="stat-label">{label}</p>
              </div>
            ))}
          </div>

          {/* Distribution bar */}
          <div className="mt-4">
            <p className="stat-label mb-2">
              Based on {current.count} submissions
            </p>
            <DistributionBar stat={current} />
          </div>

          {/* User's time vs community */}
          {userProgress?.playtimeHours > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
              <p className="stat-label mb-2">Your progress</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-[var(--color-border)]
                                rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: '#34d399' }}
                    initial={{ width: 0 }}
                    animate={{
                      width: current.median
                        ? `${Math.min(100, (userProgress.playtimeHours / current.median) * 100)}%`
                        : '0%',
                    }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <span className="text-xs font-mono text-[var(--color-subtle)] shrink-0">
                  {formatHours(userProgress.playtimeHours)} / {formatHours(current.median)}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

// ── Distribution bar ───────────────────────────────────────────────
const DistributionBar = ({ stat }) => {
  const { min, max, median, mean, p25, p75 } = stat;
  const range = max - min || 1;

  const pos = (v) => `${((v - min) / range) * 100}%`;

  return (
    <div className="relative h-8">
      {/* Track */}
      <div className="absolute top-3 inset-x-0 h-2
                      bg-[var(--color-border)] rounded-full" />

      {/* IQR range */}
      {p25 && p75 && (
        <div
          className="absolute top-3 h-2 bg-[var(--color-surface-2)]
                     border-x border-[var(--color-border-2)] rounded"
          style={{ left: pos(p25), width: `${((p75 - p25) / range) * 100}%` }}
        />
      )}

      {/* Median marker */}
      <div
        className="absolute top-1 w-1.5 h-6 bg-foreground rounded-full"
        style={{ left: pos(median), transform: 'translateX(-50%)' }}
      />

      {/* Labels */}
      <div className="absolute -bottom-1 inset-x-0 flex justify-between">
        <span className="text-2xs font-mono text-[var(--color-muted)]">
          {formatHours(min)}
        </span>
        <span className="text-2xs font-mono text-[var(--color-subtle)]
                         absolute" style={{ left: pos(median), transform:'translateX(-50%)' }}>
          {formatHours(median)}
        </span>
        <span className="text-2xs font-mono text-[var(--color-muted)]">
          {formatHours(max)}
        </span>
      </div>
    </div>
  );
};
