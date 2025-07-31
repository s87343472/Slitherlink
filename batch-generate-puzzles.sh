#!/bin/bash

# 批量生成Slitherlink题目脚本
# 用途: 离线生成大批量题目存储到数据库，避免实时生成的耗时问题

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
echo "║      🎯 Batch Puzzle Generation System       ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"

# 配置
ALGORITHM_URL="http://localhost:8080"
BACKEND_URL="http://localhost:3001"
OUTPUT_DIR="generated_puzzles_$(date +%Y%m%d_%H%M%S)"
BATCH_SIZE=20
LOG_FILE="${OUTPUT_DIR}/generation.log"

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# 初始化日志
echo "Batch Generation Started: $(date)" > "$LOG_FILE"

# 检查算法服务
check_algorithm_service() {
    echo -e "${BLUE}🔍 Checking algorithm service...${NC}"
    if curl -s --max-time 5 "${ALGORITHM_URL}/sl/gen?puzzledim=5&diff=easy" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Algorithm service is running${NC}"
        return 0
    else
        echo -e "${RED}❌ Algorithm service not available${NC}"
        echo "Please start the algorithm service first:"
        echo "  cd SlitherLink-analysis"
        echo "  java -jar target/puzzle-0.0.1-SNAPSHOT.jar server config.yml"
        exit 1
    fi
}

# 检查后端服务
check_backend_service() {
    echo -e "${BLUE}🔍 Checking backend service...${NC}"
    if curl -s --max-time 5 "${BACKEND_URL}/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend service is running${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Backend service not available, will save to files${NC}"
        return 1
    fi
}

# 生成单个题目
generate_single_puzzle() {
    local size=$1
    local difficulty=$2
    local index=$3
    local max_attempts=3
    
    for ((attempt=1; attempt<=max_attempts; attempt++)); do
        # 调用算法服务生成题目
        response=$(curl -s --max-time 30 "${ALGORITHM_URL}/sl/gen?puzzledim=${size}&diff=${difficulty}" 2>/dev/null)
        
        if [ $? -eq 0 ] && echo "$response" | grep -q '"seed"'; then
            # 解析响应数据
            seed=$(echo "$response" | jq -r '.seed // empty')
            count=$(echo "$response" | jq -r '.count // empty')
            pairs=$(echo "$response" | jq -r '.pairs // empty')
            
            if [ -n "$seed" ] && [ -n "$count" ] && [ -n "$pairs" ]; then
                # 生成puzzle_hash
                puzzle_hash=$(echo "${size}_${difficulty}_${seed}_${count}" | sha256sum | cut -d' ' -f1)
                
                # 创建题目数据结构
                puzzle_data=$(jq -n \
                    --arg seed "$seed" \
                    --argjson count "$count" \
                    --argjson pairs "$pairs" \
                    --arg size "$size" \
                    --arg difficulty "$difficulty" \
                    '{
                        seed: $seed,
                        grid_size: ($size | tonumber),
                        difficulty: $difficulty,
                        count: $count,
                        pairs: $pairs,
                        generated_at: now
                    }')
                
                # 生成解法数据 (这里简化处理，实际应该调用解题算法)
                solution_data=$(jq -n \
                    --argjson pairs "$pairs" \
                    '{
                        solution_pairs: $pairs,
                        is_unique: true,
                        solve_time_estimate: 300
                    }')
                
                # 保存到文件
                filename="${OUTPUT_DIR}/puzzle_${size}x${size}_${difficulty}_${index}.json"
                jq -n \
                    --arg puzzle_hash "$puzzle_hash" \
                    --arg size "$size" \
                    --arg difficulty "$difficulty" \
                    --argjson puzzle_data "$puzzle_data" \
                    --argjson solution_data "$solution_data" \
                    --arg seed "$seed" \
                    '{
                        puzzle_hash: $puzzle_hash,
                        grid_size: ($size | tonumber),
                        difficulty: $difficulty,
                        usage_type: "regular",
                        puzzle_data: $puzzle_data,
                        solution_data: $solution_data,
                        java_seed: ($seed | split("-")[2] | tonumber),
                        estimated_duration: 300
                    }' > "$filename"
                
                echo "Generated: ${size}x${size} ${difficulty} #${index} (seed: ${seed})" >> "$LOG_FILE"
                return 0
            fi
        fi
        
        echo "Attempt ${attempt}/${max_attempts} failed for ${size}x${size} ${difficulty} #${index}" >> "$LOG_FILE"
        sleep 1
    done
    
    echo "FAILED: ${size}x${size} ${difficulty} #${index} after ${max_attempts} attempts" >> "$LOG_FILE"
    return 1
}

# 生成指定配置的批量题目
generate_batch() {
    local size=$1
    local difficulty=$2
    local count=$3
    
    echo -e "${PURPLE}🎯 Generating ${count} puzzles: ${size}x${size} ${difficulty}${NC}"
    
    local success_count=0
    local failed_count=0
    
    for ((i=1; i<=count; i++)); do
        printf "\r  Progress: [%d/%d] Generated: %d Failed: %d" "$i" "$count" "$success_count" "$failed_count"
        
        if generate_single_puzzle "$size" "$difficulty" "$i"; then
            success_count=$((success_count + 1))
        else
            failed_count=$((failed_count + 1))
        fi
        
        # 短暂休息避免过载服务器
        sleep 0.2
    done
    
    printf "\r                                                                    \r"
    echo -e "${GREEN}✅ ${size}x${size} ${difficulty}: ${success_count}/${count} successful${NC}"
    
    if [ $failed_count -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Failed: ${failed_count}${NC}"
    fi
    
    echo ""
}

# 上传题目到数据库
upload_to_database() {
    echo -e "${BLUE}📤 Uploading puzzles to database...${NC}"
    
    local upload_count=0
    local failed_uploads=0
    
    for file in "$OUTPUT_DIR"/puzzle_*.json; do
        if [ -f "$file" ]; then
            if curl -s -X POST \
                -H "Content-Type: application/json" \
                -d @"$file" \
                "${BACKEND_URL}/api/admin/puzzles" > /dev/null 2>&1; then
                upload_count=$((upload_count + 1))
            else
                failed_uploads=$((failed_uploads + 1))
                echo "Failed to upload: $(basename "$file")" >> "$LOG_FILE"
            fi
        fi
    done
    
    echo -e "${GREEN}✅ Uploaded: ${upload_count} puzzles${NC}"
    if [ $failed_uploads -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Failed uploads: ${failed_uploads}${NC}"
    fi
}

# 生成统计报告
generate_report() {
    echo -e "${CYAN}📊 Generating summary report...${NC}"
    
    local report_file="${OUTPUT_DIR}/generation_report.txt"
    
    cat > "$report_file" << EOF
Slitherlink Batch Generation Report
==================================
Generation Time: $(date)
Output Directory: $OUTPUT_DIR

Configuration:
- Batch Size: $BATCH_SIZE puzzles per configuration
- Algorithm Service: $ALGORITHM_URL
- Backend Service: $BACKEND_URL

Files Generated:
$(ls -la "$OUTPUT_DIR"/*.json 2>/dev/null | wc -l) puzzle files

Summary by Configuration:
EOF
    
    for file in "$OUTPUT_DIR"/puzzle_*.json; do
        if [ -f "$file" ]; then
            basename "$file" | sed 's/puzzle_\(.*\).json/\1/' | sed 's/_/ /g'
        fi
    done | sort | uniq -c >> "$report_file"
    
    echo "" >> "$report_file"
    echo "Detailed Log:" >> "$report_file"
    cat "$LOG_FILE" >> "$report_file"
    
    echo -e "${GREEN}✅ Report saved to: ${report_file}${NC}"
}

# 主函数
main() {
    check_algorithm_service
    
    local use_database=false
    if check_backend_service; then
        use_database=true
    fi
    
    echo -e "${PURPLE}🚀 Starting batch generation...${NC}"
    echo "Output directory: $OUTPUT_DIR"
    echo ""
    
    # 生成配置 (尺寸 难度 数量) - 每个配置20道题
    local configs=(
        "5 easy $BATCH_SIZE"
        "5 medium $BATCH_SIZE"
        "5 difficult $BATCH_SIZE"
        "7 easy $BATCH_SIZE"
        "7 medium $BATCH_SIZE"
        "7 difficult $BATCH_SIZE"
        "10 easy $BATCH_SIZE"
        "10 medium $BATCH_SIZE"
        "10 difficult $BATCH_SIZE"
    )
    
    # 开始生成
    for config in "${configs[@]}"; do
        IFS=' ' read -r size difficulty count <<< "$config"
        generate_batch "$size" "$difficulty" "$count"
    done
    
    # 上传到数据库（如果可用）
    if [ "$use_database" = true ]; then
        upload_to_database
    else
        echo -e "${YELLOW}💾 Puzzles saved to files only (database not available)${NC}"
    fi
    
    generate_report
    
    echo -e "${GREEN}🎉 Batch generation completed!${NC}"
    echo -e "${BLUE}📁 Results in: ${OUTPUT_DIR}${NC}"
    echo -e "${BLUE}📊 Report: ${OUTPUT_DIR}/generation_report.txt${NC}"
    echo ""
    
    # 显示统计
    local total_files=$(ls -1 "$OUTPUT_DIR"/*.json 2>/dev/null | wc -l)
    echo -e "${CYAN}📈 Summary:${NC}"
    echo -e "   Generated: ${total_files} puzzle files"
    echo -e "   Storage: Files + $([ "$use_database" = true ] && echo "Database" || echo "Files only")"
    echo -e "   Duration: $SECONDS seconds"
}

# 检查依赖
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ jq is required but not installed${NC}"
    echo -e "${YELLOW}Install with: brew install jq (macOS) or apt-get install jq (Linux)${NC}"
    exit 1
fi

# 启动计时
SECONDS=0

# 执行主函数
main "$@"