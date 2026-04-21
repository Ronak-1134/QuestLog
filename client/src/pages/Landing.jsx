import { Link }          from 'react-router-dom';
import { motion }        from 'framer-motion';
import { ArrowRight, Clock, BarChart2, Gamepad2, Zap } from 'lucide-react';
import { Shell }         from '@/components/layout/Shell.jsx';
import { Container }     from '@/components/layout/Container.jsx';
import { useSEO } from '@/hooks/useSEO.js';
import { useReveal }     from '@/hooks/useReveal.js';
import { staggerContainer, staggerItem, slideUp } from '@/lib/motion.js';

const STATS = [
  { value: '2.4M',  label: 'Games tracked' },
  { value: '180K',  label: 'Hours logged'  },
  { value: '94K',   label: 'Players'        },
  { value: '99.9%', label: 'Uptime'         },
];

const FEATURES = [
  {
    icon: Clock,
    title: 'Accurate playtimes',
    body:  'Community-sourced data gives you real completion times — not publisher estimates.',
  },
  {
    icon: BarChart2,
    title: 'Visual insights',
    body:  'Beautiful charts that reveal your gaming habits at a glance.',
  },
  {
    icon: Gamepad2,
    title: 'Steam sync',
    body:  'Import your entire library in seconds. Backlog auto-populated.',
  },
  {
    icon: Zap,
    title: 'AI predictions',
    body:  'Smart playtime estimates for games without community data yet.',
  },
];

export default function Landing() {

  useSEO({
  title:       'Track Your Games. Know Your Time.',
  description: 'QuestLog gives you accurate game completion times from the community. Sync Steam, track your backlog, and finally know what to play next.',
});

  const statsRef   = useReveal();
  const featRef    = useReveal();

  return (
    <Shell>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[88dvh] flex items-center overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-40 pointer-events-none" />

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(244,244,245,0.03) 0%, transparent 70%)' }}
        />

        <Container className="relative z-10 py-24">
          <motion.div
            variants={staggerContainer(0.1, 0.1)}
            initial="initial"
            animate="animate"
            className="max-w-3xl"
          >
            {/* Eyebrow */}
            <motion.div variants={staggerItem} className="mb-6">
              <span className="tag">Open beta — free forever</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={staggerItem}
              className="mb-6 text-foreground"
            >
              Know exactly how long{' '}
              <span className="text-[var(--color-subtle)]">
                your next game takes.
              </span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={staggerItem}
              className="text-[var(--color-secondary)] text-lg mb-10 max-w-xl"
            >
              Track your backlog, discover completion times, sync Steam —
              all inside a dashboard that gets out of your way.
            </motion.p>

            {/* CTA */}
            <motion.div variants={staggerItem} className="flex items-center gap-4 flex-wrap">
              <Link to="/auth/register" className="btn btn-primary btn-lg gap-2">
                Start tracking
                <ArrowRight size={16} />
              </Link>
              <Link to="/auth/login" className="btn btn-ghost btn-lg">
                Sign in
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section className="border-y border-[var(--color-border)]">
        <Container>
          <motion.div
            ref={statsRef}
            variants={staggerContainer(0.08)}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0
                       divide-[var(--color-border)]"
          >
            {STATS.map(({ value, label }) => (
              <motion.div key={label} variants={staggerItem}
                className="px-8 py-10 text-center"
              >
                <p className="stat-value mb-1">{value}</p>
                <p className="stat-label">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <Container>
          <motion.div
            ref={featRef}
            variants={staggerContainer(0.08)}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={staggerItem} className="mb-14">
              <h6 className="text-[var(--color-subtle)] mb-3">Features</h6>
              <h2 className="text-foreground max-w-lg">
                Everything you need. Nothing you don't.
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px
                            bg-[var(--color-border)]">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <motion.div key={title} variants={staggerItem}
                  className="bg-background p-8 flex flex-col gap-4
                             hover:bg-[var(--color-surface)] transition-colors duration-200"
                >
                  <div className="w-9 h-9 rounded border border-[var(--color-border-2)]
                                  flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-[var(--color-secondary)]" />
                  </div>
                  <div>
                    <h5 className="text-foreground mb-1.5">{title}</h5>
                    <p className="text-[var(--color-subtle)] text-sm leading-relaxed">{body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section className="border-t border-[var(--color-border)] py-24">
        <Container>
          <motion.div
            {...slideUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-start md:items-center
                       justify-between gap-8"
          >
            <div>
              <h2 className="text-foreground mb-2">Ready to clear your backlog?</h2>
              <p className="text-[var(--color-subtle)]">
                Join 94,000 players who actually finish their games.
              </p>
            </div>
            <Link to="/auth/register"
              className="btn btn-primary btn-lg gap-2 shrink-0"
            >
              Get started free
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </Container>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--color-border)] py-8">
        <Container>
          <div className="flex flex-col sm:flex-row items-center
                          justify-between gap-4">
            <span className="font-display font-bold text-[var(--color-subtle)]
                             text-sm tracking-tight">
              QuestLog
            </span>
            <p className="text-[var(--color-muted)] text-xs font-mono">
              © {new Date().getFullYear()} QuestLog. Built with obsession.
            </p>
          </div>
        </Container>
      </footer>
    </Shell>
  );
}