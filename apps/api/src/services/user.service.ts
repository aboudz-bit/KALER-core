import { eq, and, ilike, inArray, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { users, zones } from '../db/schema';
import { AppError } from '../middleware/error-handler';
import type { UpdateUserInput, UpdateGPSInput } from '@kaler/shared';
import { isPointInPolygon } from '@kaler/shared';
import type { Coordinate } from '@kaler/shared';

export async function getAllUsers(filters?: {
  zoneId?: string;
  locationId?: string;
  affiliation?: string;
  status?: string;
  search?: string;
  role?: string;
}) {
  let query = db.select({
    id: users.id,
    name: users.name,
    badgeNumber: users.badgeNumber,
    email: users.email,
    role: users.role,
    affiliation: users.affiliation,
    company: users.company,
    zoneId: users.zoneId,
    locationId: users.locationId,
    ecoSlot: users.ecoSlot,
    currentLatitude: users.currentLatitude,
    currentLongitude: users.currentLongitude,
    responseStatus: users.responseStatus,
    lastGPSUpdate: users.lastGPSUpdate,
    isOnline: users.isOnline,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
  }).from(users).$dynamic();

  const conditions = [];

  if (filters?.zoneId) {
    conditions.push(eq(users.zoneId, filters.zoneId));
  }
  if (filters?.locationId) {
    conditions.push(eq(users.locationId, filters.locationId));
  }
  if (filters?.affiliation) {
    conditions.push(eq(users.affiliation, filters.affiliation as 'aramco' | 'contractor'));
  }
  if (filters?.status) {
    conditions.push(eq(users.responseStatus, filters.status as any));
  }
  if (filters?.role) {
    conditions.push(eq(users.role, filters.role as any));
  }
  if (filters?.search) {
    conditions.push(
      sql`(${users.name} ILIKE ${'%' + filters.search + '%'} OR ${users.badgeNumber} ILIKE ${'%' + filters.search + '%'})`
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return query.orderBy(users.name);
}

export async function getUserById(id: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      badgeNumber: users.badgeNumber,
      email: users.email,
      role: users.role,
      affiliation: users.affiliation,
      company: users.company,
      zoneId: users.zoneId,
      locationId: users.locationId,
      ecoSlot: users.ecoSlot,
      currentLatitude: users.currentLatitude,
      currentLongitude: users.currentLongitude,
      responseStatus: users.responseStatus,
      lastGPSUpdate: users.lastGPSUpdate,
      isOnline: users.isOnline,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!user) throw new AppError(404, 'User not found');
  return user;
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const [user] = await db
    .update(users)
    .set({ ...input, updatedAt: new Date() } as any)
    .where(eq(users.id, id))
    .returning();

  if (!user) throw new AppError(404, 'User not found');
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function updateGPS(userId: string, input: UpdateGPSInput) {
  const [user] = await db
    .update(users)
    .set({
      currentLatitude: input.latitude,
      currentLongitude: input.longitude,
      lastGPSUpdate: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  if (!user) throw new AppError(404, 'User not found');
  return { latitude: input.latitude, longitude: input.longitude };
}

export async function updateResponseStatus(
  userId: string,
  status: 'safe' | 'need_help' | 'pending' | 'no_reply'
) {
  const [user] = await db
    .update(users)
    .set({ responseStatus: status, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  if (!user) throw new AppError(404, 'User not found');
  return user;
}

export async function resetAllStatuses() {
  await db
    .update(users)
    .set({ responseStatus: 'no_reply', updatedAt: new Date() });
}

export async function getUsersInZoneByGPS(zoneId: string) {
  // Get zone polygon
  const [zone] = await db
    .select()
    .from(zones)
    .where(eq(zones.id, zoneId))
    .limit(1);

  if (!zone) throw new AppError(404, 'Zone not found');

  // Get all users with GPS data
  const allUsers = await db
    .select()
    .from(users)
    .where(
      and(
        sql`${users.currentLatitude} IS NOT NULL`,
        sql`${users.currentLongitude} IS NOT NULL`
      )
    );

  const polygon = zone.polygon as Coordinate[];

  return allUsers.filter((user) =>
    isPointInPolygon(
      { latitude: user.currentLatitude!, longitude: user.currentLongitude! },
      polygon
    )
  );
}
