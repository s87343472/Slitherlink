import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 创建题目表
  await knex.schema.createTable('puzzles', (table) => {
    table.bigIncrements('id').primary();
    table.string('puzzle_hash', 64).unique().notNullable();
    table.integer('grid_size').notNullable();
    table.string('difficulty', 20).notNullable();
    table.string('usage_type', 20).notNullable();
    table.jsonb('puzzle_data').notNullable();
    table.jsonb('solution_data').notNullable();
    table.bigInteger('java_seed').notNullable();
    table.integer('estimated_duration');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('used_at');
    table.integer('used_count').defaultTo(0);

    // 约束
    table.check('grid_size >= 5 AND grid_size <= 15');
    table.check("difficulty IN ('easy', 'medium', 'difficult')");
    table.check("usage_type IN ('daily', 'regular')");

    // 索引
    table.index(['difficulty', 'usage_type', 'used_at']);
    table.index(['puzzle_hash']);
    table.index(['java_seed']);
    table.index(['created_at']);
  });

  // 创建题目使用日志表
  await knex.schema.createTable('puzzle_usage_logs', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('puzzle_id').references('id').inTable('puzzles');
    table.bigInteger('user_id').references('id').inTable('users');
    table.date('used_date').notNullable();
    table.string('usage_context', 50).notNullable();
    table.integer('completion_time');
    table.integer('score');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // 索引
    table.index(['used_date', 'usage_context']);
    table.index(['puzzle_id']);
    table.index(['user_id']);
  });

  // 创建生成任务记录表
  await knex.schema.createTable('generation_tasks', (table) => {
    table.bigIncrements('id').primary();
    table.string('task_type', 20).notNullable();
    table.jsonb('requested_counts').notNullable();
    table.string('status', 20).notNullable();
    table.integer('progress_current').defaultTo(0);
    table.integer('progress_total').notNullable();
    table.integer('generated_count').defaultTo(0);
    table.integer('failed_count').defaultTo(0);
    table.text('error_message');
    table.timestamp('started_at');
    table.timestamp('completed_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // 约束
    table.check("task_type IN ('initial', 'weekly', 'manual')");
    table.check("status IN ('pending', 'running', 'completed', 'failed')");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('generation_tasks');
  await knex.schema.dropTableIfExists('puzzle_usage_logs');
  await knex.schema.dropTableIfExists('puzzles');
}