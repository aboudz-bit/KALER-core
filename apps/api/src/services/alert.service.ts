import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../db/client';
import {
  alerts,
  alertReceipts,
  users,
  zones,
  emergencyState,
} from '../db/schema';
import { AppError } from '../middleware/error-handler';
import { isPointInPolygon } from '@kaler/shared';
import type { CreateAlertInput, Coordinate } from '@kaler/shared';

export async function getAllAlerts(activeOnly = false) {
  let query = db
    .select()
    .from(alerts)
    .orderBy(desc(alerts.createdAt))
    .$dynamic();
  if (activeOnly) {
    query = query.where(eq(alerts.isActive, true));
  }
  return query;
}

export async function getAlertById(id: string) {
  const [alert] = await db
    .select()
    .from(alerts)
    .where(eq(alerts.id, id))
    .limit(1);
  if (!alert) throw new AppError(404, 'Alert not found');
  return alert;
}

/**
 * Helper: get the singleton emergency state row, creating it if it doesn't exist.
 */
async function getOrCreateEmergencyRow() {
  const [existing] = await db.select().from(emergencyState).limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(emergencyState)
    .values({ isActive: false })
    .returning();
  return created;
}

export async function createAlert(
  input: CreateAlertInput,
  createdBy: string
) {
  const [alert] = await db
    .insert(alerts)
    .values({
      ...input,
      zoneIds: input.zoneIds || [],
      createdBy,
      activatedAt: new Date(),
    })
    .returning();

  // If alert has emergency mode, update emergency state
  if (input.emergencyMode) {
    const row = await getOrCreateEmergencyRow();
    await db
      .update(emergencyState)
      .set({
        isActive: true,
        mode: input.emergencyMode,
        activeAlertId: alert.id,
        activatedBy: createdBy,
        activatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(emergencyState.id, row.id));
  }

  // Create receipts for targeted users
  const targetedUsers = await getTargetedUsers(
    input.isGlobal,
    (input.zoneIds || []) as string[]
  );

  if (targetedUsers.length > 0) {
    await db.insert(alertReceipts).values(
      targetedUsers.map((user) => ({
        alertId: alert.id,
        userId: user.id,
        receivedAt: new Date(),
      }))
    );
  }

  return { alert, targetedUserCount: targetedUsers.length };
}

export async function deactivateAlert(id: string) {
  const [alert] = await db
    .update(alerts)
    .set({
      isActive: false,
      deactivatedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(alerts.id, id))
    .returning();

  if (!alert) throw new AppError(404, 'Alert not found');

  // If this alert had emergency mode, check if we should deactivate emergency
  if (alert.emergencyMode) {
    // Check if any other active alerts have emergency mode
    const otherActiveEmergency = await db
      .select()
      .from(alerts)
      .where(
        and(
          eq(alerts.isActive, true),
          sql`${alerts.emergencyMode} IS NOT NULL`,
          sql`${alerts.id} != ${id}`
        )
      )
      .limit(1);

    if (otherActiveEmergency.length === 0) {
      const row = await getOrCreateEmergencyRow();
      await db
        .update(emergencyState)
        .set({
          isActive: false,
          mode: null,
          activeAlertId: null,
          updatedAt: new Date(),
        })
        .where(eq(emergencyState.id, row.id));
    }
  }

  return alert;
}

export async function confirmReceipt(alertId: string, userId: string) {
  const [receipt] = await db
    .update(alertReceipts)
    .set({ confirmedAt: new Date() })
    .where(
      and(
        eq(alertReceipts.alertId, alertId),
        eq(alertReceipts.userId, userId)
      )
    )
    .returning();

  if (!receipt) throw new AppError(404, 'Alert receipt not found');
  return receipt;
}

export async function respondToAlert(
  alertId: string,
  userId: string,
  response: 'safe' | 'need_help'
) {
  // Update the receipt
  const [receipt] = await db
    .update(alertReceipts)
    .set({
      respondedAt: new Date(),
      response,
    })
    .where(
      and(
        eq(alertReceipts.alertId, alertId),
        eq(alertReceipts.userId, userId)
      )
    )
    .returning();

  if (!receipt) throw new AppError(404, 'Alert receipt not found');

  // Update user's response status
  await db
    .update(users)
    .set({ responseStatus: response, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return receipt;
}

export async function getAlertReceipts(alertId: string) {
  return db
    .select({
      id: alertReceipts.id,
      alertId: alertReceipts.alertId,
      userId: alertReceipts.userId,
      userName: users.name,
      badgeNumber: users.badgeNumber,
      receivedAt: alertReceipts.receivedAt,
      confirmedAt: alertReceipts.confirmedAt,
      respondedAt: alertReceipts.respondedAt,
      response: alertReceipts.response,
    })
    .from(alertReceipts)
    .innerJoin(users, eq(alertReceipts.userId, users.id))
    .where(eq(alertReceipts.alertId, alertId));
}

export async function getEmergencyState() {
  const [state] = await db.select().from(emergencyState).limit(1);
  return state || { isActive: false, mode: null };
}

async function getTargetedUsers(isGlobal: boolean, zoneIds: string[]) {
  if (isGlobal) {
    return db.select().from(users);
  }

  if (zoneIds.length === 0) return [];

  // Get zone polygons
  const targetZones = await db.select().from(zones);
  const relevantZones = targetZones.filter((z) =>
    zoneIds.includes(z.id)
  );

  if (relevantZones.length === 0) return [];

  // Get all users with GPS
  const allUsers = await db
    .select()
    .from(users)
    .where(
      and(
        sql`${users.currentLatitude} IS NOT NULL`,
        sql`${users.currentLongitude} IS NOT NULL`
      )
    );

  // Filter users by point-in-polygon
  return allUsers.filter((user) => {
    const point: Coordinate = {
      latitude: user.currentLatitude!,
      longitude: user.currentLongitude!,
    };

    return relevantZones.some((zone) =>
      isPointInPolygon(point, zone.polygon as Coordinate[])
    );
  });
}
