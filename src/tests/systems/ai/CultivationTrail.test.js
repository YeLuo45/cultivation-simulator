/**
 * CultivationTrail.test.js - 修真小径测试
 * V750 Iteration 13/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationTrail } from '../../../systems/ai/CultivationTrail.js';

describe('CultivationTrail', () => {
    let system;
    beforeEach(() => { system = new CultivationTrail(); });

    describe('recruitTrail', () => {
        it('should recruit', () => {
            const { trail } = system.recruitTrail({ masterId: 'm1', name: 'Bamboo Trail', type: 'forest' });
            expect(trail.masterId).toBe('m1');
            expect(trail.name).toBe('Bamboo Trail');
            expect(trail.type).toBe('forest');
        });

        it('should default type to forest', () => {
            const { trail } = system.recruitTrail({});
            expect(trail.type).toBe('forest');
        });

        it('should default status to novice', () => {
            const { trail } = system.recruitTrail({});
            expect(trail.status).toBe('novice');
        });

        it('should default wisdom to baseWisdom', () => {
            const { trail } = system.recruitTrail({});
            expect(trail.wisdom).toBe(20);
        });

        it('should start at level 1', () => {
            const { trail } = system.recruitTrail({});
            expect(trail.level).toBe(1);
        });

        it('should start with empty marks', () => {
            const { trail } = system.recruitTrail({});
            expect(trail.marks).toEqual([]);
        });

        it('should generate trailId', () => {
            const { trail } = system.recruitTrail({});
            expect(trail.trailId).toBeDefined();
            expect(typeof trail.trailId).toBe('string');
        });

        it('should accept custom trailId', () => {
            const { trail } = system.recruitTrail({ trailId: 'my-trail' });
            expect(trail.trailId).toBe('my-trail');
        });

        it('should trigger trailRecruited hook', () => {
            let called = false;
            system.registerHook('trailRecruited', () => { called = true; });
            system.recruitTrail({});
            expect(called).toBe(true);
        });

        it('should support all types', () => {
            const { trail: t1 } = system.recruitTrail({ type: 'forest' });
            const { trail: t2 } = system.recruitTrail({ type: 'mountain' });
            const { trail: t3 } = system.recruitTrail({ type: 'sacred' });
            expect(t1.type).toBe('forest');
            expect(t2.type).toBe('mountain');
            expect(t3.type).toBe('sacred');
        });
    });

    describe('getTrail', () => {
        it('should return trail', () => {
            const { trail } = system.recruitTrail({});
            expect(system.getTrail(trail.trailId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTrail('ghost')).toBeNull(); });
    });

    describe('listTrails', () => {
        it('should list all', () => {
            system.recruitTrail({});
            system.recruitTrail({});
            expect(system.listTrails().length).toBe(2);
        });

        it('should return empty when no trails', () => {
            expect(system.listTrails().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitTrail({ masterId: 'm1' });
            system.recruitTrail({ masterId: 'm2' });
            system.recruitTrail({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitTrail({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { trail: t1 } = system.recruitTrail({});
            const { trail: t2 } = system.recruitTrail({});
            system.legendTrail(t1.trailId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].trailId).toBe(t1.trailId);
            expect(t2.status).toBe('novice');
        });
    });

    describe('addMark', () => {
        it('should add mark', () => {
            const { trail } = system.recruitTrail({});
            system.addMark(trail.trailId, { name: 'stone-of-meditation' });
            expect(trail.marks.length).toBe(1);
        });

        it('should accumulate marks', () => {
            const { trail } = system.recruitTrail({});
            system.addMark(trail.trailId, { name: 'm1' });
            system.addMark(trail.trailId, { name: 'm2' });
            system.addMark(trail.trailId, { name: 'm3' });
            expect(trail.marks.length).toBe(3);
        });

        it('should reject missing trail', () => {
            const result = system.addMark('ghost', { name: 'm' });
            expect(result.error).toBe('TRAIL_NOT_FOUND');
        });

        it('should trigger markAdded hook', () => {
            const { trail } = system.recruitTrail({});
            let called = false;
            system.registerHook('markAdded', () => { called = true; });
            system.addMark(trail.trailId, { name: 'm' });
            expect(called).toBe(true);
        });
    });

    describe('raiseWisdom', () => {
        it('should raise wisdom by default', () => {
            const { trail } = system.recruitTrail({});
            system.raiseWisdom(trail.trailId);
            expect(trail.wisdom).toBe(25);
        });

        it('should raise wisdom by custom amount', () => {
            const { trail } = system.recruitTrail({});
            system.raiseWisdom(trail.trailId, 30);
            expect(trail.wisdom).toBe(50);
        });

        it('should reject missing trail', () => {
            const result = system.raiseWisdom('ghost');
            expect(result.error).toBe('TRAIL_NOT_FOUND');
        });

        it('should trigger wisdomRaised hook', () => {
            const { trail } = system.recruitTrail({});
            let called = false;
            system.registerHook('wisdomRaised', () => { called = true; });
            system.raiseWisdom(trail.trailId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpTrail', () => {
        it('should level up', () => {
            const { trail } = system.recruitTrail({});
            system.levelUpTrail(trail.trailId);
            expect(trail.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { trail } = system.recruitTrail({});
            system.levelUpTrail(trail.trailId);
            system.levelUpTrail(trail.trailId);
            system.levelUpTrail(trail.trailId);
            expect(trail.level).toBe(4);
        });

        it('should reject missing trail', () => {
            const result = system.levelUpTrail('ghost');
            expect(result.error).toBe('TRAIL_NOT_FOUND');
        });

        it('should trigger trailLeveledUp hook', () => {
            const { trail } = system.recruitTrail({});
            let called = false;
            system.registerHook('trailLeveledUp', () => { called = true; });
            system.levelUpTrail(trail.trailId);
            expect(called).toBe(true);
        });
    });

    describe('legendTrail', () => {
        it('should legendize trail', () => {
            const { trail } = system.recruitTrail({});
            system.legendTrail(trail.trailId);
            expect(trail.status).toBe('legendary');
        });

        it('should reject missing trail', () => {
            const result = system.legendTrail('ghost');
            expect(result.error).toBe('TRAIL_NOT_FOUND');
        });

        it('should trigger trailLegendized hook', () => {
            const { trail } = system.recruitTrail({});
            let called = false;
            system.registerHook('trailLegendized', () => { called = true; });
            system.legendTrail(trail.trailId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTrailValue', () => {
        it('should calculate base value', () => {
            const { trail } = system.recruitTrail({});
            // level=1, wisdom=20, marks=0 -> 1*100 + 20*2 + 0 = 140
            expect(system.calculateTrailValue(trail.trailId)).toBe(140);
        });

        it('should include marks in value', () => {
            const { trail } = system.recruitTrail({});
            system.addMark(trail.trailId, { name: 'm1' });
            system.addMark(trail.trailId, { name: 'm2' });
            // level=1, wisdom=20, marks=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateTrailValue(trail.trailId)).toBe(200);
        });

        it('should scale with level', () => {
            const { trail } = system.recruitTrail({});
            system.levelUpTrail(trail.trailId);
            system.levelUpTrail(trail.trailId);
            // level=3, wisdom=20, marks=0 -> 3*100 + 20*2 + 0 = 340
            expect(system.calculateTrailValue(trail.trailId)).toBe(340);
        });

        it('should scale with wisdom', () => {
            const { trail } = system.recruitTrail({});
            system.raiseWisdom(trail.trailId, 100);
            // level=1, wisdom=120, marks=0 -> 1*100 + 120*2 + 0 = 340
            expect(system.calculateTrailValue(trail.trailId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTrailValue('ghost')).toBe(0);
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

        it('should execute default getTrail', () => {
            const result = system.executeTool('getTrail', { trailId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('trailRecruited', () => count++);
            unregister();
            system.recruitTrail({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('trailRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitTrail({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTrails = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalTrails = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitTrail({});
            const json = system.toJSON();
            expect(json.trails.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitTrail({});
            const json = system.toJSON();
            const newSys = new CultivationTrail();
            newSys.fromJSON(json);
            expect(newSys.trails.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.trailCount).toBe(0);
        });
    });
});
