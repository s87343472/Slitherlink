import knex from 'knex';
import { knexConfig } from '@/config/database';
import { logger } from '@/utils/logger';

// 创建数据库连接实例
export const db = knex(knexConfig);

// 测试数据库连接
export const testConnection = async (): Promise<boolean> => {
  try {
    await db.raw('SELECT 1');
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    return false;
  }
};

// 优雅关闭数据库连接
export const closeConnection = async (): Promise<void> => {
  try {
    await db.destroy();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
};

// 处理进程退出时的清理
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnection();
  process.exit(0);
});