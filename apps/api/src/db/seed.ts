import bcrypt from 'bcryptjs';
import { db } from './client';
import { users, zones, locations, emergencyState } from './schema';

async function seed() {
  console.log('Seeding database...');

  // Create default emergency state
  await db.insert(emergencyState).values({
    isActive: false,
    mode: null,
  });

  // Create default admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  const [admin] = await db
    .insert(users)
    .values({
      name: 'System Admin',
      badgeNumber: 'ADMIN001',
      email: 'admin@kaler.com',
      passwordHash,
      role: 'admin',
      affiliation: 'aramco',
      company: 'Saudi Aramco',
    })
    .returning();

  // Create sample zones (Khurais-style)
  const [cpfZone] = await db
    .insert(zones)
    .values({
      name: 'CPF',
      description: 'Central Processing Facility',
      polygon: [
        { latitude: 25.085, longitude: 48.155 },
        { latitude: 25.095, longitude: 48.155 },
        { latitude: 25.095, longitude: 48.17 },
        { latitude: 25.085, longitude: 48.17 },
      ],
      color: '#EF4444',
    })
    .returning();

  const [campZone] = await db
    .insert(zones)
    .values({
      name: 'Camp',
      description: 'Personnel Camp Area',
      polygon: [
        { latitude: 25.075, longitude: 48.14 },
        { latitude: 25.085, longitude: 48.14 },
        { latitude: 25.085, longitude: 48.155 },
        { latitude: 25.075, longitude: 48.155 },
      ],
      color: '#3B82F6',
    })
    .returning();

  const [gasTrain1] = await db
    .insert(zones)
    .values({
      name: 'Gas Train-1',
      description: 'Gas Processing Train 1',
      polygon: [
        { latitude: 25.09, longitude: 48.17 },
        { latitude: 25.095, longitude: 48.17 },
        { latitude: 25.095, longitude: 48.18 },
        { latitude: 25.09, longitude: 48.18 },
      ],
      color: '#F59E0B',
    })
    .returning();

  // Create sample locations
  await db.insert(locations).values([
    {
      name: 'CCR',
      description: 'Central Control Room',
      zoneId: cpfZone.id,
      latitude: 25.09,
      longitude: 48.162,
      type: 'building',
    },
    {
      name: 'Workshop',
      description: 'Maintenance Workshop',
      zoneId: cpfZone.id,
      latitude: 25.088,
      longitude: 48.158,
      type: 'facility',
    },
    {
      name: 'Camp-1',
      description: 'Residential Camp Block 1',
      zoneId: campZone.id,
      latitude: 25.08,
      longitude: 48.147,
      type: 'building',
    },
    {
      name: 'Camp-2',
      description: 'Residential Camp Block 2',
      zoneId: campZone.id,
      latitude: 25.078,
      longitude: 48.15,
      type: 'building',
    },
  ]);

  // Create sample users
  const userPassword = await bcrypt.hash('user123', 10);
  await db.insert(users).values([
    {
      name: 'Ahmed Al-Rashid',
      badgeNumber: 'ECO001',
      passwordHash: userPassword,
      role: 'eco',
      affiliation: 'aramco',
      company: 'Saudi Aramco',
      ecoSlot: 'ECO-Alpha',
    },
    {
      name: 'John Smith',
      badgeNumber: 'SUP001',
      passwordHash: userPassword,
      role: 'supervisor',
      affiliation: 'contractor',
      company: 'ACME Engineering',
    },
    {
      name: 'Mohammed Ali',
      badgeNumber: 'USR001',
      passwordHash: userPassword,
      role: 'user',
      affiliation: 'aramco',
      company: 'Saudi Aramco',
    },
    {
      name: 'David Chen',
      badgeNumber: 'USR002',
      passwordHash: userPassword,
      role: 'user',
      affiliation: 'contractor',
      company: 'Global Tech Services',
    },
  ]);

  console.log('Seed complete.');
  console.log('Admin login: ADMIN001 / admin123');
  console.log('Other users: ECO001, SUP001, USR001, USR002 / user123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
