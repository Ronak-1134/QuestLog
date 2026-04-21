import { Link }       from 'react-router-dom';
import { motion }     from 'framer-motion';
import { Star, Clock } from 'lucide-react';
import { formatHours } from '@/lib/utils.js';
import { cn }          from '@/lib/utils.js';

export const GameCard = ({ game, rank, className }) => {
  const median = game.playtimeStats?.mainStory?.median ?? null;

  return (
    <Link to={`/games/${game.slug}`} className="group block">
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={cn('flex flex-col gap-2', className)}
      >
        {/* Cover */}
        <div className="relative aspect-[3/4] rounded overflow-hidden
                        bg-[var(--color-surface-2)]
                        border border-[var(--color-border)]
                        group-hover:border-[var(--color-border-2)]
                        transition-colors duration-200">
          {game.cover ? (
            <img
              src={game.cover}
              alt={game.name}
              loading="lazy"
              className="w-full h-full object-cover
                         transition-transform duration-500 ease-out
                         group-hover:scale-105"
            />
          ) : (
            <NoCover name={game.name} />
          )}

          {/* Rank badge */}
          {rank && (
            <div className="absolute top-2 left-2 w-6 h-6 rounded
                            bg-background/80 backdrop-blur-sm
                            border border-[var(--color-border)]
                            flex items-center justify-center">
              <span className="text-2xs font-mono text-[var(--color-subtle)]">
                {rank}
              </span>
            </div>
          )}

          {/* Rating pill */}
          {game.rating && (
            <div className="absolute top-2 right-2 flex items-center gap-1
                            px-1.5 py-0.5 rounded
                            bg-background/80 backdrop-blur-sm
                            border border-[var(--color-border)]">
              <Star size={9} className="text-[var(--color-muted)] fill-current" />
              <span className="text-2xs font-mono text-[var(--color-subtle)]">
                {Math.round(game.rating)}
              </span>
            </div>
          )}

          {/* Playtime overlay — on hover */}
          {median && (
            <div className="absolute inset-x-0 bottom-0 py-2 px-2
                            bg-gradient-to-t from-black/80 to-transparent
                            opacity-0 group-hover:opacity-100
                            transition-opacity duration-200
                            flex items-center gap-1">
              <Clock size={9} className="text-white/60" />
              <span className="text-2xs font-mono text-white/80">
                ~{formatHours(median)}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-medium text-[var(--color-secondary)]
                        group-hover:text-foreground transition-colors
                        line-clamp-2 leading-snug">
            {game.name}
          </p>
          {game.releaseYear && (
            <p className="text-2xs font-mono text-[var(--color-muted)] mt-0.5">
              {game.releaseYear}
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

const NoCover = ({ name }) => (
  <div className="w-full h-full flex items-center justify-center p-3">
    <span className="text-xs text-[var(--color-muted)] text-center
                     font-mono line-clamp-3 leading-relaxed">
      {name}
    </span>
  </div>
);