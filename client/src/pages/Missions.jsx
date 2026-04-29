import { useState }      from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Plus, CheckCircle2,
         Clock, Target, Trash2 }   from 'lucide-react';
import { Shell }         from '@/components/layout/Shell.jsx';
import { Container }     from '@/components/layout/Container.jsx';
import { Button }        from '@/components/ui/Button.jsx';
import { useAuthStore }  from '@/store/auth.store.js';
import { staggerContainer, staggerItem, slideUp, scaleIn } from '@/lib/motion.js';

const MISSION_TYPES = [
  { value: 'main',       label: 'Main Quest',     color: '#f4f4f5' },
  { value: 'side',       label: 'Side Quest',     color: '#a1a1aa' },
  { value: 'challenge',  label: 'Challenge',      color: '#6b6b6b' },
  { value: 'achievement',label: 'Achievement',    color: '#3f3f3f' },
];

export default function Missions() {
  const { firebaseUser } = useAuthStore();
  const [missions, setMissions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter]     = useState('all');
  const [form, setForm]         = useState({
    title: '', game: '', type: 'main',
    description: '', targetHours: '',
  });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleAdd = () => {
    if (!form.title.trim() || !form.game.trim()) return;

    const mission = {
      id:           Date.now(),
      title:        form.title,
      game:         form.game,
      type:         form.type,
      description:  form.description,
      targetHours:  form.targetHours ? Number(form.targetHours) : null,
      loggedHours:  0,
      completed:    false,
      createdAt:    new Date().toISOString(),
    };

    setMissions((p) => [mission, ...p]);
    setForm({ title: '', game: '', type: 'main', description: '', targetHours: '' });
    setShowForm(false);
  };

  const toggleComplete = (id) => {
    setMissions((p) =>
      p.map((m) => m.id === id ? { ...m, completed: !m.completed } : m)
    );
  };

  const deleteMission = (id) => {
    setMissions((p) => p.filter((m) => m.id !== id));
  };

  const logHours = (id, hours) => {
    setMissions((p) =>
      p.map((m) => m.id === id
        ? { ...m, loggedHours: Math.round((m.loggedHours + hours) * 10) / 10 }
        : m
      )
    );
  };

  const filtered = filter === 'all'       ? missions
    : filter === 'active'                 ? missions.filter((m) => !m.completed)
    : filter === 'completed'              ? missions.filter((m) => m.completed)
    : missions.filter((m) => m.type === filter);

  const completedCount = missions.filter((m) => m.completed).length;

  if (!firebaseUser) {
    return (
      <Shell>
        <Container className="py-24 text-center">
          <p className="text-[var(--color-subtle)]">
            <a href="/auth/login" className="text-foreground hover:underline">
              Sign in
            </a>{' '}to track your missions.
          </p>
        </Container>
      </Shell>
    );
  }

  return (
    <Shell>
      <Container size="lg" className="py-10 md:py-14">

        {/* Header */}
        <motion.div
          variants={staggerContainer(0.07)}
          initial="initial"
          animate="animate"
          className="mb-10"
        >
          <motion.div variants={staggerItem}
            className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Trophy size={20} className="text-[var(--color-subtle)]" />
              <h2 className="text-foreground">Missions</h2>
            </div>
            <Button onClick={() => setShowForm((p) => !p)} className="gap-2">
              <Plus size={14} />
              New Mission
            </Button>
          </motion.div>

          <motion.p variants={staggerItem}
            className="text-sm text-[var(--color-subtle)]">
            {completedCount} of {missions.length} missions completed
          </motion.p>

          {/* Progress bar */}
          {missions.length > 0 && (
            <motion.div variants={staggerItem} className="mt-3">
              <div className="h-1 bg-[var(--color-border)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-foreground rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${missions.length ? (completedCount / missions.length) * 100 : 0}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Add mission form */}
        <AnimatePresence>
          {showForm && (
            <motion.div {...scaleIn} className="card p-6 mb-8">
              <h5 className="text-foreground mb-5">Add New Mission</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="stat-label block mb-1.5">Mission Title *</label>
                  <input
                    value={form.title}
                    onChange={set('title')}
                    placeholder="e.g. Finish the main story"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="stat-label block mb-1.5">Game *</label>
                  <input
                    value={form.game}
                    onChange={set('game')}
                    placeholder="e.g. Elden Ring"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="stat-label block mb-1.5">Type</label>
                  <select
                    value={form.type}
                    onChange={set('type')}
                    className="input-base"
                  >
                    {MISSION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="stat-label block mb-1.5">Target Hours</label>
                  <input
                    type="number"
                    value={form.targetHours}
                    onChange={set('targetHours')}
                    placeholder="e.g. 50"
                    className="input-base"
                    min="0"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="stat-label block mb-1.5">Description</label>
                  <input
                    value={form.description}
                    onChange={set('description')}
                    placeholder="What do you want to achieve?"
                    className="input-base"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleAdd} className="gap-2">
                  <Plus size={14} />
                  Add Mission
                </Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-6 flex-wrap">
          {[
            { v: 'all',       l: 'All' },
            { v: 'active',    l: 'Active' },
            { v: 'completed', l: 'Completed' },
            { v: 'main',      l: 'Main Quest' },
            { v: 'side',      l: 'Side Quest' },
            { v: 'challenge', l: 'Challenge' },
          ].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors
                ${filter === v
                  ? 'bg-[var(--color-surface-2)] text-foreground border border-[var(--color-border-2)]'
                  : 'text-[var(--color-subtle)] hover:text-foreground'
                }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Missions list */}
        {filtered.length === 0 ? (
          <motion.div {...slideUp}
            className="card p-12 text-center">
            <Target size={32} className="text-[var(--color-muted)] mx-auto mb-4" />
            <h5 className="text-foreground mb-2">No missions yet</h5>
            <p className="text-sm text-[var(--color-subtle)] mb-6">
              Create your first mission to start tracking your gaming goals.
            </p>
            <Button onClick={() => setShowForm(true)} className="gap-2 mx-auto">
              <Plus size={14} />
              Add your first mission
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer(0.05)}
            initial="initial"
            animate="animate"
            className="flex flex-col gap-3"
          >
            {filtered.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onToggle={() => toggleComplete(mission.id)}
                onDelete={() => deleteMission(mission.id)}
                onLogHours={(h) => logHours(mission.id, h)}
              />
            ))}
          </motion.div>
        )}
      </Container>
    </Shell>
  );
}

// ── Mission Card ────────────────────────────────────────────────────
const MissionCard = ({ mission, onToggle, onDelete, onLogHours }) => {
  const [logging, setLogging] = useState(false);
  const [hours,   setHours]   = useState('');

  const typeInfo = MISSION_TYPES.find((t) => t.value === mission.type);
  const progress = mission.targetHours
    ? Math.min(100, Math.round((mission.loggedHours / mission.targetHours) * 100))
    : null;

  const handleLog = () => {
    if (!hours || isNaN(hours)) return;
    onLogHours(Number(hours));
    setHours('');
    setLogging(false);
  };

  return (
    <motion.div
      variants={staggerItem}
      className={`card p-5 transition-opacity ${mission.completed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-4">
        {/* Complete toggle */}
        <button
          onClick={onToggle}
          className="mt-0.5 flex-shrink-0 transition-colors"
        >
          {mission.completed
            ? <CheckCircle2 size={18} className="text-emerald-400" />
            : <div className="w-[18px] h-[18px] rounded-full border
                              border-[var(--color-border-2)]
                              hover:border-foreground transition-colors" />
          }
        </button>

        <div className="flex-1 min-w-0">
          {/* Title + game */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <p className={`text-sm font-medium transition-all
                ${mission.completed
                  ? 'line-through text-[var(--color-muted)]'
                  : 'text-foreground'
                }`}>
                {mission.title}
              </p>
              <p className="text-xs text-[var(--color-subtle)] mt-0.5">
                {mission.game}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="tag" style={{ borderColor: `${typeInfo?.color}30`,
                                             color: typeInfo?.color }}>
                {typeInfo?.label}
              </span>
              <button
                onClick={onDelete}
                className="text-[var(--color-muted)] hover:text-red-400
                           transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Description */}
          {mission.description && (
            <p className="text-xs text-[var(--color-subtle)] mb-3">
              {mission.description}
            </p>
          )}

          {/* Hours + progress */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <Clock size={11} className="text-[var(--color-muted)]" />
              <span className="text-xs font-mono text-[var(--color-secondary)]">
                {mission.loggedHours}h
                {mission.targetHours ? ` / ${mission.targetHours}h` : ' logged'}
              </span>
            </div>
            {progress !== null && (
              <span className="text-xs font-mono text-[var(--color-subtle)]">
                {progress}%
              </span>
            )}
          </div>

          {/* Progress bar */}
          {progress !== null && (
            <div className="h-0.5 bg-[var(--color-border)] rounded-full
                            overflow-hidden mb-3">
              <motion.div
                className="h-full bg-foreground rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          )}

          {/* Log hours */}
          {!mission.completed && (
            <AnimatePresence>
              {logging ? (
                <motion.div {...scaleIn}
                  className="flex items-center gap-2">
                  <input
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="hrs"
                    className="input-base py-1.5 text-xs w-20"
                    min="0"
                    step="0.5"
                    autoFocus
                  />
                  <Button onClick={handleLog} size="sm" className="py-1.5 text-xs">
                    Log
                  </Button>
                  <Button variant="ghost" size="sm"
                    onClick={() => setLogging(false)}
                    className="py-1.5 text-xs">
                    Cancel
                  </Button>
                </motion.div>
              ) : (
                <button
                  onClick={() => setLogging(true)}
                  className="text-xs text-[var(--color-subtle)]
                             hover:text-foreground transition-colors
                             font-mono underline underline-offset-4"
                >
                  + Log hours
                </button>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
};