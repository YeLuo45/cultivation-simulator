/**
 * CultivationRainbow.test.js - 修真虹测试
 * V811 Iteration 14/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationRainbow } from '../../../systems/ai/CultivationRainbow.js';

describe('CultivationRainbow', () => {
    let system;
    beforeEach(() => { system = new CultivationRainbow(); });

    describe('recruitRainbow', () => {
        it('should recruit', () => {
            const { rainbow } = system.recruitRainbow({ masterId: 'm1', name: 'sunbow' });
            expect(rainbow.masterId).toBe('m1');
            expect(rainbow.name).toBe('sunbow');
        });

        it('should default type to solar', () => {
            const { rainbow } = system.recruitRainbow({});
            expect(rainbow.type).toBe('solar');
        });

        it('should default status to novice', () => {
            const { rainbow } = system.recruitRainbow({});
            expect(rainbow.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { rainbow } = system.recruitRainbow({});
            expect(rainbow.level).toBe(1);
        });

        it('should default brilliance to baseBrilliance', () => {
            const { rainbow } = system.recruitRainbow({});
            expect(rainbow.brilliance).toBe(20);
        });

        it('should default arcs to []', () => {
            const { rainbow } = system.recruitRainbow({});
            expect(rainbow.arcs).toEqual([]);
        });

        it('should trigger rainbowRecruited hook', () => {
            let called = false;
            system.registerHook('rainbowRecruited', () => { called = true; });
            system.recruitRainbow({});
            expect(called).toBe(true);
        });
    });

    describe('getRainbow', () => {
        it('should return rainbow', () => {
            const { rainbow } = system.recruitRainbow({});
            expect(system.getRainbow(rainbow.rainbowId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getRainbow('ghost')).toBeNull(); });
    });

    describe('listRainbows', () => {
        it('should list all', () => {
            system.recruitRainbow({});
            system.recruitRainbow({});
            expect(system.listRainbows().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listRainbows().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitRainbow({ masterId: 'm1' });
            system.recruitRainbow({ masterId: 'm2' });
            system.recruitRainbow({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitRainbow({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { rainbow: r1 } = system.recruitRainbow({});
            const { rainbow: r2 } = system.recruitRainbow({});
            system.legendRainbow(r1.rainbowId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendary', () => {
            system.recruitRainbow({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addArc', () => {
        it('should add arc', () => {
            const { rainbow } = system.recruitRainbow({});
            system.addArc(rainbow.rainbowId, 'red-arc');
            expect(rainbow.arcs.length).toBe(1);
            expect(rainbow.arcs[0]).toBe('red-arc');
        });

        it('should reject missing rainbow', () => {
            const result = system.addArc('ghost', 'red-arc');
            expect(result.error).toBe('RAINBOW_NOT_FOUND');
        });

        it('should trigger arcAdded hook', () => {
            const { rainbow } = system.recruitRainbow({});
            let called = false;
            system.registerHook('arcAdded', () => { called = true; });
            system.addArc(rainbow.rainbowId, 'blue-arc');
            expect(called).toBe(true);
        });
    });

    describe('raiseBrilliance', () => {
        it('should raise brilliance with default', () => {
            const { rainbow } = system.recruitRainbow({});
            system.raiseBrilliance(rainbow.rainbowId);
            expect(rainbow.brilliance).toBe(25);
        });

        it('should raise brilliance with custom amount', () => {
            const { rainbow } = system.recruitRainbow({});
            system.raiseBrilliance(rainbow.rainbowId, 10);
            expect(rainbow.brilliance).toBe(30);
        });

        it('should reject missing rainbow', () => {
            const result = system.raiseBrilliance('ghost', 5);
            expect(result.error).toBe('RAINBOW_NOT_FOUND');
        });

        it('should trigger brillianceRaised hook', () => {
            const { rainbow } = system.recruitRainbow({});
            let called = false;
            system.registerHook('brillianceRaised', () => { called = true; });
            system.raiseBrilliance(rainbow.rainbowId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpRainbow', () => {
        it('should level up', () => {
            const { rainbow } = system.recruitRainbow({});
            system.levelUpRainbow(rainbow.rainbowId);
            expect(rainbow.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpRainbow('ghost');
            expect(result.error).toBe('RAINBOW_NOT_FOUND');
        });

        it('should trigger rainbowLeveledUp hook', () => {
            const { rainbow } = system.recruitRainbow({});
            let called = false;
            system.registerHook('rainbowLeveledUp', () => { called = true; });
            system.levelUpRainbow(rainbow.rainbowId);
            expect(called).toBe(true);
        });
    });

    describe('legendRainbow', () => {
        it('should legendize', () => {
            const { rainbow } = system.recruitRainbow({});
            system.legendRainbow(rainbow.rainbowId);
            expect(rainbow.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendRainbow('ghost');
            expect(result.error).toBe('RAINBOW_NOT_FOUND');
        });

        it('should trigger rainbowLegendized hook', () => {
            const { rainbow } = system.recruitRainbow({});
            let called = false;
            system.registerHook('rainbowLegendized', () => { called = true; });
            system.legendRainbow(rainbow.rainbowId);
            expect(called).toBe(true);
        });
    });

    describe('calculateRainbowValue', () => {
        it('should calculate base value', () => {
            const { rainbow } = system.recruitRainbow({});
            // level 1 * 100 + brilliance 20 * 2 + 0 arcs * 30 = 100 + 40 + 0 = 140
            expect(system.calculateRainbowValue(rainbow.rainbowId)).toBe(140);
        });

        it('should include arcs', () => {
            const { rainbow } = system.recruitRainbow({});
            system.addArc(rainbow.rainbowId, 'a');
            system.addArc(rainbow.rainbowId, 'b');
            // 100 + 40 + 60 = 200
            expect(system.calculateRainbowValue(rainbow.rainbowId)).toBe(200);
        });

        it('should include level', () => {
            const { rainbow } = system.recruitRainbow({});
            system.levelUpRainbow(rainbow.rainbowId);
            system.levelUpRainbow(rainbow.rainbowId);
            // 300 + 40 + 0 = 340
            expect(system.calculateRainbowValue(rainbow.rainbowId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateRainbowValue('ghost')).toBe(0);
        });
    });

    describe('listVeteran', () => {
        it('should return empty for no veterans', () => {
            system.recruitRainbow({});
            expect(system.listVeteran().length).toBe(0);
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

        it('should handle tool errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.error).toBe('boom');
        });

        it('should execute default getRainbow tool', () => {
            const result = system.executeTool('getRainbow', { rainbowId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('rainbowRecruited', () => count++);
            unregister();
            system.recruitRainbow({});
            expect(count).toBe(0);
        });

        it('should handle hook errors silently', () => {
            system.registerHook('rainbowRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitRainbow({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve with sufficient rainbows', () => {
            system.stats.totalRainbows = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalRainbows = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize toJSON', () => {
            system.recruitRainbow({});
            const json = system.toJSON();
            expect(json.rainbows.length).toBe(1);
        });
        it('should deserialize fromJSON', () => {
            system.recruitRainbow({});
            const json = system.toJSON();
            const newSys = new CultivationRainbow();
            newSys.fromJSON(json);
            expect(newSys.rainbows.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with rainbowCount', () => {
            const stats = system.getStats();
            expect(stats.rainbowCount).toBe(0);
        });
    });
});
