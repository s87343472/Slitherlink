#!/bin/bash

# 数据库备份脚本 - Slitherlink生产环境
# 此脚本创建PostgreSQL数据库备份并管理备份文件

set -e

# 配置变量 (可通过环境变量覆盖)
DB_NAME="${DB_NAME:-slitherlink_prod}"
DB_USER="${DB_USER:-slitherlink_user}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/slitherlink}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

# 备份文件命名
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/slitherlink_backup_$TIMESTAMP.sql"
COMPRESSED_FILE="$BACKUP_FILE.gz"

echo "=== Slitherlink数据库备份 ==="
echo "时间: $(date)"
echo "数据库: $DB_NAME"
echo "备份目录: $BACKUP_DIR"
echo ""

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 检查磁盘空间
echo "检查磁盘空间..."
AVAILABLE_SPACE=$(df "$BACKUP_DIR" | tail -1 | awk '{print $4}')
if [ "$AVAILABLE_SPACE" -lt 1048576 ]; then  # 小于1GB
    echo "警告: 备份目录可用空间不足1GB"
fi

# 执行数据库备份
echo "开始备份数据库..."
if PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --verbose \
    --clean \
    --no-owner \
    --no-privileges \
    > "$BACKUP_FILE" 2>/dev/null; then
    
    echo "数据库备份成功: $BACKUP_FILE"
    
    # 压缩备份文件
    echo "压缩备份文件..."
    gzip "$BACKUP_FILE"
    echo "压缩完成: $COMPRESSED_FILE"
    
    # 显示备份文件信息
    BACKUP_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
    echo "备份文件大小: $BACKUP_SIZE"
    
else
    echo "错误: 数据库备份失败"
    rm -f "$BACKUP_FILE"
    exit 1
fi

# 清理旧备份文件
echo ""
echo "清理超过 $RETENTION_DAYS 天的旧备份..."
find "$BACKUP_DIR" -name "slitherlink_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
REMAINING_BACKUPS=$(find "$BACKUP_DIR" -name "slitherlink_backup_*.sql.gz" | wc -l)
echo "当前保留备份数量: $REMAINING_BACKUPS"

# 验证备份文件
echo ""
echo "验证备份文件完整性..."
if gzip -t "$COMPRESSED_FILE"; then
    echo "备份文件完整性验证通过"
else
    echo "错误: 备份文件损坏"
    exit 1
fi

# 创建备份日志
LOG_FILE="$BACKUP_DIR/backup.log"
echo "$(date '+%Y-%m-%d %H:%M:%S') - 备份成功: $COMPRESSED_FILE (大小: $BACKUP_SIZE)" >> "$LOG_FILE"

echo ""
echo "=== 备份完成 ==="
echo "备份文件: $COMPRESSED_FILE"
echo "备份大小: $BACKUP_SIZE"
echo "日志文件: $LOG_FILE"
echo ""

# 可选: 上传到云存储 (取消注释并配置)
# echo "上传备份到云存储..."
# aws s3 cp "$COMPRESSED_FILE" s3://your-backup-bucket/slitherlink/ || echo "云存储上传失败"

exit 0