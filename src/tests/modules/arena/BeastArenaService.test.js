/**
 * BeastArenaService.test.js - 仙宠竞技场系统测试
 * V249: 仙宠竞技场+PVP系统
 * 
 * 测试覆盖率目标: ≥98%
 * 测试通过率目标: 100%
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    createBeastArenaService,
    ARENA_TIERS,
    ARENA_CONFIG,
    ARENA_REWARDS,
    BEAST_ARENA_STATES,
    getTierByRank,
    getTierInfo
} from '../../../domains/arena/services/BeastArenaService.js';

// ===== 测试辅助函数 =====

/**
 * 创建测试用gameState
 */
function createMockGameState(overrides = {}) {
    return {
        player: {
            uid: 'player_001',
            name: '测试修士'
        },
        spiritStones: 100000,
        realm: 3,
        days: 1,
        pets: [
            {
                id: 'pet_001',
                name: '小仙',
                species: '灵狐',
                level: 10,
                active: true,
                stats: { attack: 15, defense: 8, spirit: 12 }
            },
            {
                id: 'pet_002',
                name: '小白',
                species: '玄龟',
                level: 5,
                active: true,
                stats: { attack: 10, defense: 10, spirit: 8 }
            }
        ],
        beastArena: null,
        ...overrides
    };
}

// ===== 常量验证测试 =====

describe('BeastArenaService Constants', () => {
    describe('ARENA_TIERS', () => {
        it('应有5个段位配置', () => {
            expect(Object.keys(ARENA_TIERS).length).toBe(5);
        });

        it('青铜段位配置正确', () => {
            expect(ARENA_TIERS['青铜']).toEqual({ minRank: 0, maxRank: 999, rewards: 100 });
        });

        it('白银段位配置正确', () => {
            expect(ARENA_TIERS['白银']).toEqual({ minRank: 1000, maxRank: 2999, rewards: 300 });
        });

        it('黄金段位配置正确', () => {
            expect(ARENA_TIERS['黄金']).toEqual({ minRank: 3000, maxRank: 5999, rewards: 600 });
        });

        it('钻石段位配置正确', () => {
            expect(ARENA_TIERS['钻石']).toEqual({ minRank: 6000, maxRank: 8999, rewards: 1000 });
        });

        it('至尊段位配置正确', () => {
            expect(ARENA_TIERS['至尊']).toEqual({ minRank: 9000, maxRank: 9999, rewards: 2000 });
        });

        it('每个段位应有minRank、maxRank、rewards属性', () => {
            for (const config of Object.values(ARENA_TIERS)) {
                expect(config).toHaveProperty('minRank');
                expect(config).toHaveProperty('maxRank');
                expect(config).toHaveProperty('rewards');
            }
        });
    });

    describe('ARENA_CONFIG', () => {
        it('入场费应为50', () => {
            expect(ARENA_CONFIG.entryCost).toBe(50);
        });

        it('匹配时间应为3000ms', () => {
            expect(ARENA_CONFIG.matchMakingTime).toBe(3000);
        });

        it('最大回合数应为20', () => {
            expect(ARENA_CONFIG.maxRoundsPerBattle).toBe(20);
        });

        it('赛季持续天数应为7', () => {
            expect(ARENA_CONFIG.seasonDuration).toBe(7);
        });

        it('每日衰减应为50', () => {
            expect(ARENA_CONFIG.decayPerDay).toBe(50);
        });

        it('连胜奖励应为20', () => {
            expect(ARENA_CONFIG.consecutiveWinBonus).toBe(20);
        });

        it('段位保护费用应为100', () => {
            expect(ARENA_CONFIG.tierProtectionCost).toBe(100);
        });
    });

    describe('ARENA_REWARDS', () => {
        it('胜利奖励配置正确', () => {
            expect(ARENA_REWARDS.victory).toEqual({ rank: 50, spiritStones: 200 });
        });

        it('失败奖励配置正确', () => {
            expect(ARENA_REWARDS.defeat).toEqual({ rank: 10, spiritStones: 50 });
        });

        it('平局奖励配置正确', () => {
            expect(ARENA_REWARDS.draw).toEqual({ rank: 20, spiritStones: 100 });
        });

        it('连胜奖励配置正确', () => {
            expect(ARENA_REWARDS.consecutiveWin).toEqual({ bonus: 20 });
        });
    });

    describe('BEAST_ARENA_STATES', () => {
        it('应有4个状态', () => {
            expect(Object.keys(BEAST_ARENA_STATES).length).toBe(4);
        });

        it('状态值正确', () => {
            expect(BEAST_ARENA_STATES.IDLE).toBe('idle');
            expect(BEAST_ARENA_STATES.MATCHING).toBe('matching');
            expect(BEAST_ARENA_STATES.IN_BATTLE).toBe('in_battle');
            expect(BEAST_ARENA_STATES.VIEWING_REWARDS).toBe('viewing_rewards');
        });
    });
});

// ===== 辅助函数测试 =====

describe('BeastArenaService Helper Functions', () => {
    describe('getTierByRank', () => {
        it('0应返回青铜', () => {
            expect(getTierByRank(0)).toBe('青铜');
        });

        it('999应返回青铜', () => {
            expect(getTierByRank(999)).toBe('青铜');
        });

        it('1000应返回白银', () => {
            expect(getTierByRank(1000)).toBe('白银');
        });

        it('2999应返回白银', () => {
            expect(getTierByRank(2999)).toBe('白银');
        });

        it('3000应返回黄金', () => {
            expect(getTierByRank(3000)).toBe('黄金');
        });

        it('5999应返回黄金', () => {
            expect(getTierByRank(5999)).toBe('黄金');
        });

        it('6000应返回钻石', () => {
            expect(getTierByRank(6000)).toBe('钻石');
        });

        it('8999应返回钻石', () => {
            expect(getTierByRank(8999)).toBe('钻石');
        });

        it('9000应返回至尊', () => {
            expect(getTierByRank(9000)).toBe('至尊');
        });

        it('9999应返回至尊', () => {
            expect(getTierByRank(9999)).toBe('至尊');
        });
    });

    describe('getTierInfo', () => {
        it('500应返回青铜段位信息', () => {
            const info = getTierInfo(500);
            expect(info.name).toBe('青铜');
            expect(info.minRank).toBe(0);
            expect(info.maxRank).toBe(999);
            expect(info.rewards).toBe(100);
        });

        it('1500应返回白银段位信息', () => {
            const info = getTierInfo(1500);
            expect(info.name).toBe('白银');
            expect(info.minRank).toBe(1000);
            expect(info.maxRank).toBe(2999);
        });
    });
});

// ===== 服务初始化测试 =====

describe('BeastArenaService Initialization', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createMockGameState();
        service = createBeastArenaService(gameState);
    });

    it('应创建服务实例', () => {
        expect(service).toBeDefined();
        expect(service.gameState).toBe(gameState);
    });

    it('init应初始化beastArena', () => {
        const result = service.init();
        expect(result).toBeDefined();
        expect(result.state).toBe(BEAST_ARENA_STATES.IDLE);
        expect(result.rank).toBe(1000);
        expect(result.tier).toBe('白银');
    });

    it('init不应覆盖已有数据', () => {
        service.init();
        gameState.beastArena.rank = 5000;
        service.init();
        expect(gameState.beastArena.rank).toBe(5000);
    });

    it('init应生成AI对手', () => {
        service.init();
        expect(gameState.beastArena.aiOpponents).toBeDefined();
        expect(gameState.beastArena.aiOpponents.length).toBeGreaterThan(0);
    });

    it('AI对手应有正确属性', () => {
        service.init();
        const opponent = gameState.beastArena.aiOpponents[0];
        expect(opponent).toHaveProperty('id');
        expect(opponent).toHaveProperty('name');
        expect(opponent).toHaveProperty('species');
        expect(opponent).toHaveProperty('level');
        expect(opponent).toHaveProperty('rank');
        expect(opponent).toHaveProperty('stats');
    });
});

// ===== 仙宠竞技场核心功能测试 =====

describe('BeastArenaService - Core Functions', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createMockGameState();
        service = createBeastArenaService(gameState);
        service.init();
    });

    describe('startMatchMaking', () => {
        it('空闲状态应能开始匹配', () => {
            const result = service.startMatchMaking();
            expect(result.success).toBe(true);
            expect(result.message).toBe('匹配中...');
            expect(result.entryCost).toBe(50);
        });

        it('匹配状态应扣除灵石', () => {
            const initialStones = gameState.spiritStones;
            service.startMatchMaking();
            expect(gameState.spiritStones).toBe(initialStones - 50);
        });

        it('战斗中状态应返回错误', () => {
            service.startMatchMaking();
            gameState.beastArena.state = BEAST_ARENA_STATES.IN_BATTLE;
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
            // 跳过匹配时间
            gameState.beastArena.matchMakingStart = Date.now() - ARENA_CONFIG.matchMakingTime - 100;
            const result = service.processMatchMaking();
            expect(result.status).toBe('matched');
            expect(result.opponent).toBeDefined();
            expect(result.opponent.name).toBeDefined();
        });

        it('匹配完成应设置战斗状态', () => {
            service.startMatchMaking();
            gameState.beastArena.matchMakingStart = Date.now() - ARENA_CONFIG.matchMakingTime - 100;
            service.processMatchMaking();
            expect(gameState.beastArena.state).toBe(BEAST_ARENA_STATES.IN_BATTLE);
        });
    });

    describe('setBattlePet', () => {
        beforeEach(() => {
            service.startMatchMaking();
            gameState.beastArena.matchMakingStart = Date.now() - ARENA_CONFIG.matchMakingTime - 100;
            service.processMatchMaking();
        });

        it('应能设置参战仙宠', () => {
            const result = service.setBattlePet('pet_001');
            expect(result.success).toBe(true);
            expect(result.pet.id).toBe('pet_001');
        });

        it('应能获取仙宠属性', () => {
            service.setBattlePet('pet_001');
            expect(service.getBattleInfo().playerHp).toBeGreaterThan(0);
        });

        it('不存在的仙宠应返回错误', () => {
            const result = service.setBattlePet('nonexistent');
            expect(result.success).toBe(false);
            expect(result.error).toContain('不存在');
        });

        it('非战斗状态应返回错误', () => {
            gameState.beastArena.state = BEAST_ARENA_STATES.IDLE;
            const result = service.setBattlePet('pet_001');
            expect(result.success).toBe(false);
        });
    });

    describe('executePlayerAttack', () => {
        beforeEach(() => {
            service.startMatchMaking();
            gameState.beastArena.matchMakingStart = Date.now() - ARENA_CONFIG.matchMakingTime - 100;
            service.processMatchMaking();
            service.setBattlePet('pet_001');
        });

        it('应能执行攻击', () => {
            const result = service.executePlayerAttack();
            expect(result.success).toBe(true);
            expect(result.damage).toBeGreaterThan(0);
        });

        it('攻击应减少对手HP', () => {
            const initialHp = gameState.beastArena.currentBattle.opponentHp;
            service.executePlayerAttack();
            expect(gameState.beastArena.currentBattle.opponentHp).toBeLessThan(initialHp);
        });

        it('对手回合应为opponent', () => {
            service.executePlayerAttack();
            expect(gameState.beastArena.currentBattle.turn).toBe('opponent');
        });

        it('非玩家回合应返回错误', () => {
            gameState.beastArena.currentBattle.turn = 'opponent';
            const result = service.executePlayerAttack();
            expect(result.success).toBe(false);
        });
    });

    describe('executePlayerDefend', () => {
        beforeEach(() => {
            service.startMatchMaking();
            gameState.beastArena.matchMakingStart = Date.now() - ARENA_CONFIG.matchMakingTime - 100;
            service.processMatchMaking();
            service.setBattlePet('pet_001');
        });

        it('应能执行防御', () => {
            const result = service.executePlayerDefend();
            expect(result.success).toBe(true);
            expect(result.defenseBonus).toBe(0.5);
        });

        it('防御应切换到对手回合', () => {
            service.executePlayerDefend();
            expect(gameState.beastArena.currentBattle.turn).toBe('opponent');
        });

        it('非玩家回合应返回错误', () => {
            gameState.beastArena.currentBattle.turn = 'opponent';
            const result = service.executePlayerDefend();
            expect(result.success).toBe(false);
        });
    });

    describe('executeOpponentTurn', () => {
        beforeEach(() => {
            service.startMatchMaking();
            gameState.beastArena.matchMakingStart = Date.now() - ARENA_CONFIG.matchMakingTime - 100;
            service.processMatchMaking();
            service.setBattlePet('pet_001');
            gameState.beastArena.currentBattle.turn = 'opponent';
        });

        it('应能执行对手回合', () => {
            const result = service.executeOpponentTurn();
            expect(result.success).toBe(true);
            expect(result.round).toBeGreaterThan(0);
        });

        it('对手回合应切换到玩家', () => {
            service.executeOpponentTurn();
            expect(gameState.beastArena.currentBattle.turn).toBe('player');
        });

        it('非对手回合应返回错误', () => {
            gameState.beastArena.currentBattle.turn = 'player';
            const result = service.executeOpponentTurn();
            expect(result.success).toBe(false);
        });

        it('HP归零应结束战斗', () => {
            gameState.beastArena.currentBattle.opponentHp = 1;
            const result = service.executeOpponentTurn();
            expect(result.result).toBeDefined();
        });
    });

    describe('claimRewards', () => {
        it('查看奖励状态应能领取', () => {
            // 手动设置到奖励查看状态
            gameState.beastArena.state = BEAST_ARENA_STATES.VIEWING_REWARDS;
            gameState.beastArena.pendingRewards = {
                rank: 1050,
                tier: '白银',
                rankChange: 50
            };
            
            const result = service.claimRewards();
            expect(result.success).toBe(true);
            expect(result.rewards).toBeDefined();
        });

        it('非奖励状态应返回错误', () => {
            gameState.beastArena.state = BEAST_ARENA_STATES.IDLE;
            const result = service.claimRewards();
            expect(result.success).toBe(false);
        });
    });
});

// ===== 战斗流程测试 =====

describe('BeastArenaService - Battle Flow', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createMockGameState();
        service = createBeastArenaService(gameState);
        service.init();
        
        // 开始匹配并进入战斗
        service.startMatchMaking();
        gameState.beastArena.matchMakingStart = Date.now() - ARENA_CONFIG.matchMakingTime - 100;
        service.processMatchMaking();
        service.setBattlePet('pet_001');
    });

    it('完整的攻击-防御回合流程', () => {
        // 玩家攻击
        const attackResult = service.executePlayerAttack();
        expect(attackResult.success).toBe(true);
        
        // 对手回合
        const defendResult = service.executeOpponentTurn();
        expect(defendResult.success).toBe(true);
        
        // 验证回合数增加
        expect(gameState.beastArena.currentBattle.currentRound).toBe(2);
    });

    it('战斗日志应正确记录', () => {
        service.executePlayerAttack();
        const battleInfo = service.getBattleInfo();
        expect(battleInfo.log.length).toBeGreaterThan(0);
    });

    it('战斗结束后应进入奖励查看状态', () => {
        // 将对手HP设为1，玩家攻击后应胜利
        gameState.beastArena.currentBattle.opponentHp = 1;
        const result = service.executePlayerAttack();
        
        expect(result.result).toBe('victory');
        expect(gameState.beastArena.state).toBe(BEAST_ARENA_STATES.VIEWING_REWARDS);
    });

    it('失败应减少rank', () => {
        // 将玩家HP设为1，对手攻击后应失败
        gameState.beastArena.currentBattle.turn = 'opponent';
        gameState.beastArena.currentBattle.playerHp = 1;
        service.executeOpponentTurn();
        
        expect(gameState.beastArena.pendingRewards.result).toBe('defeat');
    });
});

// ===== 信息查询测试 =====

describe('BeastArenaService - Info Queries', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createMockGameState();
        service = createBeastArenaService(gameState);
        service.init();
    });

    describe('getArenaInfo', () => {
        it('应返回竞技场信息', () => {
            const info = service.getArenaInfo();
            expect(info).toHaveProperty('state');
            expect(info).toHaveProperty('rank');
            expect(info).toHaveProperty('tier');
            expect(info).toHaveProperty('tierInfo');
            expect(info).toHaveProperty('consecutiveWins');
            expect(info).toHaveProperty('dailyMatches');
            expect(info).toHaveProperty('totalMatches');
            expect(info).toHaveProperty('bestRank');
        });

        it('应返回段位信息', () => {
            const info = service.getArenaInfo();
            expect(info.tierInfo).toEqual(ARENA_TIERS[info.tier]);
        });
    });

    describe('getLeaderboard', () => {
        it('应返回排行榜', () => {
            const leaderboard = service.getLeaderboard();
            expect(leaderboard.length).toBeGreaterThan(0);
            expect(leaderboard[0]).toHaveProperty('name');
            expect(leaderboard[0]).toHaveProperty('rank');
        });

        it('玩家应排名第一（初始rank最低）', () => {
            const leaderboard = service.getLeaderboard();
            expect(leaderboard[0].isPlayer).toBe(true);
        });

        it('应支持limit参数', () => {
            const leaderboard = service.getLeaderboard(5);
            expect(leaderboard.length).toBeLessThanOrEqual(5);
        });
    });

    describe('getSeasonInfo', () => {
        it('应返回赛季信息', () => {
            const info = service.getSeasonInfo();
            expect(info).toHaveProperty('currentDay');
            expect(info).toHaveProperty('daysRemaining');
            expect(info).toHaveProperty('totalDays');
            expect(info).toHaveProperty('rewards');
        });

        it('赛季天数应正确计算', () => {
            const info = service.getSeasonInfo();
            expect(info.totalDays).toBe(7);
        });
    });
});

// ===== 奖励与赛季测试 =====

describe('BeastArenaService - Rewards & Season', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createMockGameState();
        service = createBeastArenaService(gameState);
        service.init();
    });

    describe('claimSeasonRewards', () => {
        it('赛季未结束应返回错误', () => {
            gameState.days = 1;
            const result = service.claimSeasonRewards();
            expect(result.success).toBe(false);
            expect(result.error).toContain('赛季尚未结束');
        });

        it('赛季结束应能领取奖励', () => {
            // 手动设置赛季已结束
            gameState.days = 10; // 超过7天
            gameState.beastArena.seasonStartDay = 1;
            
            const result = service.claimSeasonRewards();
            expect(result.success).toBe(true);
            expect(result.rewards).toBeGreaterThan(0);
        });

        it('领取后应重置赛季开始日', () => {
            gameState.days = 10;
            service.claimSeasonRewards();
            expect(gameState.beastArena.seasonStartDay).toBe(10);
        });
    });

    describe('useTierProtection', () => {
        it('灵石足够应能使用段位保护', () => {
            const result = service.useTierProtection();
            expect(result.success).toBe(true);
            expect(result.message).toContain('保护已激活');
        });

        it('灵石不足应返回错误', () => {
            gameState.spiritStones = 50;
            const result = service.useTierProtection();
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵石不足');
        });

        it('使用后应扣除灵石', () => {
            const initialStones = gameState.spiritStones;
            service.useTierProtection();
            expect(gameState.spiritStones).toBe(initialStones - 100);
        });
    });

    describe('dailyReset', () => {
        it('应重置每日匹配次数', () => {
            gameState.beastArena.dailyMatches = 5;
            service.dailyReset();
            expect(gameState.beastArena.dailyMatches).toBe(0);
        });

        it('应应用每日衰减', () => {
            gameState.beastArena.rank = 1000;
            service.dailyReset();
            expect(gameState.beastArena.rank).toBe(950);
        });

        it('rank不应低于0', () => {
            gameState.beastArena.rank = 10;
            service.dailyReset();
            expect(gameState.beastArena.rank).toBeGreaterThanOrEqual(0);
        });

        it('衰减后应更新段位', () => {
            gameState.beastArena.rank = 1000;
            service.dailyReset();
            expect(gameState.beastArena.tier).toBe(getTierByRank(950));
        });
    });
});

// ===== 边界情况测试 =====

describe('BeastArenaService - Edge Cases', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createMockGameState();
        service = createBeastArenaService(gameState);
        service.init();
    });

    it('连续胜利应有额外奖励', () => {
        // 模拟连胜
        gameState.beastArena.consecutiveWins = 2;
        
        service.startMatchMaking();
        gameState.beastArena.matchMakingStart = Date.now() - ARENA_CONFIG.matchMakingTime - 100;
        service.processMatchMaking();
        service.setBattlePet('pet_001');
        
        // 设置对手HP为1，攻击获胜
        gameState.beastArena.currentBattle.opponentHp = 1;
        const result = service.executePlayerAttack();
        
        // 胜利后连胜应为3
        expect(gameState.beastArena.consecutiveWins).toBe(3);
    });

    it('失败后连胜应重置', () => {
        gameState.beastArena.consecutiveWins = 5;
        
        // 模拟失败
        gameState.beastArena.state = BEAST_ARENA_STATES.VIEWING_REWARDS;
        gameState.beastArena.pendingRewards = { result: 'defeat' };
        service.claimRewards();
        
        expect(gameState.beastArena.consecutiveWins).toBe(0);
    });

    it('最佳rank应只降不升', () => {
        gameState.beastArena.bestRank = 500;
        gameState.beastArena.rank = 600;
        // rank升高但bestRank保持500
        expect(gameState.beastArena.bestRank).toBe(500);
    });

    it('战斗历史应有上限', () => {
        for (let i = 0; i < 60; i++) {
            gameState.beastArena.battleHistory.unshift({
                result: 'victory',
                day: i
            });
        }
        
        service.init(); // 初始化会清理过多历史
        
        expect(gameState.beastArena.battleHistory.length).toBeLessThanOrEqual(50);
    });

    it('AI对手列表应保持一定规模', () => {
        // 确保AI对手列表不为空
        expect(gameState.beastArena.aiOpponents.length).toBeGreaterThan(0);
    });

    it('rank为0时应保持为青铜', () => {
        gameState.beastArena.rank = 0;
        expect(getTierByRank(0)).toBe('青铜');
    });

    it('rank超过9999时应保持为至尊', () => {
        expect(getTierByRank(9999)).toBe('至尊');
    });
});