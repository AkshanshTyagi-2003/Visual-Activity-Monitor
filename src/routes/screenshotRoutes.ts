import { Router } from 'express';
import { ScreenshotController } from '../controllers/screenshotController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/upload', ScreenshotController.uploadScreenshot);
router.get('/', ScreenshotController.getScreenshots);

export default router;
