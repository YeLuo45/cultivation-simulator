# PRD: cultivation-simulator V236 仙缘探宝系统

## 项目信息
- **项目**: cultivation-simulator (PRJ-20260516-002)
- **提案ID**: P-20260531-015
- **版本**: V236
- **方向**: Direction X (generic-agent + ruflo)
- **目标**: 实现完整的仙缘探宝系统

## 功能需求

### 1. 仙缘探宝核心机制
- 秘境探索、宝藏发现
- 宝藏品质（普通/精良/稀有/传说/神话）
- 探索消耗与收益

### 2. MCP工具
- `treasure.explore(realmId)` - 探索秘境
- `treasure.open(chestId)` - 开启宝箱
- `treasure.query()` - 查询宝藏状态
- `treasure.upgrade()` - 升级探索等级

### 3. 测试要求
- TDD测试用例 >= 40项
- 通过率 100%
- 覆盖率 >= 98%

## 技术约束
- DDD模块化：src/domains/cultivation/services/TreasureService.js
- 构建：node build_src.js

## 交付物
- TreasureService.js
- 对应测试文件
- 构建通过
- push到 feat/V244-spirit-beast