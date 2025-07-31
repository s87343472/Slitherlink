import { Knex } from 'knex';
import { LeaderboardEntry, LeaderboardResponse, LeaderboardType, LeaderboardStats } from '../models/LeaderboardEntry';

export class LeaderboardService {
  constructor(private db: Knex) {}

  /**
   * Submit a game score to leaderboard (only for paid users)
   */
  async submitScore(userId: number, puzzleId: number, completionTime: number, errorCount: number): Promise<void> {
    // Check if user has leaderboard pass
    const hasPass = await this.checkLeaderboardPass(userId);
    if (!hasPass) {
      throw new Error('Leaderboard pass required to submit scores');
    }

    // Get puzzle info for scoring
    const puzzle = await this.db.raw(
      'SELECT grid_size, difficulty FROM puzzles WHERE id = $1',
      [puzzleId]
    );
    
    if (puzzle.rows.length === 0) {
      throw new Error('Puzzle not found');
    }

    const { grid_size, difficulty } = puzzle.rows[0];
    const score = this.calculateScore(difficulty, completionTime, errorCount);

    // Get user name
    const userResult = await this.db.raw(
      'SELECT display_name FROM users WHERE id = $1',
      [userId]
    );
    const userName = userResult.rows[0]?.display_name || 'Anonymous';

    // Insert score
    await this.db.raw(`
      INSERT INTO leaderboard_entries 
      (user_id, user_name, puzzle_id, score, completion_time, error_count, difficulty, grid_size, submitted_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `, [userId, userName, puzzleId, score, completionTime, errorCount, difficulty, grid_size]);
  }

  /**
   * Calculate score based on PRD formula
   */
  private calculateScore(difficulty: string, completionTimeSeconds: number, errorCount: number): number {
    // Base scores by difficulty (PRD Section 4.2.3)
    const baseScores = {
      'easy': 1000,
      'medium': 1500, 
      'hard': 2000,
      'master': 2500,
      'ninja': 3000
    };

    // Estimated completion times (minutes)
    const estimatedTimes = {
      'easy': 5 * 60,     // 5 minutes
      'medium': 8 * 60,   // 8 minutes
      'hard': 12 * 60,    // 12 minutes
      'master': 18 * 60,  // 18 minutes
      'ninja': 25 * 60    // 25 minutes
    };

    const baseScore = (baseScores as any)[difficulty] || 1000;
    const estimatedTime = (estimatedTimes as any)[difficulty] || 10 * 60;
    
    // Time penalty calculation
    const timePenalty = Math.floor((completionTimeSeconds / estimatedTime) * 200);
    
    // Error penalty
    const errorPenalty = errorCount * 50;
    
    // Final score (minimum 100)
    const finalScore = Math.max(baseScore - timePenalty - errorPenalty, 100);
    
    return finalScore;
  }

  /**
   * Get leaderboard for specific type and time period
   */
  async getLeaderboard(type: LeaderboardType, userId?: number, limit = 100): Promise<LeaderboardResponse> {
    const { whereClause, params } = this.buildTimeFilter(type);
    let paramIndex = params.length;

    // Get top entries
    const topQuery = `
      WITH ranked_entries AS (
        SELECT 
          le.*,
          ROW_NUMBER() OVER (ORDER BY le.score DESC, le.submitted_at ASC) as rank,
          COUNT(*) OVER() as total_participants
        FROM leaderboard_entries le
        ${whereClause}
      )
      SELECT * FROM ranked_entries 
      WHERE rank <= $${++paramIndex}
      ORDER BY rank
    `;

    const topResult = await this.db.raw(topQuery, [...params, limit]);
    
    // Get user's entry if specified and not in top results
    let userEntry = null;
    if (userId) {
      const userInTop = topResult.rows.find((row: any) => row.user_id === userId);
      
      if (!userInTop) {
        const userQuery = `
          WITH ranked_entries AS (
            SELECT 
              le.*,
              ROW_NUMBER() OVER (ORDER BY le.score DESC, le.submitted_at ASC) as rank,
              COUNT(*) OVER() as total_participants
            FROM leaderboard_entries le
            ${whereClause}
          )
          SELECT * FROM ranked_entries 
          WHERE user_id = $${++paramIndex}
          ORDER BY score DESC, submitted_at ASC
          LIMIT 1
        `;
        
        const userResult = await this.db.raw(userQuery, [...params, userId]);
        if (userResult.rows.length > 0) {
          userEntry = this.formatLeaderboardEntry(userResult.rows[0]);
        }
      }
    }

    return {
      entries: topResult.rows.map((row: any) => this.formatLeaderboardEntry(row)),
      userEntry: userEntry!,
      lastUpdated: new Date(),
      period: type
    };
  }

  /**
   * Build time filter for different leaderboard types
   */
  private buildTimeFilter(type: LeaderboardType): { whereClause: string; params: any[] } {
    const now = new Date();
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    switch (type) {
      case 'daily':
        whereClause += ` AND DATE(submitted_at) = DATE($${params.length + 1})`;
        params.push(now.toISOString().split('T')[0]);
        break;
        
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        whereClause += ` AND submitted_at >= $${params.length + 1}`;
        params.push(weekStart);
        break;
        
      case 'monthly':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        whereClause += ` AND submitted_at >= $${params.length + 1}`;
        params.push(monthStart);
        break;
        
      case 'total':
        // No time filter for total leaderboard
        break;
    }

    return { whereClause, params };
  }

  /**
   * Format database row to LeaderboardEntry with stats
   */
  private formatLeaderboardEntry(row: any): LeaderboardEntry & LeaderboardStats {
    const totalParticipants = parseInt(row.total_participants) || 1;
    const rank = parseInt(row.rank) || 1;
    const percentile = Math.round((1 - (rank - 1) / totalParticipants) * 100);

    return {
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      puzzleId: row.puzzle_id,
      score: row.score,
      completionTime: row.completion_time,
      errorCount: row.error_count,
      submittedAt: new Date(row.submitted_at),
      difficulty: row.difficulty,
      gridSize: row.grid_size,
      rank,
      totalParticipants,
      percentile
    };
  }

  /**
   * Check if user has purchased leaderboard pass
   */
  private async checkLeaderboardPass(userId: number): Promise<boolean> {
    const result = await this.db.raw(`
      SELECT 1 FROM user_purchases 
      WHERE user_id = $1 AND product_type = 'leaderboard_pass' AND is_active = true
    `, [userId]);
    
    return result.rows.length > 0;
  }

  /**
   * Get user's ranking statistics
   */
  async getUserRankingStats(userId: number): Promise<{
    daily?: LeaderboardStats;
    weekly?: LeaderboardStats; 
    monthly?: LeaderboardStats;
    total?: LeaderboardStats;
  }> {
    const stats = {};
    
    for (const type of ['daily', 'weekly', 'monthly', 'total'] as LeaderboardType[]) {
      const { whereClause, params } = this.buildTimeFilter(type);
      
      const query = `
        WITH ranked_entries AS (
          SELECT 
            user_id,
            ROW_NUMBER() OVER (ORDER BY score DESC, submitted_at ASC) as rank,
            COUNT(*) OVER() as total_participants
          FROM leaderboard_entries le
          ${whereClause}
        )
        SELECT rank, total_participants 
        FROM ranked_entries 
        WHERE user_id = $${params.length + 1}
        LIMIT 1
      `;
      
      const result = await this.db.raw(query, [...params, userId]);
      
      if (result.rows.length > 0) {
        const { rank, total_participants } = result.rows[0];
        const percentile = Math.round((1 - (rank - 1) / total_participants) * 100);
        
        (stats as any)[type] = {
          rank: parseInt(rank),
          totalParticipants: parseInt(total_participants),
          percentile
        };
      }
    }
    
    return stats;
  }
}