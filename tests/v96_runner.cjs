// V96 TDD Test Runner
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

console.log('\n=== V96 TDD Test Results ===\n');

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

// ========== V96 Tool Registry Tests ==========
test('V96: MCP_TOOLS_V96 constant defined', () => typeof context.MCP_TOOLS_V96 === 'object' && Object.keys(context.MCP_TOOLS_V96).length === 6);
test('V96: All 6 tools registered', () => ['quest.chain.create', 'quest.chain.execute', 'npc.skill.crystallize', 'npc.skill.invoke', 'hook.trigger', 'quest.state.query'].every(t => server.toolRegistry.has(t)));
test('V96: quest.chain.create schema valid', () => context.MCP_TOOLS_V96['quest.chain.create'].inputSchema.required.includes('chainId'));
test('V96: quest.chain.execute schema valid', () => context.MCP_TOOLS_V96['quest.chain.execute'].inputSchema.required.includes('chainId'));
test('V96: npc.skill.crystallize schema valid', () => context.MCP_TOOLS_V96['npc.skill.crystallize'].inputSchema.required.includes('npcId'));
test('V96: npc.skill.invoke schema valid', () => context.MCP_TOOLS_V96['npc.skill.invoke'].inputSchema.required.includes('npcId'));
test('V96: hook.trigger schema valid', () => context.MCP_TOOLS_V96['hook.trigger'].inputSchema.required.includes('event'));
test('V96: quest.state.query schema valid', () => context.MCP_TOOLS_V96['quest.state.query'].inputSchema.required.includes('chainId'));

// ========== Setup: Spawn NPCs ==========
server.mcpNpcSpawn({ npcId: 'master_001', template: 'guard' });
server.mcpNpcSpawn({ npcId: 'fellow_001', template: 'explorer' });
server.mcpNpcSpawn({ npcId: 'combat_001', template: 'combat' });

// ========== quest.chain.create Tests ==========
const c1 = server.mcpQuestChainCreate({
    chainId: 'chain_test_1',
    name: 'Test Chain',
    npcs: [{ npcId: 'master_001', role: 'master' }, { npcId: 'fellow_001', role: 'fellow' }],
    nodes: [{ id: 'node1', type: 'explore' }, { id: 'node2', type: 'combat', requires: ['node1'] }]
});
test('V96: quest.chain.create creates chain', () => c1.success === true && c1.chainId === 'chain_test_1');

const c2 = server.mcpQuestChainCreate({ name: 'test', npcs: [], nodes: [] });
test('V96: quest.chain.create requires chainId', () => c2.error && c2.error.includes('chainId'));

const c3 = server.mcpQuestChainCreate({
    chainId: 'chain_test_2',
    npcs: [{ npcId: 'nonexistent_npc', role: 'master' }],
    nodes: [{ id: 'n1', type: 'task' }]
});
test('V96: quest.chain.create validates NPC existence', () => c3.error && c3.error.includes('not found'));

const c4 = server.mcpQuestChainCreate({
    chainId: 'cycle_chain',
    npcs: [{ npcId: 'master_001', role: 'master' }],
    nodes: [{ id: 'a', type: 'task', requires: ['c'] }, { id: 'b', type: 'task', requires: ['a'] }, { id: 'c', type: 'task', requires: ['b'] }]
});
test('V96: quest.chain.create detects cycle', () => c4.error && c4.error.includes('Cycle detected'));

const c5 = server.mcpQuestChainCreate({
    chainId: 'parallel_chain',
    npcs: [{ npcId: 'master_001', role: 'master' }],
    nodes: [
        { id: 'start', type: 'init' },
        { id: 'branch_a', type: 'explore', requires: ['start'] },
        { id: 'branch_b', type: 'combat', requires: ['start'] },
        { id: 'merge', type: 'report', requires: ['branch_a', 'branch_b'] }
    ]
});
test('V96: quest.chain.create supports parallel nodes', () => c5.success === true && c5.nodeCount === 4);

// ========== quest.chain.execute Tests ==========
server.mcpQuestChainCreate({
    chainId: 'exec_test_chain',
    npcs: [{ npcId: 'master_001', role: 'master' }],
    nodes: [{ id: 'n1', type: 'task' }, { id: 'n2', type: 'task' }]
});
const e1 = server.mcpQuestChainExecute({ chainId: 'exec_test_chain', maxConcurrent: 2 });
test('V96: quest.chain.execute returns structure', () => typeof e1.status === 'string' && Array.isArray(e1.completedNodes));

const e2 = server.mcpQuestChainExecute({ chainId: 'nonexistent' });
test('V96: quest.chain.execute not_found', () => e2.error && e2.status === 'not_found');

const e3 = server.mcpQuestChainExecute({ chainId: 'concurrent_chain', maxConcurrent: 2 });
test('V96: quest.chain.execute respects maxConcurrent', () => e3.completedNodes.length <= 2);

// ========== npc.skill.crystallize Tests ==========
const s1 = server.mcpNpcSkillCrystallize({
    npcId: 'master_001',
    experienceData: { task: 'defend_sect', steps: ['watch', 'attack', 'report'] },
    layer: 'L3',
    tags: ['defense', 'combat'],
    skillName: 'Defend Sect SOP'
});
test('V96: npc.skill.crystallize creates SOP', () => s1.success === true && s1.skillId && s1.skillName === 'Defend Sect SOP');

const s2 = server.mcpNpcSkillCrystallize({ layer: 'L3', skillName: 'test' });
test('V96: npc.skill.crystallize requires npcId', () => s2.error && s2.error.includes('npcId'));

const s3 = server.mcpNpcSkillCrystallize({
    npcId: 'master_001',
    experienceData: { test: true },
    layer: 'L2',
    skillName: 'Test Skill'
});
test('V96: npc.skill.crystallize only supports L3', () => s3.error && s3.error.includes('L3'));

const s4 = server.mcpNpcSkillCrystallize({
    npcId: 'nonexistent_npc',
    experienceData: { test: true },
    layer: 'L3',
    skillName: 'Test'
});
test('V96: npc.skill.crystallize validates NPC', () => s4.error && s4.error.includes('not found'));

test('V96: npc.skill.crystallize stores in registry', () => server.constructor.skillRegistry && server.constructor.skillRegistry.size > 0);

// ========== npc.skill.invoke Tests ==========
const invoke1 = server.mcpNpcSkillInvoke({
    npcId: 'combat_001',
    skillId: s1.skillId,
    params: { target: 'enemy' }
});
test('V96: npc.skill.invoke executes skill', () => invoke1.success === true && invoke1.executionResult);

const invoke2 = server.mcpNpcSkillInvoke({ skillId: 'test' });
test('V96: npc.skill.invoke requires npcId', () => invoke2.error && invoke2.error.includes('npcId'));

const invoke3 = server.mcpNpcSkillInvoke({
    npcId: 'master_001',
    skillId: 'nonexistent_skill'
});
test('V96: npc.skill.invoke validates skill', () => invoke3.error && invoke3.error.includes('not found'));

test('V96: npc.skill.invoke records in L4', () => {
    const npc = server.constructor.npcMemorySystems.get('master_001');
    return npc.layers.L4 && npc.layers.L4.length > 0;
});

// ========== hook.trigger Tests ==========
let hookCalled = false;
server.constructor.hookEngine.register('custom_event', (ctx) => { hookCalled = true; });
const ht1 = server.mcpHookTrigger({ event: 'custom_event', context: { customData: 'test_value' }, source: 'test' });
test('V96: hook.trigger triggers hook', () => ht1.success === true && hookCalled === true);

const ht2 = server.mcpHookTrigger({ context: {} });
test('V96: hook.trigger requires event', () => ht2.error && ht2.error.includes('event'));

const ht3 = server.mcpHookTrigger({ event: 'test_event' });
test('V96: hook.trigger returns metadata', () => ht3.success === true && ht3.event === 'test_event');

// ========== quest.state.query Tests ==========
const qs1 = server.mcpQuestStateQuery({ chainId: 'state_test_chain' });
test('V96: quest.state.query returns state', () => qs1.chainId === 'state_test_chain' && qs1.name);

const qs2 = server.mcpQuestStateQuery({});
test('V96: quest.state.query requires chainId', () => qs2.error && qs2.error.includes('chainId'));

const qs3 = server.mcpQuestStateQuery({ chainId: 'nonexistent' });
test('V96: quest.state.query not_found', () => qs3.error && qs3.status === 'not_found');

const qs4 = server.mcpQuestStateQuery({ chainId: 'npc_query_chain', includeNpcs: true });
test('V96: quest.state.query includes NPCs', () => qs4.npcs && qs4.npcs.length === 1);

const qs5 = server.mcpQuestStateQuery({ chainId: 'budget_query_chain', includeBudget: true });
test('V96: quest.state.query includes budget', () => qs5.budget && typeof qs5.budget.total === 'number');

// ========== Five-Layer Memory Tests ==========
test('V96: Five-layer L0 meta rules preserved', () => {
    const npc = server.constructor.npcMemorySystems.get('master_001');
    return npc.layers.L0 && npc.layers.L0.length > 0;
});

test('V96: Five-layer L1 index updated', () => {
    const npc = server.constructor.npcMemorySystems.get('fellow_001');
    return npc.layers.L1 && npc.layers.L1.length > 0;
});

test('V96: Five-layer L3 stores skills', () => {
    const npc = server.constructor.npcMemorySystems.get('master_001');
    return npc.layers.L3 && npc.layers.L3.length > 0;
});

test('V96: Five-layer L4 archives invocations', () => {
    const npc = server.constructor.npcMemorySystems.get('master_001');
    return Array.isArray(npc.layers.L4);
});

// ========== Integration Test ==========
test('V96: Integration - full chain flow', () => {
    server.mcpNpcSpawn({ npcId: 'integrated_npc', template: 'guard' });
    const chainResult = server.mcpQuestChainCreate({
        chainId: 'integration_chain',
        npcs: [{ npcId: 'integrated_npc', role: 'guard' }],
        nodes: [{ id: 'i1', type: 'patrol' }, { id: 'i2', type: 'report', requires: ['i1'] }]
    });
    if (!chainResult.success) return false;
    const execResult = server.mcpQuestChainExecute({ chainId: 'integration_chain' });
    if (!execResult.status) return false;
    const skillResult = server.mcpNpcSkillCrystallize({
        npcId: 'integrated_npc',
        experienceData: { chain: 'integration_chain' },
        layer: 'L3',
        tags: ['integration'],
        skillName: 'Integration Test SOP'
    });
    if (!skillResult.success) return false;
    const invokeResult = server.mcpNpcSkillInvoke({
        npcId: 'integrated_npc',
        skillId: skillResult.skillId
    });
    return invokeResult.success === true;
});

console.log('\n=== Summary ===');
console.log('Passed: ' + passed + '/' + (passed + failed) + ' (' + ((passed / (passed + failed)) * 100).toFixed(1) + '%)');
console.log(failed > 0 ? 'FAILED: ' + failed : 'All tests passed!');
process.exit(failed > 0 ? 1 : 0);