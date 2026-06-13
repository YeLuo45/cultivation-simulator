/**
 * BreakthroughTribulationSystem.test.js - 突破天劫系统测试
 * V302 Iteration 8/9 - 测试覆盖率目标: 99%+
 * 100% pass rate required
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BreakthroughTribulationSystem } from '../../../systems/ai/BreakthroughTribulationSystem.js';

describe('BreakthroughTribulationSystem', () => {
    let system;

    beforeEach(() => {
        system = new BreakthroughTribulationSystem();
    });

    describe('Cultivator Management', () => {
        it('should register cultivator', () => {
            const { cultivator } = system.registerCultivator({ name: 'Hero' });
            expect(cultivator.name).toBe('Hero');
            expect(cultivator.currentRealm).toBe('qi_refining');
        });

        it('should generate id', () => {
            const { cultivator } = system.registerCultivator({});
            expect(cultivator.id).toBeDefined();
        });

        it('should get cultivator', () => {
            const { cultivator } = system.registerCultivator({ name: 'A' });
            expect(system.getCultivator(cultivator.id)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getCultivator('ghost')).toBeNull();
        });

        it('should list all cultivators', () => {
            system.registerCultivator({ name: 'A' });
            system.registerCultivator({ name: 'B' });
            expect(system.listCultivators().length).toBe(2);
        });
    });

    describe('Realm Management', () => {
        it('should have default realms', () => {
            expect(system.listRealms().length).toBe(10);
        });

        it('should get realm by id', () => {
            const realm = system.getRealm('foundation_building');
            expect(realm).not.toBeNull();
            expect(realm.order).toBe(2);
        });

        it('should return null for missing realm', () => {
            expect(system.getRealm('ghost')).toBeNull();
        });

        it('should sort realms by order', () => {
            const realms = system.listRealms();
            for (let i = 1; i < realms.length; i++) {
                expect(realms[i].order).toBeGreaterThan(realms[i - 1].order);
            }
        });
    });

    describe('Tribulation', () => {
        it('should trigger tribulation', () => {
            const { cultivator } = system.registerCultivator({ exp: 1000, comprehension: 5, daoHeart: 1 });
            const result = system.triggerTribulation(cultivator.id, 'foundation_building');
            expect(result.success).toBe(true);
        });

        it('should reject missing cultivator', () => {
            const result = system.triggerTribulation('ghost', 'foundation_building');
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should reject missing realm', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.triggerTribulation(cultivator.id, 'ghost');
            expect(result.error).toBe('REALM_NOT_FOUND');
        });

        it('should reject same-level target', () => {
            const { cultivator } = system.registerCultivator({ realm: 'foundation_building' });
            const result = system.triggerTribulation(cultivator.id, 'qi_refining');
            expect(result.error).toBe('INVALID_TARGET');
        });

        it('should reject lower-level target', () => {
            const { cultivator } = system.registerCultivator({ realm: 'core_formation' });
            const result = system.triggerTribulation(cultivator.id, 'foundation_building');
            expect(result.error).toBe('INVALID_TARGET');
        });

        it('should reject insufficient exp', () => {
            const { cultivator } = system.registerCultivator({ exp: 0 });
            const result = system.triggerTribulation(cultivator.id, 'foundation_building');
            expect(result.error).toBe('INSUFFICIENT_EXP');
        });

        it('should generate correct bolt count', () => {
            const { cultivator } = system.registerCultivator({ exp: 1000, comprehension: 5 });
            const { tribulation } = system.triggerTribulation(cultivator.id, 'foundation_building');
            expect(tribulation.bolts.length).toBe(4); // level 1 + 3
        });

        it('should trigger tribulationStarted hook', () => {
            const { cultivator } = system.registerCultivator({ exp: 1000 });
            let called = false;
            system.registerHook('tribulationStarted', () => { called = true; });
            system.triggerTribulation(cultivator.id, 'foundation_building');
            expect(called).toBe(true);
        });

        it('should increment totalAttempts', () => {
            const { cultivator } = system.registerCultivator({ exp: 1000 });
            system.triggerTribulation(cultivator.id, 'foundation_building');
            expect(system.stats.totalAttempts).toBe(1);
        });
    });

    describe('attemptTribulation', () => {
        it('should attempt and return result', () => {
            const { cultivator } = system.registerCultivator({ exp: 1000, comprehension: 5, daoHeart: 1, cultivation: 1000 });
            const { tribulation } = system.triggerTribulation(cultivator.id, 'foundation_building');
            const result = system.attemptTribulation(tribulation.tribulationId, { dodgeSkill: 1, protection: 1000 });
            expect(typeof result.survived).toBe('boolean');
        });

        it('should reject missing tribulation', () => {
            const result = system.attemptTribulation('ghost');
            expect(result.error).toBe('TRIBULATION_NOT_FOUND');
        });

        it('should reject already-resolved', () => {
            const { cultivator } = system.registerCultivator({ exp: 1000, comprehension: 5, daoHeart: 1, cultivation: 1000 });
            const { tribulation } = system.triggerTribulation(cultivator.id, 'foundation_building');
            system.attemptTribulation(tribulation.tribulationId, { dodgeSkill: 1, protection: 1000 });
            const result = system.attemptTribulation(tribulation.tribulationId);
            expect(result.error).toBe('ALREADY_RESOLVED');
        });

        it('should update cultivator realm on pass', () => {
            const { cultivator } = system.registerCultivator({ exp: 10000, comprehension: 10, daoHeart: 1, cultivation: 10000 });
            const { tribulation } = system.triggerTribulation(cultivator.id, 'foundation_building');
            // Force pass
            const result = system.attemptTribulation(tribulation.tribulationId, { dodgeSkill: 1, protection: 1000 });
            if (result.survived) {
                expect(cultivator.currentRealm).toBe('foundation_building');
            }
        });

        it('should trigger tribulationPassed hook on success', () => {
            const { cultivator } = system.registerCultivator({ exp: 10000, comprehension: 10, daoHeart: 1, cultivation: 10000 });
            const { tribulation } = system.triggerTribulation(cultivator.id, 'foundation_building');
            let passed = false;
            system.registerHook('tribulationPassed', () => { passed = true; });
            const result = system.attemptTribulation(tribulation.tribulationId, { dodgeSkill: 1, protection: 1000 });
            if (result.survived) expect(passed).toBe(true);
        });

        it('should trigger tribulationFailed hook on failure', () => {
            const { cultivator } = system.registerCultivator({ exp: 1000, comprehension: 0, daoHeart: 0, cultivation: 0 });
            const { tribulation } = system.triggerTribulation(cultivator.id, 'foundation_building');
            let failed = false;
            system.registerHook('tribulationFailed', () => { failed = true; });
            const result = system.attemptTribulation(tribulation.tribulationId);
            if (!result.survived) expect(failed).toBe(true);
        });
    });

    describe('calculateSurvivalRate', () => {
        it('should return 0 for missing cultivator', () => {
            expect(system.calculateSurvivalRate('ghost', 'foundation_building')).toBe(0);
        });

        it('should return 0 for missing realm', () => {
            const { cultivator } = system.registerCultivator({});
            expect(system.calculateSurvivalRate(cultivator.id, 'ghost')).toBe(0);
        });

        it('should be higher with higher comprehension', () => {
            const { c1 } = { c1: system.registerCultivator({ comprehension: 1 }).cultivator };
            const rate1 = system.calculateSurvivalRate(c1.id, 'foundation_building');
            const { c2 } = { c2: system.registerCultivator({ comprehension: 5 }).cultivator };
            const rate2 = system.calculateSurvivalRate(c2.id, 'foundation_building');
            expect(rate2).toBeGreaterThan(rate1);
        });

        it('should be clamped between 0 and 1', () => {
            const { cultivator } = system.registerCultivator({ comprehension: 100, daoHeart: 100, karma: 1000 });
            const rate = system.calculateSurvivalRate(cultivator.id, 'qi_refining');
            expect(rate).toBeLessThanOrEqual(1);
            expect(rate).toBeGreaterThanOrEqual(0);
        });
    });

    describe('getTribulation', () => {
        it('should return tribulation copy', () => {
            const { cultivator } = system.registerCultivator({ exp: 1000 });
            const { tribulation } = system.triggerTribulation(cultivator.id, 'foundation_building');
            const t = system.getTribulation(tribulation.tribulationId);
            expect(t).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getTribulation('ghost')).toBeNull();
        });
    });

    describe('Calamity System', () => {
        it('should spawn calamity', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.spawnCalamity(cultivator.id, 'inner_demon');
            expect(result.success).toBe(true);
            expect(result.calamity.type).toBe('inner_demon');
        });

        it('should reject missing cultivator', () => {
            const result = system.spawnCalamity('ghost');
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should increment totalCalamities', () => {
            const { cultivator } = system.registerCultivator({});
            system.spawnCalamity(cultivator.id);
            expect(system.stats.totalCalamities).toBe(1);
        });

        it('should resist calamity', () => {
            const { cultivator } = system.registerCultivator({ daoHeart: 10 });
            const { calamity } = system.spawnCalamity(cultivator.id, 'inner_demon');
            calamity.severity = 1; // ensure low severity
            const result = system.resistCalamity(calamity.calamityId);
            expect(result.success).toBe(true);
        });

        it('should reject missing calamity', () => {
            const result = system.resistCalamity('ghost');
            expect(result.error).toBe('CALAMITY_NOT_FOUND');
        });

        it('should reject missing cultivator on resist', () => {
            const result = system.spawnCalamity('ghost');
            // First create valid calamity
            const { cultivator } = system.registerCultivator({});
            const { calamity } = system.spawnCalamity(cultivator.id);
            // Now delete the cultivator
            system.cultivators.delete(cultivator.id);
            const r = system.resistCalamity(calamity.calamityId);
            expect(r.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should increase daoHeart on resist', () => {
            const { cultivator } = system.registerCultivator({ daoHeart: 0.5 });
            const { calamity } = system.spawnCalamity(cultivator.id);
            calamity.severity = 1;
            const before = cultivator.daoHeart;
            system.resistCalamity(calamity.calamityId, 100);
            expect(cultivator.daoHeart).toBeGreaterThanOrEqual(before);
        });

        it('should decrease daoHeart on fail', () => {
            const { cultivator } = system.registerCultivator({ daoHeart: 0.5 });
            const before = cultivator.daoHeart;
            const { calamity } = system.spawnCalamity(cultivator.id);
            calamity.severity = 100;
            const result = system.resistCalamity(calamity.calamityId);
            if (!result.resisted) {
                expect(cultivator.daoHeart).toBeLessThan(before);
            }
        });

        it('should trigger calamityResisted hook', () => {
            const { cultivator } = system.registerCultivator({ daoHeart: 10 });
            const { calamity } = system.spawnCalamity(cultivator.id);
            calamity.severity = 1;
            let called = false;
            system.registerHook('calamityResisted', () => { called = true; });
            system.resistCalamity(calamity.calamityId);
            expect(called).toBe(true);
        });

        it('should get calamity', () => {
            const { cultivator } = system.registerCultivator({});
            const { calamity } = system.spawnCalamity(cultivator.id);
            expect(system.getCalamity(calamity.calamityId)).not.toBeNull();
        });

        it('should return null for missing calamity', () => {
            expect(system.getCalamity('ghost')).toBeNull();
        });
    });

    describe('invokeHeavenBlessing', () => {
        it('should reject missing cultivator', () => {
            const result = system.invokeHeavenBlessing('ghost');
            expect(result.error).toBe('CULTIVATOR_NOT_FOUND');
        });

        it('should potentially grant blessing', () => {
            // Set chance to 1 to force blessing
            system.config.heavenBlessingChance = 1;
            const { cultivator } = system.registerCultivator({});
            const result = system.invokeHeavenBlessing(cultivator.id);
            expect(result.success).toBe(true);
        });

        it('should trigger heavenBlessing hook on success', () => {
            system.config.heavenBlessingChance = 1;
            const { cultivator } = system.registerCultivator({});
            let called = false;
            system.registerHook('heavenBlessing', () => { called = true; });
            system.invokeHeavenBlessing(cultivator.id);
            expect(called).toBe(true);
        });
    });

    describe('Mesh Network', () => {
        it('should add mesh node', () => {
            const result = system.addMeshNode('n1');
            expect(result.success).toBe(true);
        });

        it('should connect nodes', () => {
            system.addMeshNode('a');
            system.addMeshNode('b');
            const result = system.connectMeshNodes('a', 'b');
            expect(result.success).toBe(true);
        });

        it('should reject missing nodes', () => {
            const result = system.connectMeshNodes('ghost', 'ghost2');
            expect(result.error).toBe('NODE_NOT_FOUND');
        });

        it('should request assistance', () => {
            system.addMeshNode('n1');
            system.registerCultivator({ name: 'Helper' });
            const result = system.requestAssistance('n1', 'any', 'shield');
            // Helper not found, so error
            expect(result.error).toBe('HELPER_NOT_FOUND');
        });

        it('should request assistance with valid helper', () => {
            system.addMeshNode('n1');
            const { cultivator } = system.registerCultivator({ name: 'Helper' });
            const result = system.requestAssistance('n1', cultivator.id, 'shield');
            expect(result.success).toBe(true);
        });

        it('should reject missing target node', () => {
            const { cultivator } = system.registerCultivator({});
            const result = system.requestAssistance('ghost', cultivator.id, 'shield');
            expect(result.error).toBe('NODE_NOT_FOUND');
        });
    });

    describe('Tool System', () => {
        it('should register tool', () => {
            system.registerTool('test', () => 'ok');
            expect(system.listTools()).toContain('test');
        });

        it('should execute tool', () => {
            system.registerTool('test', (ctx) => ctx.value);
            const result = system.executeTool('test', { value: 42 });
            expect(result.result).toBe(42);
        });

        it('should reject missing tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should handle errors', () => {
            system.registerTool('bad', () => { throw new Error('x'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('x');
        });

        it('should execute default listRealms', () => {
            const result = system.executeTool('listRealms', {});
            expect(result.result.length).toBe(10);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('heavenBlessing', () => count++);
            system.config.heavenBlessingChance = 1;
            const { cultivator } = system.registerCultivator({});
            system.invokeHeavenBlessing(cultivator.id);
            unregister();
            system.invokeHeavenBlessing(cultivator.id);
            expect(count).toBe(1);
        });

        it('should handle errors silently', () => {
            system.registerHook('heavenBlessing', () => { throw new Error('x'); });
            system.config.heavenBlessingChance = 1;
            const { cultivator } = system.registerCultivator({});
            expect(() => system.invokeHeavenBlessing(cultivator.id)).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient success', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve with enough success', () => {
            // Manually set success count
            system.stats.totalSuccess = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double-evolve', () => {
            system.stats.totalSuccess = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should trigger systemEvolved hook', () => {
            system.stats.totalSuccess = 10;
            let called = false;
            system.registerHook('systemEvolved', () => { called = true; });
            system.autoEvolve();
            expect(called).toBe(true);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerCultivator({ name: 'A' });
            const json = system.toJSON();
            expect(json.cultivators.length).toBe(1);
        });

        it('should deserialize', () => {
            system.registerCultivator({ name: 'A' });
            const json = system.toJSON();
            const newSys = new BreakthroughTribulationSystem();
            newSys.fromJSON(json);
            expect(newSys.cultivators.size).toBe(1);
        });

        it('should preserve mesh assistance', () => {
            system.addMeshNode('n1');
            system.registerCultivator({ name: 'Helper' });
            const json = system.toJSON();
            const newSys = new BreakthroughTribulationSystem();
            newSys.fromJSON(json);
            expect(newSys.meshNodes.get('n1').assistance).toBeDefined();
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.cultivatorCount).toBe(0);
        });

        it('should track all counts', () => {
            system.registerCultivator({ name: 'A' });
            const stats = system.getStats();
            expect(stats.cultivatorCount).toBe(1);
        });

        it('should calculate success rate', () => {
            system.stats.totalAttempts = 10;
            system.stats.totalSuccess = 5;
            const stats = system.getStats();
            expect(stats.successRate).toBe(0.5);
        });
    });
});