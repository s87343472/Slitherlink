#!/usr/bin/env node

/**
 * 题目去重检查工具
 * 用于检查数据库中的重复题目并提供清理建议
 */

// import { config } from '@/config';
import { logger } from '@/utils/logger';
import { db, testConnection } from '@/models/database';
import { Puzzle } from '@/types';
import crypto from 'crypto';

interface DuplicationReport {
  totalPuzzles: number;
  uniqueHashes: number;
  duplicateGroups: {
    hash: string;
    count: number;
    puzzles: {
      id: number;
      grid_size: number;
      difficulty: string;
      usage_type: string;
      used_count: number;
      created_at: string;
    }[];
  }[];
  recommendations: string[];
}

// 重新生成哈希值（确保一致性）
function regeneratePuzzleHash(clues: (number | null)[][]): string {
  const cluesString = JSON.stringify(clues);
  return crypto.createHash('sha256').update(cluesString).digest('hex');
}

// 检查重复题目
async function checkDuplications(): Promise<DuplicationReport> {
  logger.info('🔍 Starting duplication check...');

  // 获取所有题目
  const puzzles = await db<Puzzle>('puzzles').select('*');
  
  const report: DuplicationReport = {
    totalPuzzles: puzzles.length,
    uniqueHashes: 0,
    duplicateGroups: [],
    recommendations: []
  };

  // 按哈希分组
  const hashGroups: { [hash: string]: typeof puzzles } = {};
  const hashRecalculations: { id: number; oldHash: string; newHash: string }[] = [];

  for (const puzzle of puzzles) {
    // 解析puzzle_data
    const puzzleData = typeof puzzle.puzzle_data === 'string' 
      ? JSON.parse(puzzle.puzzle_data) 
      : puzzle.puzzle_data;

    // 重新计算哈希
    const recalculatedHash = regeneratePuzzleHash(puzzleData.clues || puzzleData.count);
    
    // 如果哈希不匹配，记录需要更新的情况
    if (recalculatedHash !== puzzle.puzzle_hash) {
      hashRecalculations.push({
        id: puzzle.id,
        oldHash: puzzle.puzzle_hash,
        newHash: recalculatedHash
      });
    }

    // 使用重新计算的哈希进行分组
    const hashToUse = recalculatedHash;
    
    if (!hashGroups[hashToUse]) {
      hashGroups[hashToUse] = [];
    }
    hashGroups[hashToUse].push(puzzle);
  }

  report.uniqueHashes = Object.keys(hashGroups).length;

  // 找出重复组
  for (const [hash, group] of Object.entries(hashGroups)) {
    if (group.length > 1) {
      report.duplicateGroups.push({
        hash,
        count: group.length,
        puzzles: group.map(p => ({
          id: p.id,
          grid_size: p.grid_size,
          difficulty: p.difficulty,
          usage_type: p.usage_type,
          used_count: p.used_count,
          created_at: p.created_at?.toISOString() || 'unknown'
        })).sort((a, b) => a.id - b.id) // 按ID排序，保留最早的
      });
    }
  }

  // 生成建议
  if (hashRecalculations.length > 0) {
    report.recommendations.push(
      `🔧 Found ${hashRecalculations.length} puzzles with inconsistent hashes that need recalculation`
    );
  }

  if (report.duplicateGroups.length > 0) {
    const totalDuplicates = report.duplicateGroups.reduce((sum, group) => sum + group.count - 1, 0);
    report.recommendations.push(
      `🗑️  Found ${report.duplicateGroups.length} duplicate groups with ${totalDuplicates} redundant puzzles`
    );
    report.recommendations.push(
      `💡 Recommend keeping the earliest puzzle in each group and removing others`
    );
  } else {
    report.recommendations.push('✅ No duplicate puzzles found');
  }

  // 使用情况分析
  const usageStats = puzzles.reduce((stats, puzzle) => {
    const key = `${puzzle.usage_type}_${puzzle.difficulty}_${puzzle.grid_size}`;
    if (!stats[key]) {
      stats[key] = { total: 0, used: 0 };
    }
    stats[key].total++;
    if (puzzle.used_count > 0) {
      stats[key].used++;
    }
    return stats;
  }, {} as { [key: string]: { total: number; used: number } });

  report.recommendations.push('');
  report.recommendations.push('📊 Usage Statistics:');
  for (const [key, stat] of Object.entries(usageStats)) {
    const [usageType, difficulty, gridSize] = key.split('_');
    const usageRate = stat.total > 0 ? (stat.used / stat.total * 100).toFixed(1) : '0';
    report.recommendations.push(
      `   ${usageType} ${difficulty} ${gridSize}x${gridSize}: ${stat.total} total, ${stat.used} used (${usageRate}%)`
    );
  }

  logger.info('✅ Duplication check completed');
  return report;
}

// 修复哈希值
async function fixInconsistentHashes(dryRun: boolean = true): Promise<{
  fixed: number;
  errors: number;
  details: { id: number; status: 'fixed' | 'error'; error?: string }[];
}> {
  logger.info(`🔧 ${dryRun ? 'Simulating' : 'Executing'} hash fix...`);

  const puzzles = await db<Puzzle>('puzzles').select('*');
  const fixResults = {
    fixed: 0,
    errors: 0,
    details: [] as { id: number; status: 'fixed' | 'error'; error?: string }[]
  };

  for (const puzzle of puzzles) {
    try {
      // 解析puzzle_data
      const puzzleData = typeof puzzle.puzzle_data === 'string' 
        ? JSON.parse(puzzle.puzzle_data) 
        : puzzle.puzzle_data;

      // 重新计算哈希
      const correctHash = regeneratePuzzleHash(puzzleData.clues || puzzleData.count);
      
      if (correctHash !== puzzle.puzzle_hash) {
        if (!dryRun) {
          // 实际更新数据库
          await db<Puzzle>('puzzles')
            .where('id', puzzle.id)
            .update({ puzzle_hash: correctHash });
        }
        
        fixResults.fixed++;
        fixResults.details.push({ id: puzzle.id, status: 'fixed' });
        logger.debug(`${dryRun ? 'Would fix' : 'Fixed'} hash for puzzle ${puzzle.id}`);
      }
    } catch (error) {
      fixResults.errors++;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      fixResults.details.push({ id: puzzle.id, status: 'error', error: errorMsg });
      logger.warn(`Error processing puzzle ${puzzle.id}:`, error);
    }
  }

  logger.info(`${dryRun ? 'Simulation' : 'Fix'} completed: ${fixResults.fixed} fixed, ${fixResults.errors} errors`);
  return fixResults;
}

// 清理重复题目
async function cleanupDuplicates(dryRun: boolean = true): Promise<{
  removed: number;
  kept: number;
  errors: number;
  details: { hash: string; kept: number; removed: number[]; errors: string[] }[];
}> {
  logger.info(`🗑️  ${dryRun ? 'Simulating' : 'Executing'} duplicate cleanup...`);

  const report = await checkDuplications();
  const cleanupResults = {
    removed: 0,
    kept: 0,
    errors: 0,
    details: [] as { hash: string; kept: number; removed: number[]; errors: string[] }[]
  };

  for (const group of report.duplicateGroups) {
    const groupResult = {
      hash: group.hash,
      kept: 0,
      removed: [] as number[],
      errors: [] as string[]
    };

    try {
      // 选择要保留的题目（优先级：使用次数少 > ID小 > 创建时间早）
      const sortedPuzzles = [...group.puzzles].sort((a, b) => {
        // 优先保留未使用的
        if (a.used_count !== b.used_count) {
          return a.used_count - b.used_count;
        }
        // 其次保留ID小的（创建较早）
        return a.id - b.id;
      });

      const keepPuzzle = sortedPuzzles[0];
      const removePuzzles = sortedPuzzles.slice(1);

      if (!dryRun) {
        // 实际删除重复的题目
        for (const puzzle of removePuzzles) {
          await db<Puzzle>('puzzles').where('id', puzzle.id).delete();
        }
      }

      cleanupResults.kept++;
      cleanupResults.removed += removePuzzles.length;
      groupResult.kept = keepPuzzle.id;
      groupResult.removed = removePuzzles.map(p => p.id);

    } catch (error) {
      cleanupResults.errors++;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      groupResult.errors.push(errorMsg);
      logger.warn(`Error cleaning up hash ${group.hash}:`, error);
    }

    cleanupResults.details.push(groupResult);
  }

  logger.info(`${dryRun ? 'Simulation' : 'Cleanup'} completed: ${cleanupResults.removed} removed, ${cleanupResults.kept} groups kept, ${cleanupResults.errors} errors`);
  return cleanupResults;
}

// 生成报告
function generateReport(report: DuplicationReport): string {
  const lines: string[] = [
    '# 题目去重检查报告',
    `**检查时间**: ${new Date().toLocaleString('zh-CN')}`,
    '',
    '## 总体统计',
    `- 总题目数量: ${report.totalPuzzles}`,
    `- 唯一哈希数量: ${report.uniqueHashes}`,
    `- 重复组数量: ${report.duplicateGroups.length}`,
    ''
  ];

  if (report.duplicateGroups.length > 0) {
    lines.push('## 重复题目详情');
    for (const group of report.duplicateGroups) {
      lines.push(`### 哈希: ${group.hash.substring(0, 16)}...`);
      lines.push(`重复数量: ${group.count}`);
      lines.push('题目详情:');
      for (const puzzle of group.puzzles) {
        lines.push(`- ID: ${puzzle.id}, 尺寸: ${puzzle.grid_size}x${puzzle.grid_size}, 难度: ${puzzle.difficulty}, 类型: ${puzzle.usage_type}, 使用次数: ${puzzle.used_count}`);
      }
      lines.push('');
    }
  }

  lines.push('## 建议');
  for (const recommendation of report.recommendations) {
    lines.push(`- ${recommendation}`);
  }

  return lines.join('\n');
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'check';

  try {
    // 检查数据库连接
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Database connection failed');
      process.exit(1);
    }

    switch (command) {
      case 'check':
        {
          const report = await checkDuplications();
          const reportText = generateReport(report);
          console.log(reportText);
        }
        break;

      case 'fix-hashes':
        {
          const dryRun = !args.includes('--execute');
          const result = await fixInconsistentHashes(dryRun);
          
          console.log(`\n# 哈希修复${dryRun ? '模拟' : '执行'}结果`);
          console.log(`修复数量: ${result.fixed}`);
          console.log(`错误数量: ${result.errors}`);
          
          if (dryRun && result.fixed > 0) {
            console.log('\n💡 使用 --execute 参数执行实际修复');
          }
        }
        break;

      case 'cleanup':
        {
          const dryRun = !args.includes('--execute');
          const result = await cleanupDuplicates(dryRun);
          
          console.log(`\n# 重复清理${dryRun ? '模拟' : '执行'}结果`);
          console.log(`保留组数: ${result.kept}`);
          console.log(`删除数量: ${result.removed}`);
          console.log(`错误数量: ${result.errors}`);
          
          if (dryRun && result.removed > 0) {
            console.log('\n💡 使用 --execute 参数执行实际清理');
          }
        }
        break;

      case 'help':
        console.log(`
数回题目去重工具

用法: 
  npx ts-node src/scripts/deduplication-check.ts [命令] [选项]

命令:
  check         检查重复题目（默认）
  fix-hashes    修复不一致的哈希值
  cleanup       清理重复题目
  help          显示帮助

选项:
  --execute     执行实际操作（默认为模拟模式）

示例:
  npx ts-node src/scripts/deduplication-check.ts check
  npx ts-node src/scripts/deduplication-check.ts fix-hashes --execute
  npx ts-node src/scripts/deduplication-check.ts cleanup --execute
        `);
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('Use "help" command for usage information');
        process.exit(1);
    }

  } catch (error) {
    logger.error('Fatal error in deduplication check:', error);
    console.error('Operation failed with fatal error');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { checkDuplications, fixInconsistentHashes, cleanupDuplicates, generateReport };