import { useParams }    from 'react-router-dom';
import { useQuery }     from '@tanstack/react-query';
import { motion }       from 'framer-motion';
import { User, Clock, Gamepad2, CheckCircle2,
         Trophy, BarChart2 }                from 'lucide-react';
import { Shell }        from '@/components/layout/Shell.jsx';
import { Container }    from '@/components/layout/Container.jsx';
import { Loader }       from '@/components/ui/Loader.jsx';
import { useAuthStore } from '@/store/auth.store.js';
import { staggerContainer, staggerItem, slideUp } from '@/lib/motion.js';
import { formatHours }  from '@/lib/utils.js';
import api              from '@/lib/axios.js';

export default function Profile() {
  const { username: rawUsername } = useParams();
  const username = decodeURIComponent(rawUsername ?? '');
  const { user, firebaseUser } = useAuthStore();

  const name   = user?.username ?? firebaseUser?.displayName ?? username ?? 'Player';
  const email  = user?.email    ?? firebaseUser?.email ?? '';
  const avatar = user?.avatar   ?? firebaseUser?.photoURL ?? null;
  const userId = user?._id      ?? firebaseUser?.uid;

  const { data: libData, isLoading } = useQuery({
    queryKey: ['library', userId],
    queryFn:  async () => {
      const { data } = await api.get(`/users/${userId}/library?limit=100`);
      return data.data ?? [];
    },
    enabled:   Boolean(userId),
    staleTime: 30_000,
  });

  const games     = libData ?? [];
  const playing   = games.filter(g => g.status === 'playing');
  const completed = games.filter(g => g.status === 'completed');
  const backlog   = games.filter(g => g.status === 'backlog');
  const dropped   = games.filter(g => g.status === 'dropped');

  const totalHours = games.reduce((s, g) => s + (g.playtimeHours ?? 0), 0);

  const stats = [
    { icon: Gamepad2,     label: 'Total games',   value: games.length },
    { icon: CheckCircle2, label: 'Completed',      value: completed.length },
    { icon: Clock,        label: 'Hours logged',   value: formatHours(totalHours) },
    { icon: Trophy,       label: 'Completion',
      value: games.length ? `${Math.round((completed.length / games.length) * 100)}%` : '0%' },
  ];

  return (
    <Shell>
      <Container size="lg" className="py-10 md:py-14">

        {/* Header */}
        <motion.div
          variants={staggerContainer(0.07)} initial="initial" animate="animate"
          className="mb-12"
        >
          <motion.div variants={staggerItem}
            className="flex items-center gap-5 mb-8">
            {avatar
              ? <img src={avatar} alt=""
                     className="w-20 h-20 rounded-full object-cover
                                border-2 border-[var(--color-border-2)]" />
              : <div className="w-20 h-20 rounded-full bg-[var(--color-surface-2)]
                                border-2 border-[var(--color-border-2)]
                                flex items-center justify-center">
                  <span className="text-3xl font-display font-bold text-[var(--color-subtle)]">
                    {name[0]?.toUpperCase()}
                  </span>
                </div>
            }
            <div>
              <h2 className="text-foreground mb-1">{name}</h2>
              <p className="text-sm text-[var(--color-subtle)]">{email}</p>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={staggerItem}
            className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="card p-5">
                <div className="w-8 h-8 rounded border border-[var(--color-border)]
                                flex items-center justify-center mb-3">
                  <Icon size={14} className="text-[var(--color-muted)]" />
                </div>
                <p className="stat-value text-2xl">{value}</p>
                <p className="stat-label mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Games */}
        {isLoading ? <Loader /> : games.length === 0 ? (
          <motion.div {...slideUp} className="card p-12 text-center">
            <Gamepad2 size={32} className="text-[var(--color-muted)] mx-auto mb-4" />
            <h5 className="text-foreground mb-2">No games yet</h5>
            <p className="text-sm text-[var(--color-subtle)] mb-6">
              Search for a game and click "Add to library"
            </p>
            <a href="/search" className="btn btn-primary btn-sm">Find games →</a>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-12">
            {playing.length   > 0 && <Section title="Now Playing" badge={playing.length}
              icon={<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
              games={playing} />}
            {completed.length > 0 && <Section title="Completed" badge={completed.length}
              icon={<CheckCircle2 size={13} className="text-[var(--color-muted)]" />}
              games={completed} />}
            {backlog.length   > 0 && <Section title="Backlog" badge={backlog.length}
              icon={<BarChart2 size={13} className="text-[var(--color-muted)]" />}
              games={backlog} />}
            {dropped.length   > 0 && <Section title="Dropped" badge={dropped.length}
              icon={<span className="w-2 h-2 rounded-full bg-red-400/60" />}
              games={dropped} />}
          </div>
        )}
      </Container>
    </Shell>
  );
}

const Section = ({ title, badge, icon, games }) => (
  <div>
    <div className="flex items-center gap-2 mb-5">
      {icon}
      <h6 className="text-[var(--color-subtle)]">{title}</h6>
      <span className="tag">{badge}</span>
    </div>
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
      {games.map((ug) => {
        const g = ug.gameId ?? ug;
        if (!g?.slug && !g?.name) return null;
        return (
          <a key={ug._id ?? ug.igdbId} href={`/games/${g.slug}`}
            className="group block">
            <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
              <div className="aspect-[3/4] rounded overflow-hidden
                              border border-[var(--color-border)]
                              bg-[var(--color-surface-2)]
                              group-hover:border-[var(--color-border-2)]
                              transition-colors mb-1.5 relative">
                {g.cover
                  ? <img src={g.coverThumb ?? g.cover} alt={g.name}
                         className="w-full h-full object-cover
                                    group-hover:scale-105 transition-transform duration-500" />
                  : <div className="w-full h-full flex items-center
                                    justify-center p-2">
                      <span className="text-2xs text-[var(--color-muted)] text-center">
                        {g.name}
                      </span>
                    </div>
                }
                {ug.status === 'completed' && (
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full
                                  bg-background/80 flex items-center justify-center">
                    <CheckCircle2 size={11} className="text-emerald-400" />
                  </div>
                )}
              </div>
              <p className="text-2xs text-[var(--color-secondary)]
                             group-hover:text-foreground transition-colors
                             line-clamp-2 leading-snug">
                {g.name}
              </p>
            </motion.div>
          </a>
        );
      })}
    </div>
  </div>
);