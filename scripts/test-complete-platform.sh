#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════╗"
echo "║      🧪 Complete Platform Test Suite         ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"

BASE_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:3000"
ALGORITHM_URL="http://localhost:8080"

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
test_endpoint() {
    local test_name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="$4"
    local auth_header="$5"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${BLUE}🔍 Testing: $test_name${NC}"
    
    local cmd="curl -s -w '%{http_code}' -o /tmp/test_response"
    if [ "$method" = "POST" ]; then
        cmd="$cmd -X POST -H 'Content-Type: application/json'"
        if [ -n "$data" ]; then
            cmd="$cmd -d '$data'"
        fi
    fi
    
    if [ -n "$auth_header" ]; then
        cmd="$cmd -H 'Authorization: Bearer $auth_header'"
    fi
    
    cmd="$cmd '$url'"
    
    http_code=$(eval $cmd)
    response_body=$(cat /tmp/test_response)
    
    if [[ "$http_code" =~ ^2[0-9]{2}$ ]]; then
        echo -e "${GREEN}✅ $test_name - HTTP $http_code${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ $test_name - HTTP $http_code${NC}"
        echo -e "${YELLOW}   Response: $(echo "$response_body" | head -c 200)${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# 等待服务启动
wait_for_services() {
    echo -e "${YELLOW}⏳ Waiting for all services to be ready...${NC}"
    
    local services=(
        "Backend API:$BASE_URL/health"
        "Frontend:$FRONTEND_URL"
        "Algorithm Service:$ALGORITHM_URL/sl/gen?puzzledim=5&diff=easy"
    )
    
    for service_info in "${services[@]}"; do
        local name=$(echo "$service_info" | cut -d: -f1)
        local url=$(echo "$service_info" | cut -d: -f2-)
        
        echo -e "${BLUE}   Checking $name...${NC}"
        local attempts=0
        local max_attempts=30
        
        while [ $attempts -lt $max_attempts ]; do
            if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
                echo -e "${GREEN}   ✅ $name is ready${NC}"
                break
            fi
            
            attempts=$((attempts + 1))
            if [ $attempts -eq $max_attempts ]; then
                echo -e "${RED}   ❌ $name failed to start after ${max_attempts} attempts${NC}"
                echo -e "${YELLOW}   Please check if all services are running:${NC}"
                echo -e "${YELLOW}   - ./start-project.sh (option 5)${NC}"
                exit 1
            fi
            
            sleep 2
        done
    done
    
    echo -e "${GREEN}🎉 All services are ready!${NC}"
    echo ""
}

# 主测试流程
run_tests() {
    echo -e "${PURPLE}📊 Starting comprehensive tests...${NC}"
    echo ""
    
    # 1. 基础服务测试
    echo -e "${BLUE}=== 🔧 Service Health Tests ===${NC}"
    test_endpoint "Backend Health Check" "$BASE_URL/health"
    test_endpoint "API Info" "$BASE_URL/api/v1/info"
    test_endpoint "Frontend Accessibility" "$FRONTEND_URL"
    test_endpoint "Algorithm Service" "$ALGORITHM_URL/sl/gen?puzzledim=5&diff=easy"
    
    echo ""
    
    # 2. 用户认证测试
    echo -e "${BLUE}=== 👤 User Authentication Tests ===${NC}"
    
    # 登录管理员用户
    echo -e "${CYAN}🔐 Logging in as admin user...${NC}"
    login_response=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "admin@slitherlink.game",
            "password": "admin123"
        }')
    
    admin_token=$(echo "$login_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    
    if [ -n "$admin_token" ] && [ ${#admin_token} -gt 20 ]; then
        echo -e "${GREEN}✅ Admin login successful${NC}"
        echo -e "${CYAN}   Token: ${admin_token:0:20}...${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ Admin login failed${NC}"
        echo -e "${YELLOW}   Response: $login_response${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # 测试用户信息获取
    test_endpoint "Get User Profile" "$BASE_URL/api/v1/auth/profile" "GET" "" "$admin_token"
    
    # 登录测试用户
    echo -e "${CYAN}🔐 Logging in as test user...${NC}"
    test_login_response=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "test@example.com",
            "password": "test123"
        }')
    
    test_token=$(echo "$test_login_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    
    if [ -n "$test_token" ] && [ ${#test_token} -gt 20 ]; then
        echo -e "${GREEN}✅ Test user login successful${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ Test user login failed${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # 测试购买排行榜通行证
    test_endpoint "Purchase Leaderboard Access" "$BASE_URL/api/v1/auth/purchase/leaderboard-access" "POST" "" "$test_token"
    
    # 测试Token刷新
    test_endpoint "Refresh Token" "$BASE_URL/api/v1/auth/refresh-token" "POST" "" "$admin_token"
    
    echo ""
    
    # 3. 题目相关测试
    echo -e "${BLUE}=== 🧩 Puzzle System Tests ===${NC}"
    test_endpoint "Test Puzzle Generation" "$BASE_URL/api/v1/test/generate"
    
    # 直接测试算法服务的不同难度
    test_endpoint "Easy Puzzle Generation" "$ALGORITHM_URL/sl/gen?puzzledim=5&diff=easy"
    test_endpoint "Medium Puzzle Generation" "$ALGORITHM_URL/sl/gen?puzzledim=7&diff=medium" 
    test_endpoint "Difficult Puzzle Generation" "$ALGORITHM_URL/sl/gen?puzzledim=10&diff=difficult"
    
    echo ""
    
    # 4. 用户注册测试（创建新用户）
    echo -e "${BLUE}=== 📝 User Registration Tests ===${NC}"
    
    # 生成随机用户
    random_id=$(date +%s)
    test_endpoint "New User Registration" "$BASE_URL/api/v1/auth/register" "POST" "{
        \"email\": \"testuser$random_id@example.com\",
        \"username\": \"testuser$random_id\",
        \"password\": \"password123\",
        \"display_name\": \"Test User $random_id\"
    }"
    
    echo ""
}

# 显示测试结果
show_results() {
    echo -e "${PURPLE}📊 Test Results Summary${NC}"
    echo -e "${BLUE}===================${NC}"
    echo -e "${GREEN}✅ Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}❌ Failed: $FAILED_TESTS${NC}"
    echo -e "${CYAN}📊 Total:  $TOTAL_TESTS${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo ""
        echo -e "${GREEN}🎉 All tests passed! Platform is working correctly!${NC}"
        echo ""
        echo -e "${CYAN}🚀 Ready for development and testing:${NC}"
        echo -e "${YELLOW}   Frontend: http://localhost:3000${NC}"
        echo -e "${YELLOW}   Backend:  http://localhost:8000${NC}"
        echo -e "${YELLOW}   API Docs: slitherlink-backend/API_EXAMPLES.md${NC}"
        echo ""
        echo -e "${BLUE}🎮 Test Users:${NC}"
        echo -e "${YELLOW}   Admin: admin@slitherlink.game / admin123${NC}"
        echo -e "${YELLOW}   Test:  test@example.com / test123${NC}"
    else
        echo ""
        echo -e "${RED}❌ Some tests failed. Please check the services:${NC}"
        echo -e "${YELLOW}   1. Ensure all services are running: ./start-project.sh${NC}"
        echo -e "${YELLOW}   2. Check service logs in logs/ directory${NC}"
        echo -e "${YELLOW}   3. Verify database connection and data${NC}"
        exit 1
    fi
}

# 主执行流程
main() {
    wait_for_services
    run_tests
    show_results
}

# 清理临时文件
cleanup() {
    rm -f /tmp/test_response
}
trap cleanup EXIT

# 执行测试
main