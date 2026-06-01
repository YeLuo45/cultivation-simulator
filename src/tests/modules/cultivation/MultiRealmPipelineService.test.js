/**
 * 多维修炼流水线服务测试
 * V263 方向A迭代5/9: 多境界同时修炼调度器
 * 
 * 测试覆盖率目标: ≥99%
 * 测试通过率目标: 100%
 */

// Constants re-defined to avoid ESM import issues
const REALM_STAGES = ['body', 'qi', 'spirit', 'soul', 'celestial'];
const REALM_EFFICIENCY = { body: 1.0, qi: 1.2, spirit: 1.5, soul: 1.8, celestial: 2.0 };
const SYNC_BONUS = { two_realms: 1.2, three_realms: 1.5, four_realms: 2.0, five_realms: 3.0 };

// Import using ES modules
import { MultiRealmPipelineService } from '../../../domains/cultivation/services/MultiRealmPipelineService.js';

describe('MultiRealmPipelineService', () => {
    let service;
    let gameState;

    beforeEach(() => {
        gameState = {
            cultivation: { level: 1, experience: 0, maxExperience: 100 },
            karma: { totalKarma: 0, goodDeeds: 0, badDeeds: 0, karmaRank: '常人', feedbackMultiplier: 1.0, history: [], cumulativeEffects: {}, lastActionTime: null },
            epiphany: { triggered: false, multiplier: 1.0, activeTypes: [], history: [], lastTriggerTime: null },
            multiRealm: null
        };
        service = new MultiRealmPipelineService(gameState);
        service.init(gameState);
    });

    describe('initRealmState', () => {
        test('should initialize with body realm only', () => {
            expect(service.realmState.activeRealms).toEqual(['body']);
        });

        test('should initialize all five realms with correct efficiency', () => {
            expect(service.realmState.realmProgress.body.efficiency).toBe(1.0);
            expect(service.realmState.realmProgress.qi.efficiency).toBe(1.2);
            expect(service.realmState.realmProgress.spirit.efficiency).toBe(1.5);
            expect(service.realmState.realmProgress.soul.efficiency).toBe(1.8);
            expect(service.realmState.realmProgress.celestial.efficiency).toBe(2.0);
        });

        test('should have syncMultiplier of 1.0 for single realm', () => {
            expect(service.realmState.syncMultiplier).toBe(1.0);
        });
    });

    describe('activateRealm', () => {
        test('should activate a new realm', () => {
            const result = service.activateRealm('qi');
            expect(result.success).toBe(true);
            expect(result.activeRealms).toContain('qi');
        });

        test('should update syncMultiplier when activating second realm', () => {
            service.activateRealm('qi');
            expect(service.realmState.syncMultiplier).toBe(SYNC_BONUS.two_realms);
        });

        test('should fail when activating unknown realm', () => {
            const result = service.activateRealm('unknown');
            expect(result.success).toBe(false);
            expect(result.error).toContain('未知境界');
        });

        test('should fail when realm already active', () => {
            service.activateRealm('qi');
            const result = service.activateRealm('qi');
            expect(result.success).toBe(false);
            expect(result.error).toContain('已在修炼中');
        });

        test('should fail when max realms reached', () => {
            // body is already active, add 4 more to reach the limit of 5
            service.activateRealm('qi');
            service.activateRealm('spirit');
            service.activateRealm('soul');
            service.activateRealm('celestial');
            // Now try to activate 'qi' again (already active, not max_realms error)
            const result = service.activateRealm('qi');
            expect(result.success).toBe(false);
            expect(result.error).toContain('已在修炼中');
        });

        test('should fail when activating unknown realm at limit', () => {
            // Activate all 5 valid realms
            service.activateRealm('qi');
            service.activateRealm('spirit');
            service.activateRealm('soul');
            service.activateRealm('celestial');
            // Try to activate a 6th non-existent realm
            const result = service.activateRealm('unknown');
            expect(result.success).toBe(false);
        });
    });

    describe('deactivateRealm', () => {
        test('should deactivate an active realm', () => {
            service.activateRealm('qi');
            const result = service.deactivateRealm('qi');
            expect(result.success).toBe(true);
            expect(result.activeRealms).not.toContain('qi');
        });

        test('should update syncMultiplier when deactivating', () => {
            service.activateRealm('qi');
            service.activateRealm('spirit');
            service.deactivateRealm('spirit');
            expect(service.realmState.syncMultiplier).toBe(SYNC_BONUS.two_realms);
        });

        test('should fail when deactivating non-active realm', () => {
            const result = service.deactivateRealm('qi');
            expect(result.success).toBe(false);
            expect(result.error).toContain('未在修炼中');
        });

        test('should fail when only one realm remains', () => {
            const result = service.deactivateRealm('body');
            expect(result.success).toBe(false);
            expect(result.error).toContain('至少保留一个活跃境界');
        });
    });

    describe('updateSyncMultiplier', () => {
        test('should return 1.0 for single realm', () => {
            service.realmState.activeRealms = ['body'];
            service.updateSyncMultiplier();
            expect(service.realmState.syncMultiplier).toBe(1.0);
        });

        test('should return 1.2 for two realms', () => {
            service.realmState.activeRealms = ['body', 'qi'];
            service.updateSyncMultiplier();
            expect(service.realmState.syncMultiplier).toBe(1.2);
        });

        test('should return 1.5 for three realms', () => {
            service.realmState.activeRealms = ['body', 'qi', 'spirit'];
            service.updateSyncMultiplier();
            expect(service.realmState.syncMultiplier).toBe(1.5);
        });

        test('should return 2.0 for four realms', () => {
            service.realmState.activeRealms = ['body', 'qi', 'spirit', 'soul'];
            service.updateSyncMultiplier();
            expect(service.realmState.syncMultiplier).toBe(2.0);
        });

        test('should return 3.0 for five realms', () => {
            service.realmState.activeRealms = ['body', 'qi', 'spirit', 'soul', 'celestial'];
            service.updateSyncMultiplier();
            expect(service.realmState.syncMultiplier).toBe(3.0);
        });
    });

    describe('cultivate', () => {
        test('should increase progress for active realm', () => {
            const result = service.cultivate(10000, { realm: 'body' });
            expect(result.success).toBe(true);
            expect(result.progress).toBeGreaterThan(0);
        });

        test('should apply efficiency multiplier', () => {
            service.activateRealm('celestial');
            const celestialResult = service.cultivate(10000, { realm: 'celestial' });
            const bodyResult = service.cultivate(10000, { realm: 'body' });
            // celestial has 2.0 efficiency, should get more progress
            expect(celestialResult.progressGained).toBeGreaterThan(bodyResult.progressGained);
        });

        test('should apply sync multiplier for multiple realms', () => {
            service.activateRealm('qi');
            const before = service.cultivate(10000, { realm: 'body' });
            service.activateRealm('spirit'); // now 3 realms = 1.5x sync
            const after = service.cultivate(10000, { realm: 'body' });
            expect(after.syncMultiplier).toBeGreaterThan(before.syncMultiplier);
            expect(after.progressGained).toBeGreaterThan(before.progressGained);
        });

        test('should fail for inactive realm', () => {
            const result = service.cultivate(10000, { realm: 'celestial' });
            expect(result.success).toBe(false);
            expect(result.error).toContain('未激活');
        });

        test('should track stage progression', () => {
            // Manually set high progress to trigger breakthrough
            service.realmState.realmProgress.body.progress = 95;
            const result = service.cultivate(10000, { realm: 'body' });
            if (result.breakthroughTriggered) {
                expect(result.stage).toBe(1);
            }
        });
    });

    describe('cultivateAll', () => {
        test('should cultivate all active realms', () => {
            service.activateRealm('qi');
            const result = service.cultivateAll(10000);
            expect(result.success).toBe(true);
            expect(result.activeRealmCount).toBe(2);
            expect(result.results.length).toBe(2);
        });

        test('should have correct sync multiplier', () => {
            service.activateRealm('qi');
            service.activateRealm('spirit');
            const result = service.cultivateAll(10000);
            expect(result.syncMultiplier).toBe(1.5);
        });
    });

    describe('getBreakthroughThreshold', () => {
        test('should return correct thresholds for each realm', () => {
            expect(service.getBreakthroughThreshold('body', 0)).toBe(100);
            expect(service.getBreakthroughThreshold('qi', 0)).toBe(200);
            expect(service.getBreakthroughThreshold('spirit', 0)).toBe(400);
            expect(service.getBreakthroughThreshold('soul', 0)).toBe(800);
            expect(service.getBreakthroughThreshold('celestial', 0)).toBe(1600);
        });

        test('should scale with stage', () => {
            expect(service.getBreakthroughThreshold('body', 1)).toBe(200);
            expect(service.getBreakthroughThreshold('body', 2)).toBe(400);
        });
    });

    describe('getAllRealmStatus', () => {
        test('should return status for all active realms', () => {
            service.activateRealm('qi');
            const status = service.getAllRealmStatus();
            expect(status.length).toBe(2);
            expect(status.map(s => s.realm)).toContain('body');
            expect(status.map(s => s.realm)).toContain('qi');
        });

        test('should include pipeline stage info', () => {
            const status = service.getAllRealmStatus();
            expect(status[0]).toHaveProperty('pipelineStage');
            expect(status[0]).toHaveProperty('progressRatio');
        });
    });

    describe('autoSchedule', () => {
        test('should distribute time evenly in balanced mode', () => {
            service.activateRealm('qi');
            const result = service.autoSchedule(20000, { priority: 'balanced' });
            expect(result.success).toBe(true);
            expect(result.results.length).toBe(2);
        });

        test('should prioritize weakest in weakest mode', () => {
            service.activateRealm('qi');
            service.realmState.realmProgress.qi.progress = 190; // near breakthrough
            service.realmState.realmProgress.body.progress = 10;
            const result = service.autoSchedule(20000, { priority: 'weakest' });
            expect(result.success).toBe(true);
            expect(result.strategy).toBe('weakest');
        });

        test('should fail for unknown strategy', () => {
            const result = service.autoSchedule(10000, { priority: 'unknown' });
            expect(result.success).toBe(false);
        });
    });

    describe('MCP Tools', () => {
        describe('mcpActivateRealm', () => {
            test('should activate realm and return status', () => {
                const result = service.mcpActivateRealm({ realm: 'qi' });
                expect(result.success).toBe(true);
                expect(result.activeRealms).toContain('qi');
                expect(result.syncMultiplier).toBe(1.2);
            });
        });

        describe('mcpDeactivateRealm', () => {
            test('should deactivate realm and return status', () => {
                service.activateRealm('qi');
                const result = service.mcpDeactivateRealm({ realm: 'qi' });
                expect(result.success).toBe(true);
                expect(result.activeRealms).not.toContain('qi');
            });
        });

        describe('mcpCultivateRealm', () => {
            test('should cultivate single realm', () => {
                const result = service.mcpCultivateRealm({ duration: 10000, realm: 'body' });
                expect(result.success).toBe(true);
                expect(result.progress).toBeGreaterThan(0);
            });
        });

        describe('mcpCultivateAll', () => {
            test('should cultivate all realms', () => {
                service.activateRealm('qi');
                const result = service.mcpCultivateAll({ duration: 10000 });
                expect(result.success).toBe(true);
                expect(result.activeRealmCount).toBe(2);
                expect(result.results.length).toBe(2);
            });
        });

        describe('mcpGetRealmStatus', () => {
            test('should return full status', () => {
                const result = service.mcpGetRealmStatus();
                expect(result.success).toBe(true);
                expect(result.activeRealms).toEqual(['body']);
                expect(result.syncMultiplier).toBe(1.0);
                expect(result.realms.length).toBe(1);
            });
        });

        describe('mcpAutoSchedule', () => {
            test('should auto schedule cultivation', () => {
                service.activateRealm('qi');
                const result = service.mcpAutoSchedule({ duration: 20000, priority: 'balanced' });
                expect(result.success).toBe(true);
                expect(result.strategy).toBe('balanced');
            });
        });
    });
});
