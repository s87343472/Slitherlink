#!/usr/bin/env ts-node

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { db } from '../models/database';
import { logger } from '../utils/logger';

class PuzzleManager {
  
  /**
   * 从JSON文件批量导入题目到数据库
   */
  async importFromFiles(directory: string): Promise<void> {
    const resolvedDir = resolve(directory);
    
    if (!existsSync(resolvedDir)) {
      throw new Error(`Directory does not exist: ${resolvedDir}`);
    }

    const files = readdirSync(resolvedDir).filter(file => file.endsWith('.json'));
    logger.info(`Found ${files.length} JSON files to import`);

    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (const file of files) {
      try {
        const filePath = join(resolvedDir, file);
        const data = JSON.parse(readFileSync(filePath, 'utf8'));
        
        // 验证必要字段
        if (!this.validatePuzzleData(data)) {
          logger.warn(`Invalid puzzle data in file: ${file}`);
          failedCount++;
          continue;
        }

        // 检查是否已存在
        const existing = await db('puzzles').where('puzzle_hash', data.puzzle_hash).first();
        if (existing) {
          logger.debug(`Puzzle already exists, skipping: ${data.puzzle_hash}`);
          skippedCount++;
          continue;
        }

        // 插入数据库
        await db('puzzles').insert({
          puzzle_hash: data.puzzle_hash,
          grid_size: data.grid_size,
          difficulty: data.difficulty,
          usage_type: data.usage_type,
          puzzle_data: JSON.stringify(data.puzzle_data),
          solution_data: JSON.stringify(data.solution_data),
          java_seed: data.java_seed,
          estimated_duration: data.estimated_duration
        });

        successCount++;
        logger.debug(`Imported puzzle: ${data.puzzle_hash} (${data.grid_size}x${data.grid_size} ${data.difficulty})`);

      } catch (error) {
        logger.error(`Failed to import file ${file}:`, error);
        failedCount++;
      }
    }

    logger.info(`Import completed - Success: ${successCount}, Failed: ${failedCount}, Skipped: ${skippedCount}`);
  }

  /**
   * 验证题目数据结构
   */
  private validatePuzzleData(data: any): boolean {
    const requiredFields = ['puzzle_hash', 'grid_size', 'difficulty', 'puzzle_data', 'solution_data', 'java_seed'];
    
    for (const field of requiredFields) {
      if (!data.hasOwnProperty(field)) {
        logger.warn(`Missing required field: ${field}`);
        return false;
      }
    }

    // 验证difficulty值
    if (!['easy', 'medium', 'difficult'].includes(data.difficulty)) {
      logger.warn(`Invalid difficulty: ${data.difficulty}`);
      return false;
    }

    // 验证grid_size
    if (typeof data.grid_size !== 'number' || data.grid_size < 5 || data.grid_size > 15) {
      logger.warn(`Invalid grid_size: ${data.grid_size}`);
      return false;
    }

    return true;
  }

  /**
   * 获取题目统计信息
   */
  async getStatistics(): Promise<void> {
    try {
      const total = await db('puzzles').count('* as count').first();
      const byDifficulty = await db('puzzles')
        .select('difficulty', 'grid_size')
        .count('* as count')
        .groupBy('difficulty', 'grid_size')
        .orderBy('grid_size', 'difficulty');

      const byUsageType = await db('puzzles')
        .select('usage_type')
        .count('* as count')
        .groupBy('usage_type');

      console.log('\n=== Puzzle Database Statistics ===');
      console.log(`Total puzzles: ${total?.count || 0}`);
      
      console.log('\nBy Size and Difficulty:');
      for (const stat of byDifficulty) {
        console.log(`  ${stat.grid_size}x${stat.grid_size} ${stat.difficulty}: ${stat.count}`);
      }

      console.log('\nBy Usage Type:');
      for (const stat of byUsageType) {
        console.log(`  ${stat.usage_type}: ${stat.count}`);
      }

      // 检查空白配置
      const expectedConfigs = [
        { grid_size: 5, difficulty: 'easy' },
        { grid_size: 5, difficulty: 'medium' },
        { grid_size: 5, difficulty: 'difficult' },
        { grid_size: 7, difficulty: 'easy' },
        { grid_size: 7, difficulty: 'medium' },
        { grid_size: 7, difficulty: 'difficult' },
        { grid_size: 10, difficulty: 'easy' },
        { grid_size: 10, difficulty: 'medium' },
        { grid_size: 10, difficulty: 'difficult' }
      ];

      console.log('\nMissing Configurations:');
      for (const config of expectedConfigs) {
        const count = await db('puzzles')
          .where('grid_size', config.grid_size)
          .where('difficulty', config.difficulty)
          .count('* as count')
          .first();
        
        if (!count?.count || Number(count.count) < 10) {
          console.log(`  ${config.grid_size}x${config.grid_size} ${config.difficulty}: only ${count?.count || 0} puzzles`);
        }
      }

    } catch (error) {
      logger.error('Failed to get statistics:', error);
    }
  }

  /**
   * 测试从数据库获取题目
   */
  async testRetrieval(): Promise<void> {
    try {
      console.log('\n=== Testing Puzzle Retrieval ===');
      
      // 测试不同配置
      const testConfigs = [
        { grid_size: 5, difficulty: 'easy' },
        { grid_size: 7, difficulty: 'medium' },
        { grid_size: 10, difficulty: 'difficult' }
      ];

      for (const config of testConfigs) {
        const startTime = Date.now();
        
        const puzzle = await db('puzzles')
          .where('grid_size', config.grid_size)
          .where('difficulty', config.difficulty)
          .where('used_at', null)  // 获取未使用的题目
          .orderByRaw('RANDOM()')  // PostgreSQL随机排序
          .first();

        const retrievalTime = Date.now() - startTime;

        if (puzzle) {
          console.log(`✅ ${config.grid_size}x${config.grid_size} ${config.difficulty}: Retrieved in ${retrievalTime}ms (ID: ${puzzle.id})`);
          
          // 模拟标记为已使用
          await db('puzzles')
            .where('id', puzzle.id)
            .update({
              used_at: new Date(),
              used_count: db.raw('used_count + 1')
            });
            
        } else {
          console.log(`❌ ${config.grid_size}x${config.grid_size} ${config.difficulty}: No available puzzles`);
        }
      }

    } catch (error) {
      logger.error('Failed to test retrieval:', error);
    }
  }

  /**
   * 清理测试数据（重置used_at字段）
   */
  async resetUsage(): Promise<void> {
    try {
      const result = await db('puzzles').update({
        used_at: null,
        used_count: 0
      });
      
      logger.info(`Reset usage for ${result} puzzles`);
    } catch (error) {
      logger.error('Failed to reset usage:', error);
    }
  }

  /**
   * 删除所有题目数据（谨慎使用）
   */
  async clearAll(): Promise<void> {
    try {
      const count = await db('puzzles').count('* as count').first();
      const confirm = process.argv.includes('--force');
      
      if (!confirm) {
        console.log(`This will delete ${count?.count || 0} puzzles. Use --force to confirm.`);
        return;
      }

      await db('puzzles').del();
      logger.info(`Deleted all puzzle data (${count?.count || 0} records)`);
      
    } catch (error) {
      logger.error('Failed to clear data:', error);
    }
  }
}

// 命令行接口
async function main() {
  const manager = new PuzzleManager();
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'import':
        const directory = process.argv[3];
        if (!directory) {
          console.log('Usage: puzzle-manager import <directory>');
          process.exit(1);
        }
        await manager.importFromFiles(directory);
        break;
        
      case 'stats':
        await manager.getStatistics();
        break;
        
      case 'test':
        await manager.testRetrieval();
        break;
        
      case 'reset':
        await manager.resetUsage();
        break;
        
      case 'clear':
        await manager.clearAll();
        break;
        
      default:
        console.log('Available commands:');
        console.log('  import <directory>  - Import puzzles from JSON files');
        console.log('  stats              - Show database statistics');
        console.log('  test               - Test puzzle retrieval');
        console.log('  reset              - Reset usage flags');
        console.log('  clear [--force]    - Delete all puzzle data');
        process.exit(1);
    }
  } catch (error) {
    logger.error('Command failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

export { PuzzleManager };