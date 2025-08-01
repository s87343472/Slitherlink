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

async function updatePuzzleTypes() {
  try {
    console.log('🔧 Updating puzzle usage types for daily challenges...');

    // 为每种配置保留一些puzzle作为daily使用
    const configs = [
      { grid_size: 5, difficulty: 'easy', count: 3 },      // Monday
      { grid_size: 7, difficulty: 'medium', count: 5 },    // Tuesday, Thursday
      { grid_size: 10, difficulty: 'difficult', count: 5 }, // Sunday, Wednesday
      { grid_size: 12, difficulty: 'difficult', count: 3 }, // Friday - Master
      { grid_size: 15, difficulty: 'difficult', count: 2 }, // Saturday - Ninja
    ];

    let totalUpdated = 0;

    for (const config of configs) {
      // 获取符合条件的puzzle
      const puzzles = await db('puzzles')
        .where('grid_size', config.grid_size)
        .where('difficulty', config.difficulty)
        .where('usage_type', 'regular')
        .whereNull('used_at')
        .limit(config.count);

      if (puzzles.length > 0) {
        // 更新这些puzzle的usage_type为daily
        const puzzleIds = puzzles.map(p => p.id);
        
        const updated = await db('puzzles')
          .whereIn('id', puzzleIds)
          .update({
            usage_type: 'daily',
            updated_at: new Date()
          });

        console.log(`✅ Updated ${updated} puzzles: ${config.grid_size}x${config.grid_size} ${config.difficulty} → daily`);
        totalUpdated += updated;
      } else {
        console.log(`⚠️  No available puzzles found: ${config.grid_size}x${config.grid_size} ${config.difficulty}`);
      }
    }

    console.log(`\n🎉 Total updated: ${totalUpdated} puzzles`);

    // 显示统计
    const stats = await db('puzzles')
      .select('usage_type', 'difficulty', 'grid_size')
      .count('* as count')
      .groupBy('usage_type', 'difficulty', 'grid_size')
      .orderBy(['usage_type', 'grid_size', 'difficulty']);

    console.log('\n📊 Current puzzle distribution:');
    console.log('Usage Type | Grid Size | Difficulty | Count');
    console.log('-----------|-----------|------------|------');
    
    stats.forEach(row => {
      console.log(`${row.usage_type.padEnd(10)} | ${String(row.grid_size).padEnd(9)} | ${row.difficulty.padEnd(10)} | ${row.count}`);
    });

  } catch (error) {
    console.error('❌ Error updating puzzle types:', error);
  } finally {
    await db.destroy();
  }
}

updatePuzzleTypes();