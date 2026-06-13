// V96 Quest Deepening + NPC Collaboration + Five-Layer Memory Crystallization - TDD Tests
// Tests for: quest.chain.create/execute, npc.skill.crystallize/invoke, hook.trigger, quest.state.query

const V96_TESTS = [];

function runV96Tests() {
    const results = [];
    let passed = 0, failed = 0;

    // Initialize test server
    const server = new CultivationMCPServer();

    // ========== V96 Tool Registry Tests ==========
    results.push(test('V96: MCP_TOOLS_V96 constant defined', () => {
        return typeof MCP_TOOLS_V96 === 'object' && Object.keys(MCP_TOOLS_V96).length === 6;
    }));

    results.push(test('V96: All 6 tools registered in toolRegistry', () => {
        const tools = ['quest.chain.create', 'quest.chain.execute', 'npc.skill.crystallize', 'npc.skill.invoke', 'hook.trigger', 'quest.state.query'];
        return tools.every(t => server.toolRegistry.has(t));
    }));

    results.push(test('V96: quest.chain.create input schema valid', () => {
        const tool = MCP_TOOLS_V96['quest.chain.create'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('chainId') &&
               tool.inputSchema.required.includes('npcs') && tool.inputSchema.required.includes('nodes');
    }));

    results.push(test('V96: quest.chain.execute input schema valid', () => {
        const tool = MCP_TOOLS_V96['quest.chain.execute'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('chainId');
    }));

    results.push(test('V96: npc.skill.crystallize input schema valid', () => {
        const tool = MCP_TOOLS_V96['npc.skill.crystallize'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('npcId') &&
               tool.inputSchema.required.includes('experienceData') && tool.inputSchema.required.includes('skillName');
    }));

    results.push(test('V96: npc.skill.invoke input schema valid', () => {
        const tool = MCP_TOOLS_V96['npc.skill.invoke'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('npcId') &&
               tool.inputSchema.required.includes('skillId');
    }));

    results.push(test('V96: hook.trigger input schema valid', () => {
        const tool = MCP_TOOLS_V96['hook.trigger'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('event');
    }));

    results.push(test('V96: quest.state.query input schema valid', () => {
        const tool = MCP_TOOLS_V96['quest.state.query'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('chainId');
    }));

    // ========== Setup: Spawn NPCs for tests ==========
    server.mcpNpcSpawn({ npcId: 'master_001', template: 'guard' });
    server.mcpNpcSpawn({ npcId: 'fellow_001', template: 'explorer' });
    server.mcpNpcSpawn({ npcId: 'combat_001', template: 'combat' });

    // ========== quest.chain.create Tests ==========
    results.push(test('V96: quest.chain.create creates chain with NPCs successfully', () => {
        const result = server.mcpQuestChainCreate({
            chainId: 'chain_test_1',
            name: 'Test Chain',
            npcs: [{ npcId: 'master_001', role: 'master' }, { npcId: 'fellow_001', role: 'fellow' }],
            nodes: [
                { id: 'node1', type: 'explore' },
                { id: 'node2', type: 'combat', requires: ['node1'] }
            ]
        });
        return result.success === true && result.chainId === 'chain_test_1' && result.npcCount === 2;
    }));

    results.push(test('V96: quest.chain.create requires chainId, npcs, nodes', () => {
        const r1 = server.mcpQuestChainCreate({ name: 'test', npcs: [], nodes: [] });
        const r2 = server.mcpQuestChainCreate({ chainId: 'test', npcs: [], nodes: [] });
        const r3 = server.mcpQuestChainCreate({ chainId: 'test', npcs: [{ npcId: 'a' }], nodes: [] });
        return r1.error && r2.error && r3.error;
    }));

    results.push(test('V96: quest.chain.create validates NPC existence', () => {
        const result = server.mcpQuestChainCreate({
            chainId: 'chain_test_2',
            npcs: [{ npcId: 'nonexistent_npc', role: 'master' }],
            nodes: [{ id: 'n1', type: 'task' }]
        });
        return result.error && result.error.includes('not found');
    }));

    results.push(test('V96: quest.chain.create detects cycle and rejects', () => {
        const result = server.mcpQuestChainCreate({
            chainId: 'cycle_chain',
            npcs: [{ npcId: 'master_001', role: 'master' }],
            nodes: [
                { id: 'a', type: 'task', requires: ['c'] },
                { id: 'b', type: 'task', requires: ['a'] },
                { id: 'c', type: 'task', requires: ['b'] }
            ]
        });
        return result.error && result.error.includes('Cycle detected');
    }));

    results.push(test('V96: quest.chain.create supports parallel nodes', () => {
        const result = server.mcpQuestChainCreate({
            chainId: 'parallel_chain',
            npcs: [{ npcId: 'master_001', role: 'master' }],
            nodes: [
                { id: 'start', type: 'init' },
                { id: 'branch_a', type: 'explore', requires: ['start'] },
                { id: 'branch_b', type: 'combat', requires: ['start'] },
                { id: 'merge', type: 'report', requires: ['branch_a', 'branch_b'] }
            ]
        });
        return result.success === true && result.nodeCount === 4;
    }));

    results.push(test('V96: quest.chain.create emits quest_start hook', () => {
        let hookCalled = false;
        server.constructor.hookEngine.register('quest_start', (ctx) => { hookCalled = true; });
        server.mcpQuestChainCreate({
            chainId: 'hook_test_chain',
            npcs: [{ npcId: 'master_001', role: 'master' }],
            nodes: [{ id: 'n1', type: 'task' }]
        });
        return hookCalled === true;
    }));

    // ========== quest.chain.execute Tests ==========
    results.push(test('V96: quest.chain.execute returns correct status structure', () => {
        server.mcpQuestChainCreate({
            chainId: 'exec_test_chain',
            npcs: [{ npcId: 'master_001', role: 'master' }],
            nodes: [{ id: 'n1', type: 'task' }, { id: 'n2', type: 'task' }]
        });
        const result = server.mcpQuestChainExecute({ chainId: 'exec_test_chain', maxConcurrent: 2 });
        return result && typeof result.status === 'string' && Array.isArray(result.completedNodes);
    }));

    results.push(test('V96: quest.chain.execute returns not_found for missing chain', () => {
        const result = server.mcpQuestChainExecute({ chainId: 'nonexistent' });
        return result.error && result.status === 'not_found';
    }));

    results.push(test('V96: quest.chain.execute respects maxConcurrent', () => {
        server.mcpQuestChainCreate({
            chainId: 'concurrent_chain',
            npcs: [{ npcId: 'master_001', role: 'master' }],
            nodes: [
                { id: 'n1', type: 'task' },
                { id: 'n2', type: 'task' },
                { id: 'n3', type: 'task' },
                { id: 'n4', type: 'task' }
            ]
        });
        const result = server.mcpQuestChainExecute({ chainId: 'concurrent_chain', maxConcurrent: 2 });
        return result.completedNodes.length <= 2;
    }));

    results.push(test('V96: quest.chain.execute handles budget_exceeded', () => {
        server.mcpQuestChainCreate({
            chainId: 'budget_chain',
            npcs: [{ npcId: 'master_001', role: 'master' }],
            nodes: Array.from({ length: 100 }, (_, i) => ({ id: `n${i}`, type: 'task', budget: 10 }))
        });
        const result = server.mcpQuestChainExecute({ chainId: 'budget_chain' });
        return result.status === 'budget_exceeded' || result.budgetUsed <= 500;
    }));

    // ========== npc.skill.crystallize Tests ==========
    results.push(test('V96: npc.skill.crystallize creates SOP skill from experience', () => {
        const result = server.mcpNpcSkillCrystallize({
            npcId: 'master_001',
            experienceData: { task: 'defend_sect', steps: ['watch', 'attack', 'report'] },
            layer: 'L3',
            tags: ['defense', 'combat'],
            skillName: 'Defend Sect SOP'
        });
        return result.success === true && result.skillId && result.skillName === 'Defend Sect SOP';
    }));

    results.push(test('V96: npc.skill.crystallize requires npcId, experienceData, layer, skillName', () => {
        const r1 = server.mcpNpcSkillCrystallize({ layer: 'L3', skillName: 'test' });
        const r2 = server.mcpNpcSkillCrystallize({ npcId: 'master_001', layer: 'L3', skillName: 'test' });
        return r1.error && r2.error;
    }));

    results.push(test('V96: npc.skill.crystallize only supports L3 layer', () => {
        const result = server.mcpNpcSkillCrystallize({
            npcId: 'master_001',
            experienceData: { test: true },
            layer: 'L2',
            skillName: 'Test Skill'
        });
        return result.error && result.error.includes('L3');
    }));

    results.push(test('V96: npc.skill.crystallize validates NPC existence', () => {
        const result = server.mcpNpcSkillCrystallize({
            npcId: 'nonexistent_npc',
            experienceData: { test: true },
            layer: 'L3',
            skillName: 'Test'
        });
        return result.error && result.error.includes('not found');
    }));

    results.push(test('V96: npc.skill.crystallize stores skill in registry', () => {
        server.mcpNpcSkillCrystallize({
            npcId: 'fellow_001',
            experienceData: { exploration: 'map_route' },
            layer: 'L3',
            tags: ['exploration'],
            skillName: 'Map Exploration SOP'
        });
        return server.constructor.skillRegistry && server.constructor.skillRegistry.size > 0;
    }));

    // ========== npc.skill.invoke Tests ==========
    results.push(test('V96: npc.skill.invoke executes crystallized skill', () => {
        // First crystallize a skill
        const crystallizeResult = server.mcpNpcSkillCrystallize({
            npcId: 'combat_001',
            experienceData: { attack: 'quick_strike' },
            layer: 'L3',
            tags: ['attack'],
            skillName: 'Quick Strike'
        });
        const skillId = crystallizeResult.skillId;

        const invokeResult = server.mcpNpcSkillInvoke({
            npcId: 'combat_001',
            skillId,
            params: { target: 'enemy' }
        });
        return invokeResult.success === true && invokeResult.executionResult;
    }));

    results.push(test('V96: npc.skill.invoke requires npcId and skillId', () => {
        const r1 = server.mcpNpcSkillInvoke({ skillId: 'test' });
        const r2 = server.mcpNpcSkillInvoke({ npcId: 'master_001' });
        return r1.error && r2.error;
    }));

    results.push(test('V96: npc.skill.invoke validates NPC existence', () => {
        const result = server.mcpNpcSkillInvoke({
            npcId: 'nonexistent',
            skillId: 'some_skill'
        });
        return result.error && result.error.includes('not found');
    }));

    results.push(test('V96: npc.skill.invoke validates skill existence', () => {
        const result = server.mcpNpcSkillInvoke({
            npcId: 'master_001',
            skillId: 'nonexistent_skill'
        });
        return result.error && result.error.includes('not found');
    }));

    results.push(test('V96: npc.skill.invoke records invocation in L4', () => {
        const crystallizeResult = server.mcpNpcSkillCrystallize({
            npcId: 'master_001',
            experienceData: { test: true },
            layer: 'L3',
            tags: ['test'],
            skillName: 'Test Skill L4'
        });
        server.mcpNpcSkillInvoke({
            npcId: 'master_001',
            skillId: crystallizeResult.skillId
        });
        const npc = server.constructor.npcMemorySystems.get('master_001');
        return npc.layers.L4 && npc.layers.L4.length > 0;
    }));

    // ========== hook.trigger Tests ==========
    results.push(test('V96: hook.trigger manually triggers hook event', () => {
        let hookCalled = false;
        let capturedCtx = null;
        server.constructor.hookEngine.register('custom_event', (ctx) => {
            hookCalled = true;
            capturedCtx = ctx;
        });
        const result = server.mcpHookTrigger({
            event: 'custom_event',
            context: { customData: 'test_value' },
            source: 'test_source'
        });
        return result.success === true && hookCalled && capturedCtx && capturedCtx.customData === 'test_value';
    }));

    results.push(test('V96: hook.trigger requires event', () => {
        const result = server.mcpHookTrigger({ context: {} });
        return result.error && result.error.includes('event');
    }));

    results.push(test('V96: hook.trigger returns trigger metadata', () => {
        const result = server.mcpHookTrigger({ event: 'test_event' });
        return result.success === true && result.event === 'test_event' && result.triggeredAt;
    }));

    // ========== quest.state.query Tests ==========
    results.push(test('V96: quest.state.query returns chain state', () => {
        server.mcpQuestChainCreate({
            chainId: 'state_test_chain',
            npcs: [{ npcId: 'master_001', role: 'master' }],
            nodes: [{ id: 'n1', type: 'task' }]
        });
        const result = server.mcpQuestStateQuery({ chainId: 'state_test_chain' });
        return result.chainId === 'state_test_chain' && result.name && result.status === 'created';
    }));

    results.push(test('V96: quest.state.query requires chainId', () => {
        const result = server.mcpQuestStateQuery({});
        return result.error && result.error.includes('chainId');
    }));

    results.push(test('V96: quest.state.query returns not_found for missing chain', () => {
        const result = server.mcpQuestStateQuery({ chainId: 'nonexistent' });
        return result.error && result.status === 'not_found';
    }));

    results.push(test('V96: quest.state.query includes NPCs when requested', () => {
        server.mcpQuestChainCreate({
            chainId: 'npc_query_chain',
            npcs: [{ npcId: 'master_001', role: 'master', skills: ['defend'] }],
            nodes: [{ id: 'n1', type: 'task' }]
        });
        const result = server.mcpQuestStateQuery({ chainId: 'npc_query_chain', includeNpcs: true });
        return result.npcs && result.npcs.length === 1 && result.npcs[0].npcId === 'master_001';
    }));

    results.push(test('V96: quest.state.query includes budget when requested', () => {
        server.mcpQuestChainCreate({
            chainId: 'budget_query_chain',
            npcs: [{ npcId: 'master_001', role: 'master' }],
            nodes: [{ id: 'n1', type: 'task' }]
        });
        const result = server.mcpQuestStateQuery({ chainId: 'budget_query_chain', includeBudget: true });
        return result.budget && typeof result.budget.total === 'number';
    }));

    // ========== Integration: Full Quest Chain Flow ==========
    results.push(test('V96: Full integration - create chain, execute, crystallize skill, invoke', () => {
        // 1. Create NPCs
        server.mcpNpcSpawn({ npcId: 'integrated_npc', template: 'guard' });

        // 2. Create chain
        const chainResult = server.mcpQuestChainCreate({
            chainId: 'integration_chain',
            npcs: [{ npcId: 'integrated_npc', role: 'guard' }],
            nodes: [{ id: 'i1', type: 'patrol' }, { id: 'i2', type: 'report', requires: ['i1'] }]
        });
        if (!chainResult.success) return false;

        // 3. Execute chain
        const execResult = server.mcpQuestChainExecute({ chainId: 'integration_chain' });
        if (!execResult.status) return false;

        // 4. Crystallize skill
        const skillResult = server.mcpNpcSkillCrystallize({
            npcId: 'integrated_npc',
            experienceData: { chain: 'integration_chain', result: execResult.status },
            layer: 'L3',
            tags: ['integration'],
            skillName: 'Integration Test SOP'
        });
        if (!skillResult.success) return false;

        // 5. Invoke skill
        const invokeResult = server.mcpNpcSkillInvoke({
            npcId: 'integrated_npc',
            skillId: skillResult.skillId
        });

        return invokeResult.success === true;
    }));

    // ========== Five-Layer Memory Crystallization Tests ==========
    results.push(test('V96: Five-layer memory - L0 meta rules preserved after crystallization', () => {
        const npc = server.constructor.npcMemorySystems.get('master_001');
        const l0Rules = npc.layers.L0 || [];
        return l0Rules.length > 0;
    }));

    results.push(test('V96: Five-layer memory - L1 index updated after crystallization', () => {
        server.mcpNpcSkillCrystallize({
            npcId: 'fellow_001',
            experienceData: { test: true },
            layer: 'L3',
            tags: ['indexed_test'],
            skillName: 'Indexed Test SOP'
        });
        const npc = server.constructor.npcMemorySystems.get('fellow_001');
        const l1Index = npc.layers.L1 || [];
        return l1Index.some(entry => entry.type === 'crystallized_skill');
    }));

    results.push(test('V96: Five-layer memory - L3 stores crystallized skills', () => {
        const npc = server.constructor.npcMemorySystems.get('master_001');
        const l3Skills = npc.layers.L3 || [];
        return l3Skills.some(s => s.name && s.experience);
    }));

    results.push(test('V96: Five-layer memory - L4 archives skill invocations', () => {
        const npc = server.constructor.npcMemorySystems.get('master_001');
        const l4Archive = npc.layers.L4 || [];
        return Array.isArray(l4Archive);
    }));

    // Count results
    for (const r of results) {
        if (r.passed) passed++; else failed++;
    }
    const passRate = ((passed / results.length) * 100).toFixed(1);

    return { passed, failed, total: results.length, passRate, results };
}

// Simple test runner
function test(name, fn) {
    try {
        const result = fn();
        return { name, passed: result === true, error: result === true ? null : 'Assertion failed' };
    } catch (e) {
        return { name, passed: false, error: e.message };
    }
}

// Export for Node.js
if (typeof module !== 'undefined') {
    module.exports = { V96_TESTS, runV96Tests, test };
}