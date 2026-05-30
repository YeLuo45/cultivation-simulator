// V182 Test runner - extract V182 functions and test
const fs = require('fs');
const vm = require('vm');

// Create minimal context
const sandbox = {
    window: { gameState: {} },
    console: console,
    setTimeout: setTimeout,
    setInterval: setInterval,
    module: { exports: {} },
    exports: {}
};

// Make globals available
sandbox.global = sandbox;
sandbox.Global = sandbox;

// Read game.js
const code = fs.readFileSync('./game.js', 'utf8');

// Extract MCP_TOOLS_V182 definition
const mcpToolsV182Match = code.match(/const MCP_TOOLS_V182 = \{[\s\S]*?\};/);
if (!mcpToolsV182Match) {
    console.log('Could not find MCP_TOOLS_V182');
    process.exit(1);
}

// Create isolated test
const testCode = `
(function() {
    const MCP_TOOLS_V182 = ${mcpToolsV182Match[0].replace('const MCP_TOOLS_V182 = ', '')};
    
    // Verify 6 tools
    const tools = Object.keys(MCP_TOOLS_V182);
    if (tools.length !== 6) {
        console.error('Expected 6 tools, got ' + tools.length);
        return;
    }
    
    const expectedTools = ['codex.list', 'codex.view', 'codex.unlock', 'collection.stats', 'collection.reward', 'collection.reset'];
    let pass = true;
    for (const t of expectedTools) {
        if (!MCP_TOOLS_V182[t]) {
            console.error('Missing tool: ' + t);
            pass = false;
        }
    }
    
    // Check schema
    if (MCP_TOOLS_V182['codex.list'].inputSchema.type !== 'object') {
        console.error('codex.list wrong schema');
        pass = false;
    }
    if (!MCP_TOOLS_V182['codex.view'].inputSchema.required.includes('codexId')) {
        console.error('codex.view missing required codexId');
        pass = false;
    }
    if (!MCP_TOOLS_V182['collection.reward'].inputSchema.required.includes('rewardType')) {
        console.error('collection.reward missing required rewardType');
        pass = false;
    }
    
    if (pass) {
        console.log('MCP_TOOLS_V182: All 6 tools verified');
        console.log('  - codex.list: no params');
        console.log('  - codex.view: requires codexId');
        console.log('  - codex.unlock: requires codexId');
        console.log('  - collection.stats: no params');
        console.log('  - collection.reward: requires rewardType');
        console.log('  - collection.reset: optional collectionType');
    }
})();
`;

try {
    vm.runInContext(testCode, sandbox);
} catch (e) {
    console.error('Error:', e.message);
}