import React, { useState } from 'react';
import { Activity, ShieldCheck, ArrowRight } from 'lucide-react';

interface AuthFormProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (email: string, pass: string, name?: string) => Promise<void>;
  error?: string | null;
  isLoading: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  onLogin,
  onRegister,
  error,
  isLoading,
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Demo User');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      await onRegister(email, password, name);
    } else {
      await onLogin(email, password);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-blue-400 mb-3">
            <Activity className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Visual Activity Monitor</h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRegistering ? 'Create a new account to begin tracking' : 'Sign in to access your activity dashboard'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              'Processing...'
            ) : (
              <>
                {isRegistering ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>

        <div className="mt-6 p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
          <span>Quick Demo Creds prefilled for instant testing.</span>
        </div>
      </div>
    </div>
  );
};
