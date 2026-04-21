import { useMemo }  from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { formatHours } from '@/lib/utils.js';

const C = {
  bar:     '#f4f4f5',
  barDim:  '#2a2a2a',
  ref:     '#6b6b6b',
  axis:    '#6b6b6b',
  tooltip: { bg: '#0f0f0f', border: '#2a2a2a' },
};

const axisStyle = {
  fontSize:   10,
  fontFamily: 'DM Mono, monospace',
  fill:       C.axis,
};

// Bucket raw submission values into a histogram
const buildHistogram = (values, buckets = 12) => {
  if (!values?.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const size  = range / buckets;

  const bins = Array.from({ length: buckets }, (_, i) => ({
    label: formatHours(min + i * size),
    min:   min + i * size,
    max:   min + (i + 1) * size,
    count: 0,
  }));

  for (const v of values) {
    const idx = Math.min(Math.floor((v - min) / size), buckets - 1);
    bins[idx].count++;
  }

  return bins;
};

export const GamePlaytimeDistribution = ({ stats, category = 'mainStory' }) => {
  const data = stats?.[category];
  if (!data?.count || data.count < 3) return null;

  // Reconstruct approximate distribution from stats
  const synthetic = useMemo(() => {
    if (!data) return [];
    // Approximate bell around median with known min/max/p25/p75
    const points = [];
    const p25 = data.p25 ?? data.min + (data.median - data.min) * 0.5;
    const p75 = data.p75 ?? data.median + (data.max - data.median) * 0.5;

    for (let i = 0; i < data.count; i++) {
      const t = i / (data.count - 1);
      if (t < 0.25)      points.push(data.min   + (p25 - data.min) * (t / 0.25));
      else if (t < 0.5)  points.push(p25        + (data.median - p25) * ((t - 0.25) / 0.25));
      else if (t < 0.75) points.push(data.median + (p75 - data.median) * ((t - 0.5) / 0.25));
      else               points.push(p75        + (data.max - p75) * ((t - 0.75) / 0.25));
    }
    return points;
  }, [data]);

  const histogram = buildHistogram(synthetic, Math.min(12, Math.ceil(data.count / 3)));
  const peak      = Math.max(...histogram.map((b) => b.count));

  return (
    <div>
      <p className="stat-label mb-3">Distribution ({data.count} submissions)</p>

      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={histogram} barSize={14}
          margin={{ top: 0, right: 0, left: -30, bottom: 0 }}
        >
          <XAxis dataKey="label" tick={axisStyle}
            axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={false} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: C.tooltip.bg,
              border:          `1px solid ${C.tooltip.border}`,
              borderRadius:    '4px',
              fontSize:        '11px',
              fontFamily:      'DM Mono, monospace',
              color:           '#a1a1aa',
            }}
            formatter={(v) => [v, 'submissions']}
            labelFormatter={(l) => `~${l}`}
            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
          />
          <ReferenceLine
            x={formatHours(data.median)}
            stroke={C.ref}
            strokeDasharray="3 3"
            strokeWidth={1}
          />
          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
            {histogram.map((entry, idx) => (
              <cell
                key={idx}
                fill={entry.count >= peak * 0.8 ? C.bar : C.barDim}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-1.5 mt-1">
        <div className="w-3 h-px border-dashed border-t border-[var(--color-subtle)]" />
        <span className="text-2xs font-mono text-[var(--color-muted)]">
          median {formatHours(data.median)}
        </span>
      </div>
    </div>
  );
};