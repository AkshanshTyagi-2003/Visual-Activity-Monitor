import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;
      const result = await AuthService.register(email, password, name);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const user = await AuthService.getUserById(req.user.userId, req.user.email);
      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  }
}
