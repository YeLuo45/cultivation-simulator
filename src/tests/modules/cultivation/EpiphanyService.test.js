/**
 * EpiphanyService 测试 - 顿悟触发系统
 * V261 方向A迭代3/9: generic-agent目标驱动 + thunderbolt pipeline加速
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
import { EpiphanyService } from '../../../domains/cultivation/services/EpiphanyService.js';

// Helper to import constants from service (via module evaluation)
const EPIPHANY_TYPES = {
    CULTIVATION_INSIGHT: {
        id: 'cultivation_insight',
        name: '修炼顿悟',
        description: '修炼瓶颈突然贯通',
        minPlateauDays: 3,
        insightThreshold: 100,
        pipelineBoost: 4,
        rewardMultiplier: 1.5
    },
    COMPREHENSION_BURST: {
        id: 'comprehension_burst',
        name: '领悟爆发',
        description: '功法理解突飞猛进',
        minPlateauDays: 5,
        insightThreshold: 200,
        pipelineBoost: 3,
        rewardMultiplier: 2.0
    },
    HEAVENLY_REVELATION: {
        id: 'heavenly_revelation',
        name: '天机显现',
        description: '天道奥秘直接传授',
        minPlateauDays: 10,
        insightThreshold: 500,
        pipelineBoost: 5,
        rewardMultiplier: 3.0
    }
};

const EPIPHANY_STATES = {
    DORMANT: 'dormant',
    ACCUMULATING: 'accumulating',
    TRIGGERED: 'triggered',
    PROCESSING: 'processing',
    COMPLETED: 'completed'
};

const EPIPHANY_CONFIG = {
    insightPerCultivate: 5,
    dailyBaseInsight: 2,
    baseTriggerChance: 0.01,
    insightOverflowBonus: 0.01,
    pipelineAcceleration: true,
    maxHistorySize: 30
};

// ========== 初始化测试 ==========
describe('EpiphanyService Initialization', () => {
    test('should initialize with default values', () => {
        const gs = {};
        const service = new EpiphanyService(gs);
        const result = service.init(gs);
        
        expect(result.epiphany).toBeDefined();
        expect(result.epiphany.state).toBe(EPIPHANY_STATES.DORMANT);
        expect(result.epiphany.insightPoints).toBe(0);
        expect(result.epiphany.plateauDays).toBe(0);
        expect(result.epiphany.totalEpiphanies).toBe(0);
        expect(result.epiphany.currentEpiphanyType).toBeNull();
    });

    test('should preserve existing epiphany state', () => {
        const gs = {
            epiphany: {
                state: EPIPHANY_STATES.TRIGGERED,
                insightPoints: 150,
                plateauDays: 5,
                totalEpiphanies: 3
            }
        };
        const service = new EpiphanyService(gs);
        const result = service.init(gs);
        
        expect(result.epiphany.insightPoints).toBe(150);
        expect(result.epiphany.totalEpiphanies).toBe(3);
    });
});

// ========== accumulateInsight 测试 ==========
describe('EpiphanyService.accumulateInsight', () => {
    test('should add insight points correctly', () => {
        const gs = { epiphany: { state: EPIPHANY_STATES.DORMANT, insightPoints: 0, insightHistory: [], plateauDays: 0, totalEpiphanies: 0, currentEpiphanyType: null, epiphanyHistory: [], lastCultivateTime: null } };
        const service = new EpiphanyService(gs);
        service.init(gs);
        
        const result = service.accumulateInsight({ amount: 50, reason: '修炼功法' });
        
        expect(result.success).toBe(true);
        expect(result.added).toBe(50);
        expect(result.total).toBe(50);
        expect(gs.epiphany.insightPoints).toBe(50);
    });

    test('should use default values when not provided', () => {
        const gs = { epiphany: { state: EPIPHANY_STATES.DORMANT, insightPoints: 0, insightHistory: [], plateauDays: 0, totalEpiphanies: 0, currentEpiphanyType: null, epiphanyHistory: [], lastCultivateTime: null } };
        const service = new EpiphanyService(gs);
        service.init(gs);
        
        const result = service.accumulateInsight({});
        
        expect(result.success).toBe(true);
        expect(result.added).toBe(EPIPHANY_CONFIG.insightPerCultivate);
        expect(result.reason).toBe('修炼');
    });

    test('should record history', () => {
        const gs = { epiphany: { state: EPIPHANY_STATES.DORMANT, insightPoints: 0, insightHistory: [], plateauDays: 0, totalEpiphanies: 0, currentEpiphanyType: null, epiphanyHistory: [], lastCultivateTime: null } };
        const service = new EpiphanyService(gs);
        service.init(gs);
        
        service.accumulateInsight({ amount: 20, reason: '闭关' });
        
        expect(gs.epiphany.insightHistory.length).toBe(1);
        expect(gs.epiphany.insightHistory[0].amount).toBe(20);
        expect(gs.epiphany.insightHistory[0].reason).toBe('闭关');
    });

    test('should set state to accumulating', () => {
        const gs = { epiphany: { state: EPIPHANY_STATES.DORMANT, insightPoints: 0, insightHistory: [], plateauDays: 0, totalEpiphanies: 0, currentEpiphanyType: null, epiphanyHistory: [], lastCultivateTime: null } };
        const service = new EpiphanyService(gs);
        service.init(gs);
        
        service.accumulateInsight({ amount: 10 });
        
        expect(gs.epiphany.state).toBe(EPIPHANY_STATES.ACCUMULATING);
    });

    test('should limit history size', () => {
        const gs = { epiphany: { state: EPIPHANY_STATES.DORMANT, insightPoints: 0, insightHistory: [], plateauDays: 0, totalEpiphanies: 0, currentEpiphanyType: null, epiphanyHistory: [], lastCultivateTime: null } };
        const service = new EpiphanyService(gs);
        service.init(gs);
        
        // Add more than maxHistorySize entries
        for (let i = 0; i < 35; i++) {
            service.accumulateInsight({ amount: 1, reason: `修炼${i}` });
        }
        
        expect(gs.epiphany.insightHistory.length).toBeLessThanOrEqual(EPIPHANY_CONFIG.maxHistorySize);
    });
});

// ========== tryTriggerEpiphany 测试 ==========
describe('EpiphanyService.tryTriggerEpiphany', () => {
    test('should fail when insufficient insight', () => {
        const gs = { epiphany: { state: EPIPHANY_STATES.ACCUMULATING, insightPoints: 10, insightHistory: [], plateauDays: 1, totalEpiphanies: 0, currentEpiphanyType: null, epiphanyHistory: [], lastCultivateTime: null } };
        const service = new EpiphanyService(gs);
        service.init(gs);
        
        const result = service.tryTriggerEpiphany({});
        
        expect(result.success).toBe(false);
        expect(result.message).toContain('机缘未到');
        expect(result.triggerChance).toBeDefined();
    });

    test('should return insight needed info', () => {
        const gs = { epiphany: { state: EPIPHANY_STATES.ACCUMULATING, insightPoints: 50, insightHistory: [], plateauDays: 1, totalEpiphanies: 0, currentEpiphanyType: null, epiphanyHistory: [], lastCultivateTime: null } };
        const service = new EpiphanyService(gs);
        service.init(gs);
        
        const result = service.tryTriggerEpiphany({});
        
        expect(result.insightNeeded).toBeDefined();
        expect(result.insightNeeded.type).toBe('修炼顿悟');
        expect(result.insightNeeded.needed).toBeGreaterThan(0);
    });
});

// ========== triggerEpiphany 测试 ==========
describe('EpiphanyService.triggerEpiphany', () => {
    test('should trigger cultivation insight type', () => {
        const gs = { epiphany: { state: EPIPHANY_STATES.ACCUMULATING, insightPoints: 100, insightHistory: [], plateauDays: 5, totalEpiphanies: 0, currentEpiphanyType: null, epiphanyHistory: [], lastCultivateTime: null } };
        const service = new EpiphanyService(gs);
        service.init(gs);
        
        const result = service.triggerEpiphany(EPIPHANY_TYPES.CULTIVATION_INSIGHT);
        
        expect(result.success).toBe(true);
        expect(result.type).toBe('cultivation_insight');
        expect(result.name).toBe('修炼顿悟');
        expect(result.pipelineBoost).toBe(4);
        expect(result.rewardMultiplier).toBe(1.5);
    });

    test('should trigger heavenly revelation type', () => {
        const gs = { epiphany: { state: EPIPHANY_STATES.ACCUMULATING, insightPoints: 500, insightHistory: [], plateauDays: 10, totalEpiphanies: 0, currentEpiphanyType: null, epiphanyHistory: [], lastCultivateTime: null } };
        const service = new EpiphanyService(gs);
        service.init(gs);
        
        const result = service.triggerEpiphany(EPIPHANY_TYPES.HEAVENLY_REVELATION);
        
        expect(result.success).toBe(true);
        expect(result.type).toBe('heavenly_revelation');
        expect(result.pipelineBoost).toBe(5);
        expect(result.rewardMultiplier).toBe(3.0);
    });

    test('should increment total epiphanies', () => {
        const gs = { epiphany: { state: EPIPHANY_STATES.ACCUMULATING, insightPoints: 100, insightHistory: [], plateauDays: 5, totalEpiphanies: 2, currentEpiphanyType: null, epiphanyHistory: [], lastCultivateTime: null } };
        const service = new EpiphanyService(gs);
        service.init(gs);
        
        service.triggerEpiphany(EPIPHANY_TYPES.CULTIVATION_INSIGHT);
        
        expect(gs.epiphany.totalEpiphanies).toBe(3);
    });
});

// ========== processEpiphany 测试 ==========
describe('EpiphanyService.processEpiphany', () => {
    test('should fail when no triggered epiphany', () => {
        const gs = { epiphany: { state: EPIPHANY_STATES.ACCUMULATING, insightPoints: 100, insightHistory: [], plateauDays: 5, totalEpiphanies: 0, currentEpiphanyType: null, epiphanyHistory: [], lastCultivateTime: null } };
        const service = new EpiphanyService(gs);
        service.init(gs);
        
        const result = service.processEpiphany({});
        
        expect(result.success).toBe(false);
        expect(result.message).toContain('没有待处理的顿悟');
    });

    test('should process triggered epiphany', () => {
        const gs = { epiphany: { state: EPIPHANY_STATES.TRIGGERED, insightPoints: 150, insightHistory: [], plateauDays: 5, totalEpiphanies: 1, currentEpiphanyType: 'cultivation_insight', epiphanyHistory: [], lastCultivateTime: null } };
        const service = new EpiphanyService(gs);
        service.init(gs);
        
        const result = service.processEpiphany({});
        
        expect(result.success).toBe(true);
        expect(result.name).toBe('修炼顿悟');
        expect(result.pipelineStagesSkipped).toBe(4);
        expect(result.rewardBonus).toBe('50%');
        expect(gs.epiphany.state).toBe(EPIPHANY_STATES.COMPLETED);
    });

    test('should consume insight points', () => {
        const gs = { epiphany: { state: EPIPHANY_STATES.TRIGGERED, insightPoints: 150, insightHistory: [], plateauDays: 5, totalEpiphanies: 1, currentEpiphanyType: 'cultivation_insight', epiphanyHistory: [], lastCultivateTime: null } };
        const service = new EpiphanyService(gs);
        service.init(gs);
        
        service.processEpiphany({});
        
        expect(gs.epiphany.insightPoints).toBe(50); // 150 - 100 threshold
    });

    test('should record epiphany history', () => {
        const gs = { epiphany: { state: EPIPHANY_STATES.TRIGGERED, insightPoints: 200, insightHistory: [], plateauDays: 5, totalEpiphanies: 1, currentEpiphanyType: 'comprehension_burst', epiphanyHistory: [], lastCultivateTime: null } };
        const service = new EpiphanyService(gs);
        service.init(gs);
        
        service.processEpiphany({});
        
        expect(gs.epiphany.epiphanyHistory.length).toBe(1);
        expect(gs.epiphany.epiphanyHistory[0].type).toBe('comprehension_burst');
    });
});

// ========== getInsightNeededForNextEpiphany 测试 ==========
describe('EpiphanyService.getInsightNeededForNextEpiphany', () => {
    test('should return cultivation insight threshold when below all', () => {
        const gs = { epiphany: { state: EPIPHANY_STATES.ACCUMULATING, insightPoints: 50, insightHistory: [], plateauDays: 0, totalEpiphanies: 0, currentEpiphanyType: null, epiphanyHistory: [], lastCultivateTime: null } };
        const service = new EpiphanyService(gs);
        service.init(gs);
        
        const result = service.getInsightNeededForNextEpiphany();
        
        expect(result.type).toBe('修炼顿悟');
        expect(result.needed).toBe(50);
    });

    test('should return 0 when all thresholds met', () => {
        const gs = { epiphany: { state: EPIPHANY_STATES.ACCUMULATING, insightPoints: 600, insightHistory: [], plateauDays: 15, totalEpiphanies: 0, currentEpiphanyType: null, epiphanyHistory: [], lastCultivateTime: null } };
        const service = new EpiphanyService(gs);
        service.init(gs);
        
        const result = service.getInsightNeededForNextEpiphany();
        
        expect(result.needed).toBe(0);
    });
});

// ========== getStatus 测试 ==========
describe('EpiphanyService.getStatus', () => {
    test('should return complete status', () => {
        const gs = { epiphany: { state: EPIPHANY_STATES.ACCUMULATING, insightPoints: 150, insightHistory: [{ amount: 50, reason: 'test', total: 150, timestamp: 1000 }], plateauDays: 5, totalEpiphanies: 2, currentEpiphanyType: null, epiphanyHistory: [], lastCultivateTime: null } };
        const service = new EpiphanyService(gs);
        service.init(gs);
        
        const status = service.getStatus();
        
        expect(status.state).toBe(EPIPHANY_STATES.ACCUMULATING);
        expect(status.insightPoints).toBe(150);
        expect(status.plateauDays).toBe(5);
        expect(status.totalEpiphanies).toBe(2);
        expect(status.recentInsight).toHaveLength(1);
    });
});

// ========== reset 测试 ==========
describe('EpiphanyService.reset', () => {
    test('should reset from completed to dormant', () => {
        const gs = { epiphany: { state: EPIPHANY_STATES.COMPLETED, insightPoints: 0, insightHistory: [], plateauDays: 5, totalEpiphanies: 1, currentEpiphanyType: null, epiphanyHistory: [], lastCultivateTime: null } };
        const service = new EpiphanyService(gs);
        service.init(gs);
        
        service.reset();
        
        expect(gs.epiphany.state).toBe(EPIPHANY_STATES.DORMANT);
    });

    test('should not reset when not completed', () => {
        const gs = { epiphany: { state: EPIPHANY_STATES.ACCUMULATING, insightPoints: 50, insightHistory: [], plateauDays: 5, totalEpiphanies: 0, currentEpiphanyType: null, epiphanyHistory: [], lastCultivateTime: null } };
        const service = new EpiphanyService(gs);
        service.init(gs);
        
        service.reset();
        
        expect(gs.epiphany.state).toBe(EPIPHANY_STATES.ACCUMULATING);
    });
});

// ========== MCP工具测试 ==========
describe('EpiphanyService MCP Tools', () => {
    describe('mcpEpiphanyTrigger', () => {
        test('should process triggered epiphany when present', () => {
            const gs = { epiphany: { state: EPIPHANY_STATES.TRIGGERED, insightPoints: 150, insightHistory: [], plateauDays: 5, totalEpiphanies: 1, currentEpiphanyType: 'cultivation_insight', epiphanyHistory: [], lastCultivateTime: null } };
            const service = new EpiphanyService(gs);
            service.init(gs);
            
            const result = service.mcpEpiphanyTrigger({});
            
            expect(result.success).toBe(true);
            expect(result.pipelineStagesSkipped).toBe(4);
        });

        test('should reset and try new when completed', () => {
            const gs = { epiphany: { state: EPIPHANY_STATES.COMPLETED, insightPoints: 0, insightHistory: [], plateauDays: 5, totalEpiphanies: 1, currentEpiphanyType: null, epiphanyHistory: [], lastCultivateTime: null } };
            const service = new EpiphanyService(gs);
            service.init(gs);
            
            const result = service.mcpEpiphanyTrigger({});
            
            // Should try to trigger new or fail gracefully
            expect(result).toBeDefined();
        });
    });

    describe('mcpEpiphanyInsight', () => {
        test('should accumulate insight with hint', () => {
            const gs = { epiphany: { state: EPIPHANY_STATES.ACCUMULATING, insightPoints: 50, insightHistory: [], plateauDays: 0, totalEpiphanies: 0, currentEpiphanyType: null, epiphanyHistory: [], lastCultivateTime: null } };
            const service = new EpiphanyService(gs);
            service.init(gs);
            
            const result = service.mcpEpiphanyInsight({ amount: 30 });
            
            expect(result.success).toBe(true);
            expect(result.total).toBe(80);
            expect(result.nextHint).toBeDefined();
        });
    });

    describe('mcpEpiphanyStatus', () => {
        test('should return complete status with description', () => {
            const gs = { epiphany: { state: EPIPHANY_STATES.ACCUMULATING, insightPoints: 100, insightHistory: [], plateauDays: 5, totalEpiphanies: 1, currentEpiphanyType: null, epiphanyHistory: [], lastCultivateTime: null } };
            const service = new EpiphanyService(gs);
            service.init(gs);
            
            const result = service.mcpEpiphanyStatus();
            
            expect(result.success).toBe(true);
            expect(result.stateDescription).toBe('悟道积累中');
            expect(result.hint).toContain('继续修炼积累悟性');
        });
    });
});