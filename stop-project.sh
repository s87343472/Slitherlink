#!/bin/bash

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
echo "║        🛑 Stopping Slitherlink Platform      ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}🛑 Stopping all Slitherlink services...${NC}"
echo ""

# 停止所有相关进程
echo -e "${BLUE}🔍 Finding running processes...${NC}"

# 查找并停止各种进程
PROCESSES_FOUND=0

# 1. 停止tsx进程 (后端开发服务器)
TSX_PIDS=$(pgrep -f "tsx.*server.ts" 2>/dev/null || true)
if [ -n "$TSX_PIDS" ]; then
    echo -e "${PURPLE}🔧 Stopping backend API server (tsx)...${NC}"
    echo "$TSX_PIDS" | xargs kill -TERM 2>/dev/null || true
    sleep 2
    echo "$TSX_PIDS" | xargs kill -KILL 2>/dev/null || true
    PROCESSES_FOUND=1
fi

# 2. 停止npm run dev进程
NPM_PIDS=$(pgrep -f "npm run dev" 2>/dev/null || true)
if [ -n "$NPM_PIDS" ]; then
    echo -e "${PURPLE}🔧 Stopping npm dev processes...${NC}"
    echo "$NPM_PIDS" | xargs kill -TERM 2>/dev/null || true
    sleep 2
    echo "$NPM_PIDS" | xargs kill -KILL 2>/dev/null || true
    PROCESSES_FOUND=1
fi

# 3. 停止Next.js前端进程
NEXT_PIDS=$(pgrep -f "next dev" 2>/dev/null || true)
if [ -n "$NEXT_PIDS" ]; then
    echo -e "${PURPLE}🎨 Stopping Next.js frontend...${NC}"
    echo "$NEXT_PIDS" | xargs kill -TERM 2>/dev/null || true
    sleep 2
    echo "$NEXT_PIDS" | xargs kill -KILL 2>/dev/null || true
    PROCESSES_FOUND=1
fi

# 4. 停止Java算法服务
JAVA_PIDS=$(pgrep -f "puzzle.*jar" 2>/dev/null || true)
if [ -n "$JAVA_PIDS" ]; then
    echo -e "${PURPLE}🧮 Stopping Java algorithm service...${NC}"
    echo "$JAVA_PIDS" | xargs kill -TERM 2>/dev/null || true
    sleep 3
    echo "$JAVA_PIDS" | xargs kill -KILL 2>/dev/null || true
    PROCESSES_FOUND=1
fi

# 5. 停止可能的node进程
NODE_PIDS=$(pgrep -f "node.*server" 2>/dev/null || true)
if [ -n "$NODE_PIDS" ]; then
    echo -e "${PURPLE}🔧 Stopping Node.js servers...${NC}"
    echo "$NODE_PIDS" | xargs kill -TERM 2>/dev/null || true
    sleep 2
    echo "$NODE_PIDS" | xargs kill -KILL 2>/dev/null || true
    PROCESSES_FOUND=1
fi

# 检查端口占用
echo -e "${BLUE}🔍 Checking for remaining port usage...${NC}"

PORTS=(3000 8000 8080)
PORTS_BUSY=0

for port in "${PORTS[@]}"; do
    PORT_PID=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$PORT_PID" ]; then
        echo -e "${YELLOW}⚠️  Port $port still occupied by PID $PORT_PID${NC}"
        echo "   Attempting to kill..."
        kill -TERM $PORT_PID 2>/dev/null || kill -KILL $PORT_PID 2>/dev/null || true
        PORTS_BUSY=1
    else
        echo -e "${GREEN}✅ Port $port is free${NC}"
    fi
done

# 清理可能的日志文件锁
echo -e "${BLUE}🧹 Cleaning up temporary files...${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -d "$SCRIPT_DIR/logs" ]; then
    echo "   Cleaning log files..."
    # 不删除日志文件，只是确保没有进程在写入
    for logfile in "$SCRIPT_DIR/logs/"*.log; do
        if [ -f "$logfile" ]; then
            # 检查是否有进程在写入该文件
            WRITING_PIDS=$(lsof "$logfile" 2>/dev/null | awk 'NR>1 {print $2}' || true)
            if [ -n "$WRITING_PIDS" ]; then
                echo "   Stopping processes writing to $(basename $logfile)..."
                echo "$WRITING_PIDS" | xargs kill -TERM 2>/dev/null || true
            fi
        fi
    done
fi

# 最终检查
sleep 2
echo ""
echo -e "${BLUE}🔍 Final verification...${NC}"

REMAINING_PROCESSES=$(pgrep -f "(tsx|next|java.*puzzle|npm run dev)" 2>/dev/null || true)
if [ -n "$REMAINING_PROCESSES" ]; then
    echo -e "${YELLOW}⚠️  Some processes may still be running:${NC}"
    ps -p $REMAINING_PROCESSES -o pid,command 2>/dev/null || true
    echo ""
    echo -e "${YELLOW}You may need to manually kill these processes:${NC}"
    echo "   sudo kill -9 $REMAINING_PROCESSES"
else
    echo -e "${GREEN}✅ All processes stopped successfully${NC}"
fi

# 检查最终端口状态
echo ""
echo -e "${BLUE}📊 Final port status:${NC}"
for port in "${PORTS[@]}"; do
    if lsof -ti:$port >/dev/null 2>&1; then
        echo -e "${RED}   Port $port: ❌ Still occupied${NC}"
    else
        echo -e "${GREEN}   Port $port: ✅ Free${NC}"
    fi
done

echo ""
if [ $PROCESSES_FOUND -eq 1 ] || [ $PORTS_BUSY -eq 1 ]; then
    echo -e "${GREEN}🎉 Slitherlink platform stopped!${NC}"
    echo ""
    echo -e "${CYAN}📝 Log files preserved in: $SCRIPT_DIR/logs/${NC}"
    echo -e "${CYAN}🔄 To restart: ./start-project.sh${NC}"
else
    echo -e "${YELLOW}ℹ️  No Slitherlink processes were found running${NC}"
    echo ""
    echo -e "${CYAN}🚀 To start the platform: ./start-project.sh${NC}"
fi

echo ""