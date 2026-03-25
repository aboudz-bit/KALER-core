import { Router } from 'express';
import authRoutes from './auth.routes';
import zonesRoutes from './zones.routes';
import locationsRoutes from './locations.routes';
import usersRoutes from './users.routes';
import alertsRoutes from './alerts.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/zones', zonesRoutes);
router.use('/locations', locationsRoutes);
router.use('/users', usersRoutes);
router.use('/alerts', alertsRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
