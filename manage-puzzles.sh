#!/bin/bash

# 数回题库管理脚本
# 用于定期生成题目、管理每日挑战等

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/slitherlink-backend"
LOG_FILE="$SCRIPT_DIR/logs/puzzle-management.log"

# 创建日志目录
mkdir -p "$SCRIPT_DIR/logs"

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════╗"
echo "║          🧩 数回题库管理工具                 ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"

log_message() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# 检查服务状态
check_services() {
    log_message "${BLUE}🔍 Checking service status...${NC}"
    
    # 检查后端API
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        log_message "${GREEN}✅ Backend API is running${NC}"
    else
        log_message "${YELLOW}⚠️  Backend API is not running - starting it...${NC}"
        cd "$BACKEND_DIR"
        npm run dev > /dev/null 2>&1 &
        sleep 5
    fi
    
    # 检查算法服务
    if curl -s http://localhost:8080/health > /dev/null 2>&1; then
        log_message "${GREEN}✅ Algorithm service is running${NC}"
    else
        log_message "${YELLOW}⚠️  Algorithm service is not running${NC}"
        log_message "${YELLOW}   Please start it manually: cd SlitherLink-analysis && java -jar target/puzzle-*.jar server config.yml${NC}"
    fi
}

# 每日维护
run_daily_maintenance() {
    log_message "${PURPLE}🔧 Running daily maintenance...${NC}"
    
    cd "$BACKEND_DIR"
    
    # 编译TypeScript并运行维护脚本
    if npx ts-node src/scripts/daily-maintenance.ts; then
        log_message "${GREEN}✅ Daily maintenance completed successfully${NC}"
    else
        log_message "${RED}❌ Daily maintenance failed${NC}"
        return 1
    fi
}

# 检查题库状态
check_puzzle_stock() {
    log_message "${BLUE}📊 Checking puzzle stock...${NC}"
    
    # 调用后端API获取统计信息
    if response=$(curl -s http://localhost:8000/api/v1/puzzle/stats); then
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    else
        log_message "${RED}❌ Failed to get puzzle stats${NC}"
        return 1
    fi
}

# 预生成每日挑战
generate_daily_challenges() {
    local days=${1:-14}
    log_message "${PURPLE}🎯 Generating daily challenges for next $days days...${NC}"
    
    if response=$(curl -s -X POST http://localhost:8000/api/v1/daily-challenge/admin/generate \
        -H "Content-Type: application/json" \
        -d "{\"days\": $days}"); then
        
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        log_message "${GREEN}✅ Daily challenges generated${NC}"
    else
        log_message "${RED}❌ Failed to generate daily challenges${NC}"
        return 1
    fi
}

# 获取每日挑战统计
check_daily_challenges() {
    log_message "${BLUE}📈 Checking daily challenge stats...${NC}"
    
    if response=$(curl -s http://localhost:8000/api/v1/daily-challenge/admin/stats); then
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    else
        log_message "${RED}❌ Failed to get daily challenge stats${NC}"
        return 1
    fi
}

# 测试今日挑战
test_today_challenge() {
    log_message "${BLUE}🎮 Testing today's challenge...${NC}"
    
    if response=$(curl -s http://localhost:8000/api/v1/daily-challenge/); then
        echo "$response" | jq '.data | {id, grid_size, difficulty, challenge_date}' 2>/dev/null || echo "$response"
        log_message "${GREEN}✅ Today's challenge is available${NC}"
    else
        log_message "${RED}❌ Failed to get today's challenge${NC}"
        return 1
    fi
}

# 补充题目库存
replenish_stock() {
    log_message "${PURPLE}📚 Replenishing puzzle stock...${NC}"
    
    if response=$(curl -s -X POST http://localhost:8000/api/v1/daily-challenge/admin/check-stock); then
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        log_message "${GREEN}✅ Stock replenishment completed${NC}"
    else
        log_message "${RED}❌ Failed to replenish stock${NC}"
        return 1
    fi
}

# 显示菜单
show_menu() {
    echo ""
    log_message "${YELLOW}请选择操作:${NC}"
    echo "1. 🔍 检查服务状态"
    echo "2. 📊 查看题库统计"
    echo "3. 📈 查看每日挑战统计"  
    echo "4. 🎮 测试今日挑战"
    echo "5. 🎯 预生成每日挑战"
    echo "6. 📚 补充题目库存"
    echo "7. 🔧 运行每日维护"
    echo "8. 🚀 一键全面检查"
    echo "9. ❌ 退出"
    echo ""
}

# 一键全面检查
full_check() {
    log_message "${CYAN}🚀 Running full system check...${NC}"
    
    check_services
    echo ""
    
    check_puzzle_stock
    echo ""
    
    check_daily_challenges  
    echo ""
    
    test_today_challenge
    echo ""
    
    # 如果需要，补充库存
    replenish_stock
    echo ""
    
    log_message "${GREEN}✅ Full system check completed${NC}"
}

# 主循环
main() {
    log_message "${BLUE}📝 Session started at $(date)${NC}"
    
    while true; do
        show_menu
        read -p "Enter your choice (1-9): " choice
        echo ""
        
        case $choice in
            1)
                check_services
                ;;
            2)
                check_puzzle_stock
                ;;
            3)
                check_daily_challenges
                ;;
            4)
                test_today_challenge
                ;;
            5)
                read -p "Enter number of days to generate (default 14): " days
                days=${days:-14}
                generate_daily_challenges $days
                ;;
            6)
                replenish_stock
                ;;
            7)
                run_daily_maintenance
                ;;
            8)
                full_check
                ;;
            9)
                log_message "${GREEN}👋 Goodbye!${NC}"
                exit 0
                ;;
            *)
                log_message "${RED}❌ Invalid choice${NC}"
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# 检查依赖
check_dependencies() {
    if ! command -v jq >/dev/null 2>&1; then
        log_message "${YELLOW}⚠️  jq not found. Installing for better JSON output...${NC}"
        if command -v brew >/dev/null 2>&1; then
            brew install jq >/dev/null 2>&1 || log_message "${YELLOW}   Failed to install jq via brew${NC}"
        fi
    fi
}

# 启动
check_dependencies
main