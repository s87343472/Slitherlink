const knex = require('knex');

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

async function manuallyCreateDailyChallenge() {
  try {
    console.log('🎯 Manually creating daily challenge for today...\n');

    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    
    console.log(`📅 Date: ${dateString}`);
    
    // 检查是否已经存在
    const existing = await db('daily_challenges')
      .where('challenge_date', dateString)
      .first();
      
    if (existing) {
      console.log(`⚠️  Daily challenge already exists for ${dateString}: puzzle ${existing.puzzle_id}`);
      return;
    }

    // 获取今天的配置
    const dayOfWeek = today.getDay();
    const schedule = {
      0: { gridSize: 10, difficulty: 'difficult' },
      1: { gridSize: 5, difficulty: 'easy' },
      2: { gridSize: 7, difficulty: 'medium' },
      3: { gridSize: 10, difficulty: 'difficult' },
      4: { gridSize: 7, difficulty: 'medium' },
      5: { gridSize: 12, difficulty: 'difficult' },
      6: { gridSize: 15, difficulty: 'difficult' },
    };
    
    const { gridSize, difficulty } = schedule[dayOfWeek];
    console.log(`📋 Required: ${gridSize}x${gridSize} ${difficulty}`);

    // 获取可用的puzzle
    const puzzle = await db('puzzles')
      .where('difficulty', difficulty)
      .where('usage_type', 'daily')
      .where('grid_size', gridSize)
      .whereNull('used_at')
      .first();

    if (!puzzle) {
      console.log('❌ No suitable daily puzzle found');
      return;
    }

    console.log(`✅ Selected puzzle: ID ${puzzle.id}`);

    // 创建daily challenge记录
    await db('daily_challenges').insert({
      challenge_date: dateString,
      puzzle_id: puzzle.id,
      difficulty: difficulty,
      created_at: new Date()
    });

    // 标记puzzle为已使用
    await db('puzzles')
      .where('id', puzzle.id)
      .update({
        used_at: new Date(),
        used_count: db.raw('COALESCE(used_count, 0) + 1')
      });

    console.log(`🎉 Daily challenge created successfully!`);
    console.log(`   Date: ${dateString}`);
    console.log(`   Puzzle: ID ${puzzle.id} (${gridSize}x${gridSize} ${difficulty})`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.destroy();
  }
}

manuallyCreateDailyChallenge();