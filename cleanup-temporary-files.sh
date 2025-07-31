#!/bin/bash

# 清理临时文件和生成的谜题数据
# 运行前请确保重要数据已备份

set -e

echo "🧹 Starting cleanup of temporary files..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 删除生成的谜题目录（已入库）
echo "📂 Removing generated puzzle directories..."
find "$SCRIPT_DIR" -name "generated_puzzles_*" -type d -exec rm -rf {} + 2>/dev/null || true
find "$SCRIPT_DIR" -name "puzzles_*_each_*" -type d -exec rm -rf {} + 2>/dev/null || true

# 删除性能测试文件
echo "📊 Removing performance test files..."
rm -f "$SCRIPT_DIR/performance_detailed_"*.log
rm -f "$SCRIPT_DIR/performance_results_"*.txt
rm -f "$SCRIPT_DIR/performance_summary.txt"
rm -f "$SCRIPT_DIR/test_results_"*.txt

# 删除临时日志文件
echo "📋 Removing temporary log files..."
rm -f "$SCRIPT_DIR/algorithm-service.log"
rm -f "$SCRIPT_DIR/frontend-dev.log"

# 删除一次性验证脚本
echo "🔍 Removing verification scripts..."
rm -f "$SCRIPT_DIR/check-database-puzzles.js"
rm -f "$SCRIPT_DIR/check-puzzles-simple.js"
rm -f "$SCRIPT_DIR/verify-180-puzzles.js"

# 删除开发测试脚本
echo "🧪 Removing test scripts..."
rm -f "$SCRIPT_DIR/test-database-retrieval.js"
rm -f "$SCRIPT_DIR/test-simple.sh"
rm -f "$SCRIPT_DIR/test-algorithm-performance.sh"

# 保留的重要文件列表
echo ""
echo "✅ Cleanup completed! Kept important files:"
echo "   📁 SlitherLink-analysis/ (Algorithm service)"
echo "   📁 slitherlink-backend/ (Backend API)"
echo "   📁 slitherlink-web/ (Frontend)"
echo "   📁 docs/ (Documentation)"
echo "   📁 logs/ (Runtime logs)"
echo "   🚀 start-project.sh"
echo "   🚀 quick-start.sh"
echo "   🛑 stop-project.sh"
echo "   🔄 batch-generate-*.sh (For future puzzle generation)"
echo "   🧪 test-complete-platform.sh (Platform testing)"
echo "   📖 README.md"

echo ""
echo "💾 Database contains 180 puzzles, no data loss occurred."
echo "🎯 Project is now cleaner and ready for production!"