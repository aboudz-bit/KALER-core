import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { loginSchema, createUserSchema } from '@kaler/shared';
import * as authService from '../services/auth.service';

const router = Router();

router.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(
        req.body.badgeNumber,
        req.body.password
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/register',
  authenticate,
  authorize('admin'),
  validate(createUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/profile',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.getProfile(req.user!.id);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
