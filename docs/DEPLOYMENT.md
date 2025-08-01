# 🚀 Slitherlink 生产部署指南 - 运维文档

> **面向运维团队的完整部署指南**
> 
> 本文档提供了在EC2环境中部署Slitherlink平台的详细步骤，包含多服务架构配置、域名设置、SSL证书、数据库初始化等所有必要信息。

## 📋 目录

- [系统架构](#-系统架构)
- [环境要求](#-环境要求) 
- [部署准备](#-部署准备)
- [服务部署](#-服务部署)
- [配置管理](#-配置管理)
- [监控与日志](#-监控与日志)
- [备份与恢复](#-备份与恢复)
- [故障排除](#-故障排除)
- [性能优化](#-性能优化)
- [安全配置](#-安全配置)

## 🏗️ 系统架构

### 服务组件架构
```
域名: slitherlinks.com
┌─────────────────────────────────────────────┐
│              Nginx (443/80)                 │
│          SSL终端 + 反向代理                 │
└─────────────────┬───────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼────┐   ┌───▼────┐   ┌───▼────┐
│Frontend│   │Backend │   │Database│
│Next.js │   │Node.js │   │PostgreSQL│
│:3002   │   │:8002   │   │:5432   │
└────────┘   └───┬────┘   └────────┘
                 │
            ┌───▼────┐
            │Algorithm│
            │Java    │
            │:8082   │
            └────────┘
```

### 端口分配
| 服务 | 端口 | 协议 | 说明 |
|------|------|------|------|
| Nginx | 80/443 | HTTP/HTTPS | Web入口，SSL终端 |
| Frontend | 3002 | HTTP | Next.js应用 |
| Backend | 8002 | HTTP | Node.js API |
| Algorithm | 8082 | HTTP | Java算法服务 |
| PostgreSQL | 5432 | TCP | 数据库 |

### 数据流向
1. **用户请求** → Nginx (SSL终端)
2. **静态资源** → Frontend (3002) 
3. **API请求** → Backend (8002)
4. **数据查询** → PostgreSQL (5432)
5. **题目生成** → Algorithm (8082) → PostgreSQL

## 🎯 环境要求

### 服务器配置建议
- **CPU**: 4核心+ (推荐8核心)
- **内存**: 8GB+ (推荐16GB)  
- **存储**: 50GB+ SSD
- **网络**: 至少100Mbps带宽

### 软件依赖
```bash
# 基础软件包
- Ubuntu 22.04 LTS / CentOS 8
- Node.js 20+
- Java 8+
- PostgreSQL 15+
- Nginx 1.20+
- PM2 (Node.js进程管理)
- Maven 3.6+ (Java构建工具)

# 实用工具
- curl, wget
- jq (JSON处理)
- certbot (SSL证书)
- logrotate (日志轮转)
```

## 🚀 部署准备

### 1. 创建系统用户
```bash
# 创建专用用户（推荐）
sudo useradd -m -s /bin/bash -G sudo slitherlink
sudo passwd slitherlink

# 切换到专用用户
sudo su - slitherlink
```

### 2. 安装依赖软件
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm openjdk-8-jdk postgresql postgresql-contrib nginx maven curl jq

# CentOS/RHEL  
sudo yum install -y nodejs npm java-1.8.0-openjdk postgresql-server postgresql-contrib nginx maven curl jq

# 安装PM2
sudo npm install -g pm2
```

### 3. 创建目录结构
```bash
sudo mkdir -p /var/www/slitherlink
sudo mkdir -p /var/log/slitherlink
sudo mkdir -p /var/backups/slitherlink

# 设置权限
sudo chown -R slitherlink:slitherlink /var/www/slitherlink
sudo chown -R slitherlink:slitherlink /var/log/slitherlink
sudo chown -R slitherlink:slitherlink /var/backups/slitherlink
```

## 📦 服务部署

### 1. 获取源代码
```bash
cd /var/www/slitherlink
git clone <your-repository-url> .

# 设置正确的权限
sudo chown -R slitherlink:slitherlink /var/www/slitherlink
chmod +x scripts/*.sh
chmod +x deploy/*.sh
```

### 2. 数据库初始化
```bash
# 启动PostgreSQL服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 切换到postgres用户执行SQL
sudo -u postgres psql -f deploy/database-setup.sql

# 验证数据库创建
sudo -u postgres psql -c "\l" | grep slitherlink_prod
```

### 3. 环境变量配置
```bash
# 复制环境变量模板
cp deploy/.env.production .env

# 编辑环境变量（关键配置）
vim .env
```

**必须修改的关键配置**：
```bash
# 数据库密码（强烈建议修改）
DB_PASSWORD=your_secure_password_here

# JWT密钥（生产环境必须修改）
JWT_SECRET=your_super_secure_jwt_secret_key_change_this_in_production

# 域名配置
DOMAIN=slitherlinks.com
FRONTEND_URL=https://slitherlinks.com
CORS_ORIGINS=https://slitherlinks.com,https://www.slitherlinks.com
```

### 4. SSL证书配置
```bash
# 自动申请Let's Encrypt证书
sudo ./deploy/ssl-setup.sh

# 手动配置SSL证书（如果已有证书）
sudo cp your-cert.crt /etc/ssl/certs/slitherlinks.com.crt
sudo cp your-key.key /etc/ssl/private/slitherlinks.com.key
sudo chmod 644 /etc/ssl/certs/slitherlinks.com.crt
sudo chmod 600 /etc/ssl/private/slitherlinks.com.key
```

### 5. Nginx配置
```bash
# 复制Nginx配置
sudo cp deploy/nginx.conf /etc/nginx/sites-available/slitherlinks.com

# 启用站点
sudo ln -sf /etc/nginx/sites-available/slitherlinks.com /etc/nginx/sites-enabled/

# 禁用默认站点
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重载Nginx
sudo systemctl reload nginx
```

### 6. 应用构建
```bash
# 前端构建
cd slitherlink-web
npm ci --production
npm run build
cd ..

# 后端构建
cd slitherlink-backend  
npm ci --production
npm run build
cd ..

# 算法服务构建
cd SlitherLink-analysis
mvn clean package
cd ..
```

### 7. 服务启动

#### 启动Node.js服务 (PM2)
```bash
# 修改PM2配置中的路径
vim deploy/pm2.ecosystem.config.js
# 将 /path/to/slitherlink 替换为 /var/www/slitherlink

# 启动PM2服务
pm2 start deploy/pm2.ecosystem.config.js --env production

# 保存PM2配置
pm2 save
pm2 startup
```

#### 启动Java算法服务 (Systemd)
```bash
# 修改systemd配置中的路径
sudo vim deploy/slitherlink-algorithm.service
# 将 /path/to/slitherlink 替换为 /var/www/slitherlink

# 安装systemd服务
sudo cp deploy/slitherlink-algorithm.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable slitherlink-algorithm
sudo systemctl start slitherlink-algorithm
```

## ⚙️ 配置管理

### 环境变量详解

#### 核心服务配置
```bash
# 服务端口（避免与其他项目冲突）
PORT=3002                    # 前端服务端口
BACKEND_PORT=8002            # 后端API端口  
ALGORITHM_PORT=8082          # 算法服务端口

# 运行环境
NODE_ENV=production          # 必须设置为production
```

#### 数据库配置
```bash
DB_HOST=localhost            # 数据库主机
DB_PORT=5432                 # 数据库端口
DB_NAME=slitherlink_prod     # 数据库名
DB_USER=slitherlink_user     # 数据库用户
DB_PASSWORD=secure_password  # 数据库密码（必须修改）
DB_SSL=false                 # 本地部署通常为false
DB_POOL_MIN=2                # 连接池最小连接数
DB_POOL_MAX=10               # 连接池最大连接数
```

#### 安全配置
```bash
JWT_SECRET=very_long_secure_secret_key  # JWT签名密钥（必须修改）
JWT_EXPIRES_IN=7d                       # JWT过期时间

# CORS配置（多个域名用逗号分隔）
CORS_ORIGINS=https://slitherlinks.com,https://www.slitherlinks.com
```

#### 日志配置
```bash
LOG_LEVEL=INFO               # 日志级别: ERROR, WARN, INFO, DEBUG
LOG_DIR=/var/log/slitherlink # 日志文件目录
```

### PM2配置文件说明

修改 `deploy/pm2.ecosystem.config.js` 中的关键配置：

```javascript
// 修改工作目录路径
cwd: '/var/www/slitherlink/slitherlink-web',
cwd: '/var/www/slitherlink/slitherlink-backend',

// 调整实例数量（根据服务器配置）
instances: process.env.PM2_INSTANCES || 'max',  // 前端
instances: process.env.PM2_INSTANCES || 2,      // 后端

// 调整内存限制
max_memory_restart: '512M',  // 根据服务器内存调整
```

### Systemd配置说明

修改 `deploy/slitherlink-algorithm.service` 中的关键配置：

```ini
# 修改工作目录
WorkingDirectory=/var/www/slitherlink/SlitherLink-analysis

# 调整Java内存参数（根据服务器配置）
Environment=JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC"

# 修改日志目录权限
ReadWritePaths=/var/log/slitherlink
```

## 📊 监控与日志

### 服务状态检查
```bash
# PM2服务状态
pm2 status
pm2 monit                    # 实时监控

# Systemd服务状态  
sudo systemctl status slitherlink-algorithm
sudo systemctl status nginx
sudo systemctl status postgresql

# 健康检查
curl -f http://localhost:3002/health   # 前端健康检查
curl -f http://localhost:8002/health   # 后端健康检查
curl -f https://slitherlinks.com/health # 外部健康检查
```

### 日志管理
```bash
# PM2日志
pm2 logs                     # 所有服务日志
pm2 logs slitherlink-frontend # 前端日志
pm2 logs slitherlink-backend  # 后端日志

# Systemd日志
sudo journalctl -u slitherlink-algorithm -f  # 实时查看算法服务日志
sudo journalctl -u nginx -f                  # Nginx日志

# 应用日志文件
tail -f /var/log/slitherlink/frontend-*.log
tail -f /var/log/slitherlink/backend-*.log
tail -f /var/log/slitherlink/algorithm.log

# Nginx访问日志
tail -f /var/log/nginx/slitherlinks.access.log
tail -f /var/log/nginx/slitherlinks.error.log
```

### 日志轮转配置
创建 `/etc/logrotate.d/slitherlink`：
```bash
/var/log/slitherlink/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 slitherlink slitherlink
    postrotate
        pm2 reload all
    endscript
}
```

### 监控脚本
创建监控脚本 `/var/www/slitherlink/scripts/monitor.sh`：
```bash
#!/bin/bash
# 服务监控脚本

echo "=== Slitherlink服务监控 ==="
echo "时间: $(date)"
echo

# PM2状态
echo "PM2服务状态:"
pm2 jlist | jq -r '.[] | "\(.name): \(.pm2_env.status)"'
echo

# 系统服务状态
echo "系统服务状态:"
systemctl is-active slitherlink-algorithm nginx postgresql
echo

# 健康检查
echo "健康检查:"
curl -s -f http://localhost:3002/health >/dev/null && echo "前端: ✅" || echo "前端: ❌"
curl -s -f http://localhost:8002/health >/dev/null && echo "后端: ✅" || echo "后端: ❌"
curl -s -f https://slitherlinks.com/health >/dev/null && echo "域名: ✅" || echo "域名: ❌"

# 资源使用
echo
echo "资源使用:"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "内存: $(free | grep Mem | awk '{printf("%.1f%%", $3/$2 * 100.0)}')"
echo "磁盘: $(df /var/www/slitherlink | tail -1 | awk '{print $5}')"
```

## 💾 备份与恢复

### 自动备份配置
```bash
# 配置数据库备份
cp deploy/backup-script.sh /var/www/slitherlink/scripts/
chmod +x /var/www/slitherlink/scripts/backup-script.sh

# 添加到crontab
crontab -e
# 添加以下行（每天凌晨2点备份）
0 2 * * * /var/www/slitherlink/scripts/backup-script.sh >/dev/null 2>&1
```

### 备份内容
- **数据库**: 完整的PostgreSQL数据备份
- **配置文件**: `.env`, nginx配置, PM2配置
- **静态资源**: 上传的图片、生成的文件
- **日志文件**: 重要的应用日志

### 恢复流程
```bash
# 1. 停止所有服务
pm2 stop all
sudo systemctl stop slitherlink-algorithm

# 2. 恢复数据库
sudo -u postgres psql -d slitherlink_prod -f /var/backups/slitherlink/backup_file.sql

# 3. 恢复配置文件
cp backup/.env /var/www/slitherlink/

# 4. 重启服务
pm2 start all
sudo systemctl start slitherlink-algorithm
```

## 🔧 故障排除

### 常见问题诊断

#### 1. 服务无法启动
```bash
# 检查端口占用
sudo lsof -i :3002  # 前端端口
sudo lsof -i :8002  # 后端端口
sudo lsof -i :8082  # 算法服务端口

# 检查服务日志
pm2 logs slitherlink-frontend --lines 50
pm2 logs slitherlink-backend --lines 50
sudo journalctl -u slitherlink-algorithm --lines 50
```

#### 2. 数据库连接失败
```bash
# 检查PostgreSQL状态
sudo systemctl status postgresql

# 测试数据库连接
sudo -u postgres psql -c "SELECT version();"

# 检查数据库用户权限
sudo -u postgres psql -c "\du slitherlink_user"
```

#### 3. SSL证书问题
```bash
# 检查证书文件
sudo ls -la /etc/ssl/certs/slitherlinks.com.crt
sudo ls -la /etc/ssl/private/slitherlinks.com.key

# 检查证书有效期
sudo openssl x509 -in /etc/ssl/certs/slitherlinks.com.crt -noout -dates

# 测试SSL配置
sudo nginx -t
curl -I https://slitherlinks.com
```

#### 4. Nginx配置问题
```bash
# 测试Nginx配置
sudo nginx -t

# 检查Nginx错误日志
sudo tail -f /var/log/nginx/error.log

# 重载Nginx配置
sudo systemctl reload nginx
```

#### 5. 性能问题
```bash
# 检查系统资源
top
htop
iotop

# 检查数据库性能
sudo -u postgres psql -d slitherlink_prod -c "
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;"
```

### 错误码对照表

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| EADDRINUSE | 端口已被占用 | 检查端口占用，停止冲突服务 |
| ECONNREFUSED | 连接被拒绝 | 检查目标服务是否启动 |
| EPERM | 权限不足 | 检查文件权限和用户权限 |
| ENOTFOUND | 域名解析失败 | 检查DNS配置 |
| EACCES | 访问被拒绝 | 检查防火墙和安全组配置 |

### 紧急恢复步骤
1. **服务崩溃**: `pm2 restart all`
2. **数据库问题**: 从最新备份恢复
3. **证书过期**: 重新申请SSL证书
4. **磁盘空间不足**: 清理日志文件和临时文件
5. **内存不足**: 重启服务器或调整服务配置

## ⚡ 性能优化

### 系统级优化
```bash
# 调整系统文件描述符限制
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# 调整网络参数
echo "net.core.somaxconn = 65536" >> /etc/sysctl.conf
echo "net.ipv4.tcp_max_syn_backlog = 65536" >> /etc/sysctl.conf
sysctl -p
```

### PM2配置优化
```javascript
// 根据服务器配置调整
module.exports = {
  apps: [{
    name: 'slitherlink-frontend',
    instances: 'max',              // 使用所有CPU核心
    exec_mode: 'cluster',          // 集群模式
    max_memory_restart: '512M',    // 内存限制
    node_args: '--max-old-space-size=512'  // Node.js内存限制
  }]
};
```

### 数据库优化
```sql
-- PostgreSQL性能调优
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';  
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
SELECT pg_reload_conf();

-- 创建必要的索引
CREATE INDEX CONCURRENTLY idx_puzzles_difficulty ON puzzles(difficulty);
CREATE INDEX CONCURRENTLY idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX CONCURRENTLY idx_leaderboards_created_at ON leaderboards(created_at);
```

### Nginx优化
```nginx
# 在nginx.conf中添加
worker_processes auto;
worker_connections 2048;

# 启用gzip压缩
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript;

# 启用缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

## 🔒 安全配置

### 防火墙配置
```bash
# 只开放必要端口
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### SSL安全配置
```nginx
# 在nginx.conf中加强SSL安全
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;

# 安全头
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options SAMEORIGIN always;
add_header X-Content-Type-Options nosniff always;
```

### 数据库安全
```bash
# 修改PostgreSQL配置
sudo vim /etc/postgresql/*/main/postgresql.conf
# 设置: listen_addresses = 'localhost'

sudo vim /etc/postgresql/*/main/pg_hba.conf
# 确保只允许本地连接
local   slitherlink_prod    slitherlink_user                md5

# 重启PostgreSQL
sudo systemctl restart postgresql
```

### 应用安全
```bash
# 定期更新系统
sudo apt update && sudo apt upgrade -y

# 安装fail2ban防止暴力破解
sudo apt install fail2ban
sudo systemctl enable fail2ban

# 创建fail2ban配置
sudo vim /etc/fail2ban/jail.local
[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
findtime = 600
bantime = 7200
maxretry = 10
```

## 📝 部署检查清单

### 部署前检查
- [ ] 服务器配置满足要求（CPU、内存、存储）
- [ ] DNS记录指向正确的服务器IP
- [ ] 防火墙规则配置正确
- [ ] SSL证书准备就绪
- [ ] 数据库用户和权限配置完成

### 部署后验证
- [ ] 所有服务正常启动 (`pm2 status`, `systemctl status`)
- [ ] 健康检查端点响应正常
- [ ] SSL证书工作正常 (`curl -I https://slitherlinks.com`)
- [ ] 网站功能正常（注册、登录、游戏）
- [ ] 日志文件正常写入
- [ ] 备份脚本工作正常

### 运维检查（日常）
- [ ] 检查服务状态和资源使用
- [ ] 检查日志文件是否有异常
- [ ] 验证备份文件完整性
- [ ] 检查SSL证书有效期
- [ ] 监控磁盘空间使用

## 📞 技术支持

### 联系方式
- **技术支持**: support@slitherlinks.com
- **紧急联系**: 通过GitHub Issues报告问题

### 相关文档
- [项目README](../README.md) - 项目总览和开发指南
- [后端API文档](../slitherlink-backend/README.md) - API接口文档
- [数据库文档](../docs/DATABASE.md) - 数据库设计文档

### 版本信息
- **文档版本**: v1.0
- **适用系统**: Ubuntu 22.04 LTS / CentOS 8+
- **最后更新**: 2025-08-01

---

**🎮 祝您部署成功！**

如有任何问题，请参考故障排除章节或联系技术支持团队。