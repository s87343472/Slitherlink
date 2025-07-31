import { Request, Response } from 'express';
import { puzzleService } from '../services/PuzzleService';
import { logger } from '../utils/logger';
import { z } from 'zod';

// 请求验证schema
const getPuzzleSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'difficult']),
  size: z.coerce.number().int().min(5).max(15).optional()
});

const validateSolutionSchema = z.object({
  puzzleId: z.coerce.number().int().positive(),
  solution: z.array(z.array(z.number()))
});

export class PuzzleController {
  
  /**
   * 获取题目 - 从数据库获取而不是实时生成
   */
  static async getPuzzle(req: Request, res: Response): Promise<void> {
    try {
      const { difficulty, size } = getPuzzleSchema.parse(req.query);
      
      logger.info(`Fetching puzzle from database: ${difficulty} ${size ? size + 'x' + size : ''}`);
      
      // 从数据库获取可用的题目
      const puzzle = await puzzleService.getAvailablePuzzle(difficulty, 'regular', size);
      
      if (!puzzle) {
        res.status(404).json({
          success: false,
          message: `No available ${difficulty} puzzles found in database`,
          code: 'NO_PUZZLES_AVAILABLE'
        });
        return;
      }
      
      // 标记为已使用
      await puzzleService.markPuzzleAsUsed(puzzle.id);
      
      // 解析题目数据
      const puzzleData = typeof puzzle.puzzle_data === 'string' 
        ? JSON.parse(puzzle.puzzle_data) 
        : puzzle.puzzle_data;
      
      // const solutionData = typeof puzzle.solution_data === 'string'
      //   ? JSON.parse(puzzle.solution_data)
      //   : puzzle.solution_data;
      
      res.json({
        success: true,
        data: {
          id: puzzle.id,
          puzzle_hash: puzzle.puzzle_hash,
          grid_size: puzzle.grid_size,
          difficulty: puzzle.difficulty,
          estimated_duration: puzzle.estimated_duration,
          puzzle_data: puzzleData,
          // 不返回解答给前端
          // solution_data: solutionData  
        },
        message: `Retrieved ${difficulty} puzzle from database`
      });
      
      logger.info(`Served puzzle from database: ${puzzle.id} (${difficulty})`);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Invalid request parameters',
          errors: error.issues
        });
        return;
      }
      
      logger.error('Error getting puzzle from database:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get puzzle from database',
        code: 'PUZZLE_FETCH_ERROR'
      });
    }
  }
  
  /**
   * 验证用户解答
   */
  static async validateSolution(req: Request, res: Response): Promise<void> {
    try {
      const { puzzleId, solution } = validateSolutionSchema.parse(req.body);
      
      logger.info(`Validating solution for puzzle: ${puzzleId}`);
      
      const result = await puzzleService.validateUserSolution(puzzleId, solution);
      
      res.json({
        success: true,
        data: {
          is_correct: result.isCorrect,
          errors: result.errors
        }
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Invalid request data',
          errors: error.issues
        });
        return;
      }
      
      logger.error('Error validating solution:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate solution'
      });
    }
  }
  
  /**
   * 获取题目统计信息
   */
  static async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const stockLevels = await puzzleService.getStockLevels();
      
      res.json({
        success: true,
        data: {
          stock_levels: stockLevels,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      logger.error('Error getting puzzle stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get puzzle statistics'
      });
    }
  }
  
  /**
   * 获取指定ID的题目详情（管理员用）
   */
  static async getPuzzleById(req: Request, res: Response): Promise<void> {
    try {
      const puzzleId = parseInt(req.params.id);
      if (isNaN(puzzleId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid puzzle ID'
        });
        return;
      }
      
      const puzzle = await puzzleService.getPuzzleById(puzzleId);
      
      if (!puzzle) {
        res.status(404).json({
          success: false,
          message: 'Puzzle not found'
        });
        return;
      }
      
      // 解析数据
      const puzzleData = typeof puzzle.puzzle_data === 'string' 
        ? JSON.parse(puzzle.puzzle_data) 
        : puzzle.puzzle_data;
      
      const solutionData = typeof puzzle.solution_data === 'string'
        ? JSON.parse(puzzle.solution_data)
        : puzzle.solution_data;
      
      res.json({
        success: true,
        data: {
          ...puzzle,
          puzzle_data: puzzleData,
          solution_data: solutionData
        }
      });
      
    } catch (error) {
      logger.error('Error getting puzzle by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get puzzle'
      });
    }
  }
  
  /**
   * 性能比较：数据库 vs 实时生成
   */
  static async performanceComparison(req: Request, res: Response): Promise<void> {
    try {
      const difficulty = (req.query.difficulty as string) || 'easy';
      
      // 测试数据库获取时间
      const dbStart = Date.now();
      const dbPuzzle = await puzzleService.getAvailablePuzzle(difficulty as any, 'regular');
      const dbTime = Date.now() - dbStart;
      
      // 模拟实时生成时间（基于之前的测试结果）
      const estimatedGenerationTime = {
        'easy': 50,     // 50ms for 5x5
        'medium': 2000, // 2s for 7x7
        'difficult': 5000 // 5s for 10x10
      };
      
      res.json({
        success: true,
        data: {
          database_retrieval: {
            time_ms: dbTime,
            available: !!dbPuzzle
          },
          estimated_generation: {
            time_ms: estimatedGenerationTime[difficulty as keyof typeof estimatedGenerationTime] || 1000
          },
          performance_improvement: {
            faster_by_ms: (estimatedGenerationTime[difficulty as keyof typeof estimatedGenerationTime] || 1000) - dbTime,
            speed_ratio: Math.round((estimatedGenerationTime[difficulty as keyof typeof estimatedGenerationTime] || 1000) / dbTime * 100) / 100
          }
        }
      });
      
    } catch (error) {
      logger.error('Error in performance comparison:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform comparison'
      });
    }
  }
}