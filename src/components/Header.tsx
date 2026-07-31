import React from 'react';
import { User } from '../types';
import { Activity, RefreshCw, Key, LogOut, Shield } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onRefresh: () => void;
  onOpenExtensionModal: () => void;
  onLogout: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onRefresh,
  onOpenExtensionModal,
  onLogout,
  isRefreshing,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight">
              Visual Activity Monitor
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">Automated Chrome Extension & PostgreSQL Analytics</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={onOpenExtensionModal}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Extension Setup</span>
          </button>

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-medium text-slate-200">{user.name || user.email}</span>
                <span className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                  <Shield className="w-3 h-3 text-emerald-400" /> Authenticated
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 bg-slate-800/80 hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-lg border border-slate-700/80 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
