/**
 * SpiritualVeins.test.js - 灵脉系统测试
 * V448 Iteration 10/15 Round 16 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SpiritualVeins } from '../../../systems/ai/SpiritualVeins.js';

describe('SpiritualVeins', () => {
    let system;
    beforeEach(() => { system = new SpiritualVeins(); });

    describe('discoverVein', () => {
        it('should discover', () => {
            const { vein } = system.discoverVein({ ownerId: 'o1' });
            expect(vein.ownerId).toBe('o1');
        });

        it('should set defaults', () => {
            const { vein } = system.discoverVein({});
            expect(vein.type).toBe('copper');
            expect(vein.purity).toBe(50);
            expect(vein.reserves).toBe(100);
            expect(vein.status).toBe('flowing');
        });

        it('should trigger veinDiscovered hook', () => {
            let called = false;
            system.registerHook('veinDiscovered', () => { called = true; });
            system.discoverVein({});
            expect(called).toBe(true);
        });

        it('should allow custom type', () => {
            const { vein } = system.discoverVein({ type: 'gold' });
            expect(vein.type).toBe('gold');
        });
    });

    describe('getVein', () => {
        it('should return', () => {
            const { vein } = system.discoverVein({});
            expect(system.getVein(vein.veinId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getVein('ghost')).toBeNull(); });
    });

    describe('listVeins', () => {
        it('should list all', () => {
            system.discoverVein({});
            system.discoverVein({});
            expect(system.listVeins().length).toBe(2);
        });
    });

    describe('listByOwner', () => {
        it('should filter', () => {
            system.discoverVein({ ownerId: 'o1' });
            system.discoverVein({ ownerId: 'o2' });
            expect(system.listByOwner('o1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.discoverVein({ type: 'gold' });
            system.discoverVein({ type: 'silver' });
            expect(system.listByType('gold').length).toBe(1);
        });
    });

    describe('extractEnergy', () => {
        it('should extract', () => {
            const { vein } = system.discoverVein({ reserves: 100 });
            system.extractEnergy(vein.veinId, 10);
            expect(vein.reserves).toBe(90);
        });

        it('should reject missing', () => {
            const result = system.extractEnergy('ghost', 10);
            expect(result.error).toBe('VEIN_NOT_FOUND');
        });

        it('should trigger energyExtracted hook', () => {
            const { vein } = system.discoverVein({});
            let called = false;
            system.registerHook('energyExtracted', () => { called = true; });
            system.extractEnergy(vein.veinId, 5);
            expect(called).toBe(true);
        });

        it('should deplete when reserves hit 0', () => {
            const { vein } = system.discoverVein({ reserves: 5 });
            system.extractEnergy(vein.veinId, 10);
            expect(vein.reserves).toBe(0);
            expect(vein.status).toBe('depleted');
        });
    });

    describe('purifyVein', () => {
        it('should purify', () => {
            const { vein } = system.discoverVein({ purity: 50 });
            system.purifyVein(vein.veinId, 10);
            expect(vein.purity).toBe(60);
        });

        it('should reject missing', () => {
            const result = system.purifyVein('ghost', 5);
            expect(result.error).toBe('VEIN_NOT_FOUND');
        });

        it('should trigger veinPurified hook', () => {
            const { vein } = system.discoverVein({});
            let called = false;
            system.registerHook('veinPurified', () => { called = true; });
            system.purifyVein(vein.veinId, 5);
            expect(called).toBe(true);
        });

        it('should cap at 100', () => {
            const { vein } = system.discoverVein({ purity: 95 });
            system.purifyVein(vein.veinId, 50);
            expect(vein.purity).toBe(100);
        });
    });

    describe('refineVein', () => {
        it('should refine', () => {
            const { vein } = system.discoverVein({});
            system.refineVein(vein.veinId);
            expect(vein.status).toBe('refined');
        });

        it('should reject missing', () => {
            const result = system.refineVein('ghost');
            expect(result.error).toBe('VEIN_NOT_FOUND');
        });

        it('should trigger veinRefined hook', () => {
            const { vein } = system.discoverVein({});
            let called = false;
            system.registerHook('veinRefined', () => { called = true; });
            system.refineVein(vein.veinId);
            expect(called).toBe(true);
        });
    });

    describe('calculateVeinProductivity', () => {
        it('should calculate', () => {
            const { vein } = system.discoverVein({ purity: 50, reserves: 100, output: 10 });
            expect(system.calculateVeinProductivity(vein.veinId)).toBeCloseTo(500, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateVeinProductivity('ghost')).toBe(0);
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

        it('should execute default getVein', () => {
            const result = system.executeTool('getVein', { veinId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('veinDiscovered', () => count++);
            unregister();
            system.discoverVein({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('veinDiscovered', () => { throw new Error('x'); });
            expect(() => system.discoverVein({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalVeins = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalVeins = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.discoverVein({});
            const json = system.toJSON();
            expect(json.veins.length).toBe(1);
        });
        it('should deserialize', () => {
            system.discoverVein({});
            const json = system.toJSON();
            const newSys = new SpiritualVeins();
            newSys.fromJSON(json);
            expect(newSys.veins.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.veinCount).toBe(0);
        });
    });
});
