/**
 * CultivationHymn.test.js - 修真赞美诗系统测试
 * V776 Iteration 9/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationHymn } from '../../../systems/ai/CultivationHymn.js';

describe('CultivationHymn', () => {
    let system;
    beforeEach(() => { system = new CultivationHymn(); });

    describe('recruitHymn', () => {
        it('should recruit', () => {
            const { hymn } = system.recruitHymn({ masterId: 'm1', name: 'Sacred Hymn', type: 'celestial' });
            expect(hymn.masterId).toBe('m1');
            expect(hymn.name).toBe('Sacred Hymn');
            expect(hymn.type).toBe('celestial');
        });

        it('should default type to divine', () => {
            const { hymn } = system.recruitHymn({});
            expect(hymn.type).toBe('divine');
        });

        it('should default status to novice', () => {
            const { hymn } = system.recruitHymn({});
            expect(hymn.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { hymn } = system.recruitHymn({});
            expect(hymn.level).toBe(1);
        });

        it('should default praises to empty array', () => {
            const { hymn } = system.recruitHymn({});
            expect(hymn.praises).toEqual([]);
        });

        it('should default reverence to baseReverence', () => {
            const { hymn } = system.recruitHymn({});
            expect(hymn.reverence).toBe(20);
        });

        it('should assign auto id when missing', () => {
            const { hymn } = system.recruitHymn({});
            expect(hymn.hymnId).toMatch(/^hymn_/);
        });

        it('should use provided hymnId', () => {
            const { hymn } = system.recruitHymn({ hymnId: 'h_explicit' });
            expect(hymn.hymnId).toBe('h_explicit');
        });

        it('should trigger hymnRecruited hook', () => {
            let called = false;
            system.registerHook('hymnRecruited', () => { called = true; });
            system.recruitHymn({});
            expect(called).toBe(true);
        });

        it('should respect custom config baseReverence', () => {
            const customSystem = new CultivationHymn({ baseReverence: 50 });
            const { hymn } = customSystem.recruitHymn({});
            expect(hymn.reverence).toBe(50);
        });
    });

    describe('getHymn', () => {
        it('should return', () => {
            const { hymn } = system.recruitHymn({});
            expect(system.getHymn(hymn.hymnId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getHymn('ghost')).toBeNull(); });
        it('should return a copy (not reference)', () => {
            const { hymn } = system.recruitHymn({ name: 'Original' });
            const fetched = system.getHymn(hymn.hymnId);
            fetched.name = 'Mutated';
            const refetched = system.getHymn(hymn.hymnId);
            expect(refetched.name).toBe('Original');
        });
    });

    describe('listHymns', () => {
        it('should list all', () => {
            system.recruitHymn({});
            system.recruitHymn({});
            expect(system.listHymns().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listHymns().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitHymn({ masterId: 'm1' });
            system.recruitHymn({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitHymn({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { hymn: a } = system.recruitHymn({});
            const { hymn: b } = system.recruitHymn({});
            system.legendHymn(a.hymnId);
            expect(system.listLegendary().length).toBe(1);
            expect(b.hymnId).toBeDefined();
        });

        it('should return empty when none legendary', () => {
            system.recruitHymn({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addPraise', () => {
        it('should add praise', () => {
            const { hymn } = system.recruitHymn({});
            system.addPraise(hymn.hymnId, 'glory_of_heaven');
            expect(hymn.praises).toContain('glory_of_heaven');
        });

        it('should add multiple praises', () => {
            const { hymn } = system.recruitHymn({});
            system.addPraise(hymn.hymnId, 'glory_of_heaven');
            system.addPraise(hymn.hymnId, 'eternal_chant');
            expect(hymn.praises.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addPraise('ghost', 'glory_of_heaven');
            expect(result.error).toBe('HYMN_NOT_FOUND');
        });

        it('should trigger praiseAdded hook', () => {
            const { hymn } = system.recruitHymn({});
            let called = false;
            system.registerHook('praiseAdded', () => { called = true; });
            system.addPraise(hymn.hymnId, 'glory_of_heaven');
            expect(called).toBe(true);
        });
    });

    describe('raiseReverence', () => {
        it('should raise reverence', () => {
            const { hymn } = system.recruitHymn({});
            system.raiseReverence(hymn.hymnId, 10);
            expect(hymn.reverence).toBe(30);
        });

        it('should default amount to 5', () => {
            const { hymn } = system.recruitHymn({});
            system.raiseReverence(hymn.hymnId);
            expect(hymn.reverence).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseReverence('ghost', 10);
            expect(result.error).toBe('HYMN_NOT_FOUND');
        });

        it('should trigger reverenceRaised hook', () => {
            const { hymn } = system.recruitHymn({});
            let called = false;
            system.registerHook('reverenceRaised', () => { called = true; });
            system.raiseReverence(hymn.hymnId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpHymn', () => {
        it('should increment level', () => {
            const { hymn } = system.recruitHymn({});
            system.levelUpHymn(hymn.hymnId);
            expect(hymn.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { hymn } = system.recruitHymn({});
            system.levelUpHymn(hymn.hymnId);
            system.levelUpHymn(hymn.hymnId);
            system.levelUpHymn(hymn.hymnId);
            expect(hymn.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpHymn('ghost');
            expect(result.error).toBe('HYMN_NOT_FOUND');
        });
    });

    describe('legendHymn', () => {
        it('should set status to legendary', () => {
            const { hymn } = system.recruitHymn({});
            system.legendHymn(hymn.hymnId);
            expect(hymn.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendHymn('ghost');
            expect(result.error).toBe('HYMN_NOT_FOUND');
        });

        it('should trigger hymnLegendized hook', () => {
            const { hymn } = system.recruitHymn({});
            let called = false;
            system.registerHook('hymnLegendized', () => { called = true; });
            system.legendHymn(hymn.hymnId);
            expect(called).toBe(true);
        });
    });

    describe('calculateHymnValue', () => {
        it('should calculate', () => {
            const { hymn } = system.recruitHymn({});
            system.addPraise(hymn.hymnId, 'glory_of_heaven');
            // value = 1 * 100 + 20 * 2 + 1 * 30 = 100 + 40 + 30 = 170
            expect(system.calculateHymnValue(hymn.hymnId)).toBeCloseTo(170, 5);
        });

        it('should recalculate after level up', () => {
            const { hymn } = system.recruitHymn({});
            system.levelUpHymn(hymn.hymnId);
            // value = 2 * 100 + 20 * 2 + 0 * 30 = 200 + 40 + 0 = 240
            expect(system.calculateHymnValue(hymn.hymnId)).toBeCloseTo(240, 5);
        });

        it('should recalculate after reverence raise', () => {
            const { hymn } = system.recruitHymn({});
            system.raiseReverence(hymn.hymnId, 5);
            // value = 1 * 100 + 25 * 2 + 0 * 30 = 100 + 50 + 0 = 150
            expect(system.calculateHymnValue(hymn.hymnId)).toBeCloseTo(150, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateHymnValue('ghost')).toBe(0);
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

        it('should execute default getHymn', () => {
            const result = system.executeTool('getHymn', { hymnId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle undefined context with default', () => {
            system.registerTool('echo', (ctx) => ctx);
            const result = system.executeTool('echo');
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('hymnRecruited', () => count++);
            unregister();
            system.recruitHymn({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('hymnRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitHymn({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalHymns = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalHymns = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitHymn({});
            const json = system.toJSON();
            expect(json.hymns.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitHymn({});
            const json = system.toJSON();
            const newSys = new CultivationHymn();
            newSys.fromJSON(json);
            expect(newSys.hymns.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.recruitHymn({});
            const stats = system.getStats();
            expect(stats.hymnCount).toBe(1);
        });
    });
});
