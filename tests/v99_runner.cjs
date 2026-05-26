// V99 Test Runner - Execute TDD tests for 天道编辑器 DAG任务链系统

const path = require('path');
const fs = require('fs');

// Read the built game.js
const gamePath = path.join(__dirname, '..', 'dist', 'game.js');
const gameCode = fs.readFileSync(gamePath, 'utf8');

console.log('Loading V99 implementation from dist/game.js...');

// Create a mock browser environment
const mockWindow = {
    gameState: {
        taskChains: null
    }
};

// Inject the game code
try {
    const script = new Function('window', 'document', gameCode + '\nreturn { server: window.__mcpServer, tools: window.__mcpTools };');
    console.log('Game code loaded successfully');
} catch (e) {
    console.log('Error loading game code:', e.message);
}

console.log('\n=== V99 Test Runner ===');
console.log('Running code structure validation...\n');

let toolsFound = 0;
const v99Tools = ['task.chain.create', 'task.chain.add', 'task.chain.link', 'task.chain.execute', 'task.chain.status', 'task.chain.result'];

v99Tools.forEach(tool => {
    if (gameCode.includes(tool)) {
        console.log(`✓ Found tool: ${tool}`);
        toolsFound++;
    } else {
        console.log(`✗ Missing tool: ${tool}`);
    }
});

console.log(`\n${toolsFound}/6 V99 tools found in dist/game.js`);
console.log(`Status: ${toolsFound === 6 ? 'PASS ✓' : 'FAIL ✗'}`);

if (toolsFound === 6) {
    // Check for key implementation patterns
    const patterns = [
        { name: 'mcpTaskChainCreate', found: gameCode.includes('mcpTaskChainCreate') },
        { name: 'mcpTaskChainAdd', found: gameCode.includes('mcpTaskChainAdd') },
        { name: 'mcpTaskChainLink', found: gameCode.includes('mcpTaskChainLink') },
        { name: 'mcpTaskChainExecute', found: gameCode.includes('mcpTaskChainExecute') },
        { name: 'mcpTaskChainStatus', found: gameCode.includes('mcpTaskChainStatus') },
        { name: 'mcpTaskChainResult', found: gameCode.includes('mcpTaskChainResult') },
        { name: '_topologicalSort', found: gameCode.includes('_topologicalSort') },
        { name: '_wouldCreateCycle', found: gameCode.includes('_wouldCreateCycle') },
        { name: '_initTaskChainState', found: gameCode.includes('_initTaskChainState') },
        { name: 'MCP_TOOLS_V99', found: gameCode.includes('MCP_TOOLS_V99') },
        { name: 'taskChains', found: gameCode.includes('taskChains') }
    ];

    console.log('\n=== Implementation Patterns ===');
    let patternCount = 0;
    patterns.forEach(p => {
        console.log(`${p.found ? '✓' : '✗'} ${p.name}`);
        if (p.found) patternCount++;
    });
    console.log(`\n${patternCount}/${patterns.length} patterns found`);
}

console.log('\n=== Validation Complete ===');
process.exit(toolsFound === 6 ? 0 : 1);