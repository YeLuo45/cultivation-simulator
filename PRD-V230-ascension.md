# PRD: cultivation-simulator V230 飞升系统

## 项目信息
- **项目**: cultivation-simulator (PRJ-20260516-002)
- **提案ID**: P-20260530-078
- **版本**: V230
- **方向**: Direction R (generic-agent + thunderbolt)
- **目标**: 实现完整的飞升系统

## 功能需求

### 1. 飞升条件检测
- 角色境界达到渡劫期（炼虚合道后期）
- 积累足够的灵气值（>= 999999）
- 完成天劫试炼

### 2. 飞升流程
- 检测飞升条件
- 触发天劫场景
- 飞升成功 → 进入仙界
- 飞升失败 → 陨落或重伤

### 3. 仙界入口
- 飞升成功后开启仙界地图
- 创建仙界角色数据
- 仙界区域解锁

### 4. MCP工具
- `ascension.check()` - 检测飞升条件
- `ascension.process()` - 执行飞升
- `ascension.result()` - 获取飞升结果

## 测试要求
- TDD测试用例 >= 40项
- 通过率 100%
- 覆盖率 >= 98%

## 技术约束
- DDD模块化：src/domains/cultivation/services/AscensionService.js
- 使用已有 spirit_root/realm 数据结构
- 构建：node build_src.js
- 测试：vitest 或 node --check

## 交付物
- AscensionService.js
- 对应测试文件
- 构建通过
- push到 feat/V244-spirit-beast