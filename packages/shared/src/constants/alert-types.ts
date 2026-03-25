export const ALERT_TYPES = [
  'security',
  'drill',
  'restricted_movement',
  'custom',
] as const;
export type AlertType = (typeof ALERT_TYPES)[number];

export const EMERGENCY_MODES = ['shelter_in', 'blackout'] as const;
export type EmergencyMode = (typeof EMERGENCY_MODES)[number];

export const ALERT_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

export const ALERT_PRIORITIES = ['normal', 'urgent', 'emergency'] as const;
export type AlertPriority = (typeof ALERT_PRIORITIES)[number];

export const RESPONSE_STATUSES = [
  'safe',
  'need_help',
  'pending',
  'no_reply',
] as const;
export type ResponseStatus = (typeof RESPONSE_STATUSES)[number];
