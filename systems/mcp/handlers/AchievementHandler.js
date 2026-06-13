// ============================================================
// AchievementHandler.js
// Extracted from game.js - cultivation-simulator
// Source lines: 29506-30327
// Auto-generated - Do not edit manually
// ============================================================


            // V146: _initBadgeState - 初始化徽章系统状态
            _initBadgeState() {
                const gs = window.gameState;
                if (!gs.badge) {
                    gs.badge = {
                        badges: [
                            { id: 'badge_001', name: '新手徽章', description: '新手修士', rarity: 'common', obtained: false, equipped: false },
                            { id: 'badge_002', name: '筑基徽章', description: '筑基期修士', rarity: 'uncommon', obtained: false, equipped: false },
                            { id: 'badge_003', name: '金丹徽章', description: '金丹期修士', rarity: 'rare', obtained: false, equipped: false },
                            { id: 'badge_004', name: '灵宠徽章', description: '拥有灵宠', rarity: 'common', obtained: false, equipped: false },
                            { id: 'badge_005', name: '炼丹徽章', description: '会炼丹', rarity: 'uncommon', obtained: false, equipped: false },
                            { id: 'badge_006', name: '签到徽章', description: '连续签到7天', rarity: 'uncommon', obtained: false, equipped: false },
                            { id: 'badge_007', name: '飞升徽章', description: '已飞升仙界', rarity: 'legendary', obtained: false, equipped: false },
                            { id: 'badge_008', name: '探索徽章', description: '探索过秘境', rarity: 'rare', obtained: false, equipped: false }
                        ],
                        equippedBadges: []
                    };
                }
                return gs.badge;
            }

            // V147: _initRankState - 初始化排行榜系统状态
            _initRankState() {
                const gs = window.gameState;
                if (!gs.rank) {
                    gs.rank = {
                        realms: ['spirit', 'foundation', 'core', 'nascent', '元婴'],
                        disciples: gs.disciples ? gs.disciples.slice() : [],
                        weeklyRewardClaimed: false,
                        lastUpdate: Date.now()
                    };
                }
                return gs.rank;
            }

            // V147: _initArenaState - 初始化竞技系统状态
            _initArenaState() {
                const gs = window.gameState;
                if (!gs.arena) {
                    gs.arena = {
                        currentMatch: null,
                        matchHistory: [],
                        weeklyRewardClaimed: false,
                        rating: 1000
                    };
                }
                return gs.arena;
            }

            // V148: _initSerendipityState - 初始化奇遇系统状态
            _initSerendipityState() {
                const gs = window.gameState;
                if (!gs.serendipity) {
                    gs.serendipity = {
                        areas: [
                            { id: 'forest', name: '幽冥森林', description: '雾气缭绕的古林，机缘遍布', difficulty: 'low', activeSerendipity: null },
                            { id: 'cave', name: '天机洞府', description: '神秘莫测的洞天，福缘深厚', difficulty: 'medium', activeSerendipity: null },
                            { id: 'temple', name: '飞升遗迹', description: '上古仙人遗址，危机四伏', difficulty: 'high', activeSerendipity: null },
                            { id: 'secluded', name: '隐秘禁地', description: '禁断之地，奇遇难测', difficulty: 'extreme', activeSerendipity: null }
                        ],
                        completedSerendipities: []
                    };
                }
                return gs.serendipity;
            }

            // V148: _initEventState - 初始化事件系统状态
            _initEventState() {
                const gs = window.gameState;
                if (!gs.event) {
                    const now = Date.now();
                    gs.event = {
                        events: [
                            { id: 'weekly_cultivate', name: '双倍修炼周', description: '修炼效率翻倍', startTime: now - 86400000 * 3, endTime: now + 86400000 * 4, reward: { spiritStones: 5000, exp: 10000 }, joined: false, completed: false },
                            { id: 'monthly_battle', name: '决战天榜', description: '月终排位赛', startTime: now - 86400000 * 15, endTime: now + 86400000 * 15, reward: { spiritStones: 20000, title: '天榜强者' }, joined: false, completed: false },
                            { id: 'limited_explore', name: '秘境探索季', description: '秘境探索额外奖励', startTime: now - 86400000 * 7, endTime: now + 86400000 * 7, reward: { items: ['秘境钥匙', '灵草'] }, joined: false, completed: false }
                        ],
                        eventHistory: []
                    };
                }
                return gs.event;
            }

            // V149: _initQuestState - 初始化悬赏系统状态
            _initQuestState() {
                const gs = window.gameState;
                if (!gs.quest) {
                    gs.quest = {
                        quests: [
                            { id: 'q001', name: '采集灵草', description: '前往幽冥森林采集10株灵草', difficulty: 'easy', reward: { spiritStones: 200, exp: 500 }, accepted: false, completed: false },
                            { id: 'q002', name: '击败妖兽', description: '在森林中击败3只妖兽', difficulty: 'medium', reward: { spiritStones: 500, exp: 1000 }, accepted: false, completed: false },
                            { id: 'q003', name: '探索遗迹', description: '探索飞升遗迹并获得一件文物', difficulty: 'hard', reward: { spiritStones: 1000, exp: 3000 }, accepted: false, completed: false },
                            { id: 'q004', name: '炼制丹药', description: '成功炼制一颗筑基丹', difficulty: 'medium', reward: { spiritStones: 300, items: ['筑基丹'] }, accepted: false, completed: false },
                            { id: 'q005', name: '护送商队', description: '护送商队安全通过危险区域', difficulty: 'hard', reward: { spiritStones: 800, exp: 2000 }, accepted: false, completed: false }
                        ],
                        activeQuests: []
                    };
                }
                return gs.quest;
            }

            // V149: _initChainState - 初始化任务链系统状态
            _initChainState() {
                const gs = window.gameState;
                if (!gs.chain) {
                    gs.chain = {
                        chains: [
                            {
                                id: 'c001',
                                name: '新手试炼',
                                description: '完成一系列新手任务，熟悉修仙世界',
                                progress: 0,
                                reward: { spiritStones: 1000, items: ['新手礼包'] },
                                claimed: false,
                                steps: [
                                    { desc: '接受悬赏任务', completed: false },
                                    { desc: '击败1只妖兽', completed: false },
                                    { desc: '收集5株灵草', completed: false },
                                    { desc: '领取奖励', completed: false }
                                ]
                            },
                            {
                                id: 'c002',
                                name: '筑基之路',
                                description: '完成筑基境界的试炼',
                                progress: 0,
                                reward: { spiritStones: 5000, exp: 10000, items: ['筑基丹x3'] },
                                claimed: false,
                                steps: [
                                    { desc: '完成3个悬赏任务', completed: false },
                                    { desc: '击败筑基期妖兽', completed: false },
                                    { desc: '炼制丹药成功', completed: false },
                                    { desc: '探索秘境获得宝物', completed: false },
                                    { desc: '领取奖励', completed: false }
                                ]
                            },
                            {
                                id: 'c003',
                                name: '金丹成就',
                                description: '迈向金丹境界的挑战',
                                progress: 0,
                                reward: { spiritStones: 20000, exp: 50000, items: ['金丹辅助丹x5'] },
                                claimed: false,
                                steps: [
                                    { desc: '完成5个困难悬赏', completed: false },
                                    { desc: '挑战天榜排位赛', completed: false },
                                    { desc: '获得一件紫色装备', completed: false },
                                    { desc: '击败元婴期强敌', completed: false },
                                    { desc: '领取奖励', completed: false }
                                ]
                            }
                        ],
                        activeChain: null
                    };
                }
                return gs.chain;
            }

            // V149: mcpQuestList - 获取悬赏任务列表
            mcpQuestList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const questState = this._initQuestState();
                    return {
                        success: true,
                        quests: questState.quests.map(q => ({
                            id: q.id,
                            name: q.name,
                            description: q.description,
                            difficulty: q.difficulty,
                            reward: q.reward,
                            status: q.completed ? 'completed' : (q.accepted ? 'active' : 'available')
                        })),
                        total: questState.quests.length,
                        message: '共' + questState.quests.length + '个悬赏任务'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V149: mcpQuestAccept - 接受悬赏任务
            mcpQuestAccept(questId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!questId) return { error: '请指定任务ID' };
                    const questState = this._initQuestState();
                    const quest = questState.quests.find(q => q.id === questId);
                    if (!quest) return { error: '任务不存在: ' + questId };
                    if (quest.accepted) return { error: '任务已接受' };
                    if (quest.completed) return { error: '任务已完成' };
                    if (questState.activeQuests.length >= 3) return { error: '最多同时接受3个任务' };
                    quest.accepted = true;
                    questState.activeQuests.push(questId);
                    return { success: true, questId, questName: quest.name, message: '已接受悬赏：' + quest.name };
                } catch (e) { return { error: e.message }; }
            }

            // V149: mcpQuestComplete - 完成任务领取奖励
            mcpQuestComplete(questId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!questId) return { error: '请指定任务ID' };
                    const questState = this._initQuestState();
                    const quest = questState.quests.find(q => q.id === questId);
                    if (!quest) return { error: '任务不存在: ' + questId };
                    if (!quest.accepted) return { error: '任务未接受，请先接受任务' };
                    if (quest.completed) return { error: '任务已完成' };
                    quest.completed = true;
                    quest.accepted = false;
                    questState.activeQuests = questState.activeQuests.filter(id => id !== questId);
                    const reward = quest.reward;
                    if (reward.spiritStones) gs.spiritStones = (gs.spiritStones || 0) + reward.spiritStones;
                    if (reward.exp) gs.cultivationProgress = (gs.cultivationProgress || 0) + reward.exp;
                    if (reward.items && Array.isArray(reward.items)) {
                        gs.items = gs.items || [];
                        reward.items.forEach(item => gs.items.push(item));
                    }
                    return { success: true, questId, questName: quest.name, reward, message: '任务完成！获得奖励：灵石' + (reward.spiritStones || 0) };
                } catch (e) { return { error: e.message }; }
            }

            // V149: mcpChainList - 获取任务链列表
            mcpChainList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const chainState = this._initChainState();
                    return {
                        success: true,
                        chains: chainState.chains.map(c => ({
                            id: c.id,
                            name: c.name,
                            description: c.description,
                            progress: c.progress,
                            totalSteps: c.steps.length,
                            completedSteps: c.steps.filter(s => s.completed).length,
                            reward: c.reward,
                            status: c.claimed ? 'claimed' : (c.progress >= c.steps.length ? 'claimable' : 'in_progress')
                        })),
                        total: chainState.chains.length,
                        message: '共' + chainState.chains.length + '个任务链'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V149: mcpChainProgress - 查看任务链进度
            mcpChainProgress(chainId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!chainId) return { error: '请指定任务链ID' };
                    const chainState = this._initChainState();
                    const chain = chainState.chains.find(c => c.id === chainId);
                    if (!chain) return { error: '任务链不存在: ' + chainId };
                    return {
                        success: true,
                        chainId: chain.id,
                        name: chain.name,
                        description: chain.description,
                        progress: chain.progress,
                        totalSteps: chain.steps.length,
                        steps: chain.steps.map((s, i) => ({
                            index: i + 1,
                            desc: s.desc,
                            completed: s.completed
                        })),
                        reward: chain.reward,
                        claimed: chain.claimed,
                        message: chain.name + '：进度 ' + chain.progress + '/' + chain.steps.length
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V149: mcpChainClaim - 领取任务链奖励
            mcpChainClaim(chainId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!chainId) return { error: '请指定任务链ID' };
                    const chainState = this._initChainState();
                    const chain = chainState.chains.find(c => c.id === chainId);
                    if (!chain) return { error: '任务链不存在: ' + chainId };
                    if (chain.claimed) return { error: '奖励已领取' };
                    if (chain.progress < chain.steps.length) return { error: '任务链未完成，无法领取奖励' };
                    chain.claimed = true;
                    const reward = chain.reward;
                    if (reward.spiritStones) gs.spiritStones = (gs.spiritStones || 0) + reward.spiritStones;
                    if (reward.exp) gs.cultivationProgress = (gs.cultivationProgress || 0) + reward.exp;
                    if (reward.items && Array.isArray(reward.items)) {
                        gs.items = gs.items || [];
                        reward.items.forEach(item => gs.items.push(item));
                    }
                    return { success: true, chainId, chainName: chain.name, reward, message: '奖励已领取！获得灵石' + (reward.spiritStones || 0) };
                } catch (e) { return { error: e.message }; }
            }

            // V146: mcpAchievementList - 获取成就列表
            mcpAchievementList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const achState = this._initAchievementState();
                    const unlockedCount = achState.achievements.filter(a => a.unlocked).length;
                    return {
                        success: true,
                        total: achState.achievements.length,
                        unlockedCount: unlockedCount,
                        totalPoints: achState.totalPoints,
                        achievements: achState.achievements
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V146: mcpAchievementView - 查看成就详情
            mcpAchievementView(achievementId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!achievementId) return { error: '请指定成就ID' };
                    const achState = this._initAchievementState();
                    const achievement = achState.achievements.find(a => a.id === achievementId);
                    if (!achievement) return { error: '成就不存在: ' + achievementId };
                    return { success: true, achievement };
                } catch (e) { return { error: e.message }; }
            }

            // V146: mcpAchievementUnlock - 解锁成就
            mcpAchievementUnlock(achievementId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!achievementId) return { error: '请指定成就ID' };
                    const achState = this._initAchievementState();
                    const achievement = achState.achievements.find(a => a.id === achievementId);
                    if (!achievement) return { error: '成就不存在: ' + achievementId };
                    if (achievement.unlocked) return { success: true, achievement, message: '成就已解锁' };
                    
                    achievement.unlocked = true;
                    achievement.unlockedAt = new Date().toISOString();
                    
                    // 计算成就点数 (根据稀有度)
                    const rarityWeight = { common: 10, uncommon: 25, rare: 50, legendary: 100 };
                    const points = rarityWeight[achievement.rarity] || 10;
                    achState.totalPoints += points;
                    
                    // 发放奖励
                    if (achievement.reward && achievement.reward.spiritStones) {
                        gs.spiritStones = (gs.spiritStones || 0) + achievement.reward.spiritStones;
                    }
                    
                    return {
                        success: true,
                        achievement,
                        points: points,
                        totalPoints: achState.totalPoints,
                        message: '成就解锁：' + achievement.name + '，获得' + points + '成就点和' + (achievement.reward.spiritStones || 0) + '灵石'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V146: mcpBadgeList - 获取徽章列表
            mcpBadgeList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const badgeState = this._initBadgeState();
                    return {
                        success: true,
                        total: badgeState.badges.length,
                        obtainedCount: badgeState.badges.filter(b => b.obtained).length,
                        equippedBadges: badgeState.equippedBadges,
                        maxEquip: 6,
                        badges: badgeState.badges
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V146: mcpBadgeEquip - 装备徽章
            mcpBadgeEquip(badgeId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!badgeId) return { error: '请指定徽章ID' };
                    const badgeState = this._initBadgeState();
                    const badge = badgeState.badges.find(b => b.id === badgeId);
                    if (!badge) return { error: '徽章不存在: ' + badgeId };
                    if (!badge.obtained) return { error: '尚未获得该徽章' };
                    if (badgeState.equippedBadges.includes(badgeId)) return { error: '徽章已在装备中' };
                    if (badgeState.equippedBadges.length >= 6) return { error: '最多只能装备6个徽章' };
                    
                    badge.equipped = true;
                    badgeState.equippedBadges.push(badgeId);
                    
                    return {
                        success: true,
                        badge,
                        equippedBadges: badgeState.equippedBadges,
                        message: '徽章装备成功：' + badge.name
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V146: mcpBadgeUnequip - 卸下徽章
            mcpBadgeUnequip(badgeId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!badgeId) return { error: '请指定徽章ID' };
                    const badgeState = this._initBadgeState();
                    const badge = badgeState.badges.find(b => b.id === badgeId);
                    if (!badge) return { error: '徽章不存在: ' + badgeId };
                    if (!badgeState.equippedBadges.includes(badgeId)) return { error: '该徽章未在装备中' };
                    
                    badge.equipped = false;
                    badgeState.equippedBadges = badgeState.equippedBadges.filter(id => id !== badgeId);
                    
                    return {
                        success: true,
                        badge,
                        equippedBadges: badgeState.equippedBadges,
                        message: '徽章已卸下：' + badge.name
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V147: mcpRankList - 获取排行榜
            mcpRankList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    this._initRankState();
                    const ranks = [];
                    const realms = ['spirit', 'foundation', 'core', 'nascent', '元婴'];
                    for (const realm of realms) {
                        const realmDisciples = gs.disciples ? gs.disciples.filter(d => d.realm === realm) : [];
                        const topDisciples = realmDisciples.sort((a, b) => (b.power || 0) - (a.power || 0)).slice(0, 10).map((d, i) => ({
                            rank: i + 1,
                            playerId: d.playerId || 'player_' + d.id,
                            playerName: d.name || '弟子' + d.id,
                            realm: d.realm,
                            power: d.power || 0,
                            level: d.level || 1
                        }));
                        ranks.push({ realm, top: topDisciples, total: realmDisciples.length });
                    }
                    return { success: true, ranks };
                } catch (e) { return { error: e.message }; }
            }

            // V147: mcpRankView - 查看排行详情
            mcpRankView(rankType) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!rankType) return { error: '请指定排行类型 (realm/power/level)' };
                    this._initRankState();
                    const realms = ['spirit', 'foundation', 'core', 'nascent', '元婴'];
                    if (!realms.includes(rankType)) return { error: '无效的排行榜类型：' + rankType };
                    const realmDisciples = gs.disciples ? gs.disciples.filter(d => d.realm === rankType) : [];
                    const topDisciples = realmDisciples.sort((a, b) => (b.power || 0) - (a.power || 0)).slice(0, 50).map((d, i) => ({
                        rank: i + 1,
                        playerId: d.playerId || 'player_' + d.id,
                        playerName: d.name || '弟子' + d.id,
                        realm: d.realm,
                        power: d.power || 0,
                        level: d.level || 1
                    }));
                    return { success: true, rankType, total: realmDisciples.length, top: topDisciples };
                } catch (e) { return { error: e.message }; }
            }

            // V147: mcpRankReward - 领取排行奖励
            mcpRankReward() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    this._initRankState();
                    if (gs.rank && gs.rank.weeklyRewardClaimed) return { error: '本周排行奖励已领取' };
                    const rewards = [
                        { realm: 'spirit', spirit: 100, message: '炼气境排行榜奖励：100灵石' },
                        { realm: 'foundation', spirit: 200, message: '筑基境排行榜奖励：200灵石' },
                        { realm: 'core', spirit: 500, message: '金丹境排行榜奖励：500灵石' },
                        { realm: 'nascent', spirit: 1000, message: '元婴境排行榜奖励：1000灵石' },
                        { realm: '元婴', spirit: 2000, message: '化神境排行榜奖励：2000灵石' }
                    ];
                    const totalSpirit = rewards.reduce((sum, r) => sum + r.spirit, 0);
                    gs.spirit = (gs.spirit || 0) + totalSpirit;
                    if (gs.rank) gs.rank.weeklyRewardClaimed = true;
                    return { success: true, totalSpirit, rewards, message: '已领取本周排行奖励：' + totalSpirit + '灵石' };
                } catch (e) { return { error: e.message }; }
            }

            // V147: mcpArenaMatch - 开始匹配
            mcpArenaMatch() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    this._initArenaState();
                    if (gs.arena && gs.arena.currentMatch) return { error: '当前已有进行中的匹配，请先完成战斗' };
                    if ((gs.stamina || 0) < 10) return { error: '精力不足，需要10点精力才能匹配' };
                    gs.stamina = Math.max(0, (gs.stamina || 0) - 10);
                    const opponentNames = ['青云子', '玄冥', '天璇', '紫霄', '白鹿', '赤焰', '幽冥', '太虚'];
                    const matchId = 'match_' + Date.now();
                    const opponentPower = (gs.disciples ? gs.disciples.reduce((sum, d) => sum + (d.power || 0), 0) : 100) * (0.5 + Math.random());
                    const match = {
                        id: matchId,
                        opponentName: opponentNames[Math.floor(Math.random() * opponentNames.length)],
                        opponentPower: Math.floor(opponentPower),
                        startTime: Date.now()
                    };
                    if (gs.arena) gs.arena.currentMatch = match;
                    return { success: true, matchId: match.id, opponent: match.opponentName, opponentPower: match.opponentPower, message: '匹配成功！对手：' + match.opponentName + '，战力：' + match.opponentPower };
                } catch (e) { return { error: e.message }; }
            }

            // V147: mcpArenaFight - 执行战斗
            mcpArenaFight(matchId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    this._initArenaState();
                    if (!gs.arena || !gs.arena.currentMatch) return { error: '没有进行中的匹配，请先匹配' };
                    if (gs.arena.currentMatch.id !== matchId) return { error: '匹配ID不匹配' };
                    const playerPower = gs.disciples ? gs.disciples.reduce((sum, d) => sum + (d.power || 0), 0) : 50;
                    const opponentPower = gs.arena.currentMatch.opponentPower;
                    const playerWin = playerPower >= opponentPower * (0.5 + Math.random());
                    const reward = playerWin ? Math.floor(opponentPower * 0.1) : Math.floor(opponentPower * 0.02);
                    gs.spirit = (gs.spirit || 0) + reward;
                    const result = {
                        success: true,
                        result: playerWin ? '胜利' : '失败',
                        playerPower,
                        opponentPower,
                        spiritReward: reward,
                        ratingChange: playerWin ? 20 : -10
                    };
                    if (gs.arena) {
                        if (gs.arena.matchHistory) gs.arena.matchHistory.push({ ...gs.arena.currentMatch, result, timestamp: Date.now() });
                        gs.arena.currentMatch = null;
                        if (gs.arena.rating !== undefined) gs.arena.rating = Math.max(0, gs.arena.rating + result.ratingChange);
                    }
                    return result;
                } catch (e) { return { error: e.message }; }
            }

            // V147: mcpArenaReward - 领取竞技奖励
            mcpArenaReward() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    this._initArenaState();
                    if (gs.arena && gs.arena.weeklyRewardClaimed) return { error: '本周竞技奖励已领取' };
                    const spiritReward = 500;
                    gs.spirit = (gs.spirit || 0) + spiritReward;
                    if (gs.arena) gs.arena.weeklyRewardClaimed = true;
                    return { success: true, spiritReward, message: '已领取本周竞技奖励：500灵石' };
                } catch (e) { return { error: e.message }; }
            }

            // V148: mcpSerendipityList - 获取奇遇区域列表
            mcpSerendipityList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const ser = this._initSerendipityState();
                    return {
                        success: true,
                        areas: ser.areas.map(a => ({
                            id: a.id,
                            name: a.name,
                            description: a.description,
                            difficulty: a.difficulty,
                            hasActive: a.activeSerendipity !== null
                        })),
                        total: ser.areas.length,
                        message: '共' + ser.areas.length + '个奇遇区域'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V148: mcpSerendipityStart - 开始奇遇
            mcpSerendipityStart(areaId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!areaId) return { error: '请指定区域ID' };
                    const ser = this._initSerendipityState();
                    const area = ser.areas.find(a => a.id === areaId);
                    if (!area) return { error: '区域不存在: ' + areaId };
                    if (area.activeSerendipity) return { error: '该区域已有进行中的奇遇' };
                    const staminaCost = { low: 10, medium: 20, high: 30, extreme: 50 };
                    const cost = staminaCost[area.difficulty] || 20;
                    if ((gs.stamina || 0) < cost) return { error: '精力不足，需要' + cost + '点精力' };
                    gs.stamina = Math.max(0, (gs.stamina || 0) - cost);
                    const serendipityId = 'ser_' + areaId + '_' + Date.now();
                    const rewards = {
                        low: { spiritStones: Math.floor(Math.random() * 500) + 200, exp: Math.floor(Math.random() * 1000) + 500 },
                        medium: { spiritStones: Math.floor(Math.random() * 1000) + 500, exp: Math.floor(Math.random() * 2000) + 1000 },
                        high: { spiritStones: Math.floor(Math.random() * 2000) + 1000, exp: Math.floor(Math.random() * 5000) + 2000 },
                        extreme: { spiritStones: Math.floor(Math.random() * 5000) + 2000, exp: Math.floor(Math.random() * 10000) + 5000 }
                    };
                    const serendipity = {
                        id: serendipityId,
                        areaId,
                        startTime: new Date().toISOString(),
                        completed: false,
                        reward: rewards[area.difficulty] || rewards.medium
                    };
                    area.activeSerendipity = serendipity;
                    return { success: true, serendipityId, areaId, areaName: area.name, staminaCost: cost, message: '奇遇开始：' + area.name + '，消耗' + cost + '点精力' };
                } catch (e) { return { error: e.message }; }
            }

            // V148: mcpSerendipityComplete - 完成奇遇
            mcpSerendipityComplete(serendipityId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!serendipityId) return { error: '请指定奇遇ID' };
                    const ser = this._initSerendipityState();
                    let foundSerendipity = null;
                    let foundArea = null;
                    for (const area of ser.areas) {
                        if (area.activeSerendipity && area.activeSerendipity.id === serendipityId) {
                            foundSerendipity = area.activeSerendipity;
                            foundArea = area;
                            break;
                        }
                    }
                    if (!foundSerendipity) return { error: '奇遇不存在或已完成: ' + serendipityId };
                    foundSerendipity.completed = true;
                    const reward = foundSerendipity.reward;
                    if (reward.spiritStones) gs.spiritStones = (gs.spiritStones || 0) + reward.spiritStones;
                    if (reward.exp) gs.cultivationProgress = (gs.cultivationProgress || 0) + reward.exp;
                    ser.completedSerendipities.push(foundSerendipity);
                    foundArea.activeSerendipity = null;
                    return { success: true, serendipityId, reward, message: '奇遇完成！获得' + reward.spiritStones + '灵石和' + reward.exp + '修为' };
                } catch (e) { return { error: e.message }; }
            }

            // V148: mcpEventList - 获取事件列表
            mcpEventList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const evtState = this._initEventState();
                    const now = Date.now();
                    const activeEvents = evtState.events.filter(e => now >= e.startTime && now <= e.endTime);
                    return {
                        success: true,
                        events: activeEvents.map(e => ({
                            id: e.id,
                            name: e.name,
                            description: e.description,
                            startTime: e.startTime,
                            endTime: e.endTime,
                            reward: e.reward,
                            joined: e.joined,
                            completed: e.completed
                        })),
                        total: activeEvents.length,
                        message: '当前有' + activeEvents.length + '个进行中的事件'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V148: mcpEventJoin - 参与事件
            mcpEventJoin(eventId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!eventId) return { error: '请指定事件ID' };
                    const evtState = this._initEventState();
                    const event = evtState.events.find(e => e.id === eventId);
                    if (!event) return { error: '事件不存在: ' + eventId };
                    const now = Date.now();
                    if (now < event.startTime) return { error: '事件尚未开始' };
                    if (now > event.endTime) return { error: '事件已结束' };
                    if (event.joined) return { error: '已参与该事件' };
                    event.joined = true;
                    return { success: true, eventId, eventName: event.name, message: '成功参与事件：' + event.name };
                } catch (e) { return { error: e.message }; }
            }

            // V148: mcpEventReward - 领取事件奖励
            mcpEventReward(eventId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!eventId) return { error: '请指定事件ID' };
                    const evtState = this._initEventState();
                    const event = evtState.events.find(e => e.id === eventId);
                    if (!event) return { error: '事件不存在: ' + eventId };
                    if (!event.joined) return { error: '请先参与事件' };
                    if (event.completed) return { error: '奖励已领取' };
                    event.completed = true;
                    const reward = event.reward;
                    if (reward.spiritStones) gs.spiritStones = (gs.spiritStones || 0) + reward.spiritStones;
                    if (reward.exp) gs.cultivationProgress = (gs.cultivationProgress || 0) + reward.exp;
                    evtState.eventHistory.push({ eventId, completedAt: new Date().toISOString(), reward });
                    return { success: true, eventId, eventName: event.name, reward, message: '领取事件奖励成功：' + event.name };
                } catch (e) { return { error: e.message }; }
            }

            // V141: mcpMailList - 获取邮件列表
            mcpMailList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const mail = this._initMailState();
                    return {
                        success: true,
                        inbox: mail.inbox.map(m => ({
                            id: m.id,
                            from: m.from,
                            title: m.title,
                            read: m.read || false,
                            timestamp: m.timestamp
                        })),
                        total: mail.inbox.length,
                        unreadCount: mail.inbox.filter(m => !m.read).length,
                        message: '收件箱共' + mail.inbox.length + '封邮件，' + mail.inbox.filter(m => !m.read).length + '封未读'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V141: mcpMailSend - 发送邮件
            mcpMailSend(to, title, content) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!to) return { error: '收件人不能为空' };
                    if (!title) return { error: '邮件标题不能为空' };
                    if (!content) return { error: '邮件内容不能为空' };
                    const mail = this._initMailState();
                    const mailId = 'mail_' + Date.now();
                    const sentMail = {
                        id: mailId,
                        to,
                        title,
                        content,
                        from: gs.name || '你',
                        timestamp: Date.now(),
                        read: true
                    };
                    mail.sent.push(sentMail);
                    return {
                        success: true,
                        mailId,
                        to,
                        title,
                        message: '邮件已发送给' + to
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V141: mcpMailRead - 读取邮件
            mcpMailRead(mailId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!mailId) return { error: '邮件ID不能为空' };
                    const mail = this._initMailState();
                    const email = mail.inbox.find(m => m.id === mailId);
                    if (!email) return { error: '邮件不存在: ' + mailId };
                    email.read = true;
                    return {
                        success: true,
                        id: email.id,
                        from: email.from,
                        title: email.title,
                        content: email.content,
                        timestamp: email.timestamp,
                        read: true,
                        message: '已读取邮件: ' + email.title
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V141: mcpMailDelete - 删除邮件
            mcpMailDelete(mailId) {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    if (!mailId) return { error: '邮件ID不能为空' };
                    const mail = this._initMailState();
                    const idx = mail.inbox.findIndex(m => m.id === mailId);
                    if (idx === -1) return { error: '邮件不存在: ' + mailId };
                    const deleted = mail.inbox.splice(idx, 1)[0];
                    return {
                        success: true,
                        mailId,
                        deletedTitle: deleted.title,
                        message: '已删除邮件: ' + deleted.title
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V141: mcpAnnounceList - 获取公告列表
            mcpAnnounceList() {
                try {
                    const gs = window.gameState;
                    if (!gs) return { error: 'Game state not initialized' };
                    const announce = this._initAnnounceState();
                    return {
                        success: true,
                        announcements: announce.announcements.map(a => ({
                            id: a.id,
                            title: a.title,
                            priority: a.priority,
                            timestamp: a.timestamp
                        })),
                        total: announce.announcements.length,
                        message: '共' + announce.announcements.length + '条公告'
                    };
                } catch (e) { return { error: e.message }; }
            }

            // V141: mcpAnnounceView - 查看公告详情