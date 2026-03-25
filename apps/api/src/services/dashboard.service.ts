import { eq, sql, and } from 'drizzle-orm';
import { db } from '../db/client';
import { users, alerts, zones, emergencyState } from '../db/schema';
import type { DashboardStats } from '@kaler/shared';

export async function getDashboardStats(): Promise<DashboardStats> {
  // Get personnel counts by response status
  const statusCounts = await db
    .select({
      status: users.responseStatus,
      count: sql<number>`count(*)::int`,
    })
    .from(users)
    .groupBy(users.responseStatus);

  const counts: Record<string, number> = {};
  for (const row of statusCounts) {
    counts[row.status] = row.count;
  }

  // Get active alerts count
  const [activeAlertCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(alerts)
    .where(eq(alerts.isActive, true));

  // Get active zones count
  const [activeZoneCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(zones)
    .where(eq(zones.isActive, true));

  // Get emergency state
  const [emergency] = await db.select().from(emergencyState).limit(1);

  const totalPersonnel =
    (counts.safe || 0) +
    (counts.pending || 0) +
    (counts.need_help || 0) +
    (counts.no_reply || 0);

  return {
    totalPersonnel,
    safe: counts.safe || 0,
    pending: counts.pending || 0,
    needHelp: counts.need_help || 0,
    noReply: counts.no_reply || 0,
    activeAlerts: activeAlertCount?.count || 0,
    activeZones: activeZoneCount?.count || 0,
    emergencyMode: emergency?.isActive ? emergency.mode : null,
  };
}
