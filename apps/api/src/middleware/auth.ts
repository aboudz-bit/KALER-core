import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { env } from '../config/env';
import { db } from '../db/client';
import { users } from '../db/schema';
import { AppError } from './error-handler';

export interface AuthUser {
  id: string;
  badgeNumber: string;
  role: 'admin' | 'eco' | 'supervisor' | 'user';
  affiliation: 'aramco' | 'contractor';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Authentication required'));
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    req.user = payload;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}

export function authorize(...roles: AuthUser['role'][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Insufficient permissions'));
    }
    next();
  };
}
