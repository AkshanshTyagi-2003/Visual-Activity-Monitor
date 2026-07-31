import { prisma } from '../lib/prisma';

export interface CreateActivityInput {
  userId: string;
  url: string;
  title: string;
  activeTime?: number; // in seconds
  timestamp?: string;
}

// Memory fallback store for activity logs
const memoryActivities: Array<{
  id: string;
  userId: string;
  url: string;
  title: string;
  activeTime: number;
  timestamp: Date;
  createdAt: Date;
}> = [];

export class ActivityService {
  /**
   * Helper to extract domain from URL
   */
  private static extractDomain(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return url || 'unknown';
    }
  }

  /**
   * Log browser activity (tab switch, navigation, time update)
   */
  static async logActivity(data: CreateActivityInput) {
    const { userId, url, title, activeTime = 0, timestamp } = data;
    const eventTime = timestamp ? new Date(timestamp) : new Date();

    try {
      // Ensure user exists to satisfy foreign key constraints
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) {
        await prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@placeholder.local`,
            password: 'placeholder_password',
            name: 'User',
          },
        }).catch(() => {});
      }

      const activity = await prisma.activity.create({
        data: {
          userId,
          url,
          title: title || url,
          activeTime: Math.max(0, activeTime),
          timestamp: eventTime,
        },
      });

      return {
        id: activity.id,
        userId: activity.userId,
        url: activity.url,
        title: activity.title,
        activeTime: activity.activeTime,
        timestamp: activity.timestamp.toISOString(),
        createdAt: activity.createdAt.toISOString(),
      };
    } catch (err: any) {
      console.warn('Database error when logging activity, using memory store:', err.message);
      const newActivity = {
        id: 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        userId,
        url,
        title: title || url,
        activeTime: Math.max(0, activeTime),
        timestamp: eventTime,
        createdAt: new Date(),
      };
      memoryActivities.push(newActivity);

      return {
        id: newActivity.id,
        userId: newActivity.userId,
        url: newActivity.url,
        title: newActivity.title,
        activeTime: newActivity.activeTime,
        timestamp: newActivity.timestamp.toISOString(),
        createdAt: newActivity.createdAt.toISOString(),
      };
    }
  }

  /**
   * Get user activities timeline
   */
  static async getUserActivities(userId: string, limit = 50) {
    let dbActivities: Array<any> = [];
    try {
      dbActivities = await prisma.activity.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });
    } catch (err: any) {
      console.warn('Prisma activity lookup failed, fetching from memory:', err.message);
    }

    const memActivities = memoryActivities
      .filter((a) => a.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (dbActivities.length === 0 && memActivities.length > 0) {
      return memActivities.slice(0, limit).map((a) => ({
        id: a.id,
        userId: a.userId,
        url: a.url,
        title: a.title,
        activeTime: a.activeTime,
        timestamp: a.timestamp.toISOString(),
        createdAt: a.createdAt.toISOString(),
      }));
    }

    return dbActivities.map((a) => ({
      id: a.id,
      userId: a.userId,
      url: a.url,
      title: a.title,
      activeTime: a.activeTime,
      timestamp: a.timestamp.toISOString(),
      createdAt: a.createdAt.toISOString(),
    }));
  }

  /**
   * Calculate aggregated dashboard statistics
   */
  static async getActivityStats(userId: string) {
    let activitiesList: Array<{ url: string; title: string; activeTime: number; timestamp: Date }> = [];

    try {
      const dbActivities = await prisma.activity.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
      });
      activitiesList = dbActivities.map((a) => ({
        url: a.url,
        title: a.title,
        activeTime: a.activeTime,
        timestamp: a.timestamp,
      }));
    } catch (err: any) {
      console.warn('Prisma stats error, calculating from memory store:', err.message);
    }

    const memActivities = memoryActivities.filter((a) => a.userId === userId);
    if (memActivities.length > 0) {
      activitiesList = [...activitiesList, ...memActivities];
    }

    const totalActivities = activitiesList.length;
    let totalActiveTimeSeconds = 0;
    const domainMap = new Map<string, { count: number; totalTimeSeconds: number }>();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    let todayActivityCount = 0;

    for (const item of activitiesList) {
      totalActiveTimeSeconds += item.activeTime;

      if (new Date(item.timestamp) >= startOfToday) {
        todayActivityCount++;
      }

      const domain = this.extractDomain(item.url);
      const existing = domainMap.get(domain) || { count: 0, totalTimeSeconds: 0 };
      domainMap.set(domain, {
        count: existing.count + 1,
        totalTimeSeconds: existing.totalTimeSeconds + item.activeTime,
      });
    }

    const mostVisitedWebsites = Array.from(domainMap.entries())
      .map(([domain, data]) => ({
        domain,
        count: data.count,
        totalTimeSeconds: data.totalTimeSeconds,
      }))
      .sort((a, b) => b.totalTimeSeconds - a.totalTimeSeconds || b.count - a.count)
      .slice(0, 5);

    return {
      totalActivities,
      totalActiveTimeSeconds,
      todayActivityCount,
      mostVisitedWebsites,
    };
  }
}
