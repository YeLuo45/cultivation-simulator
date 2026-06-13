/**
 * CultivationEssence.test.js - 修真精元系统测试
 * V727 Iteration 20/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationEssence } from '../../../systems/ai/CultivationEssence.js';

describe('CultivationEssence', () => {
    let system;
    beforeEach(() => { system = new CultivationEssence(); });

    describe('recruitEssence', () => {
        it('should recruit essence', () => {
            const { essence } = system.recruitEssence({ masterId: 'm1', name: 'Golden Core Essence' });
            expect(essence.masterId).toBe('m1');
            expect(essence.name).toBe('Golden Core Essence');
        });

        it('should default to novice status', () => {
            const { essence } = system.recruitEssence({});
            expect(essence.status).toBe('novice');
        });

        it('should default type to core', () => {
            const { essence } = system.recruitEssence({});
            expect(essence.type).toBe('core');
        });

        it('should default density to baseDensity', () => {
            const { essence } = system.recruitEssence({});
            expect(essence.density).toBe(20);
        });

        it('should start at level 1', () => {
            const { essence } = system.recruitEssence({});
            expect(essence.level).toBe(1);
        });

        it('should start with empty refines', () => {
            const { essence } = system.recruitEssence({});
            expect(essence.refines).toEqual([]);
        });

        it('should generate essenceId', () => {
            const { essence } = system.recruitEssence({});
            expect(essence.essenceId).toBeDefined();
            expect(typeof essence.essenceId).toBe('string');
        });

        it('should accept custom essenceId', () => {
            const { essence } = system.recruitEssence({ essenceId: 'my-essence' });
            expect(essence.essenceId).toBe('my-essence');
        });

        it('should trigger essenceRecruited hook', () => {
            let called = false;
            system.registerHook('essenceRecruited', () => { called = true; });
            system.recruitEssence({});
            expect(called).toBe(true);
        });

        it('should support all types', () => {
            const { essence: e1 } = system.recruitEssence({ type: 'core' });
            const { essence: e2 } = system.recruitEssence({ type: 'life' });
            const { essence: e3 } = system.recruitEssence({ type: 'primordial' });
            expect(e1.type).toBe('core');
            expect(e2.type).toBe('life');
            expect(e3.type).toBe('primordial');
        });
    });

    describe('getEssence', () => {
        it('should return essence', () => {
            const { essence } = system.recruitEssence({});
            expect(system.getEssence(essence.essenceId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getEssence('ghost')).toBeNull(); });
    });

    describe('listEssences', () => {
        it('should list all', () => {
            system.recruitEssence({});
            system.recruitEssence({});
            expect(system.listEssences().length).toBe(2);
        });

        it('should return empty when no essences', () => {
            expect(system.listEssences().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitEssence({ masterId: 'm1' });
            system.recruitEssence({ masterId: 'm2' });
            system.recruitEssence({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitEssence({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { essence: e1 } = system.recruitEssence({});
            const { essence: e2 } = system.recruitEssence({});
            system.legendEssence(e1.essenceId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].essenceId).toBe(e1.essenceId);
            expect(e2.status).toBe('novice');
        });

        it('should return empty when none legendary', () => {
            system.recruitEssence({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addRefine', () => {
        it('should add refine', () => {
            const { essence } = system.recruitEssence({});
            system.addRefine(essence.essenceId, 'fire-refine');
            expect(essence.refines).toContain('fire-refine');
        });

        it('should accumulate refines', () => {
            const { essence } = system.recruitEssence({});
            system.addRefine(essence.essenceId, 'r1');
            system.addRefine(essence.essenceId, 'r2');
            system.addRefine(essence.essenceId, 'r3');
            expect(essence.refines.length).toBe(3);
        });

        it('should reject missing essence', () => {
            const result = system.addRefine('ghost', 'r');
            expect(result.error).toBe('ESSENCE_NOT_FOUND');
        });

        it('should trigger refineAdded hook', () => {
            const { essence } = system.recruitEssence({});
            let called = false;
            system.registerHook('refineAdded', () => { called = true; });
            system.addRefine(essence.essenceId, 'r');
            expect(called).toBe(true);
        });
    });

    describe('raiseDensity', () => {
        it('should raise density by default', () => {
            const { essence } = system.recruitEssence({});
            system.raiseDensity(essence.essenceId);
            expect(essence.density).toBe(25);
        });

        it('should raise density by custom amount', () => {
            const { essence } = system.recruitEssence({});
            system.raiseDensity(essence.essenceId, 100);
            expect(essence.density).toBe(120);
        });

        it('should reject missing essence', () => {
            const result = system.raiseDensity('ghost');
            expect(result.error).toBe('ESSENCE_NOT_FOUND');
        });

        it('should trigger densityRaised hook', () => {
            const { essence } = system.recruitEssence({});
            let called = false;
            system.registerHook('densityRaised', () => { called = true; });
            system.raiseDensity(essence.essenceId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpEssence', () => {
        it('should level up', () => {
            const { essence } = system.recruitEssence({});
            system.levelUpEssence(essence.essenceId);
            expect(essence.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { essence } = system.recruitEssence({});
            system.levelUpEssence(essence.essenceId);
            system.levelUpEssence(essence.essenceId);
            system.levelUpEssence(essence.essenceId);
            expect(essence.level).toBe(4);
        });

        it('should reject missing essence', () => {
            const result = system.levelUpEssence('ghost');
            expect(result.error).toBe('ESSENCE_NOT_FOUND');
        });

        it('should trigger essenceLeveledUp hook', () => {
            const { essence } = system.recruitEssence({});
            let called = false;
            system.registerHook('essenceLeveledUp', () => { called = true; });
            system.levelUpEssence(essence.essenceId);
            expect(called).toBe(true);
        });
    });

    describe('legendEssence', () => {
        it('should legendize essence', () => {
            const { essence } = system.recruitEssence({});
            system.legendEssence(essence.essenceId);
            expect(essence.status).toBe('legendary');
        });

        it('should reject missing essence', () => {
            const result = system.legendEssence('ghost');
            expect(result.error).toBe('ESSENCE_NOT_FOUND');
        });

        it('should trigger essenceLegendized hook', () => {
            const { essence } = system.recruitEssence({});
            let called = false;
            system.registerHook('essenceLegendized', () => { called = true; });
            system.legendEssence(essence.essenceId);
            expect(called).toBe(true);
        });
    });

    describe('calculateEssenceValue', () => {
        it('should calculate base value', () => {
            const { essence } = system.recruitEssence({});
            // level=1, density=20, refines=0 -> 1*100 + 20*2 + 0 = 140
            expect(system.calculateEssenceValue(essence.essenceId)).toBe(140);
        });

        it('should include refines in value', () => {
            const { essence } = system.recruitEssence({});
            system.addRefine(essence.essenceId, 'r1');
            system.addRefine(essence.essenceId, 'r2');
            // level=1, density=20, refines=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateEssenceValue(essence.essenceId)).toBe(200);
        });

        it('should scale with level', () => {
            const { essence } = system.recruitEssence({});
            system.levelUpEssence(essence.essenceId);
            system.levelUpEssence(essence.essenceId);
            // level=3, density=20, refines=0 -> 3*100 + 20*2 + 0 = 340
            expect(system.calculateEssenceValue(essence.essenceId)).toBe(340);
        });

        it('should scale with density', () => {
            const { essence } = system.recruitEssence({});
            system.raiseDensity(essence.essenceId, 100);
            // level=1, density=120, refines=0 -> 1*100 + 120*2 + 0 = 340
            expect(system.calculateEssenceValue(essence.essenceId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateEssenceValue('ghost')).toBe(0);
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

        it('should handle undefined context', () => {
            system.registerTool('test', (ctx) => ctx);
            const result = system.executeTool('test');
            expect(result.success).toBe(true);
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

        it('should execute default getEssence', () => {
            const result = system.executeTool('getEssence', { essenceId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitEssence', () => {
            const result = system.executeTool('recruitEssence', { masterId: 'm1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('essenceRecruited', () => count++);
            unregister();
            system.recruitEssence({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('essenceRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitEssence({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalEssences = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalEssences = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitEssence({});
            const json = system.toJSON();
            expect(json.essences.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitEssence({});
            const json = system.toJSON();
            const newSys = new CultivationEssence();
            newSys.fromJSON(json);
            expect(newSys.essences.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.essenceCount).toBe(0);
        });
    });
});
