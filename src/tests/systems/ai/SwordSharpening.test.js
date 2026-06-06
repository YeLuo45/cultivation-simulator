/**
 * SwordSharpening.test.js - 剑磨系统测试
 * V512 Iteration 14/20 Round 20 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SwordSharpening } from '../../../systems/ai/SwordSharpening.js';

describe('SwordSharpening', () => {
    let system;
    beforeEach(() => { system = new SwordSharpening(); });

    describe('startSharpening', () => {
        it('should start with defaults', () => {
            const { sharpening } = system.startSharpening({});
            expect(sharpening.sharpenerId).toBe('unknown_sharpener');
            expect(sharpening.swordName).toBe('unnamed_sword');
            expect(sharpening.sharpness).toBe(30);
            expect(sharpening.stones).toEqual([]);
            expect(sharpening.polishing).toBe(0);
            expect(sharpening.status).toBe('initial');
        });

        it('should start with custom data', () => {
            const { sharpening } = system.startSharpening({
                sharpenerId: 's1',
                swordName: 'SkyPiercer',
                sharpness: 80,
                stones: ['ruby'],
                polishing: 20,
                status: 'rough'
            });
            expect(sharpening.sharpenerId).toBe('s1');
            expect(sharpening.swordName).toBe('SkyPiercer');
            expect(sharpening.sharpness).toBe(80);
            expect(sharpening.stones).toEqual(['ruby']);
            expect(sharpening.polishing).toBe(20);
            expect(sharpening.status).toBe('rough');
        });

        it('should increment totalSharpenings', () => {
            system.startSharpening({});
            system.startSharpening({});
            expect(system.stats.totalSharpenings).toBe(2);
        });

        it('should trigger sharpeningStarted hook', () => {
            let called = false;
            system.registerHook('sharpeningStarted', () => { called = true; });
            system.startSharpening({});
            expect(called).toBe(true);
        });
    });

    describe('getSharpening', () => {
        it('should return sharpening', () => {
            const { sharpening } = system.startSharpening({});
            const got = system.getSharpening(sharpening.sharpeningId);
            expect(got).not.toBeNull();
            expect(got.sharpeningId).toBe(sharpening.sharpeningId);
        });
        it('should return null for missing', () => { expect(system.getSharpening('ghost')).toBeNull(); });
    });

    describe('listSharpenings', () => {
        it('should list all', () => {
            system.startSharpening({});
            system.startSharpening({});
            system.startSharpening({});
            expect(system.listSharpenings().length).toBe(3);
        });

        it('should return empty list when no sharpenings', () => {
            expect(system.listSharpenings().length).toBe(0);
        });
    });

    describe('listBySharpener', () => {
        it('should filter by sharpener', () => {
            system.startSharpening({ sharpenerId: 's1' });
            system.startSharpening({ sharpenerId: 's1' });
            system.startSharpening({ sharpenerId: 's2' });
            expect(system.listBySharpener('s1').length).toBe(2);
            expect(system.listBySharpener('s2').length).toBe(1);
            expect(system.listBySharpener('s3').length).toBe(0);
        });
    });

    describe('listReady', () => {
        it('should list only ready sharpenings', () => {
            const { sharpening: s1 } = system.startSharpening({});
            const { sharpening: s2 } = system.startSharpening({});
            system.markReady(s1.sharpeningId);
            expect(system.listReady().length).toBe(1);
            expect(system.listReady()[0].sharpeningId).toBe(s1.sharpeningId);
        });

        it('should return empty when none ready', () => {
            system.startSharpening({});
            system.startSharpening({});
            expect(system.listReady().length).toBe(0);
        });
    });

    describe('addStone', () => {
        it('should add stone', () => {
            const { sharpening } = system.startSharpening({});
            system.addStone(sharpening.sharpeningId, 'ruby');
            expect(sharpening.stones).toContain('ruby');
            expect(sharpening.stones.length).toBe(1);
        });

        it('should add multiple stones', () => {
            const { sharpening } = system.startSharpening({});
            system.addStone(sharpening.sharpeningId, 'ruby');
            system.addStone(sharpening.sharpeningId, 'emerald');
            expect(sharpening.stones).toEqual(['ruby', 'emerald']);
        });

        it('should set status to rough when 3+ stones', () => {
            const { sharpening } = system.startSharpening({});
            system.addStone(sharpening.sharpeningId, 'a');
            system.addStone(sharpening.sharpeningId, 'b');
            expect(sharpening.status).toBe('initial');
            system.addStone(sharpening.sharpeningId, 'c');
            expect(sharpening.status).toBe('rough');
        });

        it('should reject missing', () => {
            const result = system.addStone('ghost', 'ruby');
            expect(result.error).toBe('SHARPENING_NOT_FOUND');
        });

        it('should trigger stoneAdded hook', () => {
            const { sharpening } = system.startSharpening({});
            let called = false;
            system.registerHook('stoneAdded', () => { called = true; });
            system.addStone(sharpening.sharpeningId, 'ruby');
            expect(called).toBe(true);
        });
    });

    describe('refineSharpness', () => {
        it('should refine by default amount', () => {
            const { sharpening } = system.startSharpening({});
            system.refineSharpness(sharpening.sharpeningId);
            expect(sharpening.sharpness).toBe(35);
        });

        it('should refine by custom amount', () => {
            const { sharpening } = system.startSharpening({});
            system.refineSharpness(sharpening.sharpeningId, 30);
            expect(sharpening.sharpness).toBe(60);
        });

        it('should reject missing', () => {
            const result = system.refineSharpness('ghost', 5);
            expect(result.error).toBe('SHARPENING_NOT_FOUND');
        });

        it('should trigger sharpnessRefined hook', () => {
            const { sharpening } = system.startSharpening({});
            let called = false;
            system.registerHook('sharpnessRefined', () => { called = true; });
            system.refineSharpness(sharpening.sharpeningId, 5);
            expect(called).toBe(true);
        });
    });

    describe('polishBlade', () => {
        it('should polish by default amount', () => {
            const { sharpening } = system.startSharpening({});
            system.polishBlade(sharpening.sharpeningId);
            expect(sharpening.polishing).toBe(5);
        });

        it('should polish by custom amount', () => {
            const { sharpening } = system.startSharpening({});
            system.polishBlade(sharpening.sharpeningId, 25);
            expect(sharpening.polishing).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.polishBlade('ghost', 5);
            expect(result.error).toBe('SHARPENING_NOT_FOUND');
        });

        it('should trigger bladePolished hook', () => {
            const { sharpening } = system.startSharpening({});
            let called = false;
            system.registerHook('bladePolished', () => { called = true; });
            system.polishBlade(sharpening.sharpeningId, 5);
            expect(called).toBe(true);
        });
    });

    describe('markReady', () => {
        it('should set status to ready', () => {
            const { sharpening } = system.startSharpening({});
            system.markReady(sharpening.sharpeningId);
            expect(sharpening.status).toBe('ready');
        });

        it('should reject missing', () => {
            const result = system.markReady('ghost');
            expect(result.error).toBe('SHARPENING_NOT_FOUND');
        });

        it('should trigger sharpeningReady hook', () => {
            const { sharpening } = system.startSharpening({});
            let called = false;
            system.registerHook('sharpeningReady', () => { called = true; });
            system.markReady(sharpening.sharpeningId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBladeQuality', () => {
        it('should calculate default quality', () => {
            const { sharpening } = system.startSharpening({});
            // sharpness=30 * 2 + polishing=0 + 0 * 5 = 60
            expect(system.calculateBladeQuality(sharpening.sharpeningId)).toBe(60);
        });

        it('should add 5 per stone', () => {
            const { sharpening } = system.startSharpening({});
            system.addStone(sharpening.sharpeningId, 'ruby');
            system.addStone(sharpening.sharpeningId, 'emerald');
            // 60 + 0 + 2*5 = 70
            expect(system.calculateBladeQuality(sharpening.sharpeningId)).toBe(70);
        });

        it('should reflect polishing in formula', () => {
            const { sharpening } = system.startSharpening({});
            system.polishBlade(sharpening.sharpeningId, 20);
            // 60 + 20 + 0 = 80
            expect(system.calculateBladeQuality(sharpening.sharpeningId)).toBe(80);
        });

        it('should reflect sharpness in formula', () => {
            const { sharpening } = system.startSharpening({ sharpness: 50 });
            // 50 * 2 + 0 + 0 = 100
            expect(system.calculateBladeQuality(sharpening.sharpeningId)).toBe(100);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBladeQuality('ghost')).toBe(0);
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
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default getSharpening', () => {
            const result = system.executeTool('getSharpening', { sharpeningId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('sharpeningStarted', () => count++);
            unregister();
            system.startSharpening({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('sharpeningStarted', () => { throw new Error('x'); });
            expect(() => system.startSharpening({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSharpenings = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalSharpenings = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.startSharpening({});
            const json = system.toJSON();
            expect(json.sharpenings.length).toBe(1);
            expect(json.stats.totalSharpenings).toBe(1);
        });
        it('should deserialize', () => {
            system.startSharpening({ swordName: 'a' });
            const json = system.toJSON();
            const newSys = new SwordSharpening();
            newSys.fromJSON(json);
            expect(newSys.sharpenings.size).toBe(1);
            expect(newSys.stats.totalSharpenings).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.sharpeningCount).toBe(0);
            expect(stats.totalSharpenings).toBe(0);
            system.startSharpening({});
            expect(system.getStats().sharpeningCount).toBe(1);
        });
    });
});
