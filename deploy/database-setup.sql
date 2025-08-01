-- Slitherlink生产数据库设置脚本
-- 运行前请确保PostgreSQL已安装并运行

-- 创建数据库用户
CREATE USER slitherlink_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';

-- 创建生产数据库
CREATE DATABASE slitherlink_prod 
    WITH OWNER = slitherlink_user
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    CONNECTION LIMIT = -1;

-- 授予权限
GRANT ALL PRIVILEGES ON DATABASE slitherlink_prod TO slitherlink_user;

-- 连接到新创建的数据库
\c slitherlink_prod;

-- 授予schema权限
GRANT ALL ON SCHEMA public TO slitherlink_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO slitherlink_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO slitherlink_user;

-- 创建扩展（如果需要）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 设置默认权限，确保新创建的表和序列自动授权
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT ALL ON TABLES TO slitherlink_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT ALL ON SEQUENCES TO slitherlink_user;

-- 优化数据库配置建议（需要在postgresql.conf中设置）
-- shared_buffers = 256MB              # 约25%的可用RAM
-- effective_cache_size = 1GB          # 约75%的可用RAM  
-- work_mem = 4MB                      # 排序和哈希操作内存
-- maintenance_work_mem = 64MB         # 维护操作内存
-- checkpoint_completion_target = 0.9  # 检查点完成目标
-- wal_buffers = 16MB                  # WAL缓冲区
-- default_statistics_target = 100     # 统计信息目标

-- 创建数据库连接池用户（如果使用pgbouncer等连接池）
-- CREATE USER slitherlink_pool WITH ENCRYPTED PASSWORD 'pool_password_here';
-- GRANT CONNECT ON DATABASE slitherlink_prod TO slitherlink_pool;