import { useState }    from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Send } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore }  from '@/store/auth.store.js';
import { Button }        from '@/components/ui/Button.jsx';
import { scaleIn, slideUp } from '@/lib/motion.js';
import { cn }            from '@/lib/utils.js';
import api               from '@/lib/axios.js';

const FIELDS = [
  { key: 'mainStory',     label: 'Main story',    placeholder: 'e.g. 30' },
  { key: 'sideContent',   label: 'Main + sides',  placeholder: 'e.g. 50' },
  { key: 'completionist', label: 'Completionist', placeholder: 'e.g. 80' },
];

const PLATFORMS = [
  'PC', 'PlayStation 5', 'PlayStation 4',
  'Xbox Series X|S', 'Xbox One', 'Nintendo Switch', 'Other',
];

export const PlaytimeSubmitForm = ({ game }) => {
  const { firebaseUser }  = useAuthStore();
  const queryClient       = useQueryClient();

  const [form, setForm] = useState({
    mainStory: '', sideContent: '', completionist: '', platform: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');

  const { mutate, isLoading } = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(
        `/games/${game.igdbId}/playtime`, payload
      );
      return data;
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries(['gameStats', game.igdbId]);
    },
    onError: (err) => setError(err.message),
  });

  const set = (k) => (e) => {
    setError('');
    setForm((p) => ({ ...p, [k]: e.target.value }));
  };

  const handleSubmit = () => {
    const anyFilled = FIELDS.some((f) => form[f.key] !== '');
    if (!anyFilled) {
      setError('Enter at least one completion time.');
      return;
    }

    const payload = {
      platform: form.platform || null,
      ...Object.fromEntries(
        FIELDS.map(({ key }) => [
          key,
          form[key] !== '' ? parseFloat(form[key]) : null,
        ])
      ),
    };
    mutate(payload);
  };

  if (!firebaseUser) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm text-[var(--color-subtle)]">
          <a href="/auth/login"
             className="text-foreground hover:underline underline-offset-4">
            Sign in
          </a>{' '}
          to submit your completion time.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h5 className="text-foreground mb-1">Submit your time</h5>
      <p className="text-xs text-[var(--color-subtle)] mb-6">
        All fields are optional — fill in what you completed.
      </p>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            {...scaleIn}
            className="flex flex-col items-center gap-3 py-8"
          >
            <CheckCircle2 size={28} className="text-emerald-400" />
            <p className="text-sm text-foreground font-medium">
              Time submitted — thanks!
            </p>
            <p className="text-xs text-[var(--color-subtle)]">
              Stats will update shortly.
            </p>
            <button
              onClick={() => { setSubmitted(false); setForm({ mainStory:'', sideContent:'', completionist:'', platform:'' }); }}
              className="text-xs text-[var(--color-subtle)]
                         hover:text-foreground transition-colors mt-2"
            >
              Submit another
            </button>
          </motion.div>
        ) : (
          <motion.div key="form" {...slideUp}
            className="flex flex-col gap-5"
          >
            {/* Time fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {FIELDS.map(({ key, label, placeholder }) => (
                <HoursField
                  key={key}
                  label={label}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={set(key)}
                />
              ))}
            </div>

            {/* Platform select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium
                                text-[var(--color-secondary)]
                                uppercase tracking-widest font-mono">
                Platform
              </label>
              <select
                value={form.platform}
                onChange={set('platform')}
                className="input-base text-[var(--color-secondary)]"
              >
                <option value="">Select platform…</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p {...slideUp}
                  className="text-xs text-red-400 font-mono"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <Button
              loading={isLoading}
              onClick={handleSubmit}
              className="gap-2 self-start"
            >
              <Send size={13} />
              Submit time
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Hours input field ──────────────────────────────────────────────────────
const HoursField = ({ label, placeholder, value, onChange }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[var(--color-secondary)]
                        uppercase tracking-widest font-mono">
        {label}
      </label>
      <div className={cn(
        'relative flex items-center rounded',
        'border transition-colors duration-150',
        focused
          ? 'border-[var(--color-subtle)]'
          : 'border-[var(--color-border)] hover:border-[var(--color-border-2)]'
      )}>
        <input
          type="number"
          min="0.1"
          max="9999"
          step="0.5"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-[var(--color-surface)] text-foreground
                     px-3 py-2.5 text-sm outline-none font-mono
                     rounded placeholder:text-[var(--color-muted)]
                     [appearance:textfield]
                     [&::-webkit-outer-spin-button]:appearance-none
                     [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="pr-3 text-xs text-[var(--color-muted)]
                         font-mono shrink-0">
          hrs
        </span>
      </div>
    </div>
  );
};