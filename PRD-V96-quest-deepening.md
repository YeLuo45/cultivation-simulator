# PRD-V96: Quest深化 + NPC协作任务链 + 五层记忆结晶

## 概述

V96在V95多智能体编排任务系统基础上，实现Quest深化+NPC协作任务链+五层记忆结晶功能。

## 核心功能

### 1. NPC协作任务链 (quest.chain)

**quest.chain.create**: 创建NPC协作任务链，支持多NPC并行
- 输入: chainId, name, npcs[], nodes[], hooks[]
- 验证所有NPC已存在
- 构建DAG图，支持并行节点
- 循环检测
- 触发quest_start hook

**quest.chain.execute**: 执行任务链，支持NPC协作状态同步
- 输入: chainId, context, maxConcurrent, syncMode
- 基于DAG执行器获取可执行节点
- 预算感知执行
- 触发quest_complete/quest_fail hook

**quest.state.query**: 查询任务链状态
- 输入: chainId, includeNpcs, includeBudget
- 返回链状态、NPC协作信息、预算信息

### 2. 五层记忆结晶 (npc.skill)

**npc.skill.crystallize**: 将NPC经验结晶为SOP技能
- 输入: npcId, experienceData, layer, tags, skillName
- 只支持L3层（任务技能）
- 在NPC L3存储，在L1建立索引
- 在全局skillRegistry注册，供其他NPC调用

**npc.skill.invoke**: 调用结晶的NPC技能(SOP)
- 输入: npcId, skillId, params, budget
- 预算检查
- 执行技能，记录到L4归档

### 3. Hook事件驱动 (hook.trigger)

**hook.trigger**: 手动触发Hook事件
- 输入: event, context, source
- 触发注册的hook回调

## 6个MCP工具

| 工具名 | 功能 |
|--------|------|
| quest.chain.create | 创建NPC协作任务链 |
| quest.chain.execute | 执行任务链 |
| npc.skill.crystallize | 将NPC经验结晶为SOP |
| npc.skill.invoke | 调用结晶的技能 |
| hook.trigger | 手动触发Hook事件 |
| quest.state.query | 查询任务链状态 |

## 五层记忆架构

| 层级 | 内容 | 说明 |
|------|------|------|
| L0 | Meta规则 | 行为准则 |
| L1 | 洞察索引 | 技能索引 |
| L2 | 全局事实 | 已知信息 |
| L3 | 任务技能 | 可结晶为SOP |
| L4 | 会话归档 | 调用记录 |

## 技术实现

- 基于V95 DAG执行器
- 基于V94 ai_budget预算系统
- Hook引擎事件驱动
- skillRegistry全局注册表

## 交付清单

- [x] MCP_TOOLS_V96常量定义（6个工具）
- [x] initToolRegistry注册V96
- [x] callTool的switch case
- [x] 6个MCP方法实现
- [x] TDD测试用例（v96.test.js, v96_runner.mjs）
- [x] 构建验证（build_vite.js）
- [x] git add → commit → push