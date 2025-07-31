// 用户相关类型
export interface User {
  id: number;
  email: string;
  username: string;
  display_name?: string;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
  is_active: boolean;
  email_verified_at?: Date;
}

export interface UserPermissions {
  id: number;
  user_id: number;
  has_leaderboard_access: boolean;
  has_ad_free_access: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  display_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// 题目相关类型
export interface Puzzle {
  id: number;
  puzzle_hash: string;
  grid_size: number;
  difficulty: 'easy' | 'medium' | 'difficult';
  usage_type: 'daily' | 'regular';
  puzzle_data: PuzzleData;
  solution_data: SolutionData;
  java_seed: number;
  estimated_duration?: number;
  created_at: Date;
  used_at?: Date;
  used_count: number;
}

export interface PuzzleData {
  clues: (number | null)[][];
  gridSize: number;
}

export interface SolutionData {
  pairs: number[][];
  edges: EdgeSolution[];
}

export interface EdgeSolution {
  from: number;
  to: number;
  isPath: boolean;
}

// 游戏相关类型
export interface GameSession {
  id: number;
  user_id: number;
  puzzle_id: number;
  started_at: Date;
  completed_at?: Date;
  duration_seconds?: number;
  score?: number;
  errors_count: number;
  is_completed: boolean;
  user_solution?: any;
}

export interface LeaderboardEntry {
  id: number;
  user_id: number;
  puzzle_id: number;
  score: number;
  completion_time: number;
  rank_daily?: number;
  rank_weekly?: number;
  rank_monthly?: number;
  rank_all_time?: number;
  created_at: Date;
  username?: string;
  display_name?: string;
}

export interface Trophy {
  id: number;
  user_id: number;
  trophy_type: 'daily' | 'weekly' | 'monthly';
  period_start: Date;
  period_end: Date;
  rank: number;
  awarded_at: Date;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

// Java算法服务接口类型
export interface AlgorithmServiceResponse {
  count: string; // JSON字符串，包含2D数组
  pairs: string; // JSON字符串，包含解答对
  seed: string; // 格式: "size-difficulty-timestamp"
}

// JWT载荷类型
export interface JwtPayload {
  id: number;
  userId: number;
  username: string;
  email: string;
  permissions: {
    hasLeaderboardAccess: boolean;
    hasAdFreeAccess: boolean;
  };
  iat: number;
  exp: number;
}

// 配置类型
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  pool?: {
    min: number;
    max: number;
  };
}

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  database: DatabaseConfig;
  algorithmServiceUrl: string;
  corsOrigins: string[];
}

// 统计类型
export interface PuzzleStockLevels {
  daily: {
    easy: number;
    medium: number;
    difficult: number;
    total: number;
  };
  regular: {
    easy: number;
    medium: number;
    difficult: number;
    total: number;
  };
  total: number;
}

export interface UserStats {
  totalGames: number;
  completedGames: number;
  averageScore: number;
  bestScore: number;
  totalTime: number;
  averageTime: number;
  bestTime: number;
  totalErrors: number;
  accuracy: number;
}

export interface SystemHealth {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: {
    database: boolean;
    algorithmService: boolean;
    puzzleStock: boolean;
  };
}