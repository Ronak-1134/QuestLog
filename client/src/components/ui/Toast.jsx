import { useEffect }         from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboard.store.js';

export const ToastContainer = () => {
  const { notifications, dismissNotification } = useDashboardStore();

  return (
    <div className="fixed bottom-5 right-5 z-[9999]
                    flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <Toast key={n.id} notification={n} onDismiss={dismissNotification} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const Toast = ({ notification, onDismiss }) => {
  const { id, type = 'success', message } = notification;

  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 4000);
    return () => clearTimeout(t);
  }, [id, onDismiss]);

  const Icon = type === 'error' ? XCircle : CheckCircle2;
  const iconColor = type === 'error' ? 'text-red-400' : 'text-emerald-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{    opacity: 0, y: 4, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-auto flex items-center gap-3
                 bg-[var(--color-surface)] border border-[var(--color-border-2)]
                 rounded px-4 py-3 shadow-xl shadow-black/40
                 min-w-[240px] max-w-sm"
    >
      <Icon size={14} className={`${iconColor} shrink-0`} />
      <p className="text-sm text-[var(--color-secondary)] flex-1">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="text-[var(--color-muted)] hover:text-foreground
                   transition-colors shrink-0"
      >
        <X size={12} />
      </button>
    </motion.div>
  );
};