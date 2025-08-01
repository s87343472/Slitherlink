// PM2生态系统配置文件 - Slitherlink生产环境
module.exports = {
  apps: [
    {
      // 前端Next.js应用
      name: 'slitherlink-frontend',
      cwd: '/path/to/slitherlink/slitherlink-web',
      script: 'npm',
      args: 'run start:prod',
      instances: process.env.PM2_INSTANCES || 'max',
      exec_mode: 'cluster',
      
      // 环境配置
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3002,
      },
      
      // 资源限制
      max_memory_restart: process.env.PM2_MAX_MEMORY || '512M',
      
      // 日志配置
      out_file: '/var/log/slitherlink/frontend-out.log',
      error_file: '/var/log/slitherlink/frontend-error.log',
      log_file: '/var/log/slitherlink/frontend-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // 自动重启配置
      autorestart: true,
      watch: false, // 生产环境不监听文件变化
      max_restarts: 10,
      min_uptime: '10s',
      
      // 健康检查
      health_check_url: 'http://localhost:3002',
      health_check_grace_period: 3000,
      
      // 进程管理
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 3000,
    },
    
    {
      // 后端API应用
      name: 'slitherlink-backend',
      cwd: '/path/to/slitherlink/slitherlink-backend',
      script: 'npm',
      args: 'run start',
      instances: process.env.PM2_INSTANCES || 2, // API服务通常不需要max实例
      exec_mode: 'cluster',
      
      // 环境配置
      env: {
        NODE_ENV: 'production',
        PORT: process.env.BACKEND_PORT || 8002,
        // 其他环境变量将从.env.production自动加载
      },
      
      // 资源限制
      max_memory_restart: process.env.PM2_MAX_MEMORY || '512M',
      
      // 日志配置
      out_file: '/var/log/slitherlink/backend-out.log',
      error_file: '/var/log/slitherlink/backend-error.log',
      log_file: '/var/log/slitherlink/backend-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // 自动重启配置
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      
      // 健康检查
      health_check_url: 'http://localhost:8002/health',
      health_check_grace_period: 5000,
      
      // 进程管理
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 5000,
      
      // 数据库连接等待
      restart_delay: 1000,
    }
  ],
  
  // 部署配置
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server-ip'],
      ref: 'origin/master',
      repo: 'git@github.com:your-username/slitherlink.git',
      path: '/var/www/slitherlink',
      
      // 部署前钩子
      'pre-deploy': 'git fetch --all',
      
      // 部署后钩子
      'post-deploy': `
        # 安装依赖
        cd slitherlink-web && npm ci --production &&
        cd ../slitherlink-backend && npm ci --production &&
        
        # 构建前端
        cd ../slitherlink-web && npm run build &&
        
        # 重启服务
        pm2 reload ecosystem.config.js --env production &&
        
        # 健康检查
        sleep 10 &&
        curl -f http://localhost:3002/health &&
        curl -f http://localhost:8002/health
      `,
      
      // 环境变量
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};