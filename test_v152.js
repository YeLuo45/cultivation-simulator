global.window = { gameState: { spiritStones: 100000, name: 'TestUser', level: 15 } };

class MockMCPServer {
    constructor() {}
    _initCodexStateV2() {
        const gs = window.gameState;
        if (!gs.codexV2) {
            gs.codexV2 = {
                categories: [
                    { id: 'beast', name: '灵兽', entries: [
                        { id: 'beast_001', name: '青鳞蛇', description: '低级灵兽', cost: 100, unlocked: false, unlockedAt: null },
                        { id: 'beast_002', name: '火鸦', description: '火灵禽', cost: 200, unlocked: false, unlockedAt: null },
                        { id: 'beast_003', name: '玄冰龟', description: '防御型', cost: 300, unlocked: false, unlockedAt: null },
                        { id: 'beast_004', name: '风刃狼', description: '速度型', cost: 500, unlocked: false, unlockedAt: null },
                        { id: 'beast_005', name: '金翅鹏', description: '高级', cost: 1000, unlocked: false, unlockedAt: null }
                    ]},
                    { id: 'pill', name: '丹药', entries: [
                        { id: 'pill_001', name: '聚气丹', cost: 150, unlocked: false, unlockedAt: null },
                        { id: 'pill_002', name: '筑基丹', cost: 500, unlocked: false, unlockedAt: null },
                        { id: 'pill_003', name: '结金丹', cost: 1500, unlocked: false, unlockedAt: null },
                        { id: 'pill_004', name: '化婴丹', cost: 5000, unlocked: false, unlockedAt: null },
                        { id: 'pill_005', name: '飞升丹', cost: 20000, unlocked: false, unlockedAt: null }
                    ]},
                    { id: 'technique', name: '功法', entries: [
                        { id: 'tech_001', name: '引气诀', cost: 80, unlocked: false, unlockedAt: null },
                        { id: 'tech_002', name: '玄元诀', cost: 300, unlocked: false, unlockedAt: null },
                        { id: 'tech_003', name: '大衍诀', cost: 800, unlocked: false, unlockedAt: null },
                        { id: 'tech_004', name: '天玄经', cost: 2000, unlocked: false, unlockedAt: null },
                        { id: 'tech_005', name: '道藏真经', cost: 10000, unlocked: false, unlockedAt: null }
                    ]},
                    { id: 'material', name: '材料', entries: [
                        { id: 'mat_001', name: '灵草', cost: 50, unlocked: false, unlockedAt: null },
                        { id: 'mat_002', name: '妖兽内丹', cost: 200, unlocked: false, unlockedAt: null },
                        { id: 'mat_003', name: '灵石矿脉', cost: 1000, unlocked: false, unlockedAt: null },
                        { id: 'mat_004', name: '仙晶', cost: 5000, unlocked: false, unlockedAt: null },
                        { id: 'mat_005', name: '天道碎片', cost: 20000, unlocked: false, unlockedAt: null }
                    ]},
                    { id: 'dungeon', name: '副本', entries: [
                        { id: 'dun_001', name: '幽冥森林', cost: 100, unlocked: false, unlockedAt: null },
                        { id: 'dun_002', name: '上古洞府', cost: 300, unlocked: false, unlockedAt: null },
                        { id: 'dun_003', name: '仙人墓穴', cost: 800, unlocked: false, unlockedAt: null },
                        { id: 'dun_004', name: '东海龙宫', cost: 2000, unlocked: false, unlockedAt: null },
                        { id: 'dun_005', name: '九天之上', cost: 10000, unlocked: false, unlockedAt: null }
                    ]}
                ],
                totalEntries: 25
            };
        }
        return gs.codexV2;
    }
    _initCollectionStateV2() {
        const gs = window.gameState;
        if (!gs.collectionV2) {
            gs.collectionV2 = {
                categories: [
                    { id: 'beast', name: '灵兽', collected: 0, total: 5, rewards: [{ id: 'beast_reward_1', name: '灵兽图鉴奖励', claimed: false }]},
                    { id: 'pill', name: '丹药', collected: 0, total: 5, rewards: [{ id: 'pill_reward_1', name: '丹药图鉴奖励', claimed: false }]},
                    { id: 'technique', name: '功法', collected: 0, total: 5, rewards: [{ id: 'technique_reward_1', name: '功法图鉴奖励', claimed: false }]},
                    { id: 'material', name: '材料', collected: 0, total: 5, rewards: [{ id: 'material_reward_1', name: '材料图鉴奖励', claimed: false }]},
                    { id: 'dungeon', name: '副本', collected: 0, total: 5, rewards: [{ id: 'dungeon_reward_1', name: '副本图鉴奖励', claimed: false }]}
                ],
                totalCollected: 0
            };
        }
        return gs.collectionV2;
    }
    mcpCodexListV2() {
        const codexV2 = this._initCodexStateV2();
        return { success: true, categories: codexV2.categories.map(c => ({ id: c.id, name: c.name, total: c.entries.length, unlocked: c.entries.filter(e => e.unlocked).length })), totalEntries: codexV2.totalEntries };
    }
    mcpCodexViewV2(categoryId) {
        if (!categoryId) return { error: '请指定分类ID' };
        const codexV2 = this._initCodexStateV2();
        const category = codexV2.categories.find(c => c.id === categoryId);
        if (!category) return { error: '分类不存在' };
        return { success: true, categoryId: category.id, categoryName: category.name, entries: category.entries.map(e => ({ id: e.id, name: e.name, description: e.description, cost: e.cost, unlocked: e.unlocked, unlockedAt: e.unlockedAt })), total: category.entries.length, unlocked: category.entries.filter(e => e.unlocked).length };
    }
    mcpCodexUnlockV2(entryId) {
        if (!entryId) return { error: '请指定条目ID' };
        const codexV2 = this._initCodexStateV2();
        let entry = null, category = null;
        for (const cat of codexV2.categories) {
            const found = cat.entries.find(e => e.id === entryId);
            if (found) { entry = found; category = cat; break; }
        }
        if (!entry) return { error: '条目不存在' };
        if (entry.unlocked) return { error: '该条目已解锁' };
        const cost = entry.cost || 100;
        if ((window.gameState.spiritStones || 0) < cost) return { error: '灵石不足，需要' + cost + '灵石' };
        window.gameState.spiritStones -= cost;
        entry.unlocked = true;
        entry.unlockedAt = Date.now();
        const collectionV2 = this._initCollectionStateV2();
        const collCat = collectionV2.categories.find(c => c.id === category.id);
        if (collCat) { collCat.collected = Math.min(collCat.total, collCat.collected + 1); collectionV2.totalCollected = collectionV2.categories.reduce((sum, c) => sum + c.collected, 0); }
        return { success: true, entryId: entry.id, entryName: entry.name, cost, remainingSpiritStones: window.gameState.spiritStones, message: '解锁成功！消耗' + cost + '灵石' };
    }
    mcpCollectionStatsV2() {
        const collectionV2 = this._initCollectionStateV2();
        return { success: true, categories: collectionV2.categories.map(c => ({ id: c.id, name: c.name, collected: c.collected, total: c.total, progress: c.total > 0 ? (c.collected / c.total * 100).toFixed(1) + '%' : '0%', rewardClaimed: c.rewards[0]?.claimed || false })), totalCollected: collectionV2.totalCollected, totalEntries: 25, overallProgress: (collectionV2.totalCollected / 25 * 100).toFixed(1) + '%' };
    }
    mcpCollectionRewardV2(rewardId) {
        if (!rewardId) return { error: '请指定奖励ID' };
        const collectionV2 = this._initCollectionStateV2();
        let foundReward = null, foundCategory = null;
        for (const cat of collectionV2.categories) {
            const r = cat.rewards.find(r => r.id === rewardId);
            if (r) { foundReward = r; foundCategory = cat; break; }
        }
        if (!foundReward) return { error: '奖励不存在' };
        if (foundReward.claimed) return { error: '该奖励已领取' };
        if (foundCategory.collected < foundCategory.total) return { error: '该分类收集未完成，无法领取奖励' };
        foundReward.claimed = true;
        const rewardSpiritStones = foundCategory.total * 100;
        window.gameState.spiritStones = (window.gameState.spiritStones || 0) + rewardSpiritStones;
        return { success: true, rewardId, categoryId: foundCategory.id, reward: { spiritStones: rewardSpiritStones }, totalSpiritStones: window.gameState.spiritStones };
    }
    mcpCollectionResetV2() {
        const codexV2 = this._initCodexStateV2();
        const collectionV2 = this._initCollectionStateV2();
        for (const cat of codexV2.categories) for (const entry of cat.entries) { entry.unlocked = false; entry.unlockedAt = null; }
        for (const cat of collectionV2.categories) { cat.collected = 0; for (const reward of cat.rewards) reward.claimed = false; }
        collectionV2.totalCollected = 0;
        return { success: true };
    }
}

function runV152Tests() {
    const results = [];
    const v152Assert = (cond, msg) => results.push({ pass: !!cond, message: msg });
    window.gameState = { spiritStones: 100000, name: 'TestUser', level: 15 };
    const server = new MockMCPServer();
    
    const codexState = server._initCodexStateV2();
    v152Assert(codexState !== null, '_initCodexStateV2 returns state');
    v152Assert(Array.isArray(codexState.categories), 'codexV2 categories is array');
    v152Assert(codexState.categories.length === 5, 'codexV2 has 5 categories');
    v152Assert(codexState.totalEntries === 25, 'codexV2 totalEntries is 25');

    const collState = server._initCollectionStateV2();
    v152Assert(collState !== null, '_initCollectionStateV2 returns state');
    v152Assert(Array.isArray(collState.categories), 'collectionV2 categories is array');
    v152Assert(collState.categories.length === 5, 'collectionV2 has 5 categories');
    v152Assert(collState.totalCollected === 0, 'collectionV2 starts with 0 collected');

    const cl1 = server.mcpCodexListV2();
    v152Assert(cl1.success === true, 'codex.list returns success');
    v152Assert(cl1.categories.length === 5, 'codex.list shows 5 categories');
    v152Assert(cl1.categories[0].name === '灵兽', 'codex.list first category is 灵兽');
    v152Assert(cl1.totalEntries === 25, 'codex.list totalEntries is 25');

    v152Assert(cl1.categories[0].total === 5, 'codex.list beast total is 5');
    v152Assert(cl1.categories[0].unlocked === 0, 'codex.list beast unlocked starts at 0');

    const cv1 = server.mcpCodexViewV2('beast');
    v152Assert(cv1.success === true, 'codex.view returns success');
    v152Assert(cv1.categoryId === 'beast', 'codex.view categoryId correct');
    v152Assert(cv1.categoryName === '灵兽', 'codex.view categoryName correct');
    v152Assert(cv1.entries.length === 5, 'codex.view has 5 entries');
    v152Assert(cv1.entries[0].name === '青鳞蛇', 'codex.view first entry name correct');

    const cvErr1 = server.mcpCodexViewV2('invalid_cat');
    v152Assert(cvErr1.error && cvErr1.error.includes('不存在'), 'codex.view invalid category returns error');

    const cvErr2 = server.mcpCodexViewV2();
    v152Assert(cvErr2.error && cvErr2.error.includes('分类ID'), 'codex.view missing categoryId returns error');

    const cu1 = server.mcpCodexUnlockV2('beast_001');
    v152Assert(cu1.success === true, 'codex.unlock returns success');
    v152Assert(cu1.entryId === 'beast_001', 'codex.unlock entryId correct');
    v152Assert(cu1.entryName === '青鳞蛇', 'codex.unlock entryName correct');
    v152Assert(cu1.cost === 100, 'codex.unlock cost is 100');
    v152Assert(cu1.remainingSpiritStones === 99900, 'codex.unlock deducts spirit stones');

    const cuErr1 = server.mcpCodexUnlockV2('invalid_entry');
    v152Assert(cuErr1.error && cuErr1.error.includes('不存在'), 'codex.unlock invalid entry returns error');

    const cuErr2 = server.mcpCodexUnlockV2();
    v152Assert(cuErr2.error && cuErr2.error.includes('条目ID'), 'codex.unlock missing entryId returns error');

    const cuErr3 = server.mcpCodexUnlockV2('beast_001');
    v152Assert(cuErr3.error && cuErr3.error.includes('已解锁'), 'codex.unlock already unlocked returns error');

    window.gameState.spiritStones = 50;
    const cuErr4 = server.mcpCodexUnlockV2('beast_002');
    v152Assert(cuErr4.error && cuErr4.error.includes('灵石不足'), 'codex.unlock insufficient stones returns error');
    window.gameState.spiritStones = 100000;

    server.mcpCodexUnlockV2('beast_002');
    const coll1 = server.mcpCollectionStatsV2();
    v152Assert(coll1.categories[0].collected === 2, 'collection beast collected is 2 after 2 unlocks');

    const cs1 = server.mcpCollectionStatsV2();
    v152Assert(cs1.success === true, 'collection.stats returns success');
    v152Assert(cs1.categories.length === 5, 'collection.stats has 5 categories');
    v152Assert(cs1.totalCollected === 2, 'collection.stats totalCollected is 2');
    v152Assert(cs1.totalEntries === 25, 'collection.stats totalEntries is 25');
    v152Assert(cs1.overallProgress === '8.0%', 'collection.stats overallProgress is 8.0%');

    v152Assert(cs1.categories[0].progress === '40.0%', 'collection.stats beast progress is 40.0%');
    v152Assert(cs1.categories[1].progress === '0.0%', 'collection.stats pill progress is 0.0%');

    const crErr1 = server.mcpCollectionRewardV2('beast_reward_1');
    v152Assert(crErr1.error && crErr1.error.includes('未完成'), 'collection.reward incomplete category returns error');

    const crErr2 = server.mcpCollectionRewardV2('invalid_reward');
    v152Assert(crErr2.error && crErr2.error.includes('不存在'), 'collection.reward invalid reward returns error');

    const crErr3 = server.mcpCollectionRewardV2();
    v152Assert(crErr3.error && crErr3.error.includes('奖励ID'), 'collection.reward missing rewardId returns error');

    server.mcpCodexUnlockV2('beast_003');
    server.mcpCodexUnlockV2('beast_004');
    server.mcpCodexUnlockV2('beast_005');
    const cr1 = server.mcpCollectionRewardV2('beast_reward_1');
    v152Assert(cr1.success === true, 'collection.reward returns success when complete');
    v152Assert(cr1.rewardId === 'beast_reward_1', 'collection.reward rewardId correct');
    v152Assert(cr1.reward.spiritStones === 500, 'collection.reward gives 500 stones (5*100)');
    v152Assert(cr1.totalSpiritStones > 100000, 'collection.reward adds stones to total');

    const crErr4 = server.mcpCollectionRewardV2('beast_reward_1');
    v152Assert(crErr4.error && crErr4.error.includes('已领取'), 'collection.reward already claimed returns error');

    const crst1 = server.mcpCollectionResetV2();
    v152Assert(crst1.success === true, 'collection.reset returns success');

    const cv2 = server.mcpCodexViewV2('beast');
    v152Assert(cv2.entries.filter(e => e.unlocked).length === 0, 'after reset, all beast entries are locked');

    const cs2 = server.mcpCollectionStatsV2();
    v152Assert(cs2.totalCollected === 0, 'after reset, totalCollected is 0');
    v152Assert(cs2.categories[0].collected === 0, 'after reset, beast collected is 0');

    v152Assert(cs2.categories[0].rewardClaimed === false, 'after reset, rewardClaimed is false');

    const passed = results.filter(r => r.pass).length;
    const total = results.length;
    console.log('V152 Tests:', passed + '/' + total, '(' + (passed/total*100).toFixed(1) + '%)');
    return { version: 'V152', passed, total };
}
console.log(JSON.stringify(runV152Tests()));