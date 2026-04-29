import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import { AuthGuard }      from './components/auth/AuthGuard.jsx';
import { Loader }         from './components/ui/Loader.jsx';
import { ToastContainer } from './components/ui/Toast.jsx';
import { useAuthStore }   from './store/auth.store.js';

const Landing   = lazy(() => import('./pages/Landing.jsx'));
const Login     = lazy(() => import('./pages/auth/Login.jsx'));
const Register  = lazy(() => import('./pages/auth/Register.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Search    = lazy(() => import('./pages/Search.jsx'));
const Game      = lazy(() => import('./pages/Game.jsx'));
const Profile   = lazy(() => import('./pages/Profile.jsx'));
const Missions  = lazy(() => import('./pages/Missions.jsx'));

export default function App() {
  const { isLoading, isHydrated } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t); }, []);
  useEffect(() => { if (isHydrated && !isLoading) setReady(true); }, [isHydrated, isLoading]);

  if (!ready) return <Loader fullscreen />;

  return (
    <>
      <Suspense fallback={<Loader fullscreen />}>
        <Routes>
          <Route path="/"              element={<Landing />} />
          <Route path="/auth/login"    element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/search"        element={<Search />} />
          <Route path="/games/:slug"   element={<Game />} />

          <Route path="/dashboard"         element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/profile/:username" element={<AuthGuard><Profile /></AuthGuard>} />
          <Route path="/missions"          element={<AuthGuard><Missions /></AuthGuard>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </>
  );
}