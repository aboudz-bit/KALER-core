import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { createZoneSchema, updateZoneSchema } from '@kaler/shared';
import * as zoneService from '../services/zone.service';

const router = Router();

router.get(
  '/',
  authenticate,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const zones = await zoneService.getAllZones();
      res.json({ success: true, data: zones });
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
      const zone = await zoneService.getZoneById(req.params.id);
      res.json({ success: true, data: zone });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  authenticate,
  authorize('admin', 'eco'),
  validate(createZoneSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const zone = await zoneService.createZone(req.body);
      res.status(201).json({ success: true, data: zone });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'eco'),
  validate(updateZoneSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const zone = await zoneService.updateZone(req.params.id, req.body);
      res.json({ success: true, data: zone });
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
      await zoneService.deleteZone(req.params.id);
      res.json({ success: true, message: 'Zone deleted' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
