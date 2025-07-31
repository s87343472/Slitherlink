import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { testConnection } from '@/models/database';
import { algorithmService } from '@/services/AlgorithmService';

// 创建Express应用
const app = express();

// 信任代理（如果在反向代理后面）
app.set('trust proxy', 1);

// 中间件配置
app.use(helmet({
  contentSecurityPolicy: false, // 在开发环境中禁用CSP
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.use(compression());

// 请求日志
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 基础限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// 健康检查端点
app.get('/health', async (_req, res) => {
  try {
    const checks = {
      database: false,
      algorithmService: false,
    };

    // 检查数据库连接
    checks.database = await testConnection();

    // 检查算法服务
    checks.algorithmService = await algorithmService.healthCheck();

    const allHealthy = Object.values(checks).every(check => check === true);
    
    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// API路由
import authRoutes from '@/routes/auth';
import puzzleRoutes from '@/routes/puzzle';
import dailyChallengeRoutes from '@/routes/daily-challenge';
import leaderboardRoutes from '@/routes/leaderboard';

// 认证路由
app.use('/api/v1/auth', authRoutes);
// 题目路由
app.use('/api/v1/puzzle', puzzleRoutes);
// 每日挑战路由
app.use('/api/v1/daily-challenge', dailyChallengeRoutes);
// 排行榜路由
app.use('/api/v1/leaderboard', leaderboardRoutes);

app.get('/api/v1/info', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Slitherlink Backend API',
      version: '1.0.0',
      environment: config.nodeEnv,
      algorithmService: algorithmService.getServiceInfo(),
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
});

// 测试端点 - 生成简单题目
app.get('/api/v1/test/generate', async (req, res) => {
  try {
    const puzzle = await algorithmService.generatePuzzle(5, 'easy');
    
    res.json({
      success: true,
      data: {
        message: 'Puzzle generated successfully',
        puzzle: {
          seed: puzzle.seed,
          gridSize: 5,
          difficulty: 'easy',
          cluesPreview: JSON.parse(puzzle.count).length,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  } catch (error) {
    logger.error('Test generate error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GENERATION_ERROR',
        message: 'Failed to generate test puzzle',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
});

// 全局错误处理
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: config.nodeEnv === 'production' 
        ? 'Internal server error' 
        : err.message,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database');
      process.exit(1);
    }

    // 测试算法服务连接
    const algorithmConnected = await algorithmService.healthCheck();
    if (!algorithmConnected) {
      logger.warn('Algorithm service is not available - some features may not work');
    }

    // 启动HTTP服务器
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Slitherlink backend server started`);
      logger.info(`📍 Server running on port ${config.port}`);
      logger.info(`🌍 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 Algorithm service: ${config.algorithmServiceUrl}`);
      logger.info(`💾 Database connected: ${dbConnected ? '✅' : '❌'}`);
      logger.info(`🧮 Algorithm service connected: ${algorithmConnected ? '✅' : '❌'}`);
    });

    // 优雅关闭
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async (err) => {
        if (err) {
          logger.error('Error during server shutdown:', err);
          process.exit(1);
        }
        
        logger.info('Server closed successfully');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// 启动应用
startServer();