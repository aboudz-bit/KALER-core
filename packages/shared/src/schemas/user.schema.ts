import { z } from 'zod';
import { ROLES, AFFILIATIONS } from '../constants/roles';
import { RESPONSE_STATUSES } from '../constants/alert-types';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  badgeNumber: z.string().min(1, 'Badge number is required').max(20),
  email: z.string().email('Invalid email').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(ROLES).default('user'),
  affiliation: z.enum(AFFILIATIONS),
  company: z.string().max(100).optional(),
  zoneId: z.string().uuid().nullable().optional(),
  locationId: z.string().uuid().nullable().optional(),
  ecoSlot: z.string().max(50).nullable().optional(),
});

export const updateUserSchema = createUserSchema
  .omit({ password: true })
  .partial();

export const loginSchema = z.object({
  badgeNumber: z.string().min(1, 'Badge number is required'),
  password: z.string().min(1, 'Password is required'),
});

export const updateGPSSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const userSchema = createUserSchema.omit({ password: true }).extend({
  id: z.string().uuid(),
  currentLatitude: z.number().nullable().optional(),
  currentLongitude: z.number().nullable().optional(),
  responseStatus: z.enum(RESPONSE_STATUSES).default('no_reply'),
  lastGPSUpdate: z.string().datetime().nullable().optional(),
  isOnline: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateGPSInput = z.infer<typeof updateGPSSchema>;
export type User = z.infer<typeof userSchema>;
