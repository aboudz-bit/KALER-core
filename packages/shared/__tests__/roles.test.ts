import { describe, it, expect } from 'vitest';
import { hasPermission, ROLE_HIERARCHY } from '../src/constants/roles';
import type { Role } from '../src/constants/roles';

describe('hasPermission', () => {
  it('admin has permission for all roles', () => {
    expect(hasPermission('admin', 'admin')).toBe(true);
    expect(hasPermission('admin', 'eco')).toBe(true);
    expect(hasPermission('admin', 'supervisor')).toBe(true);
    expect(hasPermission('admin', 'user')).toBe(true);
  });

  it('eco has permission for eco and below', () => {
    expect(hasPermission('eco', 'admin')).toBe(false);
    expect(hasPermission('eco', 'eco')).toBe(true);
    expect(hasPermission('eco', 'supervisor')).toBe(true);
    expect(hasPermission('eco', 'user')).toBe(true);
  });

  it('supervisor has permission for supervisor and below', () => {
    expect(hasPermission('supervisor', 'admin')).toBe(false);
    expect(hasPermission('supervisor', 'eco')).toBe(false);
    expect(hasPermission('supervisor', 'supervisor')).toBe(true);
    expect(hasPermission('supervisor', 'user')).toBe(true);
  });

  it('user has permission only for user', () => {
    expect(hasPermission('user', 'admin')).toBe(false);
    expect(hasPermission('user', 'eco')).toBe(false);
    expect(hasPermission('user', 'supervisor')).toBe(false);
    expect(hasPermission('user', 'user')).toBe(true);
  });
});

describe('ROLE_HIERARCHY', () => {
  it('admin has highest value', () => {
    expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.eco);
    expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.supervisor);
    expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.user);
  });

  it('hierarchy is ordered correctly', () => {
    expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.eco);
    expect(ROLE_HIERARCHY.eco).toBeGreaterThan(ROLE_HIERARCHY.supervisor);
    expect(ROLE_HIERARCHY.supervisor).toBeGreaterThan(ROLE_HIERARCHY.user);
  });
});
