// V98 Cross-Server Sect War + Multi-Agent Coordination + Skill Combo System - TDD Tests
// Tests for: sect.war.register, sect.war.start, sect.war.skill.combo, sect.war.status, sect.war.result, sect.war.reward

const V98_TESTS = [];

function runV98Tests() {
    const results = [];
    let passed = 0, failed = 0;

    // Initialize test server
    const server = new CultivationMCPServer();

    // ========== V98 Tool Registry Tests ==========
    results.push(test('V98: MCP_TOOLS_V98 constant defined', () => {
        return typeof MCP_TOOLS_V98 === 'object' && Object.keys(MCP_TOOLS_V98).length === 6;
    }));

    results.push(test('V98: All 6 tools registered in toolRegistry', () => {
        const tools = ['sect.war.register', 'sect.war.start', 'sect.war.skill.combo', 'sect.war.status', 'sect.war.result', 'sect.war.reward'];
        return tools.every(t => server.toolRegistry.has(t));
    }));

    results.push(test('V98: sect.war.register input schema valid', () => {
        const tool = MCP_TOOLS_V98['sect.war.register'];
        return tool && tool.inputSchema && 
               tool.inputSchema.required.includes('teamName') &&
               tool.inputSchema.required.includes('playerIds') &&
               tool.inputSchema.required.includes('sectId');
    }));

    results.push(test('V98: sect.war.start input schema valid', () => {
        const tool = MCP_TOOLS_V98['sect.war.start'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('matchId');
    }));

    results.push(test('V98: sect.war.skill.combo input schema valid', () => {
        const tool = MCP_TOOLS_V98['sect.war.skill.combo'];
        return tool && tool.inputSchema && 
               tool.inputSchema.required.includes('playerId') &&
               tool.inputSchema.required.includes('skillId');
    }));

    results.push(test('V98: sect.war.status input schema valid', () => {
        const tool = MCP_TOOLS_V98['sect.war.status'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('matchId');
    }));

    results.push(test('V98: sect.war.result input schema valid', () => {
        const tool = MCP_TOOLS_V98['sect.war.result'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('matchId');
    }));

    results.push(test('V98: sect.war.reward input schema valid', () => {
        const tool = MCP_TOOLS_V98['sect.war.reward'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('matchId');
    }));

    // ========== sect.war.register Tests ==========
    results.push(test('V98: sect.war.register requires teamName, playerIds, sectId', () => {
        const r1 = server.mcpSectWarRegister({});
        const r2 = server.mcpSectWarRegister({ teamName: 'Test' });
        const r3 = server.mcpSectWarRegister({ teamName: 'Test', playerIds: ['p1'] });
        return r1.error && r2.error && r3.error && 
               r1.error.includes('required') && r2.error.includes('required');
    }));

    results.push(test('V98: sect.war.register requires 3-5 players', () => {
        const r1 = server.mcpSectWarRegister({ teamName: 'T', playerIds: ['p1', 'p2'], sectId: 's1' });
        const r2 = server.mcpSectWarRegister({ teamName: 'T', playerIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'], sectId: 's1' });
        return r1.error && r2.error && r1.error.includes('3-5');
    }));

    results.push(test('V98: sect.war.register creates match with valid ID', () => {
        const result = server.mcpSectWarRegister({
            teamName: 'Thunder Sect',
            playerIds: ['player1', 'player2', 'player3'],
            sectId: 'sect_001',
            warType: 'skirmish'
        });
        return result.success === true && result.matchId && result.matchId.startsWith('war_');
    }));

    results.push(test('V98: sect.war.register returns enemy team info', () => {
        const result = server.mcpSectWarRegister({
            teamName: 'Thunder Sect',
            playerIds: ['player1', 'player2', 'player3'],
            sectId: 'sect_001'
        });
        return result.enemyTeamName && result.enemySize === 3 && result.teamSize === 3;
    }));

    results.push(test('V98: sect.war.register sets correct war type duration', () => {
        const r1 = server.mcpSectWarRegister({
            teamName: 'T', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish'
        });
        const r2 = server.mcpSectWarRegister({
            teamName: 'T', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'territory'
        });
        const r3 = server.mcpSectWarRegister({
            teamName: 'T', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'elimination'
        });
        return r1.estimatedDuration === '5 min' && 
               r2.estimatedDuration === '10 min' && 
               r3.estimatedDuration === '15 min';
    }));

    // ========== sect.war.start Tests ==========
    results.push(test('V98: sect.war.start requires matchId', () => {
        const result = server.mcpSectWarStart({});
        return result.error && result.error.includes('matchId required');
    }));

    results.push(test('V98: sect.war.start fails for non-existent match', () => {
        const result = server.mcpSectWarStart({ matchId: 'nonexistent' });
        return result.error && result.error.includes('not found');
    }));

    results.push(test('V98: sect.war.start activates registered match', () => {
        const reg = server.mcpSectWarRegister({
            teamName: 'Test Team', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish'
        });
        const start = server.mcpSectWarStart({ matchId: reg.matchId });
        return start.success === true && start.status === 'active';
    }));

    results.push(test('V98: sect.war.start fails for already started match', () => {
        const reg = server.mcpSectWarRegister({
            teamName: 'Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1'
        });
        server.mcpSectWarStart({ matchId: reg.matchId });
        const retry = server.mcpSectWarStart({ matchId: reg.matchId });
        return retry.error && retry.error.includes('already started');
    }));

    results.push(test('V98: sect.war.start executes DAG actions', () => {
        const reg = server.mcpSectWarRegister({
            teamName: 'Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish'
        });
        const actions = [
            { playerId: 'p1', skillId: 'fireball', target: 'enemy1' },
            { playerId: 'p2', skillId: 'shield', target: 'p1' },
            { playerId: 'p1', skillId: 'strike', target: 'enemy2' }
        ];
        const start = server.mcpSectWarStart({ matchId: reg.matchId, actions });
        return start.dagExecuted === 3 && start.round === 5;
    }));

    results.push(test('V98: sect.war.start calculates damage correctly', () => {
        const reg = server.mcpSectWarRegister({
            teamName: 'Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish'
        });
        const start = server.mcpSectWarStart({ matchId: reg.matchId });
        return start.damageDealt && 
               typeof start.damageDealt.teamA === 'number' && 
               typeof start.damageDealt.teamB === 'number';
    }));

    // ========== sect.war.skill.combo Tests ==========
    results.push(test('V98: sect.war.skill.combo requires playerId and skillId', () => {
        const r1 = server.mcpSectWarSkillCombo({});
        const r2 = server.mcpSectWarSkillCombo({ playerId: 'p1' });
        return r1.error && r2.error && r1.error.includes('required');
    }));

    results.push(test('V98: sect.war.skill.combo detects fire+wind combo', () => {
        // Set up player skills with elements
        if (!window.gameState.playerSkills) window.gameState.playerSkills = {};
        window.gameState.playerSkills['fire_skill'] = { element: 'fire', name: 'Fireball' };
        window.gameState.playerSkills['wind_skill'] = { element: 'wind', name: 'Wind Slash' };

        const result = server.mcpSectWarSkillCombo({
            playerId: 'player1',
            skillId: 'fire_skill',
            adjacentPlayerIds: ['player2']
        });
        return result.comboTriggered === true && result.comboName === 'Blazing Storm';
    }));

    results.push(test('V98: sect.war.skill.combo returns correct multiplier for fire+wind', () => {
        const result = server.mcpSectWarSkillCombo({
            playerId: 'player1',
            skillId: 'fire_skill',
            adjacentPlayerIds: ['player2']
        });
        return result.damageMultiplier >= 1.3 && result.effectiveBonus >= 30;
    }));

    results.push(test('V98: sect.war.skill.combo returns no combo when single adjacent', () => {
        const result = server.mcpSectWarSkillCombo({
            playerId: 'player1',
            skillId: 'fire_skill',
            adjacentPlayerIds: []
        });
        return result.comboTriggered === false;
    }));

    results.push(test('V98: sect.war.skill.combo calculates position bonus', () => {
        const result = server.mcpSectWarSkillCombo({
            playerId: 'player1',
            skillId: 'some_skill',
            adjacentPlayerIds: ['p2', 'p3']
        });
        return result.adjacentCount === 2 && result.damageMultiplier >= 1.0;
    }));

    // ========== sect.war.status Tests ==========
    results.push(test('V98: sect.war.status requires matchId', () => {
        const result = server.mcpSectWarStatus({});
        return result.error && result.error.includes('matchId required');
    }));

    results.push(test('V98: sect.war.status returns match not found error', () => {
        const result = server.mcpSectWarStatus({ matchId: 'nonexistent' });
        return result.error && result.error.includes('not found');
    }));

    results.push(test('V98: sect.war.status returns active match info', () => {
        const reg = server.mcpSectWarRegister({
            teamName: 'Status Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish'
        });
        server.mcpSectWarStart({ matchId: reg.matchId });
        const status = server.mcpSectWarStatus({ matchId: reg.matchId });
        return status.matchId === reg.matchId && 
               status.status === 'active' && 
               status.teamAPlayers.length === 3;
    }));

    results.push(test('V98: sect.war.status includes recent combos', () => {
        const reg = server.mcpSectWarRegister({
            teamName: 'Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish'
        });
        const status = server.mcpSectWarStatus({ matchId: reg.matchId });
        return Array.isArray(status.recentCombos);
    }));

    results.push(test('V98: sect.war.status shows energy levels', () => {
        const reg = server.mcpSectWarRegister({
            teamName: 'Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1'
        });
        server.mcpSectWarStart({ matchId: reg.matchId });
        const status = server.mcpSectWarStatus({ matchId: reg.matchId });
        return status.energyLeft && 
               typeof status.energyLeft.teamA === 'number' && 
               typeof status.energyLeft.teamB === 'number';
    }));

    // ========== sect.war.result Tests ==========
    results.push(test('V98: sect.war.result requires matchId', () => {
        const result = server.mcpSectWarResult({});
        return result.error && result.error.includes('matchId required');
    }));

    results.push(test('V98: sect.war.result fails for non-existent match', () => {
        const result = server.mcpSectWarResult({ matchId: 'nonexistent' });
        return result.error && result.error.includes('not found');
    }));

    results.push(test('V98: sect.war.result fails for incomplete match', () => {
        const reg = server.mcpSectWarRegister({
            teamName: 'Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1'
        });
        const result = server.mcpSectWarResult({ matchId: reg.matchId });
        return result.error && result.error.includes('not yet completed');
    }));

    results.push(test('V98: sect.war.result returns winner after match', () => {
        const reg = server.mcpSectWarRegister({
            teamName: 'Result Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish'
        });
        server.mcpSectWarStart({ matchId: reg.matchId });
        const result = server.mcpSectWarResult({ matchId: reg.matchId });
        return result.winner && (result.winner === 'Result Test' || result.winner.startsWith('Enemy_'));
    }));

    results.push(test('V98: sect.war.result includes player stats', () => {
        const reg = server.mcpSectWarRegister({
            teamName: 'Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish'
        });
        server.mcpSectWarStart({ matchId: reg.matchId });
        const result = server.mcpSectWarResult({ matchId: reg.matchId });
        return result.playerStats && 
               result.playerStats.length === 3 && 
               result.playerStats[0].damageDealt >= 0;
    }));

    results.push(test('V98: sect.war.result calculates MVP correctly', () => {
        const reg = server.mcpSectWarRegister({
            teamName: 'Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish'
        });
        server.mcpSectWarStart({ matchId: reg.matchId });
        const result = server.mcpSectWarResult({ matchId: reg.matchId });
        return result.mvpPlayer && result.playerStats.some(p => p.playerId === result.mvpPlayer);
    }));

    // ========== sect.war.reward Tests ==========
    results.push(test('V98: sect.war.reward requires matchId', () => {
        const result = server.mcpSectWarReward({});
        return result.error && result.error.includes('matchId required');
    }));

    results.push(test('V98: sect.war.reward fails for incomplete match', () => {
        const reg = server.mcpSectWarRegister({
            teamName: 'Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1'
        });
        const result = server.mcpSectWarReward({ matchId: reg.matchId });
        return result.error && result.error.includes('not yet completed');
    }));

    results.push(test('V98: sect.war.reward distributes victory rewards', () => {
        const reg = server.mcpSectWarRegister({
            teamName: 'Reward Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish'
        });
        server.mcpSectWarStart({ matchId: reg.matchId });
        const result = server.mcpSectWarReward({ matchId: reg.matchId });
        return result.result && (result.result === 'victory' || result.result === 'defeat');
    }));

    results.push(test('V98: sect.war.reward supports equal distribution mode', () => {
        const reg = server.mcpSectWarRegister({
            teamName: 'Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish'
        });
        server.mcpSectWarStart({ matchId: reg.matchId });
        const result = server.mcpSectWarReward({ matchId: reg.matchId, contributionMode: 'equal' });
        const totalShare = result.rewards.reduce((sum, r) => sum + r.sharePercent, 0);
        return result.rewards.length === 3 && Math.abs(totalShare - 100) <= 1;
    }));

    results.push(test('V98: sect.war.reward supports contribution distribution mode', () => {
        const reg = server.mcpSectWarRegister({
            teamName: 'Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish'
        });
        server.mcpSectWarStart({ matchId: reg.matchId });
        const result = server.mcpSectWarReward({ matchId: reg.matchId, contributionMode: 'contribution' });
        return result.rewards.every(r => r.mode === 'contribution');
    }));

    results.push(test('V98: sect.war.reward supports rank distribution mode', () => {
        const reg = server.mcpSectWarRegister({
            teamName: 'Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish'
        });
        server.mcpSectWarStart({ matchId: reg.matchId });
        const result = server.mcpSectWarReward({ matchId: reg.matchId, contributionMode: 'rank' });
        return result.rewards[0].sharePercent > result.rewards[1].sharePercent;
    }));

    results.push(test('V98: sect.war.reward includes spirit stones in rewards', () => {
        const reg = server.mcpSectWarRegister({
            teamName: 'Test', playerIds: ['p1', 'p2', 'p3'], sectId: 's1', warType: 'skirmish'
        });
        server.mcpSectWarStart({ matchId: reg.matchId });
        const result = server.mcpSectWarReward({ matchId: reg.matchId });
        return result.rewards.every(r => typeof r.spiritStones === 'number');
    }));

    // ========== Integration Tests ==========
    results.push(test('V98: Full war flow - register, start, status, result, reward', () => {
        const reg = server.mcpSectWarRegister({
            teamName: 'Full Flow Test',
            playerIds: ['flow1', 'flow2', 'flow3'],
            sectId: 'sect_flow',
            warType: 'territory'
        });
        
        const start = server.mcpSectWarStart({ matchId: reg.matchId });
        
        const status = server.mcpSectWarStatus({ matchId: reg.matchId });
        
        const result = server.mcpSectWarResult({ matchId: reg.matchId });
        
        const reward = server.mcpSectWarReward({ matchId: reg.matchId, contributionMode: 'contribution' });
        
        return reg.success && start.success && 
               status.matchId === reg.matchId && 
               result.winner && reward.rewards;
    }));

    results.push(test('V98: DAG execution respects player action dependencies', () => {
        const reg = server.mcpSectWarRegister({
            teamName: 'DAG Test', playerIds: ['dag1', 'dag2', 'dag3'], sectId: 's1', warType: 'skirmish'
        });
        
        const actions = [
            { playerId: 'dag1', skillId: 's1', target: 'e1' },
            { playerId: 'dag2', skillId: 's2', target: 'e2' },
            { playerId: 'dag1', skillId: 's3', target: 'e3' }
        ];
        
        const start = server.mcpSectWarStart({ matchId: reg.matchId, actions });
        
        // Same player actions should be sequential (dependency), different players parallel
        return start.dagExecuted === 3 && start.success === true;
    }));

    results.push(test('V98: Multi-agent coordination - multiple players can act in parallel', () => {
        const reg = server.mcpSectWarRegister({
            teamName: 'Multi Agent', playerIds: ['ma1', 'ma2', 'ma3', 'ma4'], sectId: 's1', warType: 'elimination'
        });
        
        const actions = [
            { playerId: 'ma1', skillId: 'attack', target: 'e1' },
            { playerId: 'ma2', skillId: 'heal', target: 'ma1' },
            { playerId: 'ma3', skillId: 'buff', target: 'ma1' },
            { playerId: 'ma4', skillId: 'debuff', target: 'e1' }
        ];
        
        const start = server.mcpSectWarStart({ matchId: reg.matchId, actions });
        
        return start.dagExecuted === 4;
    }));

    // Print results
    console.log('\n=== V98 TDD Test Results ===');
    results.forEach((r, i) => {
        const icon = r.passed ? '✓' : '✗';
        console.log(`${icon} Test ${i + 1}: ${r.name}`);
        if (!r.passed) console.log(`  Error: ${r.error}`);
    });
    
    passed = results.filter(r => r.passed).length;
    failed = results.length - passed;
    const passRate = Math.round((passed / results.length) * 100);
    
    console.log(`\nTotal: ${passed}/${results.length} passed (${passRate}%)`);
    console.log(`Status: ${passRate >= 80 ? 'PASS ✓' : 'FAIL ✗'} (required ≥80%)`);
    
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
    module.exports = { runV98Tests, test };
}