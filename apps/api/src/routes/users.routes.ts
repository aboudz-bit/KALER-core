import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { updateUserSchema, updateGPSSchema } from '@kaler/shared';
import * as userService from '../services/user.service';

const router = Router();

router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userService.getAllUsers({
        zoneId: req.query.zoneId as string,
        locationId: req.query.locationId as string,
        affiliation: req.query.affiliation as string,
        status: req.query.status as string,
        search: req.query.search as string,
        role: req.query.role as string,
      });
      res.json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'eco'),
  validate(updateUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/gps',
  authenticate,
  validate(updateGPSSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userService.updateGPS(req.user!.id, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/zone/:zoneId/gps',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userService.getUsersInZoneByGPS(req.params.zoneId);
      res.json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/reset-statuses',
  authenticate,
  authorize('admin', 'eco'),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      await userService.resetAllStatuses();
      res.json({ success: true, message: 'All statuses reset' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
