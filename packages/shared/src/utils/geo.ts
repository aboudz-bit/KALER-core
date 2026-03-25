import type { Coordinate, Polygon } from '../schemas/zone.schema';
import { isPointInPolygon } from './point-in-polygon';

export interface UserWithGPS {
  id: string;
  currentLatitude: number | null;
  currentLongitude: number | null;
  role: string;
}

export interface ZoneWithPolygon {
  id: string;
  polygon: Coordinate[];
}

/**
 * Find which zone a user is currently in based on GPS.
 * Returns the zone ID or null if user is not in any zone.
 */
export function findUserZone(
  user: UserWithGPS,
  zones: ZoneWithPolygon[]
): string | null {
  if (user.currentLatitude == null || user.currentLongitude == null) {
    return null;
  }

  const point: Coordinate = {
    latitude: user.currentLatitude,
    longitude: user.currentLongitude,
  };

  for (const zone of zones) {
    if (isPointInPolygon(point, zone.polygon)) {
      return zone.id;
    }
  }

  return null;
}

/**
 * Filter users who are inside a specific zone based on GPS.
 * Users without GPS data are excluded unless they are admin/eco/supervisor.
 */
export function getUsersInZone(
  users: UserWithGPS[],
  zone: ZoneWithPolygon
): UserWithGPS[] {
  return users.filter((user) => {
    if (user.currentLatitude == null || user.currentLongitude == null) {
      return false;
    }

    const point: Coordinate = {
      latitude: user.currentLatitude,
      longitude: user.currentLongitude,
    };

    return isPointInPolygon(point, zone.polygon);
  });
}

/**
 * Get users targeted by an alert based on zone polygons and GPS.
 * Global alerts target all users. Zone alerts use GPS point-in-polygon.
 */
export function getAlertTargetUsers(
  users: UserWithGPS[],
  zones: ZoneWithPolygon[],
  targetZoneIds: string[],
  isGlobal: boolean
): UserWithGPS[] {
  if (isGlobal) return users;

  const targetZones = zones.filter((z) => targetZoneIds.includes(z.id));

  return users.filter((user) => {
    if (user.currentLatitude == null || user.currentLongitude == null) {
      return false;
    }

    const point: Coordinate = {
      latitude: user.currentLatitude,
      longitude: user.currentLongitude,
    };

    return targetZones.some((zone) => isPointInPolygon(point, zone.polygon));
  });
}
