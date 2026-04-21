import { useState }    from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore }  from '@/store/auth.store.js';
import { useUpdateUserGame } from '@/hooks/useUpdateUserGame.js';
import { Badge }         from '@/components/ui/Badge.jsx';
import { cn }            from '@/lib/utils.js';
import { scaleIn }       from '@/lib/motion.js';
import api               from '@/lib/axios.js';

const STATUSES = [
  { value: 'playing',   label: 'Playing',       variant: 'playing'   },
  { value: 'completed', label: 'Completed',      variant: 'completed' },
  { value: 'backlog',   label: 'Add to backlog', variant: 'backlog'   },
  { value: 'dropped',   label: 'Dropped',        variant: 'dropped'   },
  { value: 'wishlist',  label: 'Wishlist',        variant: 'default'   },
];

export const GameStatusControl = ({ game }) => {
  const { user, firebaseUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [open, setOpen]   = useState(false);
  const { mutate, isLoading } = useUpdateUserGame();

  // Check if user already has this game
  const { data: entry, refetch } = useQuery({
    queryKey: ['userGame', user?._id, game?.igdbId],
    queryFn:  async () => {
      const { data } = await api.get(
        `/users/${user._id}/library?igdbId=${game.igdbId}&limit=1`
      );
      return data.data?.[0] ?? null;
    },
    enabled: Boolean(user?._id && game?.igdbId),
  });

  // Add game mutation (creates UserGame entry)
  const { mutate: addGame, isLoading: adding } = useMutation({
    mutationFn: async (status) => {
      const { data } = await api.post('/users/library', {
        igdbId:   game.igdbId,
        gameData: game,
        status,
      });
      return data.data;
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries(['library',  user?._id]);
      queryClient.invalidateQueries(['backlog',  user?._id]);
      queryClient.invalidateQueries(['userStats', user?._id]);
      setOpen(false);
    },
  });

  if (!firebaseUser) return null;

  const currentStatus = STATUSES.find((s) => s.value === entry?.status);

  const handleSelect = (status) => {
    if (entry) {
      mutate({ userGameId: entry._id, updates: { status } });
    } else {
      addGame(status);
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        disabled={isLoading || adding}
        className={cn(
          'btn gap-2',
          entry ? 'btn-ghost' : 'btn-primary'
        )}
      >
        {entry
          ? <><Check size={13} />{currentStatus?.label ?? entry.status}</>
          : <><Plus size={13} />Add to library</>
        }
        <ChevronDown size={12}
          className={cn('transition-transform', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              {...scaleIn}
              className="absolute right-0 top-full mt-1.5 z-50
                         w-44 bg-[var(--color-surface)]
                         border border-[var(--color-border-2)]
                         rounded-md overflow-hidden shadow-xl
                         shadow-black/40"
            >
              {STATUSES.map(({ value, label, variant }) => (
                <button
                  key={value}
                  onClick={() => handleSelect(value)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5',
                    'text-sm text-left transition-colors duration-100',
                    'hover:bg-[var(--color-surface-2)]',
                    entry?.status === value
                      ? 'text-foreground'
                      : 'text-[var(--color-secondary)]'
                  )}
                >
                  <span>{label}</span>
                  {entry?.status === value && (
                    <Check size={11} className="text-[var(--color-subtle)]" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};