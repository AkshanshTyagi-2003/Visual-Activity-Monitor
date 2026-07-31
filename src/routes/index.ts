import { Router } from 'express';
import authRoutes from './authRoutes';
import activityRoutes from './activityRoutes';
import screenshotRoutes from './screenshotRoutes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/activity', activityRoutes);
apiRouter.use('/screenshots', screenshotRoutes);

export default apiRouter;
