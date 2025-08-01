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

async function debugDailyChallenge() {
  try {
    console.log('🔍 Debugging daily challenge logic...\n');

    // 检查今天的调度配置
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    const schedule = {
      0: { gridSize: 10, difficulty: 'difficult', displayName: '困难' }, // Sunday
      1: { gridSize: 5, difficulty: 'easy', displayName: '简单' },       // Monday
      2: { gridSize: 7, difficulty: 'medium', displayName: '中等' },     // Tuesday
      3: { gridSize: 10, difficulty: 'difficult', displayName: '困难' }, // Wednesday
      4: { gridSize: 7, difficulty: 'medium', displayName: '中等' },     // Thursday
      5: { gridSize: 12, difficulty: 'difficult', displayName: '大师' }, // Friday
      6: { gridSize: 15, difficulty: 'difficult', displayName: '忍者' }, // Saturday
    };

    const config = schedule[dayOfWeek];
    console.log(`📅 Today is ${today.toDateString()} (day ${dayOfWeek})`);
    console.log(`📋 Required: ${config.gridSize}x${config.gridSize} ${config.difficulty} (${config.displayName})`);
    console.log('');

    // 检查daily_challenges表
    const existingChallenges = await db('daily_challenges')
      .select('*')
      .orderBy('challenge_date', 'desc')
      .limit(5);
    
    console.log('📊 Recent daily challenges:');
    if (existingChallenges.length > 0) {
      existingChallenges.forEach(challenge => {
        console.log(`  - ${challenge.challenge_date}: puzzle ${challenge.puzzle_id}`);
      });
    } else {
      console.log('  (no challenges found)');
    }
    console.log('');

    // 检查可用的daily puzzles
    console.log('🎯 Available daily puzzles:');
    const dailyPuzzles = await db('puzzles')
      .select('id', 'grid_size', 'difficulty', 'usage_type', 'used_at')
      .where('usage_type', 'daily')
      .orderBy(['grid_size', 'difficulty']);

    dailyPuzzles.forEach(puzzle => {
      const status = puzzle.used_at ? '(used)' : '(available)';
      console.log(`  - ID ${puzzle.id}: ${puzzle.grid_size}x${puzzle.grid_size} ${puzzle.difficulty} ${status}`);
    });
    console.log('');

    // 测试今天的查询
    console.log(`🔍 Testing query for ${config.gridSize}x${config.gridSize} ${config.difficulty}:`);
    
    const availablePuzzle = await db('puzzles')
      .where('difficulty', config.difficulty)
      .where('usage_type', 'daily')
      .where('grid_size', config.gridSize)
      .whereNull('used_at')
      .first();

    if (availablePuzzle) {
      console.log(`✅ Found puzzle: ID ${availablePuzzle.id}`);
    } else {
      console.log('❌ No matching puzzle found');
      
      // 检查是否有regular类型的
      const regularPuzzle = await db('puzzles')
        .where('difficulty', config.difficulty)
        .where('usage_type', 'regular')
        .where('grid_size', config.gridSize)
        .whereNull('used_at')
        .first();
      
      if (regularPuzzle) {
        console.log(`ℹ️  Found regular puzzle: ID ${regularPuzzle.id}`);
      } else {
        console.log('❌ No regular puzzle found either');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.destroy();
  }
}

debugDailyChallenge();