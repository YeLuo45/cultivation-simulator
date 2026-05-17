# V30 渡劫审批系统 (Plan Review Gate)

## 需求概述
为 cultivation-simulator 实现 V30 渡劫审批系统 —— 多步骤 NPC 审批门控机制。在玩家突破化神（realm≥3）前，必须经过宗门 NPC 审批，模拟修仙界"渡劫需有师长见证"的设定，防止盲目送死。

## 核心设计
借鉴：
- **ChatDev 角色协作**：CEO审批→CTO评估→程序员执行
- **Multi-agent Plan Review Gate**：关键节点前插入审批层
- **generic-agent 状态机**：Plan→Review→Execute→Accept 多阶段

**渡劫审批流程**（4步链式）：
1. **弟子申请** (Player) → 提交渡劫申请书（含当前装备/心态/丹药准备）
2. **长老初审** (Elder NPC) → 检查装备等级、心态值、渡劫丹数量，给出"条件评估"
3. **掌门审批** (Leader NPC) → 基于长老评估决定"批准/驳回"，附带条件
4. **执行/结果** → 批准后进入渡劫UI；驳回后显示缺失条件和提升建议

## 功能拆解

### 1. 渡劫申请界面 (tribulation-request)
- 显示玩家当前准备状态（装备/心态/丹药/历史成功率）
- 提供"提交审批"按钮
- 显示审批进度（长老审核中... → 掌门审批中...）

### 2. NPC审批逻辑
```
Elder Review:
  - 检查装备评分 (quality ≥ rare? +1分)
  - 检查心态值 (mindset ≥ 60? +1分)
  - 检查渡劫丹 (有 渡劫丹 ×1? +1分)
  - 检查历史成功率 (tribulationsCompleted > 0? +1分)
  - 评分 ≥ 3 → "条件具备" → Leader
  - 评分 < 3 → "条件不足" → 列出缺失项 → Player

Leader Decision:
  - Elder评分 ≥ 3 → 批准（含祝福buff：渡劫成功率+5%）
  - Elder评分 < 3 → 驳回（需满足X条件）
```

### 3. 审批状态存储
```javascript
gameState.tribulationRequest = {
  status: 'none' | 'pending_elder' | 'pending_leader' | 'approved' | 'rejected',
  elderScore: 0,
  elderComment: '',
  leaderDecision: '',
  leaderComment: '',
  buffApplied: false,
  submitDay: 0
}
```

### 4. UI集成
- 境界≥3时，"突破"按钮改为"申请渡劫审批"
- 审批通过后，在渡劫UI中显示"+5%成功率"祝福
- 驳回后，UI显示具体缺失条件和NPC建议

## 验收标准
1. 境界<3时，点击突破不受审批影响（向后兼容）
2. 境界≥3时，必须完成审批流程才能进入渡劫
3. 长老审批输出可读评论（"装备尚可，心态偏低"）
4. 掌门批准时给成功率高/低的具体理由
5. NPC对话历史记录审批过程（V29 NPC对话系统）
6. 审批通过后，渡劫结算成功率+5%buff（显示在结算界面）