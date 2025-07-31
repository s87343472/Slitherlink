import { Knex } from 'knex';
import { DatabaseConfig } from '@/types';

export const getDatabaseConfig = (): DatabaseConfig => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'slitherlink',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production',
  pool: {
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    max: parseInt(process.env.DB_POOL_MAX || '20'),
  },
});

export const knexConfig: Knex.Config = {
  client: 'postgresql',
  connection: {
    host: getDatabaseConfig().host,
    port: getDatabaseConfig().port,
    database: getDatabaseConfig().database,
    user: getDatabaseConfig().username,
    password: getDatabaseConfig().password,
    ssl: getDatabaseConfig().ssl ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: getDatabaseConfig().pool?.min || 2,
    max: getDatabaseConfig().pool?.max || 20,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    createTimeoutMillis: 3000,
  },
  migrations: {
    directory: './src/database/migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './src/database/seeds',
    extension: 'ts',
  },
};