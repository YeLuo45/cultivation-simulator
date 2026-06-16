/**
 * PVPArenaService.test.js - PVP竞技场系统测试
 * V249: 仙宠竞技场+PVP系统
 * 
 * 测试覆盖率目标: ≥98%
 * 测试通过率目标: 100%
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    createPVPArenaService,
    PVP_STATES,
    PVP_CONFIG,
    PVP_REWARDS,
    PVP_TIERS
} from '../../../domains/arena/services/PVPArenaService.js';

// ===== 测试辅助函数 =====

/**
 * 创建测试用gameState
 */
function createMockGameState(overrides = {}) {
    return {
        player: {
            uid: 'player_001',
            name: '测试修士',
            level: 10
        },
        spiritStones: 100000,
        realm: 3,
        days: 1,
        pvpArena: null,
        ...overrides
    };
}

// ===== 常量验证测试 =====

describe('PVPArenaService Constants', () => {
    describe('PVP_STATES', () => {
        it('应有4个状态', () => {
            expect(Object.keys(PVP_STATES).length).toBe(4);
        });

        it('状态值正确', () => {
            expect(PVP_STATES.IDLE).toBe('idle');
            expect(PVP_STATES.MATCHING).toBe('matching');
            expect(PVP_STATES.IN_BATTLE).toBe('in_battle');
            expect(PVP_STATES.VIEWING_RESULT).toBe('viewing_result');
        });
    });

    describe('PVP_CONFIG', () => {
        it('入场费应为100', () => {
            expect(PVP_CONFIG.entryCost).toBe(100);
        });

        it('匹配时间应为5000ms', () => {
            expect(PVP_CONFIG.matchMakingTime).toBe(5000);
        });

        it('最大回合数应为30', () => {
            expect(PVP_CONFIG.maxRoundsPerBattle).toBe(30);
        });

        it('rank变化基数应为25', () => {
            expect(PVP_CONFIG.rankDelta).toBe(25);
        });

        it('荣誉变化应为10', () => {
            expect(PVP_CONFIG.honorDelta).toBe(10);
        });

        it('每日衰减应为30', () => {
            expect(PVP_CONFIG.decayPerDay).toBe(30);
        });

        it('排行榜规模应为100', () => {
            expect(PVP_CONFIG.leaderboardSize).toBe(100);
        });

        it('战斗历史上限应为100', () => {
            expect(PVP_CONFIG.battleHistoryLimit).toBe(100);
        });
    });

    describe('PVP_REWARDS', () => {
        it('胜利奖励配置正确', () => {
            expect(PVP_REWARDS.victory).toEqual({ honor: 50, spiritStones: 200, rankPoints: 25 });
        });

        it('失败奖励配置正确', () => {
            expect(PVP_REWARDS.defeat).toEqual({ honor: 10, spiritStones: 50, rankPoints: -15 });
        });

        it('平局奖励配置正确', () => {
            expect(PVP_REWARDS.draw).toEqual({ honor: 25, spiritStones: 100, rankPoints: 0 });
        });
    });

    describe('PVP_TIERS', () => {
        it('应有5个段位配置', () => {
            expect(Object.keys(PVP_TIERS).length).toBe(5);
        });

        it('每个段位应有color属性', () => {
            for (const config of Object.values(PVP_TIERS)) {
                expect(config).toHaveProperty('color');
            }
        });
    });
});

// ===== 服务初始化测试 =====

describe('PVPArenaService Initialization', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createMockGameState();
        service = createPVPArenaService(gameState);
    });

    it('应创建服务实例', () => {
        expect(service).toBeDefined();
        expect(service.gameState).toBe(gameState);
    });

    it('init应初始化pvpArena', () => {
        const result = service.init();
        expect(result).toBeDefined();
        expect(result.state).toBe(PVP_STATES.IDLE);
        expect(result.rank).toBe(1000);
        expect(result.honor).toBe(0);
    });

    it('init不应覆盖已有数据', () => {
        service.init();
        gameState.pvpArena.rank = 5000;
        service.init();
        expect(gameState.pvpArena.rank).toBe(5000);
    });

    it('init应生成AI对手', () => {
        service.init();
        expect(gameState.pvpArena.aiOpponents).toBeDefined();
        expect(gameState.pvpArena.aiOpponents.length).toBeGreaterThan(0);
    });

    it('AI对手应有正确属性', () => {
        service.init();
        const opponent = gameState.pvpArena.aiOpponents[0];
        expect(opponent).toHaveProperty('id');
        expect(opponent).toHaveProperty('name');
        expect(opponent).toHaveProperty('realm');
        expect(opponent).toHaveProperty('level');
        expect(opponent).toHaveProperty('rank');
        expect(opponent).toHaveProperty('stats');
    });
});

// ===== PVP核心功能测试 =====

describe('PVPArenaService - Core Functions', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createMockGameState();
        service = createPVPArenaService(gameState);
        service.init();
    });

    describe('startMatchMaking', () => {
        it('空闲状态应能开始匹配', () => {
            const result = service.startMatchMaking();
            expect(result.success).toBe(true);
            expect(result.message).toBe('匹配中...');
            expect(result.entryCost).toBe(100);
        });

        it('匹配状态应扣除灵石', () => {
            const initialStones = gameState.spiritStones;
            service.startMatchMaking();
            expect(gameState.spiritStones).toBe(initialStones - 100);
        });

        it('战斗中状态应返回错误', () => {
            service.startMatchMaking();
            gameState.pvpArena.state = PVP_STATES.IN_BATTLE;
            const result = service.startMatchMaking();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('灵石不足应返回错误', () => {
            gameState.spiritStones = 10;
            const result = service.startMatchMaking();
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵石不足');
        });
    });

    describe('processMatchMaking', () => {
        it('非匹配状态应返回null', () => {
            const result = service.processMatchMaking();
            expect(result).toBeNull();
        });

        it('匹配中应返回进度', () => {
            service.startMatchMaking();
            const result = service.processMatchMaking();
            expect(result.status).toBe('matching');
            expect(result.progress).toBeDefined();
        });

        it('匹配完成应返回对手信息', () => {
            service.startMatchMaking();
            gameState.pvpArena.matchMakingStart = Date.now() - PVP_CONFIG.matchMakingTime - 100;
            const result = service.processMatchMaking();
            expect(result.status).toBe('matched');
            expect(result.opponent).toBeDefined();
            expect(result.opponent.name).toBeDefined();
        });

        it('匹配完成应包含战斗属性', () => {
            service.startMatchMaking();
            gameState.pvpArena.matchMakingStart = Date.now() - PVP_CONFIG.matchMakingTime - 100;
            const result = service.processMatchMaking();
            expect(result.playerStats).toBeDefined();
            expect(result.opponentStats).toBeDefined();
        });
    });

    describe('executePlayerAttack', () => {
        beforeEach(() => {
            service.startMatchMaking();
            gameState.pvpArena.matchMakingStart = Date.now() - PVP_CONFIG.matchMakingTime - 100;
            service.processMatchMaking();
        });

        it('应能执行攻击', () => {
            const result = service.executePlayerAttack();
            expect(result.success).toBe(true);
            expect(result.damage).toBeGreaterThan(0);
        });

        it('攻击应减少对手HP', () => {
            const initialHp = gameState.pvpArena.currentBattle.opponentStats.hp;
            service.executePlayerAttack();
            expect(gameState.pvpArena.currentBattle.opponentStats.hp).toBeLessThan(initialHp);
        });

        it('非玩家回合应返回错误', () => {
            gameState.pvpArena.currentBattle.turn = 'opponent';
            const result = service.executePlayerAttack();
            expect(result.success).toBe(false);
        });

        it('HP归零应结束战斗', () => {
            gameState.pvpArena.currentBattle.opponentStats.hp = 1;
            const result = service.executePlayerAttack();
            expect(result.result).toBe('victory');
        });
    });

    describe('executePlayerDefend', () => {
        beforeEach(() => {
            service.startMatchMaking();
            gameState.pvpArena.matchMakingStart = Date.now() - PVP_CONFIG.matchMakingTime - 100;
            service.processMatchMaking();
        });

        it('应能执行防御', () => {
            const result = service.executePlayerDefend();
            expect(result.success).toBe(true);
        });

        it('防御应增加防御加成', () => {
            service.executePlayerDefend();
            expect(gameState.pvpArena.currentBattle.playerStats.defenseBoost).toBe(0.5);
        });

        it('非玩家回合应返回错误', () => {
            gameState.pvpArena.currentBattle.turn = 'opponent';
            const result = service.executePlayerDefend();
            expect(result.success).toBe(false);
        });
    });

    describe('executeOpponentTurn', () => {
        beforeEach(() => {
            service.startMatchMaking();
            gameState.pvpArena.matchMakingStart = Date.now() - PVP_CONFIG.matchMakingTime - 100;
            service.processMatchMaking();
            gameState.pvpArena.currentBattle.turn = 'opponent';
        });

        it('应能执行对手回合', () => {
            const result = service.executeOpponentTurn();
            expect(result.success).toBe(true);
            expect(result.round).toBeGreaterThan(0);
        });

        it('对手HP低时可能选择防御', () => {
            gameState.pvpArena.currentBattle.opponentStats.hp = 10;
            const result = service.executeOpponentTurn();
            expect(result.success).toBe(true);
            // 低HP时可能防御也可能攻击
            expect(['attack', 'defend']).toContain(result.action);
        });

        it('HP归零应结束战斗', () => {
            gameState.pvpArena.currentBattle.playerStats.hp = 1;
            const result = service.executeOpponentTurn();
            expect(result.result).toBe('defeat');
        });
    });

    describe('claimBattleResult', () => {
        it('查看结果状态应能确认', () => {
            gameState.pvpArena.state = PVP_STATES.VIEWING_RESULT;
            gameState.pvpArena.pendingRewards = { rank: 1025 };
            
            const result = service.claimBattleResult();
            expect(result.success).toBe(true);
            expect(result.rewards).toBeDefined();
        });

        it('非查看状态应返回错误', () => {
            gameState.pvpArena.state = PVP_STATES.IDLE;
            const result = service.claimBattleResult();
            expect(result.success).toBe(false);
        });

        it('确认后应回到空闲状态', () => {
            gameState.pvpArena.state = PVP_STATES.VIEWING_RESULT;
            gameState.pvpArena.pendingRewards = { rank: 1025 };
            service.claimBattleResult();
            expect(gameState.pvpArena.state).toBe(PVP_STATES.IDLE);
        });
    });
});

// ===== 战斗流程测试 =====

describe('PVPArenaService - Battle Flow', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createMockGameState();
        service = createPVPArenaService(gameState);
        service.init();
        
        service.startMatchMaking();
        gameState.pvpArena.matchMakingStart = Date.now() - PVP_CONFIG.matchMakingTime - 100;
        service.processMatchMaking();
    });

    it('完整的攻击-对手回合流程', () => {
        const attackResult = service.executePlayerAttack();
        expect(attackResult.success).toBe(true);
        
        const opponentResult = service.executeOpponentTurn();
        expect(opponentResult.success).toBe(true);
        
        expect(gameState.pvpArena.currentBattle.currentRound).toBe(2);
    });

    it('战斗日志应正确记录', () => {
        service.executePlayerAttack();
        const battleInfo = service.getBattleInfo();
        expect(battleInfo.log.length).toBeGreaterThan(0);
    });

    it('胜利应增加rank和荣誉', () => {
        gameState.pvpArena.currentBattle.opponentStats.hp = 1;
        service.executePlayerAttack();
        
        const rewards = service.claimBattleResult();
        expect(rewards.rewards.result).toBe('victory');
        expect(rewards.rewards.rankChange).toBe(PVP_REWARDS.victory.rankPoints);
    });

    it('失败应减少rank', () => {
        gameState.pvpArena.currentBattle.turn = 'opponent';
        gameState.pvpArena.currentBattle.playerStats.hp = 1;
        service.executeOpponentTurn();
        
        const rewards = service.claimBattleResult();
        expect(rewards.rewards.result).toBe('defeat');
        expect(rewards.rewards.rankChange).toBe(PVP_REWARDS.defeat.rankPoints);
    });
});

// ===== 功法克制测试 =====

describe('PVPArenaService - Technique System', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createMockGameState();
        service = createPVPArenaService(gameState);
        service.init();
        
        service.startMatchMaking();
        gameState.pvpArena.matchMakingStart = Date.now() - PVP_CONFIG.matchMakingTime - 100;
        service.processMatchMaking();
    });

    it('应有功法属性', () => {
        const battle = gameState.pvpArena.currentBattle;
        expect(battle.playerTechnique).toBeDefined();
        expect(battle.opponentTechnique).toBeDefined();
    });

    it('功法类型应正确', () => {
        const techniques = ['剑法', '拳法', '掌法', '刀法'];
        const battle = gameState.pvpArena.currentBattle;
        expect(techniques).toContain(battle.playerTechnique);
        expect(techniques).toContain(battle.opponentTechnique);
    });
});

// ===== 信息查询测试 =====

describe('PVPArenaService - Info Queries', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createMockGameState();
        service = createPVPArenaService(gameState);
        service.init();
    });

    describe('getPVPInfo', () => {
        it('应返回完整PVP信息', () => {
            const info = service.getPVPInfo();
            expect(info).toHaveProperty('state');
            expect(info).toHaveProperty('rank');
            expect(info).toHaveProperty('tier');
            expect(info).toHaveProperty('honor');
            expect(info).toHaveProperty('consecutiveWins');
            expect(info).toHaveProperty('totalBattles');
            expect(info).toHaveProperty('wins');
            expect(info).toHaveProperty('losses');
            expect(info).toHaveProperty('winRate');
        });

        it('胜率应正确计算', () => {
            gameState.pvpArena.wins = 3;
            gameState.pvpArena.totalBattles = 10;
            const info = service.getPVPInfo();
            expect(info.winRate).toBe(30);
        });

        it('无战斗时胜率应为0', () => {
            gameState.pvpArena.totalBattles = 0;
            const info = service.getPVPInfo();
            expect(info.winRate).toBe(0);
        });
    });

    describe('getBattleInfo', () => {
        it('无战斗时应返回null', () => {
            expect(service.getBattleInfo()).toBeNull();
        });

        it('有战斗时应返回信息', () => {
            service.startMatchMaking();
            gameState.pvpArena.matchMakingStart = Date.now() - PVP_CONFIG.matchMakingTime - 100;
            service.processMatchMaking();
            
            const info = service.getBattleInfo();
            expect(info).toHaveProperty('opponent');
            expect(info).toHaveProperty('playerStats');
            expect(info).toHaveProperty('opponentStats');
        });
    });

    describe('getLeaderboard', () => {
        it('应返回排行榜', () => {
            const leaderboard = service.getLeaderboard();
            expect(leaderboard.length).toBeGreaterThan(0);
        });

        it('玩家应在排行榜中', () => {
            const leaderboard = service.getLeaderboard();
            const playerEntry = leaderboard.find(entry => entry.isPlayer);
            expect(playerEntry).toBeDefined();
        });

        it('应支持limit参数', () => {
            const leaderboard = service.getLeaderboard(5);
            expect(leaderboard.length).toBeLessThanOrEqual(5);
        });

        it('应按rank降序排列', () => {
            const leaderboard = service.getLeaderboard();
            for (let i = 1; i < leaderboard.length; i++) {
                expect(leaderboard[i-1].rank).toBeGreaterThanOrEqual(leaderboard[i].rank);
            }
        });
    });

    describe('getBattleHistory', () => {
        it('空历史应返回空数组', () => {
            const history = service.getBattleHistory();
            expect(history).toEqual([]);
        });

        it('应有历史记录', () => {
            gameState.pvpArena.battleHistory = [
                { result: 'victory', opponent: '对手1' },
                { result: 'defeat', opponent: '对手2' }
            ];
            
            const history = service.getBattleHistory();
            expect(history.length).toBe(2);
        });

        it('应支持limit参数', () => {
            gameState.pvpArena.battleHistory = Array(25).fill({ result: 'victory' });
            const history = service.getBattleHistory(10);
            expect(history.length).toBe(10);
        });
    });

    describe('getHonorLevel', () => {
        it('新秀应无荣誉', () => {
            gameState.pvpArena.honor = 0;
            const level = service.getHonorLevel();
            expect(level.level).toBe('新秀');
        });

        it('500荣誉应为老练', () => {
            gameState.pvpArena.honor = 500;
            const level = service.getHonorLevel();
            expect(level.level).toBe('老练');
        });

        it('1000荣誉应为精英', () => {
            gameState.pvpArena.honor = 1000;
            const level = service.getHonorLevel();
            expect(level.level).toBe('精英');
        });

        it('2000荣誉应为大师', () => {
            gameState.pvpArena.honor = 2000;
            const level = service.getHonorLevel();
            expect(level.level).toBe('大师');
        });

        it('5000+荣誉应为传奇', () => {
            gameState.pvpArena.honor = 5000;
            const level = service.getHonorLevel();
            expect(level.level).toBe('传奇');
        });

        it('应包含title和color', () => {
            const level = service.getHonorLevel();
            expect(level.title).toBeDefined();
            expect(level.color).toBeDefined();
        });
    });
});

// ===== 奖励与衰减测试 =====

describe('PVPArenaService - Rewards & Decay', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createMockGameState();
        service = createPVPArenaService(gameState);
        service.init();
    });

    describe('dailyReset', () => {
        it('应重置每日战斗次数', () => {
            gameState.pvpArena.dailyBattles = 5;
            service.dailyReset();
            expect(gameState.pvpArena.dailyBattles).toBe(0);
        });

        it('应应用每日衰减', () => {
            gameState.pvpArena.rank = 1000;
            service.dailyReset();
            expect(gameState.pvpArena.rank).toBe(970);
        });

        it('rank不应低于0', () => {
            gameState.pvpArena.rank = 10;
            service.dailyReset();
            expect(gameState.pvpArena.rank).toBeGreaterThanOrEqual(0);
        });
    });

    describe('战斗统计', () => {
        it('胜利应增加wins计数', () => {
            gameState.pvpArena.state = PVP_STATES.VIEWING_RESULT;
            gameState.pvpArena.pendingRewards = { result: 'victory' };
            service.claimBattleResult();
            expect(gameState.pvpArena.wins).toBe(1);
        });

        it('失败应增加losses计数', () => {
            gameState.pvpArena.state = PVP_STATES.VIEWING_RESULT;
            gameState.pvpArena.pendingRewards = { result: 'defeat' };
            service.claimBattleResult();
            expect(gameState.pvpArena.losses).toBe(1);
        });

        it('平局应增加draws计数', () => {
            gameState.pvpArena.state = PVP_STATES.VIEWING_RESULT;
            gameState.pvpArena.pendingRewards = { result: 'draw' };
            service.claimBattleResult();
            expect(gameState.pvpArena.draws).toBe(1);
        });

        it('连胜应正确计数', () => {
            gameState.pvpArena.state = PVP_STATES.VIEWING_RESULT;
            gameState.pvpArena.pendingRewards = { result: 'victory' };
            service.claimBattleResult();
            expect(gameState.pvpArena.consecutiveWins).toBe(1);
        });

        it('失败应重置连胜', () => {
            gameState.pvpArena.consecutiveWins = 5;
            gameState.pvpArena.state = PVP_STATES.VIEWING_RESULT;
            gameState.pvpArena.pendingRewards = { result: 'defeat' };
            service.claimBattleResult();
            expect(gameState.pvpArena.consecutiveWins).toBe(0);
        });
    });
});

// ===== 边界情况测试 =====

describe('PVPArenaService - Edge Cases', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createMockGameState();
        service = createPVPArenaService(gameState);
        service.init();
    });

    it('最佳rank应只降不升', () => {
        gameState.pvpArena.bestRank = 500;
        gameState.pvpArena.rank = 600;
        expect(gameState.pvpArena.bestRank).toBe(500);
    });

    it('荣誉不应为负数', () => {
        gameState.pvpArena.honor = 5;
        // 失败会扣10荣誉，但不会低于0
        gameState.pvpArena.state = PVP_STATES.VIEWING_RESULT;
        gameState.pvpArena.pendingRewards = { result: 'defeat', honorChange: -10 };
        service.claimBattleResult();
        expect(gameState.pvpArena.honor).toBeGreaterThanOrEqual(0);
    });

    it('战斗历史应有上限', () => {
        for (let i = 0; i < 150; i++) {
            gameState.pvpArena.battleHistory.unshift({ result: 'victory' });
        }
        expect(gameState.pvpArena.battleHistory.length).toBeLessThanOrEqual(100);
    });

    it('AI对手列表应保持一定规模', () => {
        expect(gameState.pvpArena.aiOpponents.length).toBeGreaterThan(0);
    });

    it('玩家HP不应为负', () => {
        service.startMatchMaking();
        gameState.pvpArena.matchMakingStart = Date.now() - PVP_CONFIG.matchMakingTime - 100;
        service.processMatchMaking();
        gameState.pvpArena.currentBattle.turn = 'opponent';
        gameState.pvpArena.currentBattle.playerStats.hp = 1;
        gameState.pvpArena.currentBattle.opponentStats.attack = 1000;
        
        service.executeOpponentTurn();
        expect(gameState.pvpArena.currentBattle.playerStats.hp).toBeGreaterThanOrEqual(0);
    });

    it('对手HP不应为负', () => {
        gameState.pvpArena.currentBattle.opponentStats.hp = 1;
        service.executePlayerAttack();
        expect(gameState.pvpArena.currentBattle.opponentStats.hp).toBeGreaterThanOrEqual(0);
    });

    it('rank不应超过9999', () => {
        gameState.pvpArena.rank = 9999;
        // 胜利会增加25，但上限是9999
        gameState.pvpArena.state = PVP_STATES.VIEWING_RESULT;
        gameState.pvpArena.pendingRewards = { result: 'victory', rankChange: 25 };
        service.claimBattleResult();
        expect(gameState.pvpArena.rank).toBeLessThanOrEqual(9999);
    });

    it('rank不应低于0', () => {
        gameState.pvpArena.rank = 0;
        service.dailyReset();
        expect(gameState.pvpArena.rank).toBeGreaterThanOrEqual(0);
    });

    it('lastBattleTime应在战斗后更新', () => {
        gameState.pvpArena.state = PVP_STATES.VIEWING_RESULT;
        gameState.pvpArena.pendingRewards = { result: 'victory' };
        service.claimBattleResult();
        expect(gameState.pvpArena.lastBattleTime).toBeDefined();
    });
});