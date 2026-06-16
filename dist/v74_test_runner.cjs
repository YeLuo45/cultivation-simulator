// V74 MCP Agent Bridge Phase 2 — Tools Test Runner (CJS)
// Tests: 6 new MCP tools (realm.query, inventory.query, skill.list, achievement.query, serendipity.list, battle.status)
const fs = require('fs');
const vm = require('vm');

// 读取构建产物
const gameCode = fs.readFileSync('/home/hermes/projects/cultivation-simulator/dist/game.js', 'utf8');

// 构建最小沙箱 — 模拟游戏核心全局变量
const sandbox = {
    console: { log: () => {}, warn: () => {}, error: () => {} },
    setTimeout: () => {}, clearTimeout: () => {},
    setInterval: () => {}, clearInterval: () => {},
    Math, Date, JSON, Array, Object, String, Number, Boolean, RegExp, Error, Promise, Map, Set,
    document: {
        getElementById: () => ({ style: {}, remove: () => {} }),
        querySelector: () => null,
        querySelectorAll: () => [],
        createElement: () => ({ style: {}, insertAdjacentHTML: () => {}, appendChild: () => {} }),
        body: { insertAdjacentHTML: () => {}, appendChild: () => {} }
    },
    window: {
        alert: () => {}, confirm: () => true, prompt: () => '',
        setTimeout, clearTimeout, setInterval, clearInterval,
        open: () => {}, close: () => {},
        llmRegistry: null,
        // Pre-initialize gameState to bypass TDZ (game.js uses `let gameState` which
        // references window.gameState during the V63 inline tests before declaration)
        gameState: {
            npcCollab: { activeChains: [] },
            spiritStones: 0, realm: 0, spiritEnergy: 0
        }
    },
    // === 完整 gameState mock ===
    gameState: {
        realm: 2, stage: 1, level: 5,
        spiritEnergy: 500, maxSpiritEnergy: 1000,
        cultivationProgress: 45, maxCultivationProgress: 100,
        tribulationCount: 3, flawlessTribulations: 1,
        spiritStones: 1234,
        items: [
            { id: 'item_001', name: '筑基丹', type: 'pill', quality: 'SR', count: 3 },
            { id: 'item_002', name: '灵剑', type: 'equipment', quality: 'R', count: 1 },
            { id: 'item_003', name: '灵草', type: 'material', quality: 'N', count: 10 }
        ],
        skills: [
            { id: 'skill_001', name: '烈火诀', realmRequired: 1, level: 3 },
            { id: 'skill_002', name: '寒冰术', realmRequired: 2, level: 1 }
        ],
        achievements: [
            { id: 'ach_001', name: '初入仙途', completed: true, progress: 100 },
            { id: 'ach_002', name: '渡劫成功', completed: false, progress: 30 }
        ],
        combatState: {
            playerHp: 80, playerMaxHp: 100,
            opponentHp: 60, opponentMaxHp: 100,
            turn: 3, combatEnergy: 50
        },
        combatStats: { wins: 5, losses: 2 },
        npcCollab: {
            npcs: [{
                id: 'npc_001', name: '师尊', role: 'master',
                realm: '金丹', disposition: '友善',
                currentTask: 'none', taskProgress: 0,
                memory: {}, playerReputation: 10,
                favorability: 20, masterRank: 1, completedTasks: 3
            }],
            activeTasks: 2
        },
        serendipityDAG: {
            nodes: new Map([
                ['ser_treasure_discover', { id: 'ser_treasure_discover', name: '奇遇-宝藏发现', type: 'treasure', status: 'completed', triggerCount: 1, description: '发现一处宝藏', effects: {} }],
                ['ser_treasure_excavate', { id: 'ser_treasure_excavate', name: '奇遇-挖掘宝藏', type: 'treasure', status: 'idle', triggerCount: 0, description: '挖掘埋藏的宝物', effects: {} }]
            ])
        },
        plugins: { enabled: [], installed: {} },
        destiny: { unlocked: false },
        beyondHeaven: { unlocked: false }
    },
    // llmRegistry mock
    llmRegistry: {
        getAllProviders: () => [
            { id: 'minimax', name: 'MiniMax' },
            { id: 'openai', name: 'OpenAI' }
        ],
        isConfigured: (id) => id === 'minimax',
        setActive: (id) => ['minimax', 'openai'].includes(id),
        activeProviderId: 'minimax'
    },
    startMeditation: () => ({ success: true }),
    attemptBreakthrough: () => ({ success: false, reason: '境界不足' }),
    startCombat: () => {},
    findItemById: (id) => ({ 'item_001': { id: 'item_001', name: '筑基丹', type: 'pill', quality: 'SR' }, 'item_002': { id: 'item_002', name: '灵剑', type: 'equipment', quality: 'R' } })[id] || null,
    removeItem: () => {},
    closePanel: () => {}
};

vm.createContext(sandbox);

// 执行game.js
try {
    vm.runInContext(gameCode, sandbox, { filename: 'dist/game.js' });
} catch (e) {
    console.error('game.js 执行失败:', e.message);
    console.error(e.stack);
    process.exit(1);
}

const { MCP_TOOLS, cultivationMCPServer } = sandbox;

if (!MCP_TOOLS || !cultivationMCPServer) {
    console.error('MCP系统未正确导出');
    process.exit(1);
}

// 测试框架
let passed = 0, failed = 0;
const results = [];

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

function assert(condition, msg) {
    if (!condition) throw new Error(msg || 'Assertion failed');
}

function assertEqual(a, e, msg) {
    if (a !== e) throw new Error(`${msg || ''} Expected ${e}, got ${a}`);
}

// ===== V74 Tests =====

// T1: toolRegistry now has 14 tools (8 original + 6 new)
test('T1: toolRegistry has 14 tools', () => {
    assertEqual(cultivationMCPServer.toolRegistry.size, 14, 'size');
});

// T2: All new tools present in MCP_TOOLS
test('T2: MCP_TOOLS has 14 entries', () => {
    assertEqual(Object.keys(MCP_TOOLS).length, 14, 'count');
});

test('T3: realm.query tool exists', () => {
    assert(MCP_TOOLS['realm.query'], 'realm.query missing');
    assertEqual(MCP_TOOLS['realm.query'].inputSchema.type, 'object', 'type');
});

test('T4: inventory.query tool exists', () => {
    assert(MCP_TOOLS['inventory.query'], 'inventory.query missing');
});

test('T5: skill.list tool exists', () => {
    assert(MCP_TOOLS['skill.list'], 'skill.list missing');
});

test('T6: achievement.query tool exists', () => {
    assert(MCP_TOOLS['achievement.query'], 'achievement.query missing');
});

test('T7: serendipity.list tool exists', () => {
    assert(MCP_TOOLS['serendipity.list'], 'serendipity.list missing');
});

test('T8: battle.status tool exists', () => {
    assert(MCP_TOOLS['battle.status'], 'battle.status missing');
});

// T9: listTools returns all 14
test('T9: listTools returns 14 tools', () => {
    const result = cultivationMCPServer.listTools();
    const parsed = JSON.parse(result.content[0].text);
    assertEqual(parsed.tools.length, 14, 'count');
});

// T10: realm.query basic
test('T10: mcpRealmQuery basic', () => {
    const r = cultivationMCPServer.mcpRealmQuery('basic');
    assertEqual(r.realm, 2, 'realm');
    assertEqual(r.realmName, '金丹', 'realmName');
    assertEqual(r.stage, 1, 'stage');
});

// T11: realm.query full
test('T11: mcpRealmQuery full', () => {
    const r = cultivationMCPServer.mcpRealmQuery('full');
    assertEqual(r.tribulationCount, 3, 'tribulationCount');
    assertEqual(r.maxCultivationProgress, 100, 'maxCultivationProgress');
});

// T12: inventory.query all
test('T12: mcpInventoryQuery all', () => {
    const r = cultivationMCPServer.mcpInventoryQuery('all');
    assertEqual(r.count, 3, 'count');
    assertEqual(r.filter, 'all', 'filter');
});

// T13: inventory.query pills
test('T13: mcpInventoryQuery pills', () => {
    const r = cultivationMCPServer.mcpInventoryQuery('pills');
    assertEqual(r.count, 1, 'count 1');
});

// T14: inventory.query materials
test('T14: mcpInventoryQuery materials', () => {
    const r = cultivationMCPServer.mcpInventoryQuery('materials');
    assertEqual(r.count, 1, 'count 1');
});

// T15: skill.list all
test('T15: mcpSkillList all', () => {
    const r = cultivationMCPServer.mcpSkillList();
    assertEqual(r.count, 2, 'count');
});

// T16: skill.list realm filter
test('T16: mcpSkillList realm=1', () => {
    const r = cultivationMCPServer.mcpSkillList(1);
    assertEqual(r.count, 1, 'count 1');
});

// T17: achievement.query all
test('T17: mcpAchievementQuery all', () => {
    const r = cultivationMCPServer.mcpAchievementQuery('all');
    assertEqual(r.count, 2, 'count');
});

// T18: achievement.query completed
test('T18: mcpAchievementQuery completed', () => {
    const r = cultivationMCPServer.mcpAchievementQuery('completed');
    assertEqual(r.count, 1, 'count 1');
});

// T19: achievement.query in_progress
test('T19: mcpAchievementQuery in_progress', () => {
    const r = cultivationMCPServer.mcpAchievementQuery('in_progress');
    assertEqual(r.count, 1, 'count 1');
});

// T20: serendipity.list all
test('T20: mcpSerendipityList all', () => {
    const r = cultivationMCPServer.mcpSerendipityList('all');
    assertEqual(r.total, 2, 'total');
    assertEqual(r.count, 2, 'count');
});

// T21: serendipity.list completed
test('T21: mcpSerendipityList completed', () => {
    const r = cultivationMCPServer.mcpSerendipityList('completed');
    assertEqual(r.count, 1, 'count 1');
});

// T22: serendipity.list available
test('T22: mcpSerendipityList available', () => {
    const r = cultivationMCPServer.mcpSerendipityList('available');
    assertEqual(r.count, 1, 'count 1');
});

// T23: battle.status active
test('T23: mcpBattleStatus in battle', () => {
    const r = cultivationMCPServer.mcpBattleStatus();
    assertEqual(r.inBattle, true, 'inBattle');
    assertEqual(r.playerHp, 80, 'playerHp');
});

// T24: callTool realm.query
test('T24: callTool realm.query', () => {
    const r = cultivationMCPServer.callTool('realm.query', { detail: 'basic' });
    assert(!r.isError, 'should not be error');
    const parsed = JSON.parse(r.content[0].text);
    assertEqual(parsed.realm, 2, 'realm');
});

// T25: callTool inventory.query
test('T25: callTool inventory.query', () => {
    const r = cultivationMCPServer.callTool('inventory.query', { filter: 'all' });
    assert(!r.isError, 'should not be error');
});

// T26: callTool skill.list
test('T26: callTool skill.list', () => {
    const r = cultivationMCPServer.callTool('skill.list', { realm: 1 });
    assert(!r.isError, 'should not be error');
});

// T27: callTool achievement.query
test('T27: callTool achievement.query', () => {
    const r = cultivationMCPServer.callTool('achievement.query', { filter: 'completed' });
    assert(!r.isError, 'should not be error');
});

// T28: callTool serendipity.list
test('T28: callTool serendipity.list', () => {
    const r = cultivationMCPServer.callTool('serendipity.list', { filter: 'all' });
    assert(!r.isError, 'should not be error');
});

// T29: callTool battle.status
test('T29: callTool battle.status', () => {
    const r = cultivationMCPServer.callTool('battle.status', {});
    assert(!r.isError, 'should not be error');
});

// T30: callTool unknown tool → isError
test('T30: callTool unknown tool', () => {
    const r = cultivationMCPServer.callTool('nonexistent.tool', {});
    assert(r.isError, 'should be error');
});

// ===== 输出结果 =====
console.log('\n========== V74 MCP Agent Bridge Phase 2 — Test Results ==========\n');
results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${r.name}`);
    if (r.error) console.log(`   Error: ${r.error}`);
});

const total = passed + failed;
const pct = ((passed / total) * 100).toFixed(1);
console.log(`\n========== SUMMARY: ${passed}/${total} passed (${pct}%) ==========`);
process.exit(failed > 0 ? 1 : 0);