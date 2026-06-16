/**
 * DiscipleCultivationSystem.test.js - 弟子修炼系统测试
 * V296 Iteration 2/9 - 测试覆盖率目标: 99%+
 * 100% pass rate required
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DiscipleCultivationSystem } from '../../../systems/ai/DiscipleCultivationSystem.js';

describe('DiscipleCultivationSystem', () => {
    let system;

    beforeEach(() => {
        system = new DiscipleCultivationSystem({ evolutionEnabled: true });
    });

    // ========== 修炼者注册测试 ==========
    
    describe('registerCultivator', () => {
        it('should register a new cultivator', () => {
            const result = system.registerCultivator('c1', { name: 'Zhang Wei' });
            expect(result.success).toBe(true);
            expect(result.cultivator.cultivatorId).toBe('c1');
            expect(result.cultivator.name).toBe('Zhang Wei');
            expect(result.cultivator.realm).toBe('Qi Gathering');
        });

        it('should default to Qi Gathering realm', () => {
            const result = system.registerCultivator('c1');
            expect(result.cultivator.realm).toBe('Qi Gathering');
            expect(result.cultivator.realmOrder).toBe(1);
        });

        it('should reject duplicate cultivator', () => {
            system.registerCultivator('c1');
            const result = system.registerCultivator('c1');
            expect(result.success).toBe(false);
            expect(result.error).toBe('CULTIVATOR_EXISTS');
        });

        it('should set random attributes when not provided', () => {
            const result = system.registerCultivator('c1');
            const attrs = result.cultivator.attributes;
            expect(attrs.spiritRoot).toBeGreaterThan(0);
            expect(attrs.comprehension).toBeGreaterThan(0);
            expect(attrs.willpower).toBeGreaterThan(0);
            expect(attrs.luck).toBeGreaterThan(0);
        });

        it('should trigger cultivatorRegistered hook', () => {
            let called = false;
            system.registerHook('cultivatorRegistered', () => { called = true; });
            system.registerCultivator('c1');
            expect(called).toBe(true);
        });
    });

    describe('getCultivator', () => {
        it('should return cultivator when exists', () => {
            system.registerCultivator('c1', { name: 'Li Ming' });
            const c = system.getCultivator('c1');
            expect(c).not.toBeNull();
            expect(c.name).toBe('Li Ming');
        });

        it('should return null when not exists', () => {
            expect(system.getCultivator('ghost')).toBeNull();
        });
    });

    describe('removeCultivator', () => {
        it('should remove existing cultivator', () => {
            system.registerCultivator('c1');
            const result = system.removeCultivator('c1');
            expect(result.success).toBe(true);
            expect(system.getCultivator('c1')).toBeNull();
        });

        it('should return error for non-existent', () => {
            const result = system.removeCultivator('ghost');
            expect(result.success).toBe(false);
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should trigger cultivatorRemoved hook', () => {
            system.registerCultivator('c1');
            let called = false;
            system.registerHook('cultivatorRemoved', () => { called = true; });
            system.removeCultivator('c1');
            expect(called).toBe(true);
        });
    });

    // ========== 功法系统测试 ==========
    
    describe('registerTechnique', () => {
        it('should register a technique', () => {
            const result = system.registerTechnique('fireball', {
                name: 'Fire Ball',
                elements: ['fire'],
                expBonus: 1.5,
            });
            expect(result.success).toBe(true);
            expect(result.technique.expBonus).toBe(1.5);
        });

        it('should reject duplicate technique', () => {
            system.registerTechnique('fireball');
            const result = system.registerTechnique('fireball');
            expect(result.success).toBe(false);
            expect(result.error).toBe('TECHNIQUE_EXISTS');
        });

        it('should default expBonus to 1.0', () => {
            const result = system.registerTechnique('basic_tech');
            expect(result.technique.expBonus).toBe(1.0);
        });
    });

    describe('learnTechnique', () => {
        it('should learn technique successfully', () => {
            system.registerCultivator('c1');
            system.registerTechnique('fireball', { expBonus: 1.5 });
            const result = system.learnTechnique('c1', 'fireball');
            expect(result.success).toBe(true);
            expect(result.techniques).toContain('fireball');
        });

        it('should reject non-existent cultivator', () => {
            system.registerTechnique('fireball');
            const result = system.learnTechnique('ghost', 'fireball');
            expect(result.success).toBe(false);
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should reject non-existent technique', () => {
            system.registerCultivator('c1');
            const result = system.learnTechnique('c1', 'ghost');
            expect(result.success).toBe(false);
            expect(result.error).toBe('TECHNIQUE_NOT_FOUND');
        });

        it('should reject already learned technique', () => {
            system.registerCultivator('c1');
            system.registerTechnique('fireball');
            system.learnTechnique('c1', 'fireball');
            const result = system.learnTechnique('c1', 'fireball');
            expect(result.success).toBe(false);
            expect(result.error).toBe('TECHNIQUE_ALREADY_LEARNED');
        });

        it('should reject when attribute requirements not met', () => {
            system.registerCultivator('c1', { attributes: { spiritRoot: 3 } });
            system.registerTechnique('high_tech', { requiredAttributes: { spiritRoot: 8 } });
            const result = system.learnTechnique('c1', 'high_tech');
            expect(result.success).toBe(false);
            expect(result.error).toBe('ATTRIBUTE_NOT_MET');
        });

        it('should track learnedBy on technique', () => {
            system.registerCultivator('c1');
            system.registerTechnique('fireball');
            system.learnTechnique('c1', 'fireball');
            const tech = system.getTechnique('fireball');
            expect(tech.learnedBy).toContain('c1');
        });
    });

    describe('getTechnique', () => {
        it('should return technique when exists', () => {
            system.registerTechnique('fireball', { name: 'Fire Ball' });
            const tech = system.getTechnique('fireball');
            expect(tech).not.toBeNull();
            expect(tech.name).toBe('Fire Ball');
        });

        it('should return null for non-existent', () => {
            expect(system.getTechnique('ghost')).toBeNull();
        });
    });

    // ========== 修炼核心测试 ==========
    
    describe('cultivate', () => {
        it('should add exp on cultivate', () => {
            system.registerCultivator('c1');
            const result = system.cultivate('c1', 10);
            expect(result.success).toBe(true);
            expect(result.expGained).toBeGreaterThan(0);
            expect(result.totalExp).toBeGreaterThan(0);
        });

        it('should apply cultivation speed bonus', () => {
            system.registerCultivator('c1', { cultivationSpeed: 2.0 });
            const result1 = system.cultivate('c1', 10);
            system = new DiscipleCultivationSystem();
            system.registerCultivator('c2');
            const result2 = system.cultivate('c2', 10);
            expect(result1.expGained).toBeGreaterThan(result2.expGained);
        });

        it('should apply technique exp bonus', () => {
            system.registerCultivator('c1');
            system.registerTechnique('fireball', { expBonus: 2.0 });
            system.learnTechnique('c1', 'fireball');
            const result = system.cultivate('c1', 10);
            expect(result.expGained).toBeGreaterThanOrEqual(20);
        });

        it('should return error for non-existent cultivator', () => {
            const result = system.cultivate('ghost', 10);
            expect(result.success).toBe(false);
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should trigger cultivated hook', () => {
            system.registerCultivator('c1');
            let hookData = null;
            system.registerHook('cultivated', (data) => { hookData = data; });
            system.cultivate('c1', 10);
            expect(hookData).not.toBeNull();
            expect(hookData.expGained).toBeGreaterThan(0);
        });

        it('should update lastCultivateAt', () => {
            system.registerCultivator('c1');
            const before = system.getCultivator('c1').lastCultivateAt;
            system.cultivate('c1', 10);
            const after = system.getCultivator('c1').lastCultivateAt;
            expect(after).toBeGreaterThanOrEqual(before);
        });
    });

    describe('realm advancement', () => {
        it('should advance realm when exp sufficient', () => {
            system.registerCultivator('c1');
            const c = system.getCultivator('c1');
            c.exp = 1000; // Very high exp to ensure advancement
            const result = system.cultivate('c1', 1);
            expect(result.success).toBe(true);
            expect(result.advanced).toBe(true);
            expect(result.newRealm).toBe('Foundation Building');
        });

        it('should not advance when exp insufficient', () => {
            system.registerCultivator('c1');
            const result = system.cultivate('c1', 5);
            expect(result.advanced).toBe(false);
        });

        it('should trigger realmAdvanced hook on advancement', () => {
            system.registerCultivator('c1');
            const c = system.getCultivator('c1');
            c.exp = 2000;
            let newRealm = null;
            system.registerHook('realmAdvanced', (data) => { newRealm = data.newRealm; });
            system.cultivate('c1', 1);
            expect(newRealm).toBe('Foundation Building');
        });

        it('should not exceed max realm', () => {
            system.registerCultivator('c1');
            const c = system.getCultivator('c1');
            c.realm = 'Immortal Ascension';
            c.realmOrder = 7;
            c.exp = 1000000;
            const result = system.cultivate('c1', 100);
            expect(result.advanced).toBe(false);
        });
    });

    // ========== 目标系统测试 ==========
    
    describe('setGoalRealm', () => {
        it('should set goal realm', () => {
            system.registerCultivator('c1');
            const result = system.setGoalRealm('c1', 'Core Formation');
            expect(result.success).toBe(true);
            expect(result.goalRealm).toBe('Core Formation');
        });

        it('should reject non-existent cultivator', () => {
            const result = system.setGoalRealm('ghost', 'Core Formation');
            expect(result.success).toBe(false);
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should reject invalid realm', () => {
            system.registerCultivator('c1');
            const result = system.setGoalRealm('c1', 'Invalid Realm');
            expect(result.success).toBe(false);
            expect(result.error).toBe('REALM_NOT_FOUND');
        });
    });

    describe('getProgress', () => {
        it('should return progress for cultivator', () => {
            system.registerCultivator('c1', { realm: 'Qi Gathering', realmOrder: 1, exp: 50 });
            system.setGoalRealm('c1', 'Foundation Building');
            const progress = system.getProgress('c1');
            expect(progress.cultivatorId).toBe('c1');
            expect(progress.currentRealm).toBe('Qi Gathering');
            expect(progress.goalRealm).toBe('Foundation Building');
        });

        it('should return null for non-existent cultivator', () => {
            expect(system.getProgress('ghost')).toBeNull();
        });

        it('should calculate progressToGoal percentage', () => {
            system.registerCultivator('c1', { realmOrder: 1, exp: 50 });
            system.setGoalRealm('c1', 'Core Formation'); // order 3
            const progress = system.getProgress('c1');
            expect(progress.progressToGoal).not.toBeNull();
        });
    });

    // ========== 领悟系统测试 ==========
    
    describe('addInsight', () => {
        it('should add insight to cultivator', () => {
            system.registerCultivator('c1');
            const result = system.addInsight('c1', 'Understanding fire essence');
            expect(result.success).toBe(true);
            expect(result.insights.length).toBe(1);
        });

        it('should apply insight bonus to cultivation speed', () => {
            system.registerCultivator('c1');
            system.addInsight('c1', 'Deep insight');
            const c = system.getCultivator('c1');
            expect(c.cultivationSpeed).not.toBe(1.0); // Multiplied by random bonus
            expect(c.insights.length).toBe(1);
        });

        it('should reject non-existent cultivator', () => {
            const result = system.addInsight('ghost', 'insight');
            expect(result.success).toBe(false);
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should trigger insightGained hook', () => {
            system.registerCultivator('c1');
            let called = false;
            system.registerHook('insightGained', () => { called = true; });
            system.addInsight('c1', 'insight');
            expect(called).toBe(true);
        });
    });

    // ========== Hook 系统测试 ==========
    
    describe('Hook System', () => {
        it('should register multiple hooks', () => {
            let count = 0;
            system.registerHook('cultivated', () => count++);
            system.registerHook('cultivated', () => count++);
            system.registerCultivator('c1');
            system.cultivate('c1', 10);
            expect(count).toBe(2);
        });

        it('should handle hook errors silently', () => {
            system.registerHook('cultivated', () => { throw new Error('test'); });
            system.registerCultivator('c1');
            expect(() => system.cultivate('c1', 10)).not.toThrow();
        });

        it('should return unregister function', () => {
            let count = 0;
            const unregister = system.registerHook('cultivated', () => count++);
            system.registerCultivator('c1');
            system.cultivate('c1', 10);
            unregister();
            system.cultivate('c1', 10);
            expect(count).toBe(1);
        });
    });

    // ========== 状态查询测试 ==========
    
    describe('getOverview', () => {
        it('should return correct overview', () => {
            system.registerCultivator('c1');
            system.registerCultivator('c2');
            system.registerTechnique('fireball');
            const overview = system.getOverview();
            expect(overview.totalCultivators).toBe(2);
            expect(overview.totalTechniques).toBe(1);
            expect(overview.evolutionEnabled).toBe(true);
        });

        it('should calculate average realm order', () => {
            system.registerCultivator('c1', { realmOrder: 2 });
            system.registerCultivator('c2', { realmOrder: 4 });
            const overview = system.getOverview();
            expect(overview.averageRealmOrder).toBe(3);
        });
    });

    // ========== 数据持久化测试 ==========
    
    describe('Data Persistence', () => {
        it('should serialize to JSON', () => {
            system.registerCultivator('c1', { name: 'Zhang' });
            system.registerTechnique('fireball', { name: 'Fire Ball' });
            const json = system.toJSON();
            expect(json.cultivators.length).toBe(1);
            expect(json.techniques.length).toBe(1);
        });

        it('should deserialize from JSON', () => {
            system.registerCultivator('c1', { name: 'Zhang' });
            const json = system.toJSON();
            const newSystem = new DiscipleCultivationSystem();
            newSystem.fromJSON(json);
            expect(newSystem.getCultivator('c1').name).toBe('Zhang');
        });

        it('should preserve config on deserialize', () => {
            system.registerCultivator('c1');
            const json = system.toJSON();
            const newSystem = new DiscipleCultivationSystem({ evolutionEnabled: false });
            newSystem.fromJSON(json);
            expect(newSystem.evolutionEnabled).toBe(true);
        });
    });

    // ========== 边界情况测试 ==========
    
    describe('Edge Cases', () => {
        it('should handle cultivate with zero amount', () => {
            system.registerCultivator('c1');
            const result = system.cultivate('c1', 0);
            expect(result.success).toBe(true);
        });

        it('should handle cultivator with no techniques', () => {
            system.registerCultivator('c1');
            const c = system.getCultivator('c1');
            expect(c.techniques).toEqual([]);
        });

        it('should handle insight on cultivator with no insights', () => {
            system.registerCultivator('c1');
            const c = system.getCultivator('c1');
            expect(c.insights).toEqual([]);
        });

        it('should handle getOverview with no cultivators', () => {
            const overview = system.getOverview();
            expect(overview.totalCultivators).toBe(0);
            expect(overview.averageRealmOrder).toBe(0);
        });

        it('should handle technique without required attributes', () => {
            const result = system.registerTechnique('simple_tech', {
                requiredAttributes: {},
            });
            expect(result.success).toBe(true);
        });

        it('should handle goal set to current realm', () => {
            system.registerCultivator('c1', { realm: 'Qi Gathering' });
            const result = system.setGoalRealm('c1', 'Qi Gathering');
            expect(result.success).toBe(true);
        });
    });
});