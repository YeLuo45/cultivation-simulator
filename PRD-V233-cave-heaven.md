# PRD: cultivation-simulator V233 灵界洞府系统

## 项目信息
- **项目**: cultivation-simulator (PRJ-20260516-002)
- **提案ID**: P-20260531-003
- **版本**: V233
- **方向**: Direction U (claude-code + ruflo)
- **目标**: 实现完整的灵界洞府系统

## 功能需求

### 1. 灵界洞府核心机制
- 洞府创建、升级、管理
- 洞府资源产出（灵气、药材、矿石）
- 洞府设施建设

### 2. MCP工具
- `caveheaven.create()` - 创建洞府
- `caveheaven.upgrade()` - 升级洞府
- `caveheaven.collect()` - 采集产出
- `caveheaven.build()` - 建造设施

### 3. 测试要求
- TDD测试用例 >= 40项
- 通过率 100%
- 覆盖率 >= 98%

## 技术约束
- DDD模块化：src/domains/cultivation/services/CaveHeavenService.js（已存在）
- 构建：node build_src.js

## 交付物
- CaveHeavenService.js 增强
- 对应测试文件
- 构建通过
- push到 feat/V244-spirit-beast