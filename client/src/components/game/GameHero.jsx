import { motion }     from 'framer-motion';
import { Star, Users } from 'lucide-react';
import { Container }  from '@/components/layout/Container.jsx';
import { Badge }      from '@/components/ui/Badge.jsx';
import { fadeIn }     from '@/lib/motion.js';

export const GameHero = ({ game }) => (
  <div className="relative overflow-hidden border-b border-[var(--color-border)]">
    {/* Blurred backdrop art */}
    {game.artworks?.[0] && (
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={game.artworks[0]}
          alt=""
          className="w-full h-full object-cover opacity-[0.04] scale-110
                     blur-2xl"
        />
      </div>
    )}

    <Container size="lg" className="py-10 relative z-10">
      <motion.div {...fadeIn} className="flex gap-6 items-start">
        {/* Cover */}
        <div className="w-24 h-32 md:w-36 md:h-48 rounded shrink-0 overflow-hidden
                        border border-[var(--color-border-2)] shadow-2xl">
          {game.cover
            ? <img src={game.cover} alt={game.name}
                   className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-[var(--color-surface-2)]" />
          }
        </div>

        {/* Meta */}
        <div className="flex-1 min-w-0 pt-1">
          {/* Genres */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {game.genres?.slice(0, 3).map((g) => (
              <Badge key={g}>{g}</Badge>
            ))}
          </div>

          <h1 className="text-foreground mb-2 text-3xl md:text-4xl">
            {game.name}
          </h1>

          {/* Rating + submission count */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            {game.rating && (
              <div className="flex items-center gap-1.5">
                <Star size={13} className="text-[var(--color-muted)] fill-current" />
                <span className="text-sm font-mono text-[var(--color-secondary)]">
                  {Math.round(game.rating)}/100
                </span>
              </div>
            )}
            {game.ratingCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Users size={13} className="text-[var(--color-muted)]" />
                <span className="text-sm font-mono text-[var(--color-subtle)]">
                  {game.ratingCount.toLocaleString()} ratings
                </span>
              </div>
            )}
            {game.releaseYear && (
              <span className="text-sm font-mono text-[var(--color-subtle)]">
                {game.releaseYear}
              </span>
            )}
          </div>

          {game.summary && (
            <p className="text-sm text-[var(--color-subtle)] max-w-2xl
                          leading-relaxed line-clamp-3">
              {game.summary}
            </p>
          )}
        </div>
      </motion.div>
    </Container>
  </div>
);