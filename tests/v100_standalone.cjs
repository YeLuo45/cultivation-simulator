// V100 Standalone Test Runner
const path = require('path');
const fs = require('fs');

const gamePath = path.join(__dirname, '..', 'dist', 'game.js');
const gameCode = fs.readFileSync(gamePath, 'utf8');

console.log('Loading V100 implementation from dist/game.js...');

let passed = 0, failed = 0;
const results = [];

function test(name, fn) {
    try {
        const result = fn();
        results.push({ name, passed: !!result, error: null });
    } catch (e) {
        results.push({ name, passed: false, error: e.message });
    }
}

// Mock window
global.window = { gameState: { celestialEra: null } };
global.document = {};

// Execute game code
try {
    eval(gameCode);
    console.log('Game code evaluated successfully');
} catch (e) {
    console.log('Error evaluating game code:', e.message);
    process.exit(1);
}

// Get server instance - look for it in various places
let server = null;
if (window.__mcpServer) server = window.__mcpServer;
else if (typeof CultivationMCPServer !== 'undefined') {
    server = new CultivationMCPServer();
}

if (!server) {
    console.log('ERROR: Could not find MCP server');
    process.exit(1);
}

console.log('\n=== V100 TDD Tests ===\n');

// ========== V100 Tool Registry Tests ==========
test('V100: MCP_TOOLS_V100 constant defined', () => {
    return typeof MCP_TOOLS_V100 === 'object' && Object.keys(MCP_TOOLS_V100).length === 6;
});

test('V100: All 6 tools registered in toolRegistry', () => {
    const tools = ['era.info', 'era.enter', 'era.event.trigger', 'era.cycle.advance', 'era.rankings', 'era.reward.claim'];
    return tools.every(t => server.toolRegistry.has(t));
});

test('V100: era.info input schema valid', () => {
    const tool = MCP_TOOLS_V100['era.info'];
    return tool && tool.inputSchema && tool.inputSchema.properties;
});

test('V100: era.enter input schema valid', () => {
    const tool = MCP_TOOLS_V100['era.enter'];
    return tool && tool.inputSchema && tool.inputSchema.required.includes('eraId');
});

test('V100: era.event.trigger input schema valid', () => {
    const tool = MCP_TOOLS_V100['era.event.trigger'];
    return tool && tool.inputSchema && tool.inputSchema.required.includes('eventType');
});

test('V100: era.cycle.advance input schema valid', () => {
    const tool = MCP_TOOLS_V100['era.cycle.advance'];
    return tool && tool.inputSchema;
});

test('V100: era.rankings input schema valid', () => {
    const tool = MCP_TOOLS_V100['era.rankings'];
    return tool && tool.inputSchema;
});

test('V100: era.reward.claim input schema valid', () => {
    const tool = MCP_TOOLS_V100['era.reward.claim'];
    return tool && tool.inputSchema && tool.inputSchema.required.includes('milestoneId');
});

// ========== era.info Tests ==========
test('V100: era.info returns current era info', () => {
    const r1 = server.mcpEraInfo({});
    return r1.era === 1 && r1.phase && r1.day === 1;
});

test('V100: era.info phase name is valid', () => {
    const r1 = server.mcpEraInfo({});
    return ['生机', '鼎盛', '衰败', '至暗', '重生'].includes(r1.phaseName);
});

test('V100: era.info includes activeEvents', () => {
    const r1 = server.mcpEraInfo({});
    return Array.isArray(r1.activeEvents);
});

test('V100: era.info detail mode returns phaseEffects', () => {
    const r1 = server.mcpEraInfo({ detail: true });
    return r1.phaseEffects && r1.phaseEffects.name;
});

test('V100: era.info detail mode returns daysUntilPhaseChange', () => {
    const r1 = server.mcpEraInfo({ detail: true });
    return typeof r1.daysUntilPhaseChange === 'number';
});

// ========== era.enter Tests ==========
test('V100: era.enter requires eraId', () => {
    const r1 = server.mcpEraEnter({});
    return r1.error && r1.error.includes('eraId');
});

test('V100: era.enter rejects eraId < 1', () => {
    const r1 = server.mcpEraEnter({ eraId: 0 });
    return r1.error && r1.error.includes('eraId');
});

test('V100: era.enter rejects invalid mode', () => {
    const r1 = server.mcpEraEnter({ eraId: 1, mode: 'invalid' });
    return r1.error && r1.error.includes('mode');
});

test('V100: era.enter succeeds with valid eraId', () => {
    const r1 = server.mcpEraEnter({ eraId: 1 });
    return r1.success === true && r1.era === 1;
});

test('V100: era.enter returns available phases', () => {
    const r1 = server.mcpEraEnter({ eraId: 2 });
    return r1.availablePhases && r1.availablePhases.length === 5;
});

test('V100: era.enter can switch eras', () => {
    const r1 = server.mcpEraEnter({ eraId: 5, mode: 'dominate' });
    return r1.success === true && r1.era === 5 && r1.mode === 'dominate';
});

// ========== era.event.trigger Tests ==========
test('V100: era.event.trigger requires eventType', () => {
    const r1 = server.mcpEraEventTrigger({});
    return r1.error && r1.error.includes('eventType');
});

test('V100: era.event.trigger rejects invalid event type', () => {
    const r1 = server.mcpEraEventTrigger({ eventType: 'invalid' });
    return r1.error && r1.error.includes('eventType');
});

test('V100: era.event.trigger rejects intensity < 1', () => {
    const r1 = server.mcpEraEventTrigger({ eventType: 'heaven_shake', intensity: 0 });
    return r1.error && r1.error.includes('intensity');
});

test('V100: era.event.trigger rejects intensity > 10', () => {
    const r1 = server.mcpEraEventTrigger({ eventType: 'heaven_shake', intensity: 11 });
    return r1.error && r1.error.includes('intensity');
});

test('V100: era.event.trigger succeeds with valid event', () => {
    const r1 = server.mcpEraEventTrigger({ eventType: 'heaven_shake', intensity: 5 });
    return r1.success === true && r1.event && r1.event.type === 'heaven_shake';
});

test('V100: era.event.trigger returns event with id', () => {
    const r1 = server.mcpEraEventTrigger({ eventType: 'dragon_rise' });
    return r1.event && r1.event.id && r1.event.id.startsWith('evt_');
});

test('V100: era.event.trigger returns all 5 event types', () => {
    const events = ['heaven_shake', 'dragon_rise', 'spirit_storm', 'blood_moon', 'star_fall'];
    return events.every(e => {
        const r = server.mcpEraEventTrigger({ eventType: e });
        return r.success === true;
    });
});

// ========== era.cycle.advance Tests ==========
test('V100: era.cycle.advance rejects steps < 1', () => {
    const r1 = server.mcpEraCycleAdvance({ steps: 0 });
    return r1.error && r1.error.includes('steps');
});

test('V100: era.cycle.advance advances day by 1 by default', () => {
    const r1 = server.mcpEraCycleAdvance({});
    return r1.success === true && r1.stepsAdvanced === 1;
});

test('V100: era.cycle.advance advances multiple steps', () => {
    const r1 = server.mcpEraCycleAdvance({ steps: 10 });
    return r1.success === true && r1.stepsAdvanced === 10;
});

test('V100: era.cycle.advance increments era every 500 days', () => {
    window.gameState.celestialEra = { currentEra: 1, phase: 'grow', day: 499, phases: ['grow', 'peak', 'decay', 'dark', 'reborn'], activeEvents: [], milestones: {}, rankings: { power: [], cultivation: [], combat: [], wealth: [] } };
    const r1 = server.mcpEraCycleAdvance({ steps: 2 });
    return r1.era === 2;
});

test('V100: era.cycle.advance records phase history', () => {
    window.gameState.celestialEra = { currentEra: 1, phase: 'grow', day: 99, phases: ['grow', 'peak', 'decay', 'dark', 'reborn'], activeEvents: [], milestones: {}, rankings: { power: [], cultivation: [], combat: [], wealth: [] } };
    const r1 = server.mcpEraCycleAdvance({ steps: 2 });
    return r1.phaseChanged === true || r1.phase === 'peak';
});

// ========== era.rankings Tests ==========
test('V100: era.rankings rejects invalid category', () => {
    const r1 = server.mcpEraRankings({ category: 'invalid' });
    return r1.error && r1.error.includes('category');
});

test('V100: era.rankings returns rankings for power category', () => {
    const r1 = server.mcpEraRankings({ category: 'power' });
    return r1.rankings && r1.rankings.length > 0;
});

test('V100: era.rankings returns rankings for cultivation category', () => {
    const r1 = server.mcpEraRankings({ category: 'cultivation' });
    return r1.rankings && r1.category === 'cultivation';
});

test('V100: era.rankings returns rankings for combat category', () => {
    const r1 = server.mcpEraRankings({ category: 'combat' });
    return r1.rankings && r1.category === 'combat';
});

test('V100: era.rankings returns rankings for wealth category', () => {
    const r1 = server.mcpEraRankings({ category: 'wealth' });
    return r1.rankings && r1.category === 'wealth';
});

test('V100: era.rankings respects limit parameter', () => {
    const r1 = server.mcpEraRankings({ limit: 3 });
    return r1.rankings && r1.rankings.length <= 3;
});

test('V100: era.rankings includes updatedAt', () => {
    const r1 = server.mcpEraRankings({});
    return r1.updatedAt && r1.updatedAt > 0;
});

test('V100: era.rankings includes player rank when available', () => {
    const r1 = server.mcpEraRankings({});
    return r1.playerRank !== undefined;
});

// ========== era.reward.claim Tests ==========
test('V100: era.reward.claim requires milestoneId', () => {
    const r1 = server.mcpEraRewardClaim({});
    return r1.error && r1.error.includes('milestoneId');
});

test('V100: era.reward.claim fails for non-existent milestone', () => {
    const r1 = server.mcpEraRewardClaim({ milestoneId: 'nonexistent' });
    return r1.error && r1.error.includes('not found');
});

test('V100: era.reward.claim succeeds with valid milestone', () => {
    const era = server._initEraState();
    if (!era.milestones[1]) era.milestones[1] = {};
    era.milestones[1]['first_kill'] = { id: 'first_kill', claimed: false };
    const r1 = server.mcpEraRewardClaim({ milestoneId: 'first_kill' });
    return r1.success === true && r1.reward;
});

test('V100: era.reward.claim marks milestone as claimed', () => {
    const era = server._initEraState();
    if (!era.milestones[1]) era.milestones[1] = {};
    era.milestones[1]['boss_defeat'] = { id: 'boss_defeat', claimed: false };
    server.mcpEraRewardClaim({ milestoneId: 'boss_defeat' });
    return era.milestones[1]['boss_defeat'].claimed === true;
});

test('V100: era.reward.claim fails when already claimed', () => {
    const era = server._initEraState();
    if (!era.milestones[1]) era.milestones[1] = {};
    era.milestones[1]['era_clear'] = { id: 'era_clear', claimed: true, claimedAt: Date.now() };
    const r1 = server.mcpEraRewardClaim({ milestoneId: 'era_clear' });
    return r1.error && r1.error.includes('already claimed');
});

test('V100: era.reward.claim accepts eraId parameter', () => {
    const era = server._initEraState();
    if (!era.milestones[2]) era.milestones[2] = {};
    era.milestones[2]['rank_top10'] = { id: 'rank_top10', claimed: false };
    const r1 = server.mcpEraRewardClaim({ milestoneId: 'rank_top10', eraId: 2 });
    return r1.success === true && r1.era === 2;
});

// ========== Integration Tests ==========
test('V100: Full era flow - info, enter, event, cycle, rankings, reward', () => {
    const info = server.mcpEraInfo({ detail: true });
    const enter = server.mcpEraEnter({ eraId: 2, mode: 'participate' });
    const event = server.mcpEraEventTrigger({ eventType: 'spirit_storm', intensity: 7 });
    const cycle = server.mcpEraCycleAdvance({ steps: 5 });
    const rankings = server.mcpEraRankings({ category: 'power', limit: 5 });
    
    return info.era === 1 && enter.success && event.success && cycle.success && rankings.rankings;
});

test('V100: Era state persistence', () => {
    const era = server._initEraState();
    era.currentEra = 3;
    era.day = 250;
    era.phase = 'peak';
    
    window.gameState.celestialEra = JSON.parse(JSON.stringify(window.gameState.celestialEra));
    const restored = window.gameState.celestialEra;
    
    return restored.currentEra === 3 && restored.day === 250 && restored.phase === 'peak';
});

test('V100: Multiple events can coexist', () => {
    server.mcpEraEventTrigger({ eventType: 'heaven_shake' });
    server.mcpEraEventTrigger({ eventType: 'dragon_rise' });
    server.mcpEraEventTrigger({ eventType: 'blood_moon' });
    const info = server.mcpEraInfo({});
    return info.activeEvents.length >= 3;
});

test('V100: All 6 tools accessible via callTool', () => {
    const tools = [
        { name: 'era.info', args: {} },
        { name: 'era.enter', args: { eraId: 1 } },
        { name: 'era.event.trigger', args: { eventType: 'star_fall' } },
        { name: 'era.cycle.advance', args: { steps: 1 } },
        { name: 'era.rankings', args: { category: 'power' } },
        { name: 'era.reward.claim', args: { milestoneId: 'first_kill' } }
    ];
    
    return tools.every(t => {
        const result = server.callTool(t.name, t.args);
        return result && !result.isError;
    });
});

// ========== Print Results ==========
console.log('\n=== V100 TDD Test Results ===');
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

process.exit(passRate >= 90 ? 0 : 1);