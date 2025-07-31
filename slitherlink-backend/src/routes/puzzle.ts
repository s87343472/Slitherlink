import { Router } from 'express';
import { PuzzleController } from '../controllers/PuzzleController';
import rateLimit from 'express-rate-limit';

const router = Router();

// 题目获取限流 - 防止恶意消耗题目库存
const puzzleGetLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 10, // 最多10次获取
  message: {
    success: false,
    message: 'Too many puzzle requests, please try again later',
    code: 'PUZZLE_RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 解答验证限流
const solutionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 50, // 最多50次验证
  message: {
    success: false,
    message: 'Too many solution validation requests',
    code: 'SOLUTION_RATE_LIMIT'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route GET /api/puzzle
 * @desc 获取题目（从数据库，不再实时生成）
 * @query {string} difficulty - 难度: easy/medium/difficult
 * @query {number} [size] - 网格大小（可选）
 */
router.get('/', puzzleGetLimiter, PuzzleController.getPuzzle);

/**
 * @route POST /api/puzzle/validate
 * @desc 验证用户解答
 * @body {number} puzzleId - 题目ID
 * @body {number[][]} solution - 用户解答
 */
router.post('/validate', solutionLimiter, PuzzleController.validateSolution);

/**
 * @route GET /api/puzzle/stats
 * @desc 获取题目库存统计
 */
router.get('/stats', PuzzleController.getStats);

/**
 * @route GET /api/puzzle/performance
 * @desc 性能对比：数据库检索 vs 实时生成
 */
router.get('/performance', PuzzleController.performanceComparison);

/**
 * @route GET /api/puzzle/:id
 * @desc 根据ID获取题目详情（管理员功能）
 */
router.get('/:id', PuzzleController.getPuzzleById);

export default router;