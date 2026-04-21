import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

// UI & Layout Components
import { Shell } from '@/components/layout/Shell.jsx';
import { Container } from '@/components/layout/Container.jsx';
import { GameHero } from '@/components/game/GameHero.jsx';
import { PlaytimePanel } from '@/components/game/PlaytimePanel.jsx';
import { PlaytimeSubmitForm } from '@/components/game/PlaytimeSubmitForm.jsx';
import { SimilarGames } from '@/components/game/SimilarGames.jsx';
import { Loader } from '@/components/ui/Loader.jsx';

// Utilities & Logic
import { slideUp } from '@/lib/motion.js';
import api from '@/lib/axios.js';
import { setGameSEO, resetSEO } from '@/lib/seo.js';

export default function Game() {
  const { slug } = useParams();

  // 1. Fetch Core Game Data
  const { data: game, isLoading, isError } = useQuery({
    queryKey: ['game', slug],
    queryFn: async () => {
      const { data } = await api.get(`/games/slug/${slug}`);
      return data.data;
    },
    staleTime: 1000 * 60 * 60,
  });

  // 2. Fetch Community Stats (depends on game data)
  const { data: stats } = useQuery({
    queryKey: ['gameStats', game?.igdbId],
    queryFn: async () => {
      const { data } = await api.get(`/games/${game.igdbId}/stats`);
      return data.data;
    },
    enabled: Boolean(game?.igdbId),
    staleTime: 1000 * 60 * 10,
  });

  // 3. Handle SEO side-effects
  useEffect(() => {
    if (game) {
      setGameSEO(game);
    }
    // Cleanup: Resets title/meta when navigating away
    return () => resetSEO(); 
  }, [game?.igdbId]);

  // 4. Conditional Rendering (must come AFTER hooks)
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
      <GameHero game={game} />

      <Container size="lg" className="py-12">
        <motion.div
          {...slideUp}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left — playtime data + submit */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <PlaytimePanel stats={stats} />
            <PlaytimeSubmitForm game={game} />
          </div>

          {/* Right — meta sidebar */}
          <GameSidebar game={game} />
        </motion.div>

        <SimilarGames igdbId={game.igdbId} />
      </Container>
    </Shell>
  );
}

/**
 * Helper component for the game metadata sidebar
 */
const GameSidebar = ({ game }) => {
  const sections = [
    { label: 'Developer',   value: game.developers?.join(', ') },
    { label: 'Genres',      value: game.genres?.join(', ') },
    { label: 'Platforms',   value: game.platforms?.slice(0, 4).join(', ') },
    { label: 'Game modes',  value: game.gameModes?.join(', ') },
    { label: 'Released',    value: game.releaseYear },
  ].filter((s) => s.value);

  return (
    <aside className="flex flex-col gap-4">
      <div className="card p-5">
        <h6 className="text-[var(--color-subtle)] mb-4">Details</h6>
        <div className="flex flex-col gap-3">
          {sections.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="stat-label">{label}</span>
              <span className="text-sm text-[var(--color-secondary)]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {game.igdbUrl && (
        <a 
          href={game.igdbUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm w-full"
        >
          View on IGDB ↗
        </a>
      )}
    </aside>
  );
};