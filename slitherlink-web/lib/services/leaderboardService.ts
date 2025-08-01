export interface LeaderboardEntry {
  id: number;
  userId: number;
  userName: string;
  score: number;
  completionTime: number;
  errorCount: number;
  submittedAt: string;
  difficulty: string;
  gridSize: number;
  rank: number;
  totalParticipants: number;
  percentile: number;
}

export interface LeaderboardResponse {
  success: boolean;
  data: {
    entries: LeaderboardEntry[];
    userEntry?: LeaderboardEntry;
    lastUpdated: string;
    period: string;
  };
  meta: {
    type: LeaderboardType;
    limit: number;
    hasUserRanking: boolean;
  };
}

export interface UserRankingStats {
  daily?: { rank: number; totalParticipants: number; percentile: number };
  weekly?: { rank: number; totalParticipants: number; percentile: number };
  monthly?: { rank: number; totalParticipants: number; percentile: number };
  total?: { rank: number; totalParticipants: number; percentile: number };
}

export type LeaderboardType = 'daily' | 'weekly' | 'monthly' | 'total';

class LeaderboardService {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

  /**
   * Submit a game score to leaderboard
   */
  async submitScore(puzzleId: number, completionTime: number, errorCount: number): Promise<void> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required to submit scores');
    }

    const response = await fetch(`${this.baseUrl}/leaderboard/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        puzzleId,
        completionTime,
        errorCount,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 403 && errorData.purchaseRequired) {
        throw new Error('LEADERBOARD_PASS_REQUIRED');
      }
      
      throw new Error(errorData.error || 'Failed to submit score');
    }
  }

  /**
   * Get leaderboard by type
   */
  async getLeaderboard(type: LeaderboardType, limit = 100): Promise<LeaderboardResponse> {
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Include auth token if available (for user ranking)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/leaderboard/${type}?limit=${limit}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }

    return response.json();
  }

  /**
   * Get user's ranking statistics across all leaderboards
   */
  async getUserRankingStats(): Promise<UserRankingStats> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${this.baseUrl}/leaderboard/user/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user ranking statistics');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Check user's purchase status
   */
  async getPurchaseStatus(): Promise<{
    hasLeaderboardPass: boolean;
    canSubmitScores: boolean;
    canViewRealTimeRankings: boolean;
  }> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return {
        hasLeaderboardPass: false,
        canSubmitScores: false,
        canViewRealTimeRankings: false,
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/leaderboard/purchase-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return {
          hasLeaderboardPass: false,
          canSubmitScores: false,
          canViewRealTimeRankings: false,
        };
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Failed to check purchase status:', error);
      return {
        hasLeaderboardPass: false,
        canSubmitScores: false,
        canViewRealTimeRankings: false,
      };
    }
  }

  /**
   * Format completion time for display
   */
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get difficulty display name
   */
  getDifficultyName(difficulty: string): string {
    const names: Record<string, string> = {
      'easy': 'Easy',
      'medium': 'Medium',
      'hard': 'Hard',
      'master': 'Master',
      'ninja': 'Ninja'
    };
    return names[difficulty] || difficulty;
  }

  /**
   * Get ranking badge color based on rank
   */
  getRankBadgeColor(rank: number): string {
    if (rank === 1) return 'bg-yellow-500 text-white'; // Gold
    if (rank === 2) return 'bg-gray-400 text-white';   // Silver
    if (rank === 3) return 'bg-amber-600 text-white';  // Bronze
    if (rank <= 10) return 'bg-blue-500 text-white';   // Top 10
    if (rank <= 100) return 'bg-green-500 text-white'; // Top 100
    return 'bg-gray-200 text-gray-700';                 // Others
  }
}

export const leaderboardService = new LeaderboardService();