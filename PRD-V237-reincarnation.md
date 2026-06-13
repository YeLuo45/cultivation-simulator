# PRD: cultivation-simulator V237 天道轮回系统

## 项目信息
- **项目**: cultivation-simulator (PRJ-20260516-002)
- **提案ID**: P-20260531-016
- **版本**: V237
- **方向**: Direction Y (thunderbolt + nanobot)
- **目标**: 实现完整的天道轮回系统

## 功能需求

### 1. 天道轮回核心机制
- 轮回转世、记忆继承
- 轮回次数、因果累积
- 轮回奖励与惩罚

### 2. MCP工具
- `reincarnate.perform()` - 执行轮回转世
- `reincarnate.query()` - 查询轮回状态
- `reincarnate.bless()` - 轮回祝福发放
- `reincarnate.karma()` - 查询因果值

### 3. 测试要求
- TDD测试用例 >= 40项
- 通过率 100%
- 覆盖率 >= 98%

## 技术约束
- DDD模块化：src/domains/cultivation/services/ReincarnationService.js
- 构建：node build_src.js

## 交付物
- ReincarnationService.js
- 对应测试文件
- 构建通过
- push到 feat/V244-spirit-beast