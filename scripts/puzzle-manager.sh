#!/bin/bash

# 🧩 Slitherlink Puzzle Manager - 统一管理脚本
# 功能: 每日挑战补充、Custom Puzzle补充、修复和清理
# 使用: ./puzzle-manager.sh [daily|custom|fix|clean|status]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 配置
ALGORITHM_URL="http://localhost:8080"
BACKEND_DIR="/Users/sagasu/Downloads/Slitherlink/slitherlink-backend"
BASE_DIR="/Users/sagasu/Downloads/Slitherlink"
TEMP_DIR=""

# 显示帮助信息
show_help() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════╗"
    echo "║        🧩 Slitherlink Puzzle Manager         ║"
    echo "╚══════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo "Usage: ./puzzle-manager.sh [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo -e "  ${GREEN}daily${NC}    - 补充每日挑战题目库"
    echo -e "  ${GREEN}custom${NC}   - 补充Custom Puzzle题目库"
    echo -e "  ${GREEN}fix${NC}      - 修复损坏的JSON文件"
    echo -e "  ${GREEN}clean${NC}    - 清理临时文件和目录"
    echo -e "  ${GREEN}status${NC}   - 查看题目库存状态"
    echo -e "  ${GREEN}help${NC}     - 显示此帮助信息"
    echo ""
    echo "Options:"
    echo "  --count N    - 指定生成数量 (默认: daily=30, custom=50)"
    echo "  --size N     - 指定网格尺寸 (5,7,10,12,15)"
    echo "  --diff LEVEL - 指定难度 (easy,medium,difficult)"
    echo "  --keep       - 保留临时文件 (用于调试)"
    echo ""
    echo "Examples:"
    echo "  ./puzzle-manager.sh daily --count 50"
    echo "  ./puzzle-manager.sh custom --size 7 --diff medium --count 20"
    echo "  ./puzzle-manager.sh fix"
    echo "  ./puzzle-manager.sh clean"
}

# 检查依赖
check_dependencies() {
    local missing=()
    
    if ! command -v jq &> /dev/null; then
        missing+=("jq")
    fi
    
    if ! command -v curl &> /dev/null; then
        missing+=("curl")
    fi
    
    if [ ${#missing[@]} -gt 0 ]; then
        echo -e "${RED}❌ Missing dependencies: ${missing[*]}${NC}"
        echo -e "${YELLOW}Install with: brew install ${missing[*]}${NC}"
        exit 1
    fi
}

# 检查算法服务
check_algorithm_service() {
    echo -e "${BLUE}🔍 Checking algorithm service...${NC}"
    if curl -s --max-time 5 "${ALGORITHM_URL}/sl/gen?puzzledim=5&diff=easy" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Algorithm service is running${NC}"
        return 0
    else
        echo -e "${RED}❌ Algorithm service not available at $ALGORITHM_URL${NC}"
        echo "Please start the algorithm service first:"
        echo "  cd SlitherLink-analysis"
        echo "  java -jar target/puzzle-0.0.1-SNAPSHOT.jar server config.yml"
        exit 1
    fi
}

# 创建临时目录
create_temp_dir() {
    local prefix=$1
    TEMP_DIR="${BASE_DIR}/${prefix}_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$TEMP_DIR"
    echo -e "${BLUE}📁 Working directory: $TEMP_DIR${NC}"
}

# 生成单个题目
generate_single_puzzle() {
    local size=$1
    local difficulty=$2
    local index=$3
    local max_attempts=3
    
    for ((attempt=1; attempt<=max_attempts; attempt++)); do
        response=$(curl -s --max-time 30 "${ALGORITHM_URL}/sl/gen?puzzledim=${size}&diff=${difficulty}" 2>/dev/null)
        
        if [ $? -eq 0 ] && echo "$response" | jq -e '.seed' > /dev/null 2>&1; then
            seed=$(echo "$response" | jq -r '.seed')
            count=$(echo "$response" | jq -r '.count')
            pairs=$(echo "$response" | jq -r '.pairs')
            
            if [ -n "$seed" ] && [ "$count" != "null" ] && [ "$pairs" != "null" ]; then
                # 计算线索密度
                clue_count=$(echo "$count" | jq '[.[][] | select(. != -1 and . != null)] | length')
                max_cells=$(( (size - 1) * (size - 1) ))
                density=$(echo "scale=1; $clue_count * 100 / $max_cells" | bc 2>/dev/null || echo "0")
                
                # 生成puzzle_hash
                puzzle_hash=$(echo "${size}_${difficulty}_${seed}_${count}" | sha256sum | cut -d' ' -f1)
                
                # 创建完整的puzzle对象
                filename="${TEMP_DIR}/puzzle_${size}x${size}_${difficulty}_$(printf "%03d" $index).json"
                jq -n \
                    --arg puzzle_hash "$puzzle_hash" \
                    --arg size "$size" \
                    --arg difficulty "$difficulty" \
                    --arg seed "$seed" \
                    --argjson count "$count" \
                    --argjson pairs "$pairs" \
                    --arg clue_count "$clue_count" \
                    --arg density "$density" \
                    '{
                        puzzle_hash: $puzzle_hash,
                        grid_size: ($size | tonumber),
                        difficulty: $difficulty,
                        usage_type: "regular",
                        puzzle_data: {
                            seed: $seed,
                            grid_size: ($size | tonumber),
                            difficulty: $difficulty,
                            count: $count,
                            pairs: $pairs,
                            generated_at: now
                        },
                        solution_data: {
                            solution_pairs: $pairs,
                            is_unique: true,
                            solve_time_estimate: 300
                        },
                        java_seed: ($seed | split("-")[2] | tonumber),
                        estimated_duration: (300 + ($size * $size * 2)),
                        clue_count: ($clue_count | tonumber),
                        clue_density: ($density | tonumber)
                    }' > "$filename"
                
                echo -e "${GREEN}Generated: ${size}x${size} ${difficulty} #${index} (${clue_count} clues, ${density}% density)${NC}"
                return 0
            fi
        fi
        
        if [ $attempt -lt $max_attempts ]; then
            sleep 1
        fi
    done
    
    echo -e "${RED}Failed: ${size}x${size} ${difficulty} #${index} after ${max_attempts} attempts${NC}"
    return 1
}

# 批量生成题目
generate_batch() {
    local size=$1
    local difficulty=$2
    local count=$3
    local purpose=$4
    
    echo -e "${PURPLE}🎯 Generating ${count} puzzles: ${size}x${size} ${difficulty} (${purpose})${NC}"
    
    local success_count=0
    local failed_count=0
    local start_time=$(date +%s)
    
    for ((i=1; i<=count; i++)); do
        if (( i % 5 == 0 )); then
            printf "\r  Progress: [%d/%d] Success: %d Failed: %d" "$i" "$count" "$success_count" "$failed_count"
        fi
        
        if generate_single_puzzle "$size" "$difficulty" "$i"; then
            success_count=$((success_count + 1))
        else
            failed_count=$((failed_count + 1))
        fi
        
        sleep 0.1
    done
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    printf "\r  ✅ Complete: [%d/%d] Success: %d Failed: %d (took %ds)\n" "$count" "$count" "$success_count" "$failed_count" "$duration"
    echo ""
    
    return $success_count
}

# 导入到数据库
import_to_database() {
    echo -e "${BLUE}📤 Importing puzzles to database...${NC}"
    
    cd "$BACKEND_DIR"
    
    if node import-puzzles.js "$TEMP_DIR" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Successfully imported puzzles to database${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Failed to import to database${NC}"
        return 1
    fi
}

# 清理临时文件
cleanup() {
    local keep_files=$1
    
    if [ "$keep_files" = "true" ]; then
        echo -e "${YELLOW}🗂️  Temporary files kept: $TEMP_DIR${NC}"
    else
        if [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
            rm -rf "$TEMP_DIR"
            echo -e "${GREEN}🗑️  Cleaned up temporary files${NC}"
        fi
    fi
}

# 查看题目库存状态
show_status() {
    echo -e "${CYAN}📊 Puzzle Inventory Status${NC}"
    echo "=================================="
    
    cd "$BACKEND_DIR"
    node -e "
    const knex = require('knex')({
      client: 'postgresql',
      connection: {
        host: 'localhost',
        port: 5432,
        user: process.env.USER || 'sagasu',
        password: '',
        database: 'slitherlink'
      }
    });

    (async () => {
      try {
        const counts = await knex('puzzles')
          .select('grid_size', 'difficulty')
          .where('usage_type', 'regular')
          .count('* as count')
          .groupBy('grid_size', 'difficulty')
          .orderBy('grid_size')
          .orderBy('difficulty');
        
        console.log('Size  | Difficulty | Count | Status');
        console.log('------|------------|-------|-------');
        counts.forEach(row => {
          const count = parseInt(row.count);
          let status = '🟢 Good';
          if (count < 10) status = '🔴 Low';
          else if (count < 25) status = '🟡 Medium';
          
          console.log(\`\${row.grid_size}x\${row.grid_size} | \${row.difficulty.padEnd(10)} | \${count.toString().padStart(5)} | \${status}\`);
        });
        
        const total = await knex('puzzles').where('usage_type', 'regular').count('* as total');
        console.log(\`\\nTotal puzzles: \${total[0].total}\`);
        
        const dailyChallenges = await knex('daily_challenges').count('* as total');
        console.log(\`Daily challenges configured: \${dailyChallenges[0].total}\`);
        
      } catch (error) {
        console.error('Error:', error);
      } finally {
        await knex.destroy();
      }
    })();
    "
}

# 每日挑战补充
daily_challenge_replenish() {
    local count=${1:-30}
    
    echo -e "${CYAN}📅 Daily Challenge Replenishment${NC}"
    echo "=================================="
    
    create_temp_dir "daily_challenge"
    
    # 每日挑战的配置 (基于一周的循环)
    local configs=(
        "5 easy 5"           # Monday - 简单
        "7 medium 8"         # Tuesday - 中等  
        "10 difficult 5"     # Wednesday - 困难
        "7 medium 8"         # Thursday - 中等
        "12 difficult 3"     # Friday - 大师
        "15 difficult 2"     # Saturday - 忍者
        "10 difficult 5"     # Sunday - 困难
    )
    
    local total_generated=0
    
    for config in "${configs[@]}"; do
        IFS=' ' read -r size difficulty batch_count <<< "$config"
        local actual_count=$(( batch_count * count / 30 ))  # 按比例调整
        actual_count=$(( actual_count < 1 ? 1 : actual_count ))
        
        if result=$(generate_batch "$size" "$difficulty" "$actual_count" "daily challenge"); then
            total_generated=$((total_generated + result))
        fi
    done
    
    if import_to_database; then
        echo -e "${GREEN}🎉 Daily challenge replenishment completed!${NC}"
        echo -e "${BLUE}Generated: $total_generated puzzles${NC}"
    fi
    
    cleanup "$KEEP_FILES"
}

# Custom Puzzle补充
custom_puzzle_replenish() {
    local count=${1:-50}
    local target_size=${2:-"all"}
    local target_difficulty=${3:-"all"}
    
    echo -e "${CYAN}🎮 Custom Puzzle Replenishment${NC}"
    echo "=================================="
    
    create_temp_dir "custom_puzzle"
    
    # Custom Puzzle配置 - 均衡分布
    local configs=()
    local sizes=(5 7 10 12 15)
    local difficulties=("easy" "medium" "difficult")
    
    if [ "$target_size" = "all" ] && [ "$target_difficulty" = "all" ]; then
        # 生成所有配置的均衡分布
        for size in "${sizes[@]}"; do
            for difficulty in "${difficulties[@]}"; do
                local batch_count=$(( count / 15 ))  # 15个配置平均分配
                batch_count=$(( batch_count < 1 ? 1 : batch_count ))
                configs+=("$size $difficulty $batch_count")
            done
        done
    elif [ "$target_size" != "all" ] && [ "$target_difficulty" = "all" ]; then
        # 指定尺寸的所有难度
        for difficulty in "${difficulties[@]}"; do
            local batch_count=$(( count / 3 ))
            configs+=("$target_size $difficulty $batch_count")
        done
    elif [ "$target_size" = "all" ] && [ "$target_difficulty" != "all" ]; then
        # 指定难度的所有尺寸
        for size in "${sizes[@]}"; do
            local batch_count=$(( count / 5 ))
            configs+=("$size $target_difficulty $batch_count")
        done
    else
        # 指定尺寸和难度
        configs+=("$target_size $target_difficulty $count")
    fi
    
    local total_generated=0
    
    for config in "${configs[@]}"; do
        IFS=' ' read -r size difficulty batch_count <<< "$config"
        
        if result=$(generate_batch "$size" "$difficulty" "$batch_count" "custom puzzle"); then
            total_generated=$((total_generated + result))
        fi
    done
    
    if import_to_database; then
        echo -e "${GREEN}🎉 Custom puzzle replenishment completed!${NC}"
        echo -e "${BLUE}Generated: $total_generated puzzles${NC}"
    fi
    
    cleanup "$KEEP_FILES"
}

# 修复损坏的JSON文件
fix_puzzles() {
    echo -e "${CYAN}🔧 Puzzle Fix Utility${NC}"
    echo "===================="
    
    echo -e "${BLUE}Checking for 0-byte puzzle files...${NC}"
    
    local fixed_count=0
    local total_checked=0
    
    # 查找所有临时目录中的0字节文件
    for dir in ${BASE_DIR}/*/; do
        if [[ $dir == *"puzzle"* ]] && [ -d "$dir" ]; then
            echo "Checking directory: $(basename "$dir")"
            
            for file in "$dir"/*.json; do
                if [ -f "$file" ] && [ ! -s "$file" ]; then
                    total_checked=$((total_checked + 1))
                    echo "Found 0-byte file: $(basename "$file")"
                    
                    # 尝试从文件名提取信息重新生成
                    if [[ $(basename "$file") =~ puzzle_([0-9]+)x[0-9]+_([a-z]+)_[0-9]+\.json ]]; then
                        size="${BASH_REMATCH[1]}"
                        difficulty="${BASH_REMATCH[2]}"
                        
                        echo "  Attempting to regenerate ${size}x${size} ${difficulty}..."
                        
                        if generate_single_puzzle "$size" "$difficulty" "fix" > /dev/null; then
                            # 用新生成的内容替换损坏的文件
                            mv "${TEMP_DIR}/puzzle_${size}x${size}_${difficulty}_001.json" "$file" 2>/dev/null && {
                                fixed_count=$((fixed_count + 1))
                                echo "  ✅ Fixed"
                            }
                        else
                            echo "  ❌ Failed to regenerate"
                        fi
                    fi
                fi
            done
        fi
    done
    
    if [ $total_checked -eq 0 ]; then
        echo -e "${GREEN}✅ No corrupted files found${NC}"
    else
        echo -e "${GREEN}🔧 Fixed: $fixed_count/$total_checked files${NC}"
    fi
}

# 清理所有临时文件和目录
clean_all() {
    echo -e "${CYAN}🧹 Cleanup Utility${NC}"
    echo "=================="
    
    local cleaned_dirs=0
    local cleaned_files=0
    
    # 清理临时目录
    for dir in ${BASE_DIR}/*/; do
        local dir_name=$(basename "$dir")
        if [[ $dir_name =~ ^(generated_puzzles|additional_puzzles|custom_puzzle|daily_challenge|comprehensive_puzzles)_[0-9]{8}_[0-9]{6}$ ]]; then
            echo "Removing directory: $dir_name"
            rm -rf "$dir"
            cleaned_dirs=$((cleaned_dirs + 1))
        fi
    done
    
    # 清理临时文件
    for file in ${BASE_DIR}/*.tmp ${BASE_DIR}/*.log; do
        if [ -f "$file" ]; then
            echo "Removing file: $(basename "$file")"
            rm -f "$file"
            cleaned_files=$((cleaned_files + 1))
        fi
    done
    
    echo -e "${GREEN}🗑️  Cleaned: $cleaned_dirs directories, $cleaned_files files${NC}"
}

# 解析命令行参数
parse_arguments() {
    COMMAND=""
    COUNT=""
    SIZE=""
    DIFFICULTY=""
    KEEP_FILES="false"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            daily|custom|fix|clean|status|help)
                COMMAND="$1"
                shift
                ;;
            --count)
                COUNT="$2"
                shift 2
                ;;
            --size)
                SIZE="$2"
                shift 2
                ;;
            --diff)
                DIFFICULTY="$2"
                shift 2
                ;;
            --keep)
                KEEP_FILES="true"
                shift
                ;;
            *)
                echo -e "${RED}Unknown option: $1${NC}"
                show_help
                exit 1
                ;;
        esac
    done
    
    if [ -z "$COMMAND" ]; then
        show_help
        exit 0
    fi
}

# 主函数
main() {
    parse_arguments "$@"
    
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════╗"
    echo "║        🧩 Slitherlink Puzzle Manager         ║"
    echo "╚══════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    case $COMMAND in
        help)
            show_help
            ;;
        status)
            show_status
            ;;
        clean)
            clean_all
            ;;
        fix)
            check_dependencies
            check_algorithm_service
            fix_puzzles
            ;;
        daily)
            check_dependencies
            check_algorithm_service
            daily_challenge_replenish "${COUNT:-30}"
            ;;
        custom)
            check_dependencies
            check_algorithm_service
            custom_puzzle_replenish "${COUNT:-50}" "${SIZE:-all}" "${DIFFICULTY:-all}"
            ;;
        *)
            echo -e "${RED}Unknown command: $COMMAND${NC}"
            show_help
            exit 1
            ;;
    esac
}

# 错误处理
trap 'echo -e "${RED}Script interrupted${NC}"; cleanup "$KEEP_FILES"; exit 1' INT TERM

# 启动脚本
main "$@"