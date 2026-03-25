import { describe, it, expect } from 'vitest';
import {
  createZoneSchema,
  createLocationSchema,
  createUserSchema,
  loginSchema,
  createAlertSchema,
  respondToAlertSchema,
} from '../src/schemas';

describe('Zone Schema', () => {
  it('validates a valid zone', () => {
    const result = createZoneSchema.safeParse({
      name: 'CPF',
      polygon: [
        { latitude: 25.085, longitude: 48.155 },
        { latitude: 25.095, longitude: 48.155 },
        { latitude: 25.095, longitude: 48.17 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects a zone without name', () => {
    const result = createZoneSchema.safeParse({
      name: '',
      polygon: [
        { latitude: 25.085, longitude: 48.155 },
        { latitude: 25.095, longitude: 48.155 },
        { latitude: 25.095, longitude: 48.17 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a polygon with fewer than 3 points', () => {
    const result = createZoneSchema.safeParse({
      name: 'Test',
      polygon: [
        { latitude: 25.085, longitude: 48.155 },
        { latitude: 25.095, longitude: 48.155 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid coordinates', () => {
    const result = createZoneSchema.safeParse({
      name: 'Test',
      polygon: [
        { latitude: 91, longitude: 48.155 },
        { latitude: 25.095, longitude: 48.155 },
        { latitude: 25.095, longitude: 48.17 },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe('Location Schema', () => {
  it('validates a valid location', () => {
    const result = createLocationSchema.safeParse({
      name: 'CCR',
      zoneId: '550e8400-e29b-41d4-a716-446655440000',
      coordinates: { latitude: 25.09, longitude: 48.162 },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing zone ID', () => {
    const result = createLocationSchema.safeParse({
      name: 'CCR',
      coordinates: { latitude: 25.09, longitude: 48.162 },
    });
    expect(result.success).toBe(false);
  });
});

describe('User Schema', () => {
  it('validates a valid user', () => {
    const result = createUserSchema.safeParse({
      name: 'John',
      badgeNumber: 'USR001',
      password: 'password123',
      affiliation: 'aramco',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short password', () => {
    const result = createUserSchema.safeParse({
      name: 'John',
      badgeNumber: 'USR001',
      password: '12345',
      affiliation: 'aramco',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid affiliation', () => {
    const result = createUserSchema.safeParse({
      name: 'John',
      badgeNumber: 'USR001',
      password: 'password123',
      affiliation: 'other',
    });
    expect(result.success).toBe(false);
  });
});

describe('Login Schema', () => {
  it('validates valid login', () => {
    const result = loginSchema.safeParse({
      badgeNumber: 'USR001',
      password: 'password',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty badge', () => {
    const result = loginSchema.safeParse({
      badgeNumber: '',
      password: 'password',
    });
    expect(result.success).toBe(false);
  });
});

describe('Alert Schema', () => {
  it('validates a valid alert', () => {
    const result = createAlertSchema.safeParse({
      title: 'Security Alert',
      message: 'Unauthorized access detected',
      type: 'security',
    });
    expect(result.success).toBe(true);
  });

  it('validates alert with zone targeting', () => {
    const result = createAlertSchema.safeParse({
      title: 'Zone Alert',
      message: 'Evacuate immediately',
      type: 'security',
      severity: 'critical',
      isGlobal: false,
      zoneIds: ['550e8400-e29b-41d4-a716-446655440000'],
      emergencyMode: 'shelter_in',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid alert type', () => {
    const result = createAlertSchema.safeParse({
      title: 'Test',
      message: 'Test',
      type: 'invalid',
    });
    expect(result.success).toBe(false);
  });
});

describe('Response Schema', () => {
  it('validates safe response', () => {
    expect(respondToAlertSchema.safeParse({ response: 'safe' }).success).toBe(true);
  });

  it('validates need_help response', () => {
    expect(respondToAlertSchema.safeParse({ response: 'need_help' }).success).toBe(true);
  });

  it('rejects invalid response', () => {
    expect(respondToAlertSchema.safeParse({ response: 'unknown' }).success).toBe(false);
  });
});
