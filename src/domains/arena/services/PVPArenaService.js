/**
 * PVPArenaService.js - PVP竞技场系统
 * V249: 仙宠竞技场+PVP系统
 * 
 * 功能：
 * - 玩家对玩家战斗
 * - 战斗日志记录
 * - 排行榜系统
 * - 荣誉点数
 */

// ===== 常量定义 =====

export const PVP_STATES = {
    IDLE: 'idle',
    MATCHING: 'matching',
    IN_BATTLE: 'in_battle',
    VIEWING_RESULT: 'viewing_result'
};

export const PVP_CONFIG = {
    entryCost: 100,                  // 入场费
    matchMakingTime: 5000,           // 匹配时间(ms)
    maxRoundsPerBattle: 30,         // 每场最大回合数
    rankDelta: 25,                  // 每次战斗的rank变化基数
    honorDelta: 10,                 // 每次战斗的荣誉变化
    decayPerDay: 30,               // 每日衰减
    leaderboardSize: 100,           // 排行榜规模
    battleHistoryLimit: 100         // 战斗历史上限
};

export const PVP_REWARDS = {
    victory: { honor: 50, spiritStones: 200, rankPoints: 25 },
    defeat: { honor: 10, spiritStones: 50, rankPoints: -15 },
    draw: { honor: 25, spiritStones: 100, rankPoints: 0 }
};

export const PVP_TIERS = {
    青铜: { minRank: 0, maxRank: 999, color: '#cd7f32', rewards: 100 },
    白银: { minRank: 1000, maxRank: 2999, color: '#c0c0c0', rewards: 300 },
    黄金: { minRank: 3000, maxRank: 5999, color: '#ffd700', rewards: 600 },
    钻石: { minRank: 6000, maxRank: 8999, color: '#b9f2ff', rewards: 1000 },
    至尊: { minRank: 9000, maxRank: 9999, color: '#ff6b6b', rewards: 2000 }
};

// ===== 辅助函数 =====

/**
 * 根据rank获取段位
 */
function getTierByRank(rank) {
    if (rank >= 9000) return '至尊';
    if (rank >= 6000) return '钻石';
    if (rank >= 3000) return '黄金';
    if (rank >= 1000) return '白银';
    return '青铜';
}

/**
 * 计算PVP伤害
 */
function calculatePVPDamage(attacker, defender, isCrit = false) {
    const baseDamage = attacker.attack;
    const defense = defender.defense;
    let damage = Math.max(1, baseDamage - defense * 0.4);
    
    if (isCrit) {
        damage = Math.floor(damage * 1.5);
    }
    
    return Math.floor(damage);
}

/**
 * 获取玩家的PVP属性
 */
function getPlayerPVPStats(gameState) {
    const realm = gameState.realm || 0;
    const level = gameState.player?.level || 1;
    
    // 基于境界和等级计算属性
    const baseHP = 500 + realm * 200 + level * 10;
    const baseAttack = 50 + realm * 30 + level * 2;
    const baseDefense = 30 + realm * 15 + level * 1;
    const baseSpeed = 40 + realm * 10 + level;
    const baseCritRate = 0.1 + realm * 0.02 + level * 0.002;
    
    return {
        maxHp: baseHP,
        hp: baseHP,
        attack: baseAttack,
        defense: baseDefense,
        speed: baseSpeed,
        critRate: Math.min(0.5, baseCritRate)
    };
}

/**
 * 创建PVP竞技场服务
 */
export function createPVPArenaService(gameState) {
    const service = {
        gameState,
        
        /**
         * 初始化PVP竞技场状态
         */
        init() {
            if (!this.gameState.pvpArena) {
                this.gameState.pvpArena = {
                    state: PVP_STATES.IDLE,
                    rank: 1000,
                    tier: '青铜',
                    honor: 0,
                    consecutiveWins: 0,
                    consecutiveLosses: 0,
                    totalBattles: 0,
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    battleHistory: [],
                    currentBattle: null,
                    matchMakingStart: null,
                    pendingRewards: null,
                    dailyBattles: 0,
                    bestRank: 1000,
                    lastBattleTime: null,
                    aiOpponents: []
                };
            }
            
            // 初始化AI对手列表
            if (!this.gameState.pvpArena.aiOpponents || this.gameState.pvpArena.aiOpponents.length === 0) {
                this.gameState.pvpArena.aiOpponents = this._generateInitialOpponents();
            }
            
            return this.gameState.pvpArena;
        },
        
        /**
         * 生成初始AI对手列表
         */
        _generateInitialOpponents() {
            const opponents = [];
            const titles = ['散修', '宗门弟子', '宗门长老', '真传弟子', '首席弟子', '掌门'];
            const names = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十'];
            
            for (let i = 0; i < 30; i++) {
                const title = titles[Math.floor(Math.random() * titles.length)];
                const name = names[Math.floor(Math.random() * names.length)];
                const realm = Math.floor(Math.random() * 5);
                const level = Math.floor(Math.random() * 50) + 1;
                const rank = 500 + Math.floor(Math.random() * 3000);
                
                opponents.push({
                    id: `pvp_ai_${i}`,
                    name: `${title}${name}`,
                    title,
                    realm,
                    level,
                    rank,
                    stats: {
                        maxHp: 500 + realm * 200 + level * 10,
                        attack: 50 + realm * 30 + level * 2,
                        defense: 30 + realm * 15 + level * 1,
                        speed: 40 + realm * 10 + level,
                        critRate: Math.min(0.5, 0.1 + realm * 0.02 + level * 0.002)
                    }
                });
            }
            
            return opponents;
        },
        
        /**
         * 开始匹配
         */
        startMatchMaking() {
            const arena = this.gameState.pvpArena;
            
            if (arena.state !== PVP_STATES.IDLE) {
                return { success: false, error: '当前状态不允许匹配' };
            }
            
            if (this.gameState.spiritStones < PVP_CONFIG.entryCost) {
                return { success: false, error: '灵石不足，入场费需要 ' + PVP_CONFIG.entryCost };
            }
            
            // 扣除入场费
            this.gameState.spiritStones -= PVP_CONFIG.entryCost;
            
            arena.state = PVP_STATES.MATCHING;
            arena.matchMakingStart = Date.now();
            
            return {
                success: true,
                message: '匹配中...',
                entryCost: PVP_CONFIG.entryCost
            };
        },
        
        /**
         * 处理匹配逻辑
         */
        processMatchMaking() {
            const arena = this.gameState.pvpArena;
            
            if (arena.state !== PVP_STATES.MATCHING) {
                return null;
            }
            
            const elapsed = Date.now() - arena.matchMakingStart;
            if (elapsed < PVP_CONFIG.matchMakingTime) {
                return {
                    status: 'matching',
                    progress: Math.floor((elapsed / PVP_CONFIG.matchMakingTime) * 100)
                };
            }
            
            // 匹配成功，选择对手
            const opponent = this._selectOpponent();
            const playerStats = getPlayerPVPStats(this.gameState);
            
            arena.currentBattle = {
                opponent,
                playerStats: { ...playerStats },
                opponentStats: { ...opponent.stats, hp: opponent.stats.maxHp },
                startTime: Date.now(),
                rounds: [],
                currentRound: 0,
                turn: playerStats.speed >= opponent.stats.speed ? 'player' : 'opponent',
                log: [],
                techniques: ['剑法', '拳法', '掌法', '刀法'],
                playerTechnique: this._selectTechnique(),
                opponentTechnique: opponent.title.includes('长老') ? '剑法' : ['剑法', '拳法', '掌法'][Math.floor(Math.random() * 3)]
            };
            
            arena.state = PVP_STATES.IN_BATTLE;
            
            return {
                status: 'matched',
                opponent: {
                    name: opponent.name,
                    title: opponent.title,
                    realm: opponent.realm,
                    level: opponent.level,
                    rank: opponent.rank
                },
                playerStats: arena.currentBattle.playerStats,
                opponentStats: arena.currentBattle.opponentStats,
                turn: arena.currentBattle.turn
            };
        },
        
        /**
         * 选择功法
         */
        _selectTechnique() {
            const techniques = ['剑法', '拳法', '掌法', '刀法'];
            return techniques[Math.floor(Math.random() * techniques.length)];
        },
        
        /**
         * 选择对手
         */
        _selectOpponent() {
            const arena = this.gameState.pvpArena;
            const playerRank = arena.rank;
            
            // 根据rank匹配对手
            const suitableOpponents = arena.aiOpponents.filter(opp => {
                const rankDiff = Math.abs(opp.rank - playerRank);
                return rankDiff < 800;
            });
            
            let opponent;
            if (suitableOpponents.length > 0) {
                opponent = suitableOpponents[Math.floor(Math.random() * suitableOpponents.length)];
            } else {
                const sorted = [...arena.aiOpponents].sort((a, b) =>
                    Math.abs(a.rank - playerRank) - Math.abs(b.rank - playerRank)
                );
                opponent = sorted[0];
            }
            
            return { ...opponent };
        },
        
        /**
         * 执行玩家攻击
         */
        executePlayerAttack() {
            const arena = this.gameState.pvpArena;
            
            if (arena.state !== PVP_STATES.IN_BATTLE) {
                return { success: false, error: '当前不在战斗中' };
            }
            
            if (arena.currentBattle.turn !== 'player') {
                return { success: false, error: '不是你的回合' };
            }
            
            const battle = arena.currentBattle;
            battle.currentRound++;
            
            // 计算伤害
            const isCrit = Math.random() < battle.playerStats.critRate;
            let damage = calculatePVPDamage(battle.playerStats, battle.opponentStats, isCrit);
            
            // 功法克制
            const techniqueBonus = this._getTechniqueBonus(battle.playerTechnique, battle.opponentTechnique);
            damage = Math.floor(damage * techniqueBonus);
            
            battle.opponentStats.hp = Math.max(0, battle.opponentStats.hp - damage);
            
            battle.log.push({
                type: 'player_attack',
                round: battle.currentRound,
                technique: battle.playerTechnique,
                damage,
                isCrit,
                techniqueBonus,
                message: `你施展${battle.playerTechnique}，造成 ${damage} 点伤害${isCrit ? '（暴击）' : ''}${techniqueBonus > 1 ? '（功法克制）' : techniqueBonus < 1 ? '（被克制）' : ''}`
            });
            
            battle.turn = 'opponent';
            
            // 检查战斗结束
            if (battle.opponentStats.hp <= 0) {
                return this._endBattle('victory');
            }
            
            if (battle.currentRound >= PVP_CONFIG.maxRoundsPerBattle) {
                return this._endBattle('draw');
            }
            
            return {
                success: true,
                round: battle.currentRound,
                damage,
                isCrit,
                techniqueBonus,
                playerHp: battle.playerStats.hp,
                opponentHp: battle.opponentStats.hp,
                turn: 'opponent'
            };
        },
        
        /**
         * 执行玩家防御
         */
        executePlayerDefend() {
            const arena = this.gameState.pvpArena;
            
            if (arena.state !== PVP_STATES.IN_BATTLE) {
                return { success: false, error: '当前不在战斗中' };
            }
            
            if (arena.currentBattle.turn !== 'player') {
                return { success: false, error: '不是你的回合' };
            }
            
            const battle = arena.currentBattle;
            battle.currentRound++;
            
            // 防御姿态
            battle.playerStats.defenseBoost = 0.5;
            
            battle.log.push({
                type: 'player_defend',
                round: battle.currentRound,
                message: '你进入防御姿态'
            });
            
            battle.turn = 'opponent';
            
            return {
                success: true,
                round: battle.currentRound,
                playerHp: battle.playerStats.hp,
                opponentHp: battle.opponentStats.hp,
                turn: 'opponent'
            };
        },
        
        /**
         * 执行对手回合
         */
        executeOpponentTurn() {
            const arena = this.gameState.pvpArena;
            
            if (arena.state !== PVP_STATES.IN_BATTLE) {
                return { success: false, error: '当前不在战斗中' };
            }
            
            if (arena.currentBattle.turn !== 'opponent') {
                return { success: false, error: '不是对手的回合' };
            }
            
            const battle = arena.currentBattle;
            battle.currentRound++;
            
            // AI行动决策
            const action = battle.opponentStats.hp < battle.opponentStats.maxHp * 0.3 && Math.random() < 0.3
                ? 'defend'
                : 'attack';
            
            if (action === 'attack') {
                const isCrit = Math.random() < battle.opponentStats.critRate;
                let damage = calculatePVPDamage(battle.opponentStats, battle.playerStats, isCrit);
                
                // 功法克制
                const techniqueBonus = this._getTechniqueBonus(battle.opponentTechnique, battle.playerTechnique);
                damage = Math.floor(damage * techniqueBonus);
                
                // 玩家防御减伤
                if (battle.playerStats.defenseBoost) {
                    damage = Math.floor(damage * (1 - battle.playerStats.defenseBoost));
                    battle.playerStats.defenseBoost = null;
                }
                
                battle.playerStats.hp = Math.max(0, battle.playerStats.hp - damage);
                
                battle.log.push({
                    type: 'opponent_attack',
                    round: battle.currentRound,
                    technique: battle.opponentTechnique,
                    damage,
                    isCrit,
                    techniqueBonus,
                    message: `${battle.opponent.name}施展${battle.opponentTechnique}，造成 ${damage} 点伤害${isCrit ? '（暴击）' : ''}${techniqueBonus > 1 ? '（功法克制）' : ''}`
                });
            } else {
                battle.opponentStats.defenseBoost = 0.5;
                battle.log.push({
                    type: 'opponent_defend',
                    round: battle.currentRound,
                    message: `${battle.opponent.name}进入防御姿态`
                });
            }
            
            battle.turn = 'player';
            
            // 检查战斗结束
            if (battle.playerStats.hp <= 0) {
                return this._endBattle('defeat');
            }
            
            if (battle.currentRound >= PVP_CONFIG.maxRoundsPerBattle) {
                return this._endBattle('draw');
            }
            
            return {
                success: true,
                round: battle.currentRound,
                action,
                playerHp: battle.playerStats.hp,
                opponentHp: battle.opponentStats.hp,
                turn: 'player'
            };
        },
        
        /**
         * 获取功法克制关系
         */
        _getTechniqueBonus(attackerTech, defenderTech) {
            // 剑法克拳法，拳法克掌法，掌法克刀法，刀法克剑法
            const bonusMap = {
                '剑法': { '拳法': 1.3, '掌法': 0.8, '刀法': 0.9 },
                '拳法': { '掌法': 1.3, '刀法': 0.8, '剑法': 0.9 },
                '掌法': { '刀法': 1.3, '剑法': 0.8, '拳法': 0.9 },
                '刀法': { '剑法': 1.3, '拳法': 0.8, '掌法': 0.9 }
            };
            
            if (attackerTech === defenderTech) return 1.0;
            
            const bonuses = bonusMap[attackerTech];
            if (bonuses && bonuses[defenderTech]) {
                return bonuses[defenderTech];
            }
            return 1.0;
        },
        
        /**
         * 结束战斗
         */
        _endBattle(result) {
            const arena = this.gameState.pvpArena;
            const battle = arena.currentBattle;
            
            arena.state = PVP_STATES.VIEWING_RESULT;
            
            let rankChange = 0;
            let honorChange = 0;
            let spiritStoneChange = 0;
            
            if (result === 'victory') {
                rankChange = PVP_REWARDS.victory.rankPoints;
                honorChange = PVP_REWARDS.victory.honor;
                spiritStoneChange = PVP_REWARDS.victory.spiritStones;
                arena.consecutiveWins++;
                arena.consecutiveLosses = 0;
                arena.wins++;
            } else if (result === 'defeat') {
                rankChange = PVP_REWARDS.defeat.rankPoints;
                honorChange = PVP_REWARDS.defeat.honor;
                spiritStoneChange = PVP_REWARDS.defeat.spiritStones;
                arena.consecutiveLosses++;
                arena.consecutiveWins = 0;
                arena.losses++;
            } else {
                rankChange = PVP_REWARDS.draw.rankPoints;
                honorChange = PVP_REWARDS.draw.honor;
                spiritStoneChange = PVP_REWARDS.draw.spiritStones;
                arena.draws++;
            }
            
            // 应用rank变化
            const oldRank = arena.rank;
            arena.rank = Math.max(0, Math.min(9999, arena.rank + rankChange));
            const newTier = getTierByRank(arena.rank);
            const tierChanged = arena.tier !== newTier;
            arena.tier = newTier;
            
            // 更新荣誉
            arena.honor = Math.max(0, arena.honor + honorChange);
            
            // 更新最佳rank
            if (arena.rank < arena.bestRank) {
                arena.bestRank = arena.rank;
            }
            
            // 更新AI对手rank
            const opponentIndex = arena.aiOpponents.findIndex(opp => opp.id === battle.opponent.id);
            if (opponentIndex !== -1) {
                arena.aiOpponents[opponentIndex].rank = Math.max(300, arena.aiOpponents[opponentIndex].rank - rankChange);
            }
            
            // 记录历史
            const battleRecord = {
                result,
                opponent: battle.opponent.name,
                opponentRank: battle.opponent.rank,
                rankChange,
                honorChange,
                spiritStoneChange,
                technique: battle.playerTechnique,
                opponentTechnique: battle.opponentTechnique,
                rounds: battle.currentRound,
                day: this.gameState.days
            };
            arena.battleHistory.unshift(battleRecord);
            if (arena.battleHistory.length > PVP_CONFIG.battleHistoryLimit) {
                arena.battleHistory.pop();
            }
            
            arena.dailyBattles++;
            arena.totalBattles++;
            arena.lastBattleTime = Date.now();
            
            // 计算奖励
            const rewards = {
                rank: arena.rank,
                tier: arena.tier,
                rankChange,
                honor: arena.honor,
                honorChange,
                spiritStones: this.gameState.spiritStones + spiritStoneChange,
                spiritStoneChange,
                consecutiveWins: arena.consecutiveWins,
                consecutiveLosses: arena.consecutiveLosses,
                tierChanged,
                result
            };
            
            // 更新灵石
            this.gameState.spiritStones += spiritStoneChange;
            
            // 清空战斗
            arena.currentBattle = null;
            arena.pendingRewards = rewards;
            
            battle.log.push({
                type: 'battle_end',
                result,
                message: result === 'victory' ? '🎉 胜利！' : result === 'defeat' ? '😢 战败' : '⚖️ 平局'
            });
            
            return {
                success: true,
                result,
                rewards,
                log: battle.log
            };
        },
        
        /**
         * 确认结果并返回
         */
        claimBattleResult() {
            const arena = this.gameState.pvpArena;
            
            if (arena.state !== PVP_STATES.VIEWING_RESULT) {
                return { success: false, error: '当前没有可确认的结果' };
            }
            
            arena.state = PVP_STATES.IDLE;
            const rewards = arena.pendingRewards;
            arena.pendingRewards = null;
            
            return {
                success: true,
                rewards
            };
        },
        
        /**
         * 获取PVP信息
         */
        getPVPInfo() {
            const arena = this.gameState.pvpArena;
            
            return {
                state: arena.state,
                rank: arena.rank,
                tier: arena.tier,
                honor: arena.honor,
                consecutiveWins: arena.consecutiveWins,
                consecutiveLosses: arena.consecutiveLosses,
                totalBattles: arena.totalBattles,
                wins: arena.wins,
                losses: arena.losses,
                draws: arena.draws,
                dailyBattles: arena.dailyBattles,
                bestRank: arena.bestRank,
                winRate: arena.totalBattles > 0
                    ? Math.floor((arena.wins / arena.totalBattles) * 100)
                    : 0
            };
        },
        
        /**
         * 获取当前战斗信息
         */
        getBattleInfo() {
            const arena = this.gameState.pvpArena;
            
            if (!arena.currentBattle) {
                return null;
            }
            
            return {
                opponent: arena.currentBattle.opponent,
                playerStats: arena.currentBattle.playerStats,
                opponentStats: arena.currentBattle.opponentStats,
                currentRound: arena.currentBattle.currentRound,
                turn: arena.currentBattle.turn,
                playerTechnique: arena.currentBattle.playerTechnique,
                opponentTechnique: arena.currentBattle.opponentTechnique,
                log: arena.currentBattle.log.slice(-15)
            };
        },
        
        /**
         * 获取排行榜
         */
        getLeaderboard(limit = 20) {
            const arena = this.gameState.pvpArena;
            
            const allPlayers = [
                {
                    name: this.gameState.player?.name || '你',
                    rank: arena.rank,
                    honor: arena.honor,
                    tier: arena.tier,
                    isPlayer: true
                },
                ...arena.aiOpponents.map(opp => ({
                    name: opp.name,
                    rank: opp.rank,
                    honor: Math.floor(opp.rank / 10),
                    tier: getTierByRank(opp.rank),
                    isPlayer: false
                }))
            ];
            
            // 排序
            allPlayers.sort((a, b) => b.rank - a.rank);
            
            return allPlayers.slice(0, limit);
        },
        
        /**
         * 获取战斗历史
         */
        getBattleHistory(limit = 20) {
            const arena = this.gameState.pvpArena;
            return arena.battleHistory.slice(0, limit);
        },
        
        /**
         * 每日重置
         */
        dailyReset() {
            const arena = this.gameState.pvpArena;
            
            arena.dailyBattles = 0;
            
            // 应用衰减
            if (arena.rank > 0) {
                arena.rank = Math.max(0, arena.rank - PVP_CONFIG.decayPerDay);
                arena.tier = getTierByRank(arena.rank);
            }
            
            return {
                success: true,
                newRank: arena.rank,
                newTier: arena.tier
            };
        },
        
        /**
         * 获取荣誉等级
         */
        getHonorLevel() {
            const honor = this.gameState.pvpArena?.honor || 0;
            
            if (honor >= 5000) return { level: '传奇', title: '传奇修士', color: '#ff6b6b' };
            if (honor >= 2000) return { level: '大师', title: '大师级修士', color: '#ffd700' };
            if (honor >= 1000) return { level: '精英', title: '精英修士', color: '#c0c0c0' };
            if (honor >= 500) return { level: '老练', title: '老练修士', color: '#cd7f32' };
            return { level: '新秀', title: 'PVP新秀', color: '#999' };
        }
    };
    
    return service;
}

export default createPVPArenaService;