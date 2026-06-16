/**
 * CalligraphyCultivation.test.js - 书法修炼测试
 * V439 Iteration 1/15 Round 16 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CalligraphyCultivation } from '../../../systems/ai/CalligraphyCultivation.js';

describe('CalligraphyCultivation', () => {
    let system;
    beforeEach(() => { system = new CalligraphyCultivation(); });

    describe('writeScroll', () => {
        it('should write', () => {
            const { scroll } = system.writeScroll({ writerId: 'w1' });
            expect(scroll.writerId).toBe('w1');
        });

        it('should default name', () => {
            const { scroll } = system.writeScroll({});
            expect(scroll.name).toBe('Untitled Scroll');
        });

        it('should default script to regular', () => {
            const { scroll } = system.writeScroll({});
            expect(scroll.script).toBe('regular');
        });

        it('should default strokes to baseStrokes', () => {
            const { scroll } = system.writeScroll({});
            expect(scroll.strokes).toBe(20);
        });

        it('should default status to drafted', () => {
            const { scroll } = system.writeScroll({});
            expect(scroll.status).toBe('drafted');
        });

        it('should accept custom script', () => {
            const { scroll } = system.writeScroll({ script: 'seal' });
            expect(scroll.script).toBe('seal');
        });

        it('should accept cursive script', () => {
            const { scroll } = system.writeScroll({ script: 'cursive' });
            expect(scroll.script).toBe('cursive');
        });

        it('should accept custom strokes', () => {
            const { scroll } = system.writeScroll({ strokes: 100 });
            expect(scroll.strokes).toBe(100);
        });

        it('should accept custom name', () => {
            const { scroll } = system.writeScroll({ name: 'Dao Scroll' });
            expect(scroll.name).toBe('Dao Scroll');
        });

        it('should trigger scrollWritten hook', () => {
            let called = false;
            system.registerHook('scrollWritten', () => { called = true; });
            system.writeScroll({});
            expect(called).toBe(true);
        });
    });

    describe('getScroll', () => {
        it('should return', () => {
            const { scroll } = system.writeScroll({});
            expect(system.getScroll(scroll.scrollId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getScroll('ghost')).toBeNull(); });
    });

    describe('listScrolls', () => {
        it('should list all', () => {
            system.writeScroll({});
            system.writeScroll({});
            expect(system.listScrolls().length).toBe(2);
        });
    });

    describe('listByScript', () => {
        it('should filter seal', () => {
            system.writeScroll({ script: 'seal' });
            system.writeScroll({ script: 'cursive' });
            expect(system.listByScript('seal').length).toBe(1);
        });
        it('should filter regular', () => {
            system.writeScroll({ script: 'regular' });
            system.writeScroll({ script: 'cursive' });
            expect(system.listByScript('regular').length).toBe(1);
        });
        it('should filter cursive', () => {
            system.writeScroll({ script: 'cursive' });
            system.writeScroll({ script: 'seal' });
            expect(system.listByScript('cursive').length).toBe(1);
        });
    });

    describe('listByWriter', () => {
        it('should filter', () => {
            system.writeScroll({ writerId: 'w1' });
            system.writeScroll({ writerId: 'w2' });
            expect(system.listByWriter('w1').length).toBe(1);
        });
    });

    describe('practiceScroll', () => {
        it('should practice', () => {
            const { scroll } = system.writeScroll({});
            system.practiceScroll(scroll.scrollId, 10);
            expect(scroll.mastery).toBe(10);
        });

        it('should default amount to 5', () => {
            const { scroll } = system.writeScroll({});
            system.practiceScroll(scroll.scrollId);
            expect(scroll.mastery).toBe(5);
        });

        it('should reject missing', () => {
            const result = system.practiceScroll('ghost', 5);
            expect(result.error).toBe('SCROLL_NOT_FOUND');
        });

        it('should trigger scrollPracticed hook', () => {
            const { scroll } = system.writeScroll({});
            let called = false;
            system.registerHook('scrollPracticed', () => { called = true; });
            system.practiceScroll(scroll.scrollId, 5);
            expect(called).toBe(true);
        });
    });

    describe('channelEnergy', () => {
        it('should channel', () => {
            const { scroll } = system.writeScroll({});
            system.channelEnergy(scroll.scrollId, 20);
            expect(scroll.energy).toBe(20);
        });

        it('should default amount to 10', () => {
            const { scroll } = system.writeScroll({});
            system.channelEnergy(scroll.scrollId);
            expect(scroll.energy).toBe(10);
        });

        it('should reject missing', () => {
            const result = system.channelEnergy('ghost', 10);
            expect(result.error).toBe('SCROLL_NOT_FOUND');
        });

        it('should trigger energyChanneled hook', () => {
            const { scroll } = system.writeScroll({});
            let called = false;
            system.registerHook('energyChanneled', () => { called = true; });
            system.channelEnergy(scroll.scrollId, 10);
            expect(called).toBe(true);
        });
    });

    describe('inkScroll', () => {
        it('should ink', () => {
            const { scroll } = system.writeScroll({});
            system.inkScroll(scroll.scrollId);
            expect(scroll.status).toBe('inked');
        });

        it('should reject missing', () => {
            const result = system.inkScroll('ghost');
            expect(result.error).toBe('SCROLL_NOT_FOUND');
        });

        it('should trigger scrollInked hook', () => {
            const { scroll } = system.writeScroll({});
            let called = false;
            system.registerHook('scrollInked', () => { called = true; });
            system.inkScroll(scroll.scrollId);
            expect(called).toBe(true);
        });
    });

    describe('calculateCalligraphicPower', () => {
        it('should calculate with default values', () => {
            const { scroll } = system.writeScroll({});
            // strokes=20, mastery=0, energy=0 => 20 * (1+0) + 0 = 20
            expect(system.calculateCalligraphicPower(scroll.scrollId)).toBeCloseTo(20, 5);
        });

        it('should calculate with mastery', () => {
            const { scroll } = system.writeScroll({});
            system.practiceScroll(scroll.scrollId, 50);
            // strokes=20, mastery=50, energy=0 => 20 * (1+0.5) + 0 = 30
            expect(system.calculateCalligraphicPower(scroll.scrollId)).toBeCloseTo(30, 5);
        });

        it('should calculate with energy', () => {
            const { scroll } = system.writeScroll({});
            system.channelEnergy(scroll.scrollId, 10);
            // strokes=20, mastery=0, energy=10 => 20 + 10 = 30
            expect(system.calculateCalligraphicPower(scroll.scrollId)).toBeCloseTo(30, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateCalligraphicPower('ghost')).toBe(0);
        });
    });

    describe('listInked', () => {
        it('should filter inked', () => {
            const { scroll: s1 } = system.writeScroll({});
            system.writeScroll({});
            system.inkScroll(s1.scrollId);
            expect(system.listInked().length).toBe(1);
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

        it('should execute default getScroll', () => {
            const result = system.executeTool('getScroll', { scrollId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default writeScroll', () => {
            const result = system.executeTool('writeScroll', { writerId: 'w1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('scrollWritten', () => count++);
            unregister();
            system.writeScroll({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('scrollWritten', () => { throw new Error('x'); });
            expect(() => system.writeScroll({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalScrolls = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalScrolls = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.writeScroll({});
            const json = system.toJSON();
            expect(json.scrolls.length).toBe(1);
        });
        it('should deserialize', () => {
            system.writeScroll({});
            const json = system.toJSON();
            const newSys = new CalligraphyCultivation();
            newSys.fromJSON(json);
            expect(newSys.scrolls.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.scrollCount).toBe(0);
        });
    });
});
