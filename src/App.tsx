import { useState, useEffect, useCallback } from 'react';
import { User, Activity, Screenshot, DashboardStats } from './types';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AuthForm } from './components/AuthForm';
import { ExtensionTokenModal } from './components/ExtensionTokenModal';

export default function App() {
  const [token, setToken] = useState<string>(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [totalScreenshots, setTotalScreenshots] = useState<number>(0);

  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState<boolean>(false);

  const API_BASE = '/api';

  /**
   * Helper fetcher with Bearer auth token header
   */
  const authFetch = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      return res.json();
    },
    [token]
  );

  /**
   * Fetch current authenticated user profile
   */
  const fetchUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const data = await authFetch('/auth/me');
      setUser(data.user);
    } catch (err: any) {
      console.warn('Authentication token invalid or expired:', err.message);
      setToken('');
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token, authFetch]);

  /**
   * Load Dashboard Data (Stats, Activity Timeline, Screenshots)
   */
  const fetchDashboardData = useCallback(async () => {
    if (!token) return;

    setIsRefreshing(true);
    try {
      const [statsRes, activitiesRes, screenshotsRes] = await Promise.all([
        authFetch('/activity/stats'),
        authFetch('/activity?limit=50'),
        authFetch('/screenshots?limit=12'),
      ]);

      setStats(statsRes.stats);
      setActivities(activitiesRes.activities || []);
      setScreenshots(screenshotsRes.screenshots || []);
      setTotalScreenshots(screenshotsRes.totalScreenshots || 0);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err.message);
    } finally {
      setIsRefreshing(false);
    }
  }, [token, authFetch]);

  // Check auth on mount or token change
  useEffect(() => {
    fetchUser();
  }, [token, fetchUser]);

  // Load dashboard data whenever user is verified
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  /**
   * Handle user login
   */
  const handleLogin = async (email: string, pass: string) => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setToken(data.token);
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  /**
   * Handle user registration
   */
  const handleRegister = async (email: string, pass: string, name?: string) => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setToken(data.token);
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  /**
   * Handle Logout
   */
  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    setUser(null);
    setStats(null);
    setActivities([]);
    setScreenshots([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-500 selection:text-white">
      <Header
        user={user}
        onRefresh={fetchDashboardData}
        onOpenExtensionModal={() => setIsExtensionModalOpen(true)}
        onLogout={handleLogout}
        isRefreshing={isRefreshing}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          <AuthForm
            onLogin={handleLogin}
            onRegister={handleRegister}
            error={authError}
            isLoading={isLoadingAuth}
          />
        ) : (
          <Dashboard
            user={user}
            stats={stats}
            activities={activities}
            screenshots={screenshots}
            totalScreenshots={totalScreenshots}
          />
        )}
      </main>

      <ExtensionTokenModal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
        token={token || 'Sign in first to view JWT token'}
      />
    </div>
  );
}
