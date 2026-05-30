/**
 * HeavenRankService.js - 天机榜系统
 * Direction W: 天机榜系统 (chatdev/thunderbolt迭代6/9)
 * 
 * 核心机制：
 * 1. HEAVEN_RANK (天机榜排名) - 4个榜单：战力榜/财富榜/功德榜/境界榜
 * 2. RANK_REWARD (排名奖励) - 每周结算，不同排名有不同奖励，连续上榜加成
 * 3. RANK_CHANGE (榜位变化) - 变化通知系统，激烈波动检测
 * 
 * 6个MCP工具：
 * - rank.heaven.list - 查看天机榜
 * - rank.self.query - 查询自己排名
 * - rank.history.view - 查看历史排名
 * - rank.reward.claim - 领取排名奖励
 * - rank.change.track - 追踪排名变化
 * - rank.battle.challenge - 挑战榜上玩家
 */

// ===== 配置常量 =====

const HEAVEN_RANK_CONFIG = {
    // 榜单类型
    RANK_TYPES: {
        POWER: 'power',     // 战力榜
        WEALTH: 'wealth',  // 财富榜
        KARMA: 'karma',    // 功德榜
        REALM: 'realm'     // 境界榜
    },
    
    // 榜单容量
    MAX_RANK_SIZE: 100,
    
    // 历史记录数量
    MAX_HISTORY_RECORDS: 50,
    
    // 排名变化通知阈值
    RANK_CHANGE_THRESHOLD: 5, // 排名变化超过5位时通知
    
    // 挑战冷却时间 (ms)
    CHALLENGE_COOLDOWN: 60 * 60 * 1000, // 1小时
    
    // 奖励结算周期 (ms) - 每周
    REWARD_CYCLE: 7 * 24 * 60 * 60 * 1000,
    
    // 连续上榜加成阈值
    CONSECUTIVE_BONUS_THRESHOLD: 4 // 连续上榜4周以上获得加成
};

const RANK_REWARD_TIERS = [
    { minRank: 1, maxRank: 1, baseReward: 10000, title: '天机榜首' },
    { minRank: 2, maxRank: 2, baseReward: 5000, title: '天机榜榜眼' },
    { minRank: 3, maxRank: 3, baseReward: 3000, title: '天机榜探花' },
    { minRank: 4, maxRank: 10, baseReward: 1000, title: '天机榜高手' },
    { minRank: 11, maxRank: 50, baseReward: 500, title: '天机榜修士' },
    { minRank: 51, maxRank: 100, baseReward: 100, title: '天机榜新人' }
];

const CHALLENGE_RESULT = {
    WIN: 'win',
    LOSE: 'lose',
    DRAW: 'draw'
};

// ===== 天机榜排名记录 =====

/**
 * HeavenRankEntry - 天机榜排名记录
 */
class HeavenRankEntry {
    constructor(playerId, playerName, rankType, value) {
        this.id = `rank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.playerId = playerId;
        this.playerName = playerName;
        this.rankType = rankType;
        this.value = value; // 战力值/财富值/功德值/境界值
        this.rank = 0;
        this.previousRank = 0;
        this.changeAmount = 0; // 正数表示上升，负数表示下降
        this.consecutiveWeeks = 1; // 连续上榜周数
        this.highestRank = 0;
        this.lastUpdated = Date.now();
    }
    
    /**
     * 更新排名
     */
    updateRank(newRank, newValue) {
        this.previousRank = this.rank || newRank;
        this.rank = newRank;
        this.value = newValue;
        this.changeAmount = this.previousRank - newRank; // 上升为正
        this.lastUpdated = Date.now();
        
        // 更新最高排名
        if (newRank > 0 && (this.highestRank === 0 || newRank < this.highestRank)) {
            this.highestRank = newRank;
        }
    }
    
    /**
     * 增加连续上榜周数
     */
    incrementConsecutiveWeeks() {
        this.consecutiveWeeks++;
    }
    
    /**
     * 重置连续上榜周数
     */
    resetConsecutiveWeeks() {
        this.consecutiveWeeks = 1;
    }
    
    /**
     * 获取变化描述
     */
    getChangeDescription() {
        if (this.changeAmount > 0) {
            return `↑${this.changeAmount}`;
        } else if (this.changeAmount < 0) {
            return `↓${Math.abs(this.changeAmount)}`;
        }
        return '—';
    }
}

// ===== 历史排名记录 =====

/**
 * HeavenRankHistory - 历史排名记录
 */
class HeavenRankHistory {
    constructor(playerId, rankType) {
        this.id = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.playerId = playerId;
        this.rankType = rankType;
        this.records = []; // { week, rank, value, timestamp }
    }
    
    /**
     * 添加历史记录
     */
    addRecord(rank, value) {
        const week = this.getWeekNumber();
        this.records.push({
            week,
            rank,
            value,
            timestamp: Date.now()
        });
        
        // 保持记录数量限制
        if (this.records.length > HEAVEN_RANK_CONFIG.MAX_HISTORY_RECORDS) {
            this.records.shift();
        }
    }
    
    /**
     * 获取周数
     */
    getWeekNumber() {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const weekNumber = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
        return weekNumber;
    }
    
    /**
     * 获取排名趋势
     */
    getTrend() {
        if (this.records.length < 2) return 'stable';
        
        const recent = this.records.slice(-5);
        const firstRank = recent[0].rank;
        const lastRank = recent[recent.length - 1].rank;
        
        if (lastRank < firstRank) return 'rising';
        if (lastRank > firstRank) return 'falling';
        return 'stable';
    }
}

// ===== 排名奖励 =====

/**
 * HeavenRankReward - 排名奖励记录
 */
class HeavenRankReward {
    constructor(week, rankType, tier) {
        this.id = `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.week = week;
        this.rankType = rankType;
        this.tier = tier;
        this.claimed = false;
        this.claimedAt = null;
        this.createdAt = Date.now();
    }
    
    /**
     * 领取奖励
     */
    claim() {
        if (this.claimed) {
            return { success: false, error: 'Reward already claimed' };
        }
        this.claimed = true;
        this.claimedAt = Date.now();
        return { success: true };
    }
    
    /**
     * 计算实际奖励（含连续上榜加成）
     */
    calculateActualReward(consecutiveWeeks) {
        let multiplier = 1.0;
        
        if (consecutiveWeeks >= HEAVEN_RANK_CONFIG.CONSECUTIVE_BONUS_THRESHOLD) {
            multiplier = 1.0 + (consecutiveWeeks - HEAVEN_RANK_CONFIG.CONSECUTIVE_BONUS_THRESHOLD + 1) * 0.1;
            multiplier = Math.min(multiplier, 2.0); // 最多2倍
        }
        
        return Math.floor(this.tier.baseReward * multiplier);
    }
}

// ===== 天机榜服务 =====

/**
 * HeavenRankService - 天机榜服务
 */
class HeavenRankService {
    constructor() {
        this.gameState = null;
        this.initialized = false;
        
        // 四个榜单
        this.powerRank = [];
        this.wealthRank = [];
        this.karmaRank = [];
        this.realmRank = [];
        
        // 历史记录
        this.history = {};
        
        // 待领取奖励
        this.pendingRewards = [];
        
        // 挑战记录
        this.challengeRecords = {};
        
        // 最后结算时间
        this.lastSettlementTime = Date.now();
    }
    
    /**
     * 初始化服务
     */
    init(gameState) {
        this.gameState = gameState;
        
        // 确保天机榜数据结构存在
        if (!gameState.heavenRank) {
            gameState.heavenRank = {
                powerRank: [],
                wealthRank: [],
                karmaRank: [],
                realmRank: [],
                history: {},
                pendingRewards: [],
                challengeRecords: {},
                lastSettlementTime: Date.now(),
                lastRankUpdateTime: Date.now()
            };
        }
        
        // 恢复数据
        this.powerRank = gameState.heavenRank.powerRank.map(e => Object.assign(new HeavenRankEntry(e.playerId, e.playerName, HEAVEN_RANK_CONFIG.RANK_TYPES.POWER, e.value), e));
        this.wealthRank = gameState.heavenRank.wealthRank.map(e => Object.assign(new HeavenRankEntry(e.playerId, e.playerName, HEAVEN_RANK_CONFIG.RANK_TYPES.WEALTH, e.value), e));
        this.karmaRank = gameState.heavenRank.karmaRank.map(e => Object.assign(new HeavenRankEntry(e.playerId, e.playerName, HEAVEN_RANK_CONFIG.RANK_TYPES.KARMA, e.value), e));
        this.realmRank = gameState.heavenRank.realmRank.map(e => Object.assign(new HeavenRankEntry(e.playerId, e.playerName, HEAVEN_RANK_CONFIG.RANK_TYPES.REALM, e.value), e));
        
        // 恢复历史记录
        this.history = {};
        for (const [key, h] of Object.entries(gameState.heavenRank.history || {})) {
            this.history[key] = Object.assign(new HeavenRankHistory(h.playerId, h.rankType), h);
        }
        
        this.pendingRewards = (gameState.heavenRank.pendingRewards || []).map(r => Object.assign(new HeavenRankReward(r.week, r.rankType, RANK_REWARD_TIERS.find(t => t.minRank <= r.rank && r.rank <= t.maxRank) || RANK_REWARD_TIERS[5]), r));
        this.challengeRecords = gameState.heavenRank.challengeRecords || {};
        this.lastSettlementTime = gameState.heavenRank.lastSettlementTime || Date.now();
        
        this.initialized = true;
        
        return { success: true };
    }
    
    /**
     * 保存状态
     */
    saveState() {
        if (!this.gameState || !this.gameState.heavenRank) return;
        
        this.gameState.heavenRank.powerRank = this.powerRank;
        this.gameState.heavenRank.wealthRank = this.wealthRank;
        this.gameState.heavenRank.karmaRank = this.realmRank;
        this.gameState.heavenRank.realmRank = this.realmRank;
        this.gameState.heavenRank.history = this.history;
        this.gameState.heavenRank.pendingRewards = this.pendingRewards;
        this.gameState.heavenRank.challengeRecords = this.challengeRecords;
        this.gameState.heavenRank.lastSettlementTime = this.lastSettlementTime;
        this.gameState.heavenRank.lastRankUpdateTime = Date.now();
    }
    
    /**
     * 获取榜单
     */
    getRank(rankType) {
        switch (rankType) {
            case HEAVEN_RANK_CONFIG.RANK_TYPES.POWER:
                return this.powerRank;
            case HEAVEN_RANK_CONFIG.RANK_TYPES.WEALTH:
                return this.wealthRank;
            case HEAVEN_RANK_CONFIG.RANK_TYPES.KARMA:
                return this.karmaRank;
            case HEAVEN_RANK_CONFIG.RANK_TYPES.REALM:
                return this.realmRank;
            default:
                return [];
        }
    }
    
    /**
     * 获取玩家排名
     */
    getPlayerRank(playerId, rankType) {
        const rank = this.getRank(rankType);
        return rank.findIndex(e => e.playerId === playerId) + 1;
    }
    
    /**
     * 更新玩家排名
     */
    updatePlayerRank(playerId, playerName, rankType, value) {
        const rank = this.getRank(rankType);
        const existingEntry = rank.find(e => e.playerId === playerId);
        
        if (existingEntry) {
            const newRank = this.calculateNewRank(rank, playerId, value);
            existingEntry.updateRank(newRank, value);
        } else {
            const newEntry = new HeavenRankEntry(playerId, playerName, rankType, value);
            this.addToRank(rank, newEntry);
        }
        
        this.saveState();
    }
    
    /**
     * 计算新排名
     */
    calculateNewRank(rank, playerId, newValue) {
        // 计算新排名（按值排序，更大的值排名更靠前）
        let newRank = 1;
        for (const entry of rank) {
            if (entry.playerId === playerId) continue;
            // 如果其他人的值 >= 新值，则新排名要往后移
            if (entry.value >= newValue) {
                newRank++;
            }
        }
        return newRank;
    }
    
    /**
     * 添加到榜单
     */
    addToRank(rank, entry) {
        // 按值降序排序
        const insertIndex = rank.findIndex(e => e.value < entry.value);
        if (insertIndex >= 0) {
            rank.splice(insertIndex, 0, entry);
        } else {
            rank.push(entry);
        }
        
        // 更新所有排名
        rank.forEach((e, i) => {
            e.rank = i + 1;
        });
        
        // 限制榜单大小
        while (rank.length > HEAVEN_RANK_CONFIG.MAX_RANK_SIZE) {
            rank.pop();
        }
    }
    
    /**
     * 获取玩家历史
     */
    getPlayerHistory(playerId, rankType) {
        const key = `${playerId}_${rankType}`;
        return this.history[key] || null;
    }
    
    /**
     * 记录玩家历史
     */
    recordPlayerHistory(playerId, rankType, rank, value) {
        const key = `${playerId}_${rankType}`;
        if (!this.history[key]) {
            this.history[key] = new HeavenRankHistory(playerId, rankType);
        }
        this.history[key].addRecord(rank, value);
        this.saveState();
    }
    
    /**
     * 获取排名奖励
     */
    getRewardForRank(rank) {
        return RANK_REWARD_TIERS.find(t => rank >= t.minRank && rank <= t.maxRank) || RANK_REWARD_TIERS[RANK_REWARD_TIERS.length - 1];
    }
    
    /**
     * 生成待领取奖励
     */
    generatePendingRewards() {
        const currentWeek = this.getWeekNumber();
        
        for (const rankType of Object.values(HEAVEN_RANK_CONFIG.RANK_TYPES)) {
            const rank = this.getRank(rankType);
            
            for (let i = 0; i < rank.length; i++) {
                const entry = rank[i];
                const tier = this.getRewardForRank(entry.rank);
                
                // 检查是否已有本周奖励
                const existingReward = this.pendingRewards.find(
                    r => r.week === currentWeek && r.rankType === rankType && r.tier.minRank === tier.minRank
                );
                
                if (!existingReward) {
                    const reward = new HeavenRankReward(currentWeek, rankType, tier);
                    this.pendingRewards.push(reward);
                }
            }
        }
        
        this.saveState();
    }
    
    /**
     * 获取周数
     */
    getWeekNumber() {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    }
    
    /**
     * 检查挑战冷却
     */
    isChallengeOnCooldown(playerId, targetPlayerId) {
        const key = `${playerId}_${targetPlayerId}`;
        const lastChallenge = this.challengeRecords[key];
        
        if (!lastChallenge) return false;
        
        const cooldownRemaining = HEAVEN_RANK_CONFIG.CHALLENGE_COOLDOWN - (Date.now() - lastChallenge);
        return cooldownRemaining > 0;
    }
    
    /**
     * 获取挑战冷却剩余时间
     */
    getChallengeCooldown(playerId, targetPlayerId) {
        const key = `${playerId}_${targetPlayerId}`;
        const lastChallenge = this.challengeRecords[key];
        
        if (!lastChallenge) return 0;
        
        const cooldownRemaining = HEAVEN_RANK_CONFIG.CHALLENGE_COOLDOWN - (Date.now() - lastChallenge);
        return Math.max(0, cooldownRemaining);
    }
    
    /**
     * 记录挑战
     */
    recordChallenge(playerId, targetPlayerId) {
        const key = `${playerId}_${targetPlayerId}`;
        this.challengeRecords[key] = Date.now();
        this.saveState();
    }
    
    /**
     * 检测排名剧烈变化
     */
    detectRankVolatility(playerId, rankType) {
        const history = this.getPlayerHistory(playerId, rankType);
        if (!history || history.records.length < 3) {
            return { volatile: false, changes: [] };
        }
        
        const recent = history.records.slice(-5);
        const changes = [];
        
        for (let i = 1; i < recent.length; i++) {
            const change = recent[i - 1].rank - recent[i].rank;
            if (Math.abs(change) >= HEAVEN_RANK_CONFIG.RANK_CHANGE_THRESHOLD) {
                changes.push({
                    from: recent[i - 1].rank,
                    to: recent[i].rank,
                    change,
                    week: recent[i].week
                });
            }
        }
        
        return {
            volatile: changes.length >= 2,
            changes
        };
    }
}

// ===== MCP工具实现 =====

/**
 * rank.heaven.list - 查看天机榜
 */
function mcpRankHeavenList(args) {
    const { rankType = 'power', page = 1, pageSize = 20 } = args;
    
    const service = heavenRankService;
    if (!service.initialized) {
        return { success: false, error: 'Service not initialized' };
    }
    
    const rank = service.getRank(rankType);
    
    // 分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRank = rank.slice(startIndex, endIndex);
    
    return {
        success: true,
        rankType,
        total: rank.length,
        page,
        pageSize,
        entries: paginatedRank.map(e => ({
            rank: e.rank,
            playerId: e.playerId,
            playerName: e.playerName,
            value: e.value,
            change: e.getChangeDescription(),
            consecutiveWeeks: e.consecutiveWeeks
        }))
    };
}

/**
 * rank.self.query - 查询自己排名
 */
function mcpRankSelfQuery(args) {
    const { playerId, rankType = 'power' } = args;
    
    const service = heavenRankService;
    if (!service.initialized) {
        return { success: false, error: 'Service not initialized' };
    }
    
    if (!playerId) {
        return { success: false, error: 'playerId is required' };
    }
    
    const rank = service.getRank(rankType);
    const entry = rank.find(e => e.playerId === playerId);
    
    if (!entry) {
        return {
            success: true,
            ranked: false,
            message: '未上榜'
        };
    }
    
    // 获取历史
    const history = service.getPlayerHistory(playerId, rankType);
    
    // 检测波动
    const volatility = service.detectRankVolatility(playerId, rankType);
    
    return {
        success: true,
        ranked: true,
        rank: entry.rank,
        playerId: entry.playerId,
        playerName: entry.playerName,
        value: entry.value,
        change: entry.getChangeDescription(),
        previousRank: entry.previousRank,
        highestRank: entry.highestRank,
        consecutiveWeeks: entry.consecutiveWeeks,
        history: history ? history.records.slice(-10) : [],
        trend: history ? history.getTrend() : 'stable',
        volatility: volatility
    };
}

/**
 * rank.history.view - 查看历史排名
 */
function mcpRankHistoryView(args) {
    const { playerId, rankType = 'power', weeks = 10 } = args;
    
    const service = heavenRankService;
    if (!service.initialized) {
        return { success: false, error: 'Service not initialized' };
    }
    
    if (!playerId) {
        return { success: false, error: 'playerId is required' };
    }
    
    const history = service.getPlayerHistory(playerId, rankType);
    
    if (!history || history.records.length === 0) {
        return {
            success: true,
            playerId,
            rankType,
            records: [],
            message: '暂无历史记录'
        };
    }
    
    const recentRecords = history.records.slice(-weeks);
    
    return {
        success: true,
        playerId,
        rankType,
        records: recentRecords,
        trend: history.getTrend(),
        totalWeeks: history.records.length
    };
}

/**
 * rank.reward.claim - 领取排名奖励
 */
function mcpRankRewardClaim(args) {
    const { playerId } = args;
    
    const service = heavenRankService;
    if (!service.initialized) {
        return { success: false, error: 'Service not initialized' };
    }
    
    if (!playerId) {
        return { success: false, error: 'playerId is required' };
    }
    
    // 获取玩家所有待领取奖励
    const playerRewards = [];
    
    for (const rankType of Object.values(HEAVEN_RANK_CONFIG.RANK_TYPES)) {
        const rank = service.getRank(rankType);
        const entry = rank.find(e => e.playerId === playerId);
        
        if (entry && entry.rank > 0) {
            const tier = service.getRewardForRank(entry.rank);
            const currentWeek = service.getWeekNumber();
            
            // 查找对应的待领取奖励
            const reward = service.pendingRewards.find(
                r => r.week === currentWeek && r.rankType === rankType && !r.claimed
            );
            
            if (reward) {
                const actualReward = reward.calculateActualReward(entry.consecutiveWeeks);
                playerRewards.push({
                    rankType,
                    rank: entry.rank,
                    tier: tier.title,
                    baseReward: reward.tier.baseReward,
                    consecutiveWeeks: entry.consecutiveWeeks,
                    actualReward,
                    reward
                });
            }
        }
    }
    
    // 领取所有奖励
    const claimed = [];
    for (const pr of playerRewards) {
        const result = pr.reward.claim();
        if (result.success) {
            claimed.push({
                rankType: pr.rankType,
                rank: pr.rank,
                tier: pr.tier,
                actualReward: pr.actualReward
            });
            
            // 增加连续上榜周数
            const rank = service.getRank(pr.rankType);
            const entry = rank.find(e => e.playerId === playerId);
            if (entry) {
                entry.incrementConsecutiveWeeks();
            }
        }
    }
    
    service.saveState();
    
    return {
        success: true,
        claimed,
        totalClaimed: claimed.length,
        message: claimed.length > 0 ? `已领取${claimed.length}个奖励` : '暂无可领取奖励'
    };
}

/**
 * rank.change.track - 追踪排名变化
 */
function mcpRankChangeTrack(args) {
    const { playerId, rankType = 'power' } = args;
    
    const service = heavenRankService;
    if (!service.initialized) {
        return { success: false, error: 'Service not initialized' };
    }
    
    if (!playerId) {
        return { success: false, error: 'playerId is required' };
    }
    
    const history = service.getPlayerHistory(playerId, rankType);
    
    if (!history || history.records.length < 2) {
        return {
            success: true,
            playerId,
            rankType,
            tracked: false,
            message: '历史记录不足，无法追踪'
        };
    }
    
    const volatility = service.detectRankVolatility(playerId, rankType);
    
    // 获取最近的变化
    const recent = history.records.slice(-5);
    const changes = [];
    
    for (let i = 1; i < recent.length; i++) {
        const change = recent[i - 1].rank - recent[i].rank;
        changes.push({
            week: recent[i].week,
            fromRank: recent[i - 1].rank,
            toRank: recent[i].rank,
            changeAmount: change,
            direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
        });
    }
    
    return {
        success: true,
        tracked: true,
        playerId,
        rankType,
        changes,
        volatility: volatility.volatile,
        volatilityDetails: volatility.changes,
        trend: history.getTrend()
    };
}

/**
 * rank.battle.challenge - 挑战榜上玩家
 */
function mcpRankBattleChallenge(args) {
    const { playerId, targetPlayerId, rankType = 'power' } = args;
    
    const service = heavenRankService;
    if (!service.initialized) {
        return { success: false, error: 'Service not initialized' };
    }
    
    if (!playerId || !targetPlayerId) {
        return { success: false, error: 'playerId and targetPlayerId are required' };
    }
    
    if (playerId === targetPlayerId) {
        return { success: false, error: 'Cannot challenge yourself' };
    }
    
    // 检查冷却
    if (service.isChallengeOnCooldown(playerId, targetPlayerId)) {
        const remaining = service.getChallengeCooldown(playerId, targetPlayerId);
        return {
            success: false,
            error: 'Challenge on cooldown',
            remainingTime: remaining
        };
    }
    
    // 获取双方排名
    const rank = service.getRank(rankType);
    const challengerEntry = rank.find(e => e.playerId === playerId);
    const targetEntry = rank.find(e => e.playerId === targetPlayerId);
    
    if (!targetEntry) {
        return { success: false, error: 'Target not on rank' };
    }
    
    // 模拟战斗结果（简化逻辑：战力高者赢）
    const challengerValue = challengerEntry ? challengerEntry.value : 0;
    const targetValue = targetEntry.value;
    
    // 添加随机因素
    const challengerScore = challengerValue + Math.random() * 1000;
    const targetScore = targetValue + Math.random() * 1000;
    
    let result;
    let challengerNewRank = targetEntry.rank;
    let targetNewRank = challengerEntry ? challengerEntry.rank : rank.length + 1;
    
if (challengerScore > targetScore) {
            result = CHALLENGE_RESULT.WIN;
            
            // 挑战者获胜，交换排名
            if (challengerEntry) {
                targetEntry.updateRank(targetEntry.rank, targetEntry.value);
                // 挑战者上升到目标排名
                const insertIndex = rank.findIndex(e => e.value < challengerEntry.value);
                // 重新排序
                _recalculateRanks(rank);
            }
        } else if (challengerScore < targetScore) {
        result = CHALLENGE_RESULT.LOSE;
    } else {
        result = CHALLENGE_RESULT.DRAW;
    }
    
    // 记录挑战
    service.recordChallenge(playerId, targetPlayerId);
    service.saveState();
    
    return {
        success: true,
        result,
        challenger: {
            playerId,
            rank: challengerEntry ? challengerEntry.rank : null,
            value: challengerEntry ? challengerEntry.value : 0
        },
        target: {
            playerId: targetPlayerId,
            rank: targetEntry.rank,
            value: targetEntry.value
        },
        nextChallengeAvailable: HEAVEN_RANK_CONFIG.CHALLENGE_COOLDOWN
    };
}

/**
 * 重新计算排名
 */
function _recalculateRanks(rank) {
    rank.sort((a, b) => b.value - a.value);
    rank.forEach((e, i) => {
        e.rank = i + 1;
    });
}

// ===== 单例导出 =====

const heavenRankService = new HeavenRankService();

// MCP工具列表
const HEAVEN_RANK_TOOLS = [
    { name: 'rank.heaven.list', handler: mcpRankHeavenList, description: '查看天机榜' },
    { name: 'rank.self.query', handler: mcpRankSelfQuery, description: '查询自己排名' },
    { name: 'rank.history.view', handler: mcpRankHistoryView, description: '查看历史排名' },
    { name: 'rank.reward.claim', handler: mcpRankRewardClaim, description: '领取排名奖励' },
    { name: 'rank.change.track', handler: mcpRankChangeTrack, description: '追踪排名变化' },
    { name: 'rank.battle.challenge', handler: mcpRankBattleChallenge, description: '挑战榜上玩家' }
];

export {
    HeavenRankService,
    HeavenRankEntry,
    HeavenRankHistory,
    HeavenRankReward,
    heavenRankService,
    HEAVEN_RANK_CONFIG,
    RANK_REWARD_TIERS,
    CHALLENGE_RESULT,
    HEAVEN_RANK_TOOLS,
    mcpRankHeavenList,
    mcpRankSelfQuery,
    mcpRankHistoryView,
    mcpRankRewardClaim,
    mcpRankChangeTrack,
    mcpRankBattleChallenge
};