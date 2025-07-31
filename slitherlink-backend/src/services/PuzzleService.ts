import { db } from '@/models/database';
import { Puzzle, PuzzleData, SolutionData, PuzzleStockLevels } from '@/types';
import { algorithmService } from './AlgorithmService';
import { logger } from '@/utils/logger';
import { CacheService } from '@/utils/cache';
import crypto from 'crypto';

export class PuzzleService {
  // 生成题目哈希
  private static generatePuzzleHash(clues: (number | null)[][]): string {
    const cluesString = JSON.stringify(clues);
    return crypto.createHash('sha256').update(cluesString).digest('hex');
  }

  // 解析Java算法服务返回的数据
  private static parsePuzzleData(
    algorithmResponse: any,
    gridSize: number,
    _difficulty: string
  ): { puzzleData: PuzzleData; solutionData: SolutionData; javaSeed: number } {
    // 解析题目数据
    const clues = JSON.parse(algorithmResponse.count) as (number | null)[][];
    const pairs = JSON.parse(algorithmResponse.pairs) as number[][];
    
    // 解析种子信息
    const seedParts = algorithmResponse.seed.split('-');
    const javaSeed = parseInt(seedParts[2]);

    const puzzleData: PuzzleData = {
      clues,
      gridSize,
    };

    const solutionData: SolutionData = {
      pairs,
      edges: pairs.map(([from, to]) => ({
        from,
        to,
        isPath: true,
      })),
    };

    return { puzzleData, solutionData, javaSeed };
  }

  // 批量生成题目
  static async batchGeneratePuzzles(requests: {
    difficulty: 'easy' | 'medium' | 'difficult';
    usageType: 'daily' | 'regular';
    count: number;
    gridSize?: number;
  }[]): Promise<{
    totalGenerated: number;
    totalFailed: number;
    results: { difficulty: string; generated: number; failed: number }[];
  }> {
    const results: { difficulty: string; generated: number; failed: number }[] = [];
    let totalGenerated = 0;
    let totalFailed = 0;

    for (const request of requests) {
      const gridSize = request.gridSize || this.getDefaultGridSize(request.difficulty);
      let generated = 0;
      let failed = 0;

      logger.info(`Generating ${request.count} ${request.difficulty} puzzles for ${request.usageType}`);

      for (let i = 0; i < request.count; i++) {
        try {
          // 生成题目
          const algorithmResponse = await algorithmService.generatePuzzle(gridSize, request.difficulty);
          
          // 解析数据
          const { puzzleData, solutionData, javaSeed } = this.parsePuzzleData(
            algorithmResponse,
            gridSize,
            request.difficulty
          );

          // 生成哈希
          const puzzleHash = this.generatePuzzleHash(puzzleData.clues);

          // 检查是否已存在相同题目
          const existingPuzzle = await db<Puzzle>('puzzles')
            .where('puzzle_hash', puzzleHash)
            .first();

          if (existingPuzzle) {
            logger.debug(`Duplicate puzzle detected, skipping: ${puzzleHash}`);
            continue;
          }

          // 存储到数据库
          await db<Puzzle>('puzzles').insert({
            puzzle_hash: puzzleHash,
            grid_size: gridSize,
            difficulty: request.difficulty,
            usage_type: request.usageType,
            puzzle_data: puzzleData,
            solution_data: solutionData,
            java_seed: javaSeed,
            estimated_duration: this.estimateDuration(request.difficulty, gridSize),
            created_at: new Date(),
            used_count: 0,
          });

          generated++;
          
          // 添加延迟避免过载
          if (i < request.count - 1) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        } catch (error) {
          failed++;
          logger.warn(`Failed to generate puzzle ${i + 1}/${request.count}:`, error);
        }
      }

      results.push({
        difficulty: request.difficulty,
        generated,
        failed,
      });

      totalGenerated += generated;
      totalFailed += failed;
    }

    // 清除库存缓存
    CacheService.del('puzzle_stock');
    
    logger.info(`Batch generation completed: ${totalGenerated} generated, ${totalFailed} failed`);
    
    return {
      totalGenerated,
      totalFailed,
      results,
    };
  }

  // 获取默认网格大小
  private static getDefaultGridSize(difficulty: string): number {
    switch (difficulty) {
      case 'easy':
        return 7;
      case 'medium':
        return 10;
      case 'difficult':
        return 12;
      default:
        return 8;
    }
  }

  // 估算完成时间（秒）
  private static estimateDuration(difficulty: string, gridSize: number): number {
    const baseTime = gridSize * gridSize * 2; // 基础时间
    
    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      difficult: 2.5,
    }[difficulty] || 1;

    return Math.round(baseTime * difficultyMultiplier);
  }

  // 获取可用题目
  static async getAvailablePuzzle(
    difficulty: 'easy' | 'medium' | 'difficult',
    usageType: 'daily' | 'regular',
    gridSize?: number,
    _excludeRecentDays = 30
  ): Promise<Puzzle | null> {
    try {
      let query = db<Puzzle>('puzzles')
        .where('difficulty', difficulty)
        .where('usage_type', usageType)
        .whereNull('used_at');

      // 如果指定了网格大小，添加筛选条件
      if (gridSize) {
        query = query.where('grid_size', gridSize);
      }

      const puzzle = await query
        .orderByRaw('RANDOM()')
        .first();

      return puzzle || null;
    } catch (error) {
      logger.error('Error getting available puzzle:', error);
      throw error;
    }
  }

  // 标记题目为已使用
  static async markPuzzleAsUsed(
    puzzleId: number,
    userId?: number,
    usageContext = 'regular_play'
  ): Promise<void> {
    try {
      await db.transaction(async (trx) => {
        // 更新题目使用状态
        await trx<Puzzle>('puzzles')
          .where('id', puzzleId)
          .update({
            used_at: new Date(),
            used_count: trx.raw('used_count + 1'),
          });

        // 记录使用日志
        await trx('puzzle_usage_logs').insert({
          puzzle_id: puzzleId,
          user_id: userId,
          used_date: new Date(),
          usage_context: usageContext,
          created_at: new Date(),
        });
      });

      logger.info(`Puzzle ${puzzleId} marked as used by user ${userId || 'anonymous'}`);
    } catch (error) {
      logger.error('Error marking puzzle as used:', error);
      throw error;
    }
  }

  // 获取库存水平
  static async getStockLevels(): Promise<PuzzleStockLevels> {
    // const cacheKey = 'puzzle_stock';
    const cached = CacheService.getPuzzleStock<PuzzleStockLevels>();
    if (cached) {
      return cached;
    }

    try {
      const results = await db<Puzzle>('puzzles')
        .select('usage_type', 'difficulty')
        .count('* as count')
        .whereNull('used_at')
        .groupBy('usage_type', 'difficulty');

      const stockLevels: PuzzleStockLevels = {
        daily: { easy: 0, medium: 0, difficult: 0, total: 0 },
        regular: { easy: 0, medium: 0, difficult: 0, total: 0 },
        total: 0,
      };

      results.forEach((row: any) => {
        const count = parseInt(row.count);
        const usageType = row.usage_type as 'daily' | 'regular';
        const difficulty = row.difficulty as 'easy' | 'medium' | 'difficult';
        
        stockLevels[usageType][difficulty] = count;
        stockLevels[usageType].total += count;
      });

      stockLevels.total = stockLevels.daily.total + stockLevels.regular.total;

      // 缓存5分钟
      CacheService.setPuzzleStock(stockLevels);
      
      return stockLevels;
    } catch (error) {
      logger.error('Error getting stock levels:', error);
      throw error;
    }
  }

  // 检查并补充库存
  static async checkAndReplenishStock(): Promise<{
    needed: boolean;
    generated: number;
    failed: number;
  }> {
    try {
      const stockLevels = await this.getStockLevels();
      
      const replenishmentNeeded = [
        { condition: stockLevels.daily.total < 50, type: 'daily' as const },
        { condition: stockLevels.regular.total < 200, type: 'regular' as const },
      ];

      let totalGenerated = 0;
      let totalFailed = 0;
      let needed = false;

      for (const { condition, type } of replenishmentNeeded) {
        if (!condition) continue;
        
        needed = true;
        logger.info(`Stock replenishment needed for ${type} puzzles`);
        
        const requests = [
          { difficulty: 'easy' as const, usageType: type, count: type === 'daily' ? 30 : 100 },
          { difficulty: 'medium' as const, usageType: type, count: type === 'daily' ? 40 : 150 },
          { difficulty: 'difficult' as const, usageType: type, count: type === 'daily' ? 30 : 100 },
        ];

        const result = await this.batchGeneratePuzzles(requests);
        totalGenerated += result.totalGenerated;
        totalFailed += result.totalFailed;
      }

      if (needed) {
        logger.info(`Stock replenishment completed: ${totalGenerated} generated, ${totalFailed} failed`);
      }

      return {
        needed,
        generated: totalGenerated,
        failed: totalFailed,
      };
    } catch (error) {
      logger.error('Error in stock replenishment:', error);
      throw error;
    }
  }

  // 初始化题目库
  static async initializePuzzleLibrary(): Promise<{
    success: boolean;
    generated: number;
    failed: number;
  }> {
    try {
      logger.info('Starting puzzle library initialization...');
      
      const requests = [
        // 每日挑战题目
        { difficulty: 'easy' as const, usageType: 'daily' as const, count: 30 },
        { difficulty: 'medium' as const, usageType: 'daily' as const, count: 40 },
        { difficulty: 'difficult' as const, usageType: 'daily' as const, count: 30 },
        
        // 常规游戏题目
        { difficulty: 'easy' as const, usageType: 'regular' as const, count: 200 },
        { difficulty: 'medium' as const, usageType: 'regular' as const, count: 200 },
        { difficulty: 'difficult' as const, usageType: 'regular' as const, count: 100 },
      ];

      const result = await this.batchGeneratePuzzles(requests);
      
      logger.info(`Puzzle library initialization completed: ${result.totalGenerated} generated, ${result.totalFailed} failed`);
      
      return {
        success: result.totalGenerated > 0,
        generated: result.totalGenerated,
        failed: result.totalFailed,
      };
    } catch (error) {
      logger.error('Error initializing puzzle library:', error);
      throw error;
    }
  }

  // 根据ID获取题目
  static async getPuzzleById(id: number): Promise<Puzzle | null> {
    try {
      const puzzle = await db<Puzzle>('puzzles').where('id', id).first();
      return puzzle || null;
    } catch (error) {
      logger.error('Error getting puzzle by id:', error);
      throw error;
    }
  }

  // 验证用户解答
  static async validateUserSolution(
    puzzleId: number,
    userSolution: number[][]
  ): Promise<{ isCorrect: boolean; errors: string[] }> {
    try {
      const puzzle = await this.getPuzzleById(puzzleId);
      if (!puzzle) {
        return { isCorrect: false, errors: ['Puzzle not found'] };
      }

      // 这里应该实现具体的解答验证逻辑
      // 暂时返回基本验证
      const errors: string[] = [];
      
      // 检查解答格式
      if (!Array.isArray(userSolution) || userSolution.length === 0) {
        errors.push('Invalid solution format');
      }

      return {
        isCorrect: errors.length === 0,
        errors,
      };
    } catch (error) {
      logger.error('Error validating user solution:', error);
      return { isCorrect: false, errors: ['Validation error'] };
    }
  }
}

export const puzzleService = PuzzleService;