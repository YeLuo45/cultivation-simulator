## 版本: V99
## 方向: 天道编辑器 - DAG任务链系统
## 日期: 2026-05-27

## 1. 概念与愿景

天道编辑器是掌控天道法则的核心工具，允许玩家/修士创建、编辑和执行基于有向无环图（DAG）的任务链。六大工具覆盖任务链的全生命周期：从创建、节点添加、依赖链接、执行调度、状态监控到结果收集。模拟天道运转的规律——因果链式、环环相扣、并行不悖。

## 2. 技术架构

### DAG特性
- 有向无环图（Directed Acyclic Graph）
- 支持并行任务调度
- 拓扑排序执行
- 节点状态追踪

### 六大工具

| 工具名 | 功能 | 核心参数 |
|--------|------|----------|
| task.chain.create | 创建新任务链 | name, description, initialNodes |
| task.chain.add | 添加任务节点 | chainId, taskId, taskType, payload |
| task.chain.link | 创建任务依赖 | chainId, fromTaskId, toTaskId, condition |
| task.chain.execute | 执行任务链 | chainId, context, parallelMode |
| task.chain.status | 查询执行状态 | chainId, includeSubtasks |
| task.chain.result | 获取执行结果 | chainId, format |

## 3. 工具详细设计

### task.chain.create
```javascript
{
  name: 'task.chain.create',
  description: 'Create a new DAG task chain (天道编辑器-创建任务链)',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Task chain name' },
      description: { type: 'string', description: 'Chain description' },
      priority: { type: 'string', description: 'Priority: low|normal|high|critical', default: 'normal' }
    },
    required: ['name']
  }
}
```

### task.chain.add
```javascript
{
  name: 'task.chain.add',
  description: 'Add task nodes to an existing DAG chain (天道编辑器-添加节点)',
  inputSchema: {
    type: 'object',
    properties: {
      chainId: { type: 'string', description: 'Chain ID' },
      taskId: { type: 'string', description: 'Unique task ID' },
      taskType: { type: 'string', description: 'Task type: action|condition|transform|merge' },
      payload: { type: 'object', description: 'Task payload data' },
      position: { type: 'object', description: 'Visual position {x, y}' }
    },
    required: ['chainId', 'taskId', 'taskType']
  }
}
```

### task.chain.link
```javascript
{
  name: 'task.chain.link',
  description: 'Create dependencies between tasks in a DAG chain (天道编辑器-链接依赖)',
  inputSchema: {
    type: 'object',
    properties: {
      chainId: { type: 'string', description: 'Chain ID' },
      fromTaskId: { type: 'string', description: 'Source task ID' },
      toTaskId: { type: 'string', description: 'Target task ID (dependent on source)' },
      condition: { type: 'string', description: 'Link condition: always|success|failure', default: 'success' }
    },
    required: ['chainId', 'fromTaskId', 'toTaskId']
  }
}
```

### task.chain.execute
```javascript
{
  name: 'task.chain.execute',
  description: 'Execute a DAG task chain with topological sort (天道编辑器-执行链)',
  inputSchema: {
    type: 'object',
    properties: {
      chainId: { type: 'string', description: 'Chain ID to execute' },
      context: { type: 'object', description: 'Execution context data' },
      parallelMode: { type: 'boolean', description: 'Enable parallel execution for independent tasks', default: true }
    },
    required: ['chainId']
  }
}
```

### task.chain.status
```javascript
{
  name: 'task.chain.status',
  description: 'Query real-time execution status of a DAG chain (天道编辑器-状态监控)',
  inputSchema: {
    type: 'object',
    properties: {
      chainId: { type: 'string', description: 'Chain ID' },
      includeSubtasks: { type: 'boolean', description: 'Include detailed subtask status', default: true }
    },
    required: ['chainId']
  }
}
```

### task.chain.result
```javascript
{
  name: 'task.chain.result',
  description: 'Get execution results after chain completion (天道编辑器-结果收集)',
  inputSchema: {
    type: 'object',
    properties: {
      chainId: { type: 'string', description: 'Chain ID' },
      format: { type: 'string', description: 'Result format: summary|detailed|json', default: 'summary' }
    },
    required: ['chainId']
  }
}
```

## 4. DAG执行引擎

### 拓扑排序（Kahn算法）
1. 计算所有节点的入度
2. 将入度为0的节点加入队列
3. 依次出队执行，更新依赖节点的入度
4. 重复直到队列为空或检测到环

### 并行执行
- 同一层的入度为0节点可并行执行
- 使用Promise.all模拟并发
- 最大并行度限制：5

### 状态机
- pending → running → completed/failed
- 每个节点独立追踪状态

## 5. 数据结构

```javascript
window.gameState.taskChains = {
  [chainId]: {
    id: chainId,
    name: string,
    description: string,
    priority: string,
    status: 'idle'|'running'|'completed'|'failed',
    createdAt: timestamp,
    nodes: {
      [taskId]: {
        id: taskId,
        type: 'action'|'condition'|'transform'|'merge',
        payload: object,
        status: 'pending'|'running'|'completed'|'failed',
        dependencies: [taskId],
        dependents: [taskId],
        result: any,
        executedAt: timestamp
      }
    },
    executionOrder: [taskId],
    results: []
  }
};
```

## 6. 测试用例

- 创建任务链并验证初始状态
- 添加多个节点并验证DAG结构
- 创建循环依赖时检测错误
- 执行链并验证拓扑排序
- 并行执行独立任务
- 查询状态并验证实时性
- 获取结果并验证完整性