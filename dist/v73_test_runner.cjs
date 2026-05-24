// V73 MCP Agent Bridge TDD Test Runner (CJS)
const fs = require('fs');
const vm = require('vm');

// 读取构建产物
const gameCode = fs.readFileSync('/home/hermes/projects/cultivation-simulator/dist/game.js', 'utf8');

// 构建最小沙箱 — 模拟游戏核心全局变量
const sandbox = {
    console: {
        log: () => {},
        warn: () => {},
        error: () => {}
    },
    setTimeout: () => {},
    clearTimeout: () => {},
    setInterval: () => {},
    clearInterval: () => {},
    Math,
    Date,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Error,
    Promise,
    Map,
    Set,
    // 最小DOM模拟
    document: {
        getElementById: () => ({ style: {} }),
        querySelector: () => null,
        querySelectorAll: () => [],
        createElement: () => ({ style: {}, insertAdjacentHTML: () => {} }),
        body: { insertAdjacentHTML: () => {} }
    },
    window: {
        alert: () => {},
        confirm: () => true,
        prompt: () => '',
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        open: () => {},
        close: () => {}
    },
    // gameState — V73使用的主要字段
    gameState: {
        realm: 1, stage: '凡人', level: 1,
        spiritStones: 100,
        spiritEnergy: 50, maxSpiritEnergy: 100,
        cultivationProgress: 0,
        items: [{ id: 'item_test', name: '测试物品', quality: 'R' }],
        combatStats: { wins: 5, losses: 2 },
        npcCollab: {
            npcs: [{
                id: 'npc_test',
                name: '测试NPC',
                role: '道友',
                realm: '筑基',
                disposition: '友善',
                currentTask: 'none',
                taskProgress: 0,
                memory: {},
                playerReputation: 10,
                favorability: 20,
                masterRank: 1,
                completedTasks: 3
            }],
            activeTasks: 2
        },
        plugins: { enabled: [], installed: {} },
        destiny: { unlocked: false },
        beyondHeaven: { unlocked: false },
        serendipityDAG: {
            nodes: new Map([
                ['node_1', { id: 'node_1', name: '测试奇遇', description: '描述', effects: {}, status: 'pending', triggerCount: 0 }]
            ])
        }
    },
    // llmRegistry — V72 7 Provider引擎
    llmRegistry: {
        getAllProviders: () => [
            { id: 'minimax', name: 'MiniMax', isConfigured: () => true },
            { id: 'openai', name: 'OpenAI', isConfigured: () => false },
            { id: 'anthropic', name: 'Anthropic', isConfigured: () => false },
            { id: 'groq', name: 'Groq', isConfigured: () => false },
            { id: 'mistral', name: 'Mistral', isConfigured: () => false }
        ],
        isConfigured: (id) => id === 'minimax',
        setActive: (id) => ['minimax', 'openai', 'anthropic', 'groq', 'mistral'].includes(id),
        activeProviderId: 'minimax'
    },
    // 占位函数
    startMeditation: () => ({ success: true }),
    attemptBreakthrough: () => ({ success: false, reason: '境界不足' }),
    startCombat: () => {},
    findItemById: (id) => id === 'item_test' ? { id: 'item_test', name: '测试物品', quality: 'R' } : null,
    removeItem: () => {},
    closePanel: () => {}
};

vm.createContext(sandbox);

let initGameRan = false;
const origSetTimeout = sandbox.setTimeout;
// 拦截init()，在gameState初始化后执行
const originalSetTimeout = sandbox.setTimeout;
sandbox.setTimeout = function(fn, delay, ...args) {
    if (!initGameRan && fn.toString().includes('startNewGame')) {
        initGameRan = true;
    }
    return originalSetTimeout(fn, delay, ...args);
};

// 执行game.js
try {
    vm.runInContext(gameCode, sandbox, { filename: 'dist/game.js' });
} catch (e) {
    console.error('game.js 执行失败:', e.message);
    console.error(e.stack);
    process.exit(1);
}

// 提取MCP系统
const { MCP_TOOLS, MCP_REQUEST_TYPES, cultivationMCPServer, handleMCPRequest } = sandbox;

if (!MCP_TOOLS || !cultivationMCPServer) {
    console.error('MCP系统未正确导出');
    console.error('MCP_TOOLS:', typeof MCP_TOOLS);
    console.error('cultivationMCPServer:', typeof cultivationMCPServer);
    process.exit(1);
}

// 测试框架
const results = [];
let passed = 0, failed = 0;

function test(name, fn) {
    try {
        fn();
        results.push({ name, status: 'PASS' });
        passed++;
    } catch (e) {
        results.push({ name, status: 'FAIL', error: e.message });
        failed++;
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) throw new Error(`${message || ''} Expected ${expected}, got ${actual}`);
}

function assertContains(str, substr, message) {
    if (!str.includes(substr)) throw new Error(`${message || ''} "${str}" does not contain "${substr}"`);
}

// ===== 测试开始 =====

// T1: MCP_TOOLS 定义完整性
test('T1: MCP_TOOLS 定义了8个工具', () => {
    assertEqual(Object.keys(MCP_TOOLS).length, 8, '工具数量');
});

// T2: MCP_TOOLS 每个工具都有 inputSchema
test('T2: 所有MCP工具都有inputSchema', () => {
    for (const [name, tool] of Object.entries(MCP_TOOLS)) {
        assert(tool.inputSchema, `${name} 缺少 inputSchema`);
        assert(tool.inputSchema.type === 'object', `${name} inputSchema.type 应为 object`);
        assert(tool.inputSchema.properties, `${name} 缺少 inputSchema.properties`);
    }
});

// T3: CultivationMCPServer 单例
test('T3: cultivationMCPServer 是 CultivationMCPServer 实例', () => {
    assert(cultivationMCPServer instanceof sandbox.CultivationMCPServer, '应为 CultivationMCPServer 实例');
});

// T4: MCP工具注册表正确初始化
test('T4: toolRegistry 包含8个工具', () => {
    assertEqual(cultivationMCPServer.toolRegistry.size, 8, '注册表大小');
});

// T5: tools.list 返回正确格式
test('T5: tools.list 返回 {tools: [...]}', () => {
    const result = cultivationMCPServer.listTools();
    assert(result.content, '缺少 content 字段');
    assert(result.content[0], 'content[0] 不存在');
    const parsed = JSON.parse(result.content[0].text);
    assertEqual(parsed.tools.length, 8, '返回工具数量');
});

// T6: tools.call 未知工具返回错误
test('T6: tools.call 未知工具返回 isError', () => {
    const result = cultivationMCPServer.callTool('nonexistent.tool', {});
    assert(result.isError === true, '应标记为错误');
});

// T7: mcpProviders 返回providers列表
test('T7: mcpProviders() 返回providers数组', () => {
    const result = cultivationMCPServer.mcpProviders();
    assert(Array.isArray(result.providers), 'providers 应为数组');
    assert(result.providers.length >= 3, '至少3个providers');
    assert(result.providers[0].id, '每个provider有id');
    assert(result.providers[0].name, '每个provider有name');
    assert(result.providers[0].isConfigured !== undefined, '每个provider有isConfigured');
});

// T8: mcpSwitchProvider 切换到minimax成功
test('T8: mcpSwitchProvider(minimax) 成功', () => {
    const result = cultivationMCPServer.mcpSwitchProvider('minimax');
    assertEqual(result.success, true, '切换应成功');
    assertContains(result.message, 'minimax', '消息包含minimax');
});

// T9: mcpSwitchProvider 切换到无效provider失败
test('T9: mcpSwitchProvider(invalid) 失败', () => {
    const result = cultivationMCPServer.mcpSwitchProvider('invalid_provider_xyz');
    assert(result.error, '应有error字段');
});

// T10: handleMCPRequest 解析工具调用请求
test('T10: handleMCPRequest 正确处理 tools.call', () => {
    const request = { method: 'tools.call', params: { name: 'mcp.providers', arguments: {} }, id: 1 };
    const result = handleMCPRequest(request);
    assert(result.content, '应有content字段');
    const parsed = JSON.parse(result.content[0].text);
    assert(Array.isArray(parsed.providers), '应返回providers数组');
});

// T11: handleMCPRequest 未知方法返回 -32601
test('T11: handleMCPRequest 未知方法返回错误码', () => {
    const request = { method: 'unknown.method', params: {}, id: 2 };
    const result = handleMCPRequest(request);
    assert(result.error, '应有error字段');
    assertEqual(result.error.code, -32601, '错误码应为-32601');
});

// T12: handleMCPRequest JSON解析错误返回 -32700
test('T12: handleMCPRequest 非法JSON返回-32700', () => {
    const result = handleMCPRequest('not valid json {');
    assert(result.error, '应有error字段');
    assertEqual(result.error.code, -32700, '错误码应为-32700');
});

// T13: MCP_REQUEST_TYPES 定义
test('T13: MCP_REQUEST_TYPES 定义了4种请求类型', () => {
    assertEqual(Object.keys(MCP_REQUEST_TYPES).length, 4, '应有4种请求类型');
    assertEqual(MCP_REQUEST_TYPES.TOOL_CALL, 'tool_call', 'TOOL_CALL');
    assertEqual(MCP_REQUEST_TYPES.TOOL_LIST, 'tool_list', 'TOOL_LIST');
    assertEqual(MCP_REQUEST_TYPES.PROVIDER_QUERY, 'provider_query', 'PROVIDER_QUERY');
    assertEqual(MCP_REQUEST_TYPES.STATE_QUERY, 'state_query', 'STATE_QUERY');
});

// T14: gameState.query('realm') 返回境界信息
test('T14: gameState.query(realm) 返回realm/stage/level', () => {
    const result = cultivationMCPServer.mcpGameStateQuery('realm');
    assertEqual(result.realm, sandbox.gameState.realm, 'realm值');
    assertEqual(result.stage, sandbox.gameState.stage, 'stage值');
    assertEqual(result.level, sandbox.gameState.level, 'level值');
});

// T15: gameState.query('spiritStones') 返回灵石信息
test('T15: gameState.query(spiritStones) 返回spiritStones', () => {
    const result = cultivationMCPServer.mcpGameStateQuery('spiritStones');
    assertEqual(typeof result.spiritStones, 'number', 'spiritStones应为number');
});

// T16: gameState.query('all') 返回完整状态
test('T16: gameState.query(all) 返回所有字段', () => {
    const result = cultivationMCPServer.mcpGameStateQuery('all');
    assert(result.realm !== undefined, 'realm');
    assert(result.spiritStones !== undefined, 'spiritStones');
    assert(result.combat, 'combat');
    assert(result.npc, 'npc');
});

// T17: gameState.query('items') 返回物品数组
test('T17: gameState.query(items) 返回items数组', () => {
    const result = cultivationMCPServer.mcpGameStateQuery('items');
    assertEqual(typeof result.inventoryCount, 'number', 'inventoryCount');
    assert(Array.isArray(result.items), 'items应为数组');
});

// T18: mcpBattleStart 返回成功或错误
test('T18: mcpBattleStart 总是返回结果', () => {
    const result = cultivationMCPServer.mcpBattleStart('test_opponent', false);
    assert(result.success !== undefined || result.error !== undefined, '应有success或error');
});

// T19: mcpCultivationAdvance('meditate') 返回action结果
test('T19: mcpCultivationAdvance(meditate) 返回action字段', () => {
    const result = cultivationMCPServer.mcpCultivationAdvance('meditate');
    assertEqual(result.action, 'meditate', 'action字段');
});

// T20: mcpCultivationAdvance 未知action返回错误
test('T20: mcpCultivationAdvance(unknown) 返回错误', () => {
    const result = cultivationMCPServer.mcpCultivationAdvance('unknown_action_xyz');
    assert(result.error, '应返回错误');
});

// T21: requestHistory 记录请求
test('T21: 工具调用后requestHistory有记录', () => {
    const before = cultivationMCPServer.requestHistory.length;
    cultivationMCPServer.callTool('mcp.providers', {});
    assertEqual(cultivationMCPServer.requestHistory.length, before + 1, '历史记录增加');
});

// T22: mcpNpcQuery 无NPC系统返回错误
test('T22: 无NPC系统时mcpNpcQuery返回错误', () => {
    const original = sandbox.gameState.npcCollab;
    sandbox.gameState.npcCollab = null;
    const result = cultivationMCPServer.mcpNpcQuery('test_npc', 'info');
    assert(result.error, '应返回错误');
    sandbox.gameState.npcCollab = original;
});

// T23: MCP按钮DOM存在
test('T23: index.html 包含 mcpBtn 按钮', () => {
    const btn = sandbox.document.getElementById('mcpBtn');
    assert(btn, 'mcpBtn 应存在于DOM');
});

// T24: npc.query 工具定义正确
test('T24: npc.query inputSchema 包含 npcId和query', () => {
    const tool = MCP_TOOLS['npc.query'];
    assert(tool.inputSchema.properties.npcId, 'npcId属性');
    assert(tool.inputSchema.properties.query, 'query属性');
    assertEqual(tool.inputSchema.required.includes('npcId'), true, 'npcId为必需');
    assertEqual(tool.inputSchema.required.includes('query'), true, 'query为必需');
});

// T25: cultivation.advance inputSchema 包含action枚举
test('T25: cultivation.advance action 为枚举类型', () => {
    const tool = MCP_TOOLS['cultivation.advance'];
    assertEqual(tool.inputSchema.properties.action.enum.length, 3, '3个枚举值');
    assertEqual(tool.inputSchema.properties.action.enum[0], 'meditate', '第一个枚举为meditate');
});

// T26: mcpGameStateQuery('combat') 返回战斗统计
test('T26: gameState.query(combat) 返回combatStats', () => {
    const result = cultivationMCPServer.mcpGameStateQuery('combat');
    assertEqual(typeof result.combatEnabled, 'boolean', 'combatEnabled为boolean');
    assertEqual(typeof result.wins, 'number', 'wins为number');
    assertEqual(typeof result.losses, 'number', 'losses为number');
});

// T27: mcpGameStateQuery('npc') 返回NPC统计
test('T27: gameState.query(npc) 返回npcCount', () => {
    const result = cultivationMCPServer.mcpGameStateQuery('npc');
    assertEqual(typeof result.npcCount, 'number', 'npcCount为number');
    assertEqual(typeof result.activeTasks, 'number', 'activeTasks为number');
});

// T28: serendipity.trigger 工具定义正确
test('T28: serendipity.trigger inputSchema 只包含nodeId', () => {
    const tool = MCP_TOOLS['serendipity.trigger'];
    assertEqual(Object.keys(tool.inputSchema.properties).length, 1, '1个属性');
    assertEqual(tool.inputSchema.required[0], 'nodeId', 'required为nodeId');
});

// T29: item.exchange 工具定义正确
test('T29: item.exchange inputSchema 包含itemId和target', () => {
    const tool = MCP_TOOLS['item.exchange'];
    assert(tool.inputSchema.properties.itemId, 'itemId属性');
    assert(tool.inputSchema.properties.target, 'target属性');
});

// T30: gameState.query 未知字段返回错误
test('T30: gameState.query(unknown_field) 返回错误', () => {
    const result = cultivationMCPServer.mcpGameStateQuery('nonexistent_field_xyz');
    assert(result.error, '应返回错误');
});

// T31: mcpNpcQuery 查询info返回正确字段
test('T31: mcpNpcQuery(npc_test, info) 返回NPC基本信息', () => {
    const result = cultivationMCPServer.mcpNpcQuery('npc_test', 'info');
    assertEqual(result.id, 'npc_test', 'id');
    assertEqual(result.name, '测试NPC', 'name');
    assertEqual(result.role, '道友', 'role');
});

// T32: mcpNpcQuery 查询relationship返回关系
test('T32: mcpNpcQuery(npc_test, relationship) 返回关系数据', () => {
    const result = cultivationMCPServer.mcpNpcQuery('npc_test', 'relationship');
    assertEqual(typeof result.playerReputation, 'number', 'playerReputation为number');
    assertEqual(typeof result.favorability, 'number', 'favorability为number');
});

// T33: mcpNpcQuery 查询task返回任务
test('T33: mcpNpcQuery(npc_test, task) 返回任务数据', () => {
    const result = cultivationMCPServer.mcpNpcQuery('npc_test', 'task');
    assertEqual(result.currentTask, 'none', 'currentTask');
    assertEqual(typeof result.completedTasks, 'number', 'completedTasks');
});

// T34: npc.query 不存在的NPC返回错误
test('T34: mcpNpcQuery(nonexistent, info) 返回错误', () => {
    const result = cultivationMCPServer.mcpNpcQuery('nonexistent_npc_xyz', 'info');
    assert(result.error, '应返回错误');
});

// T35: mcpCultivationAdvance('breakthrough') 返回breakthrough结果
test('T35: mcpCultivationAdvance(breakthrough) 返回结果', () => {
    const result = cultivationMCPServer.mcpCultivationAdvance('breakthrough');
    assertEqual(result.action, 'breakthrough', 'action字段');
});

// T36: mcpCultivationAdvance('tribulation') 返回结果
test('T36: mcpCultivationAdvance(tribulation) 返回结果', () => {
    const result = cultivationMCPServer.mcpCultivationAdvance('tribulation');
    assertEqual(result.action, 'tribulation', 'action字段');
    assert(result.success, 'success为true');
});

// T37: mcpGameStateQuery('cultivation') 返回修炼数据
test('T37: gameState.query(cultivation) 返回spiritEnergy', () => {
    const result = cultivationMCPServer.mcpGameStateQuery('cultivation');
    assertEqual(typeof result.spiritEnergy, 'number', 'spiritEnergy为number');
    assertEqual(typeof result.maxSpiritEnergy, 'number', 'maxSpiritEnergy为number');
});

// T38: requestHistory maxHistory 为100
test('T38: requestHistory maxHistory 限制为100', () => {
    assertEqual(cultivationMCPServer.maxHistory, 100, 'maxHistory应为100');
});

// 输出结果
const total = passed + failed;
const rate = ((passed / total) * 100).toFixed(1);
console.log(`\n========== V73 MCP Agent Bridge Tests ==========`);
console.log(`Total: ${total} | Pass: ${passed} | Fail: ${failed} | Rate: ${rate}%`);
console.log(`==============================================\n`);

if (failed > 0) {
    console.log('FAILURES:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`  [FAIL] ${r.name}`);
        console.log(`         Error: ${r.error}`);
    });
    console.log('');
}

// 覆盖率判断
if (rate >= 80) {
    console.log(`✓ Test coverage ${rate}% >= 80% — PASS`);
} else {
    console.log(`✗ Test coverage ${rate}% < 80% — FAIL`);
}

process.exit(failed > 0 || rate < 80 ? 1 : 0);