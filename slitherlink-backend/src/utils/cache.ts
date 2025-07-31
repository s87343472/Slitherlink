import NodeCache from 'node-cache';
import { logger } from './logger';

// 创建缓存实例
const cache = new NodeCache({
  stdTTL: 600, // 默认10分钟过期
  checkperiod: 120, // 2分钟检查一次过期键
  useClones: false, // 提高性能，但要注意对象引用
});

export class CacheService {
  // 设置缓存
  static set<T>(key: string, value: T, ttl?: number): boolean {
    try {
      const success = cache.set(key, value, ttl || 600);
      if (success) {
        logger.debug(`Cache set: ${key}`);
      }
      return success;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  // 获取缓存
  static get<T>(key: string): T | undefined {
    try {
      const value = cache.get<T>(key);
      if (value !== undefined) {
        logger.debug(`Cache hit: ${key}`);
      } else {
        logger.debug(`Cache miss: ${key}`);
      }
      return value;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return undefined;
    }
  }

  // 删除缓存
  static del(key: string | string[]): number {
    try {
      const deleted = cache.del(key);
      logger.debug(`Cache deleted: ${Array.isArray(key) ? key.join(', ') : key}`);
      return deleted;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return 0;
    }
  }

  // 检查缓存是否存在
  static has(key: string): boolean {
    return cache.has(key);
  }

  // 获取所有缓存键
  static keys(): string[] {
    return cache.keys();
  }

  // 清空所有缓存
  static flushAll(): void {
    cache.flushAll();
    logger.info('All cache cleared');
  }

  // 获取缓存统计信息
  static getStats() {
    return cache.getStats();
  }

  // 排行榜缓存（TTL: 30分钟）
  static setLeaderboard(key: string, data: any): boolean {
    return this.set(`leaderboard:${key}`, data, 1800);
  }

  static getLeaderboard<T>(key: string): T | undefined {
    return this.get<T>(`leaderboard:${key}`);
  }

  // 用户权限缓存（TTL: 1小时）
  static setUserPermissions(userId: number, permissions: any): boolean {
    return this.set(`user_permissions:${userId}`, permissions, 3600);
  }

  static getUserPermissions<T>(userId: number): T | undefined {
    return this.get<T>(`user_permissions:${userId}`);
  }

  // 题目库存缓存（TTL: 5分钟）
  static setPuzzleStock(data: any): boolean {
    return this.set('puzzle_stock', data, 300);
  }

  static getPuzzleStock<T>(): T | undefined {
    return this.get<T>('puzzle_stock');
  }

  // 每日挑战缓存（TTL: 1天）
  static setDailyChallenge(date: string, puzzle: any): boolean {
    return this.set(`daily_challenge:${date}`, puzzle, 86400);
  }

  static getDailyChallenge<T>(date: string): T | undefined {
    return this.get<T>(`daily_challenge:${date}`);
  }

  // 系统健康状态缓存（TTL: 1分钟）
  static setSystemHealth(data: any): boolean {
    return this.set('system_health', data, 60);
  }

  static getSystemHealth<T>(): T | undefined {
    return this.get<T>('system_health');
  }
}

// 缓存事件监听
cache.on('set', (key, _value) => {
  logger.debug(`Cache event - SET: ${key}`);
});

cache.on('del', (key, _value) => {
  logger.debug(`Cache event - DEL: ${key}`);
});

cache.on('expired', (key, _value) => {
  logger.debug(`Cache event - EXPIRED: ${key}`);
});

export { cache as nodeCache };