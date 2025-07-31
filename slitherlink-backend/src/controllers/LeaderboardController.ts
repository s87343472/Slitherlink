import { Router } from 'express';
import { LeaderboardService } from '../services/LeaderboardService';
import { authenticateToken } from '../middleware/auth';
import { LeaderboardType } from '../models/LeaderboardEntry';

export function createLeaderboardRoutes(leaderboardService: LeaderboardService): Router {
  const router = Router();

  /**
   * Submit game score (POST /api/leaderboard/submit)
   * Required: Authentication, Leaderboard Pass
   */
  router.post('/submit', authenticateToken, async (req, res): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const userId = req.user.id;
      const { puzzleId, completionTime, errorCount } = req.body;

      if (!puzzleId || completionTime === undefined || errorCount === undefined) {
        res.status(400).json({ 
          error: 'Missing required fields: puzzleId, completionTime, errorCount' 
        });
        return;
      }

      if (completionTime < 0 || errorCount < 0) {
        res.status(400).json({ 
          error: 'completionTime and errorCount must be non-negative' 
        });
        return;
      }

      await leaderboardService.submitScore(userId, puzzleId, completionTime, errorCount);
      
      res.json({ 
        message: 'Score submitted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      console.error('Error submitting score:', error);
      
      const err = error as Error;
      if (err && err.message && err.message.includes('Leaderboard pass required')) {
        res.status(403).json({ 
          error: 'Leaderboard pass required to submit scores',
          purchaseRequired: true,
          productType: 'leaderboard_pass'
        });
        return;
      }
      
      res.status(500).json({ 
        error: 'Failed to submit score',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  /**
   * Get leaderboard by type (GET /api/leaderboard/:type)
   * Types: daily, weekly, monthly, total
   * Optional authentication to show user position
   */
  router.get('/:type', async (req, res): Promise<void> => {
    try {
      const type = req.params.type as LeaderboardType;
      const validTypes: LeaderboardType[] = ['daily', 'weekly', 'monthly', 'total'];
      
      if (!validTypes.includes(type)) {
        res.status(400).json({ 
          error: 'Invalid leaderboard type',
          validTypes 
        });
        return;
      }

      const userId = req.user?.id; // Optional - from token if provided
      const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
      
      const leaderboard = await leaderboardService.getLeaderboard(type, userId, limit);
      
      // For free users, add delay simulation (PRD: 1 hour delay)
      if (userId && !await leaderboardService['checkLeaderboardPass'](userId)) {
        leaderboard.lastUpdated = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      }
      
      res.json({
        success: true,
        data: leaderboard,
        meta: {
          type,
          limit,
          hasUserRanking: !!leaderboard.userEntry
        }
      });
    } catch (error: unknown) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ 
        error: 'Failed to fetch leaderboard',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  /**
   * Get user ranking statistics (GET /api/leaderboard/user/stats)
   * Required: Authentication, Leaderboard Pass
   */
  router.get('/user/stats', authenticateToken, async (req, res): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const userId = req.user.id;
      
      const stats = await leaderboardService.getUserRankingStats(userId);
      
      res.json({
        success: true,
        data: stats,
        userId,
        generatedAt: new Date().toISOString()
      });
    } catch (error: unknown) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user ranking statistics',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  });

  /**
   * Get user's purchase status (GET /api/leaderboard/purchase-status)  
   * Required: Authentication
   */
  router.get('/purchase-status', authenticateToken, async (req, res): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const userId = req.user.id;
      
      const hasLeaderboardPass = await leaderboardService['checkLeaderboardPass'](userId);
      
      res.json({
        success: true,
        data: {
          hasLeaderboardPass,
          canSubmitScores: hasLeaderboardPass,
          canViewRealTimeRankings: hasLeaderboardPass
        }
      });
    } catch (error: unknown) {
      console.error('Error checking purchase status:', error);
      res.status(500).json({ 
        error: 'Failed to check purchase status' 
      });
    }
  });

  return router;
}