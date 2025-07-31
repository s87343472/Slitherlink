#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:8000';
const API_BASE = `${BASE_URL}/api/v1`;

// 测试用户数据
const testUser = {
  email: 'test-api@example.com',
  username: 'testapi',
  password: 'test123456',
  display_name: 'API Test User'
};

let authToken = null;

// 颜色输出函数
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
};

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const colorFunc = colors[type] || ((x) => x);
  console.log(`[${timestamp}] ${colorFunc(message)}`);
}

// API测试函数
async function testAPI() {
  try {
    log('🚀 开始测试Slitherlink API...', 'cyan');
    
    // 1. 测试健康检查
    log('\n📊 测试健康检查...', 'blue');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    log(`健康检查响应: ${healthResponse.status} - ${healthResponse.data.status}`, 'green');
    
    // 2. 测试API信息
    log('\n📋 测试API信息...', 'blue');
    const infoResponse = await axios.get(`${API_BASE}/info`);
    log(`API信息获取成功: ${infoResponse.data.data.name}`, 'green');
    
    // 3. 测试用户注册
    log('\n👤 测试用户注册...', 'blue');
    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
      log(`用户注册成功: ${registerResponse.data.data.user.username}`, 'green');
      authToken = registerResponse.data.data.token;
      log(`获得认证Token: ${authToken.substring(0, 20)}...`, 'green');
    } catch (error) {
      if (error.response?.status === 409) {
        log('用户已存在，尝试登录...', 'yellow');
        
        // 4. 测试用户登录
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        log(`用户登录成功: ${loginResponse.data.data.user.username}`, 'green');
        authToken = loginResponse.data.data.token;
        log(`获得认证Token: ${authToken.substring(0, 20)}...`, 'green');
      } else {
        throw error;
      }
    }
    
    // 5. 测试获取用户信息
    log('\n🔐 测试认证访问...', 'blue');
    const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    log(`获取用户信息成功: ${profileResponse.data.data.user.email}`, 'green');
    
    const permissions = profileResponse.data.data.permissions;
    log(`用户权限 - 排行榜: ${permissions.hasLeaderboardAccess ? '✅' : '❌'}`, permissions.hasLeaderboardAccess ? 'green' : 'yellow');
    
    // 6. 测试购买排行榜通行证
    if (!permissions.hasLeaderboardAccess) {
      log('\n💳 测试购买排行榜通行证...', 'blue');
      const purchaseResponse = await axios.post(`${API_BASE}/auth/purchase/leaderboard-access`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      log(`购买成功: ${purchaseResponse.data.data.message}`, 'green');
    }
    
    // 7. 测试刷新Token
    log('\n🔄 测试Token刷新...', 'blue');
    const refreshResponse = await axios.post(`${API_BASE}/auth/refresh-token`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    log('Token刷新成功', 'green');
    const newPermissions = refreshResponse.data.data.permissions;
    log(`更新后权限 - 排行榜: ${newPermissions.hasLeaderboardAccess ? '✅' : '❌'}`, newPermissions.hasLeaderboardAccess ? 'green' : 'yellow');
    
    // 8. 测试题目生成（如果算法服务可用）
    log('\n🧩 测试题目生成...', 'blue');
    try {
      const generateResponse = await axios.get(`${API_BASE}/test/generate`);
      log(`题目生成成功: ${generateResponse.data.data.puzzle.seed}`, 'green');
    } catch (error) {
      log('题目生成失败 (可能算法服务未启动)', 'yellow');
    }
    
    log('\n🎉 所有API测试完成！', 'green');
    
  } catch (error) {
    log(`❌ 测试失败: ${error.message}`, 'red');
    if (error.response) {
      log(`响应状态: ${error.response.status}`, 'red');
      log(`响应数据: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    process.exit(1);
  }
}

// 等待服务启动的函数
async function waitForServer() {
  const maxAttempts = 30;
  let attempts = 0;
  
  log('⏳ 等待服务启动...', 'yellow');
  
  while (attempts < maxAttempts) {
    try {
      await axios.get(`${BASE_URL}/health`, { timeout: 2000 });
      log('✅ 服务已启动！', 'green');
      return true;
    } catch (error) {
      attempts++;
      log(`尝试 ${attempts}/${maxAttempts}...`, 'yellow');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw new Error('服务启动超时');
}

// 主函数
async function main() {
  try {
    await waitForServer();
    await testAPI();
  } catch (error) {
    log(`💥 测试中止: ${error.message}`, 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}