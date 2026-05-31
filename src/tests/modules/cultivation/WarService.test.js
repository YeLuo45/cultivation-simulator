/**
 * WarService.test.js - 万界战争系统测试
 * V234 Direction V: 万界战争系统 - TDD测试
 * 
 * 测试覆盖率目标: ≥98%
 * 测试通过率目标: 100%
 * 测试用例数量: ≥40
 */

import {
    createWarService,
    getWarService,
    REALM_WARFARE_CONFIG,
    UNIT_COUNTER_TABLE,
    WAR_STATES,
    createWarRecord,
    createArmyUnit
} from '../../../domains/cultivation/services/WarService.js';

// ===== 测试辅助函数 =====

function createMockGameState(overrides = {}) {
    const defaultState = {
        player: {
            uid: 'player_001',
            name: '测试修士',
            level: 10
        },
        spiritStones: 500000,
        realm: 5, // 化神巅峰
        stage: 2,
        sect: {
            name: '测试宗门',
            disciples: [
                { uid: 'disc_001', name: '弟子甲', realm: 3, talentIndex: 2 },
                { uid: 'disc_002', name: '弟子乙', realm: 2, talentIndex: 1 }
            ]
        },
        ascension: {
            ascended: true,
            immortalRealm: 0,
            immortalTier: 1
        },
        immortalSects: {
            sects: [],
            playerSectId: null,
            tradeHistory: [],
            allianceRecords: []
        },
        realmWarfare: {
            wars: [],
            playerWarId: null,
            totalWarsDeclared: 0,
            totalVictories: 0,
            totalDefeats: 0,
            claimedRewards: []
        }
    };
    return { ...defaultState, ...overrides };
}

// 创建测试用仙界宗门
function createTestImmortalSect(name, founderId, overrides = {}) {
    return {
        uid: 'ims_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: name,
        founder: founderId,
        sectLevel: 1,
        members: [{
            uid: founderId,
            role: 'founder',
            joinedAt: Date.now(),
            contribution: 0,
            isElite: false
        }],
        resources: {
            spiritStones: 100000,
            pills: 100,
            techniques: 50,
            merit: 500
        },
        eliteDisciples: [],
        alliances: [],
        enemies: [],
        createdAt: Date.now(),
        reputation: 100,
        activeTrades: [],
        ...overrides
    };
}

// ===== WarService 测试套件 =====

describe('WarService - 万界战争系统 V234', () => {
    let service;
    let gameState;

    beforeEach(() => {
        gameState = createMockGameState();
        service = createWarService(gameState);
        service.init(gameState);
    });

    // ===== 导出验证 =====

    describe('导出验证', () => {
        test('REALM_WARFARE_CONFIG 应正确导出', () => {
            expect(REALM_WARFARE_CONFIG).toBeDefined();
            expect(REALM_WARFARE_CONFIG.declareCost).toBe(100000);
        });

        test('UNIT_COUNTER_TABLE 应正确导出', () => {
            expect(UNIT_COUNTER_TABLE).toBeDefined();
            expect(UNIT_COUNTER_TABLE.infantry).toBeDefined();
        });

        test('WAR_STATES 应正确导出', () => {
            expect(WAR_STATES).toBeDefined();
            expect(WAR_STATES.NONE).toBe('none');
            expect(WAR_STATES.PREPARING).toBe('preparing');
        });

        test('createWarRecord 应正确导出', () => {
            const war = createWarRecord('sect_a', 'sect_b', '攻', '守');
            expect(war).toBeDefined();
            expect(war.uid).toMatch(/^war_/);
        });

        test('createArmyUnit 应正确导出', () => {
            const unit = createArmyUnit('infantry', 100);
            expect(unit).toBeDefined();
            expect(unit.type).toBe('infantry');
            expect(unit.count).toBe(100);
        });
    });

    // ===== 服务初始化 =====

    describe('服务初始化', () => {
        test('createWarService 应创建服务实例', () => {
            expect(service).toBeDefined();
            expect(typeof service.init).toBe('function');
        });

        test('init 应初始化游戏状态', () => {
            const freshState = { player: { uid: 'test' }, spiritStones: 50000 };
            const newService = createWarService(freshState);
            const result = newService.init(freshState);

            expect(result.realmWarfare).toBeDefined();
            expect(result.realmWarfare.wars).toEqual([]);
        });

        test('init 不应覆盖已存在的realmWarfare', () => {
            const existingWarfare = {
                wars: [{ uid: 'existing' }],
                playerWarId: 'existing',
                totalWarsDeclared: 5,
                totalVictories: 3,
                totalDefeats: 2,
                claimedRewards: ['war_1']
            };
            const stateWithWarfare = { realmWarfare: existingWarfare };

            service.init(stateWithWarfare);

            expect(stateWithWarfare.realmWarfare.wars).toHaveLength(1);
            expect(stateWithWarfare.realmWarfare.playerWarId).toBe('existing');
        });
    });

    // ===== 配置常量测试 =====

    describe('REALM_WARFARE_CONFIG 配置常量', () => {
        test('宣战消耗应正确', () => {
            expect(REALM_WARFARE_CONFIG.declareCost).toBe(100000);
        });

        test('准备期时长应正确', () => {
            expect(REALM_WARFARE_CONFIG.preparePhaseDuration).toBe(3600000);
        });

        test('执行期时长应正确', () => {
            expect(REALM_WARFARE_CONFIG.executePhaseDuration).toBe(1800000);
        });

        test('最大军队规模应正确', () => {
            expect(REALM_WARFARE_CONFIG.maxArmySize).toBe(1000);
        });

        test('单种兵种最大数量应正确', () => {
            expect(REALM_WARFARE_CONFIG.maxSoldiersPerType).toBe(400);
        });

        test('胜利奖励倍率应正确', () => {
            expect(REALM_WARFARE_CONFIG.victoryRewardMultiplier).toBe(1.5);
        });

        test('失败惩罚倍率应正确', () => {
            expect(REALM_WARFARE_CONFIG.defeatPenaltyMultiplier).toBe(0.5);
        });

        test('联盟支援消耗应正确', () => {
            expect(REALM_WARFARE_CONFIG.allianceSupportCost).toBe(50000);
        });

        test('应包含所有兵种类型', () => {
            expect(REALM_WARFARE_CONFIG.armyTypes).toContain('infantry');
            expect(REALM_WARFARE_CONFIG.armyTypes).toContain('cavalry');
            expect(REALM_WARFARE_CONFIG.armyTypes).toContain('archer');
            expect(REALM_WARFARE_CONFIG.armyTypes).toContain('mage');
            expect(REALM_WARFARE_CONFIG.armyTypes).toContain('guardian');
            expect(REALM_WARFARE_CONFIG.armyTypes).toHaveLength(5);
        });

        test('应包含所有战略类型', () => {
            expect(REALM_WARFARE_CONFIG.strategyTypes).toContain('aggressive');
            expect(REALM_WARFARE_CONFIG.strategyTypes).toContain('defensive');
            expect(REALM_WARFARE_CONFIG.strategyTypes).toContain('balanced');
            expect(REALM_WARFARE_CONFIG.strategyTypes).toContain('guerrilla');
            expect(REALM_WARFARE_CONFIG.strategyTypes).toContain('siege');
            expect(REALM_WARFARE_CONFIG.strategyTypes).toHaveLength(5);
        });

        test('unitStats 应包含所有兵种属性', () => {
            for (const type of REALM_WARFARE_CONFIG.armyTypes) {
                expect(REALM_WARFARE_CONFIG.unitStats[type]).toBeDefined();
                expect(REALM_WARFARE_CONFIG.unitStats[type].attack).toBeDefined();
                expect(REALM_WARFARE_CONFIG.unitStats[type].defense).toBeDefined();
                expect(REALM_WARFARE_CONFIG.unitStats[type].speed).toBeDefined();
                expect(REALM_WARFARE_CONFIG.unitStats[type].cost).toBeDefined();
            }
        });
    });

    // ===== UNIT_COUNTER_TABLE 测试 =====

    describe('UNIT_COUNTER_TABLE 兵种相克表', () => {
        test('应包含所有兵种的克制关系', () => {
            for (const type of REALM_WARFARE_CONFIG.armyTypes) {
                expect(UNIT_COUNTER_TABLE[type]).toBeDefined();
                expect(UNIT_COUNTER_TABLE[type].beats).toBeDefined();
                expect(UNIT_COUNTER_TABLE[type].weakTo).toBeDefined();
                expect(UNIT_COUNTER_TABLE[type].multiplier).toBeDefined();
            }
        });

        test('克制关系应该是相互的', () => {
            expect(UNIT_COUNTER_TABLE.infantry.beats).toBe('cavalry');
            expect(UNIT_COUNTER_TABLE.cavalry.weakTo).toBe('infantry');
        });

        test('步兵克制骑兵', () => {
            expect(UNIT_COUNTER_TABLE.infantry.beats).toBe('cavalry');
        });

        test('骑兵克制弓兵', () => {
            expect(UNIT_COUNTER_TABLE.cavalry.beats).toBe('archer');
        });

        test('弓兵克制法师', () => {
            expect(UNIT_COUNTER_TABLE.archer.beats).toBe('mage');
        });

        test('法师克制守卫', () => {
            expect(UNIT_COUNTER_TABLE.mage.beats).toBe('guardian');
        });

        test('守卫克制弓兵', () => {
            expect(UNIT_COUNTER_TABLE.guardian.beats).toBe('archer');
        });
    });

    // ===== WAR_STATES 测试 =====

    describe('WAR_STATES 战争状态', () => {
        test('应包含所有战争状态', () => {
            expect(WAR_STATES.NONE).toBe('none');
            expect(WAR_STATES.PREPARING).toBe('preparing');
            expect(WAR_STATES.EXECUTING).toBe('executing');
            expect(WAR_STATES.ENDED).toBe('ended');
        });
    });

    // ===== createWarRecord 测试 =====

    describe('createWarRecord 战争记录创建', () => {
        test('应创建正确结构的战争记录', () => {
            const war = createWarRecord('sect_a', 'sect_b', '攻击方宗门', '防守方宗门');

            expect(war.uid).toMatch(/^war_/);
            expect(war.attacker.sectId).toBe('sect_a');
            expect(war.attacker.name).toBe('攻击方宗门');
            expect(war.attacker.troops).toEqual({
                infantry: 0, cavalry: 0, archer: 0, mage: 0, guardian: 0
            });
            expect(war.attacker.strategy).toBeNull();
            expect(war.attacker.morale).toBe(100);
            expect(war.attacker.casualties).toEqual({
                infantry: 0, cavalry: 0, archer: 0, mage: 0, guardian: 0
            });

            expect(war.defender.sectId).toBe('sect_b');
            expect(war.defender.name).toBe('防守方宗门');
            expect(war.state).toBe(WAR_STATES.PREPARING);
            expect(war.winner).toBeNull();
            expect(war.battleLog).toEqual([]);
        });

        test('应生成唯一UID', () => {
            const war1 = createWarRecord('a', 'b', 'n1', 'n2');
            const war2 = createWarRecord('a', 'b', 'n1', 'n2');

            expect(war1.uid).not.toBe(war2.uid);
        });

        test('应设置正确的准备期结束时间', () => {
            const war = createWarRecord('a', 'b', 'n1', 'n2');
            expect(war.prepareEndTime).toBeDefined();
            expect(war.prepareEndTime).toBeGreaterThan(war.declareTime);
        });
    });

    // ===== createArmyUnit 测试 =====

    describe('createArmyUnit 军队单位创建', () => {
        test('应创建正确结构的军队单位', () => {
            const unit = createArmyUnit('infantry', 100);

            expect(unit.type).toBe('infantry');
            expect(unit.count).toBe(100);
            expect(unit.attack).toBe(1000); // 10 * 100
            expect(unit.defense).toBe(1500); // 15 * 100
            expect(unit.speed).toBe(5);
            expect(unit.cost).toBe(10000); // 100 * 100
        });

        test('无效兵种应返回null', () => {
            const unit = createArmyUnit('invalid', 100);
            expect(unit).toBeNull();
        });

        test('各兵种战力计算应正确', () => {
            // 骑兵: attack=20, defense=10
            const cavalry = createArmyUnit('cavalry', 50);
            expect(cavalry.attack).toBe(1000); // 20 * 50
            expect(cavalry.defense).toBe(500); // 10 * 50

            // 弓兵: attack=15, defense=5
            const archer = createArmyUnit('archer', 30);
            expect(archer.attack).toBe(450); // 15 * 30
            expect(archer.defense).toBe(150); // 5 * 30

            // 法师: attack=30, defense=5
            const mage = createArmyUnit('mage', 20);
            expect(mage.attack).toBe(600); // 30 * 20
            expect(mage.defense).toBe(100); // 5 * 20

            // 守卫: attack=5, defense=30
            const guardian = createArmyUnit('guardian', 25);
            expect(guardian.attack).toBe(125); // 5 * 25
            expect(guardian.defense).toBe(750); // 30 * 25
        });
    });

    // ===== 核心方法测试 =====

    describe('核心方法', () => {
        test('isPlayerAscended 应正确判断飞升状态', () => {
            expect(service.isPlayerAscended()).toBe(true);
            
            gameState.ascension.ascended = false;
            expect(service.isPlayerAscended()).toBe(false);
            
            delete gameState.ascension;
            expect(service.isPlayerAscended()).toBe(false);
        });

        test('getPlayerImmortalSect 应正确获取玩家宗门', () => {
            expect(service.getPlayerImmortalSect()).toBeNull();
            
            const sect = createTestImmortalSect('玩家宗门', 'player_001');
            gameState.immortalSects.sects.push(sect);
            gameState.immortalSects.playerSectId = sect.uid;
            
            const result = service.getPlayerImmortalSect();
            expect(result).toBeDefined();
            expect(result.name).toBe('玩家宗门');
        });

        test('calculateArmyPower 应正确计算战力', () => {
            const troops = {
                infantry: 100,
                cavalry: 50,
                archer: 30,
                mage: 20,
                guardian: 25
            };

            const power = service.calculateArmyPower(troops);

            // 计算验证
            // infantry: 10*100 + 15*100*0.5 = 1000 + 750 = 1750
            // cavalry: 20*50 + 10*50*0.5 = 1000 + 250 = 1250
            // archer: 15*30 + 5*30*0.5 = 450 + 75 = 525
            // mage: 30*20 + 5*20*0.5 = 600 + 50 = 650
            // guardian: 5*25 + 30*25*0.5 = 125 + 375 = 500
            // total = 1750 + 1250 + 525 + 650 + 500 = 4675
            expect(power).toBe(4675);
        });

        test('calculateArmyPower 对空军队应返回0', () => {
            const troops = { infantry: 0, cavalry: 0, archer: 0, mage: 0, guardian: 0 };
            expect(service.calculateArmyPower(troops)).toBe(0);
        });

        test('getStrategyBonus 应正确计算战略加成', () => {
            const aggressive = service.getStrategyBonus('aggressive', true);
            expect(aggressive.attackBonus).toBe(1.3);
            expect(aggressive.defenseBonus).toBe(0.8);

            const defensive = service.getStrategyBonus('defensive', false);
            expect(defensive.attackBonus).toBe(0.8);
            expect(defensive.defenseBonus).toBe(1.4);

            const guerrilla = service.getStrategyBonus('guerrilla', true);
            expect(guerrilla.speedBonus).toBe(1.5);

            const siege = service.getStrategyBonus('siege', true);
            expect(siege.attackBonus).toBe(1.5);
            expect(siege.speedBonus).toBe(0.5);

            const unknown = service.getStrategyBonus('unknown', true);
            expect(unknown.attackBonus).toBe(1.0);
            expect(unknown.defenseBonus).toBe(1.0);
        });

        test('calculateCounterBonus 应正确计算兵种相克', () => {
            // 克制加成
            const bonus = service.calculateCounterBonus('infantry', 'cavalry', 100);
            expect(bonus).toBe(150); // 1.5倍

            // 被克制惩罚
            const penalty = service.calculateCounterBonus('infantry', 'archer', 100);
            expect(penalty).toBeCloseTo(66.67, 1); // 1/1.5倍

            // 无克制
            const normal = service.calculateCounterBonus('infantry', 'mage', 100);
            expect(normal).toBe(100);
        });
    });

    // ===== getWarService 单例测试 =====

    describe('getWarService 单例模式', () => {
        test('getWarService 应返回对象', () => {
            const instance = getWarService(gameState);
            expect(instance).toBeDefined();
            expect(typeof instance.init).toBe('function');
        });

        test('getWarService 返回实例应有正确方法', () => {
            const instance = getWarService(gameState);
            expect(typeof instance.mcpWarDeclare).toBe('function');
            expect(typeof instance.mcpArmyRecruit).toBe('function');
            expect(typeof instance.mcpStrategySet).toBe('function');
            expect(typeof instance.mcpWarExecute).toBe('function');
            expect(typeof instance.mcpResultClaim).toBe('function');
            expect(typeof instance.mcpAllianceSupport).toBe('function');
            expect(typeof instance.mcpWarList).toBe('function');
            expect(typeof instance.mcpWarDetail).toBe('function');
        });

        test('单例模式应正常工作', () => {
            // createWarService 创建新实例
            const instance1 = createWarService(gameState);
            expect(instance1).toBeDefined();
            
            // 验证实例有战争相关方法
            expect(typeof instance1.calculateArmyPower).toBe('function');
            expect(typeof instance1.getStrategyBonus).toBe('function');
        });
    });
});