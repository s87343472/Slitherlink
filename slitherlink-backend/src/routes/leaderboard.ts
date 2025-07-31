import { LeaderboardService } from '@/services/LeaderboardService';
import { createLeaderboardRoutes } from '@/controllers/LeaderboardController';
import { db } from '@/models/database';

// 创建排行榜服务实例
const leaderboardService = new LeaderboardService(db);

// 导出配置好的路由
export default createLeaderboardRoutes(leaderboardService);