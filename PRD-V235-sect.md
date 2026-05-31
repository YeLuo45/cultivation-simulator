# PRD: cultivation-simulator V235 仙盟系统

## 项目信息
- **项目**: cultivation-simulator (PRJ-20260516-002)
- **提案ID**: P-20260531-014
- **版本**: V235
- **方向**: Direction W (chatdev + thunderbolt)
- **目标**: 实现完整的仙盟系统

## 功能需求

### 1. 仙盟核心机制
- 仙盟创建、加入、离开
- 仙盟等级、成员管理
- 仙盟技能、资源库

### 2. MCP工具
- `sect.create(name)` - 创建仙盟
- `sect.join(sectId)` - 加入仙盟
- `sect.leave()` - 离开仙盟
- `sect.promote(memberId, rank)` - 晋升成员
- `sect.skillLearn(skillId)` - 学习仙盟技能
- `sect.query()` - 查询仙盟状态

### 3. 测试要求
- TDD测试用例 >= 40项
- 通过率 100%
- 覆盖率 >= 98%

## 技术约束
- DDD模块化：src/domains/cultivation/services/SectService.js
- 构建：node build_src.js

## 交付物
- SectService.js
- 对应测试文件
- 构建通过
- push到 feat/V244-spirit-beast