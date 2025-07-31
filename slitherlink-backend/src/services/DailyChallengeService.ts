import { db } from '@/models/database';
import { Puzzle } from '@/types';
import { logger } from '@/utils/logger';
import { puzzleService } from './PuzzleService';

export class DailyChallengeService {
  /**
   * 获取每日挑战配置
   * 根据PRD：每天不同难度和网格大小
   */
  private static getDailySchedule(date: Date): { 
    gridSize: number; 
    difficulty: 'easy' | 'medium' | 'difficult';
    displayName: string;
  } {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ...
    
    const schedule = {
      0: { gridSize: 10, difficulty: 'difficult' as const, displayName: '困难' }, // Sunday
      1: { gridSize: 5, difficulty: 'easy' as const, displayName: '简单' },       // Monday
      2: { gridSize: 7, difficulty: 'medium' as const, displayName: '中等' },     // Tuesday
      3: { gridSize: 10, difficulty: 'difficult' as const, displayName: '困难' }, // Wednesday
      4: { gridSize: 7, difficulty: 'medium' as const, displayName: '中等' },     // Thursday
      5: { gridSize: 12, difficulty: 'difficult' as const, displayName: '大师' }, // Friday
      6: { gridSize: 15, difficulty: 'difficult' as const, displayName: '忍者' }, // Saturday
    };

    return schedule[dayOfWeek as keyof typeof schedule];
  }

  /**
   * 获取指定日期的每日挑战
   */
  static async getDailyChallenge(targetDate?: string): Promise<Puzzle | null> {
    const date = targetDate ? new Date(targetDate) : new Date();
    const dateString = date.toISOString().split('T')[0];
    
    try {
      // 首先检查是否已有指定日期的挑战
      const existingChallenge = await db('daily_challenges')
        .where('challenge_date', dateString)
        .first();

      if (existingChallenge) {
        // 获取对应的谜题详情
        const puzzle = await db<Puzzle>('puzzles')
          .where('id', existingChallenge.puzzle_id)
          .first();
        
        logger.info(`Found existing daily challenge for ${dateString}: puzzle ${existingChallenge.puzzle_id}`);
        return puzzle || null;
      }

      // 生成新的每日挑战
      return await this.generateDailyChallenge(date);
    } catch (error) {
      logger.error('Error getting daily challenge:', error);
      return null;
    }
  }

  /**
   * 生成指定日期的每日挑战
   */
  private static async generateDailyChallenge(date: Date): Promise<Puzzle | null> {
    const dateString = date.toISOString().split('T')[0];
    const { gridSize, difficulty } = this.getDailySchedule(date);

    try {
      // 首先尝试从daily类型获取，没有则使用regular类型
      let puzzle = await puzzleService.getAvailablePuzzle(
        difficulty, 
        'daily', 
        gridSize,
        30 // 30天内不重复
      );

      if (!puzzle) {
        logger.info(`No daily ${difficulty} ${gridSize}x${gridSize} puzzle found, trying regular puzzles...`);
        
        // 从regular类型的谜题中获取
        puzzle = await puzzleService.getAvailablePuzzle(
          difficulty,
          'regular',
          gridSize,
          30
        );

        if (!puzzle) {
          logger.error(`No ${difficulty} ${gridSize}x${gridSize} puzzle available for daily challenge ${dateString}`);
          return null;
        }

        logger.info(`Using regular puzzle ${puzzle.id} for daily challenge ${dateString}`);
      }

      // 保存每日挑战记录
      await this.saveDailyChallenge(dateString, puzzle.id);
      
      // 标记谜题为已使用
      await puzzleService.markPuzzleAsUsed(puzzle.id, undefined, 'daily_challenge');

      logger.info(`Generated daily challenge for ${dateString}: puzzle ${puzzle.id} (${gridSize}x${gridSize} ${difficulty})`);
      return puzzle;

    } catch (error) {
      logger.error(`Error generating daily challenge for ${dateString}:`, error);
      return null;
    }
  }

  /**
   * 保存每日挑战记录
   */
  private static async saveDailyChallenge(challengeDate: string, puzzleId: number): Promise<void> {
    try {
      // 使用 INSERT ... ON CONFLICT DO NOTHING 避免重复
      await db.raw(`
        INSERT INTO daily_challenges (challenge_date, puzzle_id, created_at)
        VALUES (?, ?, NOW())
        ON CONFLICT (challenge_date) DO NOTHING
      `, [challengeDate, puzzleId]);
      
      logger.info(`Saved daily challenge record: ${challengeDate} -> puzzle ${puzzleId}`);
    } catch (error) {
      logger.error('Error saving daily challenge record:', error);
      throw error;
    }
  }

  /**
   * 批量预生成未来几天的挑战
   */
  static async preGenerateChallenges(days: number = 7): Promise<{
    generated: number;
    failed: number;
    results: { date: string; success: boolean; puzzleId?: number; error?: string }[];
  }> {
    const results: { date: string; success: boolean; puzzleId?: number; error?: string }[] = [];
    let generated = 0;
    let failed = 0;

    logger.info(`Pre-generating daily challenges for next ${days} days...`);

    for (let i = 0; i < days; i++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + i);
      const dateString = targetDate.toISOString().split('T')[0];

      try {
        // 检查是否已存在
        const existing = await db('daily_challenges')
          .where('challenge_date', dateString)
          .first();

        if (existing) {
          results.push({ date: dateString, success: true, puzzleId: existing.puzzle_id });
          generated++;
          continue;
        }

        // 生成新挑战
        const puzzle = await this.generateDailyChallenge(targetDate);
        
        if (puzzle) {
          results.push({ date: dateString, success: true, puzzleId: puzzle.id });
          generated++;
        } else {
          results.push({ date: dateString, success: false, error: 'No puzzle available' });
          failed++;
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.push({ date: dateString, success: false, error: errorMsg });
        failed++;
        logger.warn(`Failed to generate daily challenge for ${dateString}:`, error);
      }
    }

    logger.info(`Daily challenge pre-generation completed: ${generated} generated, ${failed} failed`);
    
    return { generated, failed, results };
  }

  /**
   * 获取每日挑战统计信息
   */
  static async getDailyChallengeStats(): Promise<{
    totalChallenges: number;
    upcomingChallenges: number;
    recentChallenges: { date: string; puzzleId: number; gridSize: number; difficulty: string }[];
  }> {
    try {
      // 总挑战数
      const totalResult = await db('daily_challenges').count('* as count').first();
      const totalChallenges = parseInt(totalResult?.count as string) || 0;

      // 未来7天的挑战数
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      const upcomingResult = await db('daily_challenges')
        .where('challenge_date', '>', new Date().toISOString().split('T')[0])
        .where('challenge_date', '<=', futureDate.toISOString().split('T')[0])
        .count('* as count')
        .first();
      
      const upcomingChallenges = parseInt(upcomingResult?.count as string) || 0;

      // 最近7天的挑战详情
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7);
      
      const recentChallenges = await db('daily_challenges')
        .join('puzzles', 'daily_challenges.puzzle_id', 'puzzles.id')
        .select(
          'daily_challenges.challenge_date as date',
          'daily_challenges.puzzle_id as puzzleId',
          'puzzles.grid_size as gridSize',
          'puzzles.difficulty'
        )
        .where('challenge_date', '>=', pastDate.toISOString().split('T')[0])
        .orderBy('challenge_date', 'desc')
        .limit(7);

      return {
        totalChallenges,
        upcomingChallenges,
        recentChallenges: recentChallenges.map(row => ({
          date: row.date,
          puzzleId: row.puzzleId,
          gridSize: row.gridSize,
          difficulty: row.difficulty
        }))
      };

    } catch (error) {
      logger.error('Error getting daily challenge stats:', error);
      throw error;
    }
  }

  /**
   * 检查并补充每日挑战库存
   */
  static async checkAndReplenishDailyChallenges(): Promise<{
    needed: boolean;
    generated: number;
    failed: number;
  }> {
    try {
      const stats = await this.getDailyChallengeStats();
      
      // 如果未来7天的挑战少于5个，预生成14天的挑战
      if (stats.upcomingChallenges < 5) {
        logger.info(`Only ${stats.upcomingChallenges} upcoming challenges, generating more...`);
        
        const result = await this.preGenerateChallenges(14);
        
        return {
          needed: true,
          generated: result.generated,
          failed: result.failed
        };
      }

      return { needed: false, generated: 0, failed: 0 };
      
    } catch (error) {
      logger.error('Error checking daily challenge stock:', error);
      throw error;
    }
  }
}

export const dailyChallengeService = DailyChallengeService;