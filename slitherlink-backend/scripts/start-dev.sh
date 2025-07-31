#!/bin/bash

set -e

echo "🚀 Starting Slitherlink Backend Development Environment..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查Node.js版本
echo "📋 Checking Node.js version..."
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${YELLOW}⚠️  Node.js version $NODE_VERSION detected. Recommended: 20+${NC}"
else
    echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"
fi

# 检查PostgreSQL
echo "📋 Checking PostgreSQL..."
if ! command -v psql >/dev/null 2>&1; then
    echo -e "${RED}❌ PostgreSQL is not installed${NC}"
    echo "Please run: ./setup-database.sh first"
    exit 1
else
    echo -e "${GREEN}✅ PostgreSQL is installed${NC}"
fi

# 检查Java
echo "📋 Checking Java for algorithm service..."
if ! command -v java >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Java is not installed${NC}"
    echo "Algorithm service will not be available"
else
    JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -lt 8 ]; then
        echo -e "${YELLOW}⚠️  Java version too old. Need Java 8+${NC}"
    else
        echo -e "${GREEN}✅ Java is available for algorithm service${NC}"
    fi
fi

# 切换到后端目录
cd "$(dirname "$0")/.."

# 检查.env文件
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found, creating from template...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}📝 Please edit .env file with your database configuration${NC}"
fi

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# 测试数据库连接
echo "🔍 Testing database connection..."
DB_HOST=$(grep DB_HOST .env | cut -d'=' -f2)
DB_PORT=$(grep DB_PORT .env | cut -d'=' -f2)
DB_NAME=$(grep DB_NAME .env | cut -d'=' -f2)
DB_USER=$(grep DB_USER .env | cut -d'=' -f2)

if [ -z "$DB_HOST" ]; then DB_HOST="localhost"; fi
if [ -z "$DB_PORT" ]; then DB_PORT="5432"; fi
if [ -z "$DB_NAME" ]; then DB_NAME="slitherlink"; fi
if [ -z "$DB_USER" ]; then DB_USER="$(whoami)"; fi

# 简单的连接测试
if psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" -c "SELECT 1;" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
    
    # 检查是否有用户数据
    USER_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ')
    if [ "$USER_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Database has $USER_COUNT users${NC}"
    else
        echo -e "${YELLOW}⚠️  Database is empty, consider running: npm run db:seed${NC}"
    fi
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo "Please check your database configuration in .env"
    echo "Current config: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
    echo "You may need to run: ./scripts/setup-database.sh"
    exit 1
fi

# 运行数据库迁移
echo "🗄️  Running database migrations..."
if npm run db:migrate; then
    echo -e "${GREEN}✅ Database migrations completed${NC}"
else
    echo -e "${RED}❌ Database migrations failed${NC}"
    exit 1
fi

# 检查算法服务
echo "🧮 Checking algorithm service..."
ALGORITHM_URL=$(grep ALGORITHM_SERVICE_URL .env | cut -d'=' -f2)
if [ -z "$ALGORITHM_URL" ]; then ALGORITHM_URL="http://localhost:8080"; fi

if curl -f -s "$ALGORITHM_URL/sl/gen?puzzledim=5&diff=easy" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Algorithm service is running and accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Algorithm service is not accessible at $ALGORITHM_URL${NC}"
    echo "Some features may not work properly."
    echo ""
    echo "To start the algorithm service:"
    echo "1. cd ../SlitherLink-analysis"
    echo "2. mvn clean package"
    echo "3. java -jar target/puzzle-*.jar server config.yml"
    echo ""
fi

# 启动开发服务器
echo ""
echo -e "${BLUE}🎉 Starting development server...${NC}"
echo ""
echo "Backend API will be available at: http://localhost:8000"
echo "Health check: http://localhost:8000/health"
echo "API info: http://localhost:8000/api/v1/info"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# 启动服务器
echo "🚀 Starting server with environment variables..."
echo "Using database user: $DB_USER"

# 使用环境变量启动服务器
DB_USER="$DB_USER" DB_PASSWORD="" npm run dev