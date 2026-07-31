import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { ActivityService } from '../services/activityService';

export class ActivityController {
  /**
   * Log an activity entry (from Chrome extension or dashboard)
   */
  static async logActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { url, title, activeTime, timestamp } = req.body;
      if (!url) {
        res.status(400).json({ error: 'Page URL is required' });
        return;
      }

      const activity = await ActivityService.logActivity({
        userId,
        url,
        title: title || url,
        activeTime: Number(activeTime) || 0,
        timestamp,
      });

      res.status(201).json({ activity });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get recent activity timeline for user
   */
  static async getActivities(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const limit = Number(req.query.limit) || 50;
      const activities = await ActivityService.getUserActivities(userId, limit);

      res.status(200).json({ activities });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get aggregated activity statistics
   */
  static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const stats = await ActivityService.getActivityStats(userId);
      res.status(200).json({ stats });
    } catch (err) {
      next(err);
    }
  }
}
