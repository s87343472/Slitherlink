#!/bin/bash

echo "🚀 启动数回游戏开发环境..."

# 检查Java服务是否在运行
if ! curl -s http://localhost:8080/sl/gen?puzzledim=5&diff=easy > /dev/null; then
    echo "📱 启动Java算法服务..."
    cd SlitherLink-analysis
    java -jar target/puzzle-0.0.1-SNAPSHOT.jar server config.yml > ../algorithm-service.log 2>&1 &
    echo "Java服务PID: $!"
    cd ..
    
    # 等待服务启动
    echo "⏳ 等待Java服务启动..."
    sleep 10
fi

echo "✅ Java算法服务运行在: http://localhost:8080"

# 启动Next.js开发服务器
echo "📱 启动Next.js前端服务..."
cd slitherlink-web
npm run dev &
NEXT_PID=$!

echo "✅ Next.js前端服务运行在: http://localhost:3000"
echo "🎮 Java算法服务运行在: http://localhost:8080"
echo ""
echo "📖 使用说明:"
echo "• 打开浏览器访问 http://localhost:3000"
echo "• 点击左侧面板生成题目开始游戏"
echo "• 左键点击画线，右键点击标记×"
echo "• 使用'Show Solution'按钮查看答案"
echo ""
echo "按 Ctrl+C 停止服务"

# 等待用户中断
wait $NEXT_PID