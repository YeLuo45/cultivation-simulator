/**
 * KarmaService 测试 - 因果反馈系统
 * V262 方向A迭代4/9: claude-code反馈循环 + 善恶度影响机缘
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
import { KarmaService } from '../../../domains/cultivation/services/KarmaService.js';

// Constants for testing (re-defined to avoid import issues)
const KARMA_TYPES = { GOOD: 'good', NEUTRAL: 'neutral', BAD: 'bad' };

const KARMA_ACTIONS = {
    HELP_WEAK: { type: 'good', points: 10, label: '帮助弱者' },
    DONATE: { type: 'good', points: 5, label: '施舍灵石' },
    ROB: { type: 'bad', points: -10, label: '抢劫' },
    BETRAY: { type: 'bad', points: -15, label: '背叛' },
    TRADE: { type: 'neutral', points: 1, label: '公平交易' },
    REST: { type: 'neutral', points: 0, label: '休息' }
};

const KARMA_RANKS = [
    { name: '大恶', threshold: -100, color: '#8B0000', bonus: -0.2 },
    { name: '恶', threshold: -50, color: '#CD5C5C', bonus: -0.1 },
    { name: '小恶', threshold: -20, color: '#F08080', bonus: -0.05 },
    { name: '普通人', threshold: 20, color: '#808080', bonus: 0 },
    { name: '小善', threshold: 50, color: '#90EE90', bonus: 0.05 },
    { name: '善', threshold: 100, color: '#32CD32', bonus: 0.1 },
    { name: '大善', threshold: Infinity, color: '#006400', bonus: 0.2 }
];

const KARMA_FEEDBACK = {
    cultivationSpeed: { good: 1.2, neutral: 1.0, bad: 0.8 },
    serendipityChance: { good: 1.3, neutral: 1.0, bad: 0.7 },
    breakthroughBonus: { good: 0.1, neutral: 0, bad: -0.1 },
    enemyAppearChance: { good: 0.5, neutral: 1.0, bad: 2.0 },
    benefactorChance: { good: 1.5, neutral: 1.0, bad: 0.3 }
};

const KARMA_CONFIG = {
    maxKarma: 200,
    minKarma: -200,
    historyMaxSize: 50
};

// ========== 初始化测试 ==========
describe('KarmaService Initialization', () => {
    test('should initialize with default values', () => {
        const gs = {};
        const service = new KarmaService(gs);
        const result = service.init(gs);
        
        expect(result.karma).toBeDefined();
        expect(result.karma.totalKarma).toBe(0);
        expect(result.karma.karmaRank).toBe('普通人');
        expect(result.karma.goodDeeds).toBe(0);
        expect(result.karma.badDeeds).toBe(0);
    });

    test('should preserve existing karma state', () => {
        const gs = {
            karma: {
                totalKarma: 50,
                goodDeeds: 5,
                badDeeds: 1,
                karmaRank: '小善',
                history: []
            }
        };
        const service = new KarmaService(gs);
        const result = service.init(gs);
        
        expect(result.karma.totalKarma).toBe(50);
        expect(result.karma.goodDeeds).toBe(5);
    });
});

// ========== getRank 测试 ==========
describe('KarmaService.getRank', () => {
    test('should return 大恶 for karma < -100', () => {
        const gs = { karma: { totalKarma: 0, goodDeeds: 0, badDeeds: 0, karmaRank: '普通人', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {} } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        const rank = service.getRank(-150);
        expect(rank.name).toBe('大恶');
    });

    test('should return 恶 for karma between -100 and -50', () => {
        const gs = { karma: { totalKarma: 0, goodDeeds: 0, badDeeds: 0, karmaRank: '普通人', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {} } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        const rank = service.getRank(-75);
        expect(rank.name).toBe('恶');
    });

    test('should return 普通人 for karma between -20 and 20', () => {
        const gs = { karma: { totalKarma: 0, goodDeeds: 0, badDeeds: 0, karmaRank: '普通人', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {} } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        const rank = service.getRank(10);
        expect(rank.name).toBe('普通人');
    });

    test('should return 大善 for karma >= 100', () => {
        const gs = { karma: { totalKarma: 0, goodDeeds: 0, badDeeds: 0, karmaRank: '普通人', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {} } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        const rank = service.getRank(150);
        expect(rank.name).toBe('大善');
    });
});

// ========== executeAction 测试 ==========
describe('KarmaService.executeAction', () => {
    test('should fail for unknown action', () => {
        const gs = { karma: { totalKarma: 0, goodDeeds: 0, badDeeds: 0, karmaRank: '普通人', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {}, lastActionTime: null } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        const result = service.executeAction({ actionId: 'UNKNOWN_ACTION' });
        expect(result.success).toBe(false);
        expect(result.message).toContain('未知行为');
    });

    test('should add good deed points', () => {
        const gs = { karma: { totalKarma: 0, goodDeeds: 0, badDeeds: 0, karmaRank: '普通人', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {}, lastActionTime: null } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        const result = service.executeAction({ actionId: 'HELP_WEAK' });
        
        expect(result.success).toBe(true);
        expect(result.action).toBe('帮助弱者');
        expect(result.type).toBe('good');
        expect(result.karmaChange).toBe(10);
        expect(gs.karma.totalKarma).toBe(10);
        expect(gs.karma.goodDeeds).toBe(1);
    });

    test('should add bad deed points', () => {
        const gs = { karma: { totalKarma: 0, goodDeeds: 0, badDeeds: 0, karmaRank: '普通人', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {}, lastActionTime: null } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        const result = service.executeAction({ actionId: 'ROB' });
        
        expect(result.success).toBe(true);
        expect(result.type).toBe('bad');
        expect(result.karmaChange).toBe(-10);
        expect(gs.karma.totalKarma).toBe(-10);
        expect(gs.karma.badDeeds).toBe(1);
    });

    test('should cap karma at maxKarma', () => {
        const gs = { karma: { totalKarma: 190, goodDeeds: 0, badDeeds: 0, karmaRank: '善', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {}, lastActionTime: null } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        service.executeAction({ actionId: 'HELP_WEAK' });
        
        expect(gs.karma.totalKarma).toBeLessThanOrEqual(KARMA_CONFIG.maxKarma);
    });

    test('should cap karma at minKarma', () => {
        const gs = { karma: { totalKarma: -190, goodDeeds: 0, badDeeds: 0, karmaRank: '恶', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {}, lastActionTime: null } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        service.executeAction({ actionId: 'ROB' });
        
        expect(gs.karma.totalKarma).toBeGreaterThanOrEqual(KARMA_CONFIG.minKarma);
    });

    test('should change rank when crossing threshold', () => {
        const gs = { karma: { totalKarma: 15, goodDeeds: 0, badDeeds: 0, karmaRank: '普通人', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {}, lastActionTime: null } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        const result = service.executeAction({ actionId: 'DONATE' }); // +5 points
        
        expect(result.success).toBe(true);
        expect(result.totalKarma).toBe(20);
        expect(result.rankChanged).toBe(true);
        expect(result.rank.name).toBe('小善');
    });

    test('should record history', () => {
        const gs = { karma: { totalKarma: 0, goodDeeds: 0, badDeeds: 0, karmaRank: '普通人', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {}, lastActionTime: null } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        service.executeAction({ actionId: 'TRADE' });
        
        expect(gs.karma.history.length).toBe(1);
        expect(gs.karma.history[0].actionId).toBe('TRADE');
        expect(gs.karma.history[0].actionLabel).toBe('公平交易');
    });

    test('should limit history size', () => {
        const gs = { karma: { totalKarma: 0, goodDeeds: 0, badDeeds: 0, karmaRank: '普通人', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {}, lastActionTime: null } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        for (let i = 0; i < 55; i++) {
            service.executeAction({ actionId: 'TRADE' });
        }
        
        expect(gs.karma.history.length).toBeLessThanOrEqual(KARMA_CONFIG.historyMaxSize);
    });
});

// ========== getFeedbackType 测试 ==========
describe('KarmaService.getFeedbackType', () => {
    test('should return good for karma > 20', () => {
        const gs = { karma: { totalKarma: 50, goodDeeds: 0, badDeeds: 0, karmaRank: '小善', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {}, lastActionTime: null } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        expect(service.getFeedbackType()).toBe('good');
    });

    test('should return bad for karma < -20', () => {
        const gs = { karma: { totalKarma: -50, goodDeeds: 0, badDeeds: 0, karmaRank: '恶', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {}, lastActionTime: null } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        expect(service.getFeedbackType()).toBe('bad');
    });

    test('should return neutral for karma between -20 and 20', () => {
        const gs = { karma: { totalKarma: 0, goodDeeds: 0, badDeeds: 0, karmaRank: '普通人', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {}, lastActionTime: null } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        expect(service.getFeedbackType()).toBe('neutral');
    });
});

// ========== getCultivationModifier 测试 ==========
describe('KarmaService.getCultivationModifier', () => {
    test('should return 1.2 for good karma', () => {
        const gs = { karma: { totalKarma: 50, goodDeeds: 0, badDeeds: 0, karmaRank: '小善', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {}, lastActionTime: null } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        expect(service.getCultivationModifier()).toBe(1.2);
    });

    test('should return 0.8 for bad karma', () => {
        const gs = { karma: { totalKarma: -50, goodDeeds: 0, badDeeds: 0, karmaRank: '恶', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {}, lastActionTime: null } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        expect(service.getCultivationModifier()).toBe(0.8);
    });

    test('should return 1.0 for neutral karma', () => {
        const gs = { karma: { totalKarma: 0, goodDeeds: 0, badDeeds: 0, karmaRank: '普通人', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {}, lastActionTime: null } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        expect(service.getCultivationModifier()).toBe(1.0);
    });
});

// ========== getSerendipityModifier 测试 ==========
describe('KarmaService.getSerendipityModifier', () => {
    test('should return 1.3 for good karma', () => {
        const gs = { karma: { totalKarma: 50, goodDeeds: 0, badDeeds: 0, karmaRank: '小善', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {}, lastActionTime: null } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        expect(service.getSerendipityModifier()).toBe(1.3);
    });

    test('should return 0.7 for bad karma', () => {
        const gs = { karma: { totalKarma: -50, goodDeeds: 0, badDeeds: 0, karmaRank: '恶', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {}, lastActionTime: null } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        expect(service.getSerendipityModifier()).toBe(0.7);
    });
});

// ========== getStatus 测试 ==========
describe('KarmaService.getStatus', () => {
    test('should return complete status', () => {
        const gs = { karma: { totalKarma: 30, goodDeeds: 3, badDeeds: 0, karmaRank: '小善', feedbackMultiplier: 1.05, history: [], cumulativeEffects: { serendipityBonus: 30, cultivationBonus: 20, enemyEncounters: 0.5, benefactorHelps: 1.5 }, lastActionTime: 1000 } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        const status = service.getStatus();
        
        expect(status.totalKarma).toBe(30);
        expect(status.rank).toBe('小善');
        expect(status.goodDeeds).toBe(3);
        expect(status.feedbackType).toBe('good');
    });
});

// ========== getHistory 测试 ==========
describe('KarmaService.getHistory', () => {
    test('should return recent history', () => {
        const gs = { karma: { totalKarma: 0, goodDeeds: 0, badDeeds: 0, karmaRank: '普通人', feedbackMultiplier: 1.0, history: [
            { actionId: 'TRADE', actionLabel: '公平交易', type: 'neutral', points: 1, totalKarma: 1, rank: '普通人', timestamp: 1000 },
            { actionId: 'HELP_WEAK', actionLabel: '帮助弱者', type: 'good', points: 10, totalKarma: 11, rank: '普通人', timestamp: 2000 }
        ], cumulativeEffects: {}, lastActionTime: null } };
        const service = new KarmaService(gs);
        service.init(gs);
        
        const history = service.getHistory(1);
        expect(history.length).toBe(1);
        expect(history[0].actionId).toBe('HELP_WEAK');
    });
});

// ========== MCP工具测试 ==========
describe('KarmaService MCP Tools', () => {
    describe('mcpKarmaAction', () => {
        test('should execute action and return result', () => {
            const gs = { karma: { totalKarma: 0, goodDeeds: 0, badDeeds: 0, karmaRank: '普通人', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {}, lastActionTime: null } };
            const service = new KarmaService(gs);
            service.init(gs);
            
            const result = service.mcpKarmaAction({ actionId: 'DONATE' });
            
            expect(result.success).toBe(true);
            expect(result.karmaChange).toBe(5);
        });
    });

    describe('mcpKarmaStatus', () => {
        test('should return complete status with rank info', () => {
            const gs = { karma: { totalKarma: 75, goodDeeds: 8, badDeeds: 1, karmaRank: '善', feedbackMultiplier: 1.1, history: [], cumulativeEffects: { serendipityBonus: 30, cultivationBonus: 20, enemyEncounters: 0.5, benefactorHelps: 1.5 }, lastActionTime: null } };
            const service = new KarmaService(gs);
            service.init(gs);
            
            const result = service.mcpKarmaStatus();
            
            expect(result.success).toBe(true);
            expect(result.rankInfo.name).toBe('善');
            expect(result.rankInfo.color).toBe('#32CD32');
        });
    });

    describe('mcpKarmaFeedback', () => {
        test('should return feedback effects', () => {
            const gs = { karma: { totalKarma: 100, goodDeeds: 10, badDeeds: 0, karmaRank: '大善', feedbackMultiplier: 1.2, history: [], cumulativeEffects: { serendipityBonus: 30, cultivationBonus: 20, enemyEncounters: 0.5, benefactorHelps: 1.5 }, lastActionTime: null } };
            const service = new KarmaService(gs);
            service.init(gs);
            
            const result = service.mcpKarmaFeedback();
            
            expect(result.success).toBe(true);
            expect(result.effects.cultivationSpeedBonus).toBeCloseTo(20, 2);
            expect(result.effects.serendipityBonus).toBeCloseTo(30, 2);
            expect(result.effects.benefactorMultiplier).toBe(1.5);
        });
    });
});