// V95 TDD Test Runner
const fs = require('fs');
const vm = require('vm');

const gameContent = fs.readFileSync('game.js', 'utf8');

const context = {
    console: console,
    setTimeout: setTimeout,
    setInterval: setInterval,
    document: { querySelector: () => ({ addEventListener: () => {} }) },
    window: {
        gameState: null,
        CONFIG: {},
        AI_BUDGET_TRACKER: {},
        AI_PROVIDER_CONFIG: {}
    }
};
vm.createContext(context);
vm.runInContext(gameContent, context);

const server = new context.CultivationMCPServer();

console.log('\n=== V95 TDD Test Results ===\n');

let passed = 0, failed = 0;

function test(name, fn) {
    try {
        const result = fn();
        if (result) {
            passed++;
            console.log('✓ ' + name);
        } else {
            failed++;
            console.log('✗ ' + name + ' - assertion failed');
        }
    } catch (e) {
        failed++;
        console.log('✗ ' + name + ' - ' + e.message);
    }
}

// Tool registry tests
test('V95: MCP_TOOLS_V95 constant defined', () => typeof context.MCP_TOOLS_V95 === 'object' && Object.keys(context.MCP_TOOLS_V95).length === 6);
test('V95: All 6 tools registered', () => ['quest.create', 'quest.execute', 'npc.spawn', 'npc.memory_update', 'hook.register', 'budget.query'].every(t => server.toolRegistry.has(t)));
test('V95: quest.create schema valid', () => context.MCP_TOOLS_V95['quest.create'].inputSchema.required.includes('questId'));
test('V95: quest.execute schema valid', () => context.MCP_TOOLS_V95['quest.execute'].inputSchema.required.includes('questId'));

// quest.create tests
const q1 = server.mcpQuestCreate({ questId: 'q1', nodes: [{ id: 'n1', type: 'task' }] });
test('V95: quest.create basic', () => q1.success === true);

const q2 = server.mcpQuestCreate({ questId: 'cycle', nodes: [{ id: 'a', requires: ['b'], type: 't' }, { id: 'b', requires: ['a'], type: 't' }] });
test('V95: quest.create detects cycle', () => q2.error && q2.error.includes('Cycle'));

const q3 = server.mcpQuestCreate({ questId: 'parallel', nodes: [{ id: 's', type: 't' }, { id: 'a', requires: ['s'], type: 't' }, { id: 'b', requires: ['s'], type: 't' }] });
test('V95: quest.create supports parallel', () => q3.success === true && q3.nodeCount === 3);

// quest.execute tests
const e1 = server.mcpQuestExecute({ questId: 'q1', maxConcurrent: 3 });
test('V95: quest.execute returns structure', () => typeof e1.status === 'string' && Array.isArray(e1.completedNodes));

const e2 = server.mcpQuestExecute({ questId: 'nonexistent' });
test('V95: quest.execute not_found', () => e2.status === 'not_found');

// npc.spawn tests
const n1 = server.mcpNpcSpawn({ npcId: 'guard_1', template: 'guard' });
test('V95: npc.spawn creates NPC', () => n1.success === true && n1.memoryLayers.L0);

const n2 = server.mcpNpcSpawn({ npcId: 'combat_1', template: 'combat' });
test('V95: npc.spawn template affects L0', () => n2.memoryLayers.L0.some(r => r.includes('攻击')));

// npc.memory_update tests
const m1 = server.mcpNpcMemoryUpdate({ npcId: 'guard_1', layer: 'L2', content: 'test fact' });
test('V95: npc.memory_update adds content', () => m1.success === true && m1.memorySize === 1);

const m2 = server.mcpNpcMemoryUpdate({ npcId: 'guard_1', layer: 'L5', content: 'test' });
test('V95: npc.memory_update rejects invalid layer', () => m2.error && m2.error.includes('Invalid'));

const m3 = server.mcpNpcMemoryUpdate({ npcId: 'guard_1', layer: 'L3', content: 'combat_sop', tags: ['combat'], crystallize: true });
test('V95: npc.memory_update crystallize creates skill', () => m3.newSkillAvailable === true);

// hook.register tests
const h1 = server.mcpHookRegister({ hookName: 'test_hook', callback: 'console.log(1)' });
test('V95: hook.register adds callback', () => h1.success === true && h1.active === true);

// budget.query tests
const b1 = server.mcpBudgetQuery({});
test('V95: budget.query global scope', () => b1.scope === 'global' && typeof b1.total === 'number');

const b2 = server.mcpBudgetQuery({ scope: 'quest', entityId: 'q1' });
test('V95: budget.query quest scope', () => b2.scope === 'quest' && b2.entityId === 'q1');

// DAG executor tests
const de = server.constructor.dagExecutor;
const cyclicGraph = new Map([['a', { dependencies: ['b'] }], ['b', { dependencies: ['a'] }]]);
test('V95: dagExecutor detects cycle', () => de.detectCycle('a', cyclicGraph) === true);

const acyclicGraph = new Map([['a', { dependencies: [] }], ['b', { dependencies: ['a'] }]]);
test('V95: dagExecutor no cycle', () => de.detectCycle('a', acyclicGraph) === false);

const completed = new Set(['a']);
const executable = de.getExecutableNodes(acyclicGraph, completed);
test('V95: dagExecutor getExecutableNodes', () => executable.includes('b') && !executable.includes('a'));

console.log('\n=== Summary ===');
console.log('Passed: ' + passed + '/' + (passed + failed) + ' (' + ((passed / (passed + failed)) * 100).toFixed(1) + '%)');
console.log(failed > 0 ? 'FAILED: ' + failed : 'All tests passed!');