# Slitherlink Backend API

基于Node.js + TypeScript + PostgreSQL的数回在线游戏平台后端API服务。

## 功能特性

- 🎮 **题目管理系统** - 集成Java算法服务生成和管理数回题目
- 👤 **用户系统** - 用户注册、登录、权限管理
- 🏆 **排行榜系统** - 多维度排行榜和计分系统
- 🏅 **奖杯系统** - 自动发放奖杯奖励
- 📅 **每日挑战** - 自动更新的每日题目
- 💾 **缓存优化** - 内存缓存提升性能
- 🔒 **安全保护** - JWT认证、限流保护

## 技术栈

- **运行时**: Node.js 20+
- **语言**: TypeScript 5.0+
- **框架**: Express.js 4.19+
- **数据库**: PostgreSQL 15+
- **缓存**: node-cache (内存缓存)
- **ORM**: Knex.js
- **认证**: JWT + bcrypt
- **日志**: Winston
- **算法服务**: Java Dropwizard (集成现有SlitherLink算法)

## 快速开始

### 1. 环境要求

- Node.js 20+
- PostgreSQL 15+
- Java 8+ (用于算法服务)

### 2. 数据库设置

运行数据库安装脚本：

\`\`\`bash
cd scripts
./setup-database.sh
\`\`\`

这个脚本会：
- 在macOS上通过Homebrew安装PostgreSQL
- 在Linux上通过包管理器安装PostgreSQL
- 创建数据库和用户
- 生成.env配置文件

### 3. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 4. 配置环境变量

复制并编辑环境变量文件：

\`\`\`bash
cp .env.example .env
# 编辑.env文件，更新数据库连接等配置
\`\`\`

### 5. 运行数据库迁移

\`\`\`bash
npm run db:migrate
\`\`\`

### 6. 启动Java算法服务

在另一个终端中启动算法服务：

\`\`\`bash
cd ../SlitherLink-analysis
mvn clean package
java -jar target/puzzle-*.jar server config.yml
\`\`\`

算法服务将在 http://localhost:8080 运行

### 7. 启动后端API服务

\`\`\`bash
npm run dev
\`\`\`

API服务将在 http://localhost:8000 运行

## API端点

### 健康检查
- \`GET /health\` - 系统健康状态

### 基础信息
- \`GET /api/v1/info\` - API信息

### 测试端点
- \`GET /api/v1/test/generate\` - 测试题目生成

## 数据库结构

### 核心表

- \`users\` - 用户基本信息
- \`user_permissions\` - 用户权限
- \`puzzles\` - 题目库
- \`game_sessions\` - 游戏会话
- \`leaderboards\` - 排行榜记录
- \`trophies\` - 奖杯记录
- \`daily_challenges\` - 每日挑战

### 辅助表

- \`puzzle_usage_logs\` - 题目使用日志
- \`generation_tasks\` - 题目生成任务记录

## 开发命令

\`\`\`bash
# 开发模式（热重载）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务
npm start

# 运行测试
npm test

# 代码检查
npm run lint

# 数据库迁移
npm run db:migrate

# 回滚数据库
npm run db:rollback
\`\`\`

## 环境变量

主要环境变量说明：

\`\`\`bash
# 服务器配置
PORT=8000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=slitherlink
DB_USER=your_user
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# 算法服务配置
ALGORITHM_SERVICE_URL=http://localhost:8080

# CORS配置
CORS_ORIGINS=http://localhost:3000
\`\`\`

## 题目生成系统

系统集成了Java算法服务来生成数回题目：

### 题目类型
- **每日挑战题目**: 每天固定更新的题目
- **常规游戏题目**: 随机游戏使用的题目

### 难度等级
- **Easy** (7x7网格): 适合新手
- **Medium** (10x10网格): 中等难度
- **Difficult** (12x12网格): 高难度

### 库存管理
- 自动监控题目库存量
- 库存不足时自动补充
- 防重复机制确保题目唯一性

## 缓存策略

使用node-cache实现多层内存缓存：

- **排行榜缓存**: 30分钟TTL
- **用户权限缓存**: 1小时TTL
- **题目库存缓存**: 5分钟TTL
- **每日挑战缓存**: 1天TTL
- **系统健康状态缓存**: 1分钟TTL

## 日志系统

使用Winston进行结构化日志记录：

- **控制台输出**: 开发环境彩色日志
- **文件日志**: 生产环境日志文件
- **错误日志**: 单独的错误日志文件
- **日志级别**: info/warn/error/debug

## 安全措施

- **JWT认证**: 基于Token的用户认证
- **密码加密**: bcrypt加密存储
- **限流保护**: 防止API滥用
- **CORS配置**: 跨域请求控制
- **输入验证**: Joi参数验证
- **SQL注入防护**: 参数化查询

## 监控和健康检查

- **/health端点**: 实时系统状态检查
- **数据库连接监控**: 自动检测数据库状态
- **算法服务监控**: 检查Java服务可用性
- **题目库存监控**: 自动库存预警

## 生产部署

1. 设置环境变量
2. 构建应用: \`npm run build\`
3. 启动服务: \`npm start\`
4. 配置反向代理(Nginx)
5. 设置SSL证书
6. 配置监控和日志收集

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查PostgreSQL是否运行
   - 验证连接参数
   - 检查防火墙设置

2. **算法服务不可用**
   - 确认Java服务运行在8080端口
   - 检查ALGORITHM_SERVICE_URL配置
   - 查看Java服务日志

3. **题目生成失败**
   - 检查算法服务状态
   - 查看错误日志
   - 验证题目生成参数

4. **内存使用过高**
   - 清理缓存: 重启服务
   - 检查内存泄漏
   - 调整缓存TTL设置

## 贡献指南

1. Fork本项目
2. 创建特性分支
3. 提交变更
4. 创建Pull Request

## 许可证

MIT License