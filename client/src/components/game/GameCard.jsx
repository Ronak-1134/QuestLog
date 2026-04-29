import { Link }        from 'react-router-dom';
import { motion }      from 'framer-motion';
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
        className={cn('flex flex-col gap-1.5', className)}
      >
        {/* Cover — fixed aspect ratio, nothing overflows */}
        <div className="relative aspect-[3/4] w-full rounded overflow-hidden
                        bg-[var(--color-surface-2)]
                        border border-[var(--color-border)]
                        group-hover:border-[var(--color-border-2)]
                        transition-colors duration-200 flex-shrink-0">
          {game.cover ? (
            <img
              src={game.cover}
              alt={game.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover
                         transition-transform duration-500 ease-out
                         group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center
                            justify-center p-3">
              <span className="text-2xs text-[var(--color-muted)] text-center
                               font-mono line-clamp-4 leading-relaxed">
                {game.name}
              </span>
            </div>
          )}

          {/* Rank badge */}
          {rank && (
            <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded
                            bg-background/80 backdrop-blur-sm
                            border border-[var(--color-border)]
                            flex items-center justify-center">
              <span className="text-2xs font-mono text-[var(--color-subtle)]">
                {rank}
              </span>
            </div>
          )}

          {/* Rating */}
          {game.rating && (
            <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5
                            px-1.5 py-0.5 rounded
                            bg-background/80 backdrop-blur-sm
                            border border-[var(--color-border)]">
              <Star size={8} className="text-yellow-400 fill-current" />
              <span className="text-2xs font-mono text-[var(--color-subtle)]">
                {Math.round(game.rating)}
              </span>
            </div>
          )}

          {/* Playtime overlay on hover */}
          {median && (
            <div className="absolute inset-x-0 bottom-0 py-2 px-2
                            bg-gradient-to-t from-black/80 to-transparent
                            opacity-0 group-hover:opacity-100
                            transition-opacity duration-200
                            flex items-center gap-1">
              <Clock size={9} className="text-white/60 flex-shrink-0" />
              <span className="text-2xs font-mono text-white/80 truncate">
                ~{formatHours(median)}
              </span>
            </div>
          )}
        </div>

        {/* Info — below cover, never overlaps */}
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--color-secondary)]
                        group-hover:text-foreground transition-colors
                        line-clamp-2 leading-snug break-words">
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