import { describe, it, expect } from 'vitest';
import { isPointInPolygon, polygonCentroid, distanceBetween } from '../src/utils/point-in-polygon';
import type { Coordinate } from '../src/schemas/zone.schema';

// Define a square polygon (Khurais CPF area)
const squarePolygon: Coordinate[] = [
  { latitude: 25.085, longitude: 48.155 },
  { latitude: 25.095, longitude: 48.155 },
  { latitude: 25.095, longitude: 48.17 },
  { latitude: 25.085, longitude: 48.17 },
];

describe('isPointInPolygon', () => {
  it('returns true for a point inside the polygon', () => {
    const point: Coordinate = { latitude: 25.09, longitude: 48.162 };
    expect(isPointInPolygon(point, squarePolygon)).toBe(true);
  });

  it('returns false for a point outside the polygon', () => {
    const point: Coordinate = { latitude: 25.1, longitude: 48.2 };
    expect(isPointInPolygon(point, squarePolygon)).toBe(false);
  });

  it('returns false for a point far away', () => {
    const point: Coordinate = { latitude: 24.0, longitude: 47.0 };
    expect(isPointInPolygon(point, squarePolygon)).toBe(false);
  });

  it('returns false for an empty polygon', () => {
    const point: Coordinate = { latitude: 25.09, longitude: 48.162 };
    expect(isPointInPolygon(point, [])).toBe(false);
  });

  it('returns false for a polygon with fewer than 3 points', () => {
    const point: Coordinate = { latitude: 25.09, longitude: 48.162 };
    const twoPoints: Coordinate[] = [
      { latitude: 25.085, longitude: 48.155 },
      { latitude: 25.095, longitude: 48.155 },
    ];
    expect(isPointInPolygon(point, twoPoints)).toBe(false);
  });

  it('handles a triangle polygon', () => {
    const triangle: Coordinate[] = [
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 10 },
      { latitude: 10, longitude: 5 },
    ];
    expect(isPointInPolygon({ latitude: 3, longitude: 5 }, triangle)).toBe(true);
    expect(isPointInPolygon({ latitude: 11, longitude: 5 }, triangle)).toBe(false);
  });
});

describe('polygonCentroid', () => {
  it('calculates the centroid of a square', () => {
    const centroid = polygonCentroid(squarePolygon);
    expect(centroid.latitude).toBeCloseTo(25.09);
    expect(centroid.longitude).toBeCloseTo(48.1625);
  });

  it('returns 0,0 for an empty polygon', () => {
    const centroid = polygonCentroid([]);
    expect(centroid.latitude).toBe(0);
    expect(centroid.longitude).toBe(0);
  });
});

describe('distanceBetween', () => {
  it('calculates distance between two close points', () => {
    const a: Coordinate = { latitude: 25.09, longitude: 48.16 };
    const b: Coordinate = { latitude: 25.091, longitude: 48.16 };
    const dist = distanceBetween(a, b);
    // ~111 meters for 0.001 degree at this latitude
    expect(dist).toBeGreaterThan(100);
    expect(dist).toBeLessThan(120);
  });

  it('returns 0 for the same point', () => {
    const a: Coordinate = { latitude: 25.09, longitude: 48.16 };
    expect(distanceBetween(a, a)).toBeCloseTo(0);
  });
});
