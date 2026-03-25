import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import * as dashboardService from '../services/dashboard.service';

const router = Router();

router.get(
  '/stats',
  authenticate,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await dashboardService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
