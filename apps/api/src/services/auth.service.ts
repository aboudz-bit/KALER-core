import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { users } from '../db/schema';
import { env } from '../config/env';
import { AppError } from '../middleware/error-handler';
import type { AuthUser } from '../middleware/auth';
import type { CreateUserInput } from '@kaler/shared';

export async function login(badgeNumber: string, password: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.badgeNumber, badgeNumber))
    .limit(1);

  if (!user) {
    throw new AppError(401, 'Invalid badge number or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Invalid badge number or password');
  }

  const payload: AuthUser = {
    id: user.id,
    badgeNumber: user.badgeNumber,
    role: user.role,
    affiliation: user.affiliation,
  };

  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  // Mark user as online
  await db
    .update(users)
    .set({ isOnline: true, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  const { passwordHash, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
}

export async function register(input: CreateUserInput) {
  // Check if badge number already exists
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.badgeNumber, input.badgeNumber))
    .limit(1);

  if (existing) {
    throw new AppError(409, 'Badge number already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const [user] = await db
    .insert(users)
    .values({
      name: input.name,
      badgeNumber: input.badgeNumber,
      email: input.email,
      passwordHash,
      role: input.role || 'user',
      affiliation: input.affiliation,
      company: input.company,
      zoneId: input.zoneId,
      locationId: input.locationId,
      ecoSlot: input.ecoSlot,
    })
    .returning();

  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function getProfile(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
