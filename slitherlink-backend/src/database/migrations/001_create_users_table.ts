import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 创建用户表
  await knex.schema.createTable('users', (table) => {
    table.bigIncrements('id').primary();
    table.string('email', 255).unique().notNullable();
    table.string('username', 50).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('display_name', 100);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('last_login_at');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('email_verified_at');

    // 索引
    table.index(['email']);
    table.index(['username']);
    table.index(['is_active']);
  });

  // 创建用户权限表
  await knex.schema.createTable('user_permissions', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.boolean('has_leaderboard_access').defaultTo(false);
    table.boolean('has_ad_free_access').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // 索引
    table.index(['user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_permissions');
  await knex.schema.dropTableIfExists('users');
}