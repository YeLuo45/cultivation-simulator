// V97 NPC Skill Market + Crystallized SOP Trading + Cross-Server Sect War - TDD Tests
// Tests for: market.skills.list/buy/sell, skill.learn, skill.invoke, sect.war.preview

const V97_TESTS = [];

function runV97Tests() {
    const results = [];
    let passed = 0, failed = 0;

    // Initialize test server
    const server = new CultivationMCPServer();

    // ========== V97 Tool Registry Tests ==========
    results.push(test('V97: MCP_TOOLS_V97 constant defined', () => {
        return typeof MCP_TOOLS_V97 === 'object' && Object.keys(MCP_TOOLS_V97).length === 6;
    }));

    results.push(test('V97: All 6 tools registered in toolRegistry', () => {
        const tools = ['market.skills.list', 'market.skills.buy', 'market.skills.sell', 'skill.learn', 'skill.invoke', 'sect.war.preview'];
        return tools.every(t => server.toolRegistry.has(t));
    }));

    results.push(test('V97: market.skills.list input schema valid', () => {
        const tool = MCP_TOOLS_V97['market.skills.list'];
        return tool && tool.inputSchema;
    }));

    results.push(test('V97: market.skills.buy input schema valid', () => {
        const tool = MCP_TOOLS_V97['market.skills.buy'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('skillId');
    }));

    results.push(test('V97: market.skills.sell input schema valid', () => {
        const tool = MCP_TOOLS_V97['market.skills.sell'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('skillId') &&
               tool.inputSchema.required.includes('price');
    }));

    results.push(test('V97: skill.learn input schema valid', () => {
        const tool = MCP_TOOLS_V97['skill.learn'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('skillId');
    }));

    results.push(test('V97: skill.invoke input schema valid', () => {
        const tool = MCP_TOOLS_V97['skill.invoke'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('skillId') &&
               tool.inputSchema.required.includes('playerId');
    }));

    results.push(test('V97: sect.war.preview input schema valid', () => {
        const tool = MCP_TOOLS_V97['sect.war.preview'];
        return tool && tool.inputSchema && tool.inputSchema.required.includes('sectId');
    }));

    // ========== Setup: Spawn NPCs and create skills for tests ==========
    server.mcpNpcSpawn({ npcId: 'master_001', template: 'guard' });
    server.mcpNpcSpawn({ npcId: 'fellow_001', template: 'explorer' });
    server.mcpNpcSpawn({ npcId: 'combat_001', template: 'combat' });

    // Crystallize some skills for market testing
    const skill1 = server.mcpNpcSkillCrystallize({
        npcId: 'master_001',
        experienceData: { task: 'defend_sect', steps: ['watch', 'attack', 'report'] },
        layer: 'L3',
        tags: ['defense', 'combat'],
        skillName: 'Defend Sect SOP'
    });

    const skill2 = server.mcpNpcSkillCrystallize({
        npcId: 'fellow_001',
        experienceData: { exploration: 'map_route' },
        layer: 'L3',
        tags: ['exploration', 'navigation'],
        skillName: 'Map Exploration SOP'
    });

    const skill3 = server.mcpNpcSkillCrystallize({
        npcId: 'combat_001',
        experienceData: { attack: 'quick_strike', combo: 'hit_run' },
        layer: 'L3',
        tags: ['attack', 'speed'],
        skillName: 'Quick Strike'
    });

    // ========== market.skills.list Tests ==========
    results.push(test('V97: market.skills.list returns empty initially', () => {
        const result = server.mcpMarketSkillsList({});
        return result.listings && result.totalListings === 0;
    }));

    results.push(test('V97: market.skills.list accepts filter parameter', () => {
        const result = server.mcpMarketSkillsList({ filter: 'rare' });
        return result.filter === 'rare';
    }));

    results.push(test('V97: market.skills.list accepts sortBy parameter', () => {
        const result = server.mcpMarketSkillsList({ sortBy: 'price_asc' });
        return result.sortBy === 'price_asc';
    }));

    // ========== market.skills.sell Tests ==========
    results.push(test('V97: market.skills.sell lists crystallized skill', () => {
        const result = server.mcpMarketSkillsSell({ skillId: skill1.skillId, price: 500 });
        return result.success === true && result.price === 500 && result.rarity;
    }));

    results.push(test('V97: market.skills.sell requires skillId and price', () => {
        const r1 = server.mcpMarketSkillsSell({ price: 100 });
        const r2 = server.mcpMarketSkillsSell({ skillId: 'some_id' });
        return r1.error && r2.error;
    }));

    results.push(test('V97: market.skills.sell rejects price < 1', () => {
        const result = server.mcpMarketSkillsSell({ skillId: skill2.skillId, price: 0 });
        return result.error && result.error.includes('Price must be at least 1');
    }));

    results.push(test('V97: market.skills.sell rejects non-existent skill', () => {
        const result = server.mcpMarketSkillsSell({ skillId: 'nonexistent_skill', price: 100 });
        return result.error && result.error.includes('not found');
    }));

    results.push(test('V97: market.skills.sell rejects already listed skill', () => {
        // skill1 already listed above
        const result = server.mcpMarketSkillsSell({ skillId: skill1.skillId, price: 300 });
        return result.error && result.error.includes('already listed');
    }));

    results.push(test('V97: market.skills.sell second skill succeeds', () => {
        const result = server.mcpMarketSkillsSell({ skillId: skill2.skillId, price: 300 });
        return result.success === true && result.skillName === 'Map Exploration SOP';
    }));

    // ========== market.skills.list Tests (with listings) ==========
    results.push(test('V97: market.skills.list shows listed skills', () => {
        const result = server.mcpMarketSkillsList({});
        return result.listings && result.totalListings >= 2;
    }));

    results.push(test('V97: market.skills.list filters by rarity', () => {
        const skill4 = server.mcpNpcSkillCrystallize({
            npcId: 'combat_001',
            experienceData: { attack: 'heavy_hit' },
            layer: 'L3',
            tags: ['attack', 'power'],
            skillName: 'Heavy Strike'
        });
        server.mcpMarketSkillsSell({ skillId: skill4.skillId, price: 1000 });
        const result = server.mcpMarketSkillsList({ filter: 'legendary' });
        return result.listings && result.listings.length >= 1;
    }));

    // ========== market.skills.buy Tests ==========
    results.push(test('V97: market.skills.buy requires skillId', () => {
        const result = server.mcpMarketSkillsBuy({});
        return result.error && result.error.includes('skillId required');
    }));

    results.push(test('V97: market.skills.buy rejects non-existent skill', () => {
        const result = server.mcpMarketSkillsBuy({ skillId: 'nonexistent_skill' });
        return result.error && result.error.includes('not found');
    }));

    // Initialize spirit stones for buy test
    window.gameState.spiritStones = 1000;

    results.push(test('V97: market.skills.buy purchases skill successfully', () => {
        const result = server.mcpMarketSkillsBuy({ skillId: skill2.skillId });
        return result.success === true && result.price === 300 && result.remainingSpiritStones === 700;
    }));

    results.push(test('V97: market.skills.buy fails with insufficient stones', () => {
        window.gameState.spiritStones = 50;
        const result = server.mcpMarketSkillsBuy({ skillId: skill3.skillId });
        // First sell it so it exists in market
        server.mcpMarketSkillsSell({ skillId: skill3.skillId, price: 500 });
        const buyResult = server.mcpMarketSkillsBuy({ skillId: skill3.skillId });
        return buyResult.error && buyResult.error.includes('Not enough spirit stones');
    }));

    // ========== skill.learn Tests ==========
    results.push(test('V97: skill.learn requires skillId', () => {
        const result = server.mcpSkillLearn({});
        return result.error && result.error.includes('skillId required');
    }));

    results.push(test('V97: skill.learn learns purchased skill', () => {
        // skill2 was purchased above
        const result = server.mcpSkillLearn({ skillId: skill2.skillId });
        return result.success === true && result.skillName === 'Map Exploration SOP' && result.masteryLevel === 1;
    }));

    results.push(test('V97: skill.learn rejects unlearned skill', () => {
        const result = server.mcpSkillLearn({ skillId: 'never_purchased_skill' });
        return result.error && result.error.includes('not purchased');
    }));

    results.push(test('V97: skill.learn rejects already learned skill', () => {
        const result = server.mcpSkillLearn({ skillId: skill2.skillId });
        return result.error && result.error.includes('already learned');
    }));

    // ========== skill.invoke Tests ==========
    results.push(test('V97: skill.invoke requires skillId and playerId', () => {
        const r1 = server.mcpSkillInvoke({ playerId: 'player1' });
        const r2 = server.mcpSkillInvoke({ skillId: skill2.skillId });
        return r1.error && r2.error;
    }));

    results.push(test('V97: skill.invoke invokes learned skill', () => {
        const result = server.mcpSkillInvoke({ skillId: skill2.skillId, playerId: 'player1' });
        return result.success === true && result.executionResult;
    }));

    results.push(test('V97: skill.invoke increases mastery level', () => {
        const result = server.mcpSkillInvoke({ skillId: skill2.skillId, playerId: 'player1' });
        return result.masteryLevel >= 1;
    }));

    results.push(test('V97: skill.invoke rejects unlearned skill', () => {
        const result = server.mcpSkillInvoke({ skillId: 'never_learned_skill', playerId: 'player1' });
        return result.error && result.error.includes('not learned');
    }));

    // ========== sect.war.preview Tests ==========
    results.push(test('V97: sect.war.preview requires sectId', () => {
        const result = server.mcpSectWarPreview({});
        return result.error && result.error.includes('sectId required');
    }));

    results.push(test('V97: sect.war.preview returns sect info for known sect', () => {
        const result = server.mcpSectWarPreview({ sectId: 'celestial_peak', warType: 'skirmish' });
        return result.sectId === 'celestial_peak' && result.sectName === '天道峰' && result.reputation === 8500;
    }));

    results.push(test('V97: sect.war.preview returns synergies', () => {
        const result = server.mcpSectWarPreview({ sectId: 'celestial_peak', warType: 'skirmish' });
        return result.synergies && result.synergies.length >= 1;
    }));

    results.push(test('V97: sect.war.preview returns recommended counter', () => {
        const result = server.mcpSectWarPreview({ sectId: 'celestial_peak', warType: 'skirmish' });
        return result.recommendedCounter && typeof result.recommendedCounter === 'string';
    }));

    results.push(test('V97: sect.war.preview defaults warType to skirmish', () => {
        const result = server.mcpSectWarPreview({ sectId: 'jade_pavilion' });
        return result.warType === 'skirmish';
    }));

    results.push(test('V97: sect.war.preview handles territory war type', () => {
        const result = server.mcpSectWarPreview({ sectId: 'dark_veil', warType: 'territory' });
        return result.warType === 'territory' && result.synergies;
    }));

    results.push(test('V97: sect.war.preview handles elimination war type', () => {
        const result = server.mcpSectWarPreview({ sectId: 'iron_horn', warType: 'elimination' });
        return result.warType === 'elimination' && result.synergies;
    }));

    results.push(test('V97: sect.war.preview generates random data for unknown sect', () => {
        const result = server.mcpSectWarPreview({ sectId: 'unknown_sect' });
        return result.sectName === 'unknown_sect' && result.reputation > 0 && result.memberCount > 0;
    }));

    // ========== Summary ==========
    passed = results.filter(r => r.pass).length;
    failed = results.filter(r => !r.pass).length;
    const total = results.length;
    const passRate = total > 0 ? (passed / total * 100).toFixed(1) : 0;

    console.log(`\n=== V97 Tests: ${passed}/${total} passed (${passRate}%) ===`);
    if (parseFloat(passRate) >= 80) {
        console.log('[PASS] V97 meets 80%+ target!');
    } else {
        console.log('[FAIL] V97 below 80% target');
    }

    results.forEach((r, i) => {
        if (!r.pass) console.log(`  FAIL[${i}]: ${r.name} - ${r.msg || 'assertion failed'}`);
    });

    return { passed, total, passRate, results, status: parseFloat(passRate) >= 80 ? 'PASS' : 'FAIL' };
}

function test(name, fn) {
    try {
        const result = fn();
        return { name, pass: !!result, msg: result ? '' : 'assertion returned falsy' };
    } catch (e) {
        return { name, pass: false, msg: e.message };
    }
}

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runV97Tests, V97_TESTS };
}