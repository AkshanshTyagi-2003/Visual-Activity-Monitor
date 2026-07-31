import React from 'react';
import { Activity, Camera, Clock, Globe } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  type?: 'activity' | 'screenshots' | 'time' | 'domain';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, type = 'activity' }) => {
  const getIcon = () => {
    switch (type) {
      case 'activity':
        return <Activity className="w-5 h-5 text-blue-500" />;
      case 'screenshots':
        return <Camera className="w-5 h-5 text-emerald-500" />;
      case 'time':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'domain':
        return <Globe className="w-5 h-5 text-purple-500" />;
      default:
        return <Activity className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="p-2 bg-slate-800/60 rounded-lg">{getIcon()}</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-100 tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};
