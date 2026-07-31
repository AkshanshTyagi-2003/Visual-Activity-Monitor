import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { ScreenshotService } from '../services/screenshotService';

export class ScreenshotController {
  /**
   * Upload screenshot and save metadata
   */
  static async uploadScreenshot(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { imageData, pageUrl, pageTitle, timestamp } = req.body;
      if (!imageData || !pageUrl) {
        res.status(400).json({ error: 'imageData and pageUrl are required' });
        return;
      }

      const screenshot = await ScreenshotService.createScreenshot({
        userId,
        imageData,
        pageUrl,
        pageTitle: pageTitle || pageUrl,
        timestamp,
      });

      res.status(201).json({ screenshot });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get list of screenshots for authenticated user
   */
  static async getScreenshots(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const limit = Number(req.query.limit) || 20;
      const screenshots = await ScreenshotService.getUserScreenshots(userId, limit);
      const totalScreenshots = await ScreenshotService.getScreenshotCount(userId);

      res.status(200).json({ screenshots, totalScreenshots });
    } catch (err) {
      next(err);
    }
  }
}
