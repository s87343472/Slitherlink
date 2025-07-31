#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Slitherlink Quick Start for Development${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 检查PostgreSQL是否运行
echo -e "${BLUE}📊 Checking PostgreSQL...${NC}"
if ! pgrep -x "postgres" > /dev/null; then
    echo -e "${YELLOW}⚠️  Starting PostgreSQL...${NC}"
    if command -v brew >/dev/null 2>&1; then
        brew services start postgresql@14 >/dev/null 2>&1 || brew services start postgresql >/dev/null 2>&1
        sleep 2
    fi
fi

if pgrep -x "postgres" > /dev/null || brew services list | grep -q "postgresql.*started"; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
else
    echo -e "${RED}❌ Failed to start PostgreSQL${NC}"
    exit 1
fi

# 快速启动后端
echo -e "${BLUE}🔧 Starting backend API...${NC}"
cd "$SCRIPT_DIR/slitherlink-backend"

# 确保依赖已安装
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install >/dev/null 2>&1
fi

# 确保数据库和数据存在
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
PORT=8000
NODE_ENV=development
JWT_SECRET=slitherlink-dev-secret-key
JWT_EXPIRES_IN=7d
DB_HOST=localhost
DB_PORT=5432
DB_NAME=slitherlink
DB_USER=$(whoami)
DB_PASSWORD=
CORS_ORIGINS=http://localhost:3000
LOG_LEVEL=info
EOF
fi

# 数据库初始化
echo "Setting up database..."
createdb slitherlink 2>/dev/null || true
npm run db:migrate >/dev/null 2>&1

# 检查用户数据
USER_COUNT=$(psql -d slitherlink -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ' || echo "0")
if [ "$USER_COUNT" -eq 0 ]; then
    echo "Creating initial users..."
    npm run db:seed >/dev/null 2>&1
fi

# 启动后端
echo -e "${GREEN}🚀 Starting backend server...${NC}"
echo "Backend will run at: http://localhost:8000"
echo "Test users available:"
echo "  - admin@slitherlink.game / admin123 (full access)"
echo "  - test@example.com / test123 (basic access)"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# 使用正确的环境变量启动
DB_USER=$(whoami) DB_PASSWORD="" npm run dev