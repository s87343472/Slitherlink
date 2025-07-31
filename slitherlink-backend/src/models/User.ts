import { db } from './database';
import { User, UserPermissions, CreateUserRequest } from '@/types';
import bcrypt from 'bcryptjs';
import { logger } from '@/utils/logger';

export class UserModel {
  // 根据ID获取用户
  static async findById(id: number): Promise<User | null> {
    try {
      const user = await db<User>('users').where('id', id).first();
      return user || null;
    } catch (error) {
      logger.error('Error finding user by id:', error);
      throw error;
    }
  }

  // 根据邮箱获取用户
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await db<User>('users').where('email', email).first();
      return user || null;
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  // 根据用户名获取用户
  static async findByUsername(username: string): Promise<User | null> {
    try {
      const user = await db<User>('users').where('username', username).first();
      return user || null;
    } catch (error) {
      logger.error('Error finding user by username:', error);
      throw error;
    }
  }

  // 创建新用户
  static async create(userData: CreateUserRequest): Promise<User> {
    try {
      // 检查用户是否已存在
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email already exists');
      }

      const existingUsername = await this.findByUsername(userData.username);
      if (existingUsername) {
        throw new Error('Username already exists');
      }

      // 哈希密码
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      // 插入用户数据
      const [user] = await db('users')
        .insert({
          email: userData.email,
          username: userData.username,
          password_hash: passwordHash,
          display_name: userData.display_name,
          created_at: new Date(),
          updated_at: new Date(),
          is_active: true,
        })
        .returning('*');

      // 创建默认权限
      await db<UserPermissions>('user_permissions').insert({
        user_id: user.id,
        has_leaderboard_access: false,
        has_ad_free_access: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      logger.info(`New user created: ${user.username}`);
      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  // 验证用户密码
  static async validatePassword(email: string, password: string): Promise<User | null> {
    try {
      const user = await db<User & { password_hash: string }>('users')
        .where('email', email)
        .where('is_active', true)
        .first();

      if (!user) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return null;
      }

      // 更新最后登录时间
      await db<User>('users')
        .where('id', user.id)
        .update({ last_login_at: new Date() });

      // 返回用户信息（不包含密码哈希）
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      logger.error('Error validating password:', error);
      throw error;
    }
  }

  // 获取用户权限
  static async getUserPermissions(userId: number): Promise<UserPermissions | null> {
    try {
      const permissions = await db<UserPermissions>('user_permissions')
        .where('user_id', userId)
        .first();
      return permissions || null;
    } catch (error) {
      logger.error('Error getting user permissions:', error);
      throw error;
    }
  }

  // 更新用户权限
  static async updatePermissions(userId: number, permissions: Partial<UserPermissions>): Promise<void> {
    try {
      await db<UserPermissions>('user_permissions')
        .where('user_id', userId)
        .update({
          ...permissions,
          updated_at: new Date(),
        });
      logger.info(`Updated permissions for user ${userId}`);
    } catch (error) {
      logger.error('Error updating user permissions:', error);
      throw error;
    }
  }

  // 获取用户完整信息（包含权限）
  static async getUserWithPermissions(userId: number): Promise<(User & { permissions: UserPermissions }) | null> {
    try {
      const result = await db<User>('users')
        .leftJoin<UserPermissions>('user_permissions', 'users.id', 'user_permissions.user_id')
        .select(
          'users.*',
          'user_permissions.has_leaderboard_access',
          'user_permissions.has_ad_free_access'
        )
        .where('users.id', userId)
        .first();

      if (!result) {
        return null;
      }

      const { has_leaderboard_access, has_ad_free_access, ...user } = result;
      
      return {
        ...user,
        permissions: {
          id: 0, // 不需要权限ID
          user_id: userId,
          has_leaderboard_access: has_leaderboard_access || false,
          has_ad_free_access: has_ad_free_access || false,
          created_at: new Date(),
          updated_at: new Date(),
        }
      };
    } catch (error) {
      logger.error('Error getting user with permissions:', error);
      throw error;
    }
  }

  // 购买排行榜通行证
  static async purchaseLeaderboardAccess(userId: number): Promise<void> {
    try {
      await this.updatePermissions(userId, { has_leaderboard_access: true });
      logger.info(`User ${userId} purchased leaderboard access`);
    } catch (error) {
      logger.error('Error purchasing leaderboard access:', error);
      throw error;
    }
  }
}