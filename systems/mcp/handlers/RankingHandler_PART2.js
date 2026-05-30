// ============================================================
// RankingHandler_PART2.js
// Extracted from game.js - cultivation-simulator
// Source lines: 30348-34510
// Auto-generated - Do not edit manually
// ============================================================

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
            mcpTalismanUse(talismanId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const talismanState = this._initTalismanState();
                    const talismanIndex = talismanState.inventory.findIndex(t => t.id === talismanId);
                    if (talismanIndex === -1) return { error: '符箓不存在: ' + talismanId };
                    const talisman = talismanState.inventory[talismanIndex];
                    // 移除符箓
                    talismanState.inventory.splice(talismanIndex, 1);
                    // 应用效果
                    if (!gs.bonusEffects) gs.bonusEffects = {};
                    switch (talisman.type) {
                        case 'attack':
                            gs.bonusEffects.attack = (gs.bonusEffects.attack || 0) + talisman.power;
                            break;
                        case 'defense':
                            gs.bonusEffects.defense = (gs.bonusEffects.defense || 0) + talisman.power;
                            break;
                        case 'spirit':
                            gs.bonusEffects.spirit = (gs.bonusEffects.spirit || 0) + talisman.power;
                            break;
                        case 'heal':
                            gs.bonusEffects.maxHp = (gs.bonusEffects.maxHp || 0) + talisman.power;
                            break;
                    }
                    return {
                        success: true,
                        name: talisman.name,
                        type: talisman.type,
                        power: talisman.power,
                        message: '使用 ' + talisman.name + ' 成功，获得 ' + talisman.power + ' 属性加成'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V135: _initEncounterState - 初始化奇遇系统状态
            _initEncounterState() {
                const gs = window.gameState;
                if (!gs.encounter) {
                    gs.encounter = {
                        activeEncounters: [],
                        completed: [],
                        cooldown: 0,
                        available: [
                            { id: 'ancient_cave', name: '古洞探险', description: '在深山中发现一处神秘古洞', rarity: 'rare', potential: 80 },
                            { id: 'spirit_beast', name: '灵兽之缘', description: '偶遇一只受伤的神奇灵兽', rarity: 'epic', potential: 100 },
                            { id: 'lost_treasure', name: '失落宝藏', description: '传说中藏有珍贵宝物的遗迹', rarity: 'rare', potential: 75 },
                            { id: 'cultivation_epiphany', name: '修炼顿悟', description: '突然领悟修炼真谛', rarity: 'legendary', potential: 120 },
                            { id: 'elder_encounter', name: '前辈遗泽', description: '遇到陨落的修士传承', rarity: 'epic', potential: 95 },
                            { id: 'miracle_medicine', name: '奇药现世', description: '发现一株罕见的灵药', rarity: 'rare', potential: 70 },
                            { id: 'hiddenRealm', name: '秘境界开', description: '发现一个隐藏的小世界', rarity: 'legendary', potential: 150 }
                        ]
                    };
                }
                return gs.encounter;
            }

            // V135: _initEventState - 初始化事件系统状态
            _initEventState() {
                const gs = window.gameState;
                if (!gs.event) {
                    gs.event = {
                        eventPool: [],
                        activeEvent: null,
                        history: []
                    };
                }
                return gs.event;
            }

            // V135: mcpEncounterList - 获取奇遇列表
            mcpEncounterList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const encounterState = this._initEncounterState();
                    return {
                        success: true,
                        total: encounterState.available.length,
                        active: encounterState.activeEncounters,
                        completed: encounterState.completed,
                        cooldown: encounterState.cooldown,
                        available: encounterState.available
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V135: mcpEncounterTrigger - 触发奇遇
            mcpEncounterTrigger(encounterId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const encounterState = this._initEncounterState();
                    if (encounterState.cooldown > 0) {
                        return { error: '奇遇冷却中，还需 ' + encounterState.cooldown + ' 秒' };
                    }
                    const encounter = encounterState.available.find(e => e.id === encounterId);
                    if (!encounter) return { error: '奇遇不存在: ' + encounterId };
                    // 检查是否已在进行中
                    const existing = encounterState.activeEncounters.find(e => e.id === encounterId);
                    if (existing) return { error: '奇遇已在进行中: ' + encounterId };
                    // 开始奇遇
                    const activeEnc = {
                        id: encounter.id,
                        name: encounter.name,
                        description: encounter.description,
                        rarity: encounter.rarity,
                        potential: encounter.potential,
                        startedAt: Date.now(),
                        choices: [
                            { id: 'accept', text: '欣然接受', reward: { spiritStones: Math.floor(Math.random() * 500) + 100 } },
                            { id: 'explore', text: '谨慎探索', reward: { materials: { herb: Math.floor(Math.random() * 5) + 1 } } },
                            { id: 'retreat', text: '暂时离开', reward: null }
                        ]
                    };
                    encounterState.activeEncounters.push(activeEnc);
                    // 设置冷却 (30秒)
                    encounterState.cooldown = 30;
                    return {
                        success: true,
                        encounterId: encounter.id,
                        name: encounter.name,
                        description: encounter.description,
                        rarity: encounter.rarity,
                        choices: activeEnc.choices,
                        message: '触发奇遇: ' + encounter.name
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V135: mcpEncounterComplete - 完成奇遇
            mcpEncounterComplete(encounterId, choice) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const encounterState = this._initEncounterState();
                    const activeIndex = encounterState.activeEncounters.findIndex(e => e.id === encounterId);
                    if (activeIndex === -1) return { error: '奇遇未在进行中: ' + encounterId };
                    const active = encounterState.activeEncounters[activeIndex];
                    const chosen = active.choices.find(c => c.id === choice);
                    if (!chosen) return { error: '无效的选择: ' + choice };
                    // 移除进行中的奇遇
                    encounterState.activeEncounters.splice(activeIndex, 1);
                    // 添加到已完成
                    encounterState.completed.push({
                        id: active.id,
                        name: active.name,
                        choice: choice,
                        completedAt: Date.now(),
                        reward: chosen.reward
                    });
                    // 应用奖励
                    if (chosen.reward) {
                        if (chosen.reward.spiritStones) {
                            gs.spiritStones = (gs.spiritStones || 0) + chosen.reward.spiritStones;
                        }
                        if (chosen.reward.materials) {
                            if (!gs.materials) gs.materials = {};
                            for (const [mat, qty] of Object.entries(chosen.reward.materials)) {
                                gs.materials[mat] = (gs.materials[mat] || 0) + qty;
                            }
                        }
                    }
                    return {
                        success: true,
                        encounterId: active.id,
                        name: active.name,
                        choice: choice,
                        reward: chosen.reward,
                        message: '完成奇遇: ' + active.name + ', 选择: ' + chosen.id
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V135: mcpEventList - 获取事件列表
            mcpEventList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const eventState = this._initEventState();
                    // 生成随机事件池
                    const events = [
                        { id: 'treasure_appear', name: '宝物的出现', description: '前方似乎有宝物出土', choices: ['立即前往', '谨慎观察', '离开'], effects: [{ attack: 20 }, { defense: 15 }, null] },
                        { id: 'cultivator_needs_help', name: '修士求助', description: '一位修士需要帮助', choices: ['出手相助', '指路离开', '无视'], effects: [{ reputation: 30, spiritStones: 200 }, { reputation: 10 }, null] },
                        { id: 'monster_cave', name: '妖兽洞穴', description: '发现一个妖兽洞穴', choices: ['深入探索', '在外围寻找', '放弃'], effects: [{ beastCore: 2, risk: 'high' }, { beastCore: 1, risk: 'low' }, null] },
                        { id: 'spiritual_ripple', name: '灵气波动', description: '感受到强烈的灵气波动', choices: ['吸收灵气', '记录位置', '离开'], effects: [{ spirit: 100 }, { discovered: true }, null] },
                        { id: 'trade_opportunity', name: '商人交易', description: '遇到一位行商修士', choices: ['大量购买', '小量尝试', '不感兴趣'], effects: [{ cost: -500, herbs: 5 }, { cost: -100, herbs: 1 }, null] }
                    ];
                    // 随机选择2-3个事件
                    const shuffled = events.sort(() => Math.random() - 0.5);
                    const selected = shuffled.slice(0, Math.floor(Math.random() * 2) + 2);
                    // 分配唯一ID
                    const now = Date.now();
                    const pool = selected.map((e, i) => ({ ...e, eventId: 'event_' + now + '_' + i }));
                    eventState.eventPool = pool;
                    return {
                        success: true,
                        total: pool.length,
                        events: pool,
                        activeEvent: eventState.activeEvent
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V135: mcpEventChoice - 选择事件选项
            mcpEventChoice(eventId, choiceIndex) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const eventState = this._initEventState();
                    const event = eventState.eventPool.find(e => e.eventId === eventId);
                    if (!event) return { error: '事件不存在: ' + eventId };
                    if (eventState.activeEvent) return { error: '已有进行中的事件: ' + eventState.activeEvent.eventId };
                    if (choiceIndex < 0 || choiceIndex >= event.choices.length) {
                        return { error: '无效的选项索引: ' + choiceIndex };
                    }
                    // 设置进行中的事件
                    eventState.activeEvent = {
                        ...event,
                        selectedChoice: choiceIndex,
                        selectedEffect: event.effects[choiceIndex],
                        chosenAt: Date.now()
                    };
                    return {
                        success: true,
                        eventId: event.eventId,
                        name: event.name,
                        choice: event.choices[choiceIndex],
                        effect: event.effects[choiceIndex],
                        message: '选择: ' + event.choices[choiceIndex] + ', 等待结算...'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V135: mcpEventResolve - 事件结算
            mcpEventResolve(eventId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const eventState = this._initEventState();
                    const active = eventState.activeEvent;
                    if (!active) return { error: '没有进行中的事件' };
                    if (active.eventId !== eventId) return { error: '事件ID不匹配: ' + eventId };
                    const effect = active.selectedEffect;
                    let reward = {};
                    let risk = null;
                    // 应用效果
                    if (effect && typeof effect === 'object') {
                        if (effect.spiritStones) {
                            gs.spiritStones = (gs.spiritStones || 0) + effect.spiritStones;
                            reward.spiritStones = effect.spiritStones;
                        }
                        if (effect.beastCore) {
                            if (!gs.materials) gs.materials = {};
                            gs.materials.beastCore = (gs.materials.beastCore || 0) + effect.beastCore;
                            reward.beastCore = effect.beastCore;
                        }
                        if (effect.herbs) {
                            if (!gs.materials) gs.materials = {};
                            gs.materials.herb = (gs.materials.herb || 0) + effect.herbs;
                            reward.herbs = effect.herbs;
                        }
                        if (effect.attack) {
                            if (!gs.bonusEffects) gs.bonusEffects = {};
                            gs.bonusEffects.attack = (gs.bonusEffects.attack || 0) + effect.attack;
                            reward.attack = effect.attack;
                        }
                        if (effect.defense) {
                            if (!gs.bonusEffects) gs.bonusEffects = {};
                            gs.bonusEffects.defense = (gs.bonusEffects.defense || 0) + effect.defense;
                            reward.defense = effect.defense;
                        }
                        if (effect.spirit) {
                            if (!gs.bonusEffects) gs.bonusEffects = {};
                            gs.bonusEffects.spirit = (gs.bonusEffects.spirit || 0) + effect.spirit;
                            reward.spirit = effect.spirit;
                        }
                        if (effect.reputation) {
                            gs.reputation = (gs.reputation || 0) + effect.reputation;
                            reward.reputation = effect.reputation;
                        }
                        if (effect.cost) {
                            gs.spiritStones = (gs.spiritStones || 0) + effect.cost; // cost是负数
                            reward.cost = effect.cost;
                        }
                        if (effect.discovered) reward.discovered = true;
                        risk = effect.risk;
                    }
                    // 添加到历史
                    eventState.history.push({
                        eventId: active.eventId,
                        name: active.name,
                        choice: active.selectedChoice,
                        effect: effect,
                        resolvedAt: Date.now()
                    });
                    // 清除进行中的事件
                    eventState.activeEvent = null;
                    return {
                        success: true,
                        eventId: active.eventId,
                        name: active.name,
                        choice: active.choices[active.selectedChoice],
                        effect: effect,
                        reward: reward,
                        risk: risk,
                        message: '结算事件: ' + active.name
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V136: _initBountyState - 初始化悬赏系统状态
            _initBountyState() {
                const gs = window.gameState;
                if (!gs.bounty) {
                    gs.bounty = {
                        bounties: [
                            { id: 'hunt_beast', title: '猎杀妖兽', description: '前往妖兽山脉猎杀一头筑基期妖兽', reward: { spiritStones: 2000, reputation: 50 }, difficulty: 'medium', expiresAt: null },
                            { id: 'deliver_msg', title: '传递密信', description: '将密信送往青云宗', reward: { spiritStones: 500, reputation: 20 }, difficulty: 'easy', expiresAt: null },
                            { id: 'collect_herb', title: '采集灵药', description: '在灵药谷采集10株百年灵药', reward: { spiritStones: 1500, materials: { herb: 5 } }, difficulty: 'medium', expiresAt: null },
                            { id: 'escort_treasure', title: '护送宝物', description: '护送一件宝物穿越危险区域', reward: { spiritStones: 3000, reputation: 100 }, difficulty: 'hard', expiresAt: null },
                            { id: 'elite_hunt', title: '精英猎杀', description: '猎杀一头金丹期妖兽', reward: { spiritStones: 8000, reputation: 200 }, difficulty: 'legendary', expiresAt: null }
                        ],
                        acceptedBounty: null
                    };
                }
                return gs.bounty;
            }

            // V136: _initQuestlineState - 初始化任务链系统状态
            _initQuestlineState() {
                const gs = window.gameState;
                if (!gs.questline) {
                    gs.questline = {
                        available: [
                            { id: 'shadow_devil', name: '暗影恶魔篇', description: '调查暗影恶魔的踪迹', stages: ['调查村庄失踪事件', '进入废弃矿洞', '击败暗影领主力竭', '获得恶魔核心'], reward: { spiritStones: 5000, reputation: 150 } },
                            { id: 'dragon_blood', name: '龙血觉醒篇', description: '寻找传说中的龙血传承', stages: ['寻找古籍记载', '前往龙墓遗址', '解开封印机关', '接受龙血洗礼'], reward: { spiritStones: 8000, reputation: 200 } },
                            { id: 'immortal_clue', name: '仙人遗迹篇', description: '探索上古仙人的遗迹', stages: ['获取遗迹地图', '穿越迷阵', '解开仙人考验', '获得仙人传承'], reward: { spiritStones: 12000, reputation: 300 } }
                        ],
                        activeQuestline: null,
                        currentStage: 0
                    };
                }
                return gs.questline;
            }

            // V136: mcpBountyList - 获取悬赏列表
            mcpBountyList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const bountyState = this._initBountyState();
                    return {
                        success: true,
                        total: bountyState.bounties.length,
                        bounties: bountyState.bounties,
                        acceptedBounty: bountyState.acceptedBounty,
                        message: '获取悬赏列表成功'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V136: mcpBountyAccept - 接取悬赏
            mcpBountyAccept(bountyId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const bountyState = this._initBountyState();
                    if (bountyState.acceptedBounty) {
                        return { error: '已有进行中的悬赏任务: ' + bountyState.acceptedBounty.id };
                    }
                    const bounty = bountyState.bounties.find(b => b.id === bountyId);
                    if (!bounty) return { error: '悬赏不存在: ' + bountyId };
                    bountyState.acceptedBounty = { ...bounty, acceptedAt: Date.now() };
                    return {
                        success: true,
                        bountyId: bounty.id,
                        title: bounty.title,
                        description: bounty.description,
                        reward: bounty.reward,
                        difficulty: bounty.difficulty,
                        message: '接取悬赏成功: ' + bounty.title
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V136: mcpBountyComplete - 完成悬赏
            mcpBountyComplete(bountyId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const bountyState = this._initBountyState();
                    if (!bountyState.acceptedBounty) {
                        return { error: '没有进行中的悬赏任务' };
                    }
                    if (bountyState.acceptedBounty.id !== bountyId) {
                        return { error: '悬赏ID不匹配: ' + bountyId };
                    }
                    const bounty = bountyState.acceptedBounty;
                    const reward = bounty.reward || {};
                    // 发放奖励
                    if (reward.spiritStones) {
                        gs.spiritStones = (gs.spiritStones || 0) + reward.spiritStones;
                    }
                    if (reward.reputation) {
                        gs.reputation = (gs.reputation || 0) + reward.reputation;
                    }
                    if (reward.materials) {
                        if (!gs.materials) gs.materials = {};
                        for (const [mat, qty] of Object.entries(reward.materials)) {
                            gs.materials[mat] = (gs.materials[mat] || 0) + qty;
                        }
                    }
                    const completed = { ...bounty, completedAt: Date.now() };
                    bountyState.acceptedBounty = null;
                    return {
                        success: true,
                        bountyId: bounty.id,
                        title: bounty.title,
                        reward: reward,
                        message: '完成悬赏: ' + bounty.title
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V136: mcpQuestlineList - 获取任务链列表
            mcpQuestlineList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const questlineState = this._initQuestlineState();
                    return {
                        success: true,
                        total: questlineState.available.length,
                        available: questlineState.available,
                        activeQuestline: questlineState.activeQuestline,
                        currentStage: questlineState.currentStage,
                        message: '获取任务链列表成功'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V136: mcpQuestlineActivate - 激活任务链
            mcpQuestlineActivate(questlineId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const questlineState = this._initQuestlineState();
                    if (questlineState.activeQuestline) {
                        return { error: '已有进行中的任务链: ' + questlineState.activeQuestline.id };
                    }
                    const questline = questlineState.available.find(q => q.id === questlineId);
                    if (!questline) return { error: '任务链不存在: ' + questlineId };
                    questlineState.activeQuestline = { ...questline };
                    questlineState.currentStage = 0;
                    return {
                        success: true,
                        questlineId: questline.id,
                        name: questline.name,
                        description: questline.description,
                        currentStage: 0,
                        stageName: questline.stages[0],
                        totalStages: questline.stages.length,
                        message: '激活任务链: ' + questline.name
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V136: mcpQuestlineAdvance - 推进任务链
            mcpQuestlineAdvance(questlineId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const questlineState = this._initQuestlineState();
                    if (!questlineState.activeQuestline) {
                        return { error: '没有进行中的任务链' };
                    }
                    if (questlineState.activeQuestline.id !== questlineId) {
                        return { error: '任务链ID不匹配: ' + questlineId };
                    }
                    const ql = questlineState.activeQuestline;
                    const nextStage = questlineState.currentStage + 1;
                    if (nextStage >= ql.stages.length) {
                        return { error: '任务链已完成，无法继续推进' };
                    }
                    questlineState.currentStage = nextStage;
                    return {
                        success: true,
                        questlineId: ql.id,
                        name: ql.name,
                        currentStage: nextStage,
                        stageName: ql.stages[nextStage],
                        totalStages: ql.stages.length,
                        isCompleted: nextStage === ql.stages.length - 1,
                        message: '推进任务链: ' + ql.name + ' - ' + ql.stages[nextStage]
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V137: _initAchievementState - 初始化成就系统状态
            _initAchievementState() {
                const gs = window.gameState;
                if (!gs.achievement) {
                    gs.achievement = {
                        achievements: [
                            { id: 'ach_first_blood', name: '初露锋芒', description: '完成第一次战斗', requirement: { type: 'combat', count: 1 }, reward: { spiritStones: 100, exp: 50 }, unlocked: false, claimed: false },
                            { id: 'ach_warrior_10', name: '百战之士', description: '完成10次战斗', requirement: { type: 'combat', count: 10 }, reward: { spiritStones: 500, exp: 200 }, unlocked: false, claimed: false },
                            { id: 'ach_warrior_100', name: '战神降世', description: '完成100次战斗', requirement: { type: 'combat', count: 100 }, reward: { spiritStones: 2000, exp: 1000 }, unlocked: false, claimed: false },
                            { id: 'ach_stone_1k', name: '小有余财', description: '累计拥有1000灵石', requirement: { type: 'spiritStones', amount: 1000 }, reward: { spiritStones: 200, exp: 100 }, unlocked: false, claimed: false },
                            { id: 'ach_stone_10k', name: '灵石富翁', description: '累计拥有10000灵石', requirement: { type: 'spiritStones', amount: 10000 }, reward: { spiritStones: 1000, exp: 500 }, unlocked: false, claimed: false },
                            { id: 'ach_stone_100k', name: '灵石巨头', description: '累计拥有100000灵石', requirement: { type: 'spiritStones', amount: 100000 }, reward: { spiritStones: 5000, exp: 2000 }, unlocked: false, claimed: false },
                            { id: 'ach_realm_1', name: '筑基成功', description: '达到筑基期', requirement: { type: 'realm', level: 1 }, reward: { spiritStones: 500, exp: 300 }, unlocked: false, claimed: false },
                            { id: 'ach_realm_2', name: '金丹大道', description: '达到金丹期', requirement: { type: 'realm', level: 2 }, reward: { spiritStones: 2000, exp: 1000 }, unlocked: false, claimed: false },
                            { id: 'ach_realm_3', name: '元婴真君', description: '达到元婴期', requirement: { type: 'realm', level: 3 }, reward: { spiritStones: 5000, exp: 2000 }, unlocked: false, claimed: false },
                            { id: 'ach_realm_4', name: '化神大能', description: '达到化神期', requirement: { type: 'realm', level: 4 }, reward: { spiritStones: 10000, exp: 5000 }, unlocked: false, claimed: false },
                            { id: 'ach_pill_10', name: '炼丹新手', description: '炼制10枚丹药', requirement: { type: 'pillCrafted', count: 10 }, reward: { spiritStones: 300, exp: 150 }, unlocked: false, claimed: false },
                            { id: 'ach_pill_100', name: '炼丹大师', description: '炼制100枚丹药', requirement: { type: 'pillCrafted', count: 100 }, reward: { spiritStones: 1500, exp: 700 }, unlocked: false, claimed: false },
                            { id: 'ach_skill_5', name: '技能博学', description: '学会5个技能', requirement: { type: 'skillLearned', count: 5 }, reward: { spiritStones: 500, exp: 250 }, unlocked: false, claimed: false },
                            { id: 'ach_skill_20', name: '技能专家', description: '学会20个技能', requirement: { type: 'skillLearned', count: 20 }, reward: { spiritStones: 2000, exp: 1000 }, unlocked: false, claimed: false },
                            { id: 'ach_equip_enhance_50', name: '强化专家', description: '强化装备50次', requirement: { type: 'equipmentEnhanced', count: 50 }, reward: { spiritStones: 1500, exp: 600 }, unlocked: false, claimed: false }
                        ],
                        stats: { totalUnlocked: 0, totalClaimed: 0, combatCount: 0, pillCrafted: 0, skillLearned: 0, equipmentEnhanced: 0 }
                    };
                }
                return gs.achievement;
            }

            // V137: _initBadgeState - 初始化徽章系统状态
            _initBadgeState() {
                const gs = window.gameState;
                if (!gs.badge) {
                    gs.badge = {
                        badges: [
                            { id: 'badge_warrior', name: '战士徽章', effect: '战斗力+5%', rarity: 'N', statBonus: { attack: 0.05 } },
                            { id: 'badge_merchant', name: '商人徽章', effect: '交易价格+3%', rarity: 'N', statBonus: { trade: 0.03 } },
                            { id: 'badge_lucky', name: '幸运徽章', effect: '暴击率+3%', rarity: 'R', statBonus: { crit: 0.03 } },
                            { id: 'badge_cultivator', name: '修炼徽章', effect: '修炼效率+5%', rarity: 'R', statBonus: { cultivation: 0.05 } },
                            { id: 'badge_dragon', name: '龙之徽章', effect: '全属性+8%', rarity: 'SR', statBonus: { all: 0.08 } },
                            { id: 'badge_phoenix', name: '凤凰徽章', effect: '生命恢复+10%', rarity: 'SR', statBonus: { hpRegen: 0.10 } },
                            { id: 'badge_immortal', name: '仙人徽章', effect: '所有奖励+15%', rarity: 'SSR', statBonus: { allReward: 0.15 } },
                            { id: 'badge_treasure', name: '宝藏猎人徽章', effect: '稀有物品概率+20%', rarity: 'R', statBonus: { rareRate: 0.20 } }
                        ],
                        equippedBadges: []
                    };
                }
                return gs.badge;
            }

            // V137: mcpAchievementList - 获取成就列表
            mcpAchievementList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const achState = this._initAchievementState();
                    return {
                        success: true,
                        total: achState.achievements.length,
                        unlocked: achState.achievements.filter(a => a.unlocked).length,
                        claimed: achState.achievements.filter(a => a.claimed).length,
                        achievements: achState.achievements,
                        stats: achState.stats,
                        message: '获取成就列表成功'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V137: mcpAchievementUnlock - 解锁成就
            mcpAchievementUnlock(achievementId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const achState = this._initAchievementState();
                    const ach = achState.achievements.find(a => a.id === achievementId);
                    if (!ach) return { error: '成就不存在: ' + achievementId };
                    if (ach.unlocked) return { error: '成就已解锁: ' + ach.name, achievement: ach };
                    // 检查条件
                    let canUnlock = false;
                    const req = ach.requirement;
                    switch (req.type) {
                        case 'combat':
                            canUnlock = (achState.stats.combatCount || 0) >= req.count;
                            break;
                        case 'spiritStones':
                            canUnlock = (gs.spiritStones || 0) >= req.amount;
                            break;
                        case 'realm':
                            canUnlock = (gs.realm || 0) >= req.level;
                            break;
                        case 'pillCrafted':
                            canUnlock = (achState.stats.pillCrafted || 0) >= req.count;
                            break;
                        case 'skillLearned':
                            canUnlock = (achState.stats.skillLearned || 0) >= req.count;
                            break;
                        case 'equipmentEnhanced':
                            canUnlock = (achState.stats.equipmentEnhanced || 0) >= req.count;
                            break;
                        default:
                            canUnlock = false;
                    }
                    if (!canUnlock) {
                        return { error: '成就条件未满足: ' + ach.name, requirement: req };
                    }
                    ach.unlocked = true;
                    achState.stats.totalUnlocked++;
                    return {
                        success: true,
                        achievementId: ach.id,
                        name: ach.name,
                        description: ach.description,
                        reward: ach.reward,
                        message: '解锁成就: ' + ach.name
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V137: mcpAchievementClaim - 领取成就奖励
            mcpAchievementClaim(achievementId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const achState = this._initAchievementState();
                    const ach = achState.achievements.find(a => a.id === achievementId);
                    if (!ach) return { error: '成就不存在: ' + achievementId };
                    if (!ach.unlocked) return { error: '成就未解锁: ' + ach.name };
                    if (ach.claimed) return { error: '成就奖励已领取: ' + ach.name };
                    // 发放奖励
                    const reward = ach.reward;
                    if (reward.spiritStones) {
                        gs.spiritStones = (gs.spiritStones || 0) + reward.spiritStones;
                    }
                    if (reward.exp) {
                        gs.exp = (gs.exp || 0) + reward.exp;
                    }
                    ach.claimed = true;
                    achState.stats.totalClaimed++;
                    return {
                        success: true,
                        achievementId: ach.id,
                        name: ach.name,
                        reward: reward,
                        message: '领取成就奖励: ' + ach.name
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V137: mcpBadgeList - 获取徽章列表
            mcpBadgeList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const badgeState = this._initBadgeState();
                    return {
                        success: true,
                        total: badgeState.badges.length,
                        equipped: badgeState.equippedBadges.length,
                        equippedBadges: badgeState.equippedBadges,
                        badges: badgeState.badges,
                        message: '获取徽章列表成功'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V137: mcpBadgeEquip - 佩戴徽章
            mcpBadgeEquip(badgeId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const badgeState = this._initBadgeState();
                    const badge = badgeState.badges.find(b => b.id === badgeId);
                    if (!badge) return { error: '徽章不存在: ' + badgeId };
                    if (badgeState.equippedBadges.includes(badgeId)) {
                        return { error: '徽章已佩戴: ' + badge.name };
                    }
                    if (badgeState.equippedBadges.length >= 3) {
                        return { error: '最多只能佩戴3个徽章' };
                    }
                    badgeState.equippedBadges.push(badgeId);
                    return {
                        success: true,
                        badgeId: badge.id,
                        name: badge.name,
                        effect: badge.effect,
                        rarity: badge.rarity,
                        equippedCount: badgeState.equippedBadges.length,
                        message: '佩戴徽章: ' + badge.name
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V137: mcpBadgeUnequip - 卸下徽章
            mcpBadgeUnequip() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const badgeState = this._initBadgeState();
                    if (badgeState.equippedBadges.length === 0) {
                        return { error: '没有佩戴任何徽章' };
                    }
                    const unequipped = [...badgeState.equippedBadges];
                    badgeState.equippedBadges = [];
                    return {
                        success: true,
                        unequippedCount: unequipped.length,
                        message: '卸下徽章成功'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V138: _initRankState - 初始化排行榜状态
            _initRankState() {
                const gs = window.gameState;
                if (!gs.rank) {
                    gs.rank = {
                        leaderboards: {
                            realm: { // 境界排行榜
                                entries: [],
                                updatedAt: null
                            },
                            wealth: { // 财富排行榜
                                entries: [],
                                updatedAt: null
                            },
                            badge: { // 徽章排行榜
                                entries: [],
                                updatedAt: null
                            }
                        },
                        rewardsClaimed: {
                            realm: false,
                            wealth: false,
                            badge: false
                        }
                    };
                }
                return gs.rank;
            }

            // V138: _initArenaState - 初始化竞技场状态
            _initArenaState() {
                const gs = window.gameState;
                if (!gs.arena) {
                    gs.arena = {
                        status: 'idle', // idle|matching|matched|fighting|finished
                        opponent: null,
                        matchTime: null,
                        fightResult: null,
                        rewardClaimed: false
                    };
                }
                return gs.arena;
            }

            // V138: _generateMockLeaderboard - 生成模拟排行榜数据
            _generateMockLeaderboard(rankType, playerRealm) {
                const mockNames = ['天剑子', '青云子', '玄清子', '玉清子', '紫霄子', '太虚子', '神农药师', '苍穹子', '星河子', '幽冥子'];
                const entries = [];
                for (let i = 0; i < 10; i++) {
                    let score, name;
                    switch(rankType) {
                        case 'realm':
                            score = 5 - i; // 境界等级 0-5
                            name = mockNames[i];
                            break;
                        case 'wealth':
                            score = (10 - i) * 10000; // 灵石数量
                            name = mockNames[i];
                            break;
                        case 'badge':
                            score = 5 - i; // 徽章分数
                            name = mockNames[i];
                            break;
                        default:
                            score = 0;
                            name = 'Unknown';
                    }
                    entries.push({ rank: i + 1, name, score });
                }
                return entries;
            }

            // V138: mcpRankList - 获取排行榜列表
            mcpRankList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const rankState = this._initRankState();
                    // 生成或更新各榜数据
                    const playerRealm = gs.realm || 0;
                    const playerWealth = gs.spiritStones || 0;
                    const playerBadgeScore = (gs.badge && gs.badge.equippedBadges) ? gs.badge.equippedBadges.length * 10 : 0;
                    
                    // 更新各榜
                    const realmBoard = rankState.leaderboards.realm;
                    const wealthBoard = rankState.leaderboards.wealth;
                    const badgeBoard = rankState.leaderboards.badge;
                    
                    // 生成mock数据
                    realmBoard.entries = this._generateMockLeaderboard('realm', playerRealm);
                    realmBoard.updatedAt = Date.now();
                    
                    wealthBoard.entries = this._generateMockLeaderboard('wealth', playerWealth);
                    wealthBoard.updatedAt = Date.now();
                    
                    badgeBoard.entries = this._generateMockLeaderboard('badge', playerBadgeScore);
                    badgeBoard.updatedAt = Date.now();
                    
                    return {
                        success: true,
                        leaderboards: {
                            realm: { name: '境界榜', entries: realmBoard.entries },
                            wealth: { name: '财富榜', entries: wealthBoard.entries },
                            badge: { name: '徽章榜', entries: badgeBoard.entries }
                        },
                        message: '获取排行榜列表成功'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V138: mcpRankQuery - 查询排名
            mcpRankQuery(rankType) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!['realm', 'wealth', 'badge'].includes(rankType)) {
                        return { error: '无效的排行榜类型: ' + rankType };
                    }
                    const rankState = this._initRankState();
                    let playerScore, boardName;
                    switch(rankType) {
                        case 'realm':
                            playerScore = gs.realm || 0;
                            boardName = '境界榜';
                            break;
                        case 'wealth':
                            playerScore = gs.spiritStones || 0;
                            boardName = '财富榜';
                            break;
                        case 'badge':
                            playerScore = (gs.badge && gs.badge.equippedBadges) ? gs.badge.equippedBadges.length * 10 : 0;
                            boardName = '徽章榜';
                            break;
                    }
                    // 计算排名(简单模拟)
                    let rank = 0;
                    const entries = rankState.leaderboards[rankType].entries || [];
                    if (entries.length > 0) {
                        for (let i = 0; i < entries.length; i++) {
                            if (entries[i].score >= playerScore) {
                                rank = entries[i].rank;
                                break;
                            }
                        }
                        if (rank === 0) rank = entries.length + 1;
                    } else {
                        rank = 1;
                    }
                    return {
                        success: true,
                        rankType,
                        boardName,
                        playerRank: rank,
                        playerScore,
                        message: '查询排名成功'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V138: mcpRankReward - 领取排名奖励
            mcpRankReward(rankType) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!['realm', 'wealth', 'badge'].includes(rankType)) {
                        return { error: '无效的排行榜类型: ' + rankType };
                    }
                    const rankState = this._initRankState();
                    if (rankState.rewardsClaimed[rankType]) {
                        return { error: '排名奖励已领取' };
                    }
                    // 根据排名给予奖励(默认第10名奖励)
                    const rewards = {
                        realm: { spiritStones: 500, exp: 200 },
                        wealth: { spiritStones: 1000, exp: 100 },
                        badge: { spiritStones: 300, exp: 150 }
                    };
                    const reward = rewards[rankType];
                    gs.spiritStones = (gs.spiritStones || 0) + reward.spiritStones;
                    gs.exp = (gs.exp || 0) + reward.exp;
                    rankState.rewardsClaimed[rankType] = true;
                    return {
                        success: true,
                        rankType,
                        reward,
                        message: '领取' + rankType + '排名奖励成功'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V138: mcpArenaMatch - 开始匹配
            mcpArenaMatch() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const arenaState = this._initArenaState();
                    if (arenaState.status !== 'idle') {
                        if (arenaState.status === 'matching') {
                            return { error: '正在匹配中...', status: arenaState.status };
                        }
                        if (arenaState.status === 'matched') {
                            return { error: '已有对手, 请先战斗', status: arenaState.status, opponent: arenaState.opponent };
                        }
                        return { error: '竞技场状态异常: ' + arenaState.status };
                    }
                    // 开始匹配
                    arenaState.status = 'matching';
                    arenaState.matchTime = Date.now();
                    arenaState.opponent = {
                        name: '擂台对手_' + Math.floor(Math.random() * 1000),
                        realm: Math.max(0, (gs.realm || 0) + Math.floor(Math.random() * 3) - 1),
                        stage: Math.floor(Math.random() * 3)
                    };
                    // 模拟5秒后匹配完成
                    setTimeout(() => {
                        if (arenaState.status === 'matching') {
                            arenaState.status = 'matched';
                        }
                    }, 5000);
                    return {
                        success: true,
                        status: 'matching',
                        message: '匹配中, 5秒后完成...',
                        opponent: arenaState.opponent
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V138: mcpArenaFight - 进行战斗
            mcpArenaFight() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const arenaState = this._initArenaState();
                    if (arenaState.status === 'idle') {
                        return { error: '请先匹配对手', status: 'idle' };
                    }
                    if (arenaState.status === 'matching') {
                        return { error: '匹配中, 请稍候...', status: 'matching' };
                    }
                    if (arenaState.status === 'finished') {
                        return { error: '战斗已结束', status: 'finished', fightResult: arenaState.fightResult };
                    }
                    // 计算胜负 - 基于境界等级
                    arenaState.status = 'fighting';
                    const playerRealm = gs.realm || 0;
                    const playerStage = gs.stage || 0;
                    const playerPower = playerRealm * 3 + playerStage;
                    const opponentRealm = arenaState.opponent.realm;
                    const opponentStage = arenaState.opponent.stage;
                    const opponentPower = opponentRealm * 3 + opponentStage;
                    // 添加随机性
                    const playerFinalPower = playerPower * (0.8 + Math.random() * 0.4);
                    const opponentFinalPower = opponentPower * (0.8 + Math.random() * 0.4);
                    const victory = playerFinalPower > opponentFinalPower;
                    arenaState.status = 'finished';
                    arenaState.fightResult = {
                        victory,
                        playerPower: Math.round(playerFinalPower),
                        opponentPower: Math.round(opponentFinalPower),
                        opponent: arenaState.opponent,
                        timestamp: Date.now()
                    };
                    arenaState.rewardClaimed = false;
                    return {
                        success: true,
                        victory,
                        playerPower: Math.round(playerFinalPower),
                        opponentPower: Math.round(opponentFinalPower),
                        opponent: arenaState.opponent,
                        message: victory ? '恭喜! 战斗胜利' : '战斗失败'
                    };
                } catch (e) { return { error: e.message }; }
            }
