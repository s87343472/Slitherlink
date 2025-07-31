# 🔧 API 测试示例

这个文档提供了Slitherlink后端API的测试示例。

## 🌐 基础信息

- **基础URL**: `http://localhost:8000`
- **API前缀**: `/api/v1`
- **认证方式**: JWT Bearer Token

## 📊 系统端点

### 健康检查
```bash
curl -X GET http://localhost:8000/health
```

### API信息
```bash
curl -X GET http://localhost:8000/api/v1/info
```

## 👤 用户认证

### 1. 用户注册
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "username": "newuser",
    "password": "password123",
    "display_name": "New User"
  }'
```

### 2. 用户登录
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@slitherlink.game",
    "password": "admin123"
  }'
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@slitherlink.game",
      "username": "admin",
      "display_name": "管理员"
    },
    "permissions": {
      "hasLeaderboardAccess": true,
      "hasAdFreeAccess": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. 获取用户信息 (需要Token)
```bash
curl -X GET http://localhost:8000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. 购买排行榜通行证
```bash
curl -X POST http://localhost:8000/api/v1/auth/purchase/leaderboard-access \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. 刷新Token
```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧩 题目相关

### 测试题目生成
```bash
curl -X GET http://localhost:8000/api/v1/test/generate
```

## 🔧 完整测试流程

### 1. 使用现有测试用户登录
```bash
# 登录管理员用户
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@slitherlink.game",
    "password": "admin123"
  }' | jq -r '.data.token')

echo "Token: $TOKEN"
```

### 2. 获取用户信息
```bash
curl -X GET http://localhost:8000/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### 3. 测试题目生成
```bash
curl -X GET http://localhost:8000/api/v1/test/generate \
  -H "Authorization: Bearer $TOKEN"
```

## 🚨 错误处理

### 常见错误响应

#### 401 未授权
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

#### 400 验证错误
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "\"email\" must be a valid email"
      }
    ]
  }
}
```

#### 409 冲突
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "Email address is already registered"
  }
}
```

## 🧪 自动化测试

### 使用提供的测试脚本
```bash
# 启动后端服务器
./quick-start.sh

# 在另一个终端运行测试
cd slitherlink-backend
node test-api.js
```

### 使用curl脚本
```bash
#!/bin/bash

BASE_URL="http://localhost:8000"

# 1. 健康检查
echo "1. Health check..."
curl -s "$BASE_URL/health" | jq '.'

# 2. 登录获取token
echo "2. Login..."
TOKEN=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@slitherlink.game",
    "password": "admin123"
  }' | jq -r '.data.token')

# 3. 获取用户信息
echo "3. Get profile..."
curl -s "$BASE_URL/api/v1/auth/profile" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 4. 测试题目生成
echo "4. Test puzzle generation..."
curl -s "$BASE_URL/api/v1/test/generate" | jq '.'

echo "All tests completed!"
```

## 📝 注意事项

1. **JWT Token**: 所有需要认证的接口都需要在请求头中包含 `Authorization: Bearer <token>`
2. **内容类型**: POST请求需要设置 `Content-Type: application/json`
3. **测试用户**: 系统提供预设的测试用户，密码为 `admin123` 和 `test123`
4. **限流**: API有速率限制，注册和登录每15分钟最多5次
5. **算法服务**: 题目生成功能需要Java算法服务运行在8080端口

## 🔍 调试技巧

### 查看详细错误
```bash
curl -v -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@email.com","password":"wrong"}'
```

### 检查JWT Token内容
```bash
# 解码JWT token (需要jq)
echo "YOUR_JWT_TOKEN" | cut -d. -f2 | base64 -d | jq '.'
```

### 监控服务器日志
```bash
# 查看实时日志
tail -f logs/backend.log

# 或者查看服务器控制台输出
./quick-start.sh
```