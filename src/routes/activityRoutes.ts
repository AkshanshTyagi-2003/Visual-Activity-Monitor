import { Router } from 'express';
import { ActivityController } from '../controllers/activityController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/log', ActivityController.logActivity);
router.get('/', ActivityController.getActivities);
router.get('/stats', ActivityController.getStats);

export default router;
