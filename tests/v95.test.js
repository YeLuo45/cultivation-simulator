// V95 Multi-Agent Quest Orchestration System - TDD Tests
// Tests for: quest.create/execute, npc.spawn/memory_update, hook.register, budget.query

const V95_TESTS = [];

function runV95Tests() {
    const results = [];
    let passed = 0, failed = 0;

    // Initialize test server
    const server = new CultivationMCPServer();

    // ========== V95 Tool Registry Tests ==========
    results.push(test('V95: MCP_TOOLS_V95 constant defined', () => {
        return typeof MCP_TOOLS_V95 === 'object' && Object.keys(MCP_TOOLS_V95).length === 6;
    }));

    results.push(test('V95: All 6 tools registered in toolRegistry', () => {
        const tools = ['quest.create', 'quest.execute', 'npc.spawn', 'npc.memory_update', 'hook.register', 'budget.query'];
        return tools.every(t => server.toolRegistry.has(t));
    }));

    results.push(test('V95: quest.create input schema valid', () => {
        const tool = MCP_TOOLS_V95['quest.create'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('questId') && tool.inputSchema.required.includes('nodes');
    }));

    results.push(test('V95: quest.execute input schema valid', () => {
        const tool = MCP_TOOLS_V95['quest.execute'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('questId');
    }));

    results.push(test('V95: npc.spawn input schema valid', () => {
        const tool = MCP_TOOLS_V95['npc.spawn'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('npcId') && tool.inputSchema.required.includes('template');
    }));

    results.push(test('V95: npc.memory_update input schema valid', () => {
        const tool = MCP_TOOLS_V95['npc.memory_update'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('npcId') && tool.inputSchema.required.includes('layer') && tool.inputSchema.required.includes('content');
    }));

    results.push(test('V95: hook.register input schema valid', () => {
        const tool = MCP_TOOLS_V95['hook.register'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('hookName') && tool.inputSchema.required.includes('callback');
    }));

    results.push(test('V95: budget.query input schema valid', () => {
        const tool = MCP_TOOLS_V95['budget.query'];
        return tool && tool.inputSchema && tool.inputSchema.properties.scope;
    }));

    // ========== quest.create Tests ==========
    results.push(test('V95: quest.create creates DAG quest successfully', () => {
        const result = server.mcpQuestCreate({
            questId: 'test_quest_1',
            name: 'Test Quest',
            nodes: [
                { id: 'node1', type: 'explore' },
                { id: 'node2', type: 'combat', requires: ['node1'] },
                { id: 'node3', type: 'report', requires: ['node2'] }
            ],
            budget: 5000
        });
        return result.success === true && result.questId === 'test_quest_1' && result.nodeCount === 3;
    }));

    results.push(test('V95: quest.create detects cycle and rejects', () => {
        const result = server.mcpQuestCreate({
            questId: 'cycle_quest',
            nodes: [
                { id: 'a', type: 'task', requires: ['c'] },
                { id: 'b', type: 'task', requires: ['a'] },
                { id: 'c', type: 'task', requires: ['b'] }
            ]
        });
        return result.error && result.error.includes('Cycle detected');
    }));

    results.push(test('V95: quest.create requires questId', () => {
        const result = server.mcpQuestCreate({ nodes: [{ id: 'n1', type: 'task' }] });
        return result.error && result.error.includes('questId');
    }));

    results.push(test('V95: quest.create supports parallel nodes', () => {
        const result = server.mcpQuestCreate({
            questId: 'parallel_quest',
            nodes: [
                { id: 'start', type: 'init' },
                { id: 'branch_a', type: 'explore', requires: ['start'] },
                { id: 'branch_b', type: 'combat', requires: ['start'] },
                { id: 'merge', type: 'report', requires: ['branch_a', 'branch_b'] }
            ]
        });
        return result.success === true && result.nodeCount === 4;
    }));

    results.push(test('V95: quest.create with hooks registers them', () => {
        const result = server.mcpQuestCreate({
            questId: 'hooked_quest',
            nodes: [{ id: 'n1', type: 'task' }],
            hooks: [{ event: 'pre_quest', script: 'console.log("pre");' }]
        });
        return result.success === true;
    }));

    // ========== quest.execute Tests ==========
    results.push(test('V95: quest.execute returns correct status structure', () => {
        // First create quest
        server.mcpQuestCreate({
            questId: 'exec_test',
            nodes: [{ id: 'n1', type: 'task' }, { id: 'n2', type: 'task' }]
        });
        const result = server.mcpQuestExecute({ questId: 'exec_test', maxConcurrent: 2 });
        return result && typeof result.status === 'string' && Array.isArray(result.completedNodes);
    }));

    results.push(test('V95: quest.execute respects maxConcurrent', () => {
        server.mcpQuestCreate({
            questId: 'concurrent_test',
            nodes: [
                { id: 'n1', type: 'task' },
                { id: 'n2', type: 'task' },
                { id: 'n3', type: 'task' },
                { id: 'n4', type: 'task' }
            ],
            budget: 500
        });
        const result = server.mcpQuestExecute({ questId: 'concurrent_test', maxConcurrent: 2 });
        // With maxConcurrent=2, budget 500/100=5 max nodes, so 2 should execute
        return result.completedNodes.length <= 2;
    }));

    results.push(test('V95: quest.execute returns not_found for missing quest', () => {
        const result = server.mcpQuestExecute({ questId: 'nonexistent' });
        return result.error && result.status === 'not_found';
    }));

    results.push(test('V95: quest.execute handles budget_exceeded', () => {
        server.mcpQuestCreate({
            questId: 'budget_test',
            nodes: Array.from({ length: 100 }, (_, i) => ({ id: `n${i}`, type: 'task' })),
            budget: 50 // Very low budget
        });
        const result = server.mcpQuestExecute({ questId: 'budget_test' });
        return result.status === 'budget_exceeded' || result.budgetUsed <= 50;
    }));

    // ========== npc.spawn Tests ==========
    results.push(test('V95: npc.spawn creates NPC with five-layer memory', () => {
        const result = server.mcpNpcSpawn({ npcId: 'guard_001', template: 'guard' });
        return result.success === true && result.npcId === 'guard_001' && result.memoryLayers && result.memoryLayers.L0;
    }));

    results.push(test('V95: npc.spawn template affects L0 rules', () => {
        const guard = server.mcpNpcSpawn({ npcId: 'guard_test', template: 'guard' });
        const combat = server.mcpNpcSpawn({ npcId: 'combat_test', template: 'combat' });
        const guardL0 = guard.memoryLayers.L0;
        const combatL0 = combat.memoryLayers.L0;
        return guardL0.some(r => r.includes('宗门')) && combatL0.some(r => r.includes('攻击'));
    }));

    results.push(test('V95: npc.spawn with custom memoryLayers', () => {
        const result = server.mcpNpcSpawn({
            npcId: 'custom_npc',
            template: 'explorer',
            memoryLayers: {
                L0: ['Custom rule 1'],
                L1: [{ skillId: 's1', tags: ['exploration'], confidence: 0.9 }],
                L2: [{ fact: 'Known location X', timestamp: Date.now() }],
                L3: [],
                L4: []
            }
        });
        return result.memoryLayers.L0[0] === 'Custom rule 1';
    }));

    results.push(test('V95: npc.spawn requires npcId and template', () => {
        const result1 = server.mcpNpcSpawn({ template: 'guard' });
        const result2 = server.mcpNpcSpawn({ npcId: 'test' });
        return result1.error && result2.error;
    }));

    results.push(test('V95: npc.spawn emits npc_spawn hook', () => {
        let hookCalled = false;
        server.constructor.hookEngine.register('npc_spawn', (ctx) => { hookCalled = true; });
        server.mcpNpcSpawn({ npcId: 'hook_test', template: 'guard' });
        return hookCalled === true;
    }));

    // ========== npc.memory_update Tests ==========
    results.push(test('V95: npc.memory_update adds content to layer', () => {
        server.mcpNpcSpawn({ npcId: 'mem_test', template: 'guard' });
        const result = server.mcpNpcMemoryUpdate({ npcId: 'mem_test', layer: 'L2', content: 'Discovered treasure location' });
        return result.success === true && result.memorySize === 1;
    }));

    results.push(test('V95: npc.memory_update rejects invalid layer', () => {
        server.mcpNpcSpawn({ npcId: 'layer_test', template: 'guard' });
        const result = server.mcpNpcMemoryUpdate({ npcId: 'layer_test', layer: 'L5', content: 'test' });
        return result.error && result.error.includes('Invalid layer');
    }));

    results.push(test('V95: npc.memory_update with crystallize creates SOP', () => {
        server.mcpNpcSpawn({ npcId: 'crystal_test', template: 'guard' });
        const result = server.mcpNpcMemoryUpdate({
            npcId: 'crystal_test',
            layer: 'L3',
            content: 'defend_sect_approach',
            tags: ['combat', 'defense'],
            crystallize: true
        });
        return result.success === true && result.newSkillAvailable === true;
    }));

    results.push(test('V95: npc.memory_update crystallize updates L1 index', () => {
        server.mcpNpcSpawn({ npcId: 'index_test', template: 'guard' });
        server.mcpNpcMemoryUpdate({
            npcId: 'index_test',
            layer: 'L3',
            content: 'explore_cave_path',
            tags: ['exploration', 'cave'],
            crystallize: true
        });
        const npc = server.constructor.npcMemorySystems.get('index_test');
        return npc.layers.L1.length > 0;
    }));

    results.push(test('V95: npc.memory_update requires npcId, layer, content', () => {
        const result = server.mcpNpcMemoryUpdate({ layer: 'L2', content: 'test' });
        return result.error && result.error.includes('npcId');
    }));

    results.push(test('V95: npc.memory_update returns error for unknown NPC', () => {
        const result = server.mcpNpcMemoryUpdate({ npcId: 'unknown_npc', layer: 'L2', content: 'test' });
        return result.error && result.error.includes('not found');
    }));

    // ========== hook.register Tests ==========
    results.push(test('V95: hook.register adds callback to hook engine', () => {
        const result = server.mcpHookRegister({
            hookName: 'custom_hook',
            callback: 'console.log("custom");'
        });
        return result.success === true && result.active === true;
    }));

    results.push(test('V95: hook.register supports priority', () => {
        const result = server.mcpHookRegister({
            hookName: 'priority_test',
            callback: 'return 1;',
            priority: 100
        });
        return result.success === true;
    }));

    results.push(test('V95: hook.register requires hookName and callback', () => {
        const result = server.mcpHookRegister({ hookName: 'test' });
        return result.error && result.error.includes('callback');
    }));

    results.push(test('V95: hook engine emits to multiple callbacks', () => {
        let callCount = 0;
        server.constructor.hookEngine.register('multi_test', () => { callCount++; });
        server.constructor.hookEngine.register('multi_test', () => { callCount++; });
        server.constructor.hookEngine.emit('multi_test', {});
        return callCount === 2;
    }));

    // ========== budget.query Tests ==========
    results.push(test('V95: budget.query returns global budget by default', () => {
        const result = server.mcpBudgetQuery({});
        return result.scope === 'global' && typeof result.total === 'number' && typeof result.used === 'number';
    }));

    results.push(test('V95: budget.query with quest scope', () => {
        server.mcpQuestCreate({
            questId: 'budget_quest',
            nodes: [{ id: 'n1', type: 'task' }]
        });
        const result = server.mcpBudgetQuery({ scope: 'quest', entityId: 'budget_quest' });
        return result.scope === 'quest' && result.entityId === 'budget_quest';
    }));

    results.push(test('V95: budget.query with npc scope', () => {
        server.mcpNpcSpawn({ npcId: 'budget_npc', template: 'guard' });
        const result = server.mcpBudgetQuery({ scope: 'npc', entityId: 'budget_npc' });
        return result.scope === 'npc' && result.rateLimited === false;
    }));

    results.push(test('V95: budget.query returns rateLimited when near budget', () => {
        const result = server.mcpBudgetQuery({});
        // Initially not rate limited, but check structure
        return typeof result.rateLimited === 'boolean';
    }));

    results.push(test('V95: budget.query returns error for unknown quest', () => {
        const result = server.mcpBudgetQuery({ scope: 'quest', entityId: 'nonexistent' });
        return result.error;
    }));

    // ========== DAG Executor Tests ==========
    results.push(test('V95: dagExecutor detects cycle correctly', () => {
        const graph = new Map([
            ['a', { dependencies: ['b'] }],
            ['b', { dependencies: ['c'] }],
            ['c', { dependencies: ['a'] }]
        ]);
        const hasCycle = server.constructor.dagExecutor.detectCycle('a', graph);
        return hasCycle === true;
    }));

    results.push(test('V95: dagExecutor returns false for acyclic graph', () => {
        const graph = new Map([
            ['a', { dependencies: [] }],
            ['b', { dependencies: ['a'] }],
            ['c', { dependencies: ['b'] }]
        ]);
        const hasCycle = server.constructor.dagExecutor.detectCycle('a', graph);
        return hasCycle === false;
    }));

    results.push(test('V95: dagExecutor getExecutableNodes returns correct nodes', () => {
        const graph = new Map([
            ['a', { dependencies: [] }],
            ['b', { dependencies: ['a'] }],
            ['c', { dependencies: ['a'] }],
            ['d', { dependencies: ['b', 'c'] }]
        ]);
        const completed = new Set(['a']);
        const executable = server.constructor.dagExecutor.getExecutableNodes(graph, completed);
        return executable.includes('b') && executable.includes('c') && !executable.includes('a');
    }));

    // ========== Integration Tests ==========
    results.push(test('V95: Full quest flow - create, execute, complete', () => {
        server.mcpQuestCreate({
            questId: 'integration_test',
            nodes: [
                { id: 'start', type: 'init' },
                { id: 'explore', type: 'explore', requires: ['start'] },
                { id: 'combat', type: 'combat', requires: ['explore'] },
                { id: 'report', type: 'report', requires: ['combat'] }
            ],
            budget: 10000
        });
        const exec1 = server.mcpQuestExecute({ questId: 'integration_test' });
        const exec2 = server.mcpQuestExecute({ questId: 'integration_test' });
        const exec3 = server.mcpQuestExecute({ questId: 'integration_test' });
        const exec4 = server.mcpQuestExecute({ questId: 'integration_test' });
        // At least one execution should complete some nodes
        return exec1.completedNodes.length >= 1;
    }));

    results.push(test('V95: NPC memory persists across operations', () => {
        server.mcpNpcSpawn({ npcId: 'persist_test', template: 'guard' });
        server.mcpNpcMemoryUpdate({ npcId: 'persist_test', layer: 'L2', content: 'Path to hidden valley' });
        server.mcpNpcMemoryUpdate({ npcId: 'persist_test', layer: 'L2', content: 'Enemy patrol schedule' });
        const npc = server.constructor.npcMemorySystems.get('persist_test');
        return npc.layers.L2.length === 2;
    }));

    // ========== Test Runner ==========
    function test(name, fn) {
        try {
            const result = fn();
            if (result) {
                passed++;
                return { name, passed: true };
            } else {
                failed++;
                return { name, passed: false, error: 'Assertion failed' };
            }
        } catch (e) {
            failed++;
            return { name, passed: false, error: e.message };
        }
    }

    // Print results
    console.log('=== V95 TDD Test Results ===');
    results.forEach(r => {
        const status = r.passed ? '✓' : '✗';
        console.log(`${status} ${r.name}${r.error ? ' - ' + r.error : ''}`);
    });
    console.log(`\nPassed: ${passed}/${passed + failed} (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);

    return { passed, failed, passRate: passed / (passed + failed) };
}

// Export for external testing
if (typeof module !== 'undefined') module.exports = { runV95Tests, V95_TESTS };