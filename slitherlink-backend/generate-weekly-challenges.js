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

async function generateWeeklyChallenges() {
  try {
    console.log('📅 Generating daily challenges for the next 7 days...\n');

    const schedule = {
      0: { gridSize: 10, difficulty: 'difficult', displayName: '困难' }, // Sunday
      1: { gridSize: 5, difficulty: 'easy', displayName: '简单' },       // Monday
      2: { gridSize: 7, difficulty: 'medium', displayName: '中等' },     // Tuesday
      3: { gridSize: 10, difficulty: 'difficult', displayName: '困难' }, // Wednesday
      4: { gridSize: 7, difficulty: 'medium', displayName: '中等' },     // Thursday
      5: { gridSize: 12, difficulty: 'difficult', displayName: '大师' }, // Friday
      6: { gridSize: 15, difficulty: 'difficult', displayName: '忍者' }, // Saturday
    };

    let generated = 0;
    let skipped = 0;

    for (let i = 1; i <= 7; i++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + i);
      const dateString = targetDate.toISOString().split('T')[0];
      const dayOfWeek = targetDate.getDay();
      const config = schedule[dayOfWeek];

      console.log(`\n📅 ${dateString} (${config.displayName} - ${config.gridSize}x${config.gridSize} ${config.difficulty})`);

      // 检查是否已存在
      const existing = await db('daily_challenges')
        .where('challenge_date', dateString)
        .first();

      if (existing) {
        console.log(`  ✅ Already exists: puzzle ${existing.puzzle_id}`);
        skipped++;
        continue;
      }

      // 获取可用的puzzle
      let puzzle = await db('puzzles')
        .where('difficulty', config.difficulty)
        .where('usage_type', 'daily')
        .where('grid_size', config.gridSize)
        .whereNull('used_at')
        .first();

      if (!puzzle) {
        // 尝试regular类型
        puzzle = await db('puzzles')
          .where('difficulty', config.difficulty)
          .where('usage_type', 'regular')
          .where('grid_size', config.gridSize)
          .whereNull('used_at')
          .first();
      }

      if (!puzzle) {
        console.log(`  ❌ No available puzzle found`);
        continue;
      }

      // 创建challenge
      await db('daily_challenges').insert({
        challenge_date: dateString,
        puzzle_id: puzzle.id,
        difficulty: config.difficulty,
        created_at: new Date()
      });

      // 标记puzzle为已使用
      await db('puzzles')
        .where('id', puzzle.id)
        .update({
          used_at: new Date(),
          used_count: db.raw('COALESCE(used_count, 0) + 1')
        });

      console.log(`  ✅ Created: puzzle ${puzzle.id}`);
      generated++;
    }

    console.log(`\n🎉 Summary:`);
    console.log(`   Generated: ${generated} new challenges`);
    console.log(`   Skipped: ${skipped} existing challenges`);

    // 显示接下来7天的安排
    console.log(`\n📊 Next 7 days schedule:`);
    const upcoming = await db('daily_challenges')
      .join('puzzles', 'daily_challenges.puzzle_id', 'puzzles.id')
      .select(
        'daily_challenges.challenge_date',
        'daily_challenges.difficulty',
        'puzzles.grid_size',
        'puzzles.id as puzzle_id'
      )
      .where('challenge_date', '>=', new Date().toISOString().split('T')[0])
      .orderBy('challenge_date')
      .limit(7);

    upcoming.forEach(row => {
      const date = new Date(row.challenge_date);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[date.getDay()];
      console.log(`   ${row.challenge_date} (${dayName}): ${row.grid_size}x${row.grid_size} ${row.difficulty} - Puzzle ${row.puzzle_id}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.destroy();
  }
}

generateWeeklyChallenges();