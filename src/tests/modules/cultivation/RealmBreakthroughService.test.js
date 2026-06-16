/**
 * RealmBreakthroughService 测试 - 境界层次突破系统
 * V260 方向A迭代2/9: ruflo层次分解 + thunderbolt pipeline
 * 
 * 测试覆盖率目标: ≥99%
 * 测试通过率目标: 100%
 */

// Vitest globals setup
global.GameGlobal = {
    getDB: () => null,
    setDB: () => null
};

// Import using ES modules
import { 
    RealmBreakthroughService, 
    REALM_HIERARCHY, 
    PIPELINE_STAGES, 
    BREAKTHROUGH_STATES,
    BREAKTHROUGH_CONFIG
} from '../../../domains/cultivation/services/RealmBreakthroughService.js';

// ========== 常量测试 ==========
describe('RealmBreakthroughService Constants', () => {
    test('REALM_HIERARCHY should have 11 levels (0-10)', () => {
        expect(REALM_HIERARCHY).toHaveLength(11);
    });

    test('REALM_HIERARCHY should start with mortal (凡人)', () => {
        expect(REALM_HIERARCHY[0].name).toBe('凡人');
        expect(REALM_HIERARCHY[0].level).toBe(0);
        expect(REALM_HIERARCHY[0].minSpiritEnergy).toBe(0);
    });

    test('REALM_HIERARCHY should have correct realm progression', () => {
        expect(REALM_HIERARCHY[1].name).toBe('炼气');
        expect(REALM_HIERARCHY[2].name).toBe('筑基');
        expect(REALM_HIERARCHY[3].name).toBe('金丹');
        expect(REALM_HIERARCHY[4].name).toBe('元婴');
        expect(REALM_HIERARCHY[5].name).toBe('化神');
        expect(REALM_HIERARCHY[6].name).toBe('炼虚');
        expect(REALM_HIERARCHY[7].name).toBe('合体');
        expect(REALM_HIERARCHY[8].name).toBe('大乘');
        expect(REALM_HIERARCHY[9].name).toBe('渡劫');
        expect(REALM_HIERARCHY[10].name).toBe('真仙');
    });

    test('REALM_HIERARCHY spirit energy should increase with realm', () => {
        for (let i = 1; i < REALM_HIERARCHY.length - 1; i++) {
            expect(REALM_HIERARCHY[i].minSpiritEnergy).toBeGreaterThan(
                REALM_HIERARCHY[i-1].minSpiritEnergy
            );
        }
    });

    test('REALM_HIERARCHY baseSuccessRate should decrease with realm', () => {
        for (let i = 1; i < REALM_HIERARCHY.length - 1; i++) {
            expect(REALM_HIERARCHY[i].baseSuccessRate).toBeLessThan(
                REALM_HIERARCHY[i-1].baseSuccessRate
            );
        }
    });

    test('PIPELINE_STAGES should have 5 stages', () => {
        expect(Object.keys(PIPELINE_STAGES)).toHaveLength(5);
        expect(PIPELINE_STAGES.ABSORB).toBe('absorb');
        expect(PIPELINE_STAGES.COMPRESS).toBe('compress');
        expect(PIPELINE_STAGES.CONDENSE).toBe('condense');
        expect(PIPELINE_STAGES.TRANSFORM).toBe('transform');
        expect(PIPELINE_STAGES.BREAKTHROUGH).toBe('breakthrough');
    });

    test('BREAKTHROUGH_STATES should have all states', () => {
        expect(BREAKTHROUGH_STATES.IDLE).toBe('idle');
        expect(BREAKTHROUGH_STATES.ABSORBING).toBe('absorbing');
        expect(BREAKTHROUGH_STATES.COMPRESSING).toBe('compressing');
        expect(BREAKTHROUGH_STATES.CONDENSING).toBe('condensing');
        expect(BREAKTHROUGH_STATES.TRANSFORMING).toBe('transforming');
        expect(BREAKTHROUGH_STATES.SUCCESS).toBe('success');
        expect(BREAKTHROUGH_STATES.FAILED).toBe('failed');
    });

    test('BREAKTHROUGH_CONFIG should have correct values', () => {
        expect(BREAKTHROUGH_CONFIG.stageBaseTime).toBe(1000);
        expect(BREAKTHROUGH_CONFIG.realmTimeMultiplier).toBe(1.2);
        expect(BREAKTHROUGH_CONFIG.spiritConsumptionRatio).toBe(0.8);
        expect(BREAKTHROUGH_CONFIG.failureSpiritLoss).toBe(0.3);
        expect(BREAKTHROUGH_CONFIG.maxHistorySize).toBe(50);
    });
});

// ========== 初始化测试 ==========
describe('RealmBreakthroughService Initialization', () => {
    test('should initialize with default values', () => {
        const gs = {};
        const service = new RealmBreakthroughService(gs);
        const result = service.init(gs);
        
        expect(result.realmBreakthrough).toBeDefined();
        expect(result.realmBreakthrough.currentRealm).toBe(0);
        expect(result.realmBreakthrough.spiritEnergy).toBe(0);
        expect(result.realmBreakthrough.pipelineStage).toBe(BREAKTHROUGH_STATES.IDLE);
        expect(result.realmBreakthrough.pipelineProgress).toBe(0);
        expect(result.realmBreakthrough.totalBreakthroughs).toBe(0);
        expect(result.realmBreakthrough.successCount).toBe(0);
        expect(result.realmBreakthrough.failureCount).toBe(0);
    });

    test('should preserve existing realmBreakthrough state', () => {
        const gs = {
            realmBreakthrough: {
                currentRealm: 5,
                spiritEnergy: 5000,
                pipelineStage: BREAKTHROUGH_STATES.SUCCESS,
                totalBreakthroughs: 10,
                successCount: 8,
                failureCount: 2
            }
        };
        const service = new RealmBreakthroughService(gs);
        const result = service.init(gs);
        
        expect(result.realmBreakthrough.currentRealm).toBe(5);
        expect(result.realmBreakthrough.spiritEnergy).toBe(5000);
    });

    test('should initialize history array if missing', () => {
        const gs = { realmBreakthrough: {} };
        const service = new RealmBreakthroughService(gs);
        const result = service.init(gs);
        
        expect(result.realmBreakthrough.history).toEqual([]);
    });
});

// ========== getRealmInfo 测试 ==========
describe('RealmBreakthroughService.getRealmInfo', () => {
    test('should return correct realm info for mortal', () => {
        const gs = { realmBreakthrough: { currentRealm: 0, spiritEnergy: 50 } };
        const service = new RealmBreakthroughService(gs);
        service.init(gs);
        
        const info = service.getRealmInfo();
        expect(info.level).toBe(0);
        expect(info.name).toBe('凡人');
        expect(info.spiritEnergy).toBe(50);
        expect(info.nextRealm).not.toBeNull();
        expect(info.nextRealm.name).toBe('炼气');
    });

    test('should return correct realm info for higher realm', () => {
        const gs = { realmBreakthrough: { currentRealm: 3, spiritEnergy: 3000 } };
        const service = new RealmBreakthroughService(gs);
        service.init(gs);
        
        const info = service.getRealmInfo();
        expect(info.level).toBe(3);
        expect(info.name).toBe('金丹');
        expect(info.spiritEnergy).toBe(3000);
        expect(info.nextRealm.name).toBe('元婴');
    });

    test('should return null for nextRealm when at max level', () => {
        const gs = { realmBreakthrough: { currentRealm: 10, spiritEnergy: 100000 } };
        const service = new RealmBreakthroughService(gs);
        service.init(gs);
        
        const info = service.getRealmInfo();
        expect(info.level).toBe(10);
        expect(info.name).toBe('真仙');
        expect(info.nextRealm).toBeNull();
    });
});

// ========== getPipelineStatus 测试 ==========
describe('RealmBreakthroughService.getPipelineStatus', () => {
    test('should return correct pipeline status', () => {
        const gs = { 
            realmBreakthrough: { 
                currentRealm: 2, 
                spiritEnergy: 1000,
                pipelineStage: BREAKTHROUGH_STATES.COMPRESSING,
                pipelineProgress: 50
            }
        };
        const service = new RealmBreakthroughService(gs);
        service.init(gs);
        
        const status = service.getPipelineStatus();
        expect(status.stage).toBe(BREAKTHROUGH_STATES.COMPRESSING);
        expect(status.progress).toBe(50);
        expect(status.currentRealm).toBe(2);
        expect(status.spiritEnergy).toBe(1000);
    });
});

// ========== calculateSuccessRate 测试 ==========
describe('RealmBreakthroughService.calculateSuccessRate', () => {
    test('should return 0 for invalid realm', () => {
        const gs = { realmBreakthrough: { currentRealm: 0, spiritEnergy: 1000 } };
        const service = new RealmBreakthroughService(gs);
        service.init(gs);
        
        expect(service.calculateSuccessRate(15)).toBe(0);
        expect(service.calculateSuccessRate(-1)).toBe(0);
    });

    test('should return base success rate with no spirit bonus', () => {
        const gs = { realmBreakthrough: { currentRealm: 0, spiritEnergy: 0 } };
        const service = new RealmBreakthroughService(gs);
        service.init(gs);
        
        // 金丹境 (level 3) base rate is 0.85
        const rate = service.calculateSuccessRate(3);
        expect(rate).toBeGreaterThanOrEqual(0.85);
        expect(rate).toBeLessThanOrEqual(0.99);
    });

    test('should increase success rate with spirit energy', () => {
        const gs = { realmBreakthrough: { currentRealm: 0, spiritEnergy: 1000 } };
        const service = new RealmBreakthroughService(gs);
        service.init(gs);
        
        const rateLow = service.calculateSuccessRate(2); // 筑基
        const rateHigh = service.calculateSuccessRate(2);
        expect(rateHigh).toBeGreaterThanOrEqual(rateLow);
    });

    test('should cap at 0.99', () => {
        const gs = { realmBreakthrough: { currentRealm: 0, spiritEnergy: 1000000 } };
        const service = new RealmBreakthroughService(gs);
        service.init(gs);
        
        const rate = service.calculateSuccessRate(1);
        expect(rate).toBeLessThanOrEqual(0.99);
    });
});

// ========== addSpiritEnergy 测试 ==========
describe('RealmBreakthroughService.addSpiritEnergy', () => {
    test('should add spirit energy correctly', () => {
        const gs = { realmBreakthrough: { currentRealm: 1, spiritEnergy: 100 } };
        const service = new RealmBreakthroughService(gs);
        service.init(gs);
        
        const result = service.addSpiritEnergy(500);
        
        expect(result.success).toBe(true);
        expect(result.added).toBe(500);
        expect(result.total).toBe(600);
        expect(service.pipelineState.spiritEnergy).toBe(600);
    });

    test('should handle zero amount', () => {
        const gs = { realmBreakthrough: { currentRealm: 0, spiritEnergy: 0 } };
        const service = new RealmBreakthroughService(gs);
        service.init(gs);
        
        const result = service.addSpiritEnergy(0);
        expect(result.success).toBe(true);
        expect(result.total).toBe(0);
    });
});

// ========== startBreakthrough 测试 ==========
describe('RealmBreakthroughService.startBreakthrough', () => {
    test('should fail when at max realm', () => {
        const gs = { realmBreakthrough: { currentRealm: 10, spiritEnergy: 100000 } };
        const service = new RealmBreakthroughService(gs);
        service.init(gs);
        
        const result = service.startBreakthrough({ spiritEnergy: 1000 });
        expect(result.success).toBe(false);
        expect(result.message).toContain('最高境界');
    });

    test('should fail when insufficient spirit energy', () => {
        const gs = { realmBreakthrough: { currentRealm: 1, spiritEnergy: 50 } };
        const service = new RealmBreakthroughService(gs);
        service.init(gs);
        
        const result = service.startBreakthrough({});
        expect(result.success).toBe(false);
        expect(result.message).toContain('灵气不足');
    });

    test('should start breakthrough with sufficient spirit energy', () => {
        const gs = { realmBreakthrough: { currentRealm: 1, spiritEnergy: 200 } };
        const service = new RealmBreakthroughService(gs);
        service.init(gs);
        
        const result = service.startBreakthrough({});
        expect(result.success).toBe(true);
        expect(result.stage).toBe(BREAKTHROUGH_STATES.ABSORBING);
        expect(result.message).toContain('突破开始');
        expect(result.targetName).toBe('筑基');
    });

    test('should add provided spirit energy', () => {
        const gs = { realmBreakthrough: { currentRealm: 0, spiritEnergy: 50 } };
        const service = new RealmBreakthroughService(gs);
        service.init(gs);
        
        const result = service.startBreakthrough({ spiritEnergy: 100 });
        expect(result.success).toBe(true);
        expect(service.pipelineState.spiritEnergy).toBe(150);
    });
});

// ========== executePipelineStep 测试 ==========
describe('RealmBreakthroughService.executePipelineStep', () => {
    test('should return idle message when no breakthrough', () => {
        const gs = { realmBreakthrough: { currentRealm: 0, spiritEnergy: 100, pipelineStage: BREAKTHROUGH_STATES.IDLE } };
        const service = new RealmBreakthroughService(gs);
        service.init(gs);
        
        const result = service.executePipelineStep();
        expect(result.stage).toBe(BREAKTHROUGH_STATES.IDLE);
        expect(result.message).toContain('无进行中的突破');
    });

    test('should progress from absorbing to compressing', () => {
        const gs = { realmBreakthrough: { currentRealm: 1, spiritEnergy: 600, pipelineStage: BREAKTHROUGH_STATES.ABSORBING } };
        const service = new RealmBreakthroughService(gs);
        service.init(gs);
        
        const result = service.executePipelineStep();
        expect(result.stage).toBe(BREAKTHROUGH_STATES.COMPRESSING);
        expect(result.progress).toBe(25);
    });

    test('should progress from compressing to condensing', () => {
        const gs = { realmBreakthrough: { currentRealm: 1, spiritEnergy: 600, pipelineStage: BREAKTHROUGH_STATES.COMPRESSING } };
        const service = new RealmBreakthroughService(gs);
        service.init(gs);
        
        const result = service.executePipelineStep();
        expect(result.stage).toBe(BREAKTHROUGH_STATES.CONDENSING);
        expect(result.progress).toBe(50);
    });

    test('should progress from condensing to transforming', () => {
        const gs = { realmBreakthrough: { currentRealm: 1, spiritEnergy: 600, pipelineStage: BREAKTHROUGH_STATES.CONDENSING } };
        const service = new RealmBreakthroughService(gs);
        service.init(gs);
        
        const result = service.executePipelineStep();
        expect(result.stage).toBe(BREAKTHROUGH_STATES.TRANSFORMING);
        expect(result.progress).toBe(75);
    });
});

// ========== resetPipeline 测试 ==========
describe('RealmBreakthroughService.resetPipeline', () => {
    test('should reset pipeline to idle state', () => {
        const gs = { realmBreakthrough: { 
            currentRealm: 2, 
            spiritEnergy: 1000,
            pipelineStage: BREAKTHROUGH_STATES.SUCCESS,
            pipelineProgress: 100
        }};
        const service = new RealmBreakthroughService(gs);
        service.init(gs);
        
        service.resetPipeline();
        expect(service.pipelineState.pipelineStage).toBe(BREAKTHROUGH_STATES.IDLE);
        expect(service.pipelineState.pipelineProgress).toBe(0);
    });
});

// ========== getHistory 测试 ==========
describe('RealmBreakthroughService.getHistory', () => {
    test('should return empty array when no history', () => {
        const gs = { realmBreakthrough: { history: [] } };
        const service = new RealmBreakthroughService(gs);
        service.init(gs);
        
        const history = service.getHistory();
        expect(history).toEqual([]);
    });

    test('should return limited history', () => {
        const gs = { realmBreakthrough: { 
            history: [
                { result: 'success', details: { fromRealm: 1, toRealm: 2 }, timestamp: 1000 },
                { result: 'success', details: { fromRealm: 2, toRealm: 3 }, timestamp: 2000 },
                { result: 'failed', details: { targetRealm: 4 }, timestamp: 3000 }
            ]
        }};
        const service = new RealmBreakthroughService(gs);
        service.init(gs);
        
        const history = service.getHistory(2);
        expect(history).toHaveLength(2);
        expect(history[0].timestamp).toBe(2000);
    });
});

// ========== MCP工具测试 ==========
describe('RealmBreakthroughService MCP Tools', () => {
    describe('mcpRealmBreakthrough', () => {
        test('should start breakthrough from idle state', () => {
            const gs = { realmBreakthrough: { currentRealm: 1, spiritEnergy: 600, pipelineStage: BREAKTHROUGH_STATES.IDLE } };
            const service = new RealmBreakthroughService(gs);
            service.init(gs);
            
            const result = service.mcpRealmBreakthrough({});
            expect(result.success).toBe(true);
            expect(result.stage).toBe(BREAKTHROUGH_STATES.ABSORBING);
        });

        test('should execute pipeline step when in progress', () => {
            const gs = { realmBreakthrough: { currentRealm: 1, spiritEnergy: 600, pipelineStage: BREAKTHROUGH_STATES.ABSORBING } };
            const service = new RealmBreakthroughService(gs);
            service.init(gs);
            
            const result = service.mcpRealmBreakthrough({});
            expect(result.stage).toBe(BREAKTHROUGH_STATES.COMPRESSING);
        });
    });

    describe('mcpRealmStatus', () => {
        test('should return complete status', () => {
            const gs = { realmBreakthrough: { 
                currentRealm: 3, 
                spiritEnergy: 2500,
                pipelineStage: BREAKTHROUGH_STATES.IDLE,
                totalBreakthroughs: 5,
                successCount: 4,
                failureCount: 1,
                history: [{ result: 'success', details: {}, timestamp: 1000 }]
            }};
            const service = new RealmBreakthroughService(gs);
            service.init(gs);
            
            const result = service.mcpRealmStatus();
            expect(result.success).toBe(true);
            expect(result.level).toBe(3);
            expect(result.name).toBe('金丹');
            expect(result.stats.totalBreakthroughs).toBe(5);
            expect(result.stats.successCount).toBe(4);
            expect(result.stats.successRate).toBe('80.0%');
        });
    });

    describe('mcpRealmPipeline', () => {
        test('should return pipeline status with stage info', () => {
            const gs = { realmBreakthrough: { 
                currentRealm: 2, 
                spiritEnergy: 1000,
                pipelineStage: BREAKTHROUGH_STATES.CONDENSING,
                pipelineProgress: 50
            }};
            const service = new RealmBreakthroughService(gs);
            service.init(gs);
            
            const result = service.mcpRealmPipeline();
            expect(result.success).toBe(true);
            expect(result.stage).toBe(BREAKTHROUGH_STATES.CONDENSING);
            expect(result.stageInfo).toContain('凝结');
        });
    });
});