import React from 'react';
import { Globe, Clock } from 'lucide-react';

interface DomainStat {
  domain: string;
  count: number;
  totalTimeSeconds: number;
}

interface MostVisitedSectionProps {
  domains: DomainStat[];
  totalActiveSeconds: number;
}

export const MostVisitedSection: React.FC<MostVisitedSectionProps> = ({ domains, totalActiveSeconds }) => {
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  };

  if (!domains || domains.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center text-slate-400">
        <p className="text-sm">No domain statistics available.</p>
      </div>
    );
  }

  const maxTime = Math.max(...domains.map((d) => d.totalTimeSeconds), 1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-100">Most Visited Websites</h3>
        <span className="text-xs text-slate-400">Time spent per website</span>
      </div>

      <div className="space-y-4">
        {domains.map((item, idx) => {
          const percentage = Math.round((item.totalTimeSeconds / maxTime) * 100);
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium text-slate-200">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.domain}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <span className="text-slate-500">{item.count} visits</span>
                  <span className="font-mono text-amber-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(item.totalTimeSeconds)}
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(percentage, 5)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
