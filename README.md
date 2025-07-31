# 🎮 数回 Slitherlinks - Ultimate Puzzle Platform

> **The premier online platform for Slitherlink puzzle enthusiasts with professional error handling, competitive gameplay, and modern user experience.**

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black.svg)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.org/)

## 🌟 Professional Features

### 🎯 Core Gameplay
- **Daily Challenges**: New puzzles every day with varying difficulties
- **Multiple Difficulty Levels**: Easy, Medium, Hard, Master, Ninja
- **Grid Sizes**: 5×5 to 15×15 customizable puzzle grids  
- **Real-time Validation**: Instant feedback on puzzle solutions
- **Solution Tracking**: Track completion times and error counts

### 🏆 Competitive Features
- **Global Leaderboards**: Compete with players worldwide
- **User Accounts & Authentication**: Secure JWT-based auth system
- **Premium Access**: Leaderboard access with $1.99 subscription
- **Trophy System**: Earn achievements for puzzle completions
- **Statistics Tracking**: Personal performance analytics

### 💻 Professional User Experience  
- **Custom Error Handling**: Professional error pages (404, 500, offline)
- **Toast Notifications**: No more browser alerts - custom branded notifications
- **Error Boundaries**: Graceful error recovery for game components  
- **Loading States**: Engaging puzzle-themed loading animations
- **Mobile Responsive**: Optimized for all devices and screen sizes
- **SEO Optimized**: Complete metadata, structured data, sitemap

### 📄 Legal & Compliance
- **Privacy Policy**: GDPR & CCPA compliant data protection
- **Terms of Service**: Comprehensive user agreement
- **Cookie Policy**: Transparent cookie usage disclosure
- **Contact & Support**: Multiple support channels
- **FAQ Section**: Comprehensive help documentation

### 🏗️ Technical Architecture
```
Independent Service Architecture
┌─────────────────────────────────────────────┐
│  🎨 Web Platform (slitherlinks.com)        │
│  ┌─────────────────┬─────────────────────┐  │
│  │ Frontend        │ Backend API         │  │
│  │ (Next.js 15)    │ (Node.js + Express) │  │
│  │ • Error Pages   │ • JWT Auth          │  │ 
│  │ • Toast System  │ • RESTful API       │  │
│  │ • Loading States│ • Database Layer    │  │
│  │ • SEO Optimized │ • Error Handling    │  │
│  └─────────────────┴─────────────────────┘  │
│           │                    │             │
│           └─────── HTTP ───────┘             │
└─────────────────────────────────────────────┘
           │
           │ Database Queries Only
           │ (No Direct API Calls)
           ▼
┌─────────────────────────────────────────────┐
│     📊 PostgreSQL Database                  │
│     • User Data  • Puzzles  • Leaderboards │
└─────────────────────────────────────────────┘
           ▲
           │ Puzzle Generation
           │ (Independent Process)
           │
┌─────────────────────────────────────────────┐
│  🧮 Algorithm Service (Independent)         │
│  • Java + Maven                             │
│  • High-Performance Puzzle Engine           │
│  • Batch Puzzle Generation                  │
│  • Stores puzzles directly to database      │
└─────────────────────────────────────────────┘
```

## 🚀 快速开始

### 环境要求
- **Node.js** 20+
- **PostgreSQL** 15+
- **Java** 8+ (用于算法服务)
- **Maven** 3.6+ (构建Java项目)

### 🚀 启动方式

#### 1. 快速启动（推荐开发使用）
```bash
./quick-start.sh
```
- 🔧 只启动后端API服务
- 📊 自动检查和启动PostgreSQL
- 🗄️ 自动初始化数据库和用户
- ⚡ 最快速的开发启动方式

#### 2. 完整启动
```bash
./start-project.sh
```
启动选项：
- `4` 🌟 启动Web平台 (推荐) - 前端 + 后端
- `5` 🧮 启动算法服务 (独立运行，用于题目生成)  
- `6` 🎯 启动所有服务 (平台 + 算法服务)

#### 3. 停止所有服务
```bash
./stop-project.sh
```
- 🛑 智能查找并停止所有相关进程
- 🧹 清理端口占用
- 📝 保留日志文件

### 手动启动

如果需要单独启动各个服务：

#### 1. 设置数据库
```bash
cd slitherlink-backend
./scripts/setup-database.sh
```

#### 2. 启动算法服务
```bash
cd SlitherLink-analysis
mvn clean package
java -jar target/puzzle-*.jar server config.yml
```

#### 3. 启动后端API
```bash
cd slitherlink-backend
npm install
npm run db:migrate
npm run dev
```

#### 4. 启动前端
```bash
cd slitherlink-web  
npm install
npm run dev
```

## 📁 Professional Project Structure

```
Slitherlink/ 
├── 🎨 slitherlink-web/          # Next.js 15 Frontend
│   ├── app/                     # App Router Pages
│   │   ├── (legal)/            # Legal Pages (Privacy, Terms, Cookies)
│   │   ├── (info)/             # Info Pages (About, FAQ, Contact, Changelog)
│   │   ├── error.tsx           # Global Error Page
│   │   ├── loading.tsx         # Professional Loading Page
│   │   ├── not-found.tsx       # Custom 404 Page
│   │   └── layout.tsx          # Root Layout with ToastProvider
│   ├── components/             # React Components
│   │   ├── auth/               # Authentication Components
│   │   ├── game/               # Game Components with Error Boundaries
│   │   ├── leaderboard/        # Leaderboard Components
│   │   └── ui/                 # UI Components (Toast, ErrorBoundary)
│   └── lib/                    # Services and Utilities
│       ├── services/           # API Client and Services
│       ├── store/              # Zustand State Management
│       └── types/              # TypeScript Definitions
│
├── 🔧 slitherlink-backend/      # Node.js Backend API
│   ├── src/                     # TypeScript Source
│   │   ├── controllers/        # API Controllers
│   │   ├── services/           # Business Logic
│   │   ├── models/             # Database Models
│   │   ├── routes/             # API Routes
│   │   ├── middleware/         # Auth and Validation
│   │   └── database/           # Migrations and Seeds
│   ├── scripts/                # Utility Scripts
│   └── migrations/             # SQL Database Migrations
│
├── 🧮 SlitherLink-analysis/     # Java Algorithm Service
│   ├── src/main/java/com/puzzle/
│   │   ├── core/               # Algorithm Implementation
│   │   ├── resources/          # REST API Endpoints
│   │   └── views/              # Web Interface Templates
│   └── config.yml              # Service Configuration
│
├── 📝 docs/                     # Documentation
├── 📊 logs/                     # Service Logs
├── 🚀 start-project.sh          # Professional Startup Script
├── 🛑 stop-project.sh           # Professional Shutdown Script
└── 📖 README.md                 # This Documentation
```

## 🎮 游戏功能

### 数回游戏规则
数回(Slitherlink)是经典的逻辑拼图游戏：
- 在网格点之间画线条
- 数字表示周围应画的线条数量
- 最终形成单一闭合回路
- 没有分支或交叉

### 难度等级
- **简单** (7×7): 适合新手，约5-10分钟
- **中等** (10×10): 中等难度，约10-20分钟
- **困难** (12×12): 高难度，约20-40分钟

### 每日挑战循环
- 周一: 简单 (7×7)
- 周二: 中等 (10×10)
- 周三: 困难 (12×12)
- 周四: 中等 (10×10)
- 周五: 大师 (15×15)
- 周六: 忍者 (15×15)
- 周日: 困难 (12×12)

## 👤 用户系统

### 认证功能
- **用户注册**: `POST /api/v1/auth/register`
- **用户登录**: `POST /api/v1/auth/login`
- **获取用户信息**: `GET /api/v1/auth/profile`
- **刷新Token**: `POST /api/v1/auth/refresh-token`
- **购买排行榜通行证**: `POST /api/v1/auth/purchase/leaderboard-access`

### 测试用户
系统启动后自动创建以下测试用户：
- **管理员**: `admin@slitherlink.game` / `admin123` (完整权限)
- **测试用户**: `test@example.com` / `test123` (基础权限)

### 权限系统
- **排行榜权限**: 购买通行证后可参与排名竞争
- **无广告权限**: 移除所有广告显示

## 🏆 排行榜系统

### 计分规则
```
基础分数 = 根据难度设定 (简单1000分，中等1500分，困难2000分)
时间惩罚 = (实际用时 / 预估用时) × 200分
错误惩罚 = 错误次数 × 50分
最终得分 = max(基础分数 - 时间惩罚 - 错误惩罚, 100分)
```

### 排行榜类型
- **当日排行**: 当天完成题目的最高分
- **当周排行**: 本周累计分数排名  
- **当月排行**: 本月累计分数排名
- **总排行**: 历史累计分数排名

### 付费机制
- **免费用户**: 可查看排行榜，但成绩不参与排名
- **排行榜通行证** ($1.99): 购买后成绩自动提交排行榜

## 🏅 奖杯系统

### 奖杯类型
- **日奖杯**: 每日排行前3名 (金银铜)
- **周奖杯**: 每周排行前3名 (金银铜)  
- **月奖杯**: 每月排行前3名 (金银铜)

### 发放机制
- 每日0:05自动统计并发放奖杯
- 只有购买排行榜通行证的用户才能获得奖杯
- 奖杯显示在用户头像和个人资料中

## 🛠️ 开发指南

### 后端API文档
详见 [slitherlink-backend/README.md](slitherlink-backend/README.md)

主要端点：
- `GET /health` - 系统健康检查
- `GET /api/v1/info` - API基本信息
- `GET /api/v1/test/generate` - 测试题目生成

### 前端开发
基于Next.js 15 + Phaser.js 3.70构建，详细说明见前端目录。

### 数据库设计
使用PostgreSQL，包含以下核心表：
- `users` - 用户基本信息
- `user_permissions` - 用户权限
- `puzzles` - 题目库
- `game_sessions` - 游戏会话
- `leaderboards` - 排行榜记录
- `trophies` - 奖杯记录

## 📊 系统监控

### 健康检查
访问 `http://localhost:8000/health` 查看系统状态：
- 数据库连接状态
- 算法服务状态  
- 题目库存水平

### 日志文件
运行时日志存储在 `logs/` 目录：
- `algorithm.log` - Java算法服务日志
- `backend.log` - Node.js后端日志
- `frontend.log` - Next.js前端日志

## 🔒 Professional Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure authentication with refresh tokens
- **Password Security**: bcrypt hashing with salt rounds
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Comprehensive sanitization and validation
- **CORS Configuration**: Secure cross-origin request handling

### Data Protection
- **GDPR Compliance**: Complete privacy policy implementation
- **Cookie Management**: Transparent cookie usage policies
- **Secure Headers**: Security headers and CSP implementation
- **SQL Injection Prevention**: Parameterized queries and validation

## 💫 Professional User Experience

### Error Handling & Recovery
- **Custom Error Pages**: Professional 404, 500, and offline pages
- **Error Boundaries**: Graceful error recovery for React components
- **Toast Notifications**: Branded notifications replacing browser alerts
- **Loading States**: Engaging puzzle-themed loading animations
- **Retry Mechanisms**: Smart retry functionality for failed operations

### SEO & Performance Optimization
- **Next.js 15 Optimization**: Static generation and code splitting
- **Structured Data**: JSON-LD markup for search engines
- **XML Sitemap**: Auto-generated sitemap for better indexing
- **Meta Tags**: Complete OpenGraph and Twitter Card implementation
- **Performance Monitoring**: Built-in performance tracking

### Production-Ready Features
- **Memory Caching**: Hot data caching for leaderboards and permissions
- **Database Connection Pooling**: Optimized database connections
- **Pre-generated Puzzles**: Automated puzzle library maintenance
- **Database Indexing**: Optimized query performance
- **Comprehensive Logging**: Structured logging for monitoring

## 🚨 故障排除

### 常见问题

1. **数据库连接失败**
   ```bash
   # 检查PostgreSQL状态
   brew services list | grep postgresql  # macOS
   sudo systemctl status postgresql      # Linux
   ```

2. **算法服务启动失败**
   ```bash
   # 检查Java版本
   java -version
   # 重新构建
   cd SlitherLink-analysis && mvn clean package
   ```

3. **端口冲突**
   - 前端: 3000
   - 后端: 8000  
   - 算法: 8080
   
   使用 `lsof -i :端口号` 检查端口占用

4. **题目生成失败**
   - 检查数据库中是否有题目库存 
   - 运行 `./batch-generate-puzzles.sh` 生成题目
   - 查看后端日志排查具体错误
   - 算法服务独立运行，不影响网站正常使用

## 🌐 Production Deployment

### Domain Configuration
- **Production Domain**: slitherlinks.com
- **SSL/HTTPS**: Required for production deployment
- **CDN Integration**: Optimized static asset delivery

### Environment Variables
```bash
# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/slitherlink
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production

# Frontend (.env.local)  
NEXT_PUBLIC_API_URL=https://api.slitherlinks.com
NEXT_PUBLIC_SITE_URL=https://slitherlinks.com
```

### Build & Compilation
```bash
# Frontend Production Build
cd slitherlink-web && npm run build ✅

# Backend TypeScript Compilation  
cd slitherlink-backend && npm run build ✅

# Algorithm Service Build
cd SlitherLink-analysis && mvn clean package ✅
```

## 📋 Development Status

### ✅ Completed Features
- **Professional Error Handling**: Custom 404, 500, offline pages
- **Toast Notification System**: Branded notifications system  
- **Error Boundaries**: React error boundaries for game components
- **Loading States**: Professional loading animations
- **SEO Optimization**: Complete meta tags, structured data, sitemap
- **Legal Compliance**: Privacy policy, terms of service, cookie policy
- **Architecture Correction**: Independent service architecture implemented
- **Frontend Build**: Successfully compiles to production ✅
- **Backend Build**: TypeScript compilation issues resolved ✅

### 🚧 In Development  
- **Internationalization (i18n)**: Multi-language support
- **Payment Integration**: Stripe/PayPal for premium features
- **Trophy System**: Automated trophy awards
- **Performance Optimization**: Database query optimization

### 🎯 Future Roadmap
- **v1.1**: Mobile app development
- **v1.2**: Social features and community
- **v1.3**: Multiple puzzle variants

## 🤝 贡献指南

1. Fork 项目仓库
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -m 'Add some feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📞 Professional Support

- **🌐 Website**: https://slitherlinks.com
- **📧 General**: hello@slitherlinks.com  
- **🆘 Support**: support@slitherlinks.com
- **💬 Feedback**: feedback@slitherlinks.com
- **🐛 Issues**: Create GitHub Issues for bug reports

## 🧪 Testing & Quality Assurance

### Frontend Testing
```bash
cd slitherlink-web
npm run build        # ✅ Production build successful
npm run lint         # Code quality checks
npm test             # Unit tests (when implemented)
```

### Platform Testing
```bash
./test-complete-platform.sh  # End-to-end platform testing
```

## 📄 License & Legal

**MIT License** - See [LICENSE](LICENSE) file for details.

This project includes:
- Complete GDPR compliance documentation
- Professional privacy policy and terms of service  
- Cookie policy and data protection measures
- Professional legal framework for commercial use

## 🎉 Acknowledgments

This professional gaming platform represents a complete transformation from a basic puzzle game to a production-ready platform featuring:

- **Independent Service Architecture**: Proper separation between web platform and algorithm service
- **Modern Architecture**: Next.js 15, TypeScript, Professional Error Handling
- **User Experience**: No more browser alerts, custom error pages, loading states
- **Legal Compliance**: Complete privacy policy, terms of service, GDPR compliance
- **SEO Optimization**: Structured data, sitemap, meta tags for search engines
- **Professional Polish**: Every aspect designed for commercial deployment

### 🔧 Recent Architecture Improvements
- **Service Independence**: Algorithm service now runs independently from web platform
- **Database-First Approach**: All puzzle operations now go through database, not direct API calls
- **Build Success**: Both frontend and backend now compile without errors
- **Scalable Design**: Platform ready for production deployment with proper service separation

---

**🎮 Ready to experience professional puzzle gaming?**

**Visit [slitherlinks.com](https://slitherlinks.com) - The Ultimate Slitherlink Platform**

*🧩 Made with ❤️ for puzzle enthusiasts worldwide*