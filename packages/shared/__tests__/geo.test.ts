import { describe, it, expect } from 'vitest';
import {
  findUserZone,
  getUsersInZone,
  getAlertTargetUsers,
} from '../src/utils/geo';
import type { UserWithGPS, ZoneWithPolygon } from '../src/utils/geo';

const zones: ZoneWithPolygon[] = [
  {
    id: 'zone-1',
    polygon: [
      { latitude: 25.085, longitude: 48.155 },
      { latitude: 25.095, longitude: 48.155 },
      { latitude: 25.095, longitude: 48.17 },
      { latitude: 25.085, longitude: 48.17 },
    ],
  },
  {
    id: 'zone-2',
    polygon: [
      { latitude: 25.075, longitude: 48.14 },
      { latitude: 25.085, longitude: 48.14 },
      { latitude: 25.085, longitude: 48.155 },
      { latitude: 25.075, longitude: 48.155 },
    ],
  },
];

const users: UserWithGPS[] = [
  { id: 'u1', currentLatitude: 25.09, currentLongitude: 48.162, role: 'user' },
  { id: 'u2', currentLatitude: 25.08, currentLongitude: 48.147, role: 'user' },
  { id: 'u3', currentLatitude: 25.0, currentLongitude: 48.0, role: 'user' },
  { id: 'u4', currentLatitude: null, currentLongitude: null, role: 'user' },
  { id: 'u5', currentLatitude: null, currentLongitude: null, role: 'admin' },
];

describe('findUserZone', () => {
  it('finds the correct zone for a user inside zone-1', () => {
    expect(findUserZone(users[0], zones)).toBe('zone-1');
  });

  it('finds the correct zone for a user inside zone-2', () => {
    expect(findUserZone(users[1], zones)).toBe('zone-2');
  });

  it('returns null for a user outside all zones', () => {
    expect(findUserZone(users[2], zones)).toBeNull();
  });

  it('returns null for a user with no GPS data', () => {
    expect(findUserZone(users[3], zones)).toBeNull();
  });
});

describe('getUsersInZone', () => {
  it('returns only users physically inside the zone', () => {
    const result = getUsersInZone(users, zones[0]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('u1');
  });

  it('excludes users without GPS data', () => {
    const result = getUsersInZone(users, zones[0]);
    expect(result.find((u) => u.id === 'u4')).toBeUndefined();
    expect(result.find((u) => u.id === 'u5')).toBeUndefined();
  });
});

describe('getAlertTargetUsers', () => {
  it('returns all users for a global alert', () => {
    const result = getAlertTargetUsers(users, zones, [], true);
    expect(result).toHaveLength(5);
  });

  it('returns only users in targeted zones for zone alert', () => {
    const result = getAlertTargetUsers(users, zones, ['zone-1'], false);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('u1');
  });

  it('returns users in multiple targeted zones', () => {
    const result = getAlertTargetUsers(
      users,
      zones,
      ['zone-1', 'zone-2'],
      false
    );
    expect(result).toHaveLength(2);
  });

  it('returns empty array when no zones match', () => {
    const result = getAlertTargetUsers(users, zones, ['nonexistent'], false);
    expect(result).toHaveLength(0);
  });

  it('excludes GPS-less users from zone alerts', () => {
    const result = getAlertTargetUsers(users, zones, ['zone-1'], false);
    expect(result.find((u) => u.id === 'u4')).toBeUndefined();
  });
});
