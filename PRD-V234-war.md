# PRD: cultivation-simulator V234 万界战争系统

## 项目信息
- **项目**: cultivation-simulator (PRJ-20260516-002)
- **提案ID**: P-20260531-013
- **版本**: V234
- **方向**: Direction V (generic-agent + nanobot)
- **目标**: 实现完整的万界战争系统

## 功能需求

### 1. 万界战争核心机制
- 世界宣战、战争期间
- 战争动员、资源消耗
- 战争结果、胜败判定

### 2. MCP工具
- `war.declare(worldId, reason)` - 宣战
- `war.mobilize(armySize)` - 动员军队
- `war.battle()` - 发起战斗
- `war.result()` - 获取战争结果

### 3. 测试要求
- TDD测试用例 >= 40项
- 通过率 100%
- 覆盖率 >= 98%

## 技术约束
- DDD模块化：src/domains/cultivation/services/WarService.js
- 构建：node build_src.js

## 交付物
- WarService.js
- 对应测试文件
- 构建通过
- push到 feat/V244-spirit-beast