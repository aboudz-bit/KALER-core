import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { createAlertSchema, respondToAlertSchema } from '@kaler/shared';
import * as alertService from '../services/alert.service';

const router = Router();

router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activeOnly = req.query.active === 'true';
      const alerts = await alertService.getAllAlerts(activeOnly);
      res.json({ success: true, data: alerts });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/emergency-state',
  authenticate,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const state = await alertService.getEmergencyState();
      res.json({ success: true, data: state });
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
      const alert = await alertService.getAlertById(req.params.id);
      res.json({ success: true, data: alert });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/:id/receipts',
  authenticate,
  authorize('admin', 'eco', 'supervisor'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const receipts = await alertService.getAlertReceipts(req.params.id);
      res.json({ success: true, data: receipts });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  authenticate,
  authorize('admin', 'eco'),
  validate(createAlertSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await alertService.createAlert(req.body, req.user!.id);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:id/deactivate',
  authenticate,
  authorize('admin', 'eco'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const alert = await alertService.deactivateAlert(req.params.id);
      res.json({ success: true, data: alert });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:id/confirm',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const receipt = await alertService.confirmReceipt(
        req.params.id,
        req.user!.id
      );
      res.json({ success: true, data: receipt });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/:id/respond',
  authenticate,
  validate(respondToAlertSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const receipt = await alertService.respondToAlert(
        req.params.id,
        req.user!.id,
        req.body.response
      );
      res.json({ success: true, data: receipt });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
