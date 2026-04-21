import { useQuery }    from '@tanstack/react-query';
import { motion }      from 'framer-motion';
import { GameCard }    from './GameCard.jsx';
import { GameCardSkeleton } from './GameCardSkeleton.jsx';
import { staggerContainer, staggerItem } from '@/lib/motion.js';
import api             from '@/lib/axios.js';

export const SimilarGames = ({ igdbId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['similar', igdbId],
    queryFn:  async () => {
      const { data } = await api.get(`/games/${igdbId}/similar`);
      return data.data;
    },
    enabled:   Boolean(igdbId),
    staleTime: 1000 * 60 * 60 * 12,
  });

  const games = data ?? [];
  if (!isLoading && !games.length) return null;

  return (
    <div className="mt-14">
      <div className="divider mb-8" />
      <h5 className="text-foreground mb-6">Similar games</h5>

      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          variants={staggerContainer(0.05)}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4"
        >
          {games.map((game) => (
            <motion.div key={game.igdbId} variants={staggerItem}>
              <GameCard game={game} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};