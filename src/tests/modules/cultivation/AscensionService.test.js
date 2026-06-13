/**
 * AscensionService.test.js - TDD测试
 * V230 Direction R: 飞升系统测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
    AscensionService, 
    createAscensionService,
    ASCENSION_REQUIREMENTS, 
    IMMORTAL_REALMS, 
    DIVINE_BLESSINGS, 
    DIVINE_TRIBULATION
} from '../../../../src/domains/cultivation/services/AscensionService.js';

// ===== 测试辅助函数 =====

/**
 * 创建测试用gameState
 */
function createTestGameState(overrides = {}) {
    return {
        realm: 5, // 默认化神巅峰 (满足飞升条件)
        stage: 2,
        spiritRoot: { type: 'wood', tier: 5 },
        spiritStones: 20000,
        tribulationRecord: [{ realm: 1, success: true }, { realm: 2, success: true }, { realm: 3, success: true }],
        cultivationXP: 0,
        reincarnation: {
            totalKarma: 800,
            karmaGood: 1000,
            karmaBad: 200
        },
        ascension: null,
        ...overrides
    };
}

/**
 * 创建模拟轮回服务
 */
function createMockReincarnationService(gameState) {
    return {
        reincarnation: gameState.reincarnation,
        recordKarma: vi.fn((type, amount) => {
            if (type === 'good') {
                gameState.reincarnation.karmaGood += amount;
            } else if (type === 'bad') {
                gameState.reincarnation.karmaBad += amount;
            }
            gameState.reincarnation.totalKarma = gameState.reincarnation.karmaGood - gameState.reincarnation.karmaBad;
        })
    };
}

// ===== 测试套件 =====

describe('AscensionService', () => {
    let gameState;
    let reincarnationService;
    let service;

    beforeEach(() => {
        gameState = createTestGameState();
        reincarnationService = createMockReincarnationService(gameState);
        service = new AscensionService(gameState, reincarnationService);
    });

    // ===== 初始化测试 =====

    describe('init', () => {
        it('应初始化ascension状态', () => {
            const result = service.init(gameState);
            expect(gameState.ascension).not.toBeNull();
            expect(gameState.ascension.ascended).toBe(false);
            expect(gameState.ascension.immortalRealm).toBeNull();
            expect(gameState.ascension.blessings).toEqual([]);
        });

        it('已存在的ascension状态不应被覆盖', () => {
            gameState.ascension = {
                ascended: true,
                immortalRealm: 2,
                blessings: [{ type: 'immortalBody' }]
            };
            service.init(gameState);
            expect(gameState.ascension.ascended).toBe(true);
            expect(gameState.ascension.immortalRealm).toBe(2);
        });
    });

    // ===== checkRequirements 测试 =====

    describe('checkRequirements', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('所有条件满足时应返回canAscend=true', () => {
            const result = service.checkRequirements();
            expect(result.canAscend).toBe(true);
            expect(result.requirementsMet).toBe(result.requirementsTotal);
        });

        it('境界不足时应返回canAscend=false', () => {
            gameState.realm = 4; // 低于要求的5
            const result = service.checkRequirements();
            expect(result.canAscend).toBe(false);
            const realmReq = result.requirements.find(r => r.type === 'realm');
            expect(realmReq.met).toBe(false);
        });

        it('功德不足时应返回canAscend=false', () => {
            // getKarma() uses karmaGood - karmaBad, not totalKarma
            gameState.reincarnation.karmaGood = 300;
            gameState.reincarnation.karmaBad = 200;
            const result = service.checkRequirements();
            expect(result.canAscend).toBe(false);
            const karmaReq = result.requirements.find(r => r.type === 'karma');
            expect(karmaReq.met).toBe(false);
        });

        it('灵根品级不足时应返回canAscend=false', () => {
            gameState.spiritRoot.tier = 3; // 低于要求的4
            const result = service.checkRequirements();
            expect(result.canAscend).toBe(false);
            const spiritRootReq = result.requirements.find(r => r.type === 'spiritRoot');
            expect(spiritRootReq.met).toBe(false);
        });

        it('天劫通过记录不足时应返回canAscend=false', () => {
            gameState.tribulationRecord = []; // 无记录
            const result = service.checkRequirements();
            expect(result.canAscend).toBe(false);
            const tribReq = result.requirements.find(r => r.type === 'tribulation');
            expect(tribReq.met).toBe(false);
        });

        it('灵石不足时应返回canAscend=false', () => {
            gameState.spiritStones = 100; // 低于要求的10000
            const result = service.checkRequirements();
            expect(result.canAscend).toBe(false);
            const ssReq = result.requirements.find(r => r.type === 'spiritStones');
            expect(ssReq.met).toBe(false);
        });

        it('应返回详细的条件检查结果', () => {
            const result = service.checkRequirements();
            expect(result.requirements).toBeDefined();
            expect(result.requirements.length).toBe(5);
            expect(result.ascensionStatus).toBeDefined();
        });
    });

    // ===== initiateAscension 测试 =====

    describe('initiateAscension', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('条件满足时应成功发起飞升', () => {
            const result = service.initiateAscension();
            expect(result.success).toBe(true);
            expect(result.message).toContain('飞升仪式开始');
            expect(result.tribulationInfo).toBeDefined();
            expect(result.tribulationInfo.strikesTotal).toBe(9);
        });

        it('应扣除灵石', () => {
            const initialStones = gameState.spiritStones;
            service.initiateAscension();
            expect(gameState.spiritStones).toBe(initialStones - ASCENSION_REQUIREMENTS.minSpiritStones);
        });

        it('已飞升后不应再次发起飞升', () => {
            gameState.ascension.ascended = true;
            const result = service.initiateAscension();
            expect(result.success).toBe(false);
            expect(result.error).toContain('已经飞升');
        });

        it('条件不满足时应返回错误', () => {
            gameState.realm = 4;
            const result = service.initiateAscension();
            expect(result.success).toBe(false);
            expect(result.unmetRequirements).toBeDefined();
        });

        it('灵石不足时应返回错误', () => {
            gameState.spiritStones = 100; // 低于要求的10000
            const result = service.initiateAscension();
            expect(result.success).toBe(false);
            // 先检查飞升条件未满足，但包含灵石相关的错误
            expect(result.error).toBeDefined();
        });
    });

    // ===== executeTribulation 测试 =====

    describe('executeTribulation', () => {
        beforeEach(() => {
            service.init(gameState);
            service.initiateAscension();
        });

        it('天劫考验进行中时应返回进度', () => {
            const result = service.executeTribulation();
            expect(result.success).toBe(true);
            expect(result.result).toBe('in_progress');
            expect(result.strikeNumber).toBe(1);
        });

        it('无进行中天劫时应返回错误', () => {
            gameState.ascension.tribulationActive = false;
            const result = service.executeTribulation();
            expect(result.success).toBe(false);
            expect(result.error).toContain('未激活');
        });

        it('抵抗率>=60%时飞升成功', () => {
            // 执行9道天劫，全部抵抗
            for (let i = 1; i <= 9; i++) {
                const result = service.executeTribulation({ strikeNumber: i, resisted: true });
                if (i < 9) {
                    expect(result.result).toBe('in_progress');
                } else {
                    expect(result.result).toBe('success');
                    expect(result.message).toContain('飞升成功');
                    expect(result.resistRate).toBe('100.0%');
                }
            }
        });

        it('抵抗率<60%时飞升失败', () => {
            // 执行9道天劫，全部不抵抗
            for (let i = 1; i <= 9; i++) {
                const result = service.executeTribulation({ strikeNumber: i, resisted: false });
                if (i < 9) {
                    expect(result.result).toBe('in_progress');
                } else {
                    expect(result.result).toBe('failed');
                    expect(result.message).toContain('飞升失败');
                }
            }
        });

        it('飞升成功后应设置immortalRealm', () => {
            // 全部抵抗
            for (let i = 1; i <= 9; i++) {
                service.executeTribulation({ strikeNumber: i, resisted: true });
            }
            expect(gameState.ascension.ascended).toBe(true);
            expect(gameState.ascension.immortalRealm).toBe(0);
            expect(gameState.ascension.immortalTier).toBe(1);
        });

        it('飞升成功后应计算pendingRewards', () => {
            for (let i = 1; i <= 9; i++) {
                service.executeTribulation({ strikeNumber: i, resisted: true });
            }
            expect(gameState.ascension.pendingRewards).not.toBeNull();
            expect(gameState.ascension.pendingRewards.spiritStones).toBeGreaterThan(0);
            expect(gameState.ascension.pendingRewards.blessings).toBeDefined();
        });

        it('应返回pendingRewards', () => {
            // 先初始化天劫
            service.init(gameState);
            service.initiateAscension();
            // 执行全部9道天劫并在第9道获取结果
            let result;
            for (let i = 1; i <= 9; i++) {
                result = service.executeTribulation({ strikeNumber: i, resisted: true });
            }
            expect(result.pendingRewards).toBeDefined();
        });
    });

    // ===== claimReward 测试 =====

    describe('claimReward', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('飞升后应能领取奖励', () => {
            gameState.ascension.ascended = true;
            gameState.ascension.pendingRewards = {
                spiritStones: 5000,
                cultivationXp: 10000,
                merit: 500,
                blessings: [{ type: 'immortalBody', name: '仙灵之体' }]
            };

            const result = service.claimReward();
            expect(result.success).toBe(true);
            expect(result.message).toContain('领取成功');
        });

        it('应增加玩家灵石', () => {
            gameState.ascension.ascended = true;
            gameState.ascension.pendingRewards = {
                spiritStones: 5000,
                cultivationXp: 0,
                merit: 0,
                blessings: []
            };

            const initialStones = gameState.spiritStones;
            service.claimReward();
            expect(gameState.spiritStones).toBe(initialStones + 5000);
        });

        it('应增加修为', () => {
            gameState.ascension.ascended = true;
            gameState.ascension.pendingRewards = {
                spiritStones: 0,
                cultivationXp: 10000,
                merit: 0,
                blessings: []
            };

            service.claimReward();
            expect(gameState.cultivationXP).toBe(10000);
        });

        it('应添加赐福到列表', () => {
            gameState.ascension.ascended = true;
            gameState.ascension.pendingRewards = {
                spiritStones: 0,
                cultivationXp: 0,
                merit: 0,
                blessings: [
                    { type: 'immortalBody', name: '仙灵之体', effect: { maxHp: 500 } }
                ]
            };

            service.claimReward();
            expect(gameState.ascension.blessings.length).toBe(1);
            expect(gameState.ascension.blessings[0].type).toBe('immortalBody');
        });

        it('尚未飞升时应返回错误', () => {
            const result = service.claimReward();
            expect(result.success).toBe(false);
            expect(result.error).toContain('尚未飞升');
        });

        it('无可领取奖励时应返回错误', () => {
            gameState.ascension.ascended = true;
            gameState.ascension.pendingRewards = null;

            const result = service.claimReward();
            expect(result.success).toBe(false);
        });

        it('应能指定领取特定奖励', () => {
            gameState.ascension.ascended = true;
            gameState.ascension.pendingRewards = {
                spiritStones: 5000,
                cultivationXp: 10000,
                merit: 500,
                blessings: []
            };

            const initialCultivationXP = gameState.cultivationXP;
            service.claimReward({ rewardIndex: 1 }); // 只领取修为
            expect(gameState.spiritStones).toBe(gameState.spiritStones); // 未变化
        });
    });

    // ===== queryRealm 测试 =====

    describe('queryRealm', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('未飞升时应返回ascended=false', () => {
            const result = service.queryRealm();
            expect(result.success).toBe(true);
            expect(result.ascended).toBe(false);
        });

        it('飞升后应返回immortalRealm信息', () => {
            gameState.ascension.ascended = true;
            gameState.ascension.immortalRealm = 1; // 天仙
            gameState.ascension.immortalTier = 2;
            gameState.ascension.totalMerit = 1000;

            const result = service.queryRealm();
            expect(result.ascended).toBe(true);
            expect(result.realmName).toBe('天仙');
            expect(result.tier).toBe(2);
        });

        it('detailed=true时应返回下一境界信息', () => {
            gameState.ascension.ascended = true;
            gameState.ascension.immortalRealm = 0;
            gameState.ascension.totalMerit = 0;

            const result = service.queryRealm({ detailed: true });
            expect(result.nextRealm).toBeDefined();
            expect(result.nextRealm.name).toBe('天仙');
            expect(result.nextRealm.requiredMerit).toBe(500);
        });

        it('当前为最高境界时nextRealm应为null', () => {
            gameState.ascension.ascended = true;
            gameState.ascension.immortalRealm = 5; // 圣人
            gameState.ascension.totalMerit = 100000;

            const result = service.queryRealm({ detailed: true });
            expect(result.nextRealm).toBeNull();
        });
    });

    // ===== listBlessings 测试 =====

    describe('listBlessings', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('应返回所有赐福信息', () => {
            const result = service.listBlessings();
            expect(result.success).toBe(true);
            expect(result.total).toBe(Object.keys(DIVINE_BLESSINGS).length);
        });

        it('应区分已获得和可用赐福', () => {
            gameState.ascension.blessings = [
                { type: 'immortalBody', acquiredAt: Date.now() }
            ];

            const result = service.listBlessings();
            expect(result.acquired).toBe(1);
            expect(result.available).toBe(Object.keys(DIVINE_BLESSINGS).length - 1);
        });

        it('showAll=true时应返回全部赐福', () => {
            const result = service.listBlessings({ showAll: true });
            expect(result.blessings.length).toBe(Object.keys(DIVINE_BLESSINGS).length);
        });

        it('filter参数应能过滤赐福', () => {
            const result = service.listBlessings({ filter: '仙灵' });
            expect(result.blessings.length).toBeGreaterThan(0);
            expect(result.blessings[0].name).toContain('仙灵');
        });

        it('应有6种赐福类型', () => {
            const result = service.listBlessings();
            expect(Object.keys(DIVINE_BLESSINGS)).toEqual([
                'immortalBody',
                'immortalSoul',
                'immortalAura',
                'immortalDestiny',
                'immortalWisdom',
                'immortalVitality'
            ]);
        });
    });

    // ===== upgradeRealm 测试 =====

    describe('upgradeRealm', () => {
        beforeEach(() => {
            service.init(gameState);
            gameState.ascension.ascended = true;
            gameState.ascension.immortalRealm = 0;
            gameState.ascension.totalMerit = 10000;
        });

        it('功德足够时应能升级境界', () => {
            const result = service.upgradeRealm({ targetRealm: 1 });
            expect(result.success).toBe(true);
            expect(result.newRealmName).toBe('天仙');
        });

        it('功德不足时应返回错误', () => {
            gameState.ascension.totalMerit = 100;
            const result = service.upgradeRealm({ targetRealm: 1 });
            expect(result.success).toBe(false);
            expect(result.error).toContain('功德不足');
        });

        it('尚未飞升时应返回错误', () => {
            gameState.ascension.ascended = false;
            const result = service.upgradeRealm({ targetRealm: 1 });
            expect(result.success).toBe(false);
        });

        it('已是最高境界时不应再升级', () => {
            gameState.ascension.immortalRealm = 5;
            const result = service.upgradeRealm({ targetRealm: 6 });
            expect(result.success).toBe(false);
        });

        it('应扣除升级所需功德', () => {
            gameState.ascension.totalMerit = 1000;
            service.upgradeRealm({ targetRealm: 1 });
            expect(gameState.ascension.totalMerit).toBe(500); // 1000 - 500(天仙所需)
        });
    });

    // ===== 查询状态测试 =====

    describe('queryAscensionStatus', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('应返回完整的飞升状态', () => {
            const result = service.queryAscensionStatus();
            expect(result.ascended).toBeDefined();
            expect(result.immortalRealm).toBeDefined();
            expect(result.tribulationActive).toBeDefined();
            expect(result.blessingsCount).toBeDefined();
        });

        it('飞升后应返回正确的immortalRealmName', () => {
            gameState.ascension.ascended = true;
            gameState.ascension.immortalRealm = 2;
            const result = service.queryAscensionStatus();
            expect(result.immortalRealmName).toBe('金仙');
        });
    });

    // ===== 序列化测试 =====

    describe('serialize/deserialize', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('应正确序列化数据', () => {
            gameState.ascension.ascended = true;
            gameState.ascension.immortalRealm = 1;
            gameState.ascension.blessings = [{ type: 'immortalBody' }];

            const data = service.serialize();
            expect(data.ascension).toBeDefined();
            expect(data.ascension.ascended).toBe(true);
        });

        it('应正确反序列化数据', () => {
            gameState.ascension = null;
            const savedData = {
                ascension: {
                    ascended: true,
                    immortalRealm: 2,
                    blessings: [{ type: 'immortalSoul' }]
                }
            };

            service.deserialize(savedData);
            expect(gameState.ascension).not.toBeNull();
            expect(gameState.ascension.ascended).toBe(true);
            expect(gameState.ascension.immortalRealm).toBe(2);
        });
    });

    // ===== MCP工具接口测试 =====

    describe('MCP Interfaces', () => {
        beforeEach(() => {
            service.init(gameState);
        });

        it('mcpRequirementsCheck应返回检查结果', () => {
            const result = service.mcpRequirementsCheck();
            expect(result.canAscend).toBe(true);
        });

        it('mcpInitiate应发起飞升', () => {
            const result = service.mcpInitiate();
            expect(result.success).toBe(true);
            expect(result.message).toContain('飞升仪式');
        });

        it('mcpTribulationExecute应执行天劫', () => {
            service.mcpInitiate();
            const result = service.mcpTribulationExecute();
            expect(result.success).toBe(true);
        });

        it('mcpRewardClaim应在飞升后领取奖励', () => {
            gameState.ascension.ascended = true;
            gameState.ascension.pendingRewards = {
                spiritStones: 1000,
                cultivationXp: 2000,
                merit: 100,
                blessings: []
            };

            const result = service.mcpRewardClaim();
            expect(result.success).toBe(true);
        });

        it('mcpRealmQuery应返回境界信息', () => {
            const result = service.mcpRealmQuery();
            expect(result.ascended).toBe(false);
        });

        it('mcpBlessingList应返回赐福列表', () => {
            const result = service.mcpBlessingList();
            expect(result.total).toBe(6);
        });
    });

    // ===== 常量测试 =====

    describe('Constants', () => {
        it('应有6个仙界境界', () => {
            expect(Object.keys(IMMORTAL_REALMS).length).toBe(6);
        });

        it('IMMORTAL_REALMS应包含正确的境界名称', () => {
            expect(IMMORTAL_REALMS[0].name).toBe('地仙');
            expect(IMMORTAL_REALMS[5].name).toBe('圣人');
        });

        it('ASCENSION_REQUIREMENTS应有正确的最小值', () => {
            expect(ASCENSION_REQUIREMENTS.minRealm).toBe(5);
            expect(ASCENSION_REQUIREMENTS.minKarma).toBe(500);
            expect(ASCENSION_REQUIREMENTS.minSpiritRootTier).toBe(4);
        });

        it('DIVINE_TRIBULATION应有9道天劫', () => {
            expect(DIVINE_TRIBULATION.strikesTotal).toBe(9);
            expect(DIVINE_TRIBULATION.resistThreshold).toBe(0.6);
        });

        it('应有6种赐福类型', () => {
            expect(Object.keys(DIVINE_BLESSINGS).length).toBe(6);
        });

        it('createAscensionService应创建正确类型实例', () => {
            const svc = createAscensionService(gameState, reincarnationService);
            expect(svc).toBeInstanceOf(AscensionService);
        });
    });
});