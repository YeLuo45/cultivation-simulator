/**
 * CultivationPilgrim.test.js - 修真朝圣系统测试
 * V655 Iteration 8/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationPilgrim } from '../../../systems/ai/CultivationPilgrim.js';

describe('CultivationPilgrim', () => {
    let system;
    beforeEach(() => { system = new CultivationPilgrim(); });

    describe('recruitPilgrim', () => {
        it('should recruit', () => {
            const { pilgrim } = system.recruitPilgrim({ masterId: 'm1', name: 'Holy Pilgrim', type: 'divine' });
            expect(pilgrim.masterId).toBe('m1');
            expect(pilgrim.name).toBe('Holy Pilgrim');
            expect(pilgrim.type).toBe('divine');
        });

        it('should default type to sacred', () => {
            const { pilgrim } = system.recruitPilgrim({});
            expect(pilgrim.type).toBe('sacred');
        });

        it('should default status to novice', () => {
            const { pilgrim } = system.recruitPilgrim({});
            expect(pilgrim.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { pilgrim } = system.recruitPilgrim({});
            expect(pilgrim.level).toBe(1);
        });

        it('should default sites to empty array', () => {
            const { pilgrim } = system.recruitPilgrim({});
            expect(pilgrim.sites).toEqual([]);
        });

        it('should assign auto id when missing', () => {
            const { pilgrim } = system.recruitPilgrim({});
            expect(pilgrim.pilgrimId).toMatch(/^pilgrim_/);
        });

        it('should use provided pilgrimId', () => {
            const { pilgrim } = system.recruitPilgrim({ pilgrimId: 'p_explicit' });
            expect(pilgrim.pilgrimId).toBe('p_explicit');
        });

        it('should default name to Mystic Pilgrim', () => {
            const { pilgrim } = system.recruitPilgrim({});
            expect(pilgrim.name).toBe('Mystic Pilgrim');
        });

        it('should default devotion to baseDevotion', () => {
            const { pilgrim } = system.recruitPilgrim({});
            expect(pilgrim.devotion).toBe(20);
        });

        it('should respect custom baseDevotion from config', () => {
            const custom = new CultivationPilgrim({ baseDevotion: 50 });
            const { pilgrim } = custom.recruitPilgrim({});
            expect(pilgrim.devotion).toBe(50);
        });

        it('should respect provided devotion', () => {
            const { pilgrim } = system.recruitPilgrim({ devotion: 99 });
            expect(pilgrim.devotion).toBe(99);
        });

        it('should accept mortal type', () => {
            const { pilgrim } = system.recruitPilgrim({ type: 'mortal' });
            expect(pilgrim.type).toBe('mortal');
        });

        it('should trigger pilgrimRecruited hook', () => {
            let called = false;
            system.registerHook('pilgrimRecruited', () => { called = true; });
            system.recruitPilgrim({});
            expect(called).toBe(true);
        });

        it('should increment totalPilgrims stat', () => {
            system.recruitPilgrim({});
            system.recruitPilgrim({});
            expect(system.stats.totalPilgrims).toBe(2);
        });
    });

    describe('getPilgrim', () => {
        it('should return', () => {
            const { pilgrim } = system.recruitPilgrim({});
            expect(system.getPilgrim(pilgrim.pilgrimId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPilgrim('ghost')).toBeNull(); });
        it('should return a copy not the original', () => {
            const { pilgrim } = system.recruitPilgrim({});
            const copy = system.getPilgrim(pilgrim.pilgrimId);
            expect(copy).not.toBe(pilgrim);
        });
    });

    describe('listPilgrims', () => {
        it('should list all', () => {
            system.recruitPilgrim({});
            system.recruitPilgrim({});
            expect(system.listPilgrims().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listPilgrims().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitPilgrim({ masterId: 'm1' });
            system.recruitPilgrim({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitPilgrim({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });

        it('should return multiple for same master', () => {
            system.recruitPilgrim({ masterId: 'm1' });
            system.recruitPilgrim({ masterId: 'm1' });
            system.recruitPilgrim({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { pilgrim: a } = system.recruitPilgrim({});
            const { pilgrim: b } = system.recruitPilgrim({});
            system.legendPilgrim(a.pilgrimId);
            expect(system.listLegendary().length).toBe(1);
            expect(b.pilgrimId).toBeDefined();
        });

        it('should return empty when none legendary', () => {
            system.recruitPilgrim({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addSite', () => {
        it('should add site', () => {
            const { pilgrim } = system.recruitPilgrim({});
            system.addSite(pilgrim.pilgrimId, 'mount_tai');
            expect(pilgrim.sites).toContain('mount_tai');
        });

        it('should add multiple sites', () => {
            const { pilgrim } = system.recruitPilgrim({});
            system.addSite(pilgrim.pilgrimId, 'mount_tai');
            system.addSite(pilgrim.pilgrimId, 'wudang_peak');
            expect(pilgrim.sites.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addSite('ghost', 'mount_tai');
            expect(result.error).toBe('PILGRIM_NOT_FOUND');
        });

        it('should trigger siteAdded hook', () => {
            const { pilgrim } = system.recruitPilgrim({});
            let called = false;
            system.registerHook('siteAdded', () => { called = true; });
            system.addSite(pilgrim.pilgrimId, 'mount_tai');
            expect(called).toBe(true);
        });
    });

    describe('raiseDevotion', () => {
        it('should raise devotion', () => {
            const { pilgrim } = system.recruitPilgrim({});
            system.raiseDevotion(pilgrim.pilgrimId, 10);
            expect(pilgrim.devotion).toBe(30);
        });

        it('should default amount to 5', () => {
            const { pilgrim } = system.recruitPilgrim({});
            system.raiseDevotion(pilgrim.pilgrimId);
            expect(pilgrim.devotion).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseDevotion('ghost', 10);
            expect(result.error).toBe('PILGRIM_NOT_FOUND');
        });

        it('should trigger devotionRaised hook', () => {
            const { pilgrim } = system.recruitPilgrim({});
            let called = false;
            system.registerHook('devotionRaised', () => { called = true; });
            system.raiseDevotion(pilgrim.pilgrimId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpPilgrim', () => {
        it('should increment level', () => {
            const { pilgrim } = system.recruitPilgrim({});
            system.levelUpPilgrim(pilgrim.pilgrimId);
            expect(pilgrim.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { pilgrim } = system.recruitPilgrim({});
            system.levelUpPilgrim(pilgrim.pilgrimId);
            system.levelUpPilgrim(pilgrim.pilgrimId);
            system.levelUpPilgrim(pilgrim.pilgrimId);
            expect(pilgrim.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpPilgrim('ghost');
            expect(result.error).toBe('PILGRIM_NOT_FOUND');
        });
    });

    describe('legendPilgrim', () => {
        it('should set status to legendary', () => {
            const { pilgrim } = system.recruitPilgrim({});
            system.legendPilgrim(pilgrim.pilgrimId);
            expect(pilgrim.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendPilgrim('ghost');
            expect(result.error).toBe('PILGRIM_NOT_FOUND');
        });

        it('should trigger pilgrimLegendized hook', () => {
            const { pilgrim } = system.recruitPilgrim({});
            let called = false;
            system.registerHook('pilgrimLegendized', () => { called = true; });
            system.legendPilgrim(pilgrim.pilgrimId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePilgrimValue', () => {
        it('should calculate', () => {
            const { pilgrim } = system.recruitPilgrim({});
            system.addSite(pilgrim.pilgrimId, 'mount_tai');
            // value = 1 * 100 + 20 * 2 + 1 * 30 = 100 + 40 + 30 = 170
            expect(system.calculatePilgrimValue(pilgrim.pilgrimId)).toBeCloseTo(170, 5);
        });

        it('should recalculate after level up', () => {
            const { pilgrim } = system.recruitPilgrim({});
            system.levelUpPilgrim(pilgrim.pilgrimId);
            // value = 2 * 100 + 20 * 2 + 0 * 30 = 200 + 40 + 0 = 240
            expect(system.calculatePilgrimValue(pilgrim.pilgrimId)).toBeCloseTo(240, 5);
        });

        it('should recalculate after devotion raise', () => {
            const { pilgrim } = system.recruitPilgrim({});
            system.raiseDevotion(pilgrim.pilgrimId, 5);
            // value = 1 * 100 + 25 * 2 + 0 * 30 = 100 + 50 + 0 = 150
            expect(system.calculatePilgrimValue(pilgrim.pilgrimId)).toBeCloseTo(150, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePilgrimValue('ghost')).toBe(0);
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

        it('should execute default getPilgrim', () => {
            const result = system.executeTool('getPilgrim', { pilgrimId: 'ghost' });
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
            const unregister = system.registerHook('pilgrimRecruited', () => count++);
            unregister();
            system.recruitPilgrim({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('pilgrimRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitPilgrim({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalPilgrims = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalPilgrims = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitPilgrim({});
            const json = system.toJSON();
            expect(json.pilgrims.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitPilgrim({});
            const json = system.toJSON();
            const newSys = new CultivationPilgrim();
            newSys.fromJSON(json);
            expect(newSys.pilgrims.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.recruitPilgrim({});
            const stats = system.getStats();
            expect(stats.pilgrimCount).toBe(1);
        });
    });
});
