/**
 * CombatAIService - 战斗AI服务
 * Arena battle system and MCP tools for combat
 */

/**
 * V80: Arena Battle System - Query arena leaderboard
 */
function mcpBattleArenaList(season, page) {
    try {
        const gs = window.gameState;
        if (!gs) return { error: 'Game state not initialized' };
        const currentSeason = season || gs.arenaSeason || 'S1';
        const pageNum = page || 1;
        const TIERS = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'immortal'];
        const entries = [];
        for (let i = 0; i < 20; i++) {
            const tierIdx = Math.min(5, Math.floor(i / 3));
            entries.push({
                rank: (pageNum - 1) * 20 + i + 1,
                name: ['天道宗弟子', '万灵谷修士', '散修散人', '仙盟长老', '妖族妖王'][i % 5] + (i + 1),
                tier: TIERS[tierIdx],
                rating: 2000 - i * 15,
                wins: 50 - i,
                losses: 10 + i
            });
        }
        return {
            season: currentSeason,
            page: pageNum,
            entries,
            totalPages: 5
        };
    } catch(e) { return { error: e.message }; }
}

/**
 * V80: Join arena matchmaking
 */
function mcpBattleArenaJoin(rankTier) {
    try {
        const gs = window.gameState;
        if (!gs) return { error: 'Game state not initialized' };
        const TIERS = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'immortal'];
        const tier = rankTier || TIERS[Math.floor(Math.random() * 3)];
        if (!gs.arena) {
            gs.arena = { season: 'S1', rank: tier, rating: 1200, wins: 0, losses: 0, reports: [] };
        }
        gs.arena.rank = tier;
        gs.arena.rating = gs.arena.rating || 1200;
        const opponentTierIdx = Math.min(5, TIERS.indexOf(tier) + Math.floor(Math.random() * 3) - 1);
        const opponent = {
            name: ['挑战者甲', '挑战者乙', '金丹真人', '元婴老怪', '化神强者'][Math.floor(Math.random() * 5)],
            tier: TIERS[Math.max(0, opponentTierIdx)],
            rating: gs.arena.rating + Math.floor(Math.random() * 400) - 200
        };
        if (!gs.battleHistory) gs.battleHistory = [];
        const reportId = 'R_' + Date.now();
        gs.battleHistory.unshift({
            id: reportId,
            type: 'arena',
            result: 'pending',
            opponent: opponent.name,
            damageDealt: 0,
            damageTaken: 0,
            timestamp: Date.now()
        });
        return {
            success: true,
            joined: true,
            tier,
            opponent,
            reportId
        };
    } catch(e) { return { error: e.message }; }
}

/**
 * V80: Get battle report by ID
 */
function mcpBattleArenaReport(reportId) {
    try {
        const gs = window.gameState;
        if (!gs || !gs.battleHistory) return { error: 'No battle history' };
        const report = gs.battleHistory.find(r => r.id === reportId);
        if (!report) return { error: 'Report not found' };
        return {
            id: report.id,
            type: report.type,
            timestamp: new Date(report.timestamp).toISOString(),
            result: report.result,
            opponent: report.opponent,
            damageDealt: report.damageDealt,
            damageTaken: report.damageTaken,
            duration: Math.floor(60 + Math.random() * 300) + 's',
            skills: ['天雷术', '御剑术', '金刚诀'][Math.floor(Math.random() * 3)]
        };
    } catch(e) { return { error: e.message }; }
}

/**
 * V80: Get combat log history
 */
function mcpBattleCombatLog(count, filter) {
    try {
        const gs = window.gameState;
        const limit = count || 20;
        const filterType = filter || 'all';
        let logs = gs && gs.battleHistory ? gs.battleHistory : [];
        if (filterType !== 'all') {
            logs = logs.filter(l => l.type === filterType);
        }
        logs = logs.slice(-limit);
        return {
            logs: logs.map(l => ({
                id: l.id,
                type: l.type,
                result: l.result,
                opponent: l.opponent,
                timestamp: new Date(l.timestamp).toISOString(),
                damageDealt: l.damageDealt
            })),
            total: logs.length
        };
    } catch(e) { return { error: e.message }; }
}

/**
 * V80: Get ranking rise history
 */
function mcpBattleRankRise(period) {
    try {
        const gs = window.gameState;
        const TIERS = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'immortal'];
        const currentTier = gs && gs.arena ? gs.arena.rank || 'bronze' : 'bronze';
        const currentIdx = TIERS.indexOf(currentTier);
        const entries = [];
        const counts = { daily: 7, weekly: 4, seasonal: 2 }[period || 'daily'] || 7;
        let prevRating = gs && gs.arena ? gs.arena.rating - 150 : 1200;
        for (let i = counts - 1; i >= 0; i--) {
            const delta = Math.floor(Math.random() * 60) - 20;
            prevRating += delta;
            entries.push({
                day: i === 0 ? 'today' : `${i} day${i > 1 ? 's' : ''} ago`,
                rating: prevRating,
                delta,
                tier: TIERS[Math.min(5, Math.max(0, Math.floor((prevRating - 1000) / 200)))]
            });
        }
        return {
            period: period || 'daily',
            entries,
            currentTier,
            currentRating: gs && gs.arena ? gs.arena.rating : 1200
        };
    } catch(e) { return { error: e.message }; }
}

/**
 * V80: Claim arena season rewards
 */
function mcpBattleRewardClaim(tier) {
    try {
        const TIERS = ['participation', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'immortal'];
        const REWARDS = {
            participation: { spiritStones: 100, xp: 50 },
            bronze: { spiritStones: 500, xp: 200, badge: '铜牌修士' },
            silver: { spiritStones: 1200, xp: 500, badge: '银牌修士' },
            gold: { spiritStones: 2500, xp: 1000, badge: '金牌修士' },
            platinum: { spiritStones: 5000, xp: 2000, badge: '铂金修士' },
            diamond: { spiritStones: 10000, xp: 5000, badge: '钻石修士' },
            immortal: { spiritStones: 25000, xp: 15000, badge: '不朽称号', title: '不朽者' }
        };
        if (!TIERS.includes(tier)) return { error: 'Invalid tier' };
        const reward = REWARDS[tier];
        const gs = window.gameState;
        if (!gs.claimedRewards) gs.claimedRewards = {};
        if (gs.claimedRewards[tier]) return { error: 'Reward already claimed for this tier', claimed: Object.keys(gs.claimedRewards) };
        gs.claimedRewards[tier] = true;
        gs.spiritStones = (gs.spiritStones || 0) + reward.spiritStones;
        gs.cultivationXP = (gs.cultivationXP || 0) + reward.xp;
        return {
            claimed: true,
            tier,
            rewards: reward,
            spiritStones: gs.spiritStones,
            cultivationXP: gs.cultivationXP
        };
    } catch(e) { return { error: e.message }; }
}

// ===== PVP Ranking System =====

/**
 * Get player rank info
 */
function getPlayerRankInfo() {
    const pvp = gameState.rankingPVP;
    const division = RANK_CONFIG[pvp.realmDivision];
    let rankIndex = 0;
    for (let i = 0; i < division.ranks.length; i++) {
        if (pvp.rating >= division.ranks[i].minRating) {
            rankIndex = i;
        }
    }
    return {
        ...division.ranks[rankIndex],
        division: division,
        rankIndex: rankIndex,
        nextRank: division.ranks[rankIndex + 1] || null,
        rating: pvp.rating,
        wins: pvp.wins,
        losses: pvp.losses,
        streak: pvp.currentStreak
    };
}

/**
 * Update player rank
 */
function updatePlayerRank() {
    const pvp = gameState.rankingPVP;
    const division = RANK_CONFIG[pvp.realmDivision];
    let rankIndex = 0;
    for (let i = 0; i < division.ranks.length; i++) {
        if (pvp.rating >= division.ranks[i].minRating) {
            rankIndex = i;
        }
    }
    pvp.rank = division.ranks[rankIndex].name;
    pvp.rankLevel = rankIndex;
}

/**
 * Get realm division
 */
function getRealmDivision(realm) {
    if (realm <= 1) return 'human';
    if (realm <= 3) return 'cultivation';
    return 'immortal';
}

/**
 * Get daily challenges remaining
 */
function getDailyChallenges() {
    const pvp = gameState.rankingPVP;
    if (pvp.lastChallengeDay < gameState.days) {
        pvp.dailyChallenges = 3;
        pvp.lastChallengeDay = gameState.days;
    }
    return pvp.dailyChallenges;
}

/**
 * Generate AI opponents for ranking PVP
 */
function generateAIOpponents(division, count = 10) {
    const pvp = gameState.rankingPVP;
    const opponents = [];
    const usedNames = new Set();
    const names = AI_OPPONENTS[division];

    const baseRating = pvp.rating;
    const ratingVariance = 200;

    for (let i = 0; i < count; i++) {
        let name;
        do {
            name = names[Math.floor(Math.random() * names.length)];
        } while (usedNames.has(name));
        usedNames.add(name);

        const variance = Math.floor(Math.random() * ratingVariance * 2) - ratingVariance;
        const opponentRating = Math.max(800, Math.min(2600, baseRating + variance));

        let realmLevel = 0;
        if (division === 'human') {
            realmLevel = Math.floor(Math.random() * 2);
        } else if (division === 'cultivation') {
            realmLevel = 2 + Math.floor(Math.random() * 2);
        } else {
            realmLevel = 4 + Math.floor(Math.random() * 2);
        }

        const realmNames = ['炼气期', '筑基期', '元婴期', '化神期', '大乘期', '渡劫期'];
        const stageNames = ['初期', '中期', '后期', '圆满'];

        opponents.push({
            id: 'ai_' + Date.now() + '_' + i,
            name: name,
            avatar: getOpponentAvatar(name),
            realm: realmLevel,
            realmName: realmNames[realmLevel] || '大乘期',
            stage: Math.floor(Math.random() * 4),
            stageName: stageNames[Math.floor(Math.random() * 4)],
            rating: opponentRating,
            wins: Math.floor(Math.random() * 100) + 50,
            losses: Math.floor(Math.random() * 50) + 20,
            rank: getRankNameFromRating(opponentRating, division)
        });
    }

    opponents.sort((a, b) => b.rating - a.rating);
    return opponents;
}

/**
 * Get rank name from rating
 */
function getRankNameFromRating(rating, division) {
    const ranks = RANK_CONFIG[division].ranks;
    let rankName = ranks[0].name;
    for (const rank of ranks) {
        if (rating >= rank.minRating) {
            rankName = rank.name;
        }
    }
    return rankName;
}

/**
 * Get opponent avatar
 */
function getOpponentAvatar(name) {
    const avatars = ['🧙', '🧛', '🧚', '👨‍🦳', '👩‍🦳', '🦸', '🥷', '🧜', '🧛‍♂️', '🧝', '🧝‍♂️', '👸', '🤴', '🦹', '🦹‍♂️'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) - hash) + name.charCodeAt(i);
        hash = hash & hash;
    }
    return avatars[Math.abs(hash) % avatars.length];
}

/**
 * Start ranking PVP match
 */
function startRankingPVP(opponentId, opponentRating) {
    const pvp = gameState.rankingPVP;

    if (pvp.dailyChallenges <= 0) {
        alert('今日挑战次数已用完，请明天再来！');
        return;
    }

    pvp.dailyChallenges--;
    saveGame();

    const playerPower = calculatePlayerPVPower();
    const opponentPower = calculateOpponentPower(opponentRating);
    const playerWins = simulatePVPRound(playerPower, opponentPower);
    const ratingChange = calculateRatingChange(pvp.rating, opponentRating, playerWins);

    pvp.rating = Math.max(800, Math.min(2600, pvp.rating + ratingChange));
    updatePlayerRank();

    if (playerWins) {
        pvp.wins++;
        pvp.currentStreak = Math.max(0, pvp.currentStreak) + 1;
        if (pvp.currentStreak > pvp.bestStreak) {
            pvp.bestStreak = pvp.currentStreak;
        }
    } else {
        pvp.losses++;
        pvp.currentStreak = Math.min(0, pvp.currentStreak) - 1;
    }

    const opponents = generateAIOpponents(pvp.realmDivision, 8);
    const opponent = opponents.find(o => o.id === opponentId) || opponents[0];

    pvp.battleHistory.unshift({
        day: gameState.days,
        opponentName: opponent.name,
        opponentRank: opponent.rank,
        opponentRating: opponentRating,
        result: playerWins ? 'win' : 'lose',
        ratingChange: Math.abs(ratingChange),
        ratingAfter: pvp.rating
    });

    if (pvp.battleHistory.length > 50) {
        pvp.battleHistory = pvp.battleHistory.slice(0, 50);
    }

    saveGame();
    showPVPResult(playerWins, opponent, ratingChange);
}

/**
 * Calculate player PVP power
 */
function calculatePlayerPVPower() {
    const gs = gameState;
    const basePower = gs.realm * 500 + gs.stage * 100 + gs.cultivationProgress;
    const attackBonus = gs.activeEffects.attack * 10;
    const defenseBonus = gs.activeEffects.defense * 10;

    let equipmentBonus = 0;
    for (const equip of gs.equippedTreasures) {
        if (equip && equip.effect) {
            equipmentBonus += (equip.effect.attack || 0) * 5;
            equipmentBonus += (equip.effect.defense || 0) * 5;
        }
    }

    let petBonus = 0;
    if (gs.summonedPet) {
        petBonus = 100;
    }

    return basePower + attackBonus + defenseBonus + equipmentBonus + petBonus;
}

/**
 * Calculate opponent power from rating
 */
function calculateOpponentPower(rating) {
    return rating * 0.8 + Math.random() * 200;
}

/**
 * Simulate PVP round
 */
function simulatePVPRound(playerPower, opponentPower) {
    const powerRatio = playerPower / opponentPower;
    const winChance = Math.min(0.9, Math.max(0.1, 0.5 + (powerRatio - 1) * 0.2));
    return Math.random() < winChance;
}

/**
 * Calculate rating change
 */
function calculateRatingChange(playerRating, opponentRating, playerWins) {
    const K = 32;
    const expected = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    const actual = playerWins ? 1 : 0;
    const change = Math.round(K * (actual - expected));

    if (playerWins && change < 10) return 10;
    if (!playerWins && change > -5) return -5;

    return change;
}

export {
    mcpBattleArenaList,
    mcpBattleArenaJoin,
    mcpBattleArenaReport,
    mcpBattleCombatLog,
    mcpBattleRankRise,
    mcpBattleRewardClaim,
    getPlayerRankInfo,
    updatePlayerRank,
    getRealmDivision,
    getDailyChallenges,
    generateAIOpponents,
    getRankNameFromRating,
    getOpponentAvatar,
    startRankingPVP,
    calculatePlayerPVPower,
    calculateOpponentPower,
    simulatePVPRound,
    calculateRatingChange
};