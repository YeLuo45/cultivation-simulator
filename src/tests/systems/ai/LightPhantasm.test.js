/**
 * LightPhantasm.test.js - 幻光系统测试
 * V432 Iteration 9/15 Round 15 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LightPhantasm } from '../../../systems/ai/LightPhantasm.js';

describe('LightPhantasm', () => {
    let system;
    beforeEach(() => { system = new LightPhantasm(); });

    describe('createIllusion', () => {
        it('should create with default values', () => {
            const { illusion } = system.createIllusion({ casterId: 'c1' });
            expect(illusion.casterId).toBe('c1');
            expect(illusion.brightness).toBe(20);
            expect(illusion.color).toBe('white');
            expect(illusion.duration).toBe(30);
            expect(illusion.status).toBe('conceived');
            expect(illusion.targets).toEqual([]);
        });

        it('should create with custom values', () => {
            const { illusion } = system.createIllusion({ casterId: 'c1', name: 'Sunbeam', brightness: 50, color: 'gold', duration: 60, targets: ['t1', 't2'] });
            expect(illusion.name).toBe('Sunbeam');
            expect(illusion.brightness).toBe(50);
            expect(illusion.color).toBe('gold');
            expect(illusion.duration).toBe(60);
            expect(illusion.targets).toEqual(['t1', 't2']);
        });

        it('should trigger illusionCreated hook', () => {
            let called = false;
            system.registerHook('illusionCreated', () => { called = true; });
            system.createIllusion({});
            expect(called).toBe(true);
        });
    });

    describe('getIllusion', () => {
        it('should return illusion', () => {
            const { illusion } = system.createIllusion({});
            expect(system.getIllusion(illusion.illusionId)).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getIllusion('ghost')).toBeNull();
        });
    });

    describe('listIllusions', () => {
        it('should list all', () => {
            system.createIllusion({});
            system.createIllusion({});
            expect(system.listIllusions().length).toBe(2);
        });
    });

    describe('listByCaster', () => {
        it('should filter by caster', () => {
            system.createIllusion({ casterId: 'c1' });
            system.createIllusion({ casterId: 'c2' });
            system.createIllusion({ casterId: 'c1' });
            expect(system.listByCaster('c1').length).toBe(2);
        });

        it('should return empty for unknown caster', () => {
            system.createIllusion({ casterId: 'c1' });
            expect(system.listByCaster('unknown').length).toBe(0);
        });
    });

    describe('listActive', () => {
        it('should only list casted illusions', () => {
            const { illusion: i1 } = system.createIllusion({});
            const { illusion: i2 } = system.createIllusion({});
            system.intensifyIllusion(i1.illusionId, 5);
            const active = system.listActive();
            expect(active.length).toBe(1);
            expect(active[0].illusionId).toBe(i1.illusionId);
        });
    });

    describe('intensifyIllusion', () => {
        it('should increase brightness by default 5', () => {
            const { illusion } = system.createIllusion({});
            const initial = illusion.brightness;
            system.intensifyIllusion(illusion.illusionId);
            expect(illusion.brightness).toBe(initial + 5);
        });

        it('should increase brightness by custom amount', () => {
            const { illusion } = system.createIllusion({});
            const initial = illusion.brightness;
            system.intensifyIllusion(illusion.illusionId, 25);
            expect(illusion.brightness).toBe(initial + 25);
        });

        it('should change status to casted when intensifying', () => {
            const { illusion } = system.createIllusion({});
            system.intensifyIllusion(illusion.illusionId, 1);
            expect(illusion.status).toBe('casted');
        });

        it('should reject missing', () => {
            const result = system.intensifyIllusion('ghost', 5);
            expect(result.error).toBe('ILLUSION_NOT_FOUND');
        });

        it('should trigger illusionIntensified hook', () => {
            const { illusion } = system.createIllusion({});
            let received = null;
            system.registerHook('illusionIntensified', (d) => { received = d; });
            system.intensifyIllusion(illusion.illusionId, 10);
            expect(received).not.toBeNull();
            expect(received.illusionId).toBe(illusion.illusionId);
        });
    });

    describe('addTarget', () => {
        it('should add target', () => {
            const { illusion } = system.createIllusion({});
            system.addTarget(illusion.illusionId, 't1');
            expect(illusion.targets).toContain('t1');
        });

        it('should not duplicate targets', () => {
            const { illusion } = system.createIllusion({});
            system.addTarget(illusion.illusionId, 't1');
            system.addTarget(illusion.illusionId, 't1');
            expect(illusion.targets.length).toBe(1);
        });

        it('should change status to casted when adding target', () => {
            const { illusion } = system.createIllusion({});
            system.addTarget(illusion.illusionId, 't1');
            expect(illusion.status).toBe('casted');
        });

        it('should reject missing', () => {
            const result = system.addTarget('ghost', 't1');
            expect(result.error).toBe('ILLUSION_NOT_FOUND');
        });

        it('should trigger targetAdded hook', () => {
            const { illusion } = system.createIllusion({});
            let received = null;
            system.registerHook('targetAdded', (d) => { received = d; });
            system.addTarget(illusion.illusionId, 't1');
            expect(received).not.toBeNull();
            expect(received.target).toBe('t1');
        });
    });

    describe('prolongIllusion', () => {
        it('should prolong by default 10', () => {
            const { illusion } = system.createIllusion({ duration: 50 });
            system.prolongIllusion(illusion.illusionId);
            expect(illusion.duration).toBe(60);
        });

        it('should prolong by custom amount', () => {
            const { illusion } = system.createIllusion({ duration: 50 });
            system.prolongIllusion(illusion.illusionId, 25);
            expect(illusion.duration).toBe(75);
        });

        it('should reject missing', () => {
            const result = system.prolongIllusion('ghost', 5);
            expect(result.error).toBe('ILLUSION_NOT_FOUND');
        });

        it('should trigger illusionProlonged hook', () => {
            const { illusion } = system.createIllusion({});
            let received = null;
            system.registerHook('illusionProlonged', (d) => { received = d; });
            system.prolongIllusion(illusion.illusionId, 20);
            expect(received).not.toBeNull();
            expect(received.illusionId).toBe(illusion.illusionId);
        });
    });

    describe('dispelIllusion', () => {
        it('should set status to dissipated', () => {
            const { illusion } = system.createIllusion({});
            system.dispelIllusion(illusion.illusionId);
            expect(illusion.status).toBe('dissipated');
        });

        it('should reject missing', () => {
            const result = system.dispelIllusion('ghost');
            expect(result.error).toBe('ILLUSION_NOT_FOUND');
        });

        it('should trigger illusionDispelled hook', () => {
            const { illusion } = system.createIllusion({});
            let called = false;
            system.registerHook('illusionDispelled', () => { called = true; });
            system.dispelIllusion(illusion.illusionId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePhantasmPower', () => {
        it('should calculate power = brightness * (1 + duration/100) + targets.length * 2', () => {
            const { illusion } = system.createIllusion({ brightness: 50, duration: 100 });
            system.addTarget(illusion.illusionId, 't1');
            system.addTarget(illusion.illusionId, 't2');
            // 50 * (1 + 100/100) + 2 * 2 = 100 + 4 = 104
            expect(system.calculatePhantasmPower(illusion.illusionId)).toBeCloseTo(104, 5);
        });

        it('should handle zero targets', () => {
            const { illusion } = system.createIllusion({ brightness: 20, duration: 1 });
            // 20 * (1 + 1/100) + 0 = 20 * 1.01 = 20.2
            expect(system.calculatePhantasmPower(illusion.illusionId)).toBeCloseTo(20.2, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePhantasmPower('ghost')).toBe(0);
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

        it('should execute default getIllusion', () => {
            const result = system.executeTool('getIllusion', { illusionId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('illusionCreated', () => count++);
            unregister();
            system.createIllusion({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('illusionCreated', () => { throw new Error('x'); });
            expect(() => system.createIllusion({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when totalIllusions >= 5', () => {
            system.stats.totalIllusions = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalIllusions = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createIllusion({});
            const json = system.toJSON();
            expect(json.illusions.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createIllusion({});
            const json = system.toJSON();
            const newSys = new LightPhantasm();
            newSys.fromJSON(json);
            expect(newSys.illusions.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with illusionCount', () => {
            system.createIllusion({});
            const stats = system.getStats();
            expect(stats.illusionCount).toBe(1);
            expect(stats.totalIllusions).toBe(1);
        });
    });
});
