import { useMemo }       from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
  AreaChart, Area, Cell,
} from 'recharts';
import { useUserStats }  from '@/hooks/useUserStats.js';
import { usePileOfShame } from '@/hooks/usePileOfShame.js';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card.jsx';
import { Loader }        from '@/components/ui/Loader.jsx';
import { formatHours }   from '@/lib/utils.js';
import { motion }        from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/motion.js';

// ── Shared chart theme ─────────────────────────────────────────────────────
const C = {
  bar:     '#f4f4f5',
  barDim:  '#2a2a2a',
  area:    '#f4f4f5',
  grid:    '#1a1a1a',
  axis:    '#6b6b6b',
  tooltip: { bg: '#0f0f0f', border: '#2a2a2a' },
};

const axisStyle   = { fontSize: 10, fontFamily: 'DM Mono, monospace', fill: C.axis };
const tooltipBase = {
  backgroundColor: C.tooltip.bg,
  border:          `1px solid ${C.tooltip.border}`,
  borderRadius:    '4px',
  fontSize:        '11px',
  fontFamily:      'DM Mono, monospace',
  color:           '#a1a1aa',
};

// ─────────────────────────────────────────────────────────────────────────────
export const PlaytimeCharts = () => {
  const { data, isLoading } = useUserStats();
  if (isLoading) return <Loader />;
  if (!data)     return null;

  return (
    <motion.div
      variants={staggerContainer(0.07)}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:col-span-3"
    >
      <motion.div variants={staggerItem} className="md:col-span-2">
        <MonthlyChart data={data.monthlyActivity} />
      </motion.div>
      <motion.div variants={staggerItem}>
        <GenreChart data={data.genreBreakdown} />
      </motion.div>
      <motion.div variants={staggerItem}>
        <StatusBreakdown data={data.statusBreakdown} totals={data.totals} />
      </motion.div>
    </motion.div>
  );
};

// ── Monthly area + bar ─────────────────────────────────────────────────────
const MonthlyChart = ({ data }) => {
  const formatted = useMemo(() =>
    (data ?? []).map((d) => ({
      ...d,
      month: new Date(d.label + '-01')
        .toLocaleDateString('en-US', { month: 'short' }),
    }))
  , [data]);

  if (!formatted.length) return null;
  const maxHours = Math.max(...formatted.map((d) => d.hours), 1);

  return (
    <Card className="p-5">
      <CardHeader>
        <CardTitle>Monthly activity</CardTitle>
        <span className="text-xs font-mono text-[var(--color-muted)]">
          Last 12 months
        </span>
      </CardHeader>

      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={formatted}
          margin={{ top: 4, right: 0, left: -28, bottom: 0 }}
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={C.area} stopOpacity={0.12} />
              <stop offset="95%" stopColor={C.area} stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={C.grid} />
          <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false}
            tickFormatter={(v) => `${v}h`} />
          <Tooltip
            contentStyle={tooltipBase}
            formatter={(v, name) =>
              name === 'hours' ? [formatHours(v), 'Hours'] : [v, 'Games']
            }
            cursor={{ stroke: '#2a2a2a', strokeWidth: 1 }}
          />
          <Area
            type="monotone" dataKey="hours"
            stroke={C.area} strokeWidth={1.5}
            fill="url(#areaGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Bar chart below for game count */}
      <ResponsiveContainer width="100%" height={48}>
        <BarChart data={formatted} barSize={8}
          margin={{ top: 4, right: 0, left: -28, bottom: 0 }}
        >
          <XAxis dataKey="month" tick={false} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={tooltipBase}
            formatter={(v) => [v, 'Games added']}
            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
          />
          {formatted.map((entry, idx) => null)}
          <Bar dataKey="games" radius={[2, 2, 0, 0]}>
            {formatted.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.hours >= maxHours * 0.7 ? C.bar : C.barDim}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-4 mt-1">
        <LegendItem color={C.area}   label="Hours played" line />
        <LegendItem color={C.barDim} label="Games added"  />
      </div>
    </Card>
  );
};

// ── Genre horizontal bars ─────────────────────────────────────────────────
const GenreChart = ({ data }) => {
  if (!data?.length) return null;
  const max = data[0].hours;

  return (
    <Card className="p-5 h-full">
      <CardHeader>
        <CardTitle>Hours by genre</CardTitle>
      </CardHeader>

      <div className="flex flex-col gap-3.5">
        {data.slice(0, 7).map(({ genre, hours, count }, i) => {
          const pct = Math.round((hours / max) * 100);
          return (
            <div key={genre}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[var(--color-secondary)] truncate">
                  {genre}
                </span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-2xs font-mono text-[var(--color-muted)]">
                    {count} games
                  </span>
                  <span className="text-xs font-mono text-[var(--color-subtle)]">
                    {formatHours(hours)}
                  </span>
                </div>
              </div>
              <div className="h-0.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: i === 0 ? C.bar : `rgba(244,244,245,${0.6 - i * 0.07})` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ── Status breakdown ───────────────────────────────────────────────────────
const STATUS_META = {
  playing:   { color: '#f4f4f5', label: 'Playing'    },
  completed: { color: '#a1a1aa', label: 'Completed'  },
  backlog:   { color: '#3f3f3f', label: 'Backlog'    },
  dropped:   { color: '#2a2a2a', label: 'Dropped'    },
  wishlist:  { color: '#1f1f1f', label: 'Wishlist'   },
  replaying: { color: '#6b6b6b', label: 'Replaying'  },
};

const StatusBreakdown = ({ data, totals }) => {
  const total = data?.reduce((s, d) => s + d.count, 0) ?? 0;
  const rate  = totals?.completionRate ?? 0;
  const circumference = 2 * Math.PI * 32;

  if (!data?.length) return null;

  return (
    <Card className="p-5 h-full">
      <CardHeader>
        <CardTitle>Library breakdown</CardTitle>
      </CardHeader>

      <div className="flex items-center gap-6 mb-5">
        {/* Ring */}
        <div className="relative shrink-0">
          <svg width="80" height="80" className="-rotate-90">
            <circle cx="40" cy="40" r="32"
              fill="none" stroke="#1a1a1a" strokeWidth="4" />
            <motion.circle
              cx="40" cy="40" r="32"
              fill="none" stroke={C.bar} strokeWidth="4"
              strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${(rate / 100) * circumference} ${circumference}` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center
                          justify-center">
            <span className="text-base font-display font-bold
                             text-foreground leading-none">
              {rate}%
            </span>
            <span className="text-2xs font-mono text-[var(--color-muted)]
                             mt-0.5">
              done
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {totals?.completedGames ?? 0}
            <span className="text-[var(--color-subtle)]">
              /{totals?.totalGames ?? 0} games
            </span>
          </p>
          <p className="text-xs text-[var(--color-subtle)]">
            {formatHours(totals?.totalHours)} total
          </p>
        </div>
      </div>

      {/* Status list */}
      <div className="flex flex-col gap-2">
        {data.map(({ status, count, hours }) => {
          const meta = STATUS_META[status];
          const pct  = total ? Math.round((count / total) * 100) : 0;
          return (
            <div key={status} className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full shrink-0"
                   style={{ background: meta?.color ?? '#3f3f3f' }} />
              <span className="text-xs text-[var(--color-secondary)]
                               capitalize flex-1">
                {meta?.label ?? status}
              </span>
              <span className="text-xs font-mono text-[var(--color-subtle)]">
                {count}
              </span>
              <div className="w-12 h-0.5 bg-[var(--color-border)]
                              rounded-full overflow-hidden">
                <div className="h-full rounded-full"
                     style={{
                       width:      `${pct}%`,
                       background: meta?.color ?? '#3f3f3f',
                     }} />
              </div>
              {hours > 0 && (
                <span className="text-2xs font-mono text-[var(--color-muted)]
                                 w-10 text-right">
                  {formatHours(hours)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ── Shared legend item ─────────────────────────────────────────────────────
const LegendItem = ({ color, label, line = false }) => (
  <div className="flex items-center gap-1.5">
    {line
      ? <div className="w-4 h-px" style={{ background: color }} />
      : <div className="w-2 h-2 rounded-full" style={{ background: color }} />
    }
    <span className="text-xs font-mono text-[var(--color-subtle)]">{label}</span>
  </div>
);