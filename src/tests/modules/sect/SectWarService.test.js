/**
 * SectWarService.test.js - 宗门大战系统测试
 * V247: 仙盟系统+宗门大战
 * 
 * 测试覆盖率目标: ≥98%
 * 测试通过率目标: 100%
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    createSectWarService,
    SECT_WAR_CONFIG,
    SECT_WAR_OUTCOMES,
    SECT_LEVEL_COMBAT_BONUS,
    IMMORTAL_SECT_LEVELS,
    IMMORTAL_SECT_POSITIONS,
    IMMORTAL_SECT_SKILLS,
    createSectMemberContribution
} from '../../../domains/sect/services/SectWarService.js';

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
        realm: 5,
        days: 1,
        sect: null,
        immortalSect: {
            name: null,
            level: 1,
            members: [],
            skills: { cultivation: 0, spiritStones: 0, combat: 0 },
            contributions: {},
            foundedAt: null,
            leaderId: null
        },
        sectWars: {
            wars: [],
            pendingWars: [],
            warHistory: [],
            territories: [],
            cooldowns: {}
        },
        ...overrides
    };
}

/**
 * 创建测试用宗门
 */
function createMockSect(name = '测试宗门', level = 1) {
    return {
        name: name,
        level: level,
        spiritStones: 10000,
        disciples: [
            { uid: 'd_001', name: '弟子甲', realm: 3, status: 'idle', attack: 10, defense: 5, maxHp: 50 },
            { uid: 'd_002', name: '弟子乙', realm: 2, status: 'idle', attack: 8, defense: 4, maxHp: 40 },
            { uid: 'd_003', name: '弟子丙', realm: 4, status: 'idle', attack: 12, defense: 6, maxHp: 60 },
            { uid: 'd_004', name: '弟子丁', realm: 1, status: 'dispatched', attack: 5, defense: 3, maxHp: 30 }
        ],
        elders: [],
        buildings: { library: false, alchemy: false, forge: false, archive: false },
        lastResourceCollection: 0
    };
}

// ===== 常量验证测试 =====

describe('SectWarService Constants', () => {
    describe('SECT_WAR_CONFIG', () => {
        it('应有正确的宣战消耗', () => {
            expect(SECT_WAR_CONFIG.declareWarCost).toBe(5000);
        });

        it('应有正确的应战消耗', () => {
            expect(SECT_WAR_CONFIG.acceptWarCost).toBe(2000);
        });

        it('应有正确的战斗持续时间', () => {
            expect(SECT_WAR_CONFIG.battleDuration).toBe(10);
        });

        it('应有正确的备战时间', () => {
            expect(SECT_WAR_CONFIG.preparationTime).toBe(3);
        });

        it('应有正确的最低参战成员数', () => {
            expect(SECT_WAR_CONFIG.minBattleMembers).toBe(3);
        });

        it('应有正确的冷却时间', () => {
            expect(SECT_WAR_CONFIG.cooldownDays).toBe(7);
        });
    });

    describe('SECT_WAR_OUTCOMES', () => {
        it('应有胜利、失败、平局三种结果', () => {
            expect(SECT_WAR_OUTCOMES.victory).toBeDefined();
            expect(SECT_WAR_OUTCOMES.defeat).toBeDefined();
            expect(SECT_WAR_OUTCOMES.draw).toBeDefined();
        });

        it('胜利奖励应正确', () => {
            expect(SECT_WAR_OUTCOMES.victory.rewards.spiritStones).toBe(1000);
            expect(SECT_WAR_OUTCOMES.victory.rewards.contribution).toBe(500);
            expect(SECT_WAR_OUTCOMES.victory.rewards.territory).toBe(1);
        });

        it('失败奖励应正确', () => {
            expect(SECT_WAR_OUTCOMES.defeat.rewards.spiritStones).toBe(200);
            expect(SECT_WAR_OUTCOMES.defeat.rewards.contribution).toBe(100);
        });

        it('平局奖励应正确', () => {
            expect(SECT_WAR_OUTCOMES.draw.rewards.spiritStones).toBe(500);
            expect(SECT_WAR_OUTCOMES.draw.rewards.contribution).toBe(250);
        });
    });

    describe('SECT_LEVEL_COMBAT_BONUS', () => {
        it('应有1-10级战斗力加成配置', () => {
            expect(Object.keys(SECT_LEVEL_COMBAT_BONUS).length).toBe(10);
        });

        it('每级应有attack、defense、income属性', () => {
            for (let i = 1; i <= 10; i++) {
                expect(SECT_LEVEL_COMBAT_BONUS[i]).toHaveProperty('attack');
                expect(SECT_LEVEL_COMBAT_BONUS[i]).toHaveProperty('defense');
                expect(SECT_LEVEL_COMBAT_BONUS[i]).toHaveProperty('income');
            }
        });

        it('10级应有最大加成2.5', () => {
            expect(SECT_LEVEL_COMBAT_BONUS[10].attack).toBe(2.5);
        });
    });

    describe('IMMORTAL_SECT_LEVELS', () => {
        it('应有1-10级仙盟等级配置', () => {
            expect(Object.keys(IMMORTAL_SECT_LEVELS).length).toBe(10);
        });

        it('每级应有memberLimit和skillBonus', () => {
            for (let i = 1; i <= 10; i++) {
                expect(IMMORTAL_SECT_LEVELS[i]).toHaveProperty('memberLimit');
                expect(IMMORTAL_SECT_LEVELS[i]).toHaveProperty('skillBonus');
            }
        });

        it('1级成员上限应为10', () => {
            expect(IMMORTAL_SECT_LEVELS[1].memberLimit).toBe(10);
        });

        it('10级成员上限应为200', () => {
            expect(IMMORTAL_SECT_LEVELS[10].memberLimit).toBe(200);
        });

        it('10级技能加成应为1.50', () => {
            expect(IMMORTAL_SECT_LEVELS[10].skillBonus).toBe(1.50);
        });
    });

    describe('IMMORTAL_SECT_POSITIONS', () => {
        it('应有5个职位', () => {
            expect(IMMORTAL_SECT_POSITIONS).toEqual(['盟主', '副盟主', '长老', '精英', '弟子']);
        });
    });

    describe('IMMORTAL_SECT_SKILLS', () => {
        it('应有3种技能类型', () => {
            expect(Object.keys(IMMORTAL_SECT_SKILLS).length).toBe(3);
        });

        it('应有cultivation、spiritStones、combat技能', () => {
            expect(IMMORTAL_SECT_SKILLS.cultivation).toBeDefined();
            expect(IMMORTAL_SECT_SKILLS.spiritStones).toBeDefined();
            expect(IMMORTAL_SECT_SKILLS.combat).toBeDefined();
        });

        it('每种技能应有name、bonus、cost属性', () => {
            for (const skill of Object.values(IMMORTAL_SECT_SKILLS)) {
                expect(skill).toHaveProperty('name');
                expect(skill).toHaveProperty('bonus');
                expect(skill).toHaveProperty('cost');
            }
        });
    });
});

// ===== 服务初始化测试 =====

describe('SectWarService Initialization', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createMockGameState();
        service = createSectWarService(gameState);
    });

    it('应创建服务实例', () => {
        expect(service).toBeDefined();
        expect(service.gameState).toBe(gameState);
    });

    it('init应初始化sectWars', () => {
        const result = service.init(gameState);
        expect(result.sectWars).toBeDefined();
        expect(result.sectWars.wars).toEqual([]);
        expect(result.sectWars.pendingWars).toEqual([]);
        expect(result.sectWars.warHistory).toEqual([]);
        expect(result.sectWars.territories).toEqual([]);
        expect(result.sectWars.cooldowns).toEqual({});
    });

    it('init应初始化immortalSect', () => {
        const result = service.init(gameState);
        expect(result.immortalSect).toBeDefined();
        expect(result.immortalSect.name).toBeNull();
        expect(result.immortalSect.level).toBe(1);
    });

    it('重复init不应覆盖已有数据', () => {
        service.init(gameState);
        gameState.sectWars.wars.push({ warId: 'test_war' });
        service.init(gameState);
        expect(gameState.sectWars.wars.length).toBe(1);
    });
});

// ===== 仙盟系统测试 =====

describe('SectWarService - Immortal Sect (仙盟系统)', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createMockGameState();
        service = createSectWarService(gameState);
        service.init(gameState);
    });

    describe('createImmortalSect', () => {
        it('应能创建仙盟', () => {
            const result = service.createImmortalSect('测试仙盟');
            
            expect(result.success).toBe(true);
            expect(result.message).toContain('测试仙盟');
            expect(result.sect).toBeDefined();
        });

        it('创建后immortalSect应有正确数据', () => {
            service.createImmortalSect('测试仙盟');
            
            expect(gameState.immortalSect.name).toBe('测试仙盟');
            expect(gameState.immortalSect.level).toBe(1);
            expect(gameState.immortalSect.leaderId).toBe('player_001');
            expect(gameState.immortalSect.members.length).toBe(1);
            expect(gameState.immortalSect.members[0].role).toBe('盟主');
        });

        it('境界不足应返回错误', () => {
            gameState.realm = 3; // 金丹期
            const result = service.createImmortalSect('测试仙盟');
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('元婴期');
        });

        it('名称过短应返回错误', () => {
            const result = service.createImmortalSect('A');
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('2个字符');
        });

        it('名称过长应返回错误', () => {
            const result = service.createImmortalSect('这是一个非常非常非常长的名称超过二十个字');
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('20个字符');
        });

        it('已有仙盟应返回错误', () => {
            service.createImmortalSect('第一个仙盟');
            const result = service.createImmortalSect('第二个仙盟');
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('已创建或加入');
        });

        it('灵石不足应返回错误', () => {
            gameState.spiritStones = 100;
            const result = service.createImmortalSect('测试仙盟');
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵石不足');
        });

        it('创建后应扣除灵石', () => {
            const initialStones = gameState.spiritStones;
            service.createImmortalSect('测试仙盟');
            
            expect(gameState.spiritStones).toBeLessThan(initialStones);
        });
    });

    describe('joinImmortalSect', () => {
        it('应能加入仙盟', () => {
            const result = service.joinImmortalSect('目标仙盟');
            
            expect(result.success).toBe(true);
            expect(result.message).toContain('目标仙盟');
        });

        it('加入后应为弟子职位', () => {
            service.joinImmortalSect('目标仙盟');
            
            expect(gameState.immortalSect.members[0].role).toBe('弟子');
        });

        it('已有仙盟应返回错误', () => {
            service.createImmortalSect('已有仙盟');
            const result = service.joinImmortalSect('另一个仙盟');
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('已创建或加入');
        });

        it('灵石不足应返回错误', () => {
            gameState.spiritStones = 100;
            const result = service.joinImmortalSect('目标仙盟');
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵石不足');
        });
    });

    describe('leaveImmortalSect', () => {
        it('应能离开仙盟', () => {
            service.createImmortalSect('测试仙盟');
            const result = service.leaveImmortalSect();
            
            expect(result.success).toBe(true);
        });

        it('离开后仙盟名应为null', () => {
            service.createImmortalSect('测试仙盟');
            service.leaveImmortalSect();
            
            expect(gameState.immortalSect.name).toBeNull();
        });

        it('未加入仙盟应返回错误', () => {
            const result = service.leaveImmortalSect();
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('未加入');
        });

        it('盟主不能离开仙盟', () => {
            service.createImmortalSect('测试仙盟');
            const result = service.leaveImmortalSect();
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('盟主无法离开');
        });
    });

    describe('assignImmortalSectRank', () => {
        beforeEach(() => {
            service.createImmortalSect('测试仙盟');
        });

        it('盟主应能任命职位', () => {
            const result = service.assignImmortalSectRank('player_001', '副盟主');
            
            expect(result.success).toBe(true);
        });

        it('非盟主应返回错误', () => {
            gameState.player.uid = 'other_player';
            const result = service.assignImmortalSectRank('player_001', '副盟主');
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('只有盟主');
        });

        it('无效职位应返回错误', () => {
            const result = service.assignImmortalSectRank('player_001', '无效职位');
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('无效');
        });
    });

    describe('getImmortalSectInfo', () => {
        it('未创建仙盟应返回null', () => {
            expect(service.getImmortalSectInfo()).toBeNull();
        });

        it('创建后应返回仙盟信息', () => {
            service.createImmortalSect('测试仙盟');
            const info = service.getImmortalSectInfo();
            
            expect(info).toBeDefined();
            expect(info.name).toBe('测试仙盟');
            expect(info.level).toBe(1);
            expect(info.memberCount).toBe(1);
        });

        it('应包含成员上限和技能加成', () => {
            service.createImmortalSect('测试仙盟');
            const info = service.getImmortalSectInfo();
            
            expect(info.memberLimit).toBeDefined();
            expect(info.skillBonus).toBeDefined();
        });
    });

    describe('upgradeImmortalSect', () => {
        beforeEach(() => {
            service.createImmortalSect('测试仙盟');
        });

        it('应能升级仙盟', () => {
            const result = service.upgradeImmortalSect();
            
            expect(result.success).toBe(true);
            expect(result.newLevel).toBe(2);
        });

        it('升级后等级应正确', () => {
            service.upgradeImmortalSect();
            
            expect(gameState.immortalSect.level).toBe(2);
        });

        it('灵石不足应返回错误', () => {
            gameState.spiritStones = 100;
            const result = service.upgradeImmortalSect();
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵石不足');
        });

        it('已达最高级应返回错误', () => {
            gameState.immortalSect.level = 10;
            const result = service.upgradeImmortalSect();
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('最高等级');
        });
    });

    describe('learnImmortalSectSkill', () => {
        beforeEach(() => {
            service.createImmortalSect('测试仙盟');
        });

        it('应能学习技能', () => {
            const result = service.learnImmortalSectSkill('cultivation');
            
            expect(result.success).toBe(true);
            expect(result.skillLevel).toBe(1);
        });

        it('学习后技能等级应正确', () => {
            service.learnImmortalSectSkill('cultivation');
            
            expect(gameState.immortalSect.skills.cultivation).toBe(1);
        });

        it('无效技能应返回错误', () => {
            const result = service.learnImmortalSectSkill('invalid');
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('无效');
        });

        it('已达最高级应返回错误', () => {
            gameState.immortalSect.skills.cultivation = 5;
            const result = service.learnImmortalSectSkill('cultivation');
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('最高等级');
        });

        it('灵石不足应返回错误', () => {
            gameState.spiritStones = 100;
            const result = service.learnImmortalSectSkill('cultivation');
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵石不足');
        });
    });

    describe('contributeToImmortalSect', () => {
        beforeEach(() => {
            service.createImmortalSect('测试仙盟');
        });

        it('应能贡献灵石', () => {
            const result = service.contributeToImmortalSect(1000);
            
            expect(result.success).toBe(true);
            expect(result.totalContribution).toBe(1000);
        });

        it('贡献后灵石应扣除', () => {
            const initialStones = gameState.spiritStones;
            service.contributeToImmortalSect(1000);
            
            expect(gameState.spiritStones).toBe(initialStones - 1000);
        });

        it('无效数量应返回错误', () => {
            const result = service.contributeToImmortalSect(-100);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('大于0');
        });

        it('灵石不足应返回错误', () => {
            gameState.spiritStones = 100;
            const result = service.contributeToImmortalSect(1000);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵石不足');
        });
    });

    describe('getImmortalSectMembers', () => {
        it('未创建仙盟应返回空数组', () => {
            expect(service.getImmortalSectMembers()).toEqual([]);
        });

        it('创建后应有成员', () => {
            service.createImmortalSect('测试仙盟');
            const members = service.getImmortalSectMembers();
            
            expect(members.length).toBe(1);
            expect(members[0].role).toBe('盟主');
        });
    });
});

// ===== 宗门大战系统测试 =====

describe('SectWarService - Sect War (宗门大战)', () => {
    let gameState;
    let service;

    beforeEach(() => {
        gameState = createMockGameState();
        gameState.sect = createMockSect();
        service = createSectWarService(gameState);
        service.init(gameState);
    });

    describe('declareWar', () => {
        it('应能宣战', () => {
            const result = service.declareWar('敌对宗门');
            
            expect(result.success).toBe(true);
            expect(result.warId).toBeDefined();
        });

        it('宣战后wars中应有记录', () => {
            service.declareWar('敌对宗门');
            
            expect(gameState.sectWars.wars.length).toBe(1);
        });

        it('宣战后pendingWars中应有记录', () => {
            service.declareWar('敌对宗门');
            
            expect(gameState.sectWars.pendingWars.length).toBe(1);
        });

        it('无宗门应返回错误', () => {
            gameState.sect = null;
            const result = service.declareWar('敌对宗门');
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('没有创建宗门');
        });

        it('灵石不足应返回错误', () => {
            gameState.spiritStones = 100;
            const result = service.declareWar('敌对宗门');
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵石不足');
        });

        it('成员不足应返回错误', () => {
            gameState.sect.disciples = [
                { uid: 'd_001', name: '弟子甲', realm: 3, status: 'dispatched' }
            ];
            const result = service.declareWar('敌对宗门');
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('至少需要');
        });

        it('冷却中应返回错误', () => {
            service.declareWar('敌对宗门');
            gameState.days = 1;
            gameState.sectWars.cooldowns['测试宗门'] = 1;
            
            const result = service.declareWar('另一个宗门');
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('冷却中');
        });

        it('宣战后应扣除灵石', () => {
            const initialStones = gameState.spiritStones;
            service.declareWar('敌对宗门');
            
            expect(gameState.spiritStones).toBe(initialStones - SECT_WAR_CONFIG.declareWarCost);
        });

        it('宣战后状态应为pending', () => {
            service.declareWar('敌对宗门');
            
            expect(gameState.sectWars.wars[0].status).toBe('pending');
        });
    });

    describe('acceptWar', () => {
        beforeEach(() => {
            service.declareWar('敌对宗门');
            gameState.sect = createMockSect('防守方宗门');
            gameState.days = 1;
        });

        it('应能应战', () => {
            const warId = gameState.sectWars.wars[0].warId;
            const result = service.acceptWar(warId);
            
            expect(result.success).toBe(true);
        });

        it('应战后状态应变为preparing', () => {
            const warId = gameState.sectWars.wars[0].warId;
            service.acceptWar(warId);
            
            expect(gameState.sectWars.wars[0].status).toBe('preparing');
        });

        it('应战后pendingWars应清空', () => {
            const warId = gameState.sectWars.wars[0].warId;
            service.acceptWar(warId);
            
            expect(gameState.sectWars.pendingWars.length).toBe(0);
        });

        it('无效warId应返回错误', () => {
            const result = service.acceptWar('invalid_war_id');
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('不存在');
        });

        it('非pending状态应返回错误', () => {
            const warId = gameState.sectWars.wars[0].warId;
            gameState.sectWars.wars[0].status = 'preparing';
            
            const result = service.acceptWar(warId);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('状态已变更');
        });
    });

    describe('rejectWar', () => {
        beforeEach(() => {
            service.declareWar('敌对宗门');
        });

        it('应能拒绝应战', () => {
            const warId = gameState.sectWars.wars[0].warId;
            const result = service.rejectWar(warId);
            
            expect(result.success).toBe(true);
        });

        it('拒绝后状态应为rejected', () => {
            const warId = gameState.sectWars.wars[0].warId;
            service.rejectWar(warId);
            
            expect(gameState.sectWars.wars[0].status).toBe('rejected');
        });
    });

    describe('calculateSectPower', () => {
        it('应正确计算战斗力', () => {
            const sect = createMockSect('测试', 2);
            const power = service.calculateSectPower(sect);
            
            expect(power).toBeGreaterThan(0);
        });

        it('无弟子应返回0', () => {
            const sect = createMockSect();
            sect.disciples = [];
            const power = service.calculateSectPower(sect);
            
            expect(power).toBe(0);
        });

        it('等级加成应生效', () => {
            const sect1 = createMockSect('测试', 1);
            const sect5 = createMockSect('测试', 5);
            const power1 = service.calculateSectPower(sect1);
            const power5 = service.calculateSectPower(sect5);
            
            expect(power5).toBeGreaterThan(power1);
        });
    });

    describe('startBattle', () => {
        beforeEach(() => {
            service.declareWar('敌对宗门');
            const warId = gameState.sectWars.wars[0].warId;
            service.acceptWar(warId);
            gameState.days = 4; // 超过备战时间
        });

        it('应能开始战斗', () => {
            const warId = gameState.sectWars.wars[0].warId;
            const result = service.startBattle(warId);
            
            expect(result.success).toBe(true);
        });

        it('开始后状态应为active', () => {
            const warId = gameState.sectWars.wars[0].warId;
            service.startBattle(warId);
            
            expect(gameState.sectWars.wars[0].status).toBe('active');
        });

        it('开始后应有战斗回合', () => {
            const warId = gameState.sectWars.wars[0].warId;
            service.startBattle(warId);
            
            expect(gameState.sectWars.wars[0].rounds.length).toBeGreaterThan(0);
        });

        it('备战未结束应返回错误', () => {
            gameState.days = 3;
            const warId = gameState.sectWars.wars[0].warId;
            const result = service.startBattle(warId);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('备战尚未结束');
        });
    });

    describe('generateBattleRound', () => {
        beforeEach(() => {
            service.declareWar('敌对宗门');
            const warId = gameState.sectWars.wars[0].warId;
            service.acceptWar(warId);
            gameState.days = 4;
            service.startBattle(warId);
        });

        it('应能生成战斗回合', () => {
            const warRecord = gameState.sectWars.wars[0];
            const round = service.generateBattleRound(warRecord, 1);
            
            expect(round).toBeDefined();
            expect(round.round).toBe(1);
            expect(round.result).toBeDefined();
        });

        it('回合结果应为attacker_win/defender_win/draw之一', () => {
            const warRecord = gameState.sectWars.wars[0];
            for (let i = 0; i < 10; i++) {
                const round = service.generateBattleRound(warRecord, i + 1);
                expect(['attacker_win', 'defender_win', 'draw']).toContain(round.result);
            }
        });
    });

    describe('finishBattle', () => {
        beforeEach(() => {
            service.declareWar('敌对宗门');
            const warId = gameState.sectWars.wars[0].warId;
            service.acceptWar(warId);
            gameState.days = 4;
            service.startBattle(warId);
            // 添加多个回合
            const warRecord = gameState.sectWars.wars[0];
            for (let i = 1; i <= 5; i++) {
                warRecord.rounds.push(service.generateBattleRound(warRecord, i));
            }
            warRecord.battleEndDay = 1; // 设置为已结束
        });

        it('应能结束战斗', () => {
            const warId = gameState.sectWars.wars[0].warId;
            const result = service.finishBattle(warId);
            
            expect(result.success).toBe(true);
            expect(result.outcome).toBeDefined();
        });

        it('结束后状态应为finished', () => {
            const warId = gameState.sectWars.wars[0].warId;
            service.finishBattle(warId);
            
            expect(gameState.sectWars.wars[0].status).toBe('finished');
        });

        it('结束后应有奖励', () => {
            const warId = gameState.sectWars.wars[0].warId;
            service.finishBattle(warId);
            
            expect(gameState.sectWars.wars[0].rewards).toBeDefined();
        });

        it('结束后warHistory应有记录', () => {
            const warId = gameState.sectWars.wars[0].warId;
            service.finishBattle(warId);
            
            expect(gameState.sectWars.warHistory.length).toBeGreaterThan(0);
        });
    });

    describe('generateBattleReport', () => {
        beforeEach(() => {
            service.declareWar('敌对宗门');
            const warId = gameState.sectWars.wars[0].warId;
            service.acceptWar(warId);
            gameState.days = 4;
            service.startBattle(warId);
            const warRecord = gameState.sectWars.wars[0];
            for (let i = 1; i <= 5; i++) {
                warRecord.rounds.push(service.generateBattleRound(warRecord, i));
            }
            warRecord.battleEndDay = 1;
            service.finishBattle(warId);
        });

        it('应生成战斗报告', () => {
            const warRecord = gameState.sectWars.wars[0];
            const report = service.generateBattleReport(warRecord);
            
            expect(report).toBeDefined();
            expect(report.warId).toBeDefined();
            expect(report.outcome).toBeDefined();
            expect(report.attacker).toBeDefined();
            expect(report.defender).toBeDefined();
        });

        it('报告应包含双方信息', () => {
            const warRecord = gameState.sectWars.wars[0];
            const report = service.generateBattleReport(warRecord);
            
            expect(report.attacker.sectName).toBeDefined();
            expect(report.defender.sectName).toBeDefined();
        });
    });

    describe('getPendingWars', () => {
        it('初始应返回空数组', () => {
            expect(service.getPendingWars()).toEqual([]);
        });

        it('宣战后应返回待应战列表', () => {
            service.declareWar('敌对宗门');
            
            expect(service.getPendingWars().length).toBe(1);
        });

        it('应战后应返回空数组', () => {
            service.declareWar('敌对宗门');
            const warId = gameState.sectWars.wars[0].warId;
            service.acceptWar(warId);
            
            expect(service.getPendingWars()).toEqual([]);
        });
    });

    describe('getWarDetails', () => {
        beforeEach(() => {
            service.declareWar('敌对宗门');
            const warId = gameState.sectWars.wars[0].warId;
            service.acceptWar(warId);
        });

        it('应返回大战详情', () => {
            const warId = gameState.sectWars.wars[0].warId;
            const details = service.getWarDetails(warId);
            
            expect(details).toBeDefined();
            expect(details.warId).toBe(warId);
        });

        it('应包含攻防双方信息', () => {
            const warId = gameState.sectWars.wars[0].warId;
            const details = service.getWarDetails(warId);
            
            expect(details.attacker).toBeDefined();
            expect(details.defender).toBeDefined();
        });

        it('无效warId应返回null', () => {
            const details = service.getWarDetails('invalid');
            
            expect(details).toBeNull();
        });
    });

    describe('getWarHistory', () => {
        it('初始应返回空数组', () => {
            expect(service.getWarHistory()).toEqual([]);
        });

        it('应返回最近N条记录', () => {
            const result = service.getWarHistory(5);
            
            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('processDailyWarTick', () => {
        beforeEach(() => {
            service.declareWar('敌对宗门');
            const warId = gameState.sectWars.wars[0].warId;
            service.acceptWar(warId);
            gameState.days = 4;
            service.startBattle(warId);
        });

        it('应处理每日战斗回合', () => {
            const result = service.processDailyWarTick();
            
            expect(result).toBeDefined();
            expect(result.processedWars).toBeGreaterThanOrEqual(0);
        });

        it('战斗结束的war应自动结束', () => {
            const warRecord = gameState.sectWars.wars[0];
            warRecord.battleEndDay = 1;
            
            const result = service.processDailyWarTick();
            
            expect(result.results[0].success).toBe(true);
        });
    });
});

// ===== 辅助函数测试 =====

describe('createSectMemberContribution', () => {
    it('应创建正确的贡献度记录', () => {
        const contribution = createSectMemberContribution('uid_001', 100, '弟子');
        
        expect(contribution.uid).toBe('uid_001');
        expect(contribution.contribution).toBe(100);
        expect(contribution.rank).toBe('弟子');
        expect(contribution.totalContributed).toBe(0);
        expect(contribution.weeklyContributed).toBe(0);
    });

    it('应有默认值为0', () => {
        const contribution = createSectMemberContribution('uid_001');
        
        expect(contribution.contribution).toBe(0);
        expect(contribution.rank).toBe('弟子');
    });

    it('应记录加入时间', () => {
        const before = Date.now();
        const contribution = createSectMemberContribution('uid_001');
        const after = Date.now();
        
        expect(contribution.joinDate).toBeGreaterThanOrEqual(before);
        expect(contribution.joinDate).toBeLessThanOrEqual(after);
    });
});