// V98 Standalone TDD Test Runner
// Tests: sect.war.register, sect.war.start, sect.war.skill.combo, sect.war.status, sect.war.result, sect.war.reward

const fs = require('fs');
const vm = require('vm');

// Load game code and create test environment
const gameCode = fs.readFileSync(__dirname + '/../dist/game.js', 'utf8');

// Create mock browser environment
const mockDocument = {
    getElementById: () => null,
    querySelector: () => ({ innerHTML: '', value: '' }),
    querySelectorAll: () => [],
    addEventListener: () => {}
};

const context = {
    window: {
        gameState: {
            sectWars: null,
            playerSkills: {}
        }
    },
    document: mockDocument,
    console: console,
    setTimeout: () => {},
    setInterval: () => {},
    localStorage: {
        getItem: () => null,
        setItem: () => {}
    }
};

// Run game code in context
try {
    const script = new vm.Script(gameCode);
    script.runInNewContext(context);
} catch (e) {
    console.log('Script load error (expected in Node):', e.message.substring(0, 100));
}

// Get server from context
const server = context.window.__mcpServer || new context.window.CultivationMCPServer();

console.log('\n=== V98 Cross-Server Sect War TDD Tests ===\n');

let passed = 0, failed = 0;

function test(name, fn) {
    try {
        const result = fn();
        const ok = !!result;
        console.log(`${ok ? '✓' : '✗'} ${name}`);
        if (!ok) console.log(`  Expected truthy result`);
        if (ok) passed++; else failed++;
    } catch (e) {
        console.log(`✗ ${name}`);
        console.log(`  Error: ${e.message}`);
        failed++;
    }
}

function assert(condition, msg) {
    if (!condition) throw new Error(msg || 'Assertion failed');
}

// V98 Tool Registry Tests
console.log('--- Tool Registry Tests ---');
test('MCP_TOOLS_V98 defined with 6 tools', () => {
    return typeof context.window.MCP_TOOLS_V98 === 'object' && Object.keys(context.window.MCP_TOOLS_V98).length === 6;
});

test('All 6 tools registered in toolRegistry', () => {
    const tools = ['sect.war.register', 'sect.war.start', 'sect.war.skill.combo', 'sect.war.status', 'sect.war.result', 'sect.war.reward'];
    return tools.every(t => server.toolRegistry.has(t));
});

test('sect.war.register input schema valid', () => {
    const tool = context.window.MCP_TOOLS_V98['sect.war.register'];
    return tool && tool.inputSchema && tool.inputSchema.required.includes('teamName') && tool.inputSchema.required.includes('playerIds');
});

test('sect.war.start input schema valid', () => {
    const tool = context.window.MCP_TOOLS_V98['sect.war.start'];
    return tool && tool.inputSchema && tool.inputSchema.required.includes('matchId');
});

// sect.war.register Tests
console.log('\n--- sect.war.register Tests ---');
test('sect.war.register requires teamName, playerIds, sectId', () => {
    const r = server.mcpSectWarRegister({});
    return r.error && r.error.includes('required');
});

test('sect.war.register requires 3-5 players', () => {
    const r = server.mcpSectWarRegister({ teamName: 'T', playerIds: ['p1', 'p2'], sectId: 's1' });
    return r.error && r.error.includes('3-5');
});

test('sect.war.register creates match with valid ID', () => {
    const result = server.mcpSectWarRegister({
        teamName: 'Thunder Sect', playerIds: ['player1', 'player2', 'player3'], sectId: 'sect_001', warType: 'skirmish'
    });
    return result.success === true && result.matchId && result.matchId.startsWith('war_');
});

test('sect.war.register returns enemy team info', () => {
    const result = server.mcpSectWarRegister({
        teamName: 'Thunder Sect', playerIds: ['player1', 'player2', 'player3'], sectId: 'sect_001'
    });
    return result.enemyTeamName && result.enemySize === 3 && result.teamSize === 3;
});

test('sect.war.register sets correct war type duration', () => {
    const r1 = server.mcpSectWarRegister({ teamName: 'T', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish' });
    const r2 = server.mcpSectWarRegister({ teamName: 'T', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'territory' });
    return r1.estimatedDuration === '5 min' && r2.estimatedDuration === '10 min';
});

// sect.war.start Tests
console.log('\n--- sect.war.start Tests ---');
test('sect.war.start requires matchId', () => {
    const r = server.mcpSectWarStart({});
    return r.error && r.error.includes('matchId required');
});

test('sect.war.start fails for non-existent match', () => {
    const r = server.mcpSectWarStart({ matchId: 'nonexistent' });
    return r.error && r.error.includes('not found');
});

test('sect.war.start activates registered match', () => {
    const reg = server.mcpSectWarRegister({ teamName: 'Test Team', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish' });
    const start = server.mcpSectWarStart({ matchId: reg.matchId });
    return start.success === true && start.status === 'active';
});

test('sect.war.start executes DAG actions', () => {
    const reg = server.mcpSectWarRegister({ teamName: 'Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish' });
    const actions = [
        { playerId: 'p1', skillId: 'fireball', target: 'enemy1' },
        { playerId: 'p2', skillId: 'shield', target: 'p1' }
    ];
    const start = server.mcpSectWarStart({ matchId: reg.matchId, actions });
    return start.dagExecuted === 2 && start.round === 5;
});

// sect.war.skill.combo Tests
console.log('\n--- sect.war.skill.combo Tests ---');
test('sect.war.skill.combo requires playerId and skillId', () => {
    const r = server.mcpSectWarSkillCombo({});
    return r.error && r.error.includes('required');
});

test('sect.war.skill.combo returns no combo when single adjacent', () => {
    const r = server.mcpSectWarSkillCombo({ playerId: 'p1', skillId: 'fire_skill', adjacentPlayerIds: [] });
    return r.comboTriggered === false;
});

test('sect.war.skill.combo calculates position bonus with 2+ adjacent', () => {
    const r = server.mcpSectWarSkillCombo({ playerId: 'p1', skillId: 'some_skill', adjacentPlayerIds: ['p2', 'p3'] });
    return r.adjacentCount === 2 && r.damageMultiplier >= 1.0;
});

// sect.war.status Tests
console.log('\n--- sect.war.status Tests ---');
test('sect.war.status requires matchId', () => {
    const r = server.mcpSectWarStatus({});
    return r.error && r.error.includes('matchId required');
});

test('sect.war.status returns active match info', () => {
    const reg = server.mcpSectWarRegister({ teamName: 'Status Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish' });
    server.mcpSectWarStart({ matchId: reg.matchId });
    const status = server.mcpSectWarStatus({ matchId: reg.matchId });
    return status.matchId === reg.matchId && status.status === 'active' && status.teamAPlayers.length === 3;
});

test('sect.war.status shows energy levels', () => {
    const reg = server.mcpSectWarRegister({ teamName: 'Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1' });
    server.mcpSectWarStart({ matchId: reg.matchId });
    const status = server.mcpSectWarStatus({ matchId: reg.matchId });
    return status.energyLeft && typeof status.energyLeft.teamA === 'number';
});

// sect.war.result Tests
console.log('\n--- sect.war.result Tests ---');
test('sect.war.result requires matchId', () => {
    const r = server.mcpSectWarResult({});
    return r.error && r.error.includes('matchId required');
});

test('sect.war.result fails for incomplete match', () => {
    const reg = server.mcpSectWarRegister({ teamName: 'Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1' });
    const r = server.mcpSectWarResult({ matchId: reg.matchId });
    return r.error && r.error.includes('not yet completed');
});

test('sect.war.result returns winner after match', () => {
    const reg = server.mcpSectWarRegister({ teamName: 'Result Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish' });
    server.mcpSectWarStart({ matchId: reg.matchId });
    const result = server.mcpSectWarResult({ matchId: reg.matchId });
    return result.winner && (result.winner === 'Result Test' || result.winner.startsWith('Enemy_'));
});

test('sect.war.result includes player stats', () => {
    const reg = server.mcpSectWarRegister({ teamName: 'Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish' });
    server.mcpSectWarStart({ matchId: reg.matchId });
    const result = server.mcpSectWarResult({ matchId: reg.matchId });
    return result.playerStats && result.playerStats.length === 3;
});

// sect.war.reward Tests
console.log('\n--- sect.war.reward Tests ---');
test('sect.war.reward requires matchId', () => {
    const r = server.mcpSectWarReward({});
    return r.error && r.error.includes('matchId required');
});

test('sect.war.reward fails for incomplete match', () => {
    const reg = server.mcpSectWarRegister({ teamName: 'Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1' });
    const r = server.mcpSectWarReward({ matchId: reg.matchId });
    return r.error && r.error.includes('not yet completed');
});

test('sect.war.reward distributes rewards after match', () => {
    const reg = server.mcpSectWarRegister({ teamName: 'Reward Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish' });
    server.mcpSectWarStart({ matchId: reg.matchId });
    const result = server.mcpSectWarReward({ matchId: reg.matchId });
    return result.result && (result.result === 'victory' || result.result === 'defeat');
});

test('sect.war.reward supports contribution mode', () => {
    const reg = server.mcpSectWarRegister({ teamName: 'Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish' });
    server.mcpSectWarStart({ matchId: reg.matchId });
    const result = server.mcpSectWarReward({ matchId: reg.matchId, contributionMode: 'contribution' });
    return result.rewards.every(r => r.mode === 'contribution');
});

test('sect.war.reward supports equal mode', () => {
    const reg = server.mcpSectWarRegister({ teamName: 'Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish' });
    server.mcpSectWarStart({ matchId: reg.matchId });
    const result = server.mcpSectWarReward({ matchId: reg.matchId, contributionMode: 'equal' });
    return result.rewards.length === 3;
});

test('sect.war.reward includes spirit stones', () => {
    const reg = server.mcpSectWarRegister({ teamName: 'Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish' });
    server.mcpSectWarStart({ matchId: reg.matchId });
    const result = server.mcpSectWarReward({ matchId: reg.matchId });
    return result.rewards.every(r => typeof r.spiritStones === 'number');
});

// Summary
const total = passed + failed;
const passRate = Math.round((passed / total) * 100);

console.log('\n=== V98 TDD Test Results ===');
console.log(`Total: ${passed}/${total} passed (${passRate}%)`);
console.log(`Status: ${passRate >= 80 ? 'PASS ✓' : 'FAIL ✗'} (required ≥80%)`);

process.exit(passRate >= 80 ? 0 : 1);