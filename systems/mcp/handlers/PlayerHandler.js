// ============================================================
// PlayerHandler.js
// Extracted from game.js - cultivation-simulator
// Source lines: 6559-7114
// Auto-generated - Do not edit manually
// ============================================================

            // V74: MCP Tool Implementations
            mcpRealmList(detail) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const realms = CONFIG.realms;
                    const currentRealm = gs.realm || 0;
                    const currentStage = gs.stage || 0;
                    const result = { currentRealm, currentStage, realms };
                    if (detail) {
                        result.details = realms.map((r, i) => ({
                            name: r, index: i,
                            isCurrent: i === currentRealm,
                            progress: i < currentRealm ? 100 : i === currentRealm ? currentStage * 33.3 : 0
                        }));
                    }
                    return result;
                } catch(e) { return { error: e.message }; }
            }

            mcpItemCraft(recipeId, quantity) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const qty = quantity || 1;
                    // Try crafting via craftedItems lookup or simple receipt check
                    const item = gs.craftedItems ? gs.craftedItems[recipeId] : null;
                    if (!item) return { error: 'Recipe not found: ' + recipeId };
                    return { success: true, recipeId, quantity: qty, item, message: `Crafted ${qty}x ${recipeId}` };
                } catch(e) { return { error: e.message }; }
            }

            mcpSkillLearn(skillId, upgrade) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    return { success: true, skillId, upgraded: upgrade || false, message: `Skill ${skillId} learned` };
                } catch(e) { return { error: e.message }; }
            }

            mcpSectQuery(info) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const sect = gs.sect || {};
                    switch(info) {
                        case 'overview': return { name: sect.name || '无宗门', level: sect.level || 0, reputation: sect.reputation || 0 };
                        case 'members': return { members: sect.members || [] };
                        case 'resources': return { spiritStones: sect.spiritStones || 0, resources: sect.resources || {} };
                        case 'level': return { level: sect.level || 0, nextLevelReq: (sect.level || 0) * 1000 };
                        case 'all': return sect;
                        default: return { error: 'Unknown info type: ' + info };
                    }
                } catch(e) { return { error: e.message }; }
            }

            mcpPlayerAchievements(filter) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const ach = gs.achievements || {};
                    return { total: ach.length || 0, filter: filter || 'all', message: 'Achievement system accessible' };
                } catch(e) { return { error: e.message }; }
            }

            mcpCelestialBattlefield(action, tier) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!gs.celestialBattlefield) {
                        gs.celestialBattlefield = { joined: false, tier: 0, battles: 0, rank: 0 };
                    }
                    const bf = gs.celestialBattlefield;
                    switch(action) {
                        case 'list': return { tiers: [1,2,3,4,5], current: bf };
                        case 'join': bf.joined = true; bf.tier = tier || 1; return { success: true, tier: bf.tier };
                        case 'status': return bf;
                        case 'leave': bf.joined = false; return { success: true };
                        default: return { error: 'Unknown action: ' + action };
                    }
                } catch(e) { return { error: e.message }; }
            }

            mcpDashboard() {
                try {
                    const gs = window.gameState;
                    const tools = Array.from(this.toolRegistry.keys());
                    const categories = {
                        'NPC & Collaboration': tools.filter(t => t.startsWith('npc.') || t.startsWith('collab')),
                        'Cultivation': tools.filter(t => t.startsWith('cultivation.') || t === 'realm.list' || t === 'skill.learn'),
                        'Items & Craft': tools.filter(t => t.startsWith('item.') || t === 'player.achievements'),
                        'Battle': tools.filter(t => t.startsWith('battle.') || t === 'celestial.battlefield'),
                        'Game State': tools.filter(t => t.startsWith('gameState.') || t.startsWith('mcp.')),
                        'Sect': tools.filter(t => t === 'sect.query'),
                        'Serendipity': tools.filter(t => t.startsWith('serendipity.'))
                    };
                    return {
                        totalTools: tools.length,
                        gameState: gs ? { realm: gs.realm, stage: gs.stage, spiritStones: gs.spiritStones } : null,
                        categories,
                        message: 'MCP Dashboard - V74'
                    };
                } catch(e) { return { error: e.message }; }
            }

            // V75: MCP Tool Implementations
            mcpEquipmentQuery(slot) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const eq = gs.equipment || {};
                    if (slot && slot !== 'all') {
                        const piece = eq[slot];
                        return piece ? { slot, ...piece } : { error: 'Slot not found: ' + slot };
                    }
                    return { equipment: eq, slots: ['weapon','armor','boots','ring','amulet'] };
                } catch(e) { return { error: e.message }; }
            }

            mcpEquipmentEnhance(slot, stones) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!gs.equipment) gs.equipment = {};
                    if (!gs.equipment[slot]) {
                        gs.equipment[slot] = { name: slot, level: 0, bonus: {} };
                    }
                    const piece = gs.equipment[slot];
                    const cost = stones * 10;
                    if ((gs.spiritStones || 0) < cost) return { error: 'Not enough spirit stones' };
                    gs.spiritStones -= cost;
                    piece.level = (piece.level || 0) + 1;
                    piece.bonus = piece.bonus || {};
                    piece.bonus[piece.level] = stones * 2;
                    return { success: true, slot, newLevel: piece.level, cost, remaining: gs.spiritStones };
                } catch(e) { return { error: e.message }; }
            }

            // V76: 装备打造系统实现
            mcpEquipmentForge(slot, quality) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const validSlots = ['weapon','armor','boots','ring','amulet'];
                    if (!validSlots.includes(slot)) return { error: 'Invalid slot: ' + slot };
                    const QUALITY_MAP = { N: 0, R: 1, SR: 2, SSR: 3 };
                    const QUALITY_NAMES = ['N','R','SR','SSR'];
                    const qIdx = quality && QUALITY_MAP[quality] !== undefined
                        ? QUALITY_MAP[quality]
                        : Math.floor(Math.random() * 4);
                    const qName = QUALITY_NAMES[qIdx];
                    const ATTR_TYPES = ['attack','defense','hp','spirit','speed','crit'];
                    const attrCount = qIdx + 1;
                    const attrs = {};
                    for (let i = 0; i < attrCount; i++) {
                        const at = ATTR_TYPES[Math.floor(Math.random() * ATTR_TYPES.length)];
                        const val = (Math.floor(Math.random() * 50) + 10) * (qIdx + 1);
                        attrs[at] = (attrs[at] || 0) + val;
                    }
                    const NAMES = { weapon: '长剑', armor: '灵甲', boots: '战靴', ring: '戒指', amulet: '护符' };
                    const piece = {
                        name: NAMES[slot] || slot,
                        slot,
                        quality: qName,
                        level: 1,
                        attrs,
                        gems: [],
                        forgeTime: Date.now()
                    };
                    if (!gs.equipment) gs.equipment = {};
                    gs.equipment[slot] = piece;
                    return { success: true, ...piece };
                } catch(e) { return { error: e.message }; }
            }

            mcpEquipmentRefine(slot, stones) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!gs.equipment || !gs.equipment[slot]) return { error: 'No equipment in slot: ' + slot };
                    const piece = gs.equipment[slot];
                    const cost = (stones || 1) * 20;
                    if ((gs.spiritStones || 0) < cost) return { error: 'Not enough spirit stones' };
                    gs.spiritStones -= cost;
                    piece.refineLevel = (piece.refineLevel || 0) + 1;
                    piece.refineBonus = piece.refineBonus || {};
                    const bonus = Math.floor(Math.random() * 30) + 5;
                    piece.refineBonus[piece.refineLevel] = bonus;
                    return { success: true, slot, refineLevel: piece.refineLevel, bonus, cost, remaining: gs.spiritStones };
                } catch(e) { return { error: e.message }; }
            }

            mcpEquipmentScore(slot) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const calculateScore = (piece) => {
                        if (!piece) return 0;
                        const QUALITY_SCORES = { N: 10, R: 30, SR: 90, SSR: 270 };
                        let score = QUALITY_SCORES[piece.quality] || 10;
                        if (piece.attrs) {
                            for (const v of Object.values(piece.attrs)) score += v;
                        }
                        score += (piece.level || 1) * 5;
                        score += (piece.refineLevel || 0) * 20;
                        if (piece.gems) score += piece.gems.length * 50;
                        return score;
                    };
                    if (slot && slot !== 'all') {
                        return { slot, score: calculateScore(gs.equipment ? gs.equipment[slot] : null) };
                    }
                    const allSlots = ['weapon','armor','boots','ring','amulet'];
                    const scores = {};
                    let total = 0;
                    for (const s of allSlots) {
                        const sc = calculateScore(gs.equipment ? gs.equipment[s] : null);
                        scores[s] = sc;
                        total += sc;
                    }
                    return { scores, total, slots: allSlots };
                } catch(e) { return { error: e.message }; }
            }

            mcpEquipmentGemEmbed(slot, gemId, slotIndex) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!gs.equipment || !gs.equipment[slot]) return { error: 'No equipment in slot: ' + slot };
                    const piece = gs.equipment[slot];
                    piece.gems = piece.gems || [];
                    const idx = slotIndex || 0;
                    if (gemId === 'remove') {
                        const removed = piece.gems[idx];
                        piece.gems[idx] = null;
                        return { success: true, slot, removed, gems: piece.gems };
                    }
                    const GEM_STATS = { 'gem_red': 50, 'gem_blue': 40, 'gem_green': 30, 'gem_gold': 100 };
                    piece.gems[idx] = { id: gemId, stat: GEM_STATS[gemId] || 20 };
                    return { success: true, slot, gem: piece.gems[idx], index: idx };
                } catch(e) { return { error: e.message }; }
            }

            mcpItemGenerate(type, quality, level) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const QUALITY_MAP = { N: 0, R: 1, SR: 2, SSR: 3 };
                    const QUALITY_NAMES = ['N','R','SR','SSR'];
                    const qIdx = quality && QUALITY_MAP[quality] !== undefined
                        ? QUALITY_MAP[quality]
                        : Math.floor(Math.random() * 4);
                    const qName = QUALITY_NAMES[qIdx];
                    const TYPES = ['consumable','equipment','material','quest'];
                    const t = type && TYPES.includes(type) ? type : TYPES[Math.floor(Math.random() * TYPES.length)];
                    const lvl = level || (gs.realm || 1) * 3;
                    const NAMES = {
                        consumable: ['丹药','灵草','灵芝'], equipment: ['灵甲','灵剑'],
                        material: ['灵石','灵矿'], quest: ['古卷','令牌']
                    };
                    const name = (NAMES[t] || ['物品'])[Math.floor(Math.random() * 3)] + '-' + Date.now() % 1000;
                    const item = { id: 'item_' + Date.now(), name, type: t, quality: qName, level: lvl };
                    if (!gs.items) gs.items = [];
                    gs.items.push(item);
                    return { success: true, item };
                } catch(e) { return { error: e.message }; }
            }

            mcpBattlePower() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const realm = gs.realm || 1;
                    const basePower = realm * 100;
                    let equipBonus = 0;
                    if (gs.equipment) {
                        const scoreResult = this.mcpEquipmentScore('all');
                        equipBonus = scoreResult.total || 0;
                    }
                    const skillBonus = ((gs.skills || []).length) * 20;
                    const total = basePower + equipBonus + skillBonus;
                    return {
                        total,
                        base: basePower,
                        equipment: equipBonus,
                        skills: skillBonus,
                        realm
                    };
                } catch(e) { return { error: e.message }; }
            }

            // V77: 天道轮回增强 + 奇遇DAG深化实现
            mcpSerendipityKarma(action, type, amount) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!gs.karma) gs.karma = { good: 0, bad: 0, neutral: 0, events: [] };
                    if (action === 'list') return { karma: gs.karma };
                    if (action === 'query') return { total: gs.karma.good - gs.karma.bad, ...gs.karma };
                    if (action === 'record' && type) {
                        const t = type || 'neutral';
                        gs.karma[t] = (gs.karma[t] || 0) + (amount || 1);
                        gs.karma.events.push({ type: t, amount: amount || 1, time: Date.now() });
                        return { success: true, karma: gs.karma };
                    }
                    return { error: 'Invalid action: ' + action };
                } catch(e) { return { error: e.message }; }
            }

            mcpSerendipityFate(query) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!gs.fate) gs.fate = { traits: [], connections: [], destiny: 50 };
                    if (query === 'status') return { destiny: gs.fate.destiny, level: gs.fate.destiny > 80 ? '大吉' : gs.fate.destiny > 60 ? '吉' : gs.fate.destiny > 40 ? '平' : gs.fate.destiny > 20 ? '凶' : '大凶' };
                    if (query === 'traits') return { traits: gs.fate.traits || [] };
                    if (query === 'connections') return { connections: gs.fate.connections || [] };
                    return { error: 'Invalid query: ' + query };
                } catch(e) { return { error: e.message }; }
            }

            mcpSerendipityBranch(nodeId, choice) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!gs.serendipityDAG) return { error: 'Serendipity DAG not initialized' };
                    if (!nodeId || !choice) return { error: 'nodeId and choice required' };
                    gs.serendipityBranch = gs.serendipityBranch || {};
                    gs.serendipityBranch[nodeId] = choice;
                    return { success: true, nodeId, choice, effects: { branch_selected: true } };
                } catch(e) { return { error: e.message }; }
            }

            mcpSerendipityProgress() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const dag = gs.serendipityDAG;
                    if (!dag || !dag.nodes) return { error: 'DAG not initialized', nodes: 0, triggered: 0, completed: 0 };
                    let triggered = 0, completed = 0;
                    for (const [, node] of dag.nodes) {
                        if (node.status === 'triggered') triggered++;
                        if (node.status === 'completed') completed++;
                    }
                    return { totalNodes: dag.nodes.size, triggered, completed, nodeIds: Array.from(dag.nodes.keys()) };
                } catch(e) { return { error: e.message }; }
            }

            mcpCelestialReincarnation(action) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!gs.reincarnation) gs.reincarnation = { times: 0, totalKarma: 0, bonuses: [] };
                    if (action === 'stats') return { ...gs.reincarnation };
                    if (action === 'preview') return { nextRealm: (gs.realm || 1) + 1, karmaRequired: (gs.realm || 1) * 100 };
                    if (action === 'reincarnate') {
                        gs.reincarnation.times++;
                        gs.realm = 1;
                        gs.stage = 1;
                        gs.karma = gs.karma || {};
                        gs.reincarnation.bonuses.push({ time: Date.now(), bonus: 'realm_reset' });
                        return { success: true, times: gs.reincarnation.times };
                    }
                    return { error: 'Invalid action: ' + action };
                } catch(e) { return { error: e.message }; }
            }

            // V78: 仙界经济系统 + 灵宠进化树实现
            mcpMarketList(category) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const market = gs.market || [];
                    const cat = category || 'all';
                    if (cat === 'all') return { total: market.length, items: market };
                    return { total: market.filter(i => i.category === cat).length, items: market.filter(i => i.category === cat) };
                } catch(e) { return { error: e.message }; }
            }

            mcpMarketBuy(itemId, quantity) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const market = gs.market || [];
                    const item = market.find(i => i.id === itemId);
                    if (!item) return { error: 'Item not found in market: ' + itemId };
                    const cost = (item.price || 10) * (quantity || 1);
                    if ((gs.spiritStones || 0) < cost) return { error: 'Not enough spirit stones' };
                    gs.spiritStones -= cost;
                    if (!gs.items) gs.items = [];
                    for (let i = 0; i < (quantity || 1); i++) gs.items.push({ ...item, id: item.id + '_' + Date.now() + i });
                    return { success: true, item: item.name, quantity: quantity || 1, cost, remaining: gs.spiritStones };
                } catch(e) { return { error: e.message }; }
            }

            mcpMarketSell(itemId, price) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!gs.items) return { error: 'No items in inventory' };
                    const idx = gs.items.findIndex(i => i.id === itemId);
                    if (idx === -1) return { error: 'Item not found: ' + itemId };
                    const [item] = gs.items.splice(idx, 1);
                    if (!gs.market) gs.market = [];
                    gs.market.push({ id: 'mkt_' + Date.now(), name: item.name, category: item.type, price: price || 10, seller: 'player' });
                    return { success: true, sold: item.name, price, earned: price || 10 };
                } catch(e) { return { error: e.message }; }
            }

            mcpPetList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const pets = gs.pets || [];
                    return { total: pets.length, pets };
                } catch(e) { return { error: e.message }; }
            }

            mcpPetFeed(petId, food) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const pets = gs.pets || [];
                    const pet = pets.find(p => p.id === petId);
                    if (!pet) return { error: 'Pet not found: ' + petId };
                    const FOOD_BONUS = { normal: 5, premium: 15, super: 50 };
                    pet.affinity = (pet.affinity || 0) + (FOOD_BONUS[food] || 5);
                    return { success: true, petId, affinity: pet.affinity, bonus: FOOD_BONUS[food] || 5 };
                } catch(e) { return { error: e.message }; }
            }

            mcpPetEvolve(petId, stones) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const pets = gs.pets || [];
                    const pet = pets.find(p => p.id === petId);
                    if (!pet) return { error: 'Pet not found: ' + petId };
                    const cost = (stones || 1) * 50;
                    if ((gs.spiritStones || 0) < cost) return { error: 'Not enough spirit stones' };
                    gs.spiritStones -= cost;
                    pet.stage = (pet.stage || 1) + 1;
                    pet.evolutionCost = cost;
                    return { success: true, petId, newStage: pet.stage, cost, remaining: gs.spiritStones };
                } catch(e) { return { error: e.message }; }
            }

            mcpPetSkill(petId, action, skillId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const pets = gs.pets || [];
                    const pet = pets.find(p => p.id === petId);
                    if (!pet) return { error: 'Pet not found: ' + petId };
                    if (!pet.skills) pet.skills = [];
                    if (action === 'learn') {
                        if (pet.skills.length >= 4) return { error: 'Pet already has 4 skills' };
                        pet.skills.push({ id: skillId || 'skill_' + Date.now(), level: 1 });
                        return { success: true, skill: pet.skills[pet.skills.length - 1] };
                    }
                    if (action === 'upgrade') {
                        const skill = pet.skills.find(s => s.id === skillId);
                        if (!skill) return { error: 'Skill not found: ' + skillId };
                        skill.level = (skill.level || 1) + 1;
                        return { success: true, skill };
                    }
                    if (action === 'forget') {
                        pet.skills = pet.skills.filter(s => s.id !== skillId);
                        return { success: true, remaining: pet.skills.length };
                    }
                    return { error: 'Invalid action: ' + action };
                } catch(e) { return { error: e.message }; }
            }

            mcpEconomyStats() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const market = gs.market || [];
                    const items = gs.items || [];
                    return {
                        spiritStones: gs.spiritStones || 0,
                        marketListings: market.length,
                        playerItems: items.length,
                        totalValue: (gs.spiritStones || 0) + market.reduce((s, i) => s + (i.price || 0), 0)
                    };
                } catch(e) { return { error: e.message }; }
            }

            // V79: 离线持久化增强 + PowerSync实现
            mcpSaveExport(include) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const what = include || 'all';
                    let data = {};
                    if (what === 'all' || what === 'state') data.state = { realm: gs.realm, stage: gs.stage, spiritStones: gs.spiritStones, xp: gs.xp };
                    if (what === 'all' || what === 'items') data.items = gs.items || [];
                    if (what === 'all' || what === 'equipment') data.equipment = gs.equipment || {};
                    data.meta = { exported: Date.now(), version: 'V79', what };
                    return { success: true, data: JSON.stringify(data), size: JSON.stringify(data).length };
                } catch(e) { return { error: e.message }; }
            }

            mcpSaveImport(data) {
                try {
                    if (!data) return { error: 'data is required' };
                    const parsed = JSON.parse(data);
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (parsed.state) Object.assign(gs, parsed.state);
                    if (parsed.items) gs.items = parsed.items;
                    if (parsed.equipment) gs.equipment = parsed.equipment;
                    return { success: true, imported: parsed.meta?.what || 'unknown' };
                } catch(e) { return { error: e.message }; }
            }

            mcpSaveSync() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!gs.saveSlots) gs.saveSlots = {};
                    gs.saveSlots.auto = { timestamp: Date.now(), realm: gs.realm, stage: gs.stage, spiritStones: gs.spiritStones };
                    localStorage.setItem('cultivation_sim_autosave', JSON.stringify(gs));
                    return { success: true, slot: 'auto', synced: Date.now() };
                } catch(e) { return { error: e.message }; }
            }

            mcpSaveBackup() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!gs.saveSlots) gs.saveSlots = {};
                    const name = 'backup_' + Date.now();
                    gs.saveSlots[name] = JSON.parse(JSON.stringify(gs));
                    return { success: true, slot: name, timestamp: Date.now() };
                } catch(e) { return { error: e.message }; }
            }

            mcpSaveSlots() {
                try {
                    const gs = window.gameState;
                    const slots = gs.saveSlots || {};
                    const auto = localStorage.getItem('cultivation_sim_autosave');
                    return {
                        slots: Object.keys(slots),
                        autoExists: !!auto,
                        count: Object.keys(slots).length + (auto ? 1 : 0)
                    };
                } catch(e) { return { error: e.message }; }
            }

            mcpSaveDelete(slot) {
                try {
                    const gs = window.gameState;
                    if (!gs.saveSlots) return { error: 'No save slots exist' };
                    if (slot === 'auto') localStorage.removeItem('cultivation_sim_autosave');