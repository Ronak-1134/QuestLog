import { Link }             from 'react-router-dom';
import { motion }           from 'framer-motion';
import { Clock, ChevronRight, Gamepad2, Plus } from 'lucide-react';
import { useLibrary, useUpdateGame } from '@/hooks/useLibrary.js';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card.jsx';
import { Badge }            from '@/components/ui/Badge.jsx';
import { Loader }           from '@/components/ui/Loader.jsx';
import { ProgressInput }    from '@/components/ui/ProgressInput.jsx';
import { formatHours }      from '@/lib/utils.js';
import { staggerContainer, staggerItem } from '@/lib/motion.js';

export const NowPlayingCard = () => {
  const { data, isLoading } = useLibrary({ status: 'playing', limit: 3 });
  const games = data?.data ?? [];

  return (
    <Card className="h-full min-h-[200px]">
      <CardHeader>
        <CardTitle>Now playing</CardTitle>
        <Badge variant="playing">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </Badge>
      </CardHeader>

      {isLoading ? <Loader /> : games.length === 0 ? (
        <EmptyPlaying />
      ) : (
        <motion.div
          variants={staggerContainer(0.06)}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-1"
        >
          {games.map((ug) => (
            <motion.div key={ug._id} variants={staggerItem}>
              <GameRow userGame={ug} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </Card>
  );
};

const GameRow = ({ userGame }) => {
  const { mutate } = useUpdateGame();
  const game = userGame.gameId;

  const setProgress = (val) => {
    mutate({
      userGameId: userGame._id,
      updates: {
        progressPercent: val,
        ...(val === 100 ? { status: 'completed', completedAt: new Date() } : {}),
      },
    });
  };

  return (
    <div className="flex items-center gap-3 py-2.5
                    border-b border-[var(--color-border)] last:border-0">
      {/* Cover */}
      <Link to={`/games/${game?.slug}`}>
        <div className="w-10 h-14 rounded shrink-0 overflow-hidden
                        border border-[var(--color-border)]
                        bg-[var(--color-surface-2)]
                        hover:border-[var(--color-border-2)]
                        transition-colors">
          {game?.cover
            ? <img src={game.cover} alt={game.name}
                   className="w-full h-full object-cover" />
            : <Gamepad2 size={12} className="m-auto mt-4 text-[var(--color-muted)]" />
          }
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link to={`/games/${game?.slug}`}>
          <p className="text-sm font-medium text-[var(--color-secondary)]
                        hover:text-foreground transition-colors truncate">
            {game?.name}
          </p>
        </Link>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Clock size={10} className="text-[var(--color-muted)]" />
          <span className="text-2xs font-mono text-[var(--color-muted)]">
            {formatHours(userGame.playtimeHours)} played
          </span>
          {game?.playtimeStats?.mainStory?.median && (
            <span className="text-2xs font-mono text-[var(--color-muted)]">
              · ~{formatHours(game.playtimeStats.mainStory.median)} to finish
            </span>
          )}
        </div>

        {/* Inline progress scrubber */}
        <ProgressInput
          value={userGame.progressPercent}
          onChange={setProgress}
          className="mt-2"
        />
      </div>

      <span className="text-xs font-mono text-[var(--color-subtle)] shrink-0">
        {userGame.progressPercent}%
      </span>
    </div>
  );
};

const EmptyPlaying = () => (
  <div className="flex flex-col items-center justify-center py-8 gap-3">
    <div className="w-10 h-10 rounded border border-[var(--color-border)]
                    flex items-center justify-center">
      <Gamepad2 size={16} className="text-[var(--color-muted)]" />
    </div>
    <p className="text-xs text-[var(--color-subtle)] text-center">
      No active games.{' '}
      <Link to="/search"
        className="text-[var(--color-secondary)] hover:text-foreground
                   transition-colors inline-flex items-center gap-0.5">
        Search <Plus size={10} />
      </Link>
    </p>
  </div>
);