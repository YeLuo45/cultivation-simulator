// ============================================================
// SerendipityHandler.js
// Extracted from game.js - cultivation-simulator
// Source lines: 33561-34025
// Auto-generated - Do not edit manually
// ============================================================

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