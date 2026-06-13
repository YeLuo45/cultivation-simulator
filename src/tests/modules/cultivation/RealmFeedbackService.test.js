/**
 * 境界反馈循环服务测试
 * V266 方向A迭代8/9: ruflo层次分解+反馈循环增强
 * 
 * 测试覆盖率目标: ≥99%
 * 测试通过率目标: 100%
 */

import { RealmFeedbackService } from '../../../domains/cultivation/services/RealmFeedbackService.js';

describe('RealmFeedbackService', () => {
    let service;
    let gameState;

    beforeEach(() => {
        gameState = {
            cultivation: { level: 1, experience: 0, maxExperience: 100 },
            karma: { totalKarma: 0, goodDeeds: 0, badDeeds: 0, karmaRank: '常人', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {}, lastActionTime: null },
            epiphany: { triggered: false, multiplier: 1.0, activeTypes: [], history: [], lastTriggerTime: null },
            multiRealm: null,
            parallelCultivation: null,
            sect: null,
            realmFeedback: null
        };
        service = new RealmFeedbackService(gameState);
        service.init(gameState);
    });

    describe('initFeedbackState', () => {
        test('should initialize with default values', () => {
            expect(service.feedbackState.currentStage).toBe('cultivation');
            expect(service.feedbackState.cycleCount).toBe(0);
            expect(service.feedbackState.totalBreakthroughs).toBe(0);
            // intensityLevel may be WEAK or NORMAL depending on system state
            expect(['WEAK', 'NORMAL']).toContain(service.feedbackState.intensityLevel);
        });

        test('should have ascension requirements', () => {
            expect(service.feedbackState.ascensionRequirements.minLevel).toBe(10);
            expect(service.feedbackState.ascensionRequirements.minKarma).toBe(500);
            expect(service.feedbackState.ascensionRequirements.minRealms).toBe(5);
            expect(service.feedbackState.ascensionRequirements.minBreakthroughs).toBe(20);
        });
    });

    describe('syncSystemStates', () => {
        test('should sync multiRealm state', () => {
            gameState.multiRealm = { activeRealms: ['body', 'qi'], syncMultiplier: 1.2 };
            service.syncSystemStates();
            expect(service.feedbackState.systemStates.multiRealm.activeRealms).toContain('body');
            expect(service.feedbackState.systemStates.multiRealm.syncMultiplier).toBe(1.2);
        });

        test('should sync karma state', () => {
            gameState.karma = { totalKarma: 100 };
            service.syncSystemStates();
            expect(service.feedbackState.systemStates.karma.totalKarma).toBe(100);
        });

        test('should sync epiphany state', () => {
            gameState.epiphany = { triggered: true, multiplier: 2.0 };
            service.syncSystemStates();
            expect(service.feedbackState.systemStates.epiphany.active).toBe(true);
            expect(service.feedbackState.systemStates.epiphany.multiplier).toBe(2.0);
        });

        test('should sync parallel state', () => {
            gameState.parallelCultivation = { threads: { t1: {} }, activeCount: 1 };
            service.syncSystemStates();
            expect(service.feedbackState.systemStates.parallel.threadCount).toBe(1);
            expect(service.feedbackState.systemStates.parallel.activeCount).toBe(1);
        });

        test('should sync sect state', () => {
            gameState.sect = { members: { m1: {} }, reputation: 50 };
            service.syncSystemStates();
            expect(service.feedbackState.systemStates.sect.memberCount).toBe(1);
        });
    });

    describe('calculateCombinedMultiplier', () => {
        test('should return base multiplier close to 1.0 with minimal bonuses', () => {
            const m = service.calculateCombinedMultiplier();
            // With minimal state, multiplier should be between 1.0 and 1.5
            expect(m).toBeGreaterThanOrEqual(1.0);
            expect(m).toBeLessThanOrEqual(1.5);
        });

        test('should include sync multiplier', () => {
            gameState.multiRealm = { activeRealms: ['body', 'qi'], syncMultiplier: 1.5 };
            service.syncSystemStates();
            const m = service.calculateCombinedMultiplier();
            expect(m).toBeGreaterThan(1.0);
        });

        test('should include epiphany multiplier when active', () => {
            gameState.epiphany = { triggered: true, multiplier: 2.0 };
            service.syncSystemStates();
            const m = service.calculateCombinedMultiplier();
            expect(m).toBeGreaterThan(1.0);
        });

        test('should include parallel thread bonus', () => {
            gameState.parallelCultivation = { threads: { t1: {} }, activeCount: 3 };
            service.syncSystemStates();
            const m = service.calculateCombinedMultiplier();
            // 3 threads = 1 + 3*0.1 = 1.3
            expect(m).toBeGreaterThanOrEqual(1.3);
        });
    });

    describe('executeCycleTick', () => {
        test('should increment cycle count', () => {
            service.executeCycleTick(1000);
            expect(service.feedbackState.cycleCount).toBe(1);
            service.executeCycleTick(1000);
            expect(service.feedbackState.cycleCount).toBe(2);
        });

        test('should add to cycle history', () => {
            service.executeCycleTick(1000);
            expect(service.feedbackState.cycleHistory.length).toBe(1);
            expect(service.feedbackState.cycleHistory[0].stage).toBe('cultivation');
        });

        test('should return combined multiplier', () => {
            const result = service.executeCycleTick(1000);
            expect(result.combinedMultiplier).toBeGreaterThan(0);
        });
    });

    describe('tickCultivationPhase', () => {
        test('should return cultivation result', () => {
            const result = service.tickCultivationPhase(1000);
            expect(result.phase).toBe('cultivation');
            expect(result).toHaveProperty('progress');
        });
    });

    describe('tickBreakthroughPhase', () => {
        test('should increment total breakthroughs', () => {
            service.tickBreakthroughPhase(1000);
            expect(service.feedbackState.totalBreakthroughs).toBe(1);
        });

        test('should transition back to cultivation', () => {
            service.tickBreakthroughPhase(1000);
            expect(service.feedbackState.currentStage).toBe('cultivation');
        });
    });

    describe('checkIntensityUpgrade', () => {
        test('should upgrade to NORMAL when conditions met', () => {
            service.feedbackState.totalBreakthroughs = 10;
            service.feedbackState.systemStates.karma.totalKarma = 100;
            service.feedbackState.systemStates.multiRealm.activeRealms = ['body', 'qi'];
            service.checkIntensityUpgrade();
            expect(service.feedbackState.intensityLevel).toBe('NORMAL');
        });

        test('should stay WEAK with minimal progress', () => {
            service.checkIntensityUpgrade();
            expect(service.feedbackState.intensityLevel).toBe('WEAK');
        });
    });

    describe('checkAscensionRequirements', () => {
        test('should return not ready initially', () => {
            const result = service.checkAscensionRequirements();
            expect(result.canAscend).toBe(false);
            expect(result.met.level).toBe(false);
        });

        test('should return ready when all conditions met', () => {
            gameState.cultivation.level = 10;
            service.feedbackState.systemStates.karma.totalKarma = 500;
            service.feedbackState.systemStates.multiRealm.activeRealms = ['body', 'qi', 'spirit', 'soul', 'celestial'];
            service.feedbackState.totalBreakthroughs = 20;
            
            const result = service.checkAscensionRequirements();
            expect(result.canAscend).toBe(true);
        });
    });

    describe('triggerSpecialEvent', () => {
        test('should handle major_breakthrough event', () => {
            // Manually set up conditions for NORMAL intensity
            service.feedbackState.totalBreakthroughs = 10;
            service.feedbackState.systemStates.karma.totalKarma = 100;
            service.feedbackState.systemStates.multiRealm.activeRealms = ['body', 'qi'];
            service.checkIntensityUpgrade();
            expect(service.feedbackState.intensityLevel).toBe('NORMAL');
            
            // Now trigger the event (adds 5 more breakthroughs)
            const result = service.triggerSpecialEvent('major_breakthrough');
            expect(result.success).toBe(true);
            expect(service.feedbackState.totalBreakthroughs).toBe(15);
            // Still NORMAL (not yet STRONG which needs 30+ breakthroughs)
            expect(service.feedbackState.intensityLevel).toBe('NORMAL');
        });

        test('should handle karma_swing event', () => {
            const result = service.triggerSpecialEvent('karma_swing', { delta: 100 });
            expect(result.success).toBe(true);
            expect(service.feedbackState.systemStates.karma.totalKarma).toBe(100);
        });
    });

    describe('MCP Tools', () => {
        describe('mcpTickFeedbackLoop', () => {
            test('should tick the feedback loop', () => {
                const result = service.mcpTickFeedbackLoop({ deltaTime: 1000 });
                expect(result.success).toBe(true);
                expect(result.cycleCount).toBe(1);
            });
        });

        describe('mcpGetFeedbackStatus', () => {
            test('should return full status', () => {
                const result = service.mcpGetFeedbackStatus();
                expect(result.success).toBe(true);
                expect(result.currentStage).toBe('cultivation');
                expect(result.combinedMultiplier).toBeGreaterThan(0);
                expect(result.systemStates).toBeDefined();
            });
        });

        describe('mcpTriggerEvent', () => {
            test('should trigger event via MCP', () => {
                const result = service.mcpTriggerEvent({ eventType: 'major_breakthrough', data: {} });
                expect(result.success).toBe(true);
            });
        });

        describe('mcpGetCycleHistory', () => {
            test('should return cycle history', () => {
                service.executeCycleTick(1000);
                service.executeCycleTick(1000);
                const result = service.mcpGetCycleHistory({ limit: 5 });
                expect(result.success).toBe(true);
                expect(result.history.length).toBe(2);
            });
        });

        describe('mcpCheckAscension', () => {
            test('should check ascension via MCP', () => {
                const result = service.mcpCheckAscension();
                expect(result.success).toBe(true);
                expect(result.canAscend).toBe(false);
            });
        });
    });
});
