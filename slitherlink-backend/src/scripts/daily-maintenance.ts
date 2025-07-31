#!/usr/bin/env node

/**
 * 每日维护脚本
 * 用于定期检查和补充题库、每日挑战等
 */

// import { config } from '@/config';
import { logger } from '@/utils/logger';
import { testConnection } from '@/models/database';
import { dailyChallengeService } from '@/services/DailyChallengeService';
import { puzzleService } from '@/services/PuzzleService';

interface MaintenanceResult {
  timestamp: string;
  dailyChallenges: {
    checked: boolean;
    needed: boolean;
    generated: number;
    failed: number;
    error?: string;
  };
  puzzleStock: {
    checked: boolean;
    needed: boolean;
    generated: number;
    failed: number;
    error?: string;
  };
  success: boolean;
}

async function runDailyMaintenance(): Promise<MaintenanceResult> {
  const startTime = new Date();
  logger.info('🔧 Starting daily maintenance...');

  const result: MaintenanceResult = {
    timestamp: startTime.toISOString(),
    dailyChallenges: {
      checked: false,
      needed: false,
      generated: 0,
      failed: 0
    },
    puzzleStock: {
      checked: false,
      needed: false,
      generated: 0,
      failed: 0
    },
    success: false
  };

  try {
    // 检查数据库连接
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    logger.info('✅ Database connection verified');

    // 1. 检查和补充每日挑战
    try {
      logger.info('🎯 Checking daily challenges...');
      const challengeResult = await dailyChallengeService.checkAndReplenishDailyChallenges();
      
      result.dailyChallenges = {
        checked: true,
        needed: challengeResult.needed,
        generated: challengeResult.generated,
        failed: challengeResult.failed
      };

      logger.info(`📊 Daily challenges: needed=${challengeResult.needed}, generated=${challengeResult.generated}, failed=${challengeResult.failed}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('❌ Daily challenge maintenance failed:', error);
      result.dailyChallenges = {
        checked: true,
        needed: false,
        generated: 0,
        failed: 0,
        error: errorMsg
      };
    }

    // 2. 检查和补充题目库存
    try {
      logger.info('📚 Checking puzzle stock...');
      const stockResult = await puzzleService.checkAndReplenishStock();
      
      result.puzzleStock = {
        checked: true,
        needed: stockResult.needed,
        generated: stockResult.generated,
        failed: stockResult.failed
      };

      logger.info(`📊 Puzzle stock: needed=${stockResult.needed}, generated=${stockResult.generated}, failed=${stockResult.failed}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('❌ Puzzle stock maintenance failed:', error);
      result.puzzleStock = {
        checked: true,
        needed: false,
        generated: 0,
        failed: 0,
        error: errorMsg
      };
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    result.success = true;
    logger.info(`✅ Daily maintenance completed in ${duration}ms`);
    
    return result;

  } catch (error) {
    logger.error('❌ Daily maintenance failed:', error);
    result.success = false;
    return result;
  }
}

// 生成维护报告
function generateReport(result: MaintenanceResult): string {
  const lines: string[] = [
    '# 每日维护报告',
    `**时间**: ${new Date(result.timestamp).toLocaleString('zh-CN')}`,
    `**状态**: ${result.success ? '✅ 成功' : '❌ 失败'}`,
    '',
    '## 每日挑战维护',
    `- 检查状态: ${result.dailyChallenges.checked ? '✅' : '❌'}`,
    `- 需要补充: ${result.dailyChallenges.needed ? '是' : '否'}`,
    `- 生成数量: ${result.dailyChallenges.generated}`,
    `- 失败数量: ${result.dailyChallenges.failed}`,
  ];

  if (result.dailyChallenges.error) {
    lines.push(`- ❌ 错误: ${result.dailyChallenges.error}`);
  }

  lines.push(
    '',
    '## 题目库存维护',
    `- 检查状态: ${result.puzzleStock.checked ? '✅' : '❌'}`,
    `- 需要补充: ${result.puzzleStock.needed ? '是' : '否'}`,
    `- 生成数量: ${result.puzzleStock.generated}`,
    `- 失败数量: ${result.puzzleStock.failed}`,
  );

  if (result.puzzleStock.error) {
    lines.push(`- ❌ 错误: ${result.puzzleStock.error}`);
  }

  lines.push(
    '',
    '## 总结',
    `总共生成 ${result.dailyChallenges.generated + result.puzzleStock.generated} 个新题目`,
    `总共失败 ${result.dailyChallenges.failed + result.puzzleStock.failed} 个生成请求`,
    ''
  );

  return lines.join('\n');
}

// 命令行执行
async function main() {
  try {
    const result = await runDailyMaintenance();
    
    // 生成报告
    const report = generateReport(result);
    console.log(report);

    // 根据结果设置退出码
    process.exit(result.success ? 0 : 1);

  } catch (error) {
    logger.error('Fatal error in daily maintenance:', error);
    console.error('Daily maintenance failed with fatal error');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { runDailyMaintenance, generateReport };