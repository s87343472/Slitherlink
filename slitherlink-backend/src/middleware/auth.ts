import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { JwtPayload, ApiResponse } from '@/types';
import { UserModel } from '@/models/User';
import { logger } from '@/utils/logger';
import { CacheService } from '@/utils/cache';

// 扩展Request类型，添加用户信息
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// JWT认证中间件
export const authenticateToken = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Access token is required',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
      return;
    }

    // 验证JWT token
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    
    // 检查用户是否仍然存在且活跃
    const user = await UserModel.findById(decoded.userId);
    if (!user || !user.is_active) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found or inactive',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
      return;
    }

    // 将用户信息添加到请求对象
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('JWT authentication error:', error);
    
    let errorCode = 'INVALID_TOKEN';
    let errorMessage = 'Invalid or expired token';

    if (error instanceof jwt.JsonWebTokenError) {
      errorCode = 'INVALID_TOKEN';
      errorMessage = 'Invalid token format';
    } else if (error instanceof jwt.TokenExpiredError) {
      errorCode = 'TOKEN_EXPIRED';
      errorMessage = 'Token has expired';
    }

    res.status(401).json({
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
};

// 检查排行榜权限中间件
export const requireLeaderboardAccess = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
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

    // 检查用户权限（先从缓存查找）
    let permissions = CacheService.getUserPermissions(req.user.userId);
    
    if (!permissions) {
      // 缓存中没有，从数据库获取
      permissions = await UserModel.getUserPermissions(req.user.userId);
      
      if (permissions) {
        // 缓存用户权限
        CacheService.setUserPermissions(req.user.userId, permissions);
      }
    }

    if (!permissions || !(permissions as any).has_leaderboard_access) {
      res.status(403).json({
        success: false,
        error: {
          code: 'LEADERBOARD_ACCESS_REQUIRED',
          message: 'Leaderboard access pass required. Please purchase access to participate in rankings.',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string || 'unknown',
        },
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Permission check error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PERMISSION_CHECK_ERROR',
        message: 'Failed to check user permissions',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string || 'unknown',
      },
    });
  }
};

// 可选认证中间件（允许匿名访问，但如果有token则解析）
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      const user = await UserModel.findById(decoded.userId);
      
      if (user && user.is_active) {
        req.user = decoded;
      }
    }

    next();
  } catch (error) {
    // 可选认证失败时不阻止请求继续
    logger.debug('Optional auth failed:', error);
    next();
  }
};