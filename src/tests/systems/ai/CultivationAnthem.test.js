/**
 * CultivationAnthem.test.js - 修真圣歌系统测试
 * V777 Iteration 10/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationAnthem } from '../../../systems/ai/CultivationAnthem.js';

describe('CultivationAnthem', () => {
    let system;
    beforeEach(() => { system = new CultivationAnthem(); });

    describe('recruitAnthem', () => {
        it('should recruit', () => {
            const { anthem } = system.recruitAnthem({ masterId: 'm1', name: 'Sacred Anthem', type: 'national' });
            expect(anthem.masterId).toBe('m1');
            expect(anthem.name).toBe('Sacred Anthem');
            expect(anthem.type).toBe('national');
        });

        it('should default type to divine', () => {
            const { anthem } = system.recruitAnthem({});
            expect(anthem.type).toBe('divine');
        });

        it('should default status to novice', () => {
            const { anthem } = system.recruitAnthem({});
            expect(anthem.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { anthem } = system.recruitAnthem({});
            expect(anthem.level).toBe(1);
        });

        it('should default choruses to empty array', () => {
            const { anthem } = system.recruitAnthem({});
            expect(anthem.choruses).toEqual([]);
        });

        it('should default grandeur to baseGrandeur', () => {
            const { anthem } = system.recruitAnthem({});
            expect(anthem.grandeur).toBe(20);
        });

        it('should assign auto id when missing', () => {
            const { anthem } = system.recruitAnthem({});
            expect(anthem.anthemId).toMatch(/^anthem_/);
        });

        it('should use provided anthemId', () => {
            const { anthem } = system.recruitAnthem({ anthemId: 'a_explicit' });
            expect(anthem.anthemId).toBe('a_explicit');
        });

        it('should trigger anthemRecruited hook', () => {
            let called = false;
            system.registerHook('anthemRecruited', () => { called = true; });
            system.recruitAnthem({});
            expect(called).toBe(true);
        });

        it('should respect custom config baseGrandeur', () => {
            const customSystem = new CultivationAnthem({ baseGrandeur: 50 });
            const { anthem } = customSystem.recruitAnthem({});
            expect(anthem.grandeur).toBe(50);
        });

        it('should increment totalAnthems stat', () => {
            system.recruitAnthem({});
            system.recruitAnthem({});
            expect(system.stats.totalAnthems).toBe(2);
        });

        it('should support all three types', () => {
            const { anthem: a } = system.recruitAnthem({ type: 'national' });
            const { anthem: b } = system.recruitAnthem({ type: 'divine' });
            const { anthem: c } = system.recruitAnthem({ type: 'eternal' });
            expect(a.type).toBe('national');
            expect(b.type).toBe('divine');
            expect(c.type).toBe('eternal');
        });
    });

    describe('getAnthem', () => {
        it('should return', () => {
            const { anthem } = system.recruitAnthem({});
            expect(system.getAnthem(anthem.anthemId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getAnthem('ghost')).toBeNull(); });
        it('should return a copy (not reference)', () => {
            const { anthem } = system.recruitAnthem({ name: 'Original' });
            const fetched = system.getAnthem(anthem.anthemId);
            fetched.name = 'Mutated';
            const refetched = system.getAnthem(anthem.anthemId);
            expect(refetched.name).toBe('Original');
        });
    });

    describe('listAnthems', () => {
        it('should list all', () => {
            system.recruitAnthem({});
            system.recruitAnthem({});
            expect(system.listAnthems().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listAnthems().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitAnthem({ masterId: 'm1' });
            system.recruitAnthem({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitAnthem({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });

        it('should return multiple for same master', () => {
            system.recruitAnthem({ masterId: 'm1' });
            system.recruitAnthem({ masterId: 'm1' });
            system.recruitAnthem({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { anthem: a } = system.recruitAnthem({});
            const { anthem: b } = system.recruitAnthem({});
            system.legendAnthem(a.anthemId);
            expect(system.listLegendary().length).toBe(1);
            expect(b.anthemId).toBeDefined();
        });

        it('should return empty when none legendary', () => {
            system.recruitAnthem({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addChorus', () => {
        it('should add chorus', () => {
            const { anthem } = system.recruitAnthem({});
            system.addChorus(anthem.anthemId, 'harmony_of_heaven');
            expect(anthem.choruses).toContain('harmony_of_heaven');
        });

        it('should add multiple choruses', () => {
            const { anthem } = system.recruitAnthem({});
            system.addChorus(anthem.anthemId, 'harmony_of_heaven');
            system.addChorus(anthem.anthemId, 'eternal_chant');
            expect(anthem.choruses.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addChorus('ghost', 'harmony_of_heaven');
            expect(result.error).toBe('ANTHEM_NOT_FOUND');
        });

        it('should trigger chorusAdded hook', () => {
            const { anthem } = system.recruitAnthem({});
            let called = false;
            system.registerHook('chorusAdded', () => { called = true; });
            system.addChorus(anthem.anthemId, 'harmony_of_heaven');
            expect(called).toBe(true);
        });
    });

    describe('raiseGrandeur', () => {
        it('should raise grandeur', () => {
            const { anthem } = system.recruitAnthem({});
            system.raiseGrandeur(anthem.anthemId, 10);
            expect(anthem.grandeur).toBe(30);
        });

        it('should default amount to 5', () => {
            const { anthem } = system.recruitAnthem({});
            system.raiseGrandeur(anthem.anthemId);
            expect(anthem.grandeur).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseGrandeur('ghost', 10);
            expect(result.error).toBe('ANTHEM_NOT_FOUND');
        });

        it('should trigger grandeurRaised hook', () => {
            const { anthem } = system.recruitAnthem({});
            let called = false;
            system.registerHook('grandeurRaised', () => { called = true; });
            system.raiseGrandeur(anthem.anthemId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpAnthem', () => {
        it('should increment level', () => {
            const { anthem } = system.recruitAnthem({});
            system.levelUpAnthem(anthem.anthemId);
            expect(anthem.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { anthem } = system.recruitAnthem({});
            system.levelUpAnthem(anthem.anthemId);
            system.levelUpAnthem(anthem.anthemId);
            system.levelUpAnthem(anthem.anthemId);
            expect(anthem.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpAnthem('ghost');
            expect(result.error).toBe('ANTHEM_NOT_FOUND');
        });
    });

    describe('legendAnthem', () => {
        it('should set status to legendary', () => {
            const { anthem } = system.recruitAnthem({});
            system.legendAnthem(anthem.anthemId);
            expect(anthem.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendAnthem('ghost');
            expect(result.error).toBe('ANTHEM_NOT_FOUND');
        });

        it('should trigger anthemLegendized hook', () => {
            const { anthem } = system.recruitAnthem({});
            let called = false;
            system.registerHook('anthemLegendized', () => { called = true; });
            system.legendAnthem(anthem.anthemId);
            expect(called).toBe(true);
        });
    });

    describe('calculateAnthemValue', () => {
        it('should calculate', () => {
            const { anthem } = system.recruitAnthem({});
            system.addChorus(anthem.anthemId, 'harmony_of_heaven');
            // value = 1 * 100 + 20 * 2 + 1 * 30 = 100 + 40 + 30 = 170
            expect(system.calculateAnthemValue(anthem.anthemId)).toBeCloseTo(170, 5);
        });

        it('should recalculate after level up', () => {
            const { anthem } = system.recruitAnthem({});
            system.levelUpAnthem(anthem.anthemId);
            // value = 2 * 100 + 20 * 2 + 0 * 30 = 200 + 40 + 0 = 240
            expect(system.calculateAnthemValue(anthem.anthemId)).toBeCloseTo(240, 5);
        });

        it('should recalculate after grandeur raise', () => {
            const { anthem } = system.recruitAnthem({});
            system.raiseGrandeur(anthem.anthemId, 5);
            // value = 1 * 100 + 25 * 2 + 0 * 30 = 100 + 50 + 0 = 150
            expect(system.calculateAnthemValue(anthem.anthemId)).toBeCloseTo(150, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateAnthemValue('ghost')).toBe(0);
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

        it('should execute default getAnthem', () => {
            const result = system.executeTool('getAnthem', { anthemId: 'ghost' });
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
            const unregister = system.registerHook('anthemRecruited', () => count++);
            unregister();
            system.recruitAnthem({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('anthemRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitAnthem({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalAnthems = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalAnthems = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitAnthem({});
            const json = system.toJSON();
            expect(json.anthems.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitAnthem({});
            const json = system.toJSON();
            const newSys = new CultivationAnthem();
            newSys.fromJSON(json);
            expect(newSys.anthems.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.recruitAnthem({});
            const stats = system.getStats();
            expect(stats.anthemCount).toBe(1);
        });
    });
});
