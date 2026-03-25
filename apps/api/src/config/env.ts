import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const env = {
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/kaler',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
};
