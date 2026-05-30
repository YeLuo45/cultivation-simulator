// ============================================================
// InventoryHandler.js
// Extracted from game.js - cultivation-simulator
// Source lines: 32320-33524
// Auto-generated - Do not edit manually
// ============================================================

            // V126: mcpMapList - 获取地图区域列表
            mcpMapList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const mapState = this._initMapState();
                    return {
                        success: true,
                        areas: mapState.areas.map(a => ({
                            id: a.id,
                            name: a.name,
                            level: a.level,
                            unlocked: a.unlocked,
                            description: a.description
                        })),
                        currentArea: mapState.currentArea
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V126: mcpMapDetail - 获取地图详情
            mcpMapDetail(mapId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!mapId) return { error: '地图ID不能为空' };
                    const mapState = this._initMapState();
                    const area = mapState.areas.find(a => a.id === mapId);
                    if (!area) return { error: '地图区域不存在: ' + mapId };
                    return {
                        success: true,
                        id: area.id,
                        name: area.name,
                        description: area.description,
                        level: area.level,
                        unlocked: area.unlocked,
                        unlockCost: area.unlockCost,
                        reward: area.reward,
                        duration: area.duration
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V126: mcpMapUnlock - 解锁地图区域
            mcpMapUnlock(mapId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!mapId) return { error: '地图ID不能为空' };
                    const mapState = this._initMapState();
                    const area = mapState.areas.find(a => a.id === mapId);
                    if (!area) return { error: '地图区域不存在: ' + mapId };
                    if (area.unlocked) return { error: '该区域已解锁' };
                    if (gs.spiritStones < area.unlockCost) return { error: '灵石不足，需要 ' + area.unlockCost + ' 灵石' };
                    gs.spiritStones -= area.unlockCost;
                    area.unlocked = true;
                    return { success: true, message: '区域已解锁: ' + area.name, cost: area.unlockCost };
                } catch (e) { return { error: e.message }; }
            }

            // V126: mcpExploreStart - 开始探索
            mcpExploreStart(mapId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!mapId) return { error: '地图ID不能为空' };
                    const mapState = this._initMapState();
                    const exploreState = this._initExploreState();
                    const area = mapState.areas.find(a => a.id === mapId);
                    if (!area) return { error: '地图区域不存在: ' + mapId };
                    if (!area.unlocked) return { error: '该区域未解锁，请先解锁' };
                    if (exploreState.active) return { error: '已有正在进行的探索，请先完成' };
                    exploreState.active = {
                        areaId: mapId,
                        areaName: area.name,
                        startTime: Date.now(),
                        duration: area.duration * 1000
                    };
                    return { success: true, message: '开始探索: ' + area.name, duration: area.duration };
                } catch (e) { return { error: e.message }; }
            }

            // V126: mcpExploreStatus - 查看探索状态
            mcpExploreStatus() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const exploreState = this._initExploreState();
                    if (!exploreState.active) return { active: false, message: '当前没有正在进行的探索' };
                    const elapsed = Date.now() - exploreState.active.startTime;
                    const remaining = Math.max(0, exploreState.active.duration - elapsed);
                    const completed = remaining === 0;
                    return {
                        active: true,
                        areaId: exploreState.active.areaId,
                        areaName: exploreState.active.areaName,
                        elapsed: Math.floor(elapsed / 1000),
                        remaining: Math.floor(remaining / 1000),
                        completed,
                        message: completed ? '探索已完成，可以领取奖励' : '探索进行中'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V126: mcpExploreComplete - 领取探索奖励
            mcpExploreComplete() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const exploreState = this._initExploreState();
                    if (!exploreState.active) return { error: '当前没有正在进行的探索' };
                    const elapsed = Date.now() - exploreState.active.startTime;
                    if (elapsed < exploreState.active.duration) return { error: '探索尚未完成' };
                    const mapState = this._initMapState();
                    const area = mapState.areas.find(a => a.id === exploreState.active.areaId);
                    if (!area) return { error: '地图区域不存在' };
                    gs.spiritStones = (gs.spiritStones || 0) + area.reward.spiritStones;
                    gs.exp = (gs.exp || 0) + area.reward.exp;
                    const historyEntry = {
                        areaId: exploreState.active.areaId,
                        areaName: exploreState.active.areaName,
                        reward: area.reward,
                        completedAt: Date.now()
                    };
                    exploreState.history.push(historyEntry);
                    exploreState.active = null;
                    return {
                        success: true,
                        message: '探索完成: ' + area.name,
                        reward: area.reward,
                        totalHistory: exploreState.history.length
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V127: _initShopState - 初始化商店状态
            _initShopState() {
                const gs = window.gameState;
                if (!gs.shop) {
                    gs.shop = {
                        shops: [
                            {
                                id: 'shop_general',
                                name: '杂货铺',
                                items: [
                                    { id: 'item_pill_health', name: '疗伤丹', price: 100, quantity: 10, type: 'potion', effect: { hp: 200 } },
                                    { id: 'item_pill_spirit', name: '灵气丹', price: 200, quantity: 10, type: 'potion', effect: { spirit: 100 } },
                                    { id: 'item_weapon_iron', name: '铁剑', price: 500, quantity: 5, type: 'weapon', effect: { attack: 10 } },
                                    { id: 'item_armor_leather', name: '皮甲', price: 300, quantity: 5, type: 'armor', effect: { defense: 5 } },
                                    { id: 'item_material_herb', name: '灵草', price: 50, quantity: 20, type: 'material', effect: {} }
                                ],
                                refreshCost: 50
                            },
                            {
                                id: 'shop_elite',
                                name: '珍宝阁',
                                items: [
                                    { id: 'item_pill_gold', name: '金身丹', price: 2000, quantity: 3, type: 'potion', effect: { defense: 50 } },
                                    { id: 'item_weapon_silver', name: '银剑', price: 5000, quantity: 2, type: 'weapon', effect: { attack: 30 } },
                                    { id: 'item_artifacts_pendant', name: '灵玉佩', price: 3000, quantity: 3, type: 'accessory', effect: { spirit: 200 } }
                                ],
                                refreshCost: 200
                            }
                        ],
                        nextShopId: 3
                    };
                }
                return gs.shop;
            }

            // V127: _initBagState - 初始化背包状态
            _initBagState() {
                const gs = window.gameState;
                if (!gs.bag) {
                    gs.bag = {
                        items: [],
                        capacity: 50
                    };
                }
                return gs.bag;
            }

            // V127: mcpShopList - 获取商店列表
            mcpShopList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const shopState = this._initShopState();
                    return {
                        success: true,
                        shops: shopState.shops.map(s => ({
                            id: s.id,
                            name: s.name,
                            itemCount: s.items.length,
                            refreshCost: s.refreshCost
                        }))
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V127: mcpShopBuy - 购买商品
            mcpShopBuy(shopId, itemId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!shopId) return { error: 'shopId不能为空' };
                    if (!itemId) return { error: 'itemId不能为空' };
                    const shopState = this._initShopState();
                    const shop = shopState.shops.find(s => s.id === shopId);
                    if (!shop) return { error: '商店不存在: ' + shopId };
                    const item = shop.items.find(i => i.id === itemId);
                    if (!item) return { error: '商品不存在: ' + itemId };
                    if (item.quantity <= 0) return { error: '商品已售罄' };
                    if ((gs.spiritStones || 0) < item.price) return { error: '灵石不足' };
                    gs.spiritStones -= item.price;
                    item.quantity -= 1;
                    const bagState = this._initBagState();
                    const existingItem = bagState.items.find(i => i.id === itemId);
                    if (existingItem) {
                        existingItem.quantity += 1;
                    } else {
                        bagState.items.push({
                            id: item.id,
                            name: item.name,
                            type: item.type,
                            effect: item.effect,
                            quantity: 1
                        });
                    }
                    return { success: true, message: '购买成功: ' + item.name, cost: item.price, itemId: item.id };
                } catch (e) { return { error: e.message }; }
            }

            // V127: mcpShopRefresh - 刷新商店商品
            mcpShopRefresh(shopId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!shopId) return { error: 'shopId不能为空' };
                    const shopState = this._initShopState();
                    const shop = shopState.shops.find(s => s.id === shopId);
                    if (!shop) return { error: '商店不存在: ' + shopId };
                    if ((gs.spiritStones || 0) < shop.refreshCost) return { error: '灵石不足，无法刷新' };
                    gs.spiritStones -= shop.refreshCost;
                    // Refresh item quantities
                    shop.items.forEach(item => {
                        item.quantity = Math.floor(Math.random() * 10) + 1;
                    });
                    return { success: true, message: '刷新成功: ' + shop.name, cost: shop.refreshCost };
                } catch (e) { return { error: e.message }; }
            }

            // V127: mcpBagList - 获取背包物品
            mcpBagList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const bagState = this._initBagState();
                    return {
                        success: true,
                        items: bagState.items,
                        count: bagState.items.length,
                        capacity: bagState.capacity
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V127: mcpBagUse - 使用物品
            mcpBagUse(itemId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!itemId) return { error: 'itemId不能为空' };
                    const bagState = this._initBagState();
                    const item = bagState.items.find(i => i.id === itemId);
                    if (!item) return { error: '物品不存在: ' + itemId };
                    if (item.quantity <= 0) return { error: '物品数量不足' };
                    let message = '使用成功: ' + item.name;
                    let effectApplied = {};
                    if (item.type === 'potion' || item.type === 'material') {
                        // Apply effect from potion
                        if (item.effect.hp) {
                            gs.hp = (gs.hp || 0) + item.effect.hp;
                            effectApplied.hp = item.effect.hp;
                        }
                        if (item.effect.spirit) {
                            gs.spirit = (gs.spirit || 0) + item.effect.spirit;
                            effectApplied.spirit = item.effect.spirit;
                        }
                        if (item.effect.attack) {
                            gs.attack = (gs.attack || 0) + item.effect.attack;
                            effectApplied.attack = item.effect.attack;
                        }
                        if (item.effect.defense) {
                            gs.defense = (gs.defense || 0) + item.effect.defense;
                            effectApplied.defense = item.effect.defense;
                        }
                    } else if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') {
                        // Equipment applies permanent bonus (tracked separately)
                        effectApplied = item.effect;
                        message += ' (装备效果已生效)';
                    }
                    item.quantity -= 1;
                    if (item.quantity <= 0) {
                        const idx = bagState.items.findIndex(i => i.id === itemId);
                        if (idx !== -1) bagState.items.splice(idx, 1);
                    }
                    return { success: true, message, effect: effectApplied, remaining: item.quantity };
                } catch (e) { return { error: e.message }; }
            }

            // V127: mcpBagSell - 出售物品
            mcpBagSell(itemId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!itemId) return { error: 'itemId不能为空' };
                    const bagState = this._initBagState();
                    const item = bagState.items.find(i => i.id === itemId);
                    if (!item) return { error: '物品不存在: ' + itemId };
                    if (item.quantity <= 0) return { error: '物品数量不足' };
                    // Calculate sell price (50% of purchase price)
                    const sellPrice = Math.floor((item.price || 0) * 0.5);
                    gs.spiritStones = (gs.spiritStones || 0) + sellPrice;
                    item.quantity -= 1;
                    if (item.quantity <= 0) {
                        const idx = bagState.items.findIndex(i => i.id === itemId);
                        if (idx !== -1) bagState.items.splice(idx, 1);
                    }
                    return { success: true, message: '出售成功: ' + item.name, revenue: sellPrice, remaining: item.quantity };
                } catch (e) { return { error: e.message }; }
            }

            // V128: _initQuestState - 初始化任务状态
            _initQuestState() {
                const gs = window.gameState;
                if (!gs.quest) {
                    gs.quest = {
                        available: [
                            { id: 'quest_1', title: '收集灵草', description: '在仙界采集10株灵草', reward: { spiritStones: 100 }, requirement: { type: 'collect', itemId: 'herb', count: 10 }, progress: 0 },
                            { id: 'quest_2', title: '击败妖兽', description: '在秘境中击败5只妖兽', reward: { spiritStones: 200 }, requirement: { type: 'combat', count: 5 }, progress: 0 },
                            { id: 'quest_3', title: '炼制丹药', description: '炼制3颗灵气丹', reward: { spiritStones: 150 }, requirement: { type: 'craft', itemId: 'pill_spirit', count: 3 }, progress: 0 }
                        ],
                        active: [],
                        completed: []
                    };
                }
                return gs.quest;
            }

            // V128: _initDailyState - 初始化日常任务状态
            _initDailyState() {
                const gs = window.gameState;
                const now = Date.now();
                if (!gs.daily) {
                    gs.daily = {
                        tasks: [
                            { id: 'daily_1', title: '每日修炼', description: '完成灵气修炼', progress: 0, target: 1, reward: { spiritStones: 50 }, claimed: false },
                            { id: 'daily_2', title: '采集灵石', description: '采集5块灵石', progress: 0, target: 5, reward: { spiritStones: 30 }, claimed: false },
                            { id: 'daily_3', title: '击败怪物', description: '击败3只怪物', progress: 0, target: 3, reward: { spiritStones: 80 }, claimed: false }
                        ],
                        lastReset: now
                    };
                }
                return gs.daily;
            }

            // V128: mcpQuestList - 获取任务列表
            mcpQuestList(filter) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const questState = this._initQuestState();
                    const f = filter || 'available';
                    switch (f) {
                        case 'available': return { success: true, available: questState.available };
                        case 'active': return { success: true, active: questState.active };
                        case 'completed': return { success: true, completed: questState.completed };
                        case 'all': return { success: true, available: questState.available, active: questState.active, completed: questState.completed };
                        default: return { error: 'Unknown filter: ' + f };
                    }
                } catch (e) { return { error: e.message }; }
            }

            // V128: mcpQuestAccept - 接受任务
            mcpQuestAccept(questId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!questId) return { error: 'questId不能为空' };
                    const questState = this._initQuestState();
                    const idx = questState.available.findIndex(q => q.id === questId);
                    if (idx === -1) return { error: '任务不存在: ' + questId };
                    const quest = questState.available.splice(idx, 1)[0];
                    quest.progress = 0;
                    questState.active.push(quest);
                    return { success: true, message: '接受任务成功: ' + quest.title, questId: quest.id };
                } catch (e) { return { error: e.message }; }
            }

            // V128: mcpQuestComplete - 完成任务
            mcpQuestComplete(questId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!questId) return { error: 'questId不能为空' };
                    const questState = this._initQuestState();
                    const idx = questState.active.findIndex(q => q.id === questId);
                    if (idx === -1) return { error: '任务不存在或未接取: ' + questId };
                    const quest = questState.active[idx];
                    const req = quest.requirement;
                    if (quest.progress < req.count) return { error: '任务进度不足: ' + quest.progress + '/' + req.count };
                    // Award reward
                    if (quest.reward.spiritStones) gs.spiritStones = (gs.spiritStones || 0) + quest.reward.spiritStones;
                    // Move to completed
                    questState.active.splice(idx, 1);
                    questState.completed.push({ ...quest, completedAt: Date.now() });
                    return { success: true, message: '完成任务: ' + quest.title, reward: quest.reward };
                } catch (e) { return { error: e.message }; }
            }

            // V128: mcpDailyList - 获取日常任务
            mcpDailyList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const dailyState = this._initDailyState();
                    return { success: true, tasks: dailyState.tasks };
                } catch (e) { return { error: e.message }; }
            }

            // V128: mcpDailyClaim - 领取日常奖励
            mcpDailyClaim(dailyId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!dailyId) return { error: 'dailyId不能为空' };
                    const dailyState = this._initDailyState();
                    const task = dailyState.tasks.find(t => t.id === dailyId);
                    if (!task) return { error: '日常任务不存在: ' + dailyId };
                    if (task.claimed) return { error: '奖励已领取' };
                    if (task.progress < task.target) return { error: '任务未完成: ' + task.progress + '/' + task.target };
                    if (task.reward.spiritStones) gs.spiritStones = (gs.spiritStones || 0) + task.reward.spiritStones;
                    task.claimed = true;
                    return { success: true, message: '领取奖励成功: ' + task.title, reward: task.reward };
                } catch (e) { return { error: e.message }; }
            }

            // V128: mcpDailyReset - 重置日常任务
            mcpDailyReset() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const dailyState = this._initDailyState();
                    dailyState.tasks.forEach(t => {
                        t.progress = 0;
                        t.claimed = false;
                    });
                    dailyState.lastReset = Date.now();
                    return { success: true, message: '日常任务已重置' };
                } catch (e) { return { error: e.message }; }
            }

            // V129: 境界+突破系统 - 境界定义
            // V129使用扩展境界列表: 炼气、筑基、金丹、元婴、化神、炼虚、合道、大乘、真仙、金仙、太乙、大罗、道祖
            _getRealmList() {
                return ['炼气', '筑基', '金丹', '元婴', '化神', '炼虚', '合道', '大乘', '真仙', '金仙', '太乙', '大罗', '道祖'];
            }

            _getRealmDetail(realmIndex) {
                const realms = this._getRealmList();
                if (realmIndex < 0 || realmIndex >= realms.length) return null;
                const realmNames = realms[realmIndex];
                // 每个境界的突破条件: 需要灵气值和完成度
                const conditions = {
                    炼气: { minSpirit: 0, description: '初入修炼之路' },
                    筑基: { minSpirit: 1000, description: '凝聚根基，踏入修炼' },
                    金丹: { minSpirit: 5000, description: '金丹成型，灵力凝聚' },
                    元婴: { minSpirit: 20000, description: '元婴出窍，神识已成' },
                    化神: { minSpirit: 50000, description: '化神入虚，天人合一' },
                    炼虚: { minSpirit: 100000, description: '炼虚合道，返璞归真' },
                    合道: { minSpirit: 300000, description: '合道天地，万法归一' },
                    大乘: { minSpirit: 800000, description: '大乘境界，神通无量' },
                    真仙: { minSpirit: 2000000, description: '超凡入圣，真仙之境' },
                    金仙: { minSpirit: 5000000, description: '金仙不朽，万劫不灭' },
                    太乙: { minSpirit: 10000000, description: '太乙无量，大道独尊' },
                    大罗: { minSpirit: 30000000, description: '大罗混元，诸天至高' },
                    道祖: { minSpirit: 100000000, description: '道祖之境，天地同寿' }
                };
                return {
                    index: realmIndex,
                    name: realmNames,
                    condition: conditions[realmNames] || { minSpirit: 0, description: '未知境界' }
                };
            }

            // V129: _initRealmState - 初始化境界系统状态
            _initRealmState() {
                const gs = window.gameState;
                if (!gs.realm) {
                    gs.realm = {
                        currentRealm: 0,  // 炼气期 (index 0)
                        realmHistory: [],
                        realmProgress: 0  // 当前境界进度 0-100
                    };
                }
                return gs.realm;
            }

            // V129: _initBreakthroughState - 初始化突破系统状态
            _initBreakthroughState() {
                const gs = window.gameState;
                if (!gs.breakthrough) {
                    gs.breakthrough = {
                        preparing: false,
                        inProgress: false,
                        startTime: null,
                        duration: 0,        // 突破持续时间(ms)
                        result: null,       // 'success' | 'failed' | null
                        success: false
                    };
                }
                return gs.breakthrough;
            }

            // V130: _initSectState - 初始化宗门系统状态
            _initSectState() {
                const gs = window.gameState;
                if (!gs.sect) {
                    gs.sect = {
                        sects: [],              // 所有宗门列表
                        playerSect: null        // 玩家所属宗门
                    };
                }
                return gs.sect;
            }

            // V130: _initDiscipleState - 初始化弟子系统状态
            _initDiscipleState() {
                const gs = window.gameState;
                if (!gs.disciple) {
                    gs.disciple = {
                        disciples: [],          // 所有弟子列表
                        recruitCost: 500        // 招募消耗灵石
                    };
                }
                return gs.disciple;
            }

            // V131: _initTreasureState - 初始化秘宝系统状态
            _initTreasureState() {
                const gs = window.gameState;
                if (!gs.treasure) {
                    gs.treasure = {
                        treasures: [],         // 所有秘宝列表
                        nextId: 1              // 下一个秘宝ID
                    };
                }
                return gs.treasure;
            }

            // V131: _initEquipState - 初始化装备系统状态
            _initEquipState() {
                const gs = window.gameState;
                if (!gs.equip) {
                    gs.equip = {
                        equipped: {
                            weapon: null,
                            armor: null,
                            accessory: null
                        },
                        inventory: []          // 背包中的装备
                    };
                }
                return gs.equip;
            }

            // V131: mcpTreasureList - 获取秘宝列表
            mcpTreasureList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const treasureState = this._initTreasureState();
                    return {
                        success: true,
                        total: treasureState.treasures.length,
                        treasures: treasureState.treasures
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V131: mcpTreasureEnhance - 强化秘宝
            mcpTreasureEnhance(treasureId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const treasureState = this._initTreasureState();
                    const treasure = treasureState.treasures.find(t => t.id === treasureId);
                    if (!treasure) return { error: '秘宝不存在: ' + treasureId };
                    // 消耗材料: 每级需要 level * 100 灵气
                    const cost = treasure.level * 100;
                    if ((gs.spiritStones || 0) < cost) return { error: '灵气不足，强化需要 ' + cost + ' 灵气' };
                    gs.spiritStones -= cost;
                    treasure.level += 1;
                    return { success: true, treasure, cost };
                } catch (e) { return { error: e.message }; }
            }

            // V131: mcpTreasureDisassemble - 分解秘宝
            mcpTreasureDisassemble(treasureId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const treasureState = this._initTreasureState();
                    const idx = treasureState.treasures.findIndex(t => t.id === treasureId);
                    if (idx === -1) return { error: '秘宝不存在: ' + treasureId };
                    const treasure = treasureState.treasures[idx];
                    // 分解获得材料: level * 50 灵气
                    const reward = treasure.level * 50;
                    gs.spiritStones = (gs.spiritStones || 0) + reward;
                    treasureState.treasures.splice(idx, 1);
                    return { success: true, reward, message: '分解获得 ' + reward + ' 灵气' };
                } catch (e) { return { error: e.message }; }
            }

            // V131: mcpEquipList - 获取装备列表
            mcpEquipList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const equipState = this._initEquipState();
                    return {
                        success: true,
                        equipped: equipState.equipped,
                        inventoryCount: equipState.inventory.length
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V131: mcpEquipEquip - 穿戴装备
            mcpEquipEquip(equipId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const equipState = this._initEquipState();
                    const equip = equipState.inventory.find(e => e.id === equipId);
                    if (!equip) return { error: '装备不存在: ' + equipId };
                    const slot = equip.slot;
                    const prevEquip = equipState.equipped[slot];
                    if (prevEquip) {
                        equipState.inventory.push(prevEquip);
                    }
                    equipState.equipped[slot] = equip;
                    equipState.inventory = equipState.inventory.filter(e => e.id !== equipId);
                    return { success: true, slot, equip, previousEquip: prevEquip };
                } catch (e) { return { error: e.message }; }
            }

            // V131: mcpEquipUnequip - 卸下装备
            mcpEquipUnequip(slot) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const equipState = this._initEquipState();
                    const validSlots = ['weapon', 'armor', 'accessory'];
                    if (!validSlots.includes(slot)) return { error: '无效的装备槽位: ' + slot };
                    const equip = equipState.equipped[slot];
                    if (!equip) return { error: '该槽位没有装备: ' + slot };
                    equipState.inventory.push(equip);
                    equipState.equipped[slot] = null;
                    return { success: true, slot, equip };
                } catch (e) { return { error: e.message }; }
            }

            // V132: _initPetState - 初始化灵宠系统状态
            _initPetState() {
                const gs = window.gameState;
                if (!gs.pet) {
                    gs.pet = {
                        pets: [],            // 所有灵宠列表
                        nextId: 1,           // 下一个灵宠ID
                        captureCost: 500     // 捕捉消耗灵石
                    };
                }
                return gs.pet;
            }

            // V132: _initEvolveState - 初始化进化系统状态
            _initEvolveState() {
                const gs = window.gameState;
                if (!gs.evolve) {
                    gs.evolve = {
                        preparing: false,    // 是否准备中
                        inProgress: false,   // 是否进化中
                        petId: null,          // 进化中的灵宠ID
                        startTime: null      // 进化开始时间
                    };
                }
                return gs.evolve;
            }

            // V133: _initPillState - 初始化丹药系统状态
            _initPillState() {
                const gs = window.gameState;
                if (!gs.pill) {
                    gs.pill = {
                        inventory: [],       // 丹药背包
                        nextId: 1,           // 下一个丹药ID
                        consumeBonus: { attack: 0, defense: 0, spirit: 0, maxHp: 0 }  // 丹药加成
                    };
                }
                return gs.pill;
            }

            // V133: _initAlchemyState - 初始化炼药系统状态
            _initAlchemyState() {
                const gs = window.gameState;
                if (!gs.alchemy) {
                    gs.alchemy = {
                        recipes: [           // 炼药配方
                            { id: 'qi_spirit', name: '灵气丹', materials: { herb: 2, crystal: 1 }, result: { type: 'qi', effect: { spirit: 50 }, grade: 1 }, time: 5 },
                            { id: 'body_strengthening', name: '强体丹', materials: { herb: 3, beastCore: 1 }, result: { type: 'body', effect: { attack: 30, defense: 30 }, grade: 1 }, time: 8 },
                            { id: 'spirit_boost', name: '神识丹', materials: { herb: 5, soulDust: 2 }, result: { type: 'spirit', effect: { spirit: 100 }, grade: 2 }, time: 15 },
                            { id: 'health_restore', name: '回春丹', materials: { herb: 2, lifeRoot: 1 }, result: { type: 'health', effect: { maxHp: 200 }, grade: 1 }, time: 5 },
                            { id: 'comprehensive', name: '综合丹', materials: { herb: 4, crystal: 2, beastCore: 1 }, result: { type: 'all', effect: { attack: 20, defense: 20, spirit: 20, maxHp: 100 }, grade: 2 }, time: 20 }
                        ],
                        currentAlchemy: null  // 当前炼药状态
                    };
                }
                return gs.alchemy;
            }

            // V132: mcpPetList - 获取灵宠列表
            mcpPetList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const petState = this._initPetState();
                    return {
                        success: true,
                        total: petState.pets.length,
                        pets: petState.pets,
                        captureCost: petState.captureCost
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V132: mcpPetCapture - 捕捉灵宠
            mcpPetCapture() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const petState = this._initPetState();
                    const cost = petState.captureCost;
                    if ((gs.spiritStones || 0) < cost) return { error: '灵石不足，捕捉需要 ' + cost + ' 灵石' };
                    gs.spiritStones -= cost;
                    // 随机生成灵宠
                    const species = ['灵狐', '玄龟', '火鹤', '玉兔', '银狼', '青蛇', '白虎', '金鹏'];
                    const speciesIndex = Math.floor(Math.random() * species.length);
                    const baseLevel = Math.floor(Math.random() * 3) + 1;
                    const names = ['小仙', '灵儿', '小白', '阿福', '朵朵', '威威', '圆圆', '壮壮'];
                    const nameIndex = Math.floor(Math.random() * names.length);
                    const pet = {
                        id: 'pet_' + (petState.nextId++),
                        name: names[nameIndex],
                        species: species[speciesIndex],
                        level: baseLevel,
                        evolutionStage: 1,
                        stats: {
                            attack: 10 + baseLevel * 5,
                            defense: 5 + baseLevel * 3,
                            spirit: 8 + baseLevel * 4
                        }
                    };
                    petState.pets.push(pet);
                    return { success: true, pet, cost, message: '捕捉成功！获得 ' + pet.species + ' 【' + pet.name + '】' };
                } catch (e) { return { error: e.message }; }
            }

            // V132: mcpPetRelease - 放生灵宠
            mcpPetRelease(petId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const petState = this._initPetState();
                    const idx = petState.pets.findIndex(p => p.id === petId);
                    if (idx === -1) return { error: '灵宠不存在: ' + petId };
                    const pet = petState.pets[idx];
                    petState.pets.splice(idx, 1);
                    return { success: true, pet, message: '放生了 ' + pet.species + ' 【' + pet.name + '】' };
                } catch (e) { return { error: e.message }; }
            }

            // V132: mcpEvolvePrepare - 准备进化
            mcpEvolvePrepare(petId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const petState = this._initPetState();
                    const evolveState = this._initEvolveState();
                    const pet = petState.pets.find(p => p.id === petId);
                    if (!pet) return { error: '灵宠不存在: ' + petId };
                    // 检查是否可进化（等级>=5可进化）
                    if (pet.level < 5) {
                        return { success: false, petId, message: pet.name + ' 等级不足，需要5级才能进化', levelRequired: 5, currentLevel: pet.level };
                    }
                    if (pet.evolutionStage >= 3) {
                        return { success: false, petId, message: pet.name + ' 已达最高进化阶段', maxStage: 3 };
                    }
                    evolveState.preparing = true;
                    evolveState.petId = petId;
                    return {
                        success: true,
                        petId,
                        petName: pet.name,
                        currentStage: pet.evolutionStage,
                        nextStage: pet.evolutionStage + 1,
                        message: pet.name + ' 已准备好进化，当前阶段 ' + pet.evolutionStage + '，可进化至 ' + (pet.evolutionStage + 1)
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V132: mcpEvolveStart - 开始进化
            mcpEvolveStart() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const petState = this._initPetState();
                    const evolveState = this._initEvolveState();
                    if (!evolveState.preparing || !evolveState.petId) {
                        return { error: '没有准备进化的灵宠，请先调用 evolve.prepare' };
                    }
                    const pet = petState.pets.find(p => p.id === evolveState.petId);
                    if (!pet) return { error: '灵宠不存在，可能已被放生' };
                    evolveState.preparing = false;
                    evolveState.inProgress = true;
                    evolveState.startTime = Date.now();
                    return {
                        success: true,
                        petId: pet.id,
                        petName: pet.name,
                        message: pet.name + ' 开始进化，请等待后调用 evolve.complete 完成进化'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V132: mcpEvolveComplete - 完成进化
            mcpEvolveComplete() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const petState = this._initPetState();
                    const evolveState = this._initEvolveState();
                    if (!evolveState.inProgress || !evolveState.petId) {
                        return { error: '没有正在进化的灵宠，请先调用 evolve.start' };
                    }
                    const pet = petState.pets.find(p => p.id === evolveState.petId);
                    if (!pet) return { error: '灵宠不存在，可能已被放生' };
                    // 完成进化，提升属性
                    const oldLevel = pet.level;
                    const oldStage = pet.evolutionStage;
                    pet.level += 2;
                    pet.evolutionStage += 1;
                    pet.stats.attack = Math.floor(pet.stats.attack * 1.3);
                    pet.stats.defense = Math.floor(pet.stats.defense * 1.3);
                    pet.stats.spirit = Math.floor(pet.stats.spirit * 1.3);
                    // 重置进化状态
                    const evolvedPetId = evolveState.petId;
                    evolveState.inProgress = false;
                    evolveState.petId = null;
                    evolveState.startTime = null;
                    return {
                        success: true,
                        petId: evolvedPetId,
                        petName: pet.name,
                        oldLevel,
                        newLevel: pet.level,
                        oldStage: oldStage,
                        newStage: pet.evolutionStage,
                        statsUpgrade: pet.stats,
                        message: pet.name + ' 进化成功！等级 ' + oldLevel + ' -> ' + pet.level + '，阶段 ' + oldStage + ' -> ' + pet.evolutionStage
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V133: mcpPillList - 获取丹药列表
            mcpPillList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const pillState = this._initPillState();
                    return {
                        success: true,
                        total: pillState.inventory.length,
                        pills: pillState.inventory,
                        consumeBonus: pillState.consumeBonus
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V133: mcpPillRefine - 炼制丹药
            mcpPillRefine(recipeId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const pillState = this._initPillState();
                    const alchemyState = this._initAlchemyState();
                    // 查找配方
                    const recipe = alchemyState.recipes.find(r => r.id === recipeId);
                    if (!recipe) return { error: '炼药配方不存在: ' + recipeId };
                    // 检查是否正在炼药
                    if (alchemyState.currentAlchemy) {
                        return { error: '当前正在炼药中，请先完成炼药' };
                    }
                    // 消耗材料并炼制丹药（简化：直接获得丹药）
                    const pill = {
                        id: 'pill_' + pillState.nextId++,
                        name: recipe.name,
                        type: recipe.result.type,
                        effect: recipe.result.effect,
                        grade: recipe.result.grade
                    };
                    pillState.inventory.push(pill);
                    return {
                        success: true,
                        pill: pill,
                        message: '炼制成功！获得 ' + pill.name
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V133: mcpPillConsume - 服用丹药
            mcpPillConsume(pillId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const pillState = this._initPillState();
                    // 查找丹药
                    const pillIndex = pillState.inventory.findIndex(p => p.id === pillId);
                    if (pillIndex === -1) return { error: '丹药不存在: ' + pillId };
                    const pill = pillState.inventory[pillIndex];
                    // 移除丹药
                    pillState.inventory.splice(pillIndex, 1);
                    // 应用加成
                    if (pill.effect.attack) pillState.consumeBonus.attack += pill.effect.attack;
                    if (pill.effect.defense) pillState.consumeBonus.defense += pill.effect.defense;
                    if (pill.effect.spirit) pillState.consumeBonus.spirit += pill.effect.spirit;
                    if (pill.effect.maxHp) pillState.consumeBonus.maxHp += pill.effect.maxHp;
                    return {
                        success: true,
                        pillName: pill.name,
                        effect: pill.effect,
                        consumeBonus: pillState.consumeBonus,
                        message: '服用 ' + pill.name + ' 成功，属性加成已更新'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V133: mcpAlchemyList - 获取炼药配方
            mcpAlchemyList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const alchemyState = this._initAlchemyState();
                    return {
                        success: true,
                        total: alchemyState.recipes.length,
                        recipes: alchemyState.recipes
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V133: mcpAlchemyStart - 开始炼药
            mcpAlchemyStart(recipeId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const alchemyState = this._initAlchemyState();
                    // 查找配方
                    const recipe = alchemyState.recipes.find(r => r.id === recipeId);
                    if (!recipe) return { error: '炼药配方不存在: ' + recipeId };
                    // 检查是否正在炼药
                    if (alchemyState.currentAlchemy) {
                        return { error: '当前正在炼药中，请先完成炼药' };
                    }
                    // 开始炼药
                    alchemyState.currentAlchemy = {
                        recipeId: recipe.id,
                        recipeName: recipe.name,
                        startTime: Date.now(),
                        duration: recipe.time * 1000
                    };
                    return {
                        success: true,
                        recipeName: recipe.name,
                        duration: recipe.time,
                        message: '开始炼药 ' + recipe.name + '，预计需要 ' + recipe.time + ' 秒'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V133: mcpAlchemyComplete - 完成炼药
            mcpAlchemyComplete() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const alchemyState = this._initAlchemyState();
                    const pillState = this._initPillState();
                    if (!alchemyState.currentAlchemy) {
                        return { error: '当前没有正在进行的炼药，请先调用 alchemy.start' };
                    }
                    const current = alchemyState.currentAlchemy;
                    // 检查是否完成
                    const elapsed = Date.now() - current.startTime;
                    if (elapsed < current.duration) {
                        const remaining = Math.ceil((current.duration - elapsed) / 1000);
                        return { error: '炼药尚未完成，还需 ' + remaining + ' 秒' };
                    }
                    // 获取配方
                    const recipe = alchemyState.recipes.find(r => r.id === current.recipeId);
                    if (!recipe) return { error: '炼药配方不存在' };
                    // 生成丹药
                    const pill = {
                        id: 'pill_' + pillState.nextId++,
                        name: recipe.name,
                        type: recipe.result.type,
                        effect: recipe.result.effect,
                        grade: recipe.result.grade
                    };
                    pillState.inventory.push(pill);
                    // 清空炼药状态
                    alchemyState.currentAlchemy = null;
                    return {
                        success: true,
                        pill: pill,
                        message: '炼药完成！获得 ' + pill.name
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V134: _initFormationState - 初始化阵法系统状态
            _initFormationState() {
                const gs = window.gameState;
                if (!gs.formation) {
                    gs.formation = {
                        available: [
                            { id: 'spirit_shield', name: '灵气护盾阵', effect: { defense: 50 }, cost: { spiritStones: 100 } },
                            { id: 'attack_array', name: '攻击阵法', effect: { attack: 30 }, cost: { spiritStones: 150 } },
                            { id: 'speed_field', name: '加速阵', effect: { speed: 20 }, cost: { spiritStones: 80 } },
                            { id: 'spirit_gathering', name: '聚灵阵', effect: { spirit: 100 }, cost: { spiritStones: 200 } },
                            { id: 'healing_array', name: '疗伤阵', effect: { maxHp: 500 }, cost: { spiritStones: 120 } }
                        ],
                        placed: []
                    };
                }
                return gs.formation;
            }

            // V134: _initTalismanState - 初始化符箓系统状态
            _initTalismanState() {
                const gs = window.gameState;
                if (!gs.talisman) {
                    gs.talisman = {
                        inventory: [],
                        nextId: 1,
                        drawable: [
                            { id: 'attack符文', name: '攻击符文', type: 'attack', power: 25, materials: { herb: 3, beastCore: 1 } },
                            { id: 'defense符文', name: '防御符文', type: 'defense', power: 30, materials: { crystal: 2, herb: 1 } },
                            { id: 'spirit符文', name: '灵气符文', type: 'spirit', power: 50, materials: { soulDust: 2, herb: 2 } },
                            { id: 'heal符文', name: '治愈符文', type: 'heal', power: 100, materials: { lifeRoot: 2, herb: 3 } }
                        ]
                    };
                }
                return gs.talisman;
            }

            // V134: mcpFormationList - 获取阵法列表
            mcpFormationList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const formationState = this._initFormationState();
                    return {
                        success: true,
                        total: formationState.available.length,
                        available: formationState.available,
                        placed: formationState.placed
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V134: mcpFormationPlace - 布置阵法
            mcpFormationPlace(formationId, x, y) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const formationState = this._initFormationState();
                    const formation = formationState.available.find(f => f.id === formationId);
                    if (!formation) return { error: '阵法不存在: ' + formationId };
                    // 检查灵石是否足够
                    const cost = formation.cost.spiritStones || 0;
                    if ((gs.spiritStones || 0) < cost) return { error: '灵石不足，布置阵法需要 ' + cost + ' 灵石' };
                    gs.spiritStones -= cost;
                    // 添加到已布置列表
                    const placedFormation = {
                        id: 'placed_' + Date.now(),
                        formationId: formation.id,
                        name: formation.name,
                        x: x,
                        y: y,
                        active: false,
                        activatedAt: null
                    };
                    formationState.placed.push(placedFormation);
                    return {
                        success: true,
                        placed: placedFormation,
                        message: '布置 ' + formation.name + ' 成功，消耗 ' + cost + ' 灵石'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V134: mcpFormationActivate - 激活阵法
            mcpFormationActivate(placedFormationId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const formationState = this._initFormationState();
                    const placed = formationState.placed.find(f => f.id === placedFormationId);
                    if (!placed) return { error: '布置的阵法不存在: ' + placedFormationId };
                    if (placed.active) return { error: '阵法已经激活' };
                    // 找到阵法定义获取效果
                    const formationDef = formationState.available.find(f => f.id === placed.formationId);
                    if (!formationDef) return { error: '阵法定义不存在' };
                    // 激活阵法
                    placed.active = true;
                    placed.activatedAt = Date.now();
                    // 应用效果
                    if (!gs.bonusEffects) gs.bonusEffects = {};
                    const effect = formationDef.effect;
                    if (effect.attack) gs.bonusEffects.attack = (gs.bonusEffects.attack || 0) + effect.attack;
                    if (effect.defense) gs.bonusEffects.defense = (gs.bonusEffects.defense || 0) + effect.defense;
                    if (effect.spirit) gs.bonusEffects.spirit = (gs.bonusEffects.spirit || 0) + effect.spirit;
                    if (effect.maxHp) gs.bonusEffects.maxHp = (gs.bonusEffects.maxHp || 0) + effect.maxHp;
                    if (effect.speed) gs.bonusEffects.speed = (gs.bonusEffects.speed || 0) + effect.speed;
                    return {
                        success: true,
                        name: placed.name,
                        effect: effect,
                        message: '激活 ' + placed.name + ' 成功，获得属性加成'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V134: mcpTalismanList - 获取符箓列表
            mcpTalismanList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const talismanState = this._initTalismanState();
                    return {
                        success: true,
                        total: talismanState.inventory.length,
                        inventory: talismanState.inventory,
                        drawable: talismanState.drawable
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V134: mcpTalismanDraw - 绘制符箓
            mcpTalismanDraw(talismanId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const talismanState = this._initTalismanState();
                    const talismanDef = talismanState.drawable.find(t => t.id === talismanId);
                    if (!talismanDef) return { error: '符箓类型不存在: ' + talismanId };
                    // 检查材料是否足够
                    const materials = talismanDef.materials;
                    for (const [mat, count] of Object.entries(materials)) {
                        if ((gs.materials && gs.materials[mat] || 0) < count) {
                            return { error: '材料不足: ' + mat + ' 需要 ' + count + ' 当前 ' + (gs.materials && gs.materials[mat] || 0) };
                        }
                    }
                    // 消耗材料
                    for (const [mat, count] of Object.entries(materials)) {
                        gs.materials[mat] -= count;
                    }
                    // 添加到背包
                    const talisman = {
                        id: 'talisman_' + talismanState.nextId++,
                        name: talismanDef.name,
                        type: talismanDef.type,
                        power: talismanDef.power
                    };
                    talismanState.inventory.push(talisman);
                    return {
                        success: true,
                        talisman: talisman,
                        message: '绘制 ' + talismanDef.name + ' 成功'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V134: mcpTalismanUse - 使用符箓