import { z } from 'zod';
import {
  ALERT_TYPES,
  ALERT_SEVERITIES,
  ALERT_PRIORITIES,
  EMERGENCY_MODES,
} from '../constants/alert-types';

export const createAlertSchema = z.object({
  title: z.string().min(1, 'Alert title is required').max(200),
  message: z.string().min(1, 'Alert message is required').max(2000),
  type: z.enum(ALERT_TYPES),
  severity: z.enum(ALERT_SEVERITIES).default('medium'),
  priority: z.enum(ALERT_PRIORITIES).default('normal'),
  isGlobal: z.boolean().default(false),
  zoneIds: z.array(z.string().uuid()).optional().default([]),
  emergencyMode: z.enum(EMERGENCY_MODES).nullable().optional(),
});

export const updateAlertSchema = createAlertSchema.partial();

export const alertSchema = createAlertSchema.extend({
  id: z.string().uuid(),
  isActive: z.boolean().default(true),
  createdBy: z.string().uuid(),
  activatedAt: z.string().datetime(),
  deactivatedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const alertReceiptSchema = z.object({
  id: z.string().uuid(),
  alertId: z.string().uuid(),
  userId: z.string().uuid(),
  receivedAt: z.string().datetime().nullable().optional(),
  confirmedAt: z.string().datetime().nullable().optional(),
  respondedAt: z.string().datetime().nullable().optional(),
  response: z.enum(['safe', 'need_help']).nullable().optional(),
  createdAt: z.string().datetime(),
});

export const respondToAlertSchema = z.object({
  response: z.enum(['safe', 'need_help']),
});

export const confirmReceiptSchema = z.object({
  alertId: z.string().uuid(),
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
export type Alert = z.infer<typeof alertSchema>;
export type AlertReceipt = z.infer<typeof alertReceiptSchema>;
export type RespondToAlertInput = z.infer<typeof respondToAlertSchema>;
export type ConfirmReceiptInput = z.infer<typeof confirmReceiptSchema>;
