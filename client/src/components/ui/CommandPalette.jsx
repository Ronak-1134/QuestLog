import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate }       from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Hash, User, LayoutDashboard, X } from 'lucide-react';
import { useGameSearch }     from '@/hooks/useGameSearch.js';
import { useAuthStore }      from '@/store/auth.store.js';
import { cn }                from '@/lib/utils.js';

const STATIC_COMMANDS = (user) => [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Go to Dashboard', action: '/dashboard' },
  { id: 'search',    icon: Search,          label: 'Search games',     action: '/search' },
  { id: 'profile',   icon: User,            label: 'View profile',
    action: user ? `/profile/${user.username}` : '/auth/login' },
];

export const CommandPalette = ({ open, onClose }) => {
  const navigate  = useNavigate();
  const { user }  = useAuthStore();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef  = useRef(null);

  const { results, isFetching } = useGameSearch(6);

  // Inject query into game search hook
  useEffect(() => { if (open) { setQuery(''); setCursor(0); } }, [open]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);

  const staticCmds = STATIC_COMMANDS(user);

  const items = query.trim()
    ? results.map((g) => ({
        id:     `game-${g.igdbId}`,
        icon:   Hash,
        label:  g.name,
        meta:   g.releaseYear,
        action: `/games/${g.slug}`,
        cover:  g.coverThumb,
      }))
    : staticCmds;

  const go = useCallback((action) => {
    if (typeof action === 'string') navigate(action);
    else action?.();
    onClose();
  }, [navigate, onClose]);

  useEffect(() => {
    const handler = (e) => {
      if (!open) return;
      if (e.key === 'Escape')  { onClose(); return; }
      if (e.key === 'ArrowDown') setCursor((c) => Math.min(c + 1, items.length - 1));
      if (e.key === 'ArrowUp')   setCursor((c) => Math.max(c - 1, 0));
      if (e.key === 'Enter' && items[cursor]) go(items[cursor].action);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, cursor, items, go, onClose]);

  // Global ⌘K / Ctrl+K trigger
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open ? onClose() : null; // parent toggles
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-[100]
                       bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1,    y: 0   }}
            exit={{    opacity: 0, scale: 0.97, y: -4   }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[18%] left-1/2 -translate-x-1/2
                       z-[101] w-full max-w-lg mx-4"
          >
            <div className="bg-[var(--color-surface)]
                            border border-[var(--color-border-2)]
                            rounded-lg overflow-hidden
                            shadow-2xl shadow-black/60">

              {/* Input row */}
              <div className="flex items-center gap-3 px-4 py-3.5
                              border-b border-[var(--color-border)]">
                {isFetching
                  ? <div className="w-4 h-4 rounded-full border border-[var(--color-muted)]
                                     border-t-foreground animate-spin shrink-0" />
                  : <Search size={15} className="text-[var(--color-muted)] shrink-0" />
                }
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
                  placeholder="Search games or commands…"
                  className="flex-1 bg-transparent text-foreground text-sm
                             outline-none placeholder:text-[var(--color-muted)]
                             font-sans"
                />
                {query && (
                  <button onClick={() => setQuery('')}
                    className="text-[var(--color-muted)] hover:text-foreground
                               transition-colors">
                    <X size={13} />
                  </button>
                )}
                <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5
                                rounded border border-[var(--color-border)]
                                text-2xs font-mono text-[var(--color-muted)]">
                  esc
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-1.5">
                {items.length === 0 ? (
                  <p className="px-4 py-8 text-sm text-[var(--color-subtle)]
                                text-center font-mono">
                    No results
                  </p>
                ) : (
                  items.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => go(item.action)}
                      onMouseEnter={() => setCursor(idx)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5',
                        'text-left transition-colors duration-75',
                        cursor === idx
                          ? 'bg-[var(--color-surface-2)]'
                          : 'hover:bg-[var(--color-surface-2)]'
                      )}
                    >
                      {item.cover
                        ? <img src={item.cover} alt="" className="w-7 h-9 rounded
                                                                    object-cover shrink-0
                                                                    border border-[var(--color-border)]" />
                        : <div className="w-7 h-7 rounded flex items-center justify-center
                                          bg-[var(--color-surface-2)]
                                          border border-[var(--color-border)] shrink-0">
                            <item.icon size={13} className="text-[var(--color-subtle)]" />
                          </div>
                      }
                      <span className="flex-1 text-sm text-[var(--color-secondary)]
                                       truncate group-hover:text-foreground">
                        {item.label}
                      </span>
                      {item.meta && (
                        <span className="text-xs font-mono text-[var(--color-muted)] shrink-0">
                          {item.meta}
                        </span>
                      )}
                      <ArrowRight size={12}
                        className={cn(
                          'shrink-0 transition-opacity',
                          cursor === idx
                            ? 'text-[var(--color-subtle)] opacity-100'
                            : 'opacity-0'
                        )}
                      />
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-[var(--color-border)] px-4 py-2
                              flex items-center gap-4">
                {[
                  { key: '↑↓', label: 'navigate' },
                  { key: '↵',  label: 'select'   },
                  { key: 'esc', label: 'close'    },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded border
                                    border-[var(--color-border)]
                                    text-2xs font-mono
                                    text-[var(--color-muted)]">
                      {key}
                    </kbd>
                    <span className="text-2xs font-mono text-[var(--color-muted)]">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};