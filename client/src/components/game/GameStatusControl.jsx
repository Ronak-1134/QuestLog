import { useState }    from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store.js';
import { cn }           from '@/lib/utils.js';
import { scaleIn }      from '@/lib/motion.js';
import api              from '@/lib/axios.js';

const STATUSES = [
  { value: 'playing',   label: 'Playing'        },
  { value: 'completed', label: 'Completed'      },
  { value: 'backlog',   label: 'Add to backlog' },
  { value: 'dropped',   label: 'Dropped'        },
  { value: 'wishlist',  label: 'Wishlist'       },
];

export const GameStatusControl = ({ game }) => {
  const { user, firebaseUser } = useAuthStore();
  const qc = useQueryClient();
  const [open,    setOpen]    = useState(false);
  const [current, setCurrent] = useState(null);

  const userId = user?._id ?? firebaseUser?.uid;

  const { mutate, isLoading } = useMutation({
    mutationFn: (status) => api.post('/users/library', {
      igdbId: game.igdbId,
      userId,
      status,
      gameData: {
        name: game.name, slug: game.slug,
        cover: game.cover, coverThumb: game.coverThumb,
        releaseYear: game.releaseYear, genres: game.genres ?? [],
      },
    }),
    onSuccess: (_, status) => {
      setCurrent(status);
      qc.invalidateQueries(['library', userId]);
      qc.invalidateQueries(['backlog',  userId]);
      setOpen(false);
    },
  });

  if (!firebaseUser) return null;

  const label = STATUSES.find(s => s.value === current)?.label;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        disabled={isLoading}
        className={cn('btn gap-2', current ? 'btn-ghost' : 'btn-primary')}
      >
        {current ? <><Check size={13} />{label}</> : <><Plus size={13} />Add to library</>}
        <ChevronDown size={12} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div {...scaleIn}
              className="absolute right-0 top-full mt-1.5 z-50 w-44
                         bg-[var(--color-surface)] border border-[var(--color-border-2)]
                         rounded-md overflow-hidden shadow-xl shadow-black/40">
              {STATUSES.map(({ value, label: l }) => (
                <button key={value} onClick={() => mutate(value)}
                  className="w-full flex items-center justify-between px-3 py-2.5
                             text-sm text-[var(--color-secondary)]
                             hover:bg-[var(--color-surface-2)] hover:text-foreground
                             transition-colors">
                  <span>{l}</span>
                  {current === value && <Check size={11} />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};