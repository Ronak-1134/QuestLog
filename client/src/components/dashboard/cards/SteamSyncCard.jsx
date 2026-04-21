import { useState }        from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { useSteamSync }    from '@/hooks/useSteamSync.js';
import { useAuthStore }    from '@/store/auth.store.js';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card.jsx';
import { Button }          from '@/components/ui/Button.jsx';
import { scaleIn, staggerContainer, staggerItem } from '@/lib/motion.js';
import { formatRelative }  from '@/lib/utils.js';

export const SteamSyncCard = () => {
  const { user }                           = useAuthStore();
  const { sync, isLoading, progress, data, reset } = useSteamSync();
  const [input, setInput]                  = useState(user?.steam?.steamId ?? '');

  const hasSynced = Boolean(user?.steam?.lastSync);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Steam sync</CardTitle>
        {hasSynced && (
          <CheckCircle2 size={14} className="text-emerald-400/70" />
        )}
      </CardHeader>

      <div className="flex flex-col gap-3">

        {/* Input */}
        <div className="relative">
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value); reset(); }}
            placeholder="Steam ID or profile URL"
            className="input-base pr-10 text-sm"
          />
          {user?.steam?.profileUrl && (
  <a
    href={user.steam.profileUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="absolute right-3 top-1/2 -translate-y-1/2
               text-[var(--color-muted)] hover:text-foreground
               transition-colors"
  >
    <ExternalLink size={13} />
  </a>
)}
        </div>

        <Button
          variant="ghost"
          loading={isLoading}
          onClick={() => sync(input)}
          disabled={!input.trim()}
          className="w-full gap-2"
        >
          {isLoading
            ? <><Loader2 size={13} className="animate-spin" />{progress}</>
            : <><RefreshCw size={13} />{hasSynced ? 'Re-sync library' : 'Import library'}</>
          }
        </Button>

        {/* Success result */}
        <AnimatePresence>
          {data && (
            <motion.div {...scaleIn}
              className="flex flex-col gap-2.5 p-3 rounded
                         bg-[var(--color-surface-2)]
                         border border-[var(--color-border)]"
            >
              {/* Profile */}
              {data.profile && (
                <div className="flex items-center gap-2">
                  <img
                    src={data.profile.avatar}
                    alt=""
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-xs text-[var(--color-secondary)]">
                    {data.profile.name}
                  </span>
                </div>
              )}

              {/* Stats */}
              <motion.div
                variants={staggerContainer(0.05)}
                initial="initial"
                animate="animate"
                className="grid grid-cols-3 gap-2"
              >
                {[
                  { label: 'Found',   value: data.total   },
                  { label: 'Matched', value: data.matched },
                  { label: 'Synced',  value: data.synced  },
                ].map(({ label, value }) => (
                  <motion.div
                    key={label}
                    variants={staggerItem}
                    className="text-center"
                  >
                    <p className="text-base font-display font-bold
                                  text-foreground leading-none">
                      {value}
                    </p>
                    <p className="text-2xs font-mono text-[var(--color-muted)]
                                  uppercase tracking-widest mt-0.5">
                      {label}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Last sync time */}
        {hasSynced && (
          <p className="text-2xs text-[var(--color-muted)] font-mono">
            Last sync: {formatRelative(user.steam.lastSync)}
            {' · '}{user.steam.gameCount} games in library
          </p>
        )}

      </div>
    </Card>
  );
};