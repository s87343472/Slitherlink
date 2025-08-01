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

async function checkCustomPuzzleStock() {
  try {
    console.log('📊 Checking Custom Puzzle stock levels...\n');

    // 检查所有regular类型的puzzle（用于custom游戏）
    const stockQuery = await db.raw(`
      SELECT 
        grid_size, 
        difficulty, 
        usage_type,
        COUNT(*) as total,
        SUM(CASE WHEN used_at IS NULL THEN 1 ELSE 0 END) as available
      FROM puzzles 
      WHERE usage_type = 'regular'
      GROUP BY grid_size, difficulty, usage_type
      ORDER BY grid_size, difficulty
    `);

    console.log('📋 Custom Puzzle Stock Report (Regular Usage Type):');
    console.log('Grid Size | Difficulty | Available | Total | Usage Rate');
    console.log('----------|------------|-----------|-------|------------');

    let totalAvailable = 0;
    let totalPuzzles = 0;
    const stockSummary = {};

    stockQuery.rows.forEach(row => {
      const available = parseInt(row.available) || 0;
      const total = parseInt(row.total);
      const usageRate = ((total - available) / total * 100).toFixed(1);
      
      console.log(`${String(row.grid_size).padEnd(9)} | ${row.difficulty.padEnd(10)} | ${String(available).padEnd(9)} | ${String(total).padEnd(5)} | ${usageRate}%`);
      
      totalAvailable += available;
      totalPuzzles += total;

      // 为库存分析准备数据
      const key = `${row.grid_size}x${row.grid_size}`;
      if (!stockSummary[key]) {
        stockSummary[key] = { easy: 0, medium: 0, difficult: 0, total: 0 };
      }
      stockSummary[key][row.difficulty] = available;
      stockSummary[key].total += available;
    });

    console.log('----------|------------|-----------|-------|------------');
    console.log(`Total Available: ${totalAvailable} / ${totalPuzzles} (${((totalPuzzles - totalAvailable) / totalPuzzles * 100).toFixed(1)}% used)`);

    // 检查每种尺寸的分布
    console.log('\n🎯 Stock by Grid Size:');
    console.log('Grid Size | Easy | Medium | Difficult | Total');
    console.log('----------|------|--------|-----------|------');

    Object.entries(stockSummary).forEach(([size, stock]) => {
      console.log(`${size.padEnd(9)} | ${String(stock.easy).padEnd(4)} | ${String(stock.medium).padEnd(6)} | ${String(stock.difficult).padEnd(9)} | ${stock.total}`);
    });

    // 检查库存告警
    console.log('\n⚠️  Stock Alerts:');
    const lowStockThreshold = 10;
    let needsReplenishment = false;

    Object.entries(stockSummary).forEach(([size, stock]) => {
      ['easy', 'medium', 'difficult'].forEach(difficulty => {
        if (stock[difficulty] < lowStockThreshold) {
          console.log(`   🔴 LOW: ${size} ${difficulty} - only ${stock[difficulty]} available`);
          needsReplenishment = true;
        } else if (stock[difficulty] < 20) {
          console.log(`   🟡 MEDIUM: ${size} ${difficulty} - ${stock[difficulty]} available`);
        } else {
          console.log(`   🟢 GOOD: ${size} ${difficulty} - ${stock[difficulty]} available`);
        }
      });
    });

    // 检查缺失的配置
    console.log('\n🔍 Missing Configurations:');
    const expectedSizes = [5, 7, 10, 12, 15];
    const expectedDifficulties = ['easy', 'medium', 'difficult'];
    
    expectedSizes.forEach(size => {
      expectedDifficulties.forEach(difficulty => {
        const found = stockQuery.rows.find(row => row.grid_size === size && row.difficulty === difficulty);
        if (!found) {
          console.log(`   ❌ Missing: ${size}x${size} ${difficulty}`);
          needsReplenishment = true;
        }
      });
    });

    // 最近使用情况
    console.log('\n📈 Recent Usage (Last 24 hours):');
    const recentUsage = await db('puzzles')
      .select('grid_size', 'difficulty')
      .count('* as used_count')
      .where('usage_type', 'regular')
      .where('used_at', '>', new Date(Date.now() - 24 * 60 * 60 * 1000))
      .groupBy('grid_size', 'difficulty')
      .orderBy(['grid_size', 'difficulty']);

    if (recentUsage.length > 0) {
      recentUsage.forEach(row => {
        console.log(`   ${row.grid_size}x${row.grid_size} ${row.difficulty}: ${row.used_count} used`);
      });
    } else {
      console.log('   No puzzles used in the last 24 hours');
    }

    // 建议
    console.log('\n💡 Recommendations:');
    if (needsReplenishment) {
      console.log('   🔄 Run puzzle generation script to replenish low stock');
      console.log('   📝 Consider generating more puzzles for popular configurations');
    } else {
      console.log('   ✅ Stock levels are healthy');
    }

    console.log('\n🎮 Ready for Custom Puzzle gameplay!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.destroy();
  }
}

checkCustomPuzzleStock();