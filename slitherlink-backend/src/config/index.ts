import dotenv from 'dotenv';
import { ServerConfig } from '@/types';
import { getDatabaseConfig } from './database';

// 加载环境变量
dotenv.config();

export const config: ServerConfig = {
  port: parseInt(process.env.PORT || '8000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  database: getDatabaseConfig(),
  algorithmServiceUrl: process.env.ALGORITHM_SERVICE_URL || 'http://localhost:8080',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
};

// 验证必要的环境变量
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET is required in production');
}

export * from './database';