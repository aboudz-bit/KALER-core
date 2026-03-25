import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { zones } from '../db/schema';
import { AppError } from '../middleware/error-handler';
import type { CreateZoneInput, UpdateZoneInput } from '@kaler/shared';

export async function getAllZones() {
  return db.select().from(zones).orderBy(zones.name);
}

export async function getZoneById(id: string) {
  const [zone] = await db.select().from(zones).where(eq(zones.id, id)).limit(1);
  if (!zone) throw new AppError(404, 'Zone not found');
  return zone;
}

export async function createZone(input: CreateZoneInput) {
  const [zone] = await db.insert(zones).values(input).returning();
  return zone;
}

export async function updateZone(id: string, input: UpdateZoneInput) {
  const [zone] = await db
    .update(zones)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(zones.id, id))
    .returning();

  if (!zone) throw new AppError(404, 'Zone not found');
  return zone;
}

export async function deleteZone(id: string) {
  const [zone] = await db
    .delete(zones)
    .where(eq(zones.id, id))
    .returning();

  if (!zone) throw new AppError(404, 'Zone not found');
  return zone;
}
