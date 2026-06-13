/**
 * RealmWarfareService.test.js - 万界战争系统测试
 * V234 Direction V: 万界战争系统 - TDD测试
 * 
 * 测试覆盖率目标: ≥95%
 * 测试通过率目标: 100%
 */

import {
    createRealmWarfareService,
    REALM_WARFARE_CONFIG,
    UNIT_COUNTER_TABLE,
    WAR_STATES,
    createWarRecord,
    createArmyUnit
} from '../../../domains/combat/services/RealmWarfareService.js';

// 测试辅助函数
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

describe('RealmWarfareService', () => {
    let service;
    let gameState;

    beforeEach(() => {
        gameState = createMockGameState();
        service = createRealmWarfareService(gameState);
        service.init(gameState);
    });

    describe('REALM_WARFARE_CONFIG', () => {
        test('应包含所有必需的配置项', () => {
            expect(REALM_WARFARE_CONFIG.declareCost).toBe(100000);
            expect(REALM_WARFARE_CONFIG.preparePhaseDuration).toBe(3600000);
            expect(REALM_WARFARE_CONFIG.warPhaseDuration).toBe(7200000);
            expect(REALM_WARFARE_CONFIG.executePhaseDuration).toBe(1800000);
            expect(REALM_WARFARE_CONFIG.maxArmySize).toBe(1000);
            expect(REALM_WARFARE_CONFIG.maxSoldiersPerType).toBe(400);
            expect(REALM_WARFARE_CONFIG.victoryRewardMultiplier).toBe(1.5);
            expect(REALM_WARFARE_CONFIG.defeatPenaltyMultiplier).toBe(0.5);
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

        test('unitStats应包含所有兵种的属性', () => {
            for (const type of REALM_WARFARE_CONFIG.armyTypes) {
                expect(REALM_WARFARE_CONFIG.unitStats[type]).toBeDefined();
                expect(REALM_WARFARE_CONFIG.unitStats[type].attack).toBeDefined();
                expect(REALM_WARFARE_CONFIG.unitStats[type].defense).toBeDefined();
                expect(REALM_WARFARE_CONFIG.unitStats[type].speed).toBeDefined();
                expect(REALM_WARFARE_CONFIG.unitStats[type].cost).toBeDefined();
            }
        });
    });

    describe('UNIT_COUNTER_TABLE', () => {
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
    });

    describe('WAR_STATES', () => {
        test('应包含所有战争状态', () => {
            expect(WAR_STATES.NONE).toBe('none');
            expect(WAR_STATES.PREPARING).toBe('preparing');
            expect(WAR_STATES.EXECUTING).toBe('executing');
            expect(WAR_STATES.ENDED).toBe('ended');
        });
    });

    describe('createWarRecord', () => {
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
    });

    describe('createArmyUnit', () => {
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
    });

    describe('服务初始化', () => {
        test('init应正确初始化游戏状态', () => {
            const freshState = { player: { uid: 'test' }, spiritStones: 50000 };
            const service = createRealmWarfareService(freshState);
            const result = service.init(freshState);

            expect(result.realmWarfare).toBeDefined();
            expect(result.realmWarfare.wars).toEqual([]);
            expect(result.realmWarfare.playerWarId).toBeNull();
            expect(result.realmWarfare.totalWarsDeclared).toBe(0);
            expect(result.realmWarfare.totalVictories).toBe(0);
            expect(result.realmWarfare.totalDefeats).toBe(0);
        });

        test('init不应覆盖已存在的realmWarfare', () => {
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

    describe('isPlayerAscended', () => {
        test('飞升状态应为true', () => {
            expect(service.isPlayerAscended()).toBe(true);
        });

        test('未飞升时应返回false', () => {
            gameState.ascension.ascended = false;
            expect(service.isPlayerAscended()).toBe(false);
        });

        test('无ascension字段时应返回false', () => {
            delete gameState.ascension;
            expect(service.isPlayerAscended()).toBe(false);
        });
    });

    describe('getPlayerImmortalSect', () => {
        test('无宗门时应返回null', () => {
            expect(service.getPlayerImmortalSect()).toBeNull();
        });

        test('有宗门时应返回正确宗门', () => {
            const sect = createTestImmortalSect('玩家宗门', 'player_001');
            gameState.immortalSects.sects.push(sect);
            gameState.immortalSects.playerSectId = sect.uid;

            const result = service.getPlayerImmortalSect();

            expect(result).toBeDefined();
            expect(result.name).toBe('玩家宗门');
        });
    });

    describe('calculateArmyPower', () => {
        test('应正确计算军队总战力', () => {
            const troops = {
                infantry: 100,
                cavalry: 50,
                archer: 30,
                mage: 20,
                guardian: 25
            };

            const power = service.calculateArmyPower(troops);

            // infantry: 10*100 + 15*100*0.5 = 1000 + 750 = 1750
            // cavalry: 20*50 + 10*50*0.5 = 1000 + 250 = 1250
            // archer: 15*30 + 5*30*0.5 = 450 + 75 = 525
            // mage: 30*20 + 5*20*0.5 = 600 + 50 = 650
            // guardian: 5*25 + 30*25*0.5 = 125 + 375 = 500
            // total = 1750 + 1250 + 525 + 650 + 500 = 4675
            expect(power).toBe(4675);
        });

        test('空军队应返回0', () => {
            const troops = { infantry: 0, cavalry: 0, archer: 0, mage: 0, guardian: 0 };
            expect(service.calculateArmyPower(troops)).toBe(0);
        });
    });

    describe('getStrategyBonus', () => {
        test('aggressive战略应增加攻击', () => {
            const bonus = service.getStrategyBonus('aggressive', true);
            expect(bonus.attackBonus).toBe(1.3);
            expect(bonus.defenseBonus).toBe(0.8);
        });

        test('defensive战略应增加防御', () => {
            const bonus = service.getStrategyBonus('defensive', false);
            expect(bonus.attackBonus).toBe(0.8);
            expect(bonus.defenseBonus).toBe(1.4);
        });

        test('guerrilla战略应增加速度', () => {
            const bonus = service.getStrategyBonus('guerrilla', true);
            expect(bonus.speedBonus).toBe(1.5);
        });

        test('siege战略应大幅增加攻击但降低速度', () => {
            const bonus = service.getStrategyBonus('siege', true);
            expect(bonus.attackBonus).toBe(1.5);
            expect(bonus.speedBonus).toBe(0.5);
        });

        test('未知战略应返回balanced默认值', () => {
            const bonus = service.getStrategyBonus('unknown', true);
            expect(bonus.attackBonus).toBe(1.0);
            expect(bonus.defenseBonus).toBe(1.0);
        });
    });

    describe('calculateCounterBonus', () => {
        test('克制时应有加成', () => {
            const damage = service.calculateCounterBonus('infantry', 'cavalry', 100);
            expect(damage).toBe(150); // 1.5倍
        });

        test('被克制时应该有惩罚', () => {
            const damage = service.calculateCounterBonus('infantry', 'archer', 100);
            expect(damage).toBeCloseTo(66.67, 1); // 1/1.5倍
        });

        test('无克制关系时应返回原伤害', () => {
            const damage = service.calculateCounterBonus('infantry', 'mage', 100);
            expect(damage).toBe(100);
        });
    });

    describe('mcpWarDeclare - 宣战', () => {
        let attackerSect;
        let defenderSect;

        beforeEach(() => {
            attackerSect = createTestImmortalSect('攻击方', 'player_001');
            defenderSect = createTestImmortalSect('防守方', 'enemy_001');
            gameState.immortalSects.sects.push(attackerSect, defenderSect);
            gameState.immortalSects.playerSectId = attackerSect.uid;
        });

        test('成功宣战', () => {
            const result = service.mcpWarDeclare({ targetSectId: defenderSect.uid });

            expect(result.success).toBe(true);
            expect(result.message).toContain('防守方');
            expect(result.war.attacker).toBe('攻击方');
            expect(result.war.defender).toBe('防守方');
            expect(result.war.state).toBe(WAR_STATES.PREPARING);
            expect(result.war.costDeducted).toBe(100000);
            expect(gameState.spiritStones).toBe(400000); // 500000 - 100000
        });

        test('未飞升时宣战失败', () => {
            gameState.ascension.ascended = false;

            const result = service.mcpWarDeclare({ targetSectId: defenderSect.uid });

            expect(result.success).toBe(false);
            expect(result.error).toContain('尚未飞升');
        });

        test('无宗门时宣战失败', () => {
            gameState.immortalSects.playerSectId = null;

            const result = service.mcpWarDeclare({ targetSectId: defenderSect.uid });

            expect(result.success).toBe(false);
            expect(result.error).toContain('未加入任何仙界宗门');
        });

        test('已有参与战争时宣战失败', () => {
            // 先发动一场战争
            service.mcpWarDeclare({ targetSectId: defenderSect.uid });

            // 再创建另一个目标宗门
            const anotherSect = createTestImmortalSect('另一个宗门', 'another');
            gameState.immortalSects.sects.push(anotherSect);

            const result = service.mcpWarDeclare({ targetSectId: anotherSect.uid });

            expect(result.success).toBe(false);
            expect(result.error).toContain('已参与一场战争');
        });

        test('对自己宣战时失败', () => {
            const result = service.mcpWarDeclare({ targetSectId: attackerSect.uid });

            expect(result.success).toBe(false);
            expect(result.error).toContain('不能对自己的宗门宣战');
        });

        test('目标宗门不存在时失败', () => {
            const result = service.mcpWarDeclare({ targetSectId: 'non_existent' });

            expect(result.success).toBe(false);
            expect(result.error).toContain('目标仙界宗门不存在');
        });

        test('灵石不足时失败', () => {
            gameState.spiritStones = 10000;

            const result = service.mcpWarDeclare({ targetSectId: defenderSect.uid });

            expect(result.success).toBe(false);
            expect(result.error).toContain('灵石不足');
        });

        test('宗门资源不足时失败', () => {
            attackerSect.resources.spiritStones = 10000;

            const result = service.mcpWarDeclare({ targetSectId: defenderSect.uid });

            expect(result.success).toBe(false);
            expect(result.error).toContain('宗门资源不足');
        });

        test('敌对宗门无法宣战', () => {
            attackerSect.enemies.push(defenderSect.uid);

            const result = service.mcpWarDeclare({ targetSectId: defenderSect.uid });

            expect(result.success).toBe(false);
            expect(result.error).toContain('敌对名单');
        });
    });

    describe('mcpArmyRecruit - 招募军队', () => {
        let playerSect;
        let defenderSect;
        let war;

        beforeEach(() => {
            playerSect = createTestImmortalSect('玩家宗门', 'player_001');
            defenderSect = createTestImmortalSect('防守方', 'enemy_001');
            gameState.immortalSects.sects.push(playerSect, defenderSect);
            gameState.immortalSects.playerSectId = playerSect.uid;

            // 先发动战争
            war = service.mcpWarDeclare({ targetSectId: defenderSect.uid });
        });

        test('成功招募步兵', () => {
            const result = service.mcpArmyRecruit({ unitType: 'infantry', count: 100 });

            expect(result.success).toBe(true);
            expect(result.message).toContain('100');
            expect(result.recruitment.unitType).toBe('infantry');
            expect(result.recruitment.count).toBe(100);
            expect(result.armyStatus.totalSize).toBe(100);
        });

        test('成功招募多种兵种', () => {
            service.mcpArmyRecruit({ unitType: 'infantry', count: 100 });
            service.mcpArmyRecruit({ unitType: 'cavalry', count: 50 });
            service.mcpArmyRecruit({ unitType: 'archer', count: 30 });

            const war = service.getPlayerWar();
            expect(war.attacker.troops.infantry).toBe(100);
            expect(war.attacker.troops.cavalry).toBe(50);
            expect(war.attacker.troops.archer).toBe(30);
        });

        test('无战争时招募失败', () => {
            // 结束战争
            gameState.realmWarfare.playerWarId = null;

            const result = service.mcpArmyRecruit({ unitType: 'infantry', count: 100 });

            expect(result.success).toBe(false);
            expect(result.error).toContain('没有参与任何战争');
        });

        test('战争非准备期时招募失败', () => {
            // 强制进入执行期
            const actualWar = service.getPlayerWar();
            actualWar.state = WAR_STATES.EXECUTING;

            const result = service.mcpArmyRecruit({ unitType: 'infantry', count: 100 });

            expect(result.success).toBe(false);
            expect(result.error).toContain('无法招募');
        });

        test('无效兵种时失败', () => {
            const result = service.mcpArmyRecruit({ unitType: 'invalid', count: 100 });

            expect(result.success).toBe(false);
            expect(result.error).toContain('无效的兵种类型');
        });

        test('数量为0时失败', () => {
            const result = service.mcpArmyRecruit({ unitType: 'infantry', count: 0 });

            expect(result.success).toBe(false);
            expect(result.error).toContain('大于0');
        });

        test('超过单种上限时失败', () => {
            const result = service.mcpArmyRecruit({ unitType: 'infantry', count: 500 });

            expect(result.success).toBe(false);
            expect(result.error).toContain('最多招募 400');
        });

        test('超过军队总规模上限时失败', () => {
            // 先招募多种兵种达到800人，再招募300会使总数超过1000
            // 招募400 infantry (达到上限)
            service.mcpArmyRecruit({ unitType: 'infantry', count: 400 });
            // 招募400 cavalry (达到上限)
            service.mcpArmyRecruit({ unitType: 'cavalry', count: 400 });
            // 总数800，招募300 archer会使总数达到1100，超过1000
            const result = service.mcpArmyRecruit({ unitType: 'archer', count: 300 });

            expect(result.success).toBe(false);
            expect(result.error).toContain('不能超过 1000');
        });

        test('灵石不足时失败', () => {
            gameState.spiritStones = 100;

            const result = service.mcpArmyRecruit({ unitType: 'mage', count: 10 });

            expect(result.success).toBe(false);
            expect(result.error).toContain('灵石不足');
        });
    });

    describe('mcpStrategySet - 设置战略', () => {
        let playerSect;
        let defenderSect;

        beforeEach(() => {
            playerSect = createTestImmortalSect('玩家宗门', 'player_001');
            defenderSect = createTestImmortalSect('防守方', 'enemy_001');
            gameState.immortalSects.sects.push(playerSect, defenderSect);
            gameState.immortalSects.playerSectId = playerSect.uid;
            service.mcpWarDeclare({ targetSectId: defenderSect.uid });
        });

        test('成功设置攻击战略', () => {
            const result = service.mcpStrategySet({ strategyType: 'aggressive' });

            expect(result.success).toBe(true);
            expect(result.message).toContain('aggressive');
            expect(result.strategy.type).toBe('aggressive');
            expect(result.strategy.side).toBe('attacker');
            expect(result.strategy.bonuses.attackBonus).toBe(1.3);
        });

        test('成功设置防御战略', () => {
            const result = service.mcpStrategySet({ strategyType: 'defensive' });

            expect(result.success).toBe(true);
            expect(result.strategy.bonuses.defenseBonus).toBe(1.4);
        });

        test('无战争时设置失败', () => {
            gameState.realmWarfare.playerWarId = null;

            const result = service.mcpStrategySet({ strategyType: 'aggressive' });

            expect(result.success).toBe(false);
        });

        test('无效战略类型时失败', () => {
            const result = service.mcpStrategySet({ strategyType: 'invalid' });

            expect(result.success).toBe(false);
            expect(result.error).toContain('无效的战略类型');
        });

        test('战争非准备期时失败', () => {
            const war = service.getPlayerWar();
            war.state = WAR_STATES.EXECUTING;

            const result = service.mcpStrategySet({ strategyType: 'aggressive' });

            expect(result.success).toBe(false);
        });
    });

    describe('mcpWarExecute - 执行战斗', () => {
        let playerSect;
        let defenderSect;

        beforeEach(() => {
            playerSect = createTestImmortalSect('玩家宗门', 'player_001');
            defenderSect = createTestImmortalSect('防守方', 'enemy_001');
            defenderSect.resources.spiritStones = 100000;
            gameState.immortalSects.sects.push(playerSect, defenderSect);
            gameState.immortalSects.playerSectId = playerSect.uid;
            service.mcpWarDeclare({ targetSectId: defenderSect.uid });

            // 招募足够兵力
            service.mcpArmyRecruit({ unitType: 'infantry', count: 200 });
            service.mcpArmyRecruit({ unitType: 'cavalry', count: 100 });
            service.mcpArmyRecruit({ unitType: 'archer', count: 50 });
        });

        test('成功执行战斗', () => {
            // 强制准备期结束
            const war = service.getPlayerWar();
            war.prepareEndTime = Date.now() - 1000;

            const result = service.mcpWarExecute({});

            expect(result.success).toBe(true);
            expect(result.battleResult.winner).toBeDefined();
            expect(result.battleResult.attackerPower).toBeGreaterThan(0);
            expect(result.battleResult.defenderPower).toBeGreaterThan(0);
        });

        test('防守方获得初始兵力', () => {
            const war = service.getPlayerWar();
            expect(war.defender.troops.infantry).toBeGreaterThan(0);
        });

        test('无战争时执行失败', () => {
            gameState.realmWarfare.playerWarId = null;

            const result = service.mcpWarExecute({});

            expect(result.success).toBe(false);
        });

        test('战争已结束时执行失败', () => {
            const war = service.getPlayerWar();
            war.state = WAR_STATES.ENDED;

            const result = service.mcpWarExecute({});

            expect(result.success).toBe(false);
            expect(result.error).toContain('已结束');
        });

        test('准备期未结束时执行失败', () => {
            const war = service.getPlayerWar();
            war.prepareEndTime = Date.now() + 60000;

            const result = service.mcpWarExecute({});

            expect(result.success).toBe(false);
            expect(result.error).toContain('准备期还未结束');
        });
    });

    describe('mcpResultClaim - 领取战利品', () => {
        let playerSect;
        let defenderSect;

        beforeEach(() => {
            playerSect = createTestImmortalSect('玩家宗门', 'player_001');
            defenderSect = createTestImmortalSect('防守方', 'enemy_001');
            gameState.immortalSects.sects.push(playerSect, defenderSect);
            gameState.immortalSects.playerSectId = playerSect.uid;
            service.mcpWarDeclare({ targetSectId: defenderSect.uid });
        });

        test('战争未结束时无法领取', () => {
            const result = service.mcpResultClaim({});

            expect(result.success).toBe(false);
            expect(result.error).toContain('尚未结束');
        });

        test('战败无法领取战利品', () => {
            const war = service.getPlayerWar();
            war.state = WAR_STATES.ENDED;
            war.winner = defenderSect.uid; // 防守方赢了

            const result = service.mcpResultClaim({});

            expect(result.success).toBe(false);
            expect(result.error).toContain('输掉了');
        });
    });

    describe('mcpAllianceSupport - 请求联盟支援', () => {
        let playerSect;
        let defenderSect;
        let allySect;

        beforeEach(() => {
            playerSect = createTestImmortalSect('玩家宗门', 'player_001');
            defenderSect = createTestImmortalSect('防守方', 'enemy_001');
            allySect = createTestImmortalSect('盟军宗门', 'ally_001');
            
            // 设置联盟关系
            playerSect.alliances = [allySect.uid];
            allySect.alliances = [playerSect.uid];
            
            gameState.immortalSects.sects.push(playerSect, defenderSect, allySect);
            gameState.immortalSects.playerSectId = playerSect.uid;
        });

        test('无战争时请求失败', () => {
            // 清除战争状态
            gameState.realmWarfare.playerWarId = null;
            
            const result = service.mcpAllianceSupport({});

            expect(result.success).toBe(false);
            expect(result.error).toContain('未找到战争');
        });

        test('无联盟时失败', () => {
            service.mcpWarDeclare({ targetSectId: defenderSect.uid });
            playerSect.alliances = [];

            const result = service.mcpAllianceSupport({});

            expect(result.success).toBe(false);
            expect(result.error).toContain('没有结盟');
        });

        test('灵石不足时失败', () => {
            service.mcpWarDeclare({ targetSectId: defenderSect.uid });
            gameState.spiritStones = 10000;

            const result = service.mcpAllianceSupport({});

            expect(result.success).toBe(false);
            expect(result.error).toContain('灵石不足');
        });

        test('未飞升时失败', () => {
            gameState.ascension.ascended = false;

            const result = service.mcpAllianceSupport({});

            expect(result.success).toBe(false);
            expect(result.error).toContain('尚未飞升');
        });
    });

    describe('mcpWarList - 战争列表', () => {
        test('应返回所有战争', () => {
            // 创建三个宗门
            const sect1 = createTestImmortalSect('宗门1', 'uid1');
            const sect2 = createTestImmortalSect('宗门2', 'uid2');
            const sect3 = createTestImmortalSect('宗门3', 'uid3');
            
            gameState.immortalSects.sects.push(sect1, sect2, sect3);
            gameState.immortalSects.playerSectId = sect1.uid;
            
            // 第一个战争：sect1 vs sect2
            service.mcpWarDeclare({ targetSectId: sect2.uid });
            
            // 手动结束第一个战争，设为ended状态
            const war1 = service.getPlayerWar();
            war1.state = WAR_STATES.ENDED;
            gameState.realmWarfare.playerWarId = null; // 清除当前战争
            
            // 第二个战争：sect1 vs sect3
            service.mcpWarDeclare({ targetSectId: sect3.uid });

            const result = service.mcpWarList({});

            expect(result.success).toBe(true);
            expect(result.wars.length).toBe(2);
            expect(result.totalCount).toBe(2);
        });

        test('应支持状态过滤', () => {
            const sect1 = createTestImmortalSect('宗门1', 'uid1');
            const sect2 = createTestImmortalSect('宗门2', 'uid2');
            
            gameState.immortalSects.sects.push(sect1, sect2);
            gameState.immortalSects.playerSectId = sect1.uid;
            service.mcpWarDeclare({ targetSectId: sect2.uid });

            const war = service.getPlayerWar();
            war.state = WAR_STATES.ENDED;

            const result = service.mcpWarList({ state: WAR_STATES.ENDED });

            expect(result.wars.every(w => w.state === WAR_STATES.ENDED)).toBe(true);
        });
    });

    describe('mcpWarDetail - 战争详情', () => {
        test('应返回战争详情', () => {
            const sect1 = createTestImmortalSect('宗门1', 'uid1');
            const sect2 = createTestImmortalSect('宗门2', 'uid2');
            
            gameState.immortalSects.sects.push(sect1, sect2);
            gameState.immortalSects.playerSectId = sect1.uid;
            service.mcpWarDeclare({ targetSectId: sect2.uid });

            const war = service.getPlayerWar();
            const result = service.mcpWarDetail({ warId: war.uid });

            expect(result.success).toBe(true);
            expect(result.war.uid).toBe(war.uid);
            expect(result.war.attacker.name).toBeDefined();
            expect(result.war.defender.name).toBeDefined();
        });

        test('战争不存在时失败', () => {
            const result = service.mcpWarDetail({ warId: 'non_existent' });

            expect(result.success).toBe(false);
            expect(result.error).toContain('未找到');
        });
    });

    describe('边界条件和错误处理', () => {
        test('空参数应正确处理', () => {
            const sect1 = createTestImmortalSect('宗门1', 'uid1');
            const sect2 = createTestImmortalSect('宗门2', 'uid2');
            
            gameState.immortalSects.sects.push(sect1, sect2);
            gameState.immortalSects.playerSectId = sect1.uid;

            const result = service.mcpWarDeclare({});
            expect(result.success).toBe(false);
        });

        test('应正确处理缺失的immortalSects', () => {
            delete gameState.immortalSects;

            const result = service.mcpWarDeclare({ targetSectId: 'any' });
            expect(result.success).toBe(false);
        });

        test('应正确处理null/undefined资源', () => {
            const sect = createTestImmortalSect('宗门', 'uid');
            sect.resources = null;
            gameState.immortalSects.sects.push(sect);
            gameState.immortalSects.playerSectId = sect.uid;

            const result = service.mcpWarDeclare({ targetSectId: 'any' });
            expect(result.success).toBe(false);
        });
    });
});