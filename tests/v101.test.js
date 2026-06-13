// V101 仙盟系统 仙盟创建+领地争夺 - TDD Tests
// Tests for: alliance.create, alliance.join, alliance.contribute, alliance.territory.claim, alliance.skill.unlock, alliance.members.list

const V101_TESTS = [];

function runV101Tests() {
    const results = [];
    let passed = 0, failed = 0;

    // Initialize test server with mock window
    const mockWindow = {
        gameState: {
            playerId: 'player_1',
            playerName: '测试玩家',
            alliances: null
        }
    };
    
    // Create server with mocked window
    global.window = mockWindow;
    const server = new CultivationMCPServer();

    // ========== V101 Tool Registry Tests ==========
    results.push(test('V101: MCP_TOOLS_V101 constant defined', () => {
        return typeof MCP_TOOLS_V101 === 'object' && Object.keys(MCP_TOOLS_V101).length === 6;
    }));

    results.push(test('V101: All 6 tools registered in toolRegistry', () => {
        const tools = ['alliance.create', 'alliance.join', 'alliance.contribute', 'alliance.territory.claim', 'alliance.skill.unlock', 'alliance.members.list'];
        return tools.every(t => server.toolRegistry.has(t));
    }));

    results.push(test('V101: alliance.create input schema valid', () => {
        const tool = MCP_TOOLS_V101['alliance.create'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('name');
    }));

    results.push(test('V101: alliance.join input schema valid', () => {
        const tool = MCP_TOOLS_V101['alliance.join'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('allianceId');
    }));

    results.push(test('V101: alliance.contribute input schema valid', () => {
        const tool = MCP_TOOLS_V101['alliance.contribute'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('type') && 
               tool.inputSchema.required.includes('amount');
    }));

    results.push(test('V101: alliance.territory.claim input schema valid', () => {
        const tool = MCP_TOOLS_V101['alliance.territory.claim'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('territoryId');
    }));

    results.push(test('V101: alliance.skill.unlock input schema valid', () => {
        const tool = MCP_TOOLS_V101['alliance.skill.unlock'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('skillId');
    }));

    results.push(test('V101: alliance.members.list input schema valid', () => {
        const tool = MCP_TOOLS_V101['alliance.members.list'];
        return tool && tool.inputSchema;
    }));

    // ========== _initAllianceState Tests ==========
    results.push(test('V101: _initAllianceState initializes alliances object', () => {
        window.gameState.alliances = null;
        const alliances = server._initAllianceState();
        return alliances && alliances.byId && alliances.list && alliances.territories && alliances.skills;
    }));

    results.push(test('V101: _initAllianceState returns existing state', () => {
        const existing = { byId: { test: true }, list: [], territories: {}, skills: {} };
        window.gameState.alliances = existing;
        const alliances = server._initAllianceState();
        return alliances === existing;
    }));

    // ========== alliance.create Tests ==========
    results.push(test('V101: alliance.create requires name', () => {
        const r = server.mcpAllianceCreate({});
        return r.error && r.error.includes('name');
    }));

    results.push(test('V101: alliance.create rejects short name', () => {
        const r = server.mcpAllianceCreate({ name: 'A' });
        return r.error && r.error.includes('2 characters');
    }));

    results.push(test('V101: alliance.create rejects invalid tag length', () => {
        const r = server.mcpAllianceCreate({ name: 'TestAlliance', tag: 'AB' });
        return r.error && r.error.includes('3-5 characters');
    }));

    results.push(test('V101: alliance.create succeeds with valid name', () => {
        const r = server.mcpAllianceCreate({ name: '天道盟' });
        return r.success === true && r.alliance && r.alliance.name === '天道盟';
    }));

    results.push(test('V101: alliance.create returns alliance with id', () => {
        const r = server.mcpAllianceCreate({ name: '真龙会' });
        return r.alliance && r.alliance.id && r.alliance.id.startsWith('ally_');
    }));

    results.push(test('V101: alliance.create creates leader as member', () => {
        const r = server.mcpAllianceCreate({ name: '剑宗门' });
        return r.alliance && r.alliance.members && r.alliance.members.length === 1 && 
               r.alliance.members[0].role === 'leader';
    }));

    results.push(test('V101: alliance.create auto-generates tag if not provided', () => {
        const r = server.mcpAllianceCreate({ name: '测试盟' });
        return r.alliance && r.alliance.tag && r.alliance.tag.length === 3;
    }));

    results.push(test('V101: alliance.create stores in alliances.byId', () => {
        const r = server.mcpAllianceCreate({ name: '丹道堂' });
        const alliances = server._initAllianceState();
        return alliances.byId[r.alliance.id] !== undefined;
    }));

    // ========== alliance.join Tests ==========
    results.push(test('V101: alliance.join requires allianceId', () => {
        const r = server.mcpAllianceJoin({});
        return r.error && r.error.includes('allianceId');
    }));

    results.push(test('V101: alliance.join rejects non-existent alliance', () => {
        const r = server.mcpAllianceJoin({ allianceId: 'nonexistent' });
        return r.error && r.error.includes('not found');
    }));

    results.push(test('V101: alliance.join succeeds with valid allianceId', () => {
        // First create an alliance
        const createResult = server.mcpAllianceCreate({ name: '测试仙盟' });
        const allianceId = createResult.alliance.id;
        // Join with autoApprove
        const r = server.mcpAllianceJoin({ allianceId, autoApprove: true });
        return r.success === true && r.role === 'member';
    }));

    results.push(test('V101: alliance.join prevents duplicate membership', () => {
        const createResult = server.mcpAllianceCreate({ name: '唯一盟' });
        const allianceId = createResult.alliance.id;
        // Join first time
        server.mcpAllianceJoin({ allianceId, autoApprove: true });
        // Try to join again
        const r = server.mcpAllianceJoin({ allianceId, autoApprove: true });
        return r.error && r.error.includes('Already a member');
    }));

    results.push(test('V101: alliance.join returns pending status without autoApprove', () => {
        const createResult = server.mcpAllianceCreate({ name: '待审核盟' });
        const r = server.mcpAllianceJoin({ allianceId: createResult.alliance.id, autoApprove: false });
        return r.success === true && r.pending === true;
    }));

    // ========== alliance.contribute Tests ==========
    results.push(test('V101: alliance.contribute requires type', () => {
        const r = server.mcpAllianceContribute({ amount: 100 });
        return r.error && r.error.includes('type');
    }));

    results.push(test('V101: alliance.contribute requires positive amount', () => {
        const r = server.mcpAllianceContribute({ type: 'spirit_stones', amount: -1 });
        return r.error && r.error.includes('positive');
    }));

    results.push(test('V101: alliance.contribute rejects invalid type', () => {
        const r = server.mcpAllianceContribute({ type: 'invalid', amount: 100 });
        return r.error && r.error.includes('spirit_stones');
    }));

    results.push(test('V101: alliance.contribute requires membership', () => {
        const r = server.mcpAllianceContribute({ type: 'spirit_stones', amount: 100 });
        return r.error && r.error.includes('not in any alliance');
    }));

    results.push(test('V101: alliance.contribute succeeds for member', () => {
        // Create alliance (player becomes leader)
        server.mcpAllianceCreate({ name: '贡献测试盟' });
        const r = server.mcpAllianceContribute({ type: 'spirit_stones', amount: 500 });
        return r.success === true && r.totalContributed === 500;
    }));

    results.push(test('V101: alliance.contribute accumulates resources', () => {
        server.mcpAllianceCreate({ name: '累积测试盟' });
        server.mcpAllianceContribute({ type: 'resources', amount: 100 });
        const r = server.mcpAllianceContribute({ type: 'resources', amount: 200 });
        return r.totalContributed === 300;
    }));

    results.push(test('V101: alliance.contribute updates member contribution points', () => {
        server.mcpAllianceCreate({ name: '积分测试盟' });
        const r = server.mcpAllianceContribute({ type: 'cultivation', amount: 1000 });
        return r.contributionPoints === 1000;
    }));

    // ========== alliance.territory.claim Tests ==========
    results.push(test('V101: alliance.territory.claim requires territoryId', () => {
        const r = server.mcpAllianceTerritoryClaim({});
        return r.error && r.error.includes('territoryId');
    }));

    results.push(test('V101: alliance.territory.claim requires alliance membership', () => {
        const r = server.mcpAllianceTerritoryClaim({ territoryId: 'zone_1' });
        return r.error && r.error.includes('not in any alliance');
    }));

    results.push(test('V101: alliance.territory.claim succeeds for unclaimed territory', () => {
        server.mcpAllianceCreate({ name: '领地测试盟' });
        const r = server.mcpAllianceTerritoryClaim({ territoryId: 'zone_1' });
        return r.success === true && r.territory && r.territory.ownerId;
    }));

    results.push(test('V101: alliance.territory.claim fails for occupied territory without battleMode', () => {
        // Create first alliance and claim territory
        server.mcpAllianceCreate({ name: '联盟A' });
        server.mcpAllianceTerritoryClaim({ territoryId: 'zone_central' });
        
        // Create second alliance
        const result2 = server.mcpAllianceCreate({ name: '联盟B' });
        // Try to claim same territory
        const r = server.mcpAllianceTerritoryClaim({ territoryId: 'zone_central' });
        return r.success === false && r.error.includes('another alliance');
    }));

    results.push(test('V101: alliance.territory.claim battle succeeds with higher power', () => {
        // Create first alliance with low level
        server.mcpAllianceCreate({ name: '防守方' });
        server.mcpAllianceTerritoryClaim({ territoryId: 'zone_battle' });
        
        // Create stronger second alliance
        server.mcpAllianceCreate({ name: '攻击方', level: 10 });
        const r = server.mcpAllianceTerritoryClaim({ territoryId: 'zone_battle', battleMode: true });
        return r.success === true;
    }));

    results.push(test('V101: alliance.territory.claim battle fails with lower power', () => {
        // Create strong first alliance
        server.mcpAllianceCreate({ name: '强防守方', level: 10 });
        server.mcpAllianceTerritoryClaim({ territoryId: 'zone_strong' });
        
        // Create weaker second alliance
        server.mcpAllianceCreate({ name: '弱攻击方', level: 1 });
        const r = server.mcpAllianceTerritoryClaim({ territoryId: 'zone_strong', battleMode: true });
        return r.success === false && r.error.includes('Battle failed');
    }));

    // ========== alliance.skill.unlock Tests ==========
    results.push(test('V101: alliance.skill.unlock requires skillId', () => {
        const r = server.mcpAllianceSkillUnlock({});
        return r.error && r.error.includes('skillId');
    }));

    results.push(test('V101: alliance.skill.unlock requires alliance membership', () => {
        const r = server.mcpAllianceSkillUnlock({ skillId: 'buff_attack' });
        return r.error && r.error.includes('not in any alliance');
    }));

    results.push(test('V101: alliance.skill.unlock rejects unknown skill', () => {
        server.mcpAllianceCreate({ name: '技能测试盟' });
        const r = server.mcpAllianceSkillUnlock({ skillId: 'unknown_skill' });
        return r.error && r.error.includes('Unknown skill');
    }));

    results.push(test('V101: alliance.skill.unlock succeeds with sufficient contribution', () => {
        server.mcpAllianceCreate({ name: '足够贡献盟' });
        server.mcpAllianceContribute({ type: 'spirit_stones', amount: 5000 });
        const r = server.mcpAllianceSkillUnlock({ skillId: 'buff_attack' });
        return r.success === true && r.skillName === '攻击增强';
    }));

    results.push(test('V101: alliance.skill.unlock fails with insufficient contribution', () => {
        server.mcpAllianceCreate({ name: '不足贡献盟' });
        server.mcpAllianceContribute({ type: 'spirit_stones', amount: 100 });
        const r = server.mcpAllianceSkillUnlock({ skillId: 'buff_attack' });
        return r.error && r.error.includes('Insufficient');
    }));

    results.push(test('V101: alliance.skill.unlock prevents duplicate unlock', () => {
        server.mcpAllianceCreate({ name: '重复解锁盟' });
        server.mcpAllianceContribute({ type: 'spirit_stones', amount: 5000 });
        server.mcpAllianceSkillUnlock({ skillId: 'buff_defense' });
        const r = server.mcpAllianceSkillUnlock({ skillId: 'buff_defense' });
        return r.error && r.error.includes('already unlocked');
    }));

    results.push(test('V101: alliance.skill.unlock returns skill effect', () => {
        server.mcpAllianceCreate({ name: '效果测试盟' });
        server.mcpAllianceContribute({ type: 'spirit_stones', amount: 5000 });
        const r = server.mcpAllianceSkillUnlock({ skillId: 'buff_cultivation' });
        return r.effect && r.effect.includes('修炼');
    }));

    // ========== alliance.members.list Tests ==========
    results.push(test('V101: alliance.members.list returns alliance members', () => {
        const createResult = server.mcpAllianceCreate({ name: '成员列表盟' });
        const r = server.mcpAllianceMembersList({ allianceId: createResult.alliance.id });
        return r.members && r.members.length >= 1;
    }));

    results.push(test('V101: alliance.members.list requires valid allianceId', () => {
        const r = server.mcpAllianceMembersList({ allianceId: 'invalid_id' });
        return r.error && r.error.includes('not found');
    }));

    results.push(test('V101: alliance.members.list uses player alliance when no allianceId', () => {
        const createResult = server.mcpAllianceCreate({ name: '默认成员盟' });
        // Player is already in this alliance as leader
        const r = server.mcpAllianceMembersList({});
        return r.allianceId !== undefined;
    }));

    results.push(test('V101: alliance.members.list filters by role', () => {
        const createResult = server.mcpAllianceCreate({ name: '角色过滤盟' });
        const r = server.mcpAllianceMembersList({ allianceId: createResult.alliance.id, role: 'leader' });
        return r.members && r.members.every(m => m.role === 'leader');
    }));

    results.push(test('V101: alliance.members.list respects limit parameter', () => {
        const createResult = server.mcpAllianceCreate({ name: '限制测试盟' });
        const r = server.mcpAllianceMembersList({ allianceId: createResult.alliance.id, limit: 1 });
        return r.members && r.members.length <= 1;
    }));

    results.push(test('V101: alliance.members.list rejects invalid role', () => {
        const createResult = server.mcpAllianceCreate({ name: '无效角色盟' });
        const r = server.mcpAllianceMembersList({ allianceId: createResult.alliance.id, role: 'invalid' });
        return r.error && r.error.includes('role');
    }));

    results.push(test('V101: alliance.members.list returns member contributions', () => {
        const createResult = server.mcpAllianceCreate({ name: '贡献信息盟' });
        const r = server.mcpAllianceMembersList({ allianceId: createResult.alliance.id });
        return r.members && r.members[0] && typeof r.members[0].contribution === 'number';
    }));

    // ========== Integration Tests ==========
    results.push(test('V101: Full alliance flow - create, join, contribute, claim, skill, members', () => {
        const create = server.mcpAllianceCreate({ name: '完整流程盟' });
        const join = server.mcpAllianceJoin({ allianceId: create.alliance.id, autoApprove: true });
        const contribute = server.mcpAllianceContribute({ type: 'spirit_stones', amount: 1000 });
        const territory = server.mcpAllianceTerritoryClaim({ territoryId: 'zone_flow' });
        const skill = server.mcpAllianceSkillUnlock({ skillId: 'buff_attack' });
        const members = server.mcpAllianceMembersList({ allianceId: create.alliance.id });
        
        return create.success && join.success && contribute.success && territory.success && 
               skill.success && members.members;
    }));

    results.push(test('V101: Alliance state persistence', () => {
        const create = server.mcpAllianceCreate({ name: '持久化测试盟' });
        const allianceId = create.alliance.id;
        
        // Simulate persistence
        window.gameState.alliances = JSON.parse(JSON.stringify(window.gameState.alliances));
        const restored = window.gameState.alliances.byId[allianceId];
        
        return restored && restored.name === '持久化测试盟';
    }));

    results.push(test('V101: All 6 tools accessible via callTool', () => {
        // First create an alliance so membership-based tools work
        server.mcpAllianceCreate({ name: 'callTool测试盟' });
        
        const tools = [
            { name: 'alliance.create', args: { name: '另一个盟' } },
            { name: 'alliance.join', args: { allianceId: 'test_id', autoApprove: false } },
            { name: 'alliance.contribute', args: { type: 'spirit_stones', amount: 100 } },
            { name: 'alliance.territory.claim', args: { territoryId: 'zone_call' } },
            { name: 'alliance.skill.unlock', args: { skillId: 'buff_attack' } },
            { name: 'alliance.members.list', args: {} }
        ];
        
        // Filter out tools that will fail due to validation, but verify callTool routes them
        return tools.every(t => {
            const result = server.callTool(t.name, t.args);
            // We expect some to have errors but callTool should route them correctly
            return result && result.content;
        });
    }));

    results.push(test('V101: Multiple alliances can coexist', () => {
        const a1 = server.mcpAllianceCreate({ name: '仙盟一' });
        const a2 = server.mcpAllianceCreate({ name: '仙盟二' });
        const a3 = server.mcpAllianceCreate({ name: '仙盟三' });
        
        const alliances = server._initAllianceState();
        return alliances.list.length >= 3;
    }));

    results.push(test('V101: Territory ownership transfers correctly', () => {
        // Create alliance and claim territory
        server.mcpAllianceCreate({ name: '原所有者' });
        server.mcpAllianceTerritoryClaim({ territoryId: 'transfer_zone' });
        
        // Create new alliance and take territory via battle
        server.mcpAllianceCreate({ name: '新所有者', level: 10 });
        const result = server.mcpAllianceTerritoryClaim({ territoryId: 'transfer_zone', battleMode: true });
        
        return result.success === true && result.previousOwner !== null;
    }));

    // Print results
    console.log('\n=== V101 TDD Test Results ===');
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
    module.exports = { runV101Tests, test };
}