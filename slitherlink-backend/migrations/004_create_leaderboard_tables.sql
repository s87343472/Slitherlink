-- 排行榜条目表
CREATE TABLE leaderboard_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(100) NOT NULL, -- 冗余存储用户名，避免频繁JOIN
    puzzle_id INTEGER NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    completion_time INTEGER NOT NULL, -- 完成时间（秒）
    error_count INTEGER NOT NULL DEFAULT 0,
    difficulty VARCHAR(20) NOT NULL,
    grid_size INTEGER NOT NULL,
    submitted_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- 确保同一用户同一题目只能有一个最佳成绩记录
    UNIQUE(user_id, puzzle_id)
);

-- 为排行榜条目表创建索引（优化查询性能）
CREATE INDEX idx_leaderboard_daily ON leaderboard_entries (DATE(submitted_at), score DESC, submitted_at ASC);
CREATE INDEX idx_leaderboard_weekly ON leaderboard_entries (submitted_at, score DESC, submitted_at ASC);
CREATE INDEX idx_leaderboard_monthly ON leaderboard_entries (submitted_at, score DESC, submitted_at ASC);
CREATE INDEX idx_leaderboard_total ON leaderboard_entries (score DESC, submitted_at ASC);
CREATE INDEX idx_leaderboard_user ON leaderboard_entries (user_id, submitted_at DESC);
CREATE INDEX idx_leaderboard_puzzle ON leaderboard_entries (puzzle_id);

-- 用户购买记录表（支付系统）
CREATE TABLE user_purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_type VARCHAR(50) NOT NULL, -- 'leaderboard_pass', 'ad_free_subscription'
    product_name VARCHAR(100) NOT NULL,
    price_usd DECIMAL(10,2) NOT NULL,
    purchase_date TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NULL, -- 订阅类产品的过期时间
    is_active BOOLEAN DEFAULT true,
    payment_provider VARCHAR(50), -- 'stripe', 'apple', 'google', etc.
    transaction_id VARCHAR(200)
);

-- 为用户购买表创建索引
CREATE INDEX idx_user_purchases_active ON user_purchases (user_id, product_type, is_active);
CREATE INDEX idx_user_purchases_expiry ON user_purchases (expires_at) WHERE expires_at IS NOT NULL;

-- 奖杯记录表
CREATE TABLE user_trophies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trophy_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
    trophy_rank INTEGER NOT NULL CHECK (trophy_rank IN (1, 2, 3)), -- 1=金, 2=银, 3=铜
    awarded_for_period DATE NOT NULL, -- 获奖周期（日期）
    awarded_at TIMESTAMP DEFAULT NOW(),
    
    -- 确保同一用户同一周期同一类型只能获得一个奖杯
    UNIQUE(user_id, trophy_type, awarded_for_period)
);

-- 为奖杯表创建索引
CREATE INDEX idx_user_trophies ON user_trophies (user_id, trophy_type, awarded_for_period DESC);

-- 初始化一些基础数据
-- 给现有用户添加测试的排行榜通行证（开发阶段）
INSERT INTO user_purchases (user_id, product_type, product_name, price_usd, is_active) 
SELECT id, 'leaderboard_pass', 'Leaderboard Pass', 1.99, true 
FROM users 
WHERE email IN ('test@example.com', 'user@example.com')
ON CONFLICT DO NOTHING;

-- 添加一些测试的排行榜数据
-- 这些数据将在实际游戏中由用户游玩产生
INSERT INTO leaderboard_entries (user_id, user_name, puzzle_id, score, completion_time, error_count, difficulty, grid_size, submitted_at)
SELECT 
    u.id,
    u.display_name,
    p.id,
    1500 + (RANDOM() * 500)::INTEGER, -- 随机分数
    300 + (RANDOM() * 600)::INTEGER,  -- 随机完成时间（5-15分钟）
    (RANDOM() * 5)::INTEGER,          -- 随机错误次数
    p.difficulty,
    p.grid_size,
    NOW() - (RANDOM() * INTERVAL '7 days') -- 过去一周内的随机时间
FROM users u, puzzles p 
WHERE u.email IN ('test@example.com', 'user@example.com')
AND p.id <= 10 -- 只对前10道题目添加测试数据
ON CONFLICT (user_id, puzzle_id) DO NOTHING;