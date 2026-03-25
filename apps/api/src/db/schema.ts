import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  doublePrecision,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin', 'eco', 'supervisor', 'user']);
export const affiliationEnum = pgEnum('affiliation', [
  'aramco',
  'contractor',
]);
export const alertTypeEnum = pgEnum('alert_type', [
  'security',
  'drill',
  'restricted_movement',
  'custom',
]);
export const severityEnum = pgEnum('severity', [
  'low',
  'medium',
  'high',
  'critical',
]);
export const priorityEnum = pgEnum('priority', [
  'normal',
  'urgent',
  'emergency',
]);
export const responseStatusEnum = pgEnum('response_status', [
  'safe',
  'need_help',
  'pending',
  'no_reply',
]);
export const emergencyModeEnum = pgEnum('emergency_mode', [
  'shelter_in',
  'blackout',
]);
export const locationTypeEnum = pgEnum('location_type', [
  'building',
  'facility',
  'checkpoint',
  'shelter',
  'other',
]);

// ─── Zones ────────────────────────────────────────────
export const zones = pgTable('zones', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  polygon: jsonb('polygon').notNull(), // Array of {latitude, longitude}
  color: varchar('color', { length: 7 }).notNull().default('#3B82F6'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Locations ────────────────────────────────────────
export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  zoneId: uuid('zone_id')
    .notNull()
    .references(() => zones.id, { onDelete: 'cascade' }),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  type: locationTypeEnum('type').notNull().default('other'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Users ────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  badgeNumber: varchar('badge_number', { length: 20 }).notNull().unique(),
  email: varchar('email', { length: 255 }),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: roleEnum('role').notNull().default('user'),
  affiliation: affiliationEnum('affiliation').notNull(),
  company: varchar('company', { length: 100 }),
  zoneId: uuid('zone_id').references(() => zones.id, { onDelete: 'set null' }),
  locationId: uuid('location_id').references(() => locations.id, {
    onDelete: 'set null',
  }),
  ecoSlot: varchar('eco_slot', { length: 50 }),
  currentLatitude: doublePrecision('current_latitude'),
  currentLongitude: doublePrecision('current_longitude'),
  responseStatus: responseStatusEnum('response_status')
    .notNull()
    .default('no_reply'),
  lastGPSUpdate: timestamp('last_gps_update', { withTimezone: true }),
  isOnline: boolean('is_online').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Alerts ───────────────────────────────────────────
export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  message: text('message').notNull(),
  type: alertTypeEnum('type').notNull(),
  severity: severityEnum('severity').notNull().default('medium'),
  priority: priorityEnum('priority').notNull().default('normal'),
  isGlobal: boolean('is_global').notNull().default(false),
  zoneIds: jsonb('zone_ids').notNull().default([]),
  emergencyMode: emergencyModeEnum('emergency_mode'),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  activatedAt: timestamp('activated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  deactivatedAt: timestamp('deactivated_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Alert Receipts ───────────────────────────────────
export const alertReceipts = pgTable('alert_receipts', {
  id: uuid('id').primaryKey().defaultRandom(),
  alertId: uuid('alert_id')
    .notNull()
    .references(() => alerts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  receivedAt: timestamp('received_at', { withTimezone: true }),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  respondedAt: timestamp('responded_at', { withTimezone: true }),
  response: responseStatusEnum('response'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Emergency State (singleton) ──────────────────────
export const emergencyState = pgTable('emergency_state', {
  id: uuid('id').primaryKey().defaultRandom(),
  isActive: boolean('is_active').notNull().default(false),
  mode: emergencyModeEnum('mode'),
  activeAlertId: uuid('active_alert_id').references(() => alerts.id),
  activatedBy: uuid('activated_by').references(() => users.id),
  activatedAt: timestamp('activated_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
