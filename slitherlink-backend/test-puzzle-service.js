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

// 模拟 PuzzleService.getAvailablePuzzle 方法
async function getAvailablePuzzle(difficulty, usageType, gridSize) {
  try {
    let query = db('puzzles')
      .where('difficulty', difficulty)
      .where('usage_type', usageType)
      .whereNull('used_at');

    if (gridSize) {
      query = query.where('grid_size', gridSize);
    }

    const puzzle = await query
      .orderByRaw('RANDOM()')
      .first();

    return puzzle || null;
  } catch (error) {
    console.error('Error getting available puzzle:', error);
    throw error;
  }
}

async function testPuzzleService() {
  try {
    console.log('🧪 Testing PuzzleService.getAvailablePuzzle method...\n');

    // 测试今天需要的配置：12x12 difficult
    console.log('Testing: 12x12 difficult, daily usage');
    const dailyPuzzle = await getAvailablePuzzle('difficult', 'daily', 12);
    
    if (dailyPuzzle) {
      console.log(`✅ Found daily puzzle: ID ${dailyPuzzle.id}, ${dailyPuzzle.grid_size}x${dailyPuzzle.grid_size} ${dailyPuzzle.difficulty}`);
    } else {
      console.log('❌ No daily puzzle found');
    }
    console.log('');

    // 测试regular类型
    console.log('Testing: 12x12 difficult, regular usage');
    const regularPuzzle = await getAvailablePuzzle('difficult', 'regular', 12);
    
    if (regularPuzzle) {
      console.log(`✅ Found regular puzzle: ID ${regularPuzzle.id}, ${regularPuzzle.grid_size}x${regularPuzzle.grid_size} ${regularPuzzle.difficulty}`);
    } else {
      console.log('❌ No regular puzzle found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.destroy();
  }
}

testPuzzleService();