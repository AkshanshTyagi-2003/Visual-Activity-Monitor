import React from 'react';
import { Activity as ActivityType } from '../types';
import { ExternalLink, Clock, Globe } from 'lucide-react';

interface ActivityTimelineProps {
  activities: ActivityType[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url || 'unknown';
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <p className="text-sm">No activity logged yet.</p>
        <p className="text-xs text-slate-500 mt-1">Connect the Chrome extension to begin automated tracking.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-100">Activity Timeline</h3>
        <span className="text-xs text-slate-400">{activities.length} recent events</span>
      </div>

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {activities.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-800/80 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start gap-3 min-w-0 pr-3">
              <div className="p-2 bg-slate-800 rounded-md shrink-0 mt-0.5">
                <Globe className="w-4 h-4 text-blue-400" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-medium text-slate-200 truncate" title={item.title}>
                  {item.title || item.url}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-slate-400 hover:text-blue-400 flex items-center gap-1 truncate max-w-[240px]"
                  >
                    {extractDomain(item.url)}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0 text-right">
              <span className="text-xs text-slate-400 font-mono">{formatTimestamp(item.timestamp)}</span>
              {item.activeTime > 0 && (
                <span className="text-[11px] font-medium text-amber-400/90 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {formatTime(item.activeTime)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
