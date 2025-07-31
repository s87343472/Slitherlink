import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';
import { authenticateToken } from '@/middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

// 认证相关的限流配置
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 每个IP最多5次认证请求
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_AUTH_ATTEMPTS',
      message: 'Too many authentication attempts, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const purchaseLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 3, // 每个IP最多3次购买请求
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_PURCHASE_ATTEMPTS',
      message: 'Too many purchase attempts, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 用户注册
router.post('/register', authLimiter, AuthController.register);

// 用户登录
router.post('/login', authLimiter, AuthController.login);

// 获取当前用户信息 (需要认证)
router.get('/profile', authenticateToken, AuthController.getProfile);

// 刷新Token (需要认证)
router.post('/refresh-token', authenticateToken, AuthController.refreshToken);

// 购买排行榜通行证 (需要认证)
router.post('/purchase/leaderboard-access', 
  purchaseLimiter, 
  authenticateToken, 
  AuthController.purchaseLeaderboardAccess
);

export default router;