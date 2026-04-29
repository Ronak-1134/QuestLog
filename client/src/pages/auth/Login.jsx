import { useState }     from 'react';
import { Link }         from 'react-router-dom';
import { motion }       from 'framer-motion';
import { Github }       from 'lucide-react';
import { useAuth }      from '@/hooks/useAuth.js';
import { Input }        from '@/components/ui/Input.jsx';
import { Button }       from '@/components/ui/Button.jsx';
import { useAuthStore } from '@/store/auth.store.js';
import { staggerContainer, staggerItem, slideUp } from '@/lib/motion.js';

export default function Login() {
  const { loginEmail, loginGoogle, loginGithub } = useAuth();
  const { isLoading } = useAuthStore();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState({ email: false, google: false });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const attempt = async (key, fn) => {
  setError('');
  setLoading((p) => ({ ...p, [key]: true }));
  try {
    await fn();
  } catch (err) {
    setError(err.message);
    setLoading((p) => ({ ...p, [key]: false }));
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center
                    bg-background noise px-5">
      <div className="fixed inset-0 bg-grid bg-grid-fade
                      opacity-30 pointer-events-none" />

      <motion.div
        variants={staggerContainer(0.07, 0.05)}
        initial="initial"
        animate="animate"
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <motion.div variants={staggerItem} className="mb-10 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="w-7 h-7 rounded bg-foreground
                             flex items-center justify-center
                             text-background font-display font-bold text-xs">
              Q
            </span>
            <span className="font-display font-bold text-lg tracking-tight">
              QuestLog
            </span>
          </Link>
        </motion.div>

        <motion.div variants={staggerItem} className="mb-8 text-center">
          <h3 className="text-foreground mb-1">Welcome back</h3>
          <p className="text-[var(--color-subtle)] text-sm">
            Continue your quest.
          </p>
        </motion.div>

        {/* Google OAuth */}
        <motion.div variants={staggerItem} className="flex flex-col gap-2 mb-6">
          <Button
            variant="ghost"
            loading={loading.google}
            onClick={() => attempt('google', loginGoogle)}
            className="w-full gap-3"
          >
            <GoogleIcon />
            Continue with Google
          </Button>
        </motion.div>

        {/* Divider */}
        <motion.div variants={staggerItem}
          className="flex items-center gap-3 mb-6">
          <div className="divider" />
          <span className="text-xs text-[var(--color-muted)] font-mono
                           whitespace-nowrap">or email</span>
          <div className="divider" />
        </motion.div>

        {/* Email form */}
        <motion.div variants={staggerItem} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={set('password')}
            autoComplete="current-password"
          />

          {error && (
            <motion.p {...slideUp}
              className="text-xs text-red-400 font-mono">
              {error}
            </motion.p>
          )}

          <Button
            loading={loading.email}
            onClick={() => attempt('email', () => loginEmail(form))}
            className="w-full mt-1"
          >
            Sign in
          </Button>
        </motion.div>

        <motion.div variants={staggerItem}
          className="mt-8 text-center">
          <p className="text-xs text-[var(--color-subtle)]">
            No account?{' '}
            <Link to="/auth/register"
              className="text-[var(--color-secondary)]
                         hover:text-foreground transition-colors">
              Sign up free
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

const GoogleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);