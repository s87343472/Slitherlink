import { Router } from 'express';
import { DailyChallengeController } from '../controllers/DailyChallengeController';
import rateLimit from 'express-rate-limit';

const router = Router();

// 每日挑战获取限流
const challengeGetLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 20, // 最多20次请求
  message: {
    success: false,
    message: 'Too many daily challenge requests, please try again later',
    code: 'DAILY_CHALLENGE_RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 管理操作限流（更严格）
const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5分钟
  max: 5, // 最多5次请求
  message: {
    success: false,
    message: 'Too many admin requests, please try again later',
    code: 'ADMIN_RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route GET /api/v1/daily-challenge
 * @desc 获取今日挑战
 */
router.get('/', challengeGetLimiter, DailyChallengeController.getTodayChallenge);

/**
 * @route GET /api/v1/daily-challenge/:date
 * @desc 获取指定日期的挑战
 * @param {string} date - 日期，格式：YYYY-MM-DD
 */
router.get('/:date', challengeGetLimiter, DailyChallengeController.getChallengeByDate);

/**
 * @route GET /api/v1/daily-challenge/admin/stats
 * @desc 获取每日挑战统计信息
 */
router.get('/admin/stats', adminLimiter, DailyChallengeController.getStats);

/**
 * @route POST /api/v1/daily-challenge/admin/generate
 * @desc 预生成未来挑战（管理员功能）
 * @body {number} days - 要生成的天数（1-30）
 */
router.post('/admin/generate', adminLimiter, DailyChallengeController.preGenerateChallenges);

/**
 * @route POST /api/v1/daily-challenge/admin/check-stock
 * @desc 检查并补充挑战库存
 */
router.post('/admin/check-stock', adminLimiter, DailyChallengeController.checkStock);

export default router;