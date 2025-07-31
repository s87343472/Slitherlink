import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // 清空现有数据
  await knex('user_permissions').del();
  await knex('users').del();

  // 创建管理员用户
  const adminPassword = await bcrypt.hash('admin123', 12);
  
  const [adminUser] = await knex('users').insert({
    email: 'admin@slitherlink.game',
    username: 'admin',
    password_hash: adminPassword,
    display_name: '管理员',
    is_active: true,
    email_verified_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  }).returning('*');

  // 为管理员用户创建完整权限
  await knex('user_permissions').insert({
    user_id: adminUser.id,
    has_leaderboard_access: true,
    has_ad_free_access: true,
    created_at: new Date(),
    updated_at: new Date(),
  });

  // 创建测试用户
  const testPassword = await bcrypt.hash('test123', 12);
  
  const [testUser] = await knex('users').insert({
    email: 'test@example.com',
    username: 'testuser',
    password_hash: testPassword,
    display_name: '测试用户',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  }).returning('*');

  // 为测试用户创建基础权限
  await knex('user_permissions').insert({
    user_id: testUser.id,
    has_leaderboard_access: false,
    has_ad_free_access: false,
    created_at: new Date(),
    updated_at: new Date(),
  });

  console.log('✅ Admin and test users created:');
  console.log('   Admin: admin@slitherlink.game / admin123 (full permissions)');
  console.log('   Test:  test@example.com / test123 (basic permissions)');
}