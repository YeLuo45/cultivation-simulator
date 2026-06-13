/**
 * CosmicCycleService.test.js - TDD测试
 * V238 Direction Z: 天道意志终极系统测试 - 覆盖率 >= 95%
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    CosmicCycleService,
    CosmicCycle,
    WorldEvolution,
    HeavenJudgment,
    CosmicBlessing,
    LegacyInheritance,
    cosmicCycleService,
    COSMIC_CONFIG,
    CYCLE_PHASES,
    WORLD_EVOLUTION_STAGES,
    JUDGMENT_TYPES,
    LEGACY_TYPES,
    createCosmicCycleMCPHandlers
} from '../../../systems/cosmic/CosmicCycleService.js';

// ===== 辅助函数 =====

function createMockGameState() {
    return {
        player: { 
            name: '测试修士', 
            qi: 100, 
            level: 1,
            karmaPoints: 0,
            cultivationProgress: 0
        },
        cultivationXP: 0,
        inventory: { items: [] },
        blessings: [],
        cosmic: null
    };
}

// ===== CosmicCycle测试 =====

describe('CosmicCycle', () => {
    it('should create a cycle with correct properties', () => {
        const cycle = new CosmicCycle({
            cycleNumber: 1,
            worldLevel: 5
        });
        
        expect(cycle.cycleNumber).toBe(1);
        expect(cycle.worldLevel).toBe(5);
        expect(cycle.currentPhase).toBe(CYCLE_PHASES.CREATION);
        expect(cycle.completed).toBe(false);
        expect(cycle.id).toMatch(/^cycle_/);
    });
    
    it('should generate unique ids', () => {
        const cycle1 = new CosmicCycle();
        const cycle2 = new CosmicCycle();
        
        expect(cycle1.id).not.toBe(cycle2.id);
    });
    
    it('should calculate elapsed time', () => {
        const cycle = new CosmicCycle();
        const start = Date.now();
        
        // Simulate some time passing
        const elapsed = cycle.getElapsedTime();
        expect(elapsed).toBeGreaterThanOrEqual(0);
    });
    
    it('should calculate remaining time', () => {
        const cycle = new CosmicCycle();
        const remaining = cycle.getRemainingTime();
        expect(remaining).toBeGreaterThan(0);
    });
    
    it('should calculate progress', () => {
        const cycle = new CosmicCycle();
        const progress = cycle.getProgress();
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(1);
    });
    
    describe('updatePhase', () => {
        it('should update phase based on progress', () => {
            const cycle = new CosmicCycle();
            cycle.startTime = Date.now() - (COSMIC_CONFIG.CYCLE_DURATION * 0.5); // 50% progress
            cycle.updatePhase();
            
            expect([CYCLE_PHASES.EVOLUTION, CYCLE_PHASES.FLORAGE]).toContain(cycle.currentPhase);
        });
        
        it('should be CREATION phase at start', () => {
            const cycle = new CosmicCycle();
            cycle.updatePhase();
            
            expect(cycle.currentPhase).toBe(CYCLE_PHASES.CREATION);
        });
        
        it('should be RENEWAL phase near end', () => {
            const cycle = new CosmicCycle();
            cycle.startTime = Date.now() - (COSMIC_CONFIG.CYCLE_DURATION * 0.95);
            cycle.updatePhase();
            
            expect(cycle.currentPhase).toBe(CYCLE_PHASES.RENEWAL);
        });
    });
    
    describe('complete', () => {
        it('should complete the cycle', () => {
            const cycle = new CosmicCycle();
            const result = cycle.complete();
            
            expect(result.success).toBe(true);
            expect(result.cycleNumber).toBe(cycle.cycleNumber);
            expect(cycle.completed).toBe(true);
            expect(cycle.completedAt).toBeGreaterThan(0);
        });
    });
    
    describe('addEvent', () => {
        it('should add an event to the cycle', () => {
            const cycle = new CosmicCycle();
            cycle.addEvent('test_event', 'Test description', { data: 'test' });
            
            expect(cycle.events.length).toBe(1);
            expect(cycle.events[0].type).toBe('test_event');
            expect(cycle.events[0].description).toBe('Test description');
            expect(cycle.events[0].data).toEqual({ data: 'test' });
            expect(cycle.events[0].timestamp).toBeGreaterThan(0);
        });
    });
});

// ===== WorldEvolution测试 =====

describe('WorldEvolution', () => {
    it('should create evolution with correct properties', () => {
        const evolution = new WorldEvolution({
            stage: WORLD_EVOLUTION_STAGES.STABLE,
            level: 10
        });
        
        expect(evolution.stage).toBe(WORLD_EVOLUTION_STAGES.STABLE);
        expect(evolution.level).toBe(10);
        expect(evolution.experience).toBe(0);
        expect(evolution.meritBonus).toBe(1.0);
        expect(evolution.id).toMatch(/^evolution_/);
    });
    
    describe('addExperience', () => {
        it('should add experience', () => {
            const evolution = new WorldEvolution();
            const result = evolution.addExperience(100);
            
            expect(result.evolved).toBe(false);
            expect(evolution.experience).toBe(100);
        });
        
        it('should trigger evolution when threshold reached', () => {
            const evolution = new WorldEvolution({
                requiredExperience: 100
            });
            
            const result = evolution.addExperience(150);
            
            expect(result.evolved).toBe(true);
            expect(evolution.level).toBe(2);
            expect(evolution.experience).toBe(0);
        });
        
        it('should not evolve beyond max level', () => {
            const evolution = new WorldEvolution({
                level: COSMIC_CONFIG.WORLD_LEVEL_RANGE.max,
                requiredExperience: 100
            });
            
            evolution.addExperience(200);
            
            expect(evolution.level).toBe(COSMIC_CONFIG.WORLD_LEVEL_RANGE.max);
        });
    });
    
    describe('evolve', () => {
        it('should increase level and stage', () => {
            const evolution = new WorldEvolution({
                stage: WORLD_EVOLUTION_STAGES.PRIMORDIAL,
                level: 1
            });
            
            const result = evolution.evolve();
            
            expect(result.evolved).toBe(true);
            expect(evolution.level).toBe(2);
            expect(evolution.stage).toBe(WORLD_EVOLUTION_STAGES.FORMING);
        });
        
        it('should update bonuses', () => {
            const evolution = new WorldEvolution({ level: 1 });
            
            evolution.evolve();
            
            expect(evolution.meritBonus).toBeGreaterThan(1);
            expect(evolution.cultivationSpeedBonus).toBeGreaterThan(1);
            expect(evolution.blessingPower).toBeGreaterThan(1);
        });
        
        it('should cap at final stage', () => {
            const evolution = new WorldEvolution({
                stage: WORLD_EVOLUTION_STAGES.CELESTIAL,
                level: 99
            });
            
            evolution.evolve();
            
            expect(evolution.stage).toBe(WORLD_EVOLUTION_STAGES.CELESTIAL);
        });
    });
    
    describe('getUpgradeProgress', () => {
        it('should return correct progress', () => {
            const evolution = new WorldEvolution({
                experience: 50,
                requiredExperience: 100
            });
            
            expect(evolution.getUpgradeProgress()).toBe(0.5);
        });
        
        it('should cap at 1', () => {
            const evolution = new WorldEvolution({
                experience: 200,
                requiredExperience: 100
            });
            
            expect(evolution.getUpgradeProgress()).toBe(1);
        });
    });
});

// ===== HeavenJudgment测试 =====

describe('HeavenJudgment', () => {
    it('should create judgment with correct properties', () => {
        const judgment = new HeavenJudgment(
            JUDGMENT_TYPES.BLESSING,
            'Test judgment',
            { karmaValue: 1000, meritValue: 500 }
        );
        
        expect(judgment.type).toBe(JUDGMENT_TYPES.BLESSING);
        expect(judgment.description).toBe('Test judgment');
        expect(judgment.karmaValue).toBe(1000);
        expect(judgment.meritValue).toBe(500);
        expect(judgment.executed).toBe(false);
        expect(judgment.id).toMatch(/^judgment_/);
    });
    
    describe('execute', () => {
        it('should execute judgment and determine result as BLESSING for high karma', () => {
            const judgment = new HeavenJudgment(
                JUDGMENT_TYPES.TRIAL,
                'Test',
                { karmaValue: COSMIC_CONFIG.JUDGMENT_THRESHOLD.BLESSED + 1000 }
            );
            
            const result = judgment.execute();
            
            expect(result.success).toBe(true);
            expect(judgment.result).toBe(JUDGMENT_TYPES.BLESSING);
            expect(judgment.executed).toBe(true);
            expect(judgment.executedAt).toBeGreaterThan(0);
        });
        
        it('should determine result as PUNISHMENT for very low karma', () => {
            const judgment = new HeavenJudgment(
                JUDGMENT_TYPES.TRIAL,
                'Test',
                { karmaValue: COSMIC_CONFIG.JUDGMENT_THRESHOLD.DAMNED - 1000 }
            );
            
            judgment.execute();
            
            expect(judgment.result).toBe(JUDGMENT_TYPES.PUNISHMENT);
        });
        
        it('should determine result as ASCENSION for righteous karma', () => {
            const judgment = new HeavenJudgment(
                JUDGMENT_TYPES.TRIAL,
                'Test',
                { karmaValue: COSMIC_CONFIG.JUDGMENT_THRESHOLD.RIGHTEOUS + 1000 }
            );
            
            judgment.execute();
            
            expect(judgment.result).toBe(JUDGMENT_TYPES.ASCENSION);
        });
        
        it('should determine result as TRIAL for evil karma', () => {
            const judgment = new HeavenJudgment(
                JUDGMENT_TYPES.TRIAL,
                'Test',
                { karmaValue: COSMIC_CONFIG.JUDGMENT_THRESHOLD.EVIL - 1000 }
            );
            
            judgment.execute();
            
            expect(judgment.result).toBe(JUDGMENT_TYPES.TRIAL);
        });
        
        it('should not execute already executed judgment', () => {
            const judgment = new HeavenJudgment(JUDGMENT_TYPES.TRIAL, 'Test');
            judgment.execute();
            
            const result = judgment.execute();
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Judgment already executed');
        });
    });
});

// ===== CosmicBlessing测试 =====

describe('CosmicBlessing', () => {
    it('should create blessing with correct properties', () => {
        const blessing = new CosmicBlessing(
            'cultivation',
            '天道加持',
            '修炼速度大幅提升',
            { power: 2.0, effects: { cultivationSpeed: 2.0 } }
        );
        
        expect(blessing.type).toBe('cultivation');
        expect(blessing.title).toBe('天道加持');
        expect(blessing.power).toBe(2.0);
        expect(blessing.claimed).toBe(false);
        expect(blessing.id).toMatch(/^cosmic_blessing_/);
    });
    
    describe('isExpired', () => {
        it('should not be expired within duration', () => {
            const blessing = new CosmicBlessing(
                'test',
                'Test',
                'Test',
                { duration: COSMIC_CONFIG.CYCLE_DURATION }
            );
            
            expect(blessing.isExpired()).toBe(false);
        });
        
        it('should be expired after duration', () => {
            const blessing = new CosmicBlessing(
                'test',
                'Test',
                'Test',
                { duration: 1 }
            );
            
            // Wait a bit
            const start = Date.now();
            while (Date.now() - start < 10) {}
            
            expect(blessing.isExpired()).toBe(true);
        });
    });
    
    describe('claim', () => {
        it('should claim unclaimed blessing', () => {
            const blessing = new CosmicBlessing('test', 'Test', 'Test');
            
            const result = blessing.claim();
            
            expect(result.success).toBe(true);
            expect(blessing.claimed).toBe(true);
            expect(blessing.claimedAt).toBeGreaterThan(0);
        });
        
        it('should not claim already claimed blessing', () => {
            const blessing = new CosmicBlessing('test', 'Test', 'Test');
            blessing.claimed = true;
            
            const result = blessing.claim();
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Blessing already claimed');
        });
        
        it('should not claim expired blessing', () => {
            const blessing = new CosmicBlessing('test', 'Test', 'Test', { duration: 1 });
            
            const start = Date.now();
            while (Date.now() - start < 10) {}
            
            const result = blessing.claim();
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Blessing has expired');
        });
    });
});

// ===== LegacyInheritance测试 =====

describe('LegacyInheritance', () => {
    it('should create legacy with correct properties', () => {
        const legacy = new LegacyInheritance(
            LEGACY_TYPES.CULTIVATION,
            '修为传承',
            '前世修行所积累的修为',
            { value: 1000, quality: '上品' }
        );
        
        expect(legacy.type).toBe(LEGACY_TYPES.CULTIVATION);
        expect(legacy.name).toBe('修为传承');
        expect(legacy.value).toBe(1000);
        expect(legacy.quality).toBe('上品');
        expect(legacy.preserved).toBe(false);
        expect(legacy.id).toMatch(/^legacy_/);
    });
    
    describe('getInheritedValue', () => {
        it('should calculate inherited value with retention ratio', () => {
            const legacy = new LegacyInheritance(
                LEGACY_TYPES.CULTIVATION,
                'Test',
                'Test',
                { value: 1000, retentionRatio: 0.5 }
            );
            
            expect(legacy.getInheritedValue()).toBe(500);
        });
        
        it('should use default retention ratio', () => {
            const legacy = new LegacyInheritance(
                LEGACY_TYPES.CULTIVATION,
                'Test',
                'Test',
                { value: 1000 }
            );
            
            expect(legacy.getInheritedValue()).toBe(Math.floor(1000 * COSMIC_CONFIG.LEGACY_RETENTION_RATIO));
        });
    });
    
    describe('activate', () => {
        it('should activate legacy preservation', () => {
            const legacy = new LegacyInheritance(
                LEGACY_TYPES.MERIT,
                'Test',
                'Test',
                { value: 500 }
            );
            
            const result = legacy.activate();
            
            expect(result.success).toBe(true);
            expect(legacy.preserved).toBe(true);
        });
    });
});

// ===== CosmicCycleService测试 =====

describe('CosmicCycleService', () => {
    let service;
    let mockGameState;
    
    beforeEach(() => {
        service = new CosmicCycleService();
        mockGameState = createMockGameState();
    });
    
    describe('init', () => {
        it('should initialize service with game state', () => {
            const result = service.init(mockGameState);
            
            expect(result.success).toBe(true);
            expect(service.gameState).toBe(mockGameState);
            expect(mockGameState.cosmic).toBeDefined();
        });
        
        it('should start new cycle if none exists', () => {
            service.init(mockGameState);
            
            expect(service.currentCycle).toBeDefined();
            expect(service.totalCycles).toBe(1);
        });
        
        it('should create world evolution if none exists', () => {
            service.init(mockGameState);
            
            expect(service.worldEvolution).toBeDefined();
            expect(service.worldEvolution.level).toBe(1);
        });
        
        it('should restore existing state', () => {
            mockGameState.cosmic = {
                currentCycle: new CosmicCycle({ cycleNumber: 5 }),
                worldEvolution: new WorldEvolution({ level: 10 }),
                judgments: [],
                cosmicBlessings: [],
                legacies: [],
                lastResetTime: Date.now() - 100000,
                totalCycles: 5
            };
            
            service.init(mockGameState);
            
            expect(service.totalCycles).toBe(5);
            expect(service.worldEvolution.level).toBe(10);
        });
    });
    
    describe('saveState', () => {
        it('should save state to game state', () => {
            service.init(mockGameState);
            service.worldEvolution.level = 15;
            
            service.saveState();
            
            expect(mockGameState.cosmic.worldEvolution.level).toBe(15);
        });
    });
    
    describe('startNewCycle', () => {
        it('should start a new cycle', () => {
            service.init(mockGameState);
            
            const result = service.startNewCycle();
            
            expect(result.success).toBe(true);
            expect(result.cycle).toBeDefined();
            expect(result.cycle.cycleNumber).toBe(1);
        });
        
        it('should increment cycle number', () => {
            service.init(mockGameState);
            service.startNewCycle();
            
            const result = service.startNewCycle();
            
            expect(service.totalCycles).toBe(2);
        });
    });
    
    describe('getCycleInfo', () => {
        it('should return cycle information', () => {
            service.init(mockGameState);
            
            const info = service.getCycleInfo();
            
            expect(info).toBeDefined();
            expect(info.cycleNumber).toBe(1);
            expect(info.progress).toBeGreaterThanOrEqual(0);
        });
        
        it('should return null if no cycle', () => {
            const emptyService = new CosmicCycleService();
            
            expect(emptyService.getCycleInfo()).toBeNull();
        });
    });
    
    describe('updateCyclePhase', () => {
        it('should update cycle phase', () => {
            service.init(mockGameState);
            
            const result = service.updateCyclePhase();
            
            expect(result.success).toBe(true);
            expect(result.newPhase).toBeDefined();
        });
        
        it('should fail if no active cycle', () => {
            const emptyService = new CosmicCycleService();
            emptyService.gameState = mockGameState;
            
            const result = emptyService.updateCyclePhase();
            
            expect(result.success).toBe(false);
        });
    });
    
    describe('getWorldEvolutionInfo', () => {
        it('should return world evolution information', () => {
            service.init(mockGameState);
            
            const info = service.getWorldEvolutionInfo();
            
            expect(info).toBeDefined();
            expect(info.level).toBe(1);
            expect(info.stage).toBe(WORLD_EVOLUTION_STAGES.PRIMORDIAL);
            expect(info.bonuses).toBeDefined();
        });
    });
    
    describe('triggerWorldEvolution', () => {
        it('should trigger world evolution', () => {
            service.init(mockGameState);
            
            const result = service.triggerWorldEvolution({ experience: 100 });
            
            expect(result.success).toBe(true);
            expect(result.evolution).toBeDefined();
        });
        
        it('should add experience to world', () => {
            service.init(mockGameState);
            
            service.triggerWorldEvolution({ experience: 50 });
            
            expect(service.worldEvolution.experience).toBe(50);
        });
    });
    
    describe('executeJudgment', () => {
        it('should execute a judgment', () => {
            service.init(mockGameState);
            
            const result = service.executeJudgment({ karmaValue: 6000 });
            
            expect(result.success).toBe(true);
            expect(result.judgment).toBeDefined();
            expect(result.executeResult).toBeDefined();
        });
        
        it('should determine blessing for righteous player', () => {
            service.init(mockGameState);
            
            const result = service.executeJudgment({ karmaValue: 6000 });
            
            expect(result.judgment.result).toBe(JUDGMENT_TYPES.BLESSING);
        });
    });
    
    describe('listJudgments', () => {
        it('should list all judgments', () => {
            service.init(mockGameState);
            service.executeJudgment({ karmaValue: 1000 });
            service.executeJudgment({ karmaValue: -1000 });
            
            const result = service.listJudgments();
            
            expect(result.success).toBe(true);
            expect(result.judgments.length).toBe(2);
        });
        
        it('should filter by result', () => {
            service.init(mockGameState);
            service.executeJudgment({ karmaValue: 6000 });
            service.executeJudgment({ karmaValue: -6000 });
            
            const result = service.listJudgments({ result: JUDGMENT_TYPES.PUNISHMENT });
            
            expect(result.judgments.length).toBe(1);
        });
    });
    
    describe('grantCosmicBlessing', () => {
        it('should grant a cosmic blessing', () => {
            service.init(mockGameState);
            
            const result = service.grantCosmicBlessing({
                type: 'test',
                title: '测试赐福',
                power: 2.0
            });
            
            expect(result.success).toBe(true);
            expect(result.blessing).toBeDefined();
        });
        
        it('should limit blessings to max count', () => {
            service.init(mockGameState);
            
            // Grant many blessings
            for (let i = 0; i < COSMIC_CONFIG.MAX_COSMIC_BLESSINGS + 5; i++) {
                service.grantCosmicBlessing({ type: 'test', title: `Test ${i}` });
            }
            
            expect(service.cosmicBlessings.length).toBeLessThanOrEqual(COSMIC_CONFIG.MAX_COSMIC_BLESSINGS);
        });
    });
    
    describe('claimCosmicBlessing', () => {
        it('should claim a blessing', () => {
            service.init(mockGameState);
            const granted = service.grantCosmicBlessing({ title: 'Test' });
            
            const result = service.claimCosmicBlessing(granted.blessing.id);
            
            expect(result.success).toBe(true);
        });
        
        it('should fail for non-existent blessing', () => {
            service.init(mockGameState);
            
            const result = service.claimCosmicBlessing('non_existent_id');
            
            expect(result.success).toBe(false);
        });
    });
    
    describe('listCosmicBlessings', () => {
        it('should list all blessings', () => {
            service.init(mockGameState);
            service.grantCosmicBlessing({ title: 'Test 1' });
            service.grantCosmicBlessing({ title: 'Test 2' });
            
            const result = service.listCosmicBlessings();
            
            expect(result.success).toBe(true);
            expect(result.blessings.length).toBe(2);
        });
        
        it('should filter by type', () => {
            service.init(mockGameState);
            service.grantCosmicBlessing({ type: 'cultivation', title: 'Cult' });
            service.grantCosmicBlessing({ type: 'combat', title: 'Combat' });
            
            const result = service.listCosmicBlessings({ type: 'cultivation' });
            
            expect(result.blessings.length).toBe(1);
            expect(result.blessings[0].type).toBe('cultivation');
        });
    });
    
    describe('executeReset', () => {
        it('should execute reset successfully', () => {
            service.init(mockGameState);
            
            const result = service.executeReset();
            
            expect(result.success).toBe(true);
            expect(result.reset).toBeDefined();
            expect(result.newCycle).toBeDefined();
        });
        
        it('should preserve legacies when enabled', () => {
            service.init(mockGameState);
            mockGameState.cultivationXP = 5000;
            
            const result = service.executeReset({ preserveLegacy: true });
            
            expect(result.reset.legaciesPreserved).toBeGreaterThan(0);
        });
        
        it('should fail on cooldown', () => {
            service.init(mockGameState);
            service.lastResetTime = Date.now() - 1000; // Recently reset
            
            const result = service.executeReset();
            
            expect(result.success).toBe(false);
            expect(result.remainingCooldown).toBeGreaterThan(0);
        });
    });
    
    describe('getResetCooldown', () => {
        it('should return not on cooldown when never reset', () => {
            service.init(mockGameState);
            
            const cooldown = service.getResetCooldown();
            
            expect(cooldown.onCooldown).toBe(false);
        });
        
        it('should return on cooldown when recently reset', () => {
            service.init(mockGameState);
            service.lastResetTime = Date.now() - 1000;
            
            const cooldown = service.getResetCooldown();
            
            expect(cooldown.onCooldown).toBe(true);
        });
    });
    
    describe('preserveLegacy', () => {
        it('should preserve cultivation legacy', () => {
            service.init(mockGameState);
            mockGameState.cultivationXP = 5000;
            
            const result = service.preserveLegacy();
            
            expect(result.success).toBe(true);
            expect(result.preservedCount).toBeGreaterThan(0);
        });
        
        it('should preserve merit legacy', () => {
            service.init(mockGameState);
            mockGameState.player.karmaPoints = 3000;
            
            const result = service.preserveLegacy();
            
            expect(result.success).toBe(true);
        });
        
        it('should preserve valuable items from inventory', () => {
            service.init(mockGameState);
            mockGameState.inventory.items = [
                { name: '普通物品', quality: '普通' },
                { name: '极品灵宝', quality: '极品' }
            ];
            
            const result = service.preserveLegacy();
            
            expect(result.success).toBe(true);
        });
    });
    
    describe('inheritLegacy', () => {
        it('should inherit a preserved legacy', () => {
            service.init(mockGameState);
            mockGameState.cultivationXP = 5000;
            service.preserveLegacy();
            
            const legacy = service.legacies[0];
            const result = service.inheritLegacy(legacy.id);
            
            expect(result.success).toBe(true);
            expect(result.inherited).toBeDefined();
        });
        
        it('should fail for non-existent legacy', () => {
            service.init(mockGameState);
            
            const result = service.inheritLegacy('non_existent');
            
            expect(result.success).toBe(false);
        });
        
        it('should remove legacy after inheritance', () => {
            service.init(mockGameState);
            mockGameState.cultivationXP = 5000;
            service.preserveLegacy();
            
            const legacy = service.legacies[0];
            service.inheritLegacy(legacy.id);
            
            expect(service.legacies.find(l => l.id === legacy.id)).toBeUndefined();
        });
    });
    
    describe('listLegacies', () => {
        it('should list all legacies', () => {
            service.init(mockGameState);
            mockGameState.cultivationXP = 5000;
            service.preserveLegacy();
            
            const result = service.listLegacies();
            
            expect(result.success).toBe(true);
            expect(result.legacies.length).toBeGreaterThan(0);
        });
        
        it('should filter by type', () => {
            service.init(mockGameState);
            mockGameState.cultivationXP = 5000;
            service.preserveLegacy();
            
            const result = service.listLegacies({ type: LEGACY_TYPES.CULTIVATION });
            
            expect(result.legacies.every(l => l.type === LEGACY_TYPES.CULTIVATION)).toBe(true);
        });
    });
    
    // ===== MCP工具测试 =====
    
    describe('MCP Tools', () => {
        describe('cosmic.cycle.query', () => {
            it('should return cycle query result', () => {
                service.init(mockGameState);
                
                const result = service.mcpCycleQuery();
                
                expect(result.success).toBe(true);
                expect(result.cycle).toBeDefined();
                expect(result.worldEvolution).toBeDefined();
                expect(result.resetCooldown).toBeDefined();
            });
        });
        
        describe('cosmic.world.evolve', () => {
            it('should trigger world evolution via MCP', () => {
                service.init(mockGameState);
                
                const result = service.mcpWorldEvolve({ experience: 100 });
                
                expect(result.success).toBe(true);
            });
        });
        
        describe('cosmic.heaven.judge', () => {
            it('should execute heaven judgment via MCP', () => {
                service.init(mockGameState);
                
                const result = service.mcpHeavenJudge({ karmaValue: 6000 });
                
                expect(result.success).toBe(true);
                expect(result.judgment).toBeDefined();
            });
        });
        
        describe('cosmic.blessing.grant', () => {
            it('should grant blessing via MCP', () => {
                service.init(mockGameState);
                
                const result = service.mcpBlessingGrant({ 
                    title: 'Test Blessing',
                    power: 2.0
                });
                
                expect(result.success).toBe(true);
            });
        });
        
        describe('cosmic.reset.execute', () => {
            it('should execute reset via MCP', () => {
                service.init(mockGameState);
                
                const result = service.mcpResetExecute({ preserveLegacy: true });
                
                expect(result.success).toBe(true);
            });
        });
        
        describe('cosmic.legacy.inherit', () => {
            it('should list available legacies when no id provided', () => {
                service.init(mockGameState);
                mockGameState.cultivationXP = 5000;
                service.preserveLegacy();
                
                const result = service.mcpLegacyInherit({});
                
                expect(result.success).toBe(true);
                expect(result.available).toBeDefined();
            });
            
            it('should inherit specific legacy when id provided', () => {
                service.init(mockGameState);
                mockGameState.cultivationXP = 5000;
                service.preserveLegacy();
                
                const legacy = service.legacies[0];
                const result = service.mcpLegacyInherit({ legacyId: legacy.id });
                
                expect(result.success).toBe(true);
            });
        });
    });
    
    describe('createCosmicCycleMCPHandlers', () => {
        it('should create MCP handlers with initialized service', () => {
            const handlers = createCosmicCycleMCPHandlers(mockGameState);
            
            expect(handlers['cosmic.cycle.query']).toBeDefined();
            expect(handlers['cosmic.world.evolve']).toBeDefined();
            expect(handlers['cosmic.heaven.judge']).toBeDefined();
            expect(handlers['cosmic.blessing.grant']).toBeDefined();
            expect(handlers['cosmic.reset.execute']).toBeDefined();
            expect(handlers['cosmic.legacy.inherit']).toBeDefined();
        });
        
        it('should return correct results from handlers', () => {
            const handlers = createCosmicCycleMCPHandlers(mockGameState);
            
            const result = handlers['cosmic.cycle.query']({});
            
            expect(result.success).toBe(true);
        });
    });
});

// ===== 配置常量测试 =====

describe('COSMIC_CONFIG', () => {
    it('should have valid configuration values', () => {
        expect(COSMIC_CONFIG.CYCLE_DURATION).toBeGreaterThan(0);
        expect(COSMIC_CONFIG.WORLD_LEVEL_RANGE.min).toBeLessThan(COSMIC_CONFIG.WORLD_LEVEL_RANGE.max);
        expect(COSMIC_CONFIG.LEGACY_RETENTION_RATIO).toBeGreaterThan(0);
        expect(COSMIC_CONFIG.LEGACY_RETENTION_RATIO).toBeLessThanOrEqual(1);
    });
});

describe('CYCLE_PHASES', () => {
    it('should have all required phases', () => {
        expect(CYCLE_PHASES.CREATION).toBeDefined();
        expect(CYCLE_PHASES.EVOLUTION).toBeDefined();
        expect(CYCLE_PHASES.FLORAGE).toBeDefined();
        expect(CYCLE_PHASES.DECAY).toBeDefined();
        expect(CYCLE_PHASES.RENEWAL).toBeDefined();
    });
});

describe('WORLD_EVOLUTION_STAGES', () => {
    it('should have all required stages', () => {
        expect(WORLD_EVOLUTION_STAGES.PRIMORDIAL).toBeDefined();
        expect(WORLD_EVOLUTION_STAGES.FORMING).toBeDefined();
        expect(WORLD_EVOLUTION_STAGES.STABLE).toBeDefined();
        expect(WORLD_EVOLUTION_STAGES.FLOURISHING).toBeDefined();
        expect(WORLD_EVOLUTION_STAGES.TRANSENDING).toBeDefined();
        expect(WORLD_EVOLUTION_STAGES.CELESTIAL).toBeDefined();
    });
});

describe('JUDGMENT_TYPES', () => {
    it('should have all required judgment types', () => {
        expect(JUDGMENT_TYPES.BLESSING).toBeDefined();
        expect(JUDGMENT_TYPES.PUNISHMENT).toBeDefined();
        expect(JUDGMENT_TYPES.TRIAL).toBeDefined();
        expect(JUDGMENT_TYPES.ASCENSION).toBeDefined();
    });
});

describe('LEGACY_TYPES', () => {
    it('should have all required legacy types', () => {
        expect(LEGACY_TYPES.CULTIVATION).toBeDefined();
        expect(LEGACY_TYPES.MERIT).toBeDefined();
        expect(LEGACY_TYPES.TREASURE).toBeDefined();
        expect(LEGACY_TYPES.WISDOM).toBeDefined();
    });
});

describe('COSMIC_CYCLE_TOOLS', () => {
    it('should have all 6 required tools', () => {
        expect(COSMIC_CYCLE_TOOLS['cosmic.cycle.query']).toBeDefined();
        expect(COSMIC_CYCLE_TOOLS['cosmic.world.evolve']).toBeDefined();
        expect(COSMIC_CYCLE_TOOLS['cosmic.heaven.judge']).toBeDefined();
        expect(COSMIC_CYCLE_TOOLS['cosmic.blessing.grant']).toBeDefined();
        expect(COSMIC_CYCLE_TOOLS['cosmic.reset.execute']).toBeDefined();
        expect(COSMIC_CYCLE_TOOLS['cosmic.legacy.inherit']).toBeDefined();
    });
    
    it('should have correct tool schema', () => {
        const tool = COSMIC_CYCLE_TOOLS['cosmic.cycle.query'];
        
        expect(tool.name).toBe('cosmic.cycle.query');
        expect(tool.description).toBeDefined();
        expect(tool.inputSchema).toBeDefined();
    });
});