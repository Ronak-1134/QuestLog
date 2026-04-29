import { useParams }   from 'react-router-dom';
import { useQuery }    from '@tanstack/react-query';
import { motion }      from 'framer-motion';
import { Shell }       from '@/components/layout/Shell.jsx';
import { Container }   from '@/components/layout/Container.jsx';
import { GameHero }    from '@/components/game/GameHero.jsx';
import { CompletionTimeTracker } from '@/components/game/CompletionTimeTracker.jsx';
import { PlaytimeSubmitForm }    from '@/components/game/PlaytimeSubmitForm.jsx';
import { MissionTracker }        from '@/components/game/MissionTracker.jsx';
import { SimilarGames }          from '@/components/game/SimilarGames.jsx';
import { GameStatusControl }     from '@/components/game/GameStatusControl.jsx';
import { Loader }      from '@/components/ui/Loader.jsx';
import { useAuthStore } from '@/store/auth.store.js';
import { slideUp }     from '@/lib/motion.js';
import api             from '@/lib/axios.js';

export default function Game() {
  const { slug }               = useParams();
  const { user, firebaseUser } = useAuthStore();
  const userId = user?._id ?? firebaseUser?.uid;

  const { data: game, isLoading, isError } = useQuery({
    queryKey: ['game', slug],
    queryFn:  async () => {
      const { data } = await api.get(`/games/slug/${slug}`);
      return data.data;
    },
    staleTime: 1000 * 60 * 60,
  });

  const { data: stats } = useQuery({
    queryKey: ['gameStats', game?.igdbId],
    queryFn:  async () => {
      const { data } = await api.get(`/games/${game.igdbId}/stats`);
      return data.data;
    },
    enabled:   Boolean(game?.igdbId),
    staleTime: 1000 * 60 * 10,
  });

  // User's library entry for this game
  const { data: userLibEntry } = useQuery({
    queryKey: ['userGame', userId, game?.igdbId],
    queryFn:  async () => {
      const { data } = await api.get(
        `/users/${userId}/library?limit=100`
      );
      return (data.data ?? []).find((g) => g.igdbId === game.igdbId) ?? null;
    },
    enabled: Boolean(userId && game?.igdbId),
  });

  if (isLoading) return <Shell><Loader fullscreen /></Shell>;
  if (isError || !game) return (
    <Shell>
      <Container className="py-24 text-center">
        <p className="text-[var(--color-subtle)]">Game not found.</p>
      </Container>
    </Shell>
  );

  return (
    <Shell>
      {/* Hero */}
      <GameHero game={game} />

      <Container size="lg" className="py-10">

        {/* Add to library — top */}
        <div className="flex items-center gap-4 mb-8">
          <GameStatusControl game={game} />
          {userLibEntry?.playtimeHours > 0 && (
            <p className="text-sm text-[var(--color-subtle)] font-mono">
              {userLibEntry.playtimeHours}h played
            </p>
          )}
        </div>

        <motion.div {...slideUp}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left column ─────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-10">

            {/* Completion times with progress */}
            <CompletionTimeTracker
              stats={stats}
              userProgress={userLibEntry}
            />

            {/* Submit your time */}
            <PlaytimeSubmitForm game={game} />

            {/* Mission tracker */}
            <MissionTracker game={game} />

          </div>

          {/* ── Right sidebar ────────────────────────────────── */}
          <aside className="flex flex-col gap-4">

            {/* Game details */}
            <div className="card p-5">
              <h6 className="text-[var(--color-subtle)] mb-4">Details</h6>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Developer', value: game.developers?.join(', ')          },
                  { label: 'Genres',    value: game.genres?.join(', ')              },
                  { label: 'Platforms', value: game.platforms?.slice(0,3).join(', ') },
                  { label: 'Released',  value: game.releaseYear                     },
                  { label: 'Modes',     value: game.gameModes?.join(', ')           },
                ].filter((s) => s.value).map(({ label, value }) => (
                  <div key={label}>
                    <p className="stat-label">{label}</p>
                    <p className="text-sm text-[var(--color-secondary)] mt-0.5">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            {game.summary && (
              <div className="card p-5">
                <h6 className="text-[var(--color-subtle)] mb-3">About</h6>
                <p className="text-sm text-[var(--color-subtle)] leading-relaxed">
                  {game.summary}
                </p>
              </div>
            )}

            {game.igdbUrl && (
              <a href={game.igdbUrl} target="_blank" rel="noopener noreferrer"
                 className="btn btn-ghost btn-sm w-full">
                View on IGDB ↗
              </a>
            )}
          </aside>
        </motion.div>

        {/* Similar games */}
        <SimilarGames igdbId={game.igdbId} />
      </Container>
    </Shell>
  );
}