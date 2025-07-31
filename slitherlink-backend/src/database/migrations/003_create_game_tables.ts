import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 创建游戏会话表
  await knex.schema.createTable('game_sessions', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').references('id').inTable('users');
    table.bigInteger('puzzle_id').references('id').inTable('puzzles');
    table.timestamp('started_at').defaultTo(knex.fn.now());
    table.timestamp('completed_at');
    table.integer('duration_seconds');
    table.integer('score');
    table.integer('errors_count').defaultTo(0);
    table.boolean('is_completed').defaultTo(false);
    table.jsonb('user_solution');

    // 索引
    table.index(['user_id']);
    table.index(['completed_at']);
    table.index(['is_completed']);
  });

  // 创建排行榜表
  await knex.schema.createTable('leaderboards', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').references('id').inTable('users');
    table.bigInteger('puzzle_id').references('id').inTable('puzzles');
    table.integer('score').notNullable();
    table.integer('completion_time').notNullable();
    table.integer('rank_daily');
    table.integer('rank_weekly');
    table.integer('rank_monthly');
    table.integer('rank_all_time');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // 索引
    table.index(['user_id']);
    table.index(['rank_daily']);
    table.index(['rank_weekly']);
    table.index(['rank_monthly']);
    table.index(['rank_all_time']);
    table.index(['created_at']);
  });

  // 创建奖杯表
  await knex.schema.createTable('trophies', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').references('id').inTable('users');
    table.string('trophy_type', 50).notNullable();
    table.date('period_start').notNullable();
    table.date('period_end').notNullable();
    table.integer('rank').notNullable();
    table.timestamp('awarded_at').defaultTo(knex.fn.now());

    // 约束
    table.check("trophy_type IN ('daily', 'weekly', 'monthly')");
    table.check("rank >= 1 AND rank <= 3");

    // 索引
    table.index(['user_id']);
    table.index(['trophy_type', 'period_start']);
  });

  // 创建每日挑战表
  await knex.schema.createTable('daily_challenges', (table) => {
    table.bigIncrements('id').primary();
    table.date('challenge_date').unique().notNullable();
    table.bigInteger('puzzle_id').references('id').inTable('puzzles');
    table.string('difficulty', 20).notNullable();
    table.integer('participants_count').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // 索引
    table.index(['challenge_date']);
    table.index(['difficulty']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('daily_challenges');
  await knex.schema.dropTableIfExists('trophies');
  await knex.schema.dropTableIfExists('leaderboards');
  await knex.schema.dropTableIfExists('game_sessions');
}