import { Link }        from 'react-router-dom';
import { motion }      from 'framer-motion';
import { Inbox }       from 'lucide-react';
import { useBacklog }  from '@/hooks/useBacklog.js';
import { useUpdateGame } from '@/hooks/useLibrary.js';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card.jsx';
import { Badge }       from '@/components/ui/Badge.jsx';
import { Loader }      from '@/components/ui/Loader.jsx';
import { formatHours } from '@/lib/utils.js';
import { staggerContainer, staggerItem, hoverScale } from '@/lib/motion.js';

export const BacklogCard = () => {
  const { data: games, isLoading } = useBacklog();
  const { mutate } = useUpdateGame();

  const setStatus = (ug, status) =>
    mutate({ userGameId: ug._id, updates: { status } });

  return (
    <Card className="h-full min-h-[180px]">
      <CardHeader>
        <CardTitle>Backlog</CardTitle>
        <Badge>{(games ?? []).length} games</Badge>
      </CardHeader>

      {isLoading ? <Loader /> : !games?.length ? (
        <div className="flex items-center gap-3 py-6">
          <Inbox size={16} className="text-[var(--color-muted)]" />
          <p className="text-xs text-[var(--color-subtle)]">Backlog is empty.</p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer(0.03)}
          initial="initial"
          animate="animate"
          className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1"
        >
          {games.slice(0, 8).map((ug) => {
            const game = ug.gameId;
            return (
              <motion.div
                key={ug._id}
                variants={staggerItem}
                {...hoverScale}
                className="shrink-0 group"
              >
                <div className="relative">
                  <Link to={`/games/${game?.slug}`}>
                    <div className="w-14 h-20 rounded overflow-hidden
                                    border border-[var(--color-border)]
                                    bg-[var(--color-surface-2)]
                                    group-hover:border-[var(--color-border-2)]
                                    transition-colors duration-150">
                      {game?.cover
                        ? <img src={game.coverThumb ?? game.cover} alt={game.name}
                               className="w-full h-full object-cover" />
                        : <div className="w-full h-full" />
                      }
                    </div>
                  </Link>

                  {/* Quick-action: mark as playing */}
                  <button
                    onClick={() => setStatus(ug, 'playing')}
                    title="Mark as playing"
                    className="absolute -top-1.5 -right-1.5
                               w-5 h-5 rounded-full
                               bg-[var(--color-surface-2)]
                               border border-[var(--color-border-2)]
                               text-[var(--color-subtle)]
                               hover:text-foreground
                               hover:border-foreground
                               transition-colors
                               opacity-0 group-hover:opacity-100
                               flex items-center justify-center
                               text-[10px] font-mono"
                  >
                    ▶
                  </button>
                </div>

                {game?.playtimeStats?.mainStory?.median && (
                  <p className="text-2xs text-[var(--color-muted)] font-mono
                                text-center mt-1">
                    {formatHours(game.playtimeStats.mainStory.median)}
                  </p>
                )}
              </motion.div>
            );
          })}

          {games.length > 8 && (
            <Link to="/backlog"
              className="shrink-0 w-14 h-20 rounded border border-dashed
                         border-[var(--color-border)] flex items-center
                         justify-center text-[var(--color-muted)] text-xs
                         font-mono hover:border-[var(--color-border-2)]
                         hover:text-[var(--color-subtle)]
                         transition-colors self-start"
            >
              +{games.length - 8}
            </Link>
          )}
        </motion.div>
      )}
    </Card>
  );
};