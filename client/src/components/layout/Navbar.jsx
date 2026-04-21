import { Link, useLocation }   from 'react-router-dom';
import { motion }              from 'framer-motion';
import { Search, LayoutDashboard, User,
         LogOut, Menu, X, Command } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth }             from '@/hooks/useAuth.js';
import { CommandPalette }      from '@/components/ui/CommandPalette.jsx';
import { cn }                  from '@/lib/utils.js';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/search',    label: 'Search',    icon: Search },
];

export const Navbar = () => {
  const { isAuthenticated, user, signOut } = useAuth();
  const { pathname }  = useLocation();
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [cmdOpen,    setCmdOpen]    = useState(false);
  const [scrolled,   setScrolled]   = useState(false);

  // Scroll shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // ⌘K global
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((p) => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-[var(--color-border)]',
          'transition-shadow duration-300',
          scrolled && 'shadow-lg shadow-black/20'
        )}
        style={{ background: 'rgba(8,8,8,0.88)', backdropFilter: 'blur(16px)' }}
      >
        <nav className="max-w-7xl mx-auto px-5 h-14
                        flex items-center justify-between gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-6 h-6 rounded-sm bg-foreground
                         flex items-center justify-center"
            >
              <span className="text-[10px] font-bold text-background
                               font-display leading-none">Q</span>
            </motion.span>
            <span className="font-display font-bold text-[1.0625rem]
                             tracking-tight text-foreground
                             group-hover:text-white transition-colors">
              QuestLog
            </span>
          </Link>

          {/* Desktop nav */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link key={href} to={href}
                    className={cn(
                      'relative px-3 py-1.5 rounded text-sm transition-colors',
                      active
                        ? 'text-foreground'
                        : 'text-[var(--color-subtle)] hover:text-foreground'
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded
                                   bg-[var(--color-surface-2)]"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <span className="relative z-10">{label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right */}
          <div className="flex items-center gap-2 ml-auto">

            {/* ⌘K button */}
            <button
              onClick={() => setCmdOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded
                         border border-[var(--color-border)]
                         text-[var(--color-muted)] text-xs font-mono
                         hover:border-[var(--color-border-2)]
                         hover:text-[var(--color-subtle)]
                         transition-colors duration-150"
            >
              <Command size={12} />
              <span>Search</span>
              <kbd className="px-1 rounded bg-[var(--color-surface-2)]
                              border border-[var(--color-border)] text-2xs">
                ⌘K
              </kbd>
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to={`/profile/${user?.username}`}
                  className="hidden md:flex items-center gap-2 px-2 py-1.5
                             rounded text-sm text-[var(--color-secondary)]
                             hover:text-foreground hover:bg-[var(--color-surface)]
                             transition-colors"
                >
                  {user?.avatar
                    ? <img src={user.avatar} alt=""
                           className="w-6 h-6 rounded-full object-cover" />
                    : <div className="w-6 h-6 rounded-full
                                      bg-[var(--color-surface-2)]
                                      border border-[var(--color-border)]
                                      flex items-center justify-center
                                      text-xs font-display">
                        {user?.username?.[0]?.toUpperCase() ?? '?'}
                      </div>
                  }
                  <span className="font-medium text-sm">{user?.username}</span>
                </Link>

                <button
                  onClick={signOut}
                  className="hidden md:flex btn btn-ghost btn-sm gap-1.5"
                >
                  <LogOut size={13} />
                  <span>Out</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/auth/login"    className="btn btn-ghost btn-sm">Sign in</Link>
                <Link to="/auth/register" className="btn btn-primary btn-sm">Start</Link>
              </>
            )}

            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="md:hidden btn btn-ghost btn-sm p-2"
            >
              <motion.div
                animate={{ rotate: menuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {menuOpen ? <X size={16} /> : <Menu size={16} />}
              </motion.div>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <motion.div
          initial={false}
          animate={{ height: menuOpen ? 'auto' : 0, opacity: menuOpen ? 1 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden md:hidden border-t border-[var(--color-border)]"
        >
          <div className="px-5 py-4 flex flex-col gap-1">
            {isAuthenticated && NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link key={href} to={href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 py-2.5 text-sm
                           text-[var(--color-secondary)] hover:text-foreground
                           transition-colors"
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
            {isAuthenticated
              ? <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="flex items-center gap-2.5 py-2.5 text-sm
                             text-[var(--color-subtle)] hover:text-foreground
                             transition-colors mt-1"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              : <div className="flex flex-col gap-2 mt-2">
                  <Link to="/auth/login"    onClick={() => setMenuOpen(false)}
                    className="btn btn-ghost btn-sm w-full">Sign in</Link>
                  <Link to="/auth/register" onClick={() => setMenuOpen(false)}
                    className="btn btn-primary btn-sm w-full">Get started</Link>
                </div>
            }
          </div>
        </motion.div>
      </header>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
};