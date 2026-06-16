/**
 * CultivationRuby.test.js - 修真红宝石系统测试
 * V833 Iteration 6/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationRuby } from '../../../systems/ai/CultivationRuby.js';

describe('CultivationRuby', () => {
    let system;
    beforeEach(() => { system = new CultivationRuby(); });

    describe('recruitRuby', () => {
        it('should recruit', () => {
            const { ruby } = system.recruitRuby({ masterId: 'm1', name: 'Sacred Ruby', type: 'pigeon' });
            expect(ruby.masterId).toBe('m1');
            expect(ruby.name).toBe('Sacred Ruby');
            expect(ruby.type).toBe('pigeon');
        });

        it('should default type to divine', () => {
            const { ruby } = system.recruitRuby({});
            expect(ruby.type).toBe('divine');
        });

        it('should default status to novice', () => {
            const { ruby } = system.recruitRuby({});
            expect(ruby.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { ruby } = system.recruitRuby({});
            expect(ruby.level).toBe(1);
        });

        it('should default inclusions to empty array', () => {
            const { ruby } = system.recruitRuby({});
            expect(ruby.inclusions).toEqual([]);
        });

        it('should default fire to baseFire', () => {
            const { ruby } = system.recruitRuby({});
            expect(ruby.fire).toBe(20);
        });

        it('should assign auto id when missing', () => {
            const { ruby } = system.recruitRuby({});
            expect(ruby.rubyId).toMatch(/^ruby_/);
        });

        it('should use provided rubyId', () => {
            const { ruby } = system.recruitRuby({ rubyId: 'r_explicit' });
            expect(ruby.rubyId).toBe('r_explicit');
        });

        it('should trigger rubyRecruited hook', () => {
            let called = false;
            system.registerHook('rubyRecruited', () => { called = true; });
            system.recruitRuby({});
            expect(called).toBe(true);
        });

        it('should respect custom config baseFire', () => {
            const customSystem = new CultivationRuby({ baseFire: 50 });
            const { ruby } = customSystem.recruitRuby({});
            expect(ruby.fire).toBe(50);
        });

        it('should increment totalRubies stat', () => {
            system.recruitRuby({});
            system.recruitRuby({});
            expect(system.stats.totalRubies).toBe(2);
        });

        it('should support all three types', () => {
            const { ruby: a } = system.recruitRuby({ type: 'pigeon' });
            const { ruby: b } = system.recruitRuby({ type: 'blood' });
            const { ruby: c } = system.recruitRuby({ type: 'divine' });
            expect(a.type).toBe('pigeon');
            expect(b.type).toBe('blood');
            expect(c.type).toBe('divine');
        });
    });

    describe('getRuby', () => {
        it('should return', () => {
            const { ruby } = system.recruitRuby({});
            expect(system.getRuby(ruby.rubyId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getRuby('ghost')).toBeNull(); });
        it('should return a copy (not reference)', () => {
            const { ruby } = system.recruitRuby({ name: 'Original' });
            const fetched = system.getRuby(ruby.rubyId);
            fetched.name = 'Mutated';
            const refetched = system.getRuby(ruby.rubyId);
            expect(refetched.name).toBe('Original');
        });
    });

    describe('listRubies', () => {
        it('should list all', () => {
            system.recruitRuby({});
            system.recruitRuby({});
            expect(system.listRubies().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listRubies().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitRuby({ masterId: 'm1' });
            system.recruitRuby({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitRuby({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });

        it('should return multiple for same master', () => {
            system.recruitRuby({ masterId: 'm1' });
            system.recruitRuby({ masterId: 'm1' });
            system.recruitRuby({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { ruby: a } = system.recruitRuby({});
            const { ruby: b } = system.recruitRuby({});
            system.legendRuby(a.rubyId);
            expect(system.listLegendary().length).toBe(1);
            expect(b.rubyId).toBeDefined();
        });

        it('should return empty when none legendary', () => {
            system.recruitRuby({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addInclusion', () => {
        it('should add inclusion', () => {
            const { ruby } = system.recruitRuby({});
            system.addInclusion(ruby.rubyId, 'iron_oxide_vein');
            expect(ruby.inclusions).toContain('iron_oxide_vein');
        });

        it('should add multiple inclusions', () => {
            const { ruby } = system.recruitRuby({});
            system.addInclusion(ruby.rubyId, 'iron_oxide_vein');
            system.addInclusion(ruby.rubyId, 'rutile_needle');
            expect(ruby.inclusions.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addInclusion('ghost', 'iron_oxide_vein');
            expect(result.error).toBe('RUBY_NOT_FOUND');
        });

        it('should trigger inclusionAdded hook', () => {
            const { ruby } = system.recruitRuby({});
            let called = false;
            system.registerHook('inclusionAdded', () => { called = true; });
            system.addInclusion(ruby.rubyId, 'iron_oxide_vein');
            expect(called).toBe(true);
        });
    });

    describe('raiseFire', () => {
        it('should raise fire', () => {
            const { ruby } = system.recruitRuby({});
            system.raiseFire(ruby.rubyId, 10);
            expect(ruby.fire).toBe(30);
        });

        it('should default amount to 5', () => {
            const { ruby } = system.recruitRuby({});
            system.raiseFire(ruby.rubyId);
            expect(ruby.fire).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseFire('ghost', 10);
            expect(result.error).toBe('RUBY_NOT_FOUND');
        });

        it('should trigger fireRaised hook', () => {
            const { ruby } = system.recruitRuby({});
            let called = false;
            system.registerHook('fireRaised', () => { called = true; });
            system.raiseFire(ruby.rubyId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpRuby', () => {
        it('should increment level', () => {
            const { ruby } = system.recruitRuby({});
            system.levelUpRuby(ruby.rubyId);
            expect(ruby.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { ruby } = system.recruitRuby({});
            system.levelUpRuby(ruby.rubyId);
            system.levelUpRuby(ruby.rubyId);
            system.levelUpRuby(ruby.rubyId);
            expect(ruby.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpRuby('ghost');
            expect(result.error).toBe('RUBY_NOT_FOUND');
        });
    });

    describe('legendRuby', () => {
        it('should set status to legendary', () => {
            const { ruby } = system.recruitRuby({});
            system.legendRuby(ruby.rubyId);
            expect(ruby.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendRuby('ghost');
            expect(result.error).toBe('RUBY_NOT_FOUND');
        });

        it('should trigger rubyLegendized hook', () => {
            const { ruby } = system.recruitRuby({});
            let called = false;
            system.registerHook('rubyLegendized', () => { called = true; });
            system.legendRuby(ruby.rubyId);
            expect(called).toBe(true);
        });
    });

    describe('calculateRubyValue', () => {
        it('should calculate', () => {
            const { ruby } = system.recruitRuby({});
            system.addInclusion(ruby.rubyId, 'iron_oxide_vein');
            // value = 1 * 100 + 20 * 2 + 1 * 30 = 100 + 40 + 30 = 170
            expect(system.calculateRubyValue(ruby.rubyId)).toBeCloseTo(170, 5);
        });

        it('should recalculate after level up', () => {
            const { ruby } = system.recruitRuby({});
            system.levelUpRuby(ruby.rubyId);
            // value = 2 * 100 + 20 * 2 + 0 * 30 = 200 + 40 + 0 = 240
            expect(system.calculateRubyValue(ruby.rubyId)).toBeCloseTo(240, 5);
        });

        it('should recalculate after fire raise', () => {
            const { ruby } = system.recruitRuby({});
            system.raiseFire(ruby.rubyId, 5);
            // value = 1 * 100 + 25 * 2 + 0 * 30 = 100 + 50 + 0 = 150
            expect(system.calculateRubyValue(ruby.rubyId)).toBeCloseTo(150, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateRubyValue('ghost')).toBe(0);
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

        it('should execute default getRuby', () => {
            const result = system.executeTool('getRuby', { rubyId: 'ghost' });
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
            const unregister = system.registerHook('rubyRecruited', () => count++);
            unregister();
            system.recruitRuby({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('rubyRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitRuby({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalRubies = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalRubies = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitRuby({});
            const json = system.toJSON();
            expect(json.rubies.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitRuby({});
            const json = system.toJSON();
            const newSys = new CultivationRuby();
            newSys.fromJSON(json);
            expect(newSys.rubies.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.recruitRuby({});
            const stats = system.getStats();
            expect(stats.rubyCount).toBe(1);
        });
    });
});
