import { useEffect }     from 'react';
import { motion }        from 'framer-motion';
import { Shell }         from '@/components/layout/Shell.jsx';
import { Container }     from '@/components/layout/Container.jsx';
import { BentoGrid }     from '@/components/dashboard/BentoGrid.jsx';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader.jsx';
import { AuthGuard }     from '@/components/auth/AuthGuard.jsx';
import { useAuthStore }  from '@/store/auth.store.js';
import { useDashboardStore } from '@/store/dashboard.store.js';
import { fadeIn }        from '@/lib/motion.js';
import api               from '@/lib/axios.js';

export default function Dashboard() {
  const { user, setUser }  = useAuthStore();
  const { addNotification } = useDashboardStore();

  // Refresh user profile on mount to pick up any stat changes
  useEffect(() => {
    if (!user) return;
    api.get('/auth/me')
      .then(({ data }) => setUser(data.data))
      .catch(() => {});
  }, []);

  return (
    <AuthGuard>
      <Shell>
        <Container size="lg" className="py-10 md:py-14">
          <motion.div {...fadeIn}>
            <DashboardHeader />
            <BentoGrid />
          </motion.div>
        </Container>
      </Shell>
    </AuthGuard>
  );
}