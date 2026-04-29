import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, Trophy,
          User, LogOut, Menu, X, Command } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth }    from '@/hooks/useAuth.js';
import { cn }         from '@/lib/utils.js';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/search',    label: 'Search',    icon: Search },
  { href: '/missions',  label: 'Missions',  icon: Trophy },
];

export const Navbar = () => {
  const { isAuthenticated, user, firebaseUser, signOut } = useAuth();
  const { pathname } = useLocation();
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const name   = user?.username ?? firebaseUser?.displayName ?? firebaseUser?.email?.split('@')[0] ?? 'Player';
  const email  = user?.email    ?? firebaseUser?.email ?? '';
  const avatar = user?.avatar   ?? firebaseUser?.photoURL ?? null;

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-[var(--color-border)] transition-shadow duration-300',
        scrolled && 'shadow-lg shadow-black/20'
      )}
      style={{ background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(16px)' }}
    >
      <nav className="max-w-7xl mx-auto px-5 h-14 flex items-center gap-4">

        {/* Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'}
          className="flex items-center gap-2 shrink-0 group">
          <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="w-6 h-6 rounded-sm bg-foreground flex items-center justify-center">
            <span className="text-[10px] font-bold text-background font-display">Q</span>
          </motion.span>
          <span className="font-display font-bold text-[1.0625rem] tracking-tight
                           text-foreground hidden sm:block">
            QuestLog
          </span>
        </Link>

        {/* Desktop nav */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-1 ml-2">
            {LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link key={href} to={href}
                  className={cn(
                    'relative px-3 py-1.5 rounded text-sm transition-colors',
                    active ? 'text-foreground' : 'text-[var(--color-subtle)] hover:text-foreground'
                  )}>
                  {active && (
                    <motion.div layoutId="nav-active"
                      className="absolute inset-0 rounded bg-[var(--color-surface-2)]"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />
                  )}
                  <span className="relative z-10">{label}</span>
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex-1" />

        {/* Right side */}
        {isAuthenticated ? (
          <div className="hidden md:flex items-center gap-2">
            {/* Desktop Profile Link Fix */}
            <Link to={`/profile/${encodeURIComponent(name)}`}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-sm
                         text-[var(--color-secondary)] hover:text-foreground
                         hover:bg-[var(--color-surface)] transition-colors">
              {avatar
                ? <img src={avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                : <div className="w-6 h-6 rounded-full bg-[var(--color-surface-2)]
                                  border border-[var(--color-border)]
                                  flex items-center justify-center
                                  text-xs font-display font-bold">
                    {name[0]?.toUpperCase()}
                  </div>
              }
              <span className="font-medium max-w-[100px] truncate">{name}</span>
            </Link>
            <button onClick={signOut} className="btn btn-ghost btn-sm gap-1.5">
              <LogOut size={13} /> <span className="hidden lg:inline">Sign out</span>
            </button>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2">
            <Link to="/auth/login"    className="btn btn-ghost btn-sm">Sign in</Link>
            <Link to="/auth/register" className="btn btn-primary btn-sm">Start free</Link>
          </div>
        )}

        {/* Mobile toggle */}
        <button onClick={() => setOpen(p => !p)} className="md:hidden btn btn-ghost btn-sm p-2">
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
            {open ? <X size={16} /> : <Menu size={16} />}
          </motion.div>
        </button>
      </nav>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden md:hidden border-t border-[var(--color-border)]"
      >
        <div className="px-5 py-4 flex flex-col gap-1">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 pb-3 mb-2
                              border-b border-[var(--color-border)]">
                {avatar
                  ? <img src={avatar} alt="" className="w-8 h-8 rounded-full" />
                  : <div className="w-8 h-8 rounded-full bg-[var(--color-surface-2)]
                                    border border-[var(--color-border)]
                                    flex items-center justify-center font-bold text-sm">
                      {name[0]?.toUpperCase()}
                    </div>
                }
                <div>
                  <p className="text-sm font-medium text-foreground">{name}</p>
                  <p className="text-xs text-[var(--color-subtle)]">{email}</p>
                </div>
              </div>
              {LINKS.map(({ href, label, icon: Icon }) => (
                <Link key={href} to={href}
                  className="flex items-center gap-2.5 py-2.5 text-sm
                             text-[var(--color-secondary)] hover:text-foreground transition-colors">
                  <Icon size={14} />{label}
                </Link>
              ))}
              {/* Mobile Profile Link Fix */}
              <Link to={`/profile/${encodeURIComponent(name)}`}
                className="flex items-center gap-2.5 py-2.5 text-sm
                           text-[var(--color-secondary)] hover:text-foreground transition-colors">
                <User size={14} />Profile
              </Link>
              <button onClick={signOut}
                className="flex items-center gap-2.5 py-2.5 text-sm
                           text-[var(--color-subtle)] hover:text-foreground transition-colors">
                <LogOut size={14} />Sign out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 py-2">
              <Link to="/auth/login"    className="btn btn-ghost btn-sm w-full">Sign in</Link>
              <Link to="/auth/register" className="btn btn-primary btn-sm w-full">Get started</Link>
            </div>
          )}
        </div>
      </motion.div>
    </header>
  );
};