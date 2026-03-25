export const ROLES = ['admin', 'eco', 'supervisor', 'user'] as const;
export type Role = (typeof ROLES)[number];

export const AFFILIATIONS = ['aramco', 'contractor'] as const;
export type Affiliation = (typeof AFFILIATIONS)[number];

export const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 4,
  eco: 3,
  supervisor: 2,
  user: 1,
};

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
