export const queryKeys = {
  auth: {
    profile: ['auth', 'profile'] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
  },
  zones: {
    all: ['zones'] as const,
    detail: (id: string) => ['zones', id] as const,
  },
  locations: {
    all: ['locations'] as const,
    byZone: (zoneId: string) => ['locations', 'zone', zoneId] as const,
    detail: (id: string) => ['locations', id] as const,
  },
  users: {
    all: (filters?: Record<string, string>) =>
      ['users', filters ?? {}] as const,
    detail: (id: string) => ['users', id] as const,
    inZone: (zoneId: string) => ['users', 'zone', zoneId] as const,
  },
  alerts: {
    all: (activeOnly?: boolean) => ['alerts', { activeOnly }] as const,
    detail: (id: string) => ['alerts', id] as const,
    receipts: (id: string) => ['alerts', id, 'receipts'] as const,
    emergencyState: ['alerts', 'emergency-state'] as const,
  },
};
