import { z } from 'zod';
import { coordinateSchema } from './zone.schema';

export const createLocationSchema = z.object({
  name: z.string().min(1, 'Location name is required').max(100),
  description: z.string().max(500).optional(),
  zoneId: z.string().uuid('Location must belong to a zone'),
  coordinates: coordinateSchema,
  type: z
    .enum(['building', 'facility', 'checkpoint', 'shelter', 'other'])
    .optional()
    .default('other'),
  isActive: z.boolean().optional().default(true),
});

export const updateLocationSchema = createLocationSchema.partial();

export const locationSchema = createLocationSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type Location = z.infer<typeof locationSchema>;
