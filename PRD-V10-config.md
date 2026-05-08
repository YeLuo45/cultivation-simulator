# 修仙模拟器 V10 — MiniMax 配置面板

## 1. 概述与愿景

参考 Hermes 的 MiniMax 配置设计，为修仙模拟器新增独立的 MiniMax API 配置面板。玩家可手动输入 API Key 和模型选择，所有配置项支持默认值，提供接口测试链接以便验证配置是否正确。

## 2. 配置项

### 2.1 API 配置
| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| API Key | 空 | MiniMax API 密钥 |
| Base URL | https://api.minimax.chat | API 基础地址 |
| Model | MiniMax-Text-01 | 选择的模型 |
| API Group ID | 空 | MiniMax Group ID |

### 2.2 模型选项
- MiniMax-Text-01
- MiniMax-Text-01-32K
- MiniMax-Text-01-128K
- MiniMax-Embedding-01

### 2.3 功能开关
| 开关 | 默认 | 说明 |
|------|------|------|
| AI 对话 | 关闭 | 是否启用 AI 智能NPC对话 |
| AI 生成奇遇 | 关闭 | AI 生成随机奇遇事件 |
| AI 生成功法 | 关闭 | AI 生成新功法名称描述 |

## 3. 接口测试

### 3.1 测试按钮
- 每个配置项旁边有"测试"链接
- 点击后显示测试结果（成功/失败及错误信息）

### 3.2 测试反馈
- 成功：绿色提示 + 响应时间
- 失败：红色提示 + 错误代码 + 错误信息

## 4. UI设计

### 4.1 配置入口
- 主界面新增"⚙️ 设置"按钮
- 点击打开设置模态框

### 4.2 设置面板
- 左侧导航：API配置/功能开关/关于
- 右侧内容：根据导航显示对应配置

### 4.3 输入框
- 所有输入框支持手动输入
- 有默认值提示占位符
- 敏感信息（API Key）显示为密码类型

### 4.4 保存与重置
- 保存按钮：保存配置到 localStorage
- 重置按钮：恢复默认配置

## 5. 数据结构

```javascript
gameState.config = {
  miniMax: {
    apiKey: '',
    baseUrl: 'https://api.minimax.chat',
    model: 'MiniMax-Text-01',
    groupId: '',
    features: {
      aiDialogue: false,
      aiSerendipity: false,
      aiTechnique: false
    }
  }
}
```

## 6. 验收标准

- [ ] 配置面板可通过设置按钮打开
- [ ] API Key 输入框支持手动输入，密码遮罩
- [ ] Base URL / Model / Group ID 均可手动输入
- [ ] 所有输入框有默认值
- [ ] 测试链接可点击并显示测试结果
- [ ] 配置保存到 localStorage
- [ ] 重置按钮恢复默认配置
- [ ] 关闭不影响游戏其他功能