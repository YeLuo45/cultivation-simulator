/**
 * BeastArenaService.js - 仙宠竞技场系统
 * V249: 仙宠竞技场+PVP系统
 * 
 * 功能：
 * - 竞技场段位: 青铜/白银/黄金/钻石/至尊
 * - 匹配对手机制
 * - 战斗回合制
 * - 赛季奖励
 */

// ===== 常量定义 =====

export const ARENA_TIERS = {
    青铜: { minRank: 0, maxRank: 999, rewards: 100 },
    白银: { minRank: 1000, maxRank: 2999, rewards: 300 },
    黄金: { minRank: 3000, maxRank: 5999, rewards: 600 },
    钻石: { minRank: 6000, maxRank: 8999, rewards: 1000 },
    至尊: { minRank: 9000, maxRank: 9999, rewards: 2000 }
};

export const ARENA_CONFIG = {
    entryCost: 50,                    // 入场费
    matchMakingTime: 3000,            // 匹配时间(ms)
    maxRoundsPerBattle: 20,          // 每场最大回合数
    seasonDuration: 7,                // 赛季持续天数
    decayPerDay: 50,                 // 每日衰减rank
    consecutiveWinBonus: 20,         // 连胜奖励rank
    tierProtectionCost: 100,        // 段位保护cost
};

export const ARENA_REWARDS = {
    victory: { rank: 50, spiritStones: 200 },
    defeat: { rank: 10, spiritStones: 50 },
    draw: { rank: 20, spiritStones: 100 },
    consecutiveWin: { bonus: 20 }
};

export const BEAST_ARENA_STATES = {
    IDLE: 'idle',
    MATCHING: 'matching',
    IN_BATTLE: 'in_battle',
    VIEWING_REWARDS: 'viewing_rewards'
};

// ===== 辅助函数 =====

/**
 * 根据rank获取段位
 */
export function getTierByRank(rank) {
    for (const [tierName, config] of Object.entries(ARENA_TIERS)) {
        if (rank >= config.minRank && rank <= config.maxRank) {
            return tierName;
        }
    }
    return '青铜';
}

/**
 * 获取段位信息
 */
export function getTierInfo(rank) {
    const tierName = getTierByRank(rank);
    return {
        name: tierName,
        ...ARENA_TIERS[tierName]
    };
}

/**
 * 生成AI对手仙宠属性
 */
function generateAIPetStats(pet, difficulty = 1) {
    const baseAttack = pet.stats?.attack || 10;
    const baseDefense = pet.stats?.defense || 5;
    const baseSpirit = pet.stats?.spirit || 8;
    const level = pet.level || 1;
    
    return {
        attack: Math.floor(baseAttack * (1 + level * 0.1) * difficulty),
        defense: Math.floor(baseDefense * (1 + level * 0.1) * difficulty),
        spirit: Math.floor(baseSpirit * (1 + level * 0.1) * difficulty),
        maxHp: Math.floor(100 * (1 + level * 0.15) * difficulty),
        critRate: 0.1 + level * 0.02
    };
}

/**
 * 计算伤害
 */
function calculateDamage(attacker, defender, isCrit = false) {
    const baseDamage = attacker.attack;
    const defense = defender.defense;
    let damage = Math.max(1, baseDamage - defense * 0.5);
    
    if (isCrit) {
        damage = Math.floor(damage * 1.5);
    }
    
    // 功法克制
    damage = Math.floor(damage);
    return damage;
}

/**
 * 创建仙宠竞技场服务
 */
export function createBeastArenaService(gameState) {
    const service = {
        gameState,
        
        /**
         * 初始化仙宠竞技场状态
         */
        init() {
            if (!this.gameState.beastArena) {
                this.gameState.beastArena = {
                    state: BEAST_ARENA_STATES.IDLE,
                    rank: 1000,
                    tier: '青铜',
                    consecutiveWins: 0,
                    seasonStartDay: this.gameState.days || 1,
                    battleHistory: [],
                    currentBattle: null,
                    matchMakingStart: null,
                    pendingRewards: null,
                    dailyMatches: 0,
                    totalMatches: 0,
                    bestRank: 1000,
                    aiOpponents: []
                };
            }
            
            // 初始化AI对手列表
            if (!this.gameState.beastArena.aiOpponents || this.gameState.beastArena.aiOpponents.length === 0) {
                this.gameState.beastArena.aiOpponents = this._generateInitialOpponents();
            }
            
            return this.gameState.beastArena;
        },
        
        /**
         * 生成初始AI对手列表
         */
        _generateInitialOpponents() {
            const opponents = [];
            const petTypes = ['灵狐', '玄龟', '火鹤', '玉兔', '银狼', '青蛇', '白虎', '金鹏'];
            const names = ['小仙', '灵儿', '小白', '阿福', '朵朵', '威威', '圆圆', '壮壮'];
            
            for (let i = 0; i < 20; i++) {
                const species = petTypes[Math.floor(Math.random() * petTypes.length)];
                const name = names[Math.floor(Math.random() * names.length)];
                const level = Math.floor(Math.random() * 50) + 1;
                const rank = 800 + Math.floor(Math.random() * 2000);
                
                opponents.push({
                    id: `ai_${i}`,
                    name: `${species}${name}`,
                    species,
                    level,
                    rank,
                    stats: {
                        attack: 10 + level * 2,
                        defense: 5 + level,
                        spirit: 8 + level * 1.5,
                        maxHp: 100 + level * 10,
                        critRate: 0.1 + level * 0.01
                    }
                });
            }
            
            return opponents;
        },
        
        /**
         * 开始匹配对手
         */
        startMatchMaking() {
            const arena = this.gameState.beastArena;
            
            if (arena.state !== BEAST_ARENA_STATES.IDLE) {
                return { success: false, error: '当前状态不允许匹配' };
            }
            
            if (this.gameState.spiritStones < ARENA_CONFIG.entryCost) {
                return { success: false, error: '灵石不足，入场费需要 ' + ARENA_CONFIG.entryCost };
            }
            
            // 扣除入场费
            this.gameState.spiritStones -= ARENA_CONFIG.entryCost;
            
            arena.state = BEAST_ARENA_STATES.MATCHING;
            arena.matchMakingStart = Date.now();
            
            return {
                success: true,
                message: '匹配中...',
                entryCost: ARENA_CONFIG.entryCost
            };
        },
        
        /**
         * 执行匹配逻辑（模拟）
         */
        processMatchMaking() {
            const arena = this.gameState.beastArena;
            
            if (arena.state !== BEAST_ARENA_STATES.MATCHING) {
                return null;
            }
            
            const elapsed = Date.now() - arena.matchMakingStart;
            if (elapsed < ARENA_CONFIG.matchMakingTime) {
                return { status: 'matching', progress: Math.floor((elapsed / ARENA_CONFIG.matchMakingTime) * 100) };
            }
            
            // 匹配成功，选择对手
            const opponent = this._selectOpponent();
            arena.currentBattle = {
                opponent,
                playerPet: null,
                startTime: Date.now(),
                rounds: [],
                currentRound: 0,
                playerHp: 0,
                opponentHp: 0,
                playerStats: null,
                opponentStats: null,
                turn: 'player',
                log: []
            };
            
            arena.state = BEAST_ARENA_STATES.IN_BATTLE;
            
            return {
                status: 'matched',
                opponent: {
                    name: opponent.name,
                    species: opponent.species,
                    level: opponent.level,
                    rank: opponent.rank
                }
            };
        },
        
        /**
         * 选择对手（基于rank匹配）
         */
        _selectOpponent() {
            const arena = this.gameState.beastArena;
            const playerRank = arena.rank;
            
            // 根据玩家rank选择相近的对手
            const suitableOpponents = arena.aiOpponents.filter(opp => {
                const rankDiff = Math.abs(opp.rank - playerRank);
                return rankDiff < 500;
            });
            
            // 如果没有相近的，选择最近的一个
            let opponent;
            if (suitableOpponents.length > 0) {
                opponent = suitableOpponents[Math.floor(Math.random() * suitableOpponents.length)];
            } else {
                // 选择最接近的
                const sorted = [...arena.aiOpponents].sort((a, b) => 
                    Math.abs(a.rank - playerRank) - Math.abs(b.rank - playerRank)
                );
                opponent = sorted[0];
            }
            
            // 返回对手的克隆（带战斗属性）
            return {
                ...opponent,
                battleStats: generateAIPetStats(opponent, 1)
            };
        },
        
        /**
         * 设置参战仙宠
         */
        setBattlePet(petId) {
            const arena = this.gameState.beastArena;
            
            if (arena.state !== BEAST_ARENA_STATES.IN_BATTLE) {
                return { success: false, error: '当前不在战斗中' };
            }
            
            const pet = this.gameState.pets?.find(p => p.id === petId);
            if (!pet) {
                return { success: false, error: '仙宠不存在' };
            }
            
            if (!pet.active) {
                return { success: false, error: '仙宠已放生' };
            }
            
            arena.currentBattle.playerPet = pet;
            arena.currentBattle.playerStats = {
                attack: pet.stats?.attack || 10,
                defense: pet.stats?.defense || 5,
                spirit: pet.stats?.spirit || 8,
                maxHp: 100 + (pet.level || 1) * 10,
                critRate: 0.1 + (pet.level || 1) * 0.02
            };
            
            // 初始化HP
            arena.currentBattle.playerHp = arena.currentBattle.playerStats.maxHp;
            arena.currentBattle.opponentHp = arena.currentBattle.opponent.battleStats.maxHp;
            
            return {
                success: true,
                pet: {
                    id: pet.id,
                    name: pet.name,
                    species: pet.species,
                    level: pet.level
                },
                stats: arena.currentBattle.playerStats
            };
        },
        
        /**
         * 执行玩家攻击
         */
        executePlayerAttack() {
            const arena = this.gameState.beastArena;
            
            if (arena.state !== BEAST_ARENA_STATES.IN_BATTLE) {
                return { success: false, error: '当前不在战斗中' };
            }
            
            if (arena.currentBattle.turn !== 'player') {
                return { success: false, error: '不是你的回合' };
            }
            
            const battle = arena.currentBattle;
            battle.currentRound++;
            
            // 计算伤害
            const isCrit = Math.random() < battle.playerStats.critRate;
            const damage = calculateDamage(battle.playerStats, battle.opponent.battleStats, isCrit);
            
            battle.opponentHp = Math.max(0, battle.opponentHp - damage);
            
            battle.log.push({
                type: 'player_attack',
                round: battle.currentRound,
                damage,
                isCrit,
                message: `你的仙宠攻击，造成 ${damage} 点伤害${isCrit ? '（暴击）' : ''}`
            });
            
            battle.turn = 'opponent';
            
            // 检查是否结束
            if (battle.opponentHp <= 0) {
                return this._endBattle('victory');
            }
            
            // 检查回合上限
            if (battle.currentRound >= ARENA_CONFIG.maxRoundsPerBattle) {
                return this._endBattle('draw');
            }
            
            return {
                success: true,
                round: battle.currentRound,
                damage,
                isCrit,
                playerHp: battle.playerHp,
                opponentHp: battle.opponentHp,
                turn: 'opponent'
            };
        },
        
        /**
         * 执行玩家防御
         */
        executePlayerDefend() {
            const arena = this.gameState.beastArena;
            
            if (arena.state !== BEAST_ARENA_STATES.IN_BATTLE) {
                return { success: false, error: '当前不在战斗中' };
            }
            
            if (arena.currentBattle.turn !== 'player') {
                return { success: false, error: '不是你的回合' };
            }
            
            const battle = arena.currentBattle;
            battle.currentRound++;
            
            // 防御姿态减少受到伤害的50%
            const defenseBonus = 0.5;
            
            battle.log.push({
                type: 'player_defend',
                round: battle.currentRound,
                message: '你的仙宠进入防御姿态'
            });
            
            battle.playerDefenseBonus = defenseBonus;
            battle.turn = 'opponent';
            
            return {
                success: true,
                round: battle.currentRound,
                playerHp: battle.playerHp,
                opponentHp: battle.opponentHp,
                turn: 'opponent',
                defenseBonus
            };
        },
        
        /**
         * 执行对手回合（AI）
         */
        executeOpponentTurn() {
            const arena = this.gameState.beastArena;
            
            if (arena.state !== BEAST_ARENA_STATES.IN_BATTLE) {
                return { success: false, error: '当前不在战斗中' };
            }
            
            if (arena.currentBattle.turn !== 'opponent') {
                return { success: false, error: '不是对手的回合' };
            }
            
            const battle = arena.currentBattle;
            battle.currentRound++;
            
            // AI决定行动（70%攻击，30%防御）
            const action = Math.random() < 0.7 ? 'attack' : 'defend';
            
            if (action === 'attack') {
                const isCrit = Math.random() < battle.opponent.battleStats.critRate;
                let damage = calculateDamage(battle.opponent.battleStats, battle.playerStats, isCrit);
                
                // 如果玩家处于防御状态，减少伤害
                if (battle.playerDefenseBonus) {
                    damage = Math.floor(damage * battle.playerDefenseBonus);
                    battle.playerDefenseBonus = null;
                }
                
                battle.playerHp = Math.max(0, battle.playerHp - damage);
                
                battle.log.push({
                    type: 'opponent_attack',
                    round: battle.currentRound,
                    damage,
                    isCrit,
                    message: `${battle.opponent.name}攻击，造成 ${damage} 点伤害${isCrit ? '（暴击）' : ''}`
                });
            } else {
                battle.log.push({
                    type: 'opponent_defend',
                    round: battle.currentRound,
                    message: `${battle.opponent.name}进入防御姿态`
                });
            }
            
            battle.turn = 'player';
            
            // 检查是否结束
            if (battle.playerHp <= 0) {
                return this._endBattle('defeat');
            }
            
            // 检查回合上限
            if (battle.currentRound >= ARENA_CONFIG.maxRoundsPerBattle) {
                return this._endBattle('draw');
            }
            
            return {
                success: true,
                round: battle.currentRound,
                action,
                playerHp: battle.playerHp,
                opponentHp: battle.opponentHp,
                turn: 'player'
            };
        },
        
        /**
         * 结束战斗
         */
        _endBattle(result) {
            const arena = this.gameState.beastArena;
            const battle = arena.currentBattle;
            
            arena.state = BEAST_ARENA_STATES.VIEWING_REWARDS;
            
            let rankChange = 0;
            let spiritStoneChange = 0;
            let consecutiveWinBonus = 0;
            
            if (result === 'victory') {
                rankChange = ARENA_REWARDS.victory.rank;
                spiritStoneChange = ARENA_REWARDS.victory.spiritStones;
                arena.consecutiveWins++;
                
                if (arena.consecutiveWins >= 2) {
                    consecutiveWinBonus = ARENA_REWARDS.consecutiveWin.bonus * (arena.consecutiveWins - 1);
                    rankChange += consecutiveWinBonus;
                }
            } else if (result === 'defeat') {
                rankChange = -ARENA_REWARDS.defeat.rank;
                spiritStoneChange = ARENA_REWARDS.defeat.spiritStones;
                arena.consecutiveWins = 0;
            } else if (result === 'draw') {
                rankChange = ARENA_REWARDS.draw.rank;
                spiritStoneChange = ARENA_REWARDS.draw.spiritStones;
            }
            
            // 应用rank变化
            const oldRank = arena.rank;
            arena.rank = Math.max(0, Math.min(9999, arena.rank + rankChange));
            const newTier = getTierByRank(arena.rank);
            const tierChanged = arena.tier !== newTier;
            arena.tier = newTier;
            
            // 更新最佳rank
            if (arena.rank < arena.bestRank) {
                arena.bestRank = arena.rank;
            }
            
            // 更新AI对手rank（根据战斗结果）
            const opponentIndex = arena.aiOpponents.findIndex(opp => opp.id === battle.opponent.id);
            if (opponentIndex !== -1) {
                arena.aiOpponents[opponentIndex].rank = Math.max(500, arena.aiOpponents[opponentIndex].rank - rankChange);
            }
            
            // 记录历史
            const battleRecord = {
                result,
                opponent: battle.opponent.name,
                opponentRank: battle.opponent.rank,
                rankChange,
                consecutiveWins: arena.consecutiveWins,
                consecutiveWinBonus,
                spiritStoneChange,
                day: this.gameState.days
            };
            arena.battleHistory.unshift(battleRecord);
            if (arena.battleHistory.length > 50) {
                arena.battleHistory.pop();
            }
            
            arena.dailyMatches++;
            arena.totalMatches++;
            
            // 计算奖励
            const rewards = {
                rank: arena.rank,
                tier: arena.tier,
                rankChange,
                spiritStones: this.gameState.spiritStones + spiritStoneChange,
                spiritStoneChange,
                consecutiveWins: arena.consecutiveWins,
                consecutiveWinBonus,
                tierChanged,
                result
            };
            
            // 更新灵石
            this.gameState.spiritStones += spiritStoneChange;
            
            // 清空当前战斗
            arena.currentBattle = null;
            arena.pendingRewards = rewards;
            
            battle.log.push({
                type: 'battle_end',
                result,
                rankChange,
                message: result === 'victory' ? '🎉 胜利！' : result === 'defeat' ? '😢 失败' : '⚖️ 平局'
            });
            
            return {
                success: true,
                result,
                rewards,
                log: battle.log
            };
        },
        
        /**
         * 确认奖励并返回
         */
        claimRewards() {
            const arena = this.gameState.beastArena;
            
            if (arena.state !== BEAST_ARENA_STATES.VIEWING_REWARDS) {
                return { success: false, error: '当前没有可领取的奖励' };
            }
            
            arena.state = BEAST_ARENA_STATES.IDLE;
            const rewards = arena.pendingRewards;
            arena.pendingRewards = null;
            
            return {
                success: true,
                rewards
            };
        },
        
        /**
         * 获取竞技场信息
         */
        getArenaInfo() {
            const arena = this.gameState.beastArena;
            
            return {
                state: arena.state,
                rank: arena.rank,
                tier: arena.tier,
                tierInfo: ARENA_TIERS[arena.tier],
                consecutiveWins: arena.consecutiveWins,
                dailyMatches: arena.dailyMatches,
                totalMatches: arena.totalMatches,
                bestRank: arena.bestRank,
                battleHistory: arena.battleHistory.slice(0, 10)
            };
        },
        
        /**
         * 获取当前战斗信息
         */
        getBattleInfo() {
            const arena = this.gameState.beastArena;
            
            if (!arena.currentBattle) {
                return null;
            }
            
            return {
                opponent: {
                    name: arena.currentBattle.opponent.name,
                    species: arena.currentBattle.opponent.species,
                    level: arena.currentBattle.opponent.level,
                    rank: arena.currentBattle.opponent.rank
                },
                playerHp: arena.currentBattle.playerHp,
                opponentHp: arena.currentBattle.opponentHp,
                currentRound: arena.currentBattle.currentRound,
                turn: arena.currentBattle.turn,
                log: arena.currentBattle.log.slice(-10)
            };
        },
        
        /**
         * 获取排行榜
         */
        getLeaderboard(limit = 10) {
            const arena = this.gameState.beastArena;
            
            // 获取所有AI对手和自己的排名
            const allPlayers = [
                { name: '你', rank: arena.rank, isPlayer: true },
                ...arena.aiOpponents.map(opp => ({ name: opp.name, rank: opp.rank, isPlayer: false }))
            ];
            
            // 排序
            allPlayers.sort((a, b) => a.rank - b.rank);
            
            return allPlayers.slice(0, limit);
        },
        
        /**
         * 获取赛季信息
         */
        getSeasonInfo() {
            const arena = this.gameState.beastArena;
            const seasonStart = arena.seasonStartDay;
            const currentDay = this.gameState.days || 1;
            const seasonDay = ((currentDay - seasonStart) % ARENA_CONFIG.seasonDuration) + 1;
            const daysRemaining = ARENA_CONFIG.seasonDuration - seasonDay + 1;
            
            return {
                currentDay: seasonDay,
                daysRemaining: Math.max(0, daysRemaining),
                totalDays: ARENA_CONFIG.seasonDuration,
                rewards: ARENA_TIERS[arena.tier].rewards
            };
        },
        
        /**
         * 领取赛季奖励
         */
        claimSeasonRewards() {
            const arena = this.gameState.beastArena;
            const seasonInfo = this.getSeasonInfo();
            
            if (seasonInfo.daysRemaining > 0) {
                return { success: false, error: '赛季尚未结束' };
            }
            
            const tierRewards = ARENA_TIERS[arena.tier].rewards;
            this.gameState.spiritStones += tierRewards;
            
            // 重置赛季
            arena.seasonStartDay = this.gameState.days;
            
            return {
                success: true,
                rewards: tierRewards,
                newSeasonStart: arena.seasonStartDay
            };
        },
        
        /**
         * 使用段位保护
         */
        useTierProtection() {
            const arena = this.gameState.beastArena;
            
            if (this.gameState.spiritStones < ARENA_CONFIG.tierProtectionCost) {
                return { success: false, error: '灵石不足' };
            }
            
            this.gameState.spiritStones -= ARENA_CONFIG.tierProtectionCost;
            
            // 保护：失败时rank不下降
            arena.tierProtection = true;
            
            return {
                success: true,
                message: '段位保护已激活',
                cost: ARENA_CONFIG.tierProtectionCost
            };
        },
        
        /**
         * 每日重置
         */
        dailyReset() {
            const arena = this.gameState.beastArena;
            
            // 重置每日匹配次数
            arena.dailyMatches = 0;
            
            // 应用每日衰减
            if (arena.rank > 0) {
                arena.rank = Math.max(0, arena.rank - ARENA_CONFIG.decayPerDay);
                arena.tier = getTierByRank(arena.rank);
            }
            
            // 清空段位保护
            arena.tierProtection = false;
            
            return {
                success: true,
                newRank: arena.rank,
                newTier: arena.tier
            };
        }
    };
    
    return service;
}

export default createBeastArenaService;