import { prisma } from '../lib/prisma';
import { uploadScreenshotToStorage } from '../lib/supabase';

export interface CreateScreenshotInput {
  userId: string;
  imageData: string; // base64 string or image URL
  pageUrl: string;
  pageTitle: string;
  timestamp?: string;
}

// Memory fallback store for screenshot logs
const memoryScreenshots: Array<{
  id: string;
  userId: string;
  imageUrl: string;
  pageUrl: string;
  pageTitle: string;
  timestamp: Date;
  createdAt: Date;
}> = [];

export class ScreenshotService {
  /**
   * Save screenshot image to storage and record metadata in database
   */
  static async createScreenshot(data: CreateScreenshotInput) {
    const { userId, imageData, pageUrl, pageTitle, timestamp } = data;
    const eventTime = timestamp ? new Date(timestamp) : new Date();

    // 1. Upload to Supabase Storage bucket or generate fallback URL
    const imageUrl = await uploadScreenshotToStorage(
      imageData,
      userId,
      `screenshot_${Date.now()}.png`
    );

    // 2. Store metadata in database via Prisma
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

      const screenshot = await prisma.screenshot.create({
        data: {
          userId,
          imageUrl,
          pageUrl,
          pageTitle: pageTitle || pageUrl,
          timestamp: eventTime,
        },
      });

      return {
        id: screenshot.id,
        userId: screenshot.userId,
        imageUrl: screenshot.imageUrl,
        pageUrl: screenshot.pageUrl,
        pageTitle: screenshot.pageTitle,
        timestamp: screenshot.timestamp.toISOString(),
        createdAt: screenshot.createdAt.toISOString(),
      };
    } catch (err: any) {
      console.warn('Database error saving screenshot, using in-memory store:', err.message);

      const newScreenshot = {
        id: 'scr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        userId,
        imageUrl,
        pageUrl,
        pageTitle: pageTitle || pageUrl,
        timestamp: eventTime,
        createdAt: new Date(),
      };
      memoryScreenshots.push(newScreenshot);

      return {
        id: newScreenshot.id,
        userId: newScreenshot.userId,
        imageUrl: newScreenshot.imageUrl,
        pageUrl: newScreenshot.pageUrl,
        pageTitle: newScreenshot.pageTitle,
        timestamp: newScreenshot.timestamp.toISOString(),
        createdAt: newScreenshot.createdAt.toISOString(),
      };
    }
  }

  /**
   * Retrieve screenshots list for a user
   */
  static async getUserScreenshots(userId: string, limit = 20) {
    let screenshots: Array<any> = [];
    try {
      screenshots = await prisma.screenshot.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });
    } catch (err: any) {
      console.warn('Prisma screenshot fetch failed, reading memory store:', err.message);
    }

    const memScreenshots = memoryScreenshots
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (screenshots.length === 0 && memScreenshots.length > 0) {
      return memScreenshots.slice(0, limit).map((s) => ({
        id: s.id,
        userId: s.userId,
        imageUrl: s.imageUrl,
        pageUrl: s.pageUrl,
        pageTitle: s.pageTitle,
        timestamp: s.timestamp.toISOString(),
        createdAt: s.createdAt.toISOString(),
      }));
    }

    return screenshots.map((s) => ({
      id: s.id,
      userId: s.userId,
      imageUrl: s.imageUrl,
      pageUrl: s.pageUrl,
      pageTitle: s.pageTitle,
      timestamp: s.timestamp.toISOString(),
      createdAt: s.createdAt.toISOString(),
    }));
  }

  /**
   * Get total count of captured screenshots for a user
   */
  static async getScreenshotCount(userId: string): Promise<number> {
    let dbCount = 0;
    try {
      dbCount = await prisma.screenshot.count({ where: { userId } });
    } catch {
      // ignore
    }
    const memCount = memoryScreenshots.filter((s) => s.userId === userId).length;
    return Math.max(dbCount, memCount);
  }
}
