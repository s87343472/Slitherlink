# 🔧 Scripts Directory

这个目录包含了Slitherlink平台的各种管理和实用脚本。

## 📋 脚本清单

### 🧩 题目管理
- **`puzzle-manager.sh`** - 统一题目管理脚本
  - 题目生成、导入、修复、清理
  - 库存管理和状态监控
  - 详细使用说明见主README

### 🧪 测试工具
- **`test-complete-platform.sh`** - 完整平台测试
  - 端到端功能测试
  - 服务健康检查
  - 集成测试验证

### 🗂️ 数据管理
- **`cleanup-temporary-files.sh`** - 临时文件清理
- **`manage-puzzles.sh`** - 题目库管理工具
- **`update-puzzle-types.js`** - 题目类型更新脚本

### 📅 定时任务
- **`generate-weekly-challenges.js`** - 每周挑战生成
- **`crontab-config.txt`** - Crontab配置模板

## 🚀 使用方法

从项目根目录运行脚本：

```bash
# 题目管理
./scripts/puzzle-manager.sh status

# 平台测试
./scripts/test-complete-platform.sh

# 清理临时文件
./scripts/cleanup-temporary-files.sh
```

## ⚠️ 注意事项

1. **权限设置**：确保脚本有执行权限
   ```bash
   chmod +x scripts/*.sh
   ```

2. **依赖检查**：运行前确保相关服务已启动
   - PostgreSQL数据库
   - 算法服务（如需要）

3. **路径要求**：脚本需要从项目根目录执行

## 📝 脚本开发规范

新增脚本时请遵循以下规范：

1. **命名规范**：使用清晰的描述性名称
2. **错误处理**：包含完善的错误处理逻辑
3. **帮助信息**：提供 `--help` 选项
4. **日志记录**：重要操作需要记录日志
5. **依赖检查**：开始执行前检查所需依赖