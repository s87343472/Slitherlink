#!/bin/bash

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════╗"
echo "║          🎮 Slitherlink Game Platform        ║"
echo "║              Standard Version                ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}🚀 Starting Slitherlink Game Platform...${NC}"
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 检查目录结构
echo "📂 Checking project structure..."
if [ ! -d "$SCRIPT_DIR/slitherlink-backend" ]; then
    echo -e "${RED}❌ Backend directory not found${NC}"
    exit 1
fi

if [ ! -d "$SCRIPT_DIR/slitherlink-web" ]; then
    echo -e "${RED}❌ Frontend directory not found${NC}"
    exit 1
fi

if [ ! -d "$SCRIPT_DIR/SlitherLink-analysis" ]; then
    echo -e "${RED}❌ Algorithm service directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Project structure verified${NC}"
echo ""

# 显示启动选项
echo -e "${YELLOW}Choose what to start:${NC}"
echo "1. 🗄️  Setup database only"
echo "2. 🔧 Start backend API only"
echo "3. 🎨 Start frontend only"
echo "4. 🌟 Start web platform (backend + frontend)"
echo "5. 🧮 Start algorithm service (for puzzle generation)"
echo "6. 🎯 Start all services (platform + algorithm)"
echo "7. ❌ Exit"
echo ""

read -p "Enter your choice (1-7): " choice

case $choice in
    1)
        echo -e "${BLUE}Setting up database...${NC}"
        cd "$SCRIPT_DIR/slitherlink-backend"
        ./scripts/setup-database.sh
        ;;
    2)
        echo -e "${BLUE}Starting backend API...${NC}"
        cd "$SCRIPT_DIR/slitherlink-backend"
        ./scripts/start-dev.sh
        ;;
    3)
        echo -e "${BLUE}Starting frontend...${NC}"
        cd "$SCRIPT_DIR/slitherlink-web"
        if [ ! -d "node_modules" ]; then
            echo "Installing frontend dependencies..."
            npm install
        fi
        echo -e "${CYAN}🎨 Frontend starting on http://localhost:3000${NC}"
        npm run dev
        ;;
    4)
        echo -e "${BLUE}🌟 Starting web platform (backend + frontend)...${NC}"
        echo ""
        
        # 创建日志目录
        mkdir -p "$SCRIPT_DIR/logs"
        
        # 启动后端API
        echo -e "${PURPLE}🔧 Starting backend API...${NC}"
        cd "$SCRIPT_DIR/slitherlink-backend"
        
        # 检查数据库配置
        if [ ! -f ".env" ]; then
            echo "Setting up database first..."
            ./scripts/setup-database.sh
        fi
        
        # 安装后端依赖
        if [ ! -d "node_modules" ]; then
            echo "Installing backend dependencies..."
            npm install
        fi
        
        # 运行迁移和种子数据
        echo "Running database migrations..."
        npm run db:migrate > /dev/null 2>&1 || echo "Migration failed"
        
        # 检查是否需要创建种子数据
        USER_COUNT=$(psql -d slitherlink -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ' || echo "0")
        if [ "$USER_COUNT" -eq 0 ]; then
            echo "Creating initial user data..."
            npm run db:seed > /dev/null 2>&1 || echo "Seed failed"
        fi
        
        # 使用正确的环境变量启动
        DB_USER=$(whoami) DB_PASSWORD="" npm run dev > "$SCRIPT_DIR/logs/backend.log" 2>&1 &
        BACKEND_PID=$!
        echo -e "${GREEN}✅ Backend API started (PID: $BACKEND_PID)${NC}"
        
        # 等待后端启动
        sleep 5
        
        # 启动前端
        echo -e "${PURPLE}🎨 Starting frontend...${NC}"
        cd "$SCRIPT_DIR/slitherlink-web"
        
        if [ ! -d "node_modules" ]; then
            echo "Installing frontend dependencies..."
            npm install
        fi
        
        npm run dev > "$SCRIPT_DIR/logs/frontend.log" 2>&1 &
        FRONTEND_PID=$!
        echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
        
        echo ""
        echo -e "${CYAN}🎉 Web platform is ready!${NC}"
        echo ""
        echo -e "${YELLOW}📍 Service URLs:${NC}"
        echo "   🎨 Frontend:     http://localhost:3000"
        echo "   🔧 Backend API:  http://localhost:8000"
        echo ""
        echo -e "${YELLOW}📊 Health Checks:${NC}"
        echo "   Backend Health: http://localhost:8000/health"
        echo "   API Info:       http://localhost:8000/api/v1/info"
        echo ""
        echo -e "${YELLOW}📝 Log Files:${NC}"
        echo "   Backend:  $SCRIPT_DIR/logs/backend.log"  
        echo "   Frontend: $SCRIPT_DIR/logs/frontend.log"
        echo ""
        echo -e "${GREEN}✨ Platform is ready! Open http://localhost:3000 in your browser${NC}"
        echo -e "${YELLOW}💡 Note: Algorithm service runs independently for puzzle generation${NC}"
        echo ""
        echo -e "${RED}Press Ctrl+C to stop all services${NC}"
        
        # 等待用户停止
        trap "echo -e '\n${YELLOW}🛑 Stopping web platform...$NC'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
        
        wait
        ;;
    5)
        echo -e "${BLUE}Starting algorithm service...${NC}"
        cd "$SCRIPT_DIR/SlitherLink-analysis"
        echo "Building Java project..."
        mvn clean package -q
        echo -e "${GREEN}✅ Algorithm service built${NC}"
        echo -e "${CYAN}🧮 Algorithm service starting on http://localhost:8080${NC}"
        echo -e "${YELLOW}💡 This service runs independently for puzzle generation${NC}"
        java -jar target/puzzle-*.jar server config.yml
        ;;
    6)
        echo -e "${BLUE}🎯 Starting all services (platform + algorithm)...${NC}"
        echo ""
        
        # 创建日志目录
        mkdir -p "$SCRIPT_DIR/logs"
        
        # 启动算法服务（独立运行）
        echo -e "${PURPLE}🧮 Starting algorithm service...${NC}"
        cd "$SCRIPT_DIR/SlitherLink-analysis"
        if [ ! -f "target/puzzle-"*.jar ]; then
            echo "Building algorithm service..."
            mvn clean package -q
        fi
        
        java -jar target/puzzle-0.0.1-SNAPSHOT.jar server config.yml > "$SCRIPT_DIR/logs/algorithm.log" 2>&1 &
        ALGORITHM_PID=$!
        echo -e "${GREEN}✅ Algorithm service started (PID: $ALGORITHM_PID)${NC}"
        echo -e "${YELLOW}💡 Algorithm service runs independently for puzzle generation${NC}"
        
        # 等待算法服务启动
        echo "Waiting for algorithm service to be ready..."
        sleep 10
        
        # 启动后端API
        echo -e "${PURPLE}🔧 Starting backend API...${NC}"
        cd "$SCRIPT_DIR/slitherlink-backend"
        
        # 检查数据库配置
        if [ ! -f ".env" ]; then
            echo "Setting up database first..."
            ./scripts/setup-database.sh
        fi
        
        # 安装后端依赖
        if [ ! -d "node_modules" ]; then
            echo "Installing backend dependencies..."
            npm install
        fi
        
        # 运行迁移和种子数据
        echo "Running database migrations..."
        npm run db:migrate > /dev/null 2>&1 || echo "Migration failed"
        
        # 检查是否需要创建种子数据
        USER_COUNT=$(psql -d slitherlink -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ' || echo "0")
        if [ "$USER_COUNT" -eq 0 ]; then
            echo "Creating initial user data..."
            npm run db:seed > /dev/null 2>&1 || echo "Seed failed"
        fi
        
        # 使用正确的环境变量启动
        DB_USER=$(whoami) DB_PASSWORD="" npm run dev > "$SCRIPT_DIR/logs/backend.log" 2>&1 &
        BACKEND_PID=$!
        echo -e "${GREEN}✅ Backend API started (PID: $BACKEND_PID)${NC}"
        
        # 等待后端启动
        sleep 5
        
        # 启动前端
        echo -e "${PURPLE}🎨 Starting frontend...${NC}"
        cd "$SCRIPT_DIR/slitherlink-web"
        
        if [ ! -d "node_modules" ]; then
            echo "Installing frontend dependencies..."
            npm install
        fi
        
        npm run dev > "$SCRIPT_DIR/logs/frontend.log" 2>&1 &
        FRONTEND_PID=$!
        echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
        
        echo ""
        echo -e "${CYAN}🎉 All services are running!${NC}"
        echo ""
        echo -e "${YELLOW}📍 Service URLs:${NC}"
        echo "   🎨 Web Platform:      http://localhost:3000"
        echo "   🔧 Backend API:       http://localhost:8000"
        echo "   🧮 Algorithm Service: http://localhost:8080 (independent)"
        echo ""
        echo -e "${YELLOW}📊 Health Checks:${NC}"
        echo "   Backend Health:    http://localhost:8000/health"
        echo "   API Info:          http://localhost:8000/api/v1/info"
        echo ""
        echo -e "${YELLOW}📝 Log Files:${NC}"
        echo "   Algorithm: $SCRIPT_DIR/logs/algorithm.log"
        echo "   Backend:   $SCRIPT_DIR/logs/backend.log"  
        echo "   Frontend:  $SCRIPT_DIR/logs/frontend.log"
        echo ""
        echo -e "${GREEN}✨ Platform is ready! Open http://localhost:3000 in your browser${NC}"
        echo -e "${CYAN}💡 Architecture: Web Platform ← Backend API ← Database ← Algorithm Service${NC}"
        echo ""
        echo -e "${RED}Press Ctrl+C to stop all services${NC}"
        
        # 等待用户停止
        trap "echo -e '\n${YELLOW}🛑 Stopping all services...$NC'; kill $ALGORITHM_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
        
        wait
        ;;
    7)
        echo -e "${GREEN}👋 Goodbye!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac