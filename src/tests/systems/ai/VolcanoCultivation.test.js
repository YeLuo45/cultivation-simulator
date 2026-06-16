/**
 * VolcanoCultivation.test.js - 火山修炼系统测试
 * V464 Iteration 11/15 Round 17 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { VolcanoCultivation } from '../../../systems/ai/VolcanoCultivation.js';

describe('VolcanoCultivation', () => {
    let system;
    beforeEach(() => { system = new VolcanoCultivation(); });

    describe('enterCrater', () => {
        it('should enter crater', () => {
            const { crater } = system.enterCrater({ cultivatorId: 'c1', name: 'Fire Pit' });
            expect(crater.cultivatorId).toBe('c1');
            expect(crater.name).toBe('Fire Pit');
        });

        it('should use default name', () => {
            const { crater } = system.enterCrater({});
            expect(crater.name).toBe('Unnamed Crater');
        });

        it('should use default status dormant', () => {
            const { crater } = system.enterCrater({});
            expect(crater.status).toBe('dormant');
        });

        it('should use default baseHeat', () => {
            const { crater } = system.enterCrater({});
            expect(crater.heat).toBe(100);
        });

        it('should trigger craterEntered hook', () => {
            let called = false;
            system.registerHook('craterEntered', () => { called = true; });
            system.enterCrater({});
            expect(called).toBe(true);
        });

        it('should generate craterId', () => {
            const { crater } = system.enterCrater({});
            expect(crater.craterId).toBeTruthy();
            expect(typeof crater.craterId).toBe('string');
        });
    });

    describe('getCrater', () => {
        it('should return crater', () => {
            const { crater } = system.enterCrater({});
            expect(system.getCrater(crater.craterId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCrater('ghost')).toBeNull(); });
        it('should return a copy', () => {
            const { crater } = system.enterCrater({});
            const retrieved = system.getCrater(crater.craterId);
            retrieved.name = 'modified';
            expect(crater.name).toBe('Unnamed Crater');
        });
    });

    describe('listCraters', () => {
        it('should list all', () => {
            system.enterCrater({});
            system.enterCrater({});
            expect(system.listCraters().length).toBe(2);
        });
        it('should return empty list', () => {
            expect(system.listCraters().length).toBe(0);
        });
    });

    describe('listByCultivator', () => {
        it('should filter by cultivator', () => {
            system.enterCrater({ cultivatorId: 'c1' });
            system.enterCrater({ cultivatorId: 'c2' });
            expect(system.listByCultivator('c1').length).toBe(1);
        });
        it('should return empty for missing cultivator', () => {
            system.enterCrater({ cultivatorId: 'c1' });
            expect(system.listByCultivator('ghost').length).toBe(0);
        });
    });

    describe('listActive', () => {
        it('should filter active craters', () => {
            const { crater } = system.enterCrater({});
            system.eruptCrater(crater.craterId);
            // erupting is not active
            expect(system.listActive().length).toBe(0);
        });
    });

    describe('deepenCrater', () => {
        it('should deepen', () => {
            const { crater } = system.enterCrater({});
            system.deepenCrater(crater.craterId, 20);
            expect(crater.depth).toBe(20);
        });

        it('should use default amount', () => {
            const { crater } = system.enterCrater({});
            system.deepenCrater(crater.craterId);
            expect(crater.depth).toBe(10);
        });

        it('should reject missing', () => {
            const result = system.deepenCrater('ghost', 10);
            expect(result.error).toBe('CRATER_NOT_FOUND');
        });

        it('should trigger craterDeepened hook', () => {
            const { crater } = system.enterCrater({});
            let called = false;
            system.registerHook('craterDeepened', () => { called = true; });
            system.deepenCrater(crater.craterId, 10);
            expect(called).toBe(true);
        });
    });

    describe('increaseHeat', () => {
        it('should increase heat', () => {
            const { crater } = system.enterCrater({});
            system.increaseHeat(crater.craterId, 25);
            expect(crater.heat).toBe(125);
        });

        it('should use default amount', () => {
            const { crater } = system.enterCrater({});
            system.increaseHeat(crater.craterId);
            expect(crater.heat).toBe(105);
        });

        it('should reject missing', () => {
            const result = system.increaseHeat('ghost', 10);
            expect(result.error).toBe('CRATER_NOT_FOUND');
        });

        it('should trigger heatIncreased hook', () => {
            const { crater } = system.enterCrater({});
            let called = false;
            system.registerHook('heatIncreased', () => { called = true; });
            system.increaseHeat(crater.craterId, 5);
            expect(called).toBe(true);
        });
    });

    describe('collectMineral', () => {
        it('should collect mineral', () => {
            const { crater } = system.enterCrater({});
            system.collectMineral(crater.craterId, 'obsidian');
            expect(crater.minerals).toContain('obsidian');
        });

        it('should reject missing crater', () => {
            const result = system.collectMineral('ghost', 'obsidian');
            expect(result.error).toBe('CRATER_NOT_FOUND');
        });

        it('should handle null mineral', () => {
            const { crater } = system.enterCrater({});
            const result = system.collectMineral(crater.craterId, null);
            expect(result.success).toBe(true);
            expect(crater.minerals.length).toBe(0);
        });

        it('should collect multiple minerals', () => {
            const { crater } = system.enterCrater({});
            system.collectMineral(crater.craterId, 'obsidian');
            system.collectMineral(crater.craterId, 'ruby');
            expect(crater.minerals.length).toBe(2);
        });
    });

    describe('eruptCrater', () => {
        it('should erupt', () => {
            const { crater } = system.enterCrater({});
            system.eruptCrater(crater.craterId);
            expect(crater.status).toBe('erupting');
        });

        it('should reject missing', () => {
            const result = system.eruptCrater('ghost');
            expect(result.error).toBe('CRATER_NOT_FOUND');
        });

        it('should trigger craterErupted hook', () => {
            const { crater } = system.enterCrater({});
            let called = false;
            system.registerHook('craterErupted', () => { called = true; });
            system.eruptCrater(crater.craterId);
            expect(called).toBe(true);
        });
    });

    describe('calculateHeatPower', () => {
        it('should calculate base power', () => {
            const { crater } = system.enterCrater({});
            const power = system.calculateHeatPower(crater.craterId);
            // heat(100) * (1 + 0/100) + 0*5 = 100
            expect(power).toBe(100);
        });

        it('should factor in magma', () => {
            const { crater } = system.enterCrater({ magma: 50 });
            const power = system.calculateHeatPower(crater.craterId);
            // heat(100) * (1 + 50/100) + 0*5 = 150
            expect(power).toBe(150);
        });

        it('should factor in minerals count', () => {
            const { crater } = system.enterCrater({});
            system.collectMineral(crater.craterId, 'obsidian');
            system.collectMineral(crater.craterId, 'ruby');
            const power = system.calculateHeatPower(crater.craterId);
            // heat(100) * (1 + 0/100) + 2*5 = 110
            expect(power).toBe(110);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateHeatPower('ghost')).toBe(0);
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

        it('should execute default enterCrater', () => {
            const result = system.executeTool('enterCrater', { cultivatorId: 'c1' });
            expect(result.result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('craterEntered', () => count++);
            unregister();
            system.enterCrater({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('craterEntered', () => { throw new Error('x'); });
            expect(() => system.enterCrater({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCraters = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCraters = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.enterCrater({});
            const json = system.toJSON();
            expect(json.craters.length).toBe(1);
        });
        it('should deserialize', () => {
            system.enterCrater({});
            const json = system.toJSON();
            const newSys = new VolcanoCultivation();
            newSys.fromJSON(json);
            expect(newSys.craters.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.craterCount).toBe(0);
        });
    });
});
