const fs = require('fs');
const path = require('path');
const knex = require('knex');

// 数据库配置
const db = knex({
  client: 'postgresql',
  connection: {
    host: 'localhost',
    port: 5432,
    user: process.env.USER || 'sagasu',
    password: '',
    database: 'slitherlink'
  }
});

async function importPuzzles(directory) {
  try {
    const files = fs.readdirSync(directory).filter(file => file.endsWith('.json'));
    console.log(`Found ${files.length} JSON files to import`);

    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (const file of files) {
      try {
        const filePath = path.join(directory, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // 检查是否已存在
        const existing = await db('puzzles').where('puzzle_hash', data.puzzle_hash).first();
        if (existing) {
          console.log(`Puzzle already exists, skipping: ${data.puzzle_hash}`);
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
        console.log(`Imported puzzle: ${data.puzzle_hash} (${data.grid_size}x${data.grid_size} ${data.difficulty})`);

      } catch (error) {
        console.error(`Failed to import file ${file}:`, error.message);
        failedCount++;
      }
    }

    console.log(`Import completed - Success: ${successCount}, Failed: ${failedCount}, Skipped: ${skippedCount}`);
    
    // 显示统计
    const total = await db('puzzles').count('* as count').first();
    console.log(`Total puzzles in database: ${total.count}`);

  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await db.destroy();
  }
}

// 从命令行参数获取目录
const directory = process.argv[2];
if (!directory) {
  console.log('Usage: node import-puzzles.js <directory>');
  process.exit(1);
}

importPuzzles(directory);