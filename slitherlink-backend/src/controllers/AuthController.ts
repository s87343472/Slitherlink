import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import Joi from 'joi';
import { config } from '@/config';
import { UserModel } from '@/models/User';
import { CreateUserRequest, LoginRequest, ApiResponse, JwtPayload } from '@/types';
import { logger } from '@/utils/logger';
import { CacheService } from '@/utils/cache';

// 请求验证模式
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().min(3).max(30).alphanum().required(),
  password: Joi.string().min(8).required(),
  display_name: Joi.string().max(100).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export class AuthController {
  // 用户注册
  static async register(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      // 验证请求数据
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.details.map(detail => ({
              field: detail.path.join('.'),
              message: detail.message,
            })),
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] as string || 'unknown',
          },
        });
        return;
      }

      const userData: CreateUserRequest = value;

      // 创建用户
      const user = await UserModel.create(userData);

      // 获取用户权限
      const permissions = await UserModel.getUserPermissions(user.id);

      // 生成JWT token
      const tokenPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
        id: user.id,
        userId: user.id,
        username: user.username,
        email: user.email,
        permissions: {
          hasLeaderboardAccess: permissions?.has_leaderboard_access || false,
          hasAdFreeAccess: permissions?.has_ad_free_access || false,
        },
      };

      const token = jwt.sign(
        tokenPayload, 
        config.jwtSecret as string, 
        { expiresIn: config.jwtExpiresIn } as SignOptions
      );

      logger.info(`User registered successfully: ${user.username}`);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            display_name: user.display_name,
            created_at: user.created_at,
          },
          permissions: {
            hasLeaderboardAccess: permissions?.has_leaderboard_access || false,
            hasAdFreeAccess: permissions?.has_ad_free_access || false,
          },
          token,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    } catch (error) {
      logger.error('Registration error:', error);

      let statusCode = 500;
      let errorCode = 'REGISTRATION_FAILED';
      let errorMessage = 'Registration failed';

      if (error instanceof Error) {
        if (error.message.includes('Email already exists')) {
          statusCode = 409;
          errorCode = 'EMAIL_EXISTS';
          errorMessage = 'Email address is already registered';
        } else if (error.message.includes('Username already exists')) {
          statusCode = 409;
          errorCode = 'USERNAME_EXISTS';
          errorMessage = 'Username is already taken';
        }
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }
  }

  // 用户登录
  static async login(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      // 验证请求数据
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.details.map(detail => ({
              field: detail.path.join('.'),
              message: detail.message,
            })),
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] as string || 'unknown',
          },
        });
        return;
      }

      const loginData: LoginRequest = value;

      // 验证用户凭据
      const user = await UserModel.validatePassword(loginData.email, loginData.password);
      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] as string || 'unknown',
          },
        });
        return;
      }

      // 获取用户权限
      const permissions = await UserModel.getUserPermissions(user.id);

      // 缓存用户权限
      if (permissions) {
        CacheService.setUserPermissions(user.id, permissions);
      }

      // 生成JWT token
      const tokenPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
        id: user.id,
        userId: user.id,
        username: user.username,
        email: user.email,
        permissions: {
          hasLeaderboardAccess: permissions?.has_leaderboard_access || false,
          hasAdFreeAccess: permissions?.has_ad_free_access || false,
        },
      };

      const token = jwt.sign(
        tokenPayload, 
        config.jwtSecret as string, 
        { expiresIn: config.jwtExpiresIn } as SignOptions
      );

      logger.info(`User logged in successfully: ${user.username}`);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            display_name: user.display_name,
            last_login_at: user.last_login_at,
          },
          permissions: {
            hasLeaderboardAccess: permissions?.has_leaderboard_access || false,
            hasAdFreeAccess: permissions?.has_ad_free_access || false,
          },
          token,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: 'Login failed',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }
  }

  // 获取当前用户信息
  static async getProfile(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] as string || 'unknown',
          },
        });
        return;
      }

      // 从数据库获取最新用户信息
      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] as string || 'unknown',
          },
        });
        return;
      }

      // 获取用户权限
      const permissions = await UserModel.getUserPermissions(user.id);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            display_name: user.display_name,
            created_at: user.created_at,
            last_login_at: user.last_login_at,
          },
          permissions: {
            hasLeaderboardAccess: permissions?.has_leaderboard_access || false,
            hasAdFreeAccess: permissions?.has_ad_free_access || false,
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_PROFILE_FAILED',
          message: 'Failed to get user profile',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }
  }

  // 购买排行榜通行证
  static async purchaseLeaderboardAccess(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] as string || 'unknown',
          },
        });
        return;
      }

      // 检查用户是否已经有排行榜权限
      const permissions = await UserModel.getUserPermissions(req.user.userId);
      if (permissions?.has_leaderboard_access) {
        res.status(409).json({
          success: false,
          error: {
            code: 'ALREADY_HAS_ACCESS',
            message: 'User already has leaderboard access',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] as string || 'unknown',
          },
        });
        return;
      }

      // TODO: 在实际生产环境中，这里应该集成真实的支付系统（如Stripe）
      // 现在为了测试，直接授予权限
      await UserModel.purchaseLeaderboardAccess(req.user.userId);

      // 清除缓存中的用户权限，强制下次重新获取
      CacheService.del(`user_permissions:${req.user.userId}`);

      logger.info(`User ${req.user.username} purchased leaderboard access`);

      res.json({
        success: true,
        data: {
          message: 'Leaderboard access purchased successfully',
          hasLeaderboardAccess: true,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    } catch (error) {
      logger.error('Purchase leaderboard access error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PURCHASE_FAILED',
          message: 'Failed to purchase leaderboard access',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }
  }

  // 刷新Token
  static async refreshToken(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] as string || 'unknown',
          },
        });
        return;
      }

      // 获取最新的用户权限
      const permissions = await UserModel.getUserPermissions(req.user.userId);

      // 生成新的JWT token
      const tokenPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
        id: req.user.userId,
        userId: req.user.userId,
        username: req.user.username,
        email: req.user.email,
        permissions: {
          hasLeaderboardAccess: permissions?.has_leaderboard_access || false,
          hasAdFreeAccess: permissions?.has_ad_free_access || false,
        },
      };

      const token = jwt.sign(
        tokenPayload, 
        config.jwtSecret as string, 
        { expiresIn: config.jwtExpiresIn } as SignOptions
      );

      res.json({
        success: true,
        data: {
          token,
          permissions: {
            hasLeaderboardAccess: permissions?.has_leaderboard_access || false,
            hasAdFreeAccess: permissions?.has_ad_free_access || false,
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    } catch (error) {
      logger.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'TOKEN_REFRESH_FAILED',
          message: 'Failed to refresh token',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
    }
  }
}