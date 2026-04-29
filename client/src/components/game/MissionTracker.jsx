import { useState, useMemo }   from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronDown,
         Trophy, Sword, Map, Lock }  from 'lucide-react';
import { useAuthStore }    from '@/store/auth.store.js';
import { Loader }          from '@/components/ui/Loader.jsx';
import { cn }              from '@/lib/utils.js';
import { staggerContainer, staggerItem } from '@/lib/motion.js';
import api                 from '@/lib/axios.js';

export const MissionTracker = ({ game }) => {
  const { firebaseUser, user } = useAuthStore();
  const qc                     = useQueryClient();
  const userId = user?._id ?? firebaseUser?.uid;
  const [openChapters, setOpenChapters] = useState(new Set([0]));
  const [filter, setFilter]             = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['missions', game.slug, userId],
    queryFn:  async () => {
      const { data } = await api.get(
        `/missions/${game.slug}${userId ? `?userId=${userId}` : ''}`
      );
      return data.data;
    },
    enabled:   Boolean(game.slug),
    staleTime: 1000 * 30,
  });

  const { mutate: toggleMission } = useMutation({
    mutationFn: async ({ missionId, completed }) => {
      await api.post(`/missions/${game.slug}/toggle`, {
        userId, missionId, completed,
      });
    },
    onMutate: async ({ missionId, completed }) => {
      // Optimistic update
      await qc.cancelQueries(['missions', game.slug, userId]);
      const prev = qc.getQueryData(['missions', game.slug, userId]);
      qc.setQueryData(['missions', game.slug, userId], (old) => {
        if (!old) return old;
        return {
          ...old,
          chapters: old.chapters.map((ch) => ({
            ...ch,
            missions: ch.missions.map((m) =>
              m.id === missionId ? { ...m, completed } : m
            ),
            completedCount: ch.missions.filter((m) =>
              m.id === missionId
                ? completed
                : m.completed
            ).length,
          })),
          completedMissions: completed
            ? old.completedMissions + 1
            : old.completedMissions - 1,
          completionPercent: old.totalMissions
            ? Math.round(
                ((completed
                  ? old.completedMissions + 1
                  : old.completedMissions - 1
                ) / old.totalMissions) * 100
              )
            : 0,
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(['missions', game.slug, userId], ctx.prev);
    },
  });

  const { mutate: markChapter } = useMutation({
    mutationFn: async ({ missionIds, completed }) => {
      await api.post(`/missions/${game.slug}/bulk`, {
        userId, missionIds, completed,
      });
    },
    onSuccess: () => qc.invalidateQueries(['missions', game.slug, userId]),
  });

  const toggleChapter = (idx) => {
    setOpenChapters((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  if (!data?.hasData) return null;
  if (isLoading) return <Loader />;

  const { chapters, totalMissions, completedMissions,
          completionPercent } = data;

  const filteredChapters = chapters.map((ch) => ({
    ...ch,
    missions: ch.missions.filter((m) =>
      filter === 'all'        ? true
      : filter === 'main'     ? m.type === 'main'
      : filter === 'side'     ? m.type === 'side'
      : filter === 'remaining'? !m.completed
      : m.completed
    ),
  })).filter((ch) => ch.missions.length > 0);

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded border border-[var(--color-border)]
                        flex items-center justify-center">
          <Map size={14} className="text-[var(--color-muted)]" />
        </div>
        <div>
          <h5 className="text-foreground">Mission Tracker</h5>
          <p className="text-xs text-[var(--color-subtle)] mt-0.5">
            {completedMissions} / {totalMissions} missions completed
          </p>
        </div>
        <div className="ml-auto">
          <span className="stat-value text-2xl">{completionPercent}%</span>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="h-1.5 bg-[var(--color-border)] rounded-full
                      overflow-hidden mb-6">
        <motion.div
          className="h-full bg-foreground rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${completionPercent}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Filter tabs */}
      {firebaseUser && (
        <div className="flex items-center gap-1 mb-6 flex-wrap">
          {[
            { v: 'all',       l: 'All' },
            { v: 'main',      l: 'Main Story' },
            { v: 'side',      l: 'Side' },
            { v: 'remaining', l: 'Remaining' },
            { v: 'completed', l: 'Completed' },
          ].map(({ v, l }) => (
            <button key={v} onClick={() => setFilter(v)}
              className={cn(
                'px-3 py-1.5 rounded text-xs font-mono transition-colors',
                filter === v
                  ? 'bg-[var(--color-surface-2)] text-foreground border border-[var(--color-border-2)]'
                  : 'text-[var(--color-subtle)] hover:text-foreground'
              )}>
              {l}
            </button>
          ))}
        </div>
      )}

      {/* Not logged in warning */}
      {!firebaseUser && (
        <div className="card p-4 mb-6 flex items-center gap-3">
          <Lock size={14} className="text-[var(--color-muted)] shrink-0" />
          <p className="text-sm text-[var(--color-subtle)]">
            <a href="/auth/login"
               className="text-foreground hover:underline underline-offset-4">
              Sign in
            </a>{' '}to track your mission progress.
          </p>
        </div>
      )}

      {/* Chapters */}
      <motion.div
        variants={staggerContainer(0.04)}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-3"
      >
        {filteredChapters.map((chapter, idx) => {
          const isOpen  = openChapters.has(idx);
          const allDone = chapter.completedCount === chapter.totalCount
                          && chapter.totalCount > 0;

          return (
            <motion.div key={chapter.title} variants={staggerItem}
              className="card overflow-hidden">

              {/* Chapter header */}
              <button
                onClick={() => toggleChapter(idx)}
                className="w-full flex items-center gap-3 p-4
                           hover:bg-[var(--color-surface-2)]
                           transition-colors duration-150"
              >
                {/* Chapter complete indicator */}
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center shrink-0',
                  allDone
                    ? 'bg-emerald-400/20 border border-emerald-400/40'
                    : 'bg-[var(--color-surface-2)] border border-[var(--color-border)]'
                )}>
                  {allDone
                    ? <CheckCircle2 size={11} className="text-emerald-400" />
                    : <span className="text-2xs font-mono text-[var(--color-muted)]">
                        {idx + 1}
                      </span>
                  }
                </div>

                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {chapter.title}
                  </p>
                  <p className="text-xs text-[var(--color-subtle)] font-mono">
                    {chapter.completedCount}/{chapter.totalCount}
                  </p>
                </div>

                {/* Chapter mini progress */}
                <div className="w-16 h-0.5 bg-[var(--color-border)]
                                rounded-full overflow-hidden mr-2">
                  <div
                    className="h-full bg-foreground rounded-full transition-all"
                    style={{
                      width: `${chapter.totalCount
                        ? (chapter.completedCount / chapter.totalCount) * 100
                        : 0}%`
                    }}
                  />
                </div>

                {/* Mark all (div to avoid nested button) */}
                {firebaseUser && (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      const ids = chapter.missions.map((m) => m.id);
                      markChapter({ missionIds: ids, completed: !allDone });
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}
                    className="text-2xs font-mono text-[var(--color-muted)]
                               hover:text-foreground transition-colors
                               px-2 py-0.5 rounded border
                               border-[var(--color-border)]
                               hover:border-[var(--color-border-2)]
                               mr-1 shrink-0 cursor-pointer"
                  >
                    {allDone ? 'Unmark' : 'Mark all'}
                  </div>
                )}

                <ChevronDown size={14}
                  className={cn(
                    'text-[var(--color-muted)] transition-transform shrink-0',
                    isOpen && 'rotate-180'
                  )}
                />
              </button>

              {/* Missions list */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{   height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-[var(--color-border)]">
                      {chapter.missions.map((mission, mIdx) => (
                        <MissionRow
                          key={mission.id}
                          mission={mission}
                          isLast={mIdx === chapter.missions.length - 1}
                          onToggle={firebaseUser
                            ? () => toggleMission({
                                missionId: mission.id,
                                completed: !mission.completed,
                              })
                            : null
                          }
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

// ── Single mission row ─────────────────────────────────────────────
const MissionRow = ({ mission, isLast, onToggle }) => (
  <div
    className={cn(
      'flex items-center gap-3 px-4 py-3 group',
      'hover:bg-[var(--color-surface-2)] transition-colors duration-100',
      !isLast && 'border-b border-[var(--color-border)]',
      mission.completed && 'opacity-60'
    )}
  >
    {/* Checkbox */}
    <button
      onClick={onToggle}
      disabled={!onToggle}
      className={cn(
        'shrink-0 transition-all duration-200',
        !onToggle && 'cursor-default opacity-40'
      )}
    >
      {mission.completed
        ? <CheckCircle2 size={16} className="text-emerald-400" />
        : <Circle       size={16} className="text-[var(--color-muted)]
                                            group-hover:text-[var(--color-subtle)]
                                            transition-colors" />
      }
    </button>

    {/* Title */}
    <p className={cn(
      'flex-1 text-sm transition-all duration-200',
      mission.completed
        ? 'line-through text-[var(--color-muted)]'
        : 'text-[var(--color-secondary)] group-hover:text-foreground'
    )}>
      {mission.title}
    </p>

    {/* Type badge */}
    <span className={cn(
      'text-2xs font-mono uppercase tracking-widest shrink-0',
      mission.type === 'main'
        ? 'text-foreground/40'
        : 'text-[var(--color-muted)]'
    )}>
      {mission.type === 'main' ? '●' : '○'}
    </span>
  </div>
);
