import type { Coordinate } from '../schemas/zone.schema';

/**
 * Ray-casting algorithm for point-in-polygon detection.
 * Determines if a point is inside a polygon defined by an array of coordinates.
 */
export function isPointInPolygon(
  point: Coordinate,
  polygon: Coordinate[]
): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  const { latitude: y, longitude: x } = point;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const yi = polygon[i].latitude;
    const xi = polygon[i].longitude;
    const yj = polygon[j].latitude;
    const xj = polygon[j].longitude;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Calculate the centroid of a polygon.
 */
export function polygonCentroid(polygon: Coordinate[]): Coordinate {
  if (polygon.length === 0) {
    return { latitude: 0, longitude: 0 };
  }

  const sum = polygon.reduce(
    (acc, coord) => ({
      latitude: acc.latitude + coord.latitude,
      longitude: acc.longitude + coord.longitude,
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: sum.latitude / polygon.length,
    longitude: sum.longitude / polygon.length,
  };
}

/**
 * Calculate distance between two coordinates in meters using Haversine formula.
 */
export function distanceBetween(a: Coordinate, b: Coordinate): number {
  const R = 6371e3; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const aCalc =
    sinDLat * sinDLat +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinDLon * sinDLon;

  const c = 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));

  return R * c;
}
