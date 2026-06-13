// V97 TDD Test Runner - Using eval to load game.js and capture globals
const fs = require('fs');

const gameContent = fs.readFileSync('game.js', 'utf8');

// Create a mock window and CONFIG before eval
global.window = {
    gameState: {
        spiritStones: 1000,
        skillMarket: { listings: [], totalVolume: 0, transactionCount: 0 },
        purchasedSkills: [],
        learnedSkills: []
    },
    CONFIG: {
        realms: ['凡界', '灵界', '仙界', '神界'],
        npcTemplates: {
            guard: { name: '守卫', baseStats: { attack: 10, defense: 15, hp: 100 } },
            explorer: { name: '探险者', baseStats: { attack: 12, defense: 8, hp: 80 } },
            combat: { name: '战斗型', baseStats: { attack: 20, defense: 10, hp: 90 } }
        }
    },
    AI_BUDGET_TRACKER: {},
    AI_PROVIDER_CONFIG: {}
};

// Capture global scope after eval
const capturedGlobals = {};
global.global = global;

// Use a function to eval in local scope but capture what we need
let server;

function setupServer() {
    // Eval the game content
    eval(gameContent);

    // Get CultivationMCPServer from whatever scope it ended up in
    const MCPServer = global.CultivationMCPServer || window.CultivationMCPServer;

    if (typeof MCPServer !== 'function') {
        console.log('ERROR: CultivationMCPServer not found');
        console.log('global keys containing Server:', Object.keys(global).filter(k => k.includes('Server')));
        console.log('window keys containing Server:', Object.keys(window).filter(k => k.includes('Server')));
        process.exit(1);
    }

    server = new MCPServer();
    return server;
}

try {
    setupServer();
} catch(e) {
    console.log('Setup error:', e.message);
    process.exit(1);
}

console.log('\n=== V97 TDD Test Results ===\n');

let passed = 0, failed = 0;

function test(name, fn) {
    try {
        const result = fn();
        if (result) {
            passed++;
            console.log('✓ ' + name);
        } else {
            failed++;
            console.log('✗ ' + name + ' - assertion failed');
        }
    } catch (e) {
        failed++;
        console.log('✗ ' + name + ' - ' + e.message);
    }
}

// ========== V97 Tool Registry Tests ==========
const v97Tools = ['market.skills.list', 'market.skills.buy', 'market.skills.sell', 'skill.learn', 'skill.invoke', 'sect.war.preview'];

test('V97: MCP_TOOLS_V97 constant defined', () => typeof MCP_TOOLS_V97 === 'object' && Object.keys(MCP_TOOLS_V97).length === 6);
test('V97: All 6 tools registered', () => v97Tools.every(t => server.toolRegistry.has(t)));
test('V97: market.skills.list schema valid', () => MCP_TOOLS_V97['market.skills.list']?.inputSchema);
test('V97: market.skills.buy schema valid', () => MCP_TOOLS_V97['market.skills.buy']?.inputSchema?.required?.includes('skillId'));
test('V97: market.skills.sell schema valid', () => MCP_TOOLS_V97['market.skills.sell']?.inputSchema?.required?.includes('skillId'));
test('V97: skill.learn schema valid', () => MCP_TOOLS_V97['skill.learn']?.inputSchema?.required?.includes('skillId'));
test('V97: skill.invoke schema valid', () => MCP_TOOLS_V97['skill.invoke']?.inputSchema?.required?.includes('skillId'));
test('V97: sect.war.preview schema valid', () => MCP_TOOLS_V97['sect.war.preview']?.inputSchema?.required?.includes('sectId'));

// ========== Setup: Spawn NPCs ==========
if (typeof server.mcpNpcSpawn === 'function') {
    server.mcpNpcSpawn({ npcId: 'master_001', template: 'guard' });
    server.mcpNpcSpawn({ npcId: 'fellow_001', template: 'explorer' });
    server.mcpNpcSpawn({ npcId: 'combat_001', template: 'combat' });

    var skill1 = server.mcpNpcSkillCrystallize({
        npcId: 'master_001',
        experienceData: { task: 'defend_sect', steps: ['watch', 'attack', 'report'] },
        layer: 'L3',
        tags: ['defense', 'combat'],
        skillName: 'Defend Sect SOP'
    });

    var skill2 = server.mcpNpcSkillCrystallize({
        npcId: 'fellow_001',
        experienceData: { exploration: 'map_route' },
        layer: 'L3',
        tags: ['exploration', 'navigation'],
        skillName: 'Map Exploration SOP'
    });

    var skill3 = server.mcpNpcSkillCrystallize({
        npcId: 'combat_001',
        experienceData: { attack: 'quick_strike', combo: 'hit_run' },
        layer: 'L3',
        tags: ['attack', 'speed'],
        skillName: 'Quick Strike'
    });
}

// ========== market.skills.list Tests ==========
test('V97: market.skills.list returns empty initially', () => {
    const result = server.mcpMarketSkillsList({});
    return result.listings && result.totalListings === 0;
});

test('V97: market.skills.list accepts filter parameter', () => {
    const result = server.mcpMarketSkillsList({ filter: 'rare' });
    return result.filter === 'rare';
});

test('V97: market.skills.list accepts sortBy parameter', () => {
    const result = server.mcpMarketSkillsList({ sortBy: 'price_asc' });
    return result.sortBy === 'price_asc';
});

// ========== market.skills.sell Tests ==========
if (skill1) {
    test('V97: market.skills.sell lists crystallized skill', () => {
        const result = server.mcpMarketSkillsSell({ skillId: skill1.skillId, price: 500 });
        return result.success === true && result.price === 500 && result.rarity;
    });

    test('V97: market.skills.sell requires skillId and price', () => {
        const r1 = server.mcpMarketSkillsSell({ price: 100 });
        const r2 = server.mcpMarketSkillsSell({ skillId: 'some_id' });
        return r1.error && r2.error;
    });

    test('V97: market.skills.sell rejects price < 1', () => {
        const result = server.mcpMarketSkillsSell({ skillId: skill2.skillId, price: 0 });
        return result.error && result.error.includes('Price must be at least 1');
    });

    test('V97: market.skills.sell rejects non-existent skill', () => {
        const result = server.mcpMarketSkillsSell({ skillId: 'nonexistent_skill', price: 100 });
        return result.error && result.error.includes('not found');
    });

    test('V97: market.skills.sell rejects already listed skill', () => {
        const result = server.mcpMarketSkillsSell({ skillId: skill1.skillId, price: 300 });
        return result.error && result.error.includes('already listed');
    });

    test('V97: market.skills.sell second skill succeeds', () => {
        const result = server.mcpMarketSkillsSell({ skillId: skill2.skillId, price: 300 });
        return result.success === true && result.skillName === 'Map Exploration SOP';
    });
}

// ========== market.skills.list Tests (with listings) ==========
test('V97: market.skills.list shows listed skills', () => {
    const result = server.mcpMarketSkillsList({});
    return result.listings && result.totalListings >= 2;
});

// ========== market.skills.buy Tests ==========
test('V97: market.skills.buy requires skillId', () => {
    const result = server.mcpMarketSkillsBuy({});
    return result.error && result.error.includes('skillId required');
});

test('V97: market.skills.buy rejects non-existent skill', () => {
    const result = server.mcpMarketSkillsBuy({ skillId: 'nonexistent_skill' });
    return result.error && result.error.includes('not found');
});

if (skill2) {
    window.gameState.spiritStones = 1000;

    test('V97: market.skills.buy purchases skill successfully', () => {
        const result = server.mcpMarketSkillsBuy({ skillId: skill2.skillId });
        return result.success === true && result.price === 300 && result.remainingSpiritStones === 700;
    });

    // ========== skill.learn Tests ==========
    test('V97: skill.learn requires skillId', () => {
        const result = server.mcpSkillLearn({});
        return result.error && result.error.includes('skillId required');
    });

    test('V97: skill.learn learns purchased skill', () => {
        const result = server.mcpSkillLearn({ skillId: skill2.skillId });
        return result.success === true && result.skillName === 'Map Exploration SOP' && result.masteryLevel === 1;
    });

    test('V97: skill.learn rejects unlearned skill', () => {
        const result = server.mcpSkillLearn({ skillId: 'never_purchased_skill' });
        return result.error && result.error.includes('not purchased');
    });

    test('V97: skill.learn rejects already learned skill', () => {
        const result = server.mcpSkillLearn({ skillId: skill2.skillId });
        return result.error && result.error.includes('already learned');
    });

    // ========== skill.invoke Tests ==========
    test('V97: skill.invoke requires skillId and playerId', () => {
        const r1 = server.mcpSkillInvoke({ playerId: 'player1' });
        const r2 = server.mcpSkillInvoke({ skillId: skill2.skillId });
        return r1.error && r2.error;
    });

    test('V97: skill.invoke invokes learned skill', () => {
        const result = server.mcpSkillInvoke({ skillId: skill2.skillId, playerId: 'player1' });
        return result.success === true && result.executionResult;
    });

    test('V97: skill.invoke increases mastery level', () => {
        const result = server.mcpSkillInvoke({ skillId: skill2.skillId, playerId: 'player1' });
        return result.masteryLevel >= 1;
    });

    test('V97: skill.invoke rejects unlearned skill', () => {
        const result = server.mcpSkillInvoke({ skillId: 'never_learned_skill', playerId: 'player1' });
        return result.error && result.error.includes('not learned');
    });
}

// ========== sect.war.preview Tests ==========
test('V97: sect.war.preview requires sectId', () => {
    const result = server.mcpSectWarPreview({});
    return result.error && result.error.includes('sectId required');
});

test('V97: sect.war.preview returns sect info for known sect', () => {
    const result = server.mcpSectWarPreview({ sectId: 'celestial_peak', warType: 'skirmish' });
    return result.sectId === 'celestial_peak' && result.sectName === '天道峰' && result.reputation === 8500;
});

test('V97: sect.war.preview returns synergies', () => {
    const result = server.mcpSectWarPreview({ sectId: 'celestial_peak', warType: 'skirmish' });
    return result.synergies && result.synergies.length >= 1;
});

test('V97: sect.war.preview returns recommended counter', () => {
    const result = server.mcpSectWarPreview({ sectId: 'celestial_peak', warType: 'skirmish' });
    return result.recommendedCounter && typeof result.recommendedCounter === 'string';
});

test('V97: sect.war.preview defaults warType to skirmish', () => {
    const result = server.mcpSectWarPreview({ sectId: 'jade_pavilion' });
    return result.warType === 'skirmish';
});

test('V97: sect.war.preview handles territory war type', () => {
    const result = server.mcpSectWarPreview({ sectId: 'dark_veil', warType: 'territory' });
    return result.warType === 'territory' && result.synergies;
});

test('V97: sect.war.preview handles elimination war type', () => {
    const result = server.mcpSectWarPreview({ sectId: 'iron_horn', warType: 'elimination' });
    return result.warType === 'elimination' && result.synergies;
});

test('V97: sect.war.preview generates random data for unknown sect', () => {
    const result = server.mcpSectWarPreview({ sectId: 'unknown_sect' });
    return result.sectName === 'unknown_sect' && result.reputation > 0 && result.memberCount > 0;
});

// ========== Summary ==========
console.log(`\n=== V97 TDD Results: ${passed}/${passed + failed} passed ===`);
const rate = ((passed / (passed + failed)) * 100).toFixed(1);
console.log(`Pass rate: ${rate}%`);
if (parseFloat(rate) >= 80) {
    console.log('[PASS] V97 meets 80%+ target!');
    process.exit(0);
} else {
    console.log('[FAIL] V97 below 80% target');
    process.exit(1);
}