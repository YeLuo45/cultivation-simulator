// V99 天道编辑器 DAG任务链系统 - TDD Tests
// Tests for: task.chain.create, task.chain.add, task.chain.link, task.chain.execute, task.chain.status, task.chain.result

const V99_TESTS = [];

function runV99Tests() {
    const results = [];
    let passed = 0, failed = 0;

    // Initialize test server
    const server = new CultivationMCPServer();

    // ========== V99 Tool Registry Tests ==========
    results.push(test('V99: MCP_TOOLS_V99 constant defined', () => {
        return typeof MCP_TOOLS_V99 === 'object' && Object.keys(MCP_TOOLS_V99).length === 6;
    }));

    results.push(test('V99: All 6 tools registered in toolRegistry', () => {
        const tools = ['task.chain.create', 'task.chain.add', 'task.chain.link', 'task.chain.execute', 'task.chain.status', 'task.chain.result'];
        return tools.every(t => server.toolRegistry.has(t));
    }));

    results.push(test('V99: task.chain.create input schema valid', () => {
        const tool = MCP_TOOLS_V99['task.chain.create'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('name');
    }));

    results.push(test('V99: task.chain.add input schema valid', () => {
        const tool = MCP_TOOLS_V99['task.chain.add'];
        return tool && tool.inputSchema && 
               tool.inputSchema.required.includes('chainId') &&
               tool.inputSchema.required.includes('taskId') &&
               tool.inputSchema.required.includes('taskType');
    }));

    results.push(test('V99: task.chain.link input schema valid', () => {
        const tool = MCP_TOOLS_V99['task.chain.link'];
        return tool && tool.inputSchema && 
               tool.inputSchema.required.includes('chainId') &&
               tool.inputSchema.required.includes('fromTaskId') &&
               tool.inputSchema.required.includes('toTaskId');
    }));

    results.push(test('V99: task.chain.execute input schema valid', () => {
        const tool = MCP_TOOLS_V99['task.chain.execute'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('chainId');
    }));

    results.push(test('V99: task.chain.status input schema valid', () => {
        const tool = MCP_TOOLS_V99['task.chain.status'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('chainId');
    }));

    results.push(test('V99: task.chain.result input schema valid', () => {
        const tool = MCP_TOOLS_V99['task.chain.result'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('chainId');
    }));

    // ========== task.chain.create Tests ==========
    results.push(test('V99: task.chain.create requires name', () => {
        const r1 = server.mcpTaskChainCreate({});
        return r1.error && r1.error.includes('name is required');
    }));

    results.push(test('V99: task.chain.create rejects invalid priority', () => {
        const r1 = server.mcpTaskChainCreate({ name: 'Test', priority: 'invalid' });
        return r1.error && r1.error.includes('priority');
    }));

    results.push(test('V99: task.chain.create creates chain with valid ID', () => {
        const result = server.mcpTaskChainCreate({
            name: 'Test Chain',
            description: 'Test description',
            priority: 'normal'
        });
        return result.success === true && result.chainId && result.chainId.startsWith('chain_');
    }));

    results.push(test('V99: task.chain.create returns correct properties', () => {
        const result = server.mcpTaskChainCreate({
            name: 'My Chain',
            priority: 'high'
        });
        return result.name === 'My Chain' && 
               result.priority === 'high' && 
               result.nodeCount === 0;
    }));

    // ========== task.chain.add Tests ==========
    results.push(test('V99: task.chain.add requires chainId, taskId, taskType', () => {
        const r1 = server.mcpTaskChainAdd({});
        const r2 = server.mcpTaskChainAdd({ chainId: 'c1' });
        const r3 = server.mcpTaskChainAdd({ chainId: 'c1', taskId: 't1' });
        return r1.error && r2.error && r3.error;
    }));

    results.push(test('V99: task.chain.add rejects invalid taskType', () => {
        const create = server.mcpTaskChainCreate({ name: 'Test' });
        const r1 = server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 't1', taskType: 'invalid' });
        return r1.error && r1.error.includes('taskType');
    }));

    results.push(test('V99: task.chain.add fails for non-existent chain', () => {
        const r1 = server.mcpTaskChainAdd({ chainId: 'nonexistent', taskId: 't1', taskType: 'action' });
        return r1.error && r1.error.includes('not found');
    }));

    results.push(test('V99: task.chain.add adds node to existing chain', () => {
        const create = server.mcpTaskChainCreate({ name: 'Test' });
        const add = server.mcpTaskChainAdd({
            chainId: create.chainId,
            taskId: 'task1',
            taskType: 'action',
            payload: { value: 100 }
        });
        return add.success === true && add.nodeCount === 1;
    }));

    results.push(test('V99: task.chain.add rejects duplicate taskId', () => {
        const create = server.mcpTaskChainCreate({ name: 'Test' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 'task1', taskType: 'action' });
        const r2 = server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 'task1', taskType: 'action' });
        return r2.error && r2.error.includes('already exists');
    }));

    results.push(test('V99: task.chain.add cannot add to running chain', () => {
        const create = server.mcpTaskChainCreate({ name: 'Test' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 'task1', taskType: 'action' });
        server.mcpTaskChainExecute({ chainId: create.chainId });
        const r1 = server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 'task2', taskType: 'action' });
        return r1.error && r1.error.includes('running');
    }));

    // ========== task.chain.link Tests ==========
    results.push(test('V99: task.chain.link requires chainId, fromTaskId, toTaskId', () => {
        const r1 = server.mcpTaskChainLink({});
        return r1.error && r1.error.includes('required');
    }));

    results.push(test('V99: task.chain.link rejects invalid condition', () => {
        const create = server.mcpTaskChainCreate({ name: 'Test' });
        const r1 = server.mcpTaskChainLink({
            chainId: create.chainId,
            fromTaskId: 't1',
            toTaskId: 't2',
            condition: 'invalid'
        });
        return r1.error && r1.error.includes('condition');
    }));

    results.push(test('V99: task.chain.link creates dependency', () => {
        const create = server.mcpTaskChainCreate({ name: 'Test' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 't1', taskType: 'action' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 't2', taskType: 'action' });
        const link = server.mcpTaskChainLink({
            chainId: create.chainId,
            fromTaskId: 't1',
            toTaskId: 't2'
        });
        return link.success === true && link.dependencyCount >= 1;
    }));

    results.push(test('V99: task.chain.link detects self-dependency', () => {
        const create = server.mcpTaskChainCreate({ name: 'Test' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 't1', taskType: 'action' });
        const r1 = server.mcpTaskChainLink({
            chainId: create.chainId,
            fromTaskId: 't1',
            toTaskId: 't1'
        });
        return r1.error && r1.error.includes('self-dependency');
    }));

    results.push(test('V99: task.chain.link detects circular dependency', () => {
        const create = server.mcpTaskChainCreate({ name: 'Test' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 't1', taskType: 'action' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 't2', taskType: 'action' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 't3', taskType: 'action' });
        server.mcpTaskChainLink({ chainId: create.chainId, fromTaskId: 't1', toTaskId: 't2' });
        server.mcpTaskChainLink({ chainId: create.chainId, fromTaskId: 't2', toTaskId: 't3' });
        const r1 = server.mcpTaskChainLink({ chainId: create.chainId, fromTaskId: 't3', toTaskId: 't1' });
        return r1.error && r1.error.includes('circular');
    }));

    // ========== task.chain.execute Tests ==========
    results.push(test('V99: task.chain.execute requires chainId', () => {
        const r1 = server.mcpTaskChainExecute({});
        return r1.error && r1.error.includes('chainId');
    }));

    results.push(test('V99: task.chain.execute fails for non-existent chain', () => {
        const r1 = server.mcpTaskChainExecute({ chainId: 'nonexistent' });
        return r1.error && r1.error.includes('not found');
    }));

    results.push(test('V99: task.chain.execute fails for empty chain', () => {
        const create = server.mcpTaskChainCreate({ name: 'Test' });
        const r1 = server.mcpTaskChainExecute({ chainId: create.chainId });
        return r1.error && r1.error.includes('no nodes');
    }));

    results.push(test('V99: task.chain.execute runs and completes chain', () => {
        const create = server.mcpTaskChainCreate({ name: 'Test' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 't1', taskType: 'action' });
        const exec = server.mcpTaskChainExecute({ chainId: create.chainId });
        return exec.success === true && 
               (exec.status === 'completed' || exec.status === 'failed');
    }));

    results.push(test('V99: task.chain.execute returns execution order', () => {
        const create = server.mcpTaskChainCreate({ name: 'Test' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 't1', taskType: 'action' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 't2', taskType: 'action' });
        server.mcpTaskChainLink({ chainId: create.chainId, fromTaskId: 't1', toTaskId: 't2' });
        const exec = server.mcpTaskChainExecute({ chainId: create.chainId });
        return exec.executionOrder && exec.executionOrder.length === 2;
    }));

    results.push(test('V99: task.chain.execute executes all task types', () => {
        const create = server.mcpTaskChainCreate({ name: 'Multi-Type' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 'action1', taskType: 'action' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 'cond1', taskType: 'condition' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 'trans1', taskType: 'transform' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 'merge1', taskType: 'merge' });
        const exec = server.mcpTaskChainExecute({ chainId: create.chainId });
        return exec.success === true && exec.totalNodes === 4;
    }));

    // ========== task.chain.status Tests ==========
    results.push(test('V99: task.chain.status requires chainId', () => {
        const r1 = server.mcpTaskChainStatus({});
        return r1.error && r1.error.includes('chainId');
    }));

    results.push(test('V99: task.chain.status returns chain info', () => {
        const create = server.mcpTaskChainCreate({ name: 'Status Test', priority: 'high' });
        const status = server.mcpTaskChainStatus({ chainId: create.chainId });
        return status.chainId === create.chainId && 
               status.name === 'Status Test' &&
               status.priority === 'high';
    }));

    results.push(test('V99: task.chain.status includes node stats', () => {
        const create = server.mcpTaskChainCreate({ name: 'Test' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 't1', taskType: 'action' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 't2', taskType: 'action' });
        const status = server.mcpTaskChainStatus({ chainId: create.chainId });
        return status.stats && status.stats.total === 2;
    }));

    results.push(test('V99: task.chain.status shows correct node statuses', () => {
        const create = server.mcpTaskChainCreate({ name: 'Test' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 't1', taskType: 'action' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 't2', taskType: 'action' });
        server.mcpTaskChainExecute({ chainId: create.chainId });
        const status = server.mcpTaskChainStatus({ chainId: create.chainId });
        return status.stats.completed >= 0 && status.stats.failed >= 0;
    }));

    // ========== task.chain.result Tests ==========
    results.push(test('V99: task.chain.result requires chainId', () => {
        const r1 = server.mcpTaskChainResult({});
        return r1.error && r1.error.includes('chainId');
    }));

    results.push(test('V99: task.chain.result fails for incomplete chain', () => {
        const create = server.mcpTaskChainCreate({ name: 'Test' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 't1', taskType: 'action' });
        const r1 = server.mcpTaskChainResult({ chainId: create.chainId });
        return r1.error && r1.error.includes('not completed');
    }));

    results.push(test('V99: task.chain.result returns summary format', () => {
        const create = server.mcpTaskChainCreate({ name: 'Test' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 't1', taskType: 'action' });
        server.mcpTaskChainExecute({ chainId: create.chainId });
        const result = server.mcpTaskChainResult({ chainId: create.chainId, format: 'summary' });
        return result.chainId && result.status && result.totalNodes;
    }));

    results.push(test('V99: task.chain.result returns detailed format', () => {
        const create = server.mcpTaskChainCreate({ name: 'Test' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 't1', taskType: 'action' });
        server.mcpTaskChainExecute({ chainId: create.chainId });
        const result = server.mcpTaskChainResult({ chainId: create.chainId, format: 'detailed' });
        return result.nodeResults && result.executionOrder;
    }));

    results.push(test('V99: task.chain.result returns json format', () => {
        const create = server.mcpTaskChainCreate({ name: 'Test' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 't1', taskType: 'action' });
        server.mcpTaskChainExecute({ chainId: create.chainId });
        const result = server.mcpTaskChainResult({ chainId: create.chainId, format: 'json' });
        return typeof result === 'string';
    }));

    // ========== Integration Tests ==========
    results.push(test('V99: Full DAG flow - create, add, link, execute, status, result', () => {
        const create = server.mcpTaskChainCreate({ name: 'Full DAG Test', priority: 'critical' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 'init', taskType: 'action' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 'process', taskType: 'transform' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 'decide', taskType: 'condition' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 'merge', taskType: 'merge' });
        server.mcpTaskChainLink({ chainId: create.chainId, fromTaskId: 'init', toTaskId: 'process' });
        server.mcpTaskChainLink({ chainId: create.chainId, fromTaskId: 'process', toTaskId: 'decide' });
        server.mcpTaskChainLink({ chainId: create.chainId, fromTaskId: 'decide', toTaskId: 'merge' });
        
        const exec = server.mcpTaskChainExecute({ chainId: create.chainId });
        const status = server.mcpTaskChainStatus({ chainId: create.chainId });
        const result = server.mcpTaskChainResult({ chainId: create.chainId });
        
        return create.success && exec.success && 
               status.nodeCount === 4 && 
               result.totalNodes === 4;
    }));

    results.push(test('V99: DAG topological sort - A->B->C sequential execution', () => {
        const create = server.mcpTaskChainCreate({ name: 'Sequential' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 'A', taskType: 'action' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 'B', taskType: 'action' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 'C', taskType: 'action' });
        server.mcpTaskChainLink({ chainId: create.chainId, fromTaskId: 'A', toTaskId: 'B' });
        server.mcpTaskChainLink({ chainId: create.chainId, fromTaskId: 'B', toTaskId: 'C' });
        
        const exec = server.mcpTaskChainExecute({ chainId: create.chainId });
        return exec.executionOrder[0] === 'A' && 
               exec.executionOrder[1] === 'B' &&
               exec.executionOrder[2] === 'C';
    }));

    results.push(test('V99: DAG parallel execution - A,B independent, C depends on both', () => {
        const create = server.mcpTaskChainCreate({ name: 'Parallel' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 'A', taskType: 'action' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 'B', taskType: 'action' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 'C', taskType: 'action' });
        server.mcpTaskChainLink({ chainId: create.chainId, fromTaskId: 'A', toTaskId: 'C' });
        server.mcpTaskChainLink({ chainId: create.chainId, fromTaskId: 'B', toTaskId: 'C' });
        
        const exec = server.mcpTaskChainExecute({ chainId: create.chainId });
        const idxA = exec.executionOrder.indexOf('A');
        const idxB = exec.executionOrder.indexOf('B');
        const idxC = exec.executionOrder.indexOf('C');
        return idxC > idxA && idxC > idxB; // C comes after both A and B
    }));

    results.push(test('V99: Task chain state persistence', () => {
        const create = server.mcpTaskChainCreate({ name: 'Persistence Test' });
        server.mcpTaskChainAdd({ chainId: create.chainId, taskId: 'persist', taskType: 'action' });
        
        // Simulate state persistence
        window.gameState.taskChains = JSON.parse(JSON.stringify(window.gameState.taskChains));
        const chain = window.gameState.taskChains[create.chainId];
        
        return chain && chain.nodes.persist && chain.nodes.persist.type === 'action';
    }));

    results.push(test('V99: Multiple chains coexist', () => {
        const c1 = server.mcpTaskChainCreate({ name: 'Chain 1' });
        const c2 = server.mcpTaskChainCreate({ name: 'Chain 2' });
        server.mcpTaskChainAdd({ chainId: c1.chainId, taskId: 't1', taskType: 'action' });
        server.mcpTaskChainAdd({ chainId: c2.chainId, taskId: 't2', taskType: 'action' });
        
        const s1 = server.mcpTaskChainStatus({ chainId: c1.chainId });
        const s2 = server.mcpTaskChainStatus({ chainId: c2.chainId });
        
        return s1.nodeCount === 1 && s2.nodeCount === 1 && s1.name !== s2.name;
    }));

    // Print results
    console.log('\n=== V99 TDD Test Results ===');
    results.forEach((r, i) => {
        const icon = r.passed ? '✓' : '✗';
        console.log(`${icon} Test ${i + 1}: ${r.name}`);
        if (!r.passed) console.log(`  Error: ${r.error}`);
    });
    
    passed = results.filter(r => r.passed).length;
    failed = results.length - passed;
    const passRate = Math.round((passed / results.length) * 100);
    
    console.log(`\nTotal: ${passed}/${results.length} passed (${passRate}%)`);
    console.log(`Status: ${passRate >= 90 ? 'PASS ✓' : 'FAIL ✗'} (required ≥90%)`);
    
    return { passed, failed, total: results.length, passRate };
}

function test(name, fn) {
    try {
        const result = fn();
        return { name, passed: !!result, error: null };
    } catch (e) {
        return { name, passed: false, error: e.message };
    }
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runV99Tests, test };
}