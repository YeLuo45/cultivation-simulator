/**
 * ImmortalSectService.test.js - 仙界宗门系统测试
 * V231 Direction S: 仙界宗门系统 - TDD测试
 * 
 * 测试覆盖率目标: ≥95%
 * 测试通过率目标: 100%
 */

import { 
    createImmortalSectService, 
    IMMORTAL_SECT_CONFIG, 
    createImmortalSect, 
    createEliteDisciple 
} from '../../../domains/sect/services/ImmortalSectService.js';

// 测试辅助函数
function createMockGameState(overrides = {}) {
    return {
        player: {
            uid: 'player_001',
            name: '测试修士',
            level: 10
        },
        spiritStones: 100000,
        realm: 5, // 化神巅峰
        stage: 2,
        sect: {
            name: '测试宗门',
            disciples: [
                { uid: 'disc_001', name: '弟子甲', realm: 3, talentIndex: 2 },
                { uid: 'disc_002', name: '弟子乙', realm: 2, talentIndex: 1 },
                { uid: 'disc_003', name: '弟子丙', realm: 4, talentIndex: 3 }
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
        ...overrides
    };
}

describe('ImmortalSectService', () => {
    let service;
    let gameState;

    beforeEach(() => {
        gameState = createMockGameState();
        service = createImmortalSectService(gameState);
        service.init(gameState);
    });

    describe('createImmortalSect', () => {
        test('应创建正确结构的仙界宗门', () => {
            const sect = createImmortalSect('测试仙宗', 'founder_001');
            
            expect(sect.uid).toMatch(/^ims_/);
            expect(sect.name).toBe('测试仙宗');
            expect(sect.founder).toBe('founder_001');
            expect(sect.sectLevel).toBe(1);
            expect(sect.members).toHaveLength(1);
            expect(sect.members[0].role).toBe('founder');
            expect(sect.resources).toEqual({
                spiritStones: 0,
                pills: 0,
                techniques: 0,
                merit: 0
            });
            expect(sect.eliteDisciples).toEqual([]);
            expect(sect.alliances).toEqual([]);
            expect(sect.enemies).toEqual([]);
            expect(sect.reputation).toBe(100);
        });

        test('应生成唯一UID', () => {
            const sect1 = createImmortalSect('宗门1', 'uid1');
            const sect2 = createImmortalSect('宗门2', 'uid2');
            
            expect(sect1.uid).not.toBe(sect2.uid);
        });
    });

    describe('createEliteDisciple', () => {
        test('应创建正确结构的精英弟子', () => {
            const discipleInfo = {
                uid: 'disc_001',
                name: '精英弟子',
                realm: 4,
                talentIndex: 3
            };
            
            const elite = createEliteDisciple(discipleInfo);
            
            expect(elite.uid).toMatch(/^eld_/);
            expect(elite.originalUid).toBe('disc_001');
            expect(elite.name).toBe('精英弟子');
            expect(elite.realm).toBe(4);
            expect(elite.talentIndex).toBe(3);
            expect(elite.specialSkills).toEqual([]);
            expect(elite.cultivationSpeed).toBe(1.0);
            expect(elite.combatPower).toBe(0);
            expect(elite.contribution).toBe(0);
        });

        test('应使用默认值处理缺失字段', () => {
            const elite = createEliteDisciple({ uid: 'disc_002', name: '普通弟子' });
            
            expect(elite.realm).toBe(6);
            expect(elite.talentIndex).toBe(1);
        });
    });

    describe('IMMORTAL_SECT_CONFIG', () => {
        test('应包含所有必需的配置项', () => {
            expect(IMMORTAL_SECT_CONFIG.createCost).toBe(50000);
            expect(IMMORTAL_SECT_CONFIG.joinCost).toBe(10000);
            expect(IMMORTAL_SECT_CONFIG.maxSectLevel).toBe(5);
            expect(IMMORTAL_SECT_CONFIG.resourceTypes).toContain('spiritStones');
            expect(IMMORTAL_SECT_CONFIG.resourceTypes).toContain('pills');
            expect(IMMORTAL_SECT_CONFIG.resourceTypes).toContain('techniques');
            expect(IMMORTAL_SECT_CONFIG.resourceTypes).toContain('merit');
            expect(IMMORTAL_SECT_CONFIG.tradeTaxRate).toBe(0.05);
            expect(IMMORTAL_SECT_CONFIG.eliteDiscipleLimit).toBe(10);
            expect(IMMORTAL_SECT_CONFIG.allianceMaxSects).toBe(5);
        });
    });

    describe('服务初始化', () => {
        test('init应正确初始化游戏状态', () => {
            const freshState = { 
                player: { uid: 'test' },
                spiritStones: 50000 
            };
            
            const service = createImmortalSectService(freshState);
            const result = service.init(freshState);
            
            expect(result.immortalSects).toBeDefined();
            expect(result.immortalSects.sects).toEqual([]);
            expect(result.immortalSects.playerSectId).toBeNull();
            expect(result.immortalSects.tradeHistory).toEqual([]);
            expect(result.immortalSects.allianceRecords).toEqual([]);
        });

        test('init不应覆盖已存在的immortalSects', () => {
            const existingSects = {
                sects: [{ uid: 'existing', name: '已有宗门' }],
                playerSectId: 'existing',
                tradeHistory: [{ id: 'trade1' }],
                allianceRecords: [{ id: 'alliance1' }]
            };
            const stateWithSects = { immortalSects: existingSects };
            
            service.init(stateWithSects);
            
            expect(stateWithSects.immortalSects.sects).toHaveLength(1);
            expect(stateWithSects.immortalSects.playerSectId).toBe('existing');
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

    describe('getPlayerSect', () => {
        test('无宗门时应返回null', () => {
            expect(service.getPlayerSect()).toBeNull();
        });

        test('有宗门时应返回正确宗门', () => {
            const sect = createImmortalSect('玩家宗门', 'player');
            gameState.immortalSects.sects.push(sect);
            gameState.immortalSects.playerSectId = sect.uid;
            
            const result = service.getPlayerSect();
            
            expect(result).toBeDefined();
            expect(result.name).toBe('玩家宗门');
        });
    });

    describe('mcpCreate - 创建仙界宗门', () => {
        test('成功创建宗门', () => {
            const result = service.mcpCreate({ name: '新仙宗' });
            
            expect(result.success).toBe(true);
            expect(result.message).toContain('新仙宗');
            expect(result.sect.name).toBe('新仙宗');
            expect(result.sect.sectLevel).toBe(1);
            expect(result.costDeducted).toBe(50000);
            expect(gameState.spiritStones).toBe(50000); // 100000 - 50000
            expect(gameState.immortalSects.playerSectId).toBeDefined();
        });

        test('未飞升时创建失败', () => {
            gameState.ascension.ascended = false;
            
            const result = service.mcpCreate({ name: '新仙宗' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('尚未飞升');
        });

        test('已有宗门时创建失败', () => {
            service.mcpCreate({ name: '第一个宗门' });
            
            const result = service.mcpCreate({ name: '第二个宗门' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('已加入');
        });

        test('宗门名称过短时创建失败', () => {
            const result = service.mcpCreate({ name: 'A' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('至少需要2个字符');
        });

        test('宗门名称过长时创建失败', () => {
            const longName = 'A'.repeat(25);
            const result = service.mcpCreate({ name: longName });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('不能超过20个字符');
        });

        test('灵石不足时创建失败', () => {
            gameState.spiritStones = 1000;
            
            const result = service.mcpCreate({ name: '新仙宗' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵石不足');
            expect(result.error).toContain('50000');
        });

        test('空名称时创建失败', () => {
            const result = service.mcpCreate({ name: '' });
            
            expect(result.success).toBe(false);
        });

        test('无名称时创建失败', () => {
            const result = service.mcpCreate({});
            
            expect(result.success).toBe(false);
        });
    });

    describe('mcpJoin - 加入仙界宗门', () => {
        let targetSect;

        beforeEach(() => {
            targetSect = createImmortalSect('目标宗门', 'target_founder');
            gameState.immortalSects.sects.push(targetSect);
        });

        test('成功加入宗门', () => {
            const result = service.mcpJoin({ sectId: targetSect.uid });
            
            expect(result.success).toBe(true);
            expect(result.message).toContain('目标宗门');
            expect(result.sect.uid).toBe(targetSect.uid);
            expect(result.costDeducted).toBe(10000);
            expect(gameState.immortalSects.playerSectId).toBe(targetSect.uid);
        });

        test('未飞升时加入失败', () => {
            gameState.ascension.ascended = false;
            
            const result = service.mcpJoin({ sectId: targetSect.uid });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('尚未飞升');
        });

        test('已有宗门时加入失败', () => {
            service.mcpCreate({ name: '我的宗门' });
            
            const result = service.mcpJoin({ sectId: targetSect.uid });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('已加入');
        });

        test('宗门不存在时加入失败', () => {
            const result = service.mcpJoin({ sectId: 'non_existent' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('不存在');
        });

        test('宗门满员时加入失败', () => {
            // 添加50个成员填满宗门（每星10人上限）
            for (let i = 0; i < 50; i++) {
                targetSect.members.push({
                    uid: `member_${i}`,
                    role: 'member'
                });
            }
            
            const result = service.mcpJoin({ sectId: targetSect.uid });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('人数已满');
        });

        test('灵石不足时加入失败', () => {
            gameState.spiritStones = 1000;
            
            const result = service.mcpJoin({ sectId: targetSect.uid });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('灵石不足');
        });
    });

    describe('mcpResourceList - 查看宗门资源', () => {
        let testSect;

        beforeEach(() => {
            testSect = createImmortalSect('资源宗门', 'founder');
            testSect.resources = {
                spiritStones: 10000,
                pills: 50,
                techniques: 20,
                merit: 500
            };
            gameState.immortalSects.sects.push(testSect);
            gameState.immortalSects.playerSectId = testSect.uid;
        });

        test('成功获取自身宗门资源', () => {
            const result = service.mcpResourceList({});
            
            expect(result.success).toBe(true);
            expect(result.sect.name).toBe('资源宗门');
            expect(result.sect.resources.spiritStones).toBe(10000);
            expect(result.sect.dailyIncome).toBeDefined();
            expect(result.recentTrades).toEqual([]);
        });

        test('成功获取指定宗门资源', () => {
            const result = service.mcpResourceList({ sectId: testSect.uid });
            
            expect(result.success).toBe(true);
            expect(result.sect.uid).toBe(testSect.uid);
        });

        test('无宗门时获取失败', () => {
            gameState.immortalSects.playerSectId = null;
            
            const result = service.mcpResourceList({});
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('未找到');
        });

        test('指定不存在宗门时失败', () => {
            const result = service.mcpResourceList({ sectId: 'non_existent' });
            
            expect(result.success).toBe(false);
        });

        test('应包含每日产出计算', () => {
            const result = service.mcpResourceList({});
            
            expect(result.sect.dailyIncome.spiritStones).toBeGreaterThan(0);
            expect(result.sect.dailyIncome.pills).toBeGreaterThanOrEqual(0);
            expect(result.sect.dailyIncome.techniques).toBeGreaterThanOrEqual(0);
            expect(result.sect.dailyIncome.merit).toBeGreaterThan(0);
        });
    });

    describe('calculateDailyIncome', () => {
        test('正确计算每日产出', () => {
            const sect = createImmortalSect('测试宗门', 'founder');
            sect.members = [
                { uid: 'm1' },
                { uid: 'm2' },
                { uid: 'm3' }
            ];
            sect.sectLevel = 2;
            
            const income = service.calculateDailyIncome(sect);
            
            expect(income.spiritStones).toBeGreaterThan(0);
            expect(income.pills).toBeGreaterThanOrEqual(0);
            expect(income.merit).toBeGreaterThan(0);
        });

        test('精英弟子增加产出', () => {
            const sect = createImmortalSect('精英宗门', 'founder');
            sect.members = [{ uid: 'm1' }];
            sect.eliteDisciples = [
                { uid: 'e1' },
                { uid: 'e2' }
            ];
            
            const income = service.calculateDailyIncome(sect);
            
            expect(income.pills).toBeGreaterThan(0);
        });
    });

    describe('mcpTradeExecute - 执行宗门间交易', () => {
        let playerSect;
        let targetSect;

        beforeEach(() => {
            playerSect = createImmortalSect('卖方宗门', 'player');
            playerSect.resources = {
                spiritStones: 10000,
                pills: 100,
                techniques: 50,
                merit: 500
            };
            targetSect = createImmortalSect('买方宗门', 'target');
            targetSect.resources = {
                spiritStones: 50000,
                pills: 10,
                techniques: 5,
                merit: 100
            };
            
            gameState.immortalSects.sects.push(playerSect, targetSect);
            gameState.immortalSects.playerSectId = playerSect.uid;
        });

        test('成功发起灵石交易', () => {
            const result = service.mcpTradeExecute({
                targetSectId: targetSect.uid,
                resourceType: 'spiritStones',
                amount: 1000,
                price: 5000
            });
            
            expect(result.success).toBe(true);
            expect(result.message).toContain('发起交易请求');
            expect(result.trade.resourceType).toBe('spiritStones');
            expect(result.trade.amount).toBe(1000);
            expect(result.trade.price).toBe(5000);
            expect(result.trade.tax).toBe(250); // 5000 * 0.05
            expect(result.remainingResource).toBe(9000);
        });

        test('灵石不足时交易失败', () => {
            const result = service.mcpTradeExecute({
                targetSectId: targetSect.uid,
                resourceType: 'spiritStones',
                amount: 50000,
                price: 10000
            });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('不足');
        });

        test('未加入宗门时交易失败', () => {
            gameState.immortalSects.playerSectId = null;
            
            const result = service.mcpTradeExecute({
                targetSectId: targetSect.uid,
                resourceType: 'spiritStones',
                amount: 100,
                price: 1000
            });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('未加入');
        });

        test('目标宗门不存在时交易失败', () => {
            const result = service.mcpTradeExecute({
                targetSectId: 'non_existent',
                resourceType: 'spiritStones',
                amount: 100,
                price: 1000
            });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('不存在');
        });

        test('敌对宗门交易失败', () => {
            playerSect.enemies.push(targetSect.uid);
            
            const result = service.mcpTradeExecute({
                targetSectId: targetSect.uid,
                resourceType: 'spiritStones',
                amount: 100,
                price: 1000
            });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('敌对');
        });

        test('无效资源类型失败', () => {
            const result = service.mcpTradeExecute({
                targetSectId: targetSect.uid,
                resourceType: 'invalidType',
                amount: 100,
                price: 1000
            });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('无效的资源类型');
        });

        test('数量为0或负数时失败', () => {
            const result = service.mcpTradeExecute({
                targetSectId: targetSect.uid,
                resourceType: 'spiritStones',
                amount: 0,
                price: 1000
            });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('大于0');
        });

        test('价格为0或负数时失败', () => {
            const result = service.mcpTradeExecute({
                targetSectId: targetSect.uid,
                resourceType: 'spiritStones',
                amount: 100,
                price: -100
            });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('大于0');
        });

        test('缺少目标宗门ID时失败', () => {
            const result = service.mcpTradeExecute({
                resourceType: 'spiritStones',
                amount: 100,
                price: 1000
            });
            
            expect(result.success).toBe(false);
        });

        test('交易记录正确添加到历史', () => {
            service.mcpTradeExecute({
                targetSectId: targetSect.uid,
                resourceType: 'pills',
                amount: 10,
                price: 500
            });
            
            expect(gameState.immortalSects.tradeHistory.length).toBeGreaterThan(0);
            const trade = gameState.immortalSects.tradeHistory[0];
            expect(trade.resourceType).toBe('pills');
            expect(trade.status).toBe('pending');
        });
    });

    describe('mcpDisciplePromote - 晋升精英弟子', () => {
        let playerSect;

        beforeEach(() => {
            playerSect = createImmortalSect('我的宗门', 'player');
            gameState.immortalSects.sects.push(playerSect);
            gameState.immortalSects.playerSectId = playerSect.uid;
        });

        test('成功晋升金丹期弟子', () => {
            const result = service.mcpDisciplePromote({ discipleUid: 'disc_001' });
            
            expect(result.success).toBe(true);
            expect(result.message).toContain('弟子甲');
            expect(result.message).toContain('精英弟子');
            expect(result.eliteDisciple.name).toBe('弟子甲');
            expect(result.eliteDisciple.realm).toBe(3);
            expect(result.eliteDisciple.specialSkills).toBeDefined();
            expect(result.eliteDiscipleCount).toBe(1);
        });

        test('未加入宗门时失败', () => {
            gameState.immortalSects.playerSectId = null;
            
            const result = service.mcpDisciplePromote({ discipleUid: 'disc_001' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('未加入');
        });

        test('精英弟子数量超限时失败', () => {
            // 添加10个精英弟子
            for (let i = 0; i < 10; i++) {
                playerSect.eliteDisciples.push({
                    uid: `elite_${i}`,
                    originalUid: `orig_${i}`
                });
            }
            
            const result = service.mcpDisciplePromote({ discipleUid: 'disc_001' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('已达上限');
        });

        test('弟子不存在时失败', () => {
            const result = service.mcpDisciplePromote({ discipleUid: 'non_existent' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('未找到');
        });

        test('已是精英弟子时失败', () => {
            playerSect.eliteDisciples.push({
                originalUid: 'disc_001'
            });
            
            const result = service.mcpDisciplePromote({ discipleUid: 'disc_001' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('已经是精英弟子');
        });

        test('弟子境界过低时失败', () => {
            const result = service.mcpDisciplePromote({ discipleUid: 'disc_002' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('境界过低');
        });

        test('无凡界宗门时失败', () => {
            gameState.sect = null;
            
            const result = service.mcpDisciplePromote({ discipleUid: 'disc_001' });
            
            expect(result.success).toBe(false);
        });

        test('精英弟子有特殊技能', () => {
            const result = service.mcpDisciplePromote({ discipleUid: 'disc_001' });
            
            expect(result.eliteDisciple.specialSkills.length).toBeGreaterThan(0);
        });
    });

    describe('assignSpecialSkills', () => {
        test('应分配1-3个技能', () => {
            const disciple1 = { talentIndex: 1, realm: 6 };
            const disciple3 = { talentIndex: 3, realm: 6 };
            const disciple4 = { talentIndex: 4, realm: 6 };
            
            const skills1 = service.assignSpecialSkills(disciple1);
            const skills3 = service.assignSpecialSkills(disciple3);
            const skills4 = service.assignSpecialSkills(disciple4);
            
            expect(skills1.length).toBeGreaterThanOrEqual(1);
            expect(skills3.length).toBeGreaterThanOrEqual(1);
            expect(skills4.length).toBeGreaterThanOrEqual(1);
        });

        test('每个技能应有name和effect', () => {
            const disciple = { talentIndex: 2, realm: 6 };
            const skills = service.assignSpecialSkills(disciple);
            
            skills.forEach(skill => {
                expect(skill.name).toBeDefined();
                expect(skill.effect).toBeDefined();
            });
        });
    });

    describe('mcpAllianceForm - 形成宗门联盟', () => {
        let playerSect;
        let targetSect;

        beforeEach(() => {
            playerSect = createImmortalSect('我方宗门', 'player');
            targetSect = createImmortalSect('敌方宗门', 'target');
            gameState.immortalSects.sects.push(playerSect, targetSect);
            gameState.immortalSects.playerSectId = playerSect.uid;
        });

        test('成功与目标宗门结盟', () => {
            const result = service.mcpAllianceForm({ targetSectId: targetSect.uid });
            
            expect(result.success).toBe(true);
            expect(result.message).toContain('成功结盟');
            expect(result.alliance.sectName).toBe('我方宗门');
            expect(result.alliance.targetSectName).toBe('敌方宗门');
            expect(result.playerAllianceCount).toBe(1);
            expect(result.targetAllianceCount).toBe(1);
        });

        test('结盟后双方alliances包含对方', () => {
            service.mcpAllianceForm({ targetSectId: targetSect.uid });
            
            expect(playerSect.alliances).toContain(targetSect.uid);
            expect(targetSect.alliances).toContain(playerSect.uid);
        });

        test('结盟增加reputation', () => {
            const originalRep = playerSect.reputation;
            service.mcpAllianceForm({ targetSectId: targetSect.uid });
            
            expect(playerSect.reputation).toBe(originalRep + 50);
            expect(targetSect.reputation).toBe(100 + 50);
        });

        test('未加入宗门时失败', () => {
            gameState.immortalSects.playerSectId = null;
            
            const result = service.mcpAllianceForm({ targetSectId: targetSect.uid });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('未加入');
        });

        test('目标宗门不存在时失败', () => {
            const result = service.mcpAllianceForm({ targetSectId: 'non_existent' });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('不存在');
        });

        test('与自己结盟时失败', () => {
            const result = service.mcpAllianceForm({ targetSectId: playerSect.uid });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('无法与自己');
        });

        test('已是盟友时失败', () => {
            service.mcpAllianceForm({ targetSectId: targetSect.uid });
            
            const result = service.mcpAllianceForm({ targetSectId: targetSect.uid });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('已是盟友');
        });

        test('敌对宗门结盟失败', () => {
            playerSect.enemies.push(targetSect.uid);
            
            const result = service.mcpAllianceForm({ targetSectId: targetSect.uid });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('敌对');
        });

        test('盟友数量超限时失败', () => {
            // 添加4个盟友达到上限
            for (let i = 0; i < 4; i++) {
                const allySect = createImmortalSect(`盟友${i}`, `ally_${i}`);
                playerSect.alliances.push(allySect.uid);
            }
            
            const result = service.mcpAllianceForm({ targetSectId: targetSect.uid });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('已达上限');
        });

        test('对方盟友满时失败', () => {
            for (let i = 0; i < 5; i++) {
                const allySect = createImmortalSect(`对方盟友${i}`, `enemy_ally_${i}`);
                targetSect.alliances.push(allySect.uid);
            }
            
            const result = service.mcpAllianceForm({ targetSectId: targetSect.uid });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('对方宗门');
        });

        test('结盟记录正确添加', () => {
            service.mcpAllianceForm({ targetSectId: targetSect.uid });
            
            expect(gameState.immortalSects.allianceRecords.length).toBe(1);
            const record = gameState.immortalSects.allianceRecords[0];
            expect(record.type).toBe('mutual');
            expect(record.sectId).toBe(playerSect.uid);
            expect(record.targetSectId).toBe(targetSect.uid);
        });
    });

    describe('getAllSects', () => {
        test('返回所有宗门列表', () => {
            const sect1 = createImmortalSect('宗门1', 'founder1');
            const sect2 = createImmortalSect('宗门2', 'founder2');
            gameState.immortalSects.sects.push(sect1, sect2);
            
            const sects = service.getAllSects();
            
            expect(sects).toHaveLength(2);
            expect(sects[0].name).toBe('宗门1');
            expect(sects[1].name).toBe('宗门2');
        });

        test('返回精简的宗门信息', () => {
            const sect = createImmortalSect('测试宗门', 'founder');
            sect.members = [{ uid: 'm1' }, { uid: 'm2' }];
            sect.reputation = 200;
            gameState.immortalSects.sects.push(sect);
            
            const sects = service.getAllSects();
            
            expect(sects[0]).toHaveProperty('uid');
            expect(sects[0]).toHaveProperty('name');
            expect(sects[0]).toHaveProperty('sectLevel');
            expect(sects[0]).toHaveProperty('memberCount');
            expect(sects[0]).toHaveProperty('reputation');
        });
    });

    describe('getEliteDisciples', () => {
        test('无宗门时返回空数组', () => {
            const result = service.getEliteDisciples();
            expect(result).toEqual([]);
        });

        test('返回精英弟子列表', () => {
            const sect = createImmortalSect('测试宗门', 'founder');
            sect.eliteDisciples = [
                { uid: 'e1', name: '精英1' },
                { uid: 'e2', name: '精英2' }
            ];
            gameState.immortalSects.sects.push(sect);
            gameState.immortalSects.playerSectId = sect.uid;
            
            const result = service.getEliteDisciples();
            
            expect(result).toHaveLength(2);
        });
    });

    describe('getMCPHandlers', () => {
        test('应返回6个MCP工具处理器', () => {
            const handlers = service.getMCPHandlers();
            const keys = Object.keys(handlers);
            
            expect(keys).toContain('sect.immortal.create');
            expect(keys).toContain('sect.immortal.join');
            expect(keys).toContain('sect.immortal.resource.list');
            expect(keys).toContain('sect.immortal.trade.execute');
            expect(keys).toContain('sect.immortal.disciple.promote');
            expect(keys).toContain('sect.immortal.alliance.form');
            expect(keys).toHaveLength(6);
        });

        test('每个处理器都是函数', () => {
            const handlers = service.getMCPHandlers();
            
            Object.values(handlers).forEach(handler => {
                expect(typeof handler).toBe('function');
            });
        });

        test('每个处理器能正确调用', () => {
            const handlers = service.getMCPHandlers();
            
            // 不飞升状态下调用create应该返回错误
            gameState.ascension.ascended = false;
            const result = handlers['sect.immortal.create']({ name: '测试' });
            expect(result.success).toBe(false);
        });
    });
});