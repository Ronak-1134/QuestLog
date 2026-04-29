import { useRef, useEffect }       from 'react';
import { useSearchParams }         from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X, TrendingUp, Loader2 } from 'lucide-react';
import { Shell }            from '@/components/layout/Shell.jsx';
import { Container }        from '@/components/layout/Container.jsx';
import { GameCard }         from '@/components/game/GameCard.jsx';
import { GameCardSkeleton } from '@/components/game/GameCardSkeleton.jsx';
import { useGameSearch }    from '@/hooks/useGameSearch.js';
import { useTrending }      from '@/hooks/useTrending.js';
import { staggerContainer, staggerItem, fadeIn } from '@/lib/motion.js';

export default function Search() {
  const inputRef = useRef(null);
  const [sp]     = useSearchParams();
  const { query, setQuery, clear, results,
          isLoading, isFetching, hasQuery } = useGameSearch(12);
  const { data: trending, isLoading: tl } = useTrending(20);

  useEffect(() => { if (sp.get('q')) setQuery(sp.get('q')); }, []);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  return (
    <Shell>
      <Container size="lg" className="py-10 md:py-14">

        {/* ── Page heading ───────────────────────────────────── */}
        <div className="mb-8">
          <h4 className="text-foreground mb-1">Search Games</h4>
          <p className="text-sm text-[var(--color-subtle)]">
            Find completion times for any game
          </p>
        </div>

        {/* ── Search input — completely isolated ─────────────── */}
        <div className="mb-10" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ position: 'relative' }}>
            {/* Icon */}
            <div style={{
              position: 'absolute', left: 16, top: '50%',
              transform: 'translateY(-50%)', zIndex: 2,
              pointerEvents: 'none',
              color: 'var(--color-muted)',
            }}>
              {isFetching
                ? <Loader2 size={16} className="animate-spin" />
                : <SearchIcon size={16} />
              }
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 500,000+ games…"
              autoComplete="off"
              spellCheck="false"
              style={{
                position: 'relative', zIndex: 1,
                width: '100%',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border-2)',
                borderRadius: 8,
                paddingLeft: 44, paddingRight: 44,
                paddingTop: 16, paddingBottom: 16,
                fontSize: 16,
                color: 'var(--color-foreground)',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-subtle)'}
              onBlur={(e)  => e.target.style.borderColor = 'var(--color-border-2)'}
            />

            {/* Clear button */}
            {query && (
              <button onClick={clear} style={{
                position: 'absolute', right: 16, top: '50%',
                transform: 'translateY(-50%)', zIndex: 2,
                background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--color-muted)',
              }}>
                <X size={15} />
              </button>
            )}
          </div>

          {!hasQuery && (
            <p style={{
              fontSize: 11, fontFamily: 'var(--font-mono)',
              color: 'var(--color-muted)', marginTop: 8, marginLeft: 4,
            }}>
              Start typing to search · powered by IGDB
            </p>
          )}
        </div>

        {/* ── Results ────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {hasQuery ? (
            <motion.div key="res" {...fadeIn}>
              <div className="mb-6">
                <h5 className="text-foreground">
                  {isLoading ? 'Searching…' : `"${query}"`}
                </h5>
                {!isLoading && (
                  <p className="text-xs text-[var(--color-subtle)] font-mono mt-0.5">
                    {results.length} game{results.length !== 1 ? 's' : ''} found
                  </p>
                )}
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                                lg:grid-cols-6 gap-x-4 gap-y-8">
                  {Array.from({ length: 12 }).map((_, i) => <GameCardSkeleton key={i} />)}
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center py-24 gap-4">
                  <SearchIcon size={28} className="text-[var(--color-muted)]" />
                  <p className="text-sm text-[var(--color-subtle)]">
                    No games found for "{query}"
                  </p>
                  <button onClick={clear}
                    className="text-xs text-[var(--color-secondary)]
                               hover:text-foreground underline">
                    Clear search
                  </button>
                </div>
              ) : (
                <motion.div
                  variants={staggerContainer(0.04)} initial="initial" animate="animate"
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                             lg:grid-cols-6 gap-x-4 gap-y-8"
                >
                  {results.map((g) => (
                    <motion.div key={g.igdbId} variants={staggerItem}>
                      <GameCard game={g} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div key="trend" {...fadeIn}>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={14} className="text-[var(--color-subtle)]" />
                <h6 className="text-[var(--color-subtle)]">Trending now</h6>
              </div>
              {tl ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                                lg:grid-cols-6 gap-x-4 gap-y-8">
                  {Array.from({ length: 12 }).map((_, i) => <GameCardSkeleton key={i} />)}
                </div>
              ) : (
                <motion.div
                  variants={staggerContainer(0.03)} initial="initial" animate="animate"
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                             lg:grid-cols-6 gap-x-4 gap-y-8"
                >
                  {(trending ?? []).map((g, i) => (
                    <motion.div key={g.igdbId} variants={staggerItem}>
                      <GameCard game={g} rank={i + 1} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </Shell>
  );
}