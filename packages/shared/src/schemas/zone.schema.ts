import { z } from 'zod';

export const coordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const polygonSchema = z
  .array(coordinateSchema)
  .min(3, 'A polygon requires at least 3 points');

export const createZoneSchema = z.object({
  name: z.string().min(1, 'Zone name is required').max(100),
  description: z.string().max(500).optional(),
  polygon: polygonSchema,
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color')
    .optional()
    .default('#3B82F6'),
  isActive: z.boolean().optional().default(true),
});

export const updateZoneSchema = createZoneSchema.partial();

export const zoneSchema = createZoneSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Coordinate = z.infer<typeof coordinateSchema>;
export type Polygon = z.infer<typeof polygonSchema>;
export type CreateZoneInput = z.infer<typeof createZoneSchema>;
export type UpdateZoneInput = z.infer<typeof updateZoneSchema>;
export type Zone = z.infer<typeof zoneSchema>;
