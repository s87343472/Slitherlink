import { Request, Response } from 'express';
import { dailyChallengeService } from '../services/DailyChallengeService';
import { logger } from '../utils/logger';

export class DailyChallengeController {
  /**
   * 获取今日挑战
   */
  static async getTodayChallenge(_req: Request, res: Response): Promise<void> {
    try {
      const puzzle = await dailyChallengeService.getDailyChallenge();
      
      if (!puzzle) {
        res.status(404).json({
          success: false,
          message: 'No daily challenge available for today',
          code: 'NO_DAILY_CHALLENGE'
        });
        return;
      }

      // 解析谜题数据
      const puzzleData = typeof puzzle.puzzle_data === 'string' 
        ? JSON.parse(puzzle.puzzle_data) 
        : puzzle.puzzle_data;

      res.json({
        success: true,
        data: {
          id: puzzle.id,
          puzzle_hash: puzzle.puzzle_hash,
          grid_size: puzzle.grid_size,
          difficulty: puzzle.difficulty,
          estimated_duration: puzzle.estimated_duration,
          puzzle_data: puzzleData,
          challenge_date: new Date().toISOString().split('T')[0]
        },
        message: 'Today\'s daily challenge retrieved successfully'
      });

    } catch (error) {
      logger.error('Error getting today\'s challenge:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get daily challenge'
      });
    }
  }

  /**
   * 获取指定日期的挑战
   */
  static async getChallengeByDate(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.params;
      
      // 验证日期格式
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD'
        });
        return;
      }

      const puzzle = await dailyChallengeService.getDailyChallenge(date);
      
      if (!puzzle) {
        res.status(404).json({
          success: false,
          message: `No daily challenge available for ${date}`,
          code: 'NO_DAILY_CHALLENGE'
        });
        return;
      }

      // 解析谜题数据
      const puzzleData = typeof puzzle.puzzle_data === 'string' 
        ? JSON.parse(puzzle.puzzle_data) 
        : puzzle.puzzle_data;

      res.json({
        success: true,
        data: {
          id: puzzle.id,
          puzzle_hash: puzzle.puzzle_hash,
          grid_size: puzzle.grid_size,
          difficulty: puzzle.difficulty,
          estimated_duration: puzzle.estimated_duration,
          puzzle_data: puzzleData,
          challenge_date: date
        },
        message: `Daily challenge for ${date} retrieved successfully`
      });

    } catch (error) {
      logger.error('Error getting challenge by date:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get daily challenge'
      });
    }
  }

  /**
   * 预生成未来挑战（管理员功能）
   */
  static async preGenerateChallenges(req: Request, res: Response): Promise<void> {
    try {
      const { days = 7 } = req.body;
      
      if (typeof days !== 'number' || days < 1 || days > 30) {
        res.status(400).json({
          success: false,
          message: 'Days must be between 1 and 30'
        });
        return;
      }

      logger.info(`Pre-generating ${days} daily challenges...`);
      const result = await dailyChallengeService.preGenerateChallenges(days);

      res.json({
        success: true,
        data: {
          generated: result.generated,
          failed: result.failed,
          results: result.results
        },
        message: `Pre-generated ${result.generated} daily challenges`
      });

    } catch (error) {
      logger.error('Error pre-generating challenges:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to pre-generate challenges'
      });
    }
  }

  /**
   * 获取每日挑战统计信息
   */
  static async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await dailyChallengeService.getDailyChallengeStats();

      res.json({
        success: true,
        data: stats,
        message: 'Daily challenge stats retrieved successfully'
      });

    } catch (error) {
      logger.error('Error getting daily challenge stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get daily challenge stats'
      });
    }
  }

  /**
   * 检查并补充挑战库存
   */
  static async checkStock(_req: Request, res: Response): Promise<void> {
    try {
      const result = await dailyChallengeService.checkAndReplenishDailyChallenges();

      res.json({
        success: true,
        data: {
          replenishment_needed: result.needed,
          generated: result.generated,
          failed: result.failed
        },
        message: result.needed 
          ? `Replenished daily challenges: ${result.generated} generated, ${result.failed} failed`
          : 'Daily challenge stock is sufficient'
      });

    } catch (error) {
      logger.error('Error checking daily challenge stock:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check daily challenge stock'
      });
    }
  }
}