export interface LeaderboardEntry {
  id: number;
  userId: number;
  userName: string;
  puzzleId: number;
  score: number;
  completionTime: number; // seconds
  errorCount: number;
  submittedAt: Date;
  difficulty: string;
  gridSize: number;
}

export interface LeaderboardStats {
  rank: number;
  totalParticipants: number;
  percentile: number;
  rankChange?: number; // compared to previous period
}

export interface LeaderboardResponse {
  entries: (LeaderboardEntry & LeaderboardStats)[];
  userEntry?: LeaderboardEntry & LeaderboardStats;
  lastUpdated: Date;
  period: string;
}

export type LeaderboardType = 'daily' | 'weekly' | 'monthly' | 'total';