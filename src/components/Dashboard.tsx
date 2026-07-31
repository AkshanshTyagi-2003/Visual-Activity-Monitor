import React from 'react';
import { User, Activity, Screenshot, DashboardStats } from '../types';
import { StatCard } from './StatCard';
import { ActivityTimeline } from './ActivityTimeline';
import { ScreenshotGallery } from './ScreenshotGallery';
import { MostVisitedSection } from './MostVisitedSection';

interface DashboardProps {
  user: User;
  stats: DashboardStats | null;
  activities: Activity[];
  screenshots: Screenshot[];
  totalScreenshots: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  activities,
  screenshots,
  totalScreenshots,
}) => {
  const formatTotalTime = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const topDomainName = stats?.mostVisitedWebsites?.[0]?.domain || 'N/A';

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Activity"
          value={stats?.todayActivityCount ?? 0}
          subtitle="Tab visits recorded today"
          type="activity"
        />
        <StatCard
          title="Total Active Time"
          value={formatTotalTime(stats?.totalActiveTimeSeconds ?? 0)}
          subtitle="Cumulative focus time"
          type="time"
        />
        <StatCard
          title="Most Visited Website"
          value={topDomainName}
          subtitle={stats?.mostVisitedWebsites?.[0] ? `${formatTotalTime(stats.mostVisitedWebsites[0].totalTimeSeconds)} active` : 'No data yet'}
          type="domain"
        />
        <StatCard
          title="Total Screenshots"
          value={totalScreenshots ?? 0}
          subtitle="15s automated visual logs"
          type="screenshots"
        />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ActivityTimeline activities={activities} />
        </div>

        <div className="space-y-6">
          <MostVisitedSection
            domains={stats?.mostVisitedWebsites || []}
            totalActiveSeconds={stats?.totalActiveTimeSeconds || 0}
          />
        </div>
      </div>

      {/* Screenshot Gallery Section */}
      <div className="pt-2">
        <ScreenshotGallery screenshots={screenshots} totalCount={totalScreenshots} />
      </div>
    </div>
  );
};
