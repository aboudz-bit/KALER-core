import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { locations, zones } from '../db/schema';
import { AppError } from '../middleware/error-handler';
import type { CreateLocationInput, UpdateLocationInput } from '@kaler/shared';

export async function getAllLocations() {
  return db.select().from(locations).orderBy(locations.name);
}

export async function getLocationsByZone(zoneId: string) {
  return db
    .select()
    .from(locations)
    .where(eq(locations.zoneId, zoneId))
    .orderBy(locations.name);
}

export async function getLocationById(id: string) {
  const [location] = await db
    .select()
    .from(locations)
    .where(eq(locations.id, id))
    .limit(1);
  if (!location) throw new AppError(404, 'Location not found');
  return location;
}

export async function createLocation(input: CreateLocationInput) {
  // Verify zone exists
  const [zone] = await db
    .select()
    .from(zones)
    .where(eq(zones.id, input.zoneId))
    .limit(1);
  if (!zone) throw new AppError(404, 'Zone not found');

  const [location] = await db
    .insert(locations)
    .values({
      name: input.name,
      description: input.description,
      zoneId: input.zoneId,
      latitude: input.coordinates.latitude,
      longitude: input.coordinates.longitude,
      type: input.type,
      isActive: input.isActive,
    })
    .returning();

  return location;
}

export async function updateLocation(id: string, input: UpdateLocationInput) {
  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.zoneId !== undefined) updateData.zoneId = input.zoneId;
  if (input.coordinates !== undefined) {
    updateData.latitude = input.coordinates.latitude;
    updateData.longitude = input.coordinates.longitude;
  }
  if (input.type !== undefined) updateData.type = input.type;
  if (input.isActive !== undefined) updateData.isActive = input.isActive;

  const [location] = await db
    .update(locations)
    .set(updateData)
    .where(eq(locations.id, id))
    .returning();

  if (!location) throw new AppError(404, 'Location not found');
  return location;
}

export async function deleteLocation(id: string) {
  const [location] = await db
    .delete(locations)
    .where(eq(locations.id, id))
    .returning();

  if (!location) throw new AppError(404, 'Location not found');
  return location;
}
