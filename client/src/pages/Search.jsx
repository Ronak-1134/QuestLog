import { useRef, useEffect }   from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X, TrendingUp, Loader2 } from 'lucide-react';
import { Shell }               from '@/components/layout/Shell.jsx';
import { Container }           from '@/components/layout/Container.jsx';
import { GameCard }            from '@/components/game/GameCard.jsx';
import { GameCardSkeleton }    from '@/components/game/GameCardSkeleton.jsx';
import { useGameSearch }       from '@/hooks/useGameSearch.js';
import { useTrending }         from '@/hooks/useTrending.js';
import { staggerContainer, staggerItem, fadeIn, slideUp } from '@/lib/motion.js';

export default function Search() {

  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';

  const inputRef = useRef(null);
  const { query, setQuery, clear, results, isLoading, isFetching, hasQuery } =
    useGameSearch(12, initialQ);
  const { data: trending, isLoading: trendLoading } = useTrending(20);

  // Auto-focus on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <Shell>
      <Container size="lg" className="py-10 md:py-14">

        {/* ── Search bar ───────────────────────────────────────────── */}
        <motion.div {...slideUp} className="mb-12">
          <div className="relative max-w-2xl mx-auto">

            {/* Icon / spinner */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2
                            text-[var(--color-muted)] pointer-events-none">
              {isFetching
                ? <Loader2 size={16} className="animate-spin" />
                : <SearchIcon size={16} />
              }
            </div>

            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search games…"
              className="input-base pl-11 pr-11 py-4 text-base
                         rounded-md text-foreground placeholder:text-[var(--color-muted)]"
              autoComplete="off"
              spellCheck="false"
            />

            {/* Clear */}
            <AnimatePresence>
              {query && (
                <motion.button
                  {...fadeIn}
                  onClick={clear}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                             text-[var(--color-muted)] hover:text-foreground
                             transition-colors"
                >
                  <X size={15} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Hint */}
          <AnimatePresence>
            {!hasQuery && (
              <motion.p {...fadeIn}
                className="text-center text-xs text-[var(--color-muted)]
                           font-mono mt-3"
              >
                Start typing to search 500K+ games via IGDB
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Search results ───────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {hasQuery ? (
            <motion.div key="results" {...fadeIn}>
              <ResultsHeader
                query={query}
                count={results.length}
                loading={isLoading}
              />
              <ResultsGrid games={results} loading={isLoading} />
            </motion.div>
          ) : (
            <motion.div key="trending" {...fadeIn}>
              <TrendingSection games={trending ?? []} loading={trendLoading} />
            </motion.div>
          )}
        </AnimatePresence>

      </Container>
    </Shell>
  );
}

// ── Results header ─────────────────────────────────────────────────────────
const ResultsHeader = ({ query, count, loading }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h4 className="text-foreground">
        {loading ? 'Searching…' : `Results for "${query}"`}
      </h4>
      {!loading && (
        <p className="text-xs text-[var(--color-subtle)] font-mono mt-0.5">
          {count} game{count !== 1 ? 's' : ''} found
        </p>
      )}
    </div>
  </div>
);

// ── Results grid ───────────────────────────────────────────────────────────
const ResultsGrid = ({ games, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                      lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!games.length) {
    return (
      <motion.div {...slideUp}
        className="flex flex-col items-center py-24 gap-4"
      >
        <SearchIcon size={28} className="text-[var(--color-muted)]" />
        <p className="text-sm text-[var(--color-subtle)]">No games found.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer(0.04)}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                 lg:grid-cols-6 gap-4"
    >
      {games.map((game) => (
        <motion.div key={game.igdbId} variants={staggerItem}>
          <GameCard game={game} />
        </motion.div>
      ))}
    </motion.div>
  );
};

// ── Trending ───────────────────────────────────────────────────────────────
const TrendingSection = ({ games, loading }) => (
  <div>
    <div className="flex items-center gap-2 mb-6">
      <TrendingUp size={14} className="text-[var(--color-subtle)]" />
      <h6 className="text-[var(--color-subtle)]">Trending now</h6>
    </div>

    {loading ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                      lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    ) : (
      <motion.div
        variants={staggerContainer(0.03)}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                   lg:grid-cols-6 gap-4"
      >
        {games.map((game, idx) => (
          <motion.div key={game.igdbId} variants={staggerItem}>
            <GameCard game={game} rank={idx + 1} />
          </motion.div>
        ))}
      </motion.div>
    )}
  </div>
);