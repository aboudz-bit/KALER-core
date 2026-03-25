import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { createLocationSchema, updateLocationSchema } from '@kaler/shared';
import * as locationService from '../services/location.service';

const router = Router();

router.get(
  '/',
  authenticate,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const locations = await locationService.getAllLocations();
      res.json({ success: true, data: locations });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/zone/:zoneId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const locations = await locationService.getLocationsByZone(
        req.params.zoneId
      );
      res.json({ success: true, data: locations });
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
      const location = await locationService.getLocationById(req.params.id);
      res.json({ success: true, data: location });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  authenticate,
  authorize('admin', 'eco', 'supervisor'),
  validate(createLocationSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const location = await locationService.createLocation(req.body);
      res.status(201).json({ success: true, data: location });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'eco', 'supervisor'),
  validate(updateLocationSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const location = await locationService.updateLocation(
        req.params.id,
        req.body
      );
      res.json({ success: true, data: location });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await locationService.deleteLocation(req.params.id);
      res.json({ success: true, message: 'Location deleted' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
