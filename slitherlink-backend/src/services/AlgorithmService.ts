import axios, { AxiosInstance } from 'axios';
import { config } from '@/config';
import { AlgorithmServiceResponse } from '@/types';
import { logger } from '@/utils/logger';
import { CacheService } from '@/utils/cache';
// import crypto from 'crypto';

export class AlgorithmService {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.algorithmServiceUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000, // 30秒超时
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`Algorithm API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('Algorithm API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`Algorithm API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('Algorithm API Response Error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  // 生成单个题目
  async generatePuzzle(
    gridSize: number,
    difficulty: 'easy' | 'medium' | 'difficult'
  ): Promise<AlgorithmServiceResponse> {
    try {
      logger.info(`Generating puzzle: ${gridSize}x${gridSize}, difficulty: ${difficulty}`);
      
      const response = await this.client.get<string>('/sl/gen', {
        params: {
          puzzledim: gridSize,
          diff: difficulty,
        },
      });

      // Java服务直接返回JSON对象
      const data: AlgorithmServiceResponse = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      
      // 验证响应数据
      if (!data.count || !data.pairs || !data.seed) {
        throw new Error('Invalid response from algorithm service');
      }

      logger.info(`Puzzle generated successfully: ${data.seed}`);
      return data;
    } catch (error) {
      logger.error('Error generating puzzle:', error);
      throw new Error(`Failed to generate puzzle: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 批量生成题目（需要多次调用单个生成接口）
  async batchGeneratePuzzles(requests: {
    gridSize: number;
    difficulty: 'easy' | 'medium' | 'difficult';
    count: number;
  }[]): Promise<{
    puzzles: (AlgorithmServiceResponse & { gridSize: number; difficulty: string })[];
    totalGenerated: number;
    failedCount: number;
  }> {
    const puzzles: (AlgorithmServiceResponse & { gridSize: number; difficulty: string })[] = [];
    let failedCount = 0;

    for (const request of requests) {
      logger.info(`Batch generating ${request.count} puzzles: ${request.gridSize}x${request.gridSize}, ${request.difficulty}`);
      
      for (let i = 0; i < request.count; i++) {
        try {
          // 添加短暂延迟，避免过载算法服务
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          const puzzle = await this.generatePuzzle(request.gridSize, request.difficulty);
          puzzles.push({
            ...puzzle,
            gridSize: request.gridSize,
            difficulty: request.difficulty,
          });
        } catch (error) {
          failedCount++;
          logger.warn(`Failed to generate puzzle ${i + 1}/${request.count} for ${request.difficulty}:`, error);
        }
      }
    }

    logger.info(`Batch generation completed: ${puzzles.length} success, ${failedCount} failed`);
    
    return {
      puzzles,
      totalGenerated: puzzles.length,
      failedCount,
    };
  }

  // 加载特定种子的题目
  async loadPuzzleBySeed(
    gridSize: number,
    difficulty: 'easy' | 'medium' | 'difficult',
    seed: string
  ): Promise<AlgorithmServiceResponse> {
    try {
      const diffCode = difficulty.charAt(0); // e, m, d
      
      const response = await this.client.get<string>('/sl/load', {
        params: {
          inputPuzzleDim: gridSize,
          inputDiff: diffCode,
          seed: seed,
        },
      });

      const data = JSON.parse(response.data) as AlgorithmServiceResponse;
      
      if (!data.count || !data.pairs || !data.seed) {
        throw new Error('Invalid response from algorithm service');
      }

      logger.info(`Puzzle loaded successfully: ${data.seed}`);
      return data;
    } catch (error) {
      logger.error('Error loading puzzle by seed:', error);
      throw new Error(`Failed to load puzzle: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 求解题目
  async solvePuzzle(
    gridSize: number,
    clues: (number | null)[][],
    includeStats = false
  ): Promise<{
    pairs: string;
    solveTime?: number;
    numSolutions?: number;
  }> {
    try {
      // 将clues数组转换为Java服务期望的格式
      const countVals = clues
        .flat()
        .map(clue => (clue === null || clue === -1) ? -1 : clue)
        .join(' ');

      const response = await this.client.get<string>('/sl/solve', {
        params: {
          puzzledim: gridSize,
          countvals: countVals,
          stats: includeStats,
        },
      });

      if (includeStats) {
        const data = JSON.parse(response.data);
        return {
          pairs: data.pairs,
          solveTime: data.solveTime,
          numSolutions: data.numSolutions,
        };
      } else {
        return {
          pairs: response.data,
        };
      }
    } catch (error) {
      logger.error('Error solving puzzle:', error);
      throw new Error(`Failed to solve puzzle: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 验证题目是否有唯一解
  async validatePuzzle(
    gridSize: number,
    clues: (number | null)[][]
  ): Promise<{ isValid: boolean; numSolutions: number; solveTime: number }> {
    try {
      const result = await this.solvePuzzle(gridSize, clues, true);
      
      const isValid = result.numSolutions === 1;
      
      return {
        isValid,
        numSolutions: result.numSolutions || 0,
        solveTime: result.solveTime || 0,
      };
    } catch (error) {
      logger.error('Error validating puzzle:', error);
      return {
        isValid: false,
        numSolutions: 0,
        solveTime: 0,
      };
    }
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    const cacheKey = 'algorithm_service_health';
    const cachedResult = CacheService.get<boolean>(cacheKey);
    if (cachedResult !== undefined) {
      return cachedResult;
    }

    try {
      // 尝试生成一个简单的5x5题目作为健康检查
      await this.generatePuzzle(5, 'easy');
      CacheService.set(cacheKey, true, 300); // 缓存5分钟
      return true;
    } catch (error) {
      logger.warn('Algorithm service health check failed:', error);
      CacheService.set(cacheKey, false, 60); // 缓存1分钟
      return false;
    }
  }

  // 获取服务信息
  getServiceInfo() {
    return {
      baseUrl: this.baseUrl,
      timeout: this.client.defaults.timeout,
      isConfigured: Boolean(this.baseUrl),
    };
  }
}

// 创建单例实例
export const algorithmService = new AlgorithmService();