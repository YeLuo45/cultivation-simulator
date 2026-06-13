/**
 * CultivationDisciple.test.js - 修真弟子测试
 * V663 Iteration 16/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDisciple } from '../../../systems/ai/CultivationDisciple.js';

describe('CultivationDisciple', () => {
    let system;
    beforeEach(() => { system = new CultivationDisciple(); });

    describe('recruitDisciple', () => {
        it('should recruit', () => {
            const { disciple } = system.recruitDisciple({ masterId: 'm1', name: 'Lin-Feng' });
            expect(disciple.masterId).toBe('m1');
            expect(disciple.name).toBe('Lin-Feng');
        });

        it('should default type to outer', () => {
            const { disciple } = system.recruitDisciple({});
            expect(disciple.type).toBe('outer');
        });

        it('should default progress to baseProgress', () => {
            const { disciple } = system.recruitDisciple({});
            expect(disciple.progress).toBe(20);
        });

        it('should default tasks to empty array', () => {
            const { disciple } = system.recruitDisciple({});
            expect(disciple.tasks).toEqual([]);
        });

        it('should default level to 1', () => {
            const { disciple } = system.recruitDisciple({});
            expect(disciple.level).toBe(1);
        });

        it('should default status to novice', () => {
            const { disciple } = system.recruitDisciple({});
            expect(disciple.status).toBe('novice');
        });

        it('should respect inner/secret types', () => {
            const { disciple: d1 } = system.recruitDisciple({ type: 'inner' });
            const { disciple: d2 } = system.recruitDisciple({ type: 'secret' });
            expect(d1.type).toBe('inner');
            expect(d2.type).toBe('secret');
        });

        it('should increment totalDisciples', () => {
            system.recruitDisciple({});
            expect(system.stats.totalDisciples).toBe(1);
        });

        it('should trigger discipleRecruited hook', () => {
            let called = false;
            system.registerHook('discipleRecruited', () => { called = true; });
            system.recruitDisciple({});
            expect(called).toBe(true);
        });

        it('should auto-generate discipleId when not provided', () => {
            const { disciple } = system.recruitDisciple({});
            expect(disciple.discipleId).toMatch(/^dci_/);
        });
    });

    describe('getDisciple', () => {
        it('should return', () => {
            const { disciple } = system.recruitDisciple({});
            expect(system.getDisciple(disciple.discipleId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDisciple('ghost')).toBeNull(); });
    });

    describe('listDisciples', () => {
        it('should list all', () => {
            system.recruitDisciple({});
            system.recruitDisciple({});
            expect(system.listDisciples().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listDisciples().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitDisciple({ masterId: 'm1' });
            system.recruitDisciple({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitDisciple({ masterId: 'm1' });
            expect(system.listByMaster('m-unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { disciple: d1 } = system.recruitDisciple({});
            system.recruitDisciple({});
            system.legendDisciple(d1.discipleId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].discipleId).toBe(d1.discipleId);
        });

        it('should return empty when no legendary', () => {
            system.recruitDisciple({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addTask', () => {
        it('should add task', () => {
            const { disciple } = system.recruitDisciple({});
            system.addTask(disciple.discipleId, { name: 'sword-training' });
            expect(disciple.tasks.length).toBe(1);
        });

        it('should add multiple tasks', () => {
            const { disciple } = system.recruitDisciple({});
            system.addTask(disciple.discipleId, { name: 'a' });
            system.addTask(disciple.discipleId, { name: 'b' });
            expect(disciple.tasks.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addTask('ghost', {});
            expect(result.error).toBe('DISCIPLE_NOT_FOUND');
        });

        it('should trigger taskAdded hook', () => {
            const { disciple } = system.recruitDisciple({});
            let called = false;
            system.registerHook('taskAdded', () => { called = true; });
            system.addTask(disciple.discipleId, {});
            expect(called).toBe(true);
        });
    });

    describe('deepenProgress', () => {
        it('should deepen by default 5', () => {
            const { disciple } = system.recruitDisciple({});
            system.deepenProgress(disciple.discipleId);
            expect(disciple.progress).toBe(25);
        });

        it('should deepen by custom amount', () => {
            const { disciple } = system.recruitDisciple({});
            system.deepenProgress(disciple.discipleId, 30);
            expect(disciple.progress).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.deepenProgress('ghost', 10);
            expect(result.error).toBe('DISCIPLE_NOT_FOUND');
        });

        it('should trigger progressDeepened hook', () => {
            const { disciple } = system.recruitDisciple({});
            let called = false;
            system.registerHook('progressDeepened', () => { called = true; });
            system.deepenProgress(disciple.discipleId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDisciple', () => {
        it('should level up', () => {
            const { disciple } = system.recruitDisciple({});
            system.levelUpDisciple(disciple.discipleId);
            expect(disciple.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { disciple } = system.recruitDisciple({});
            system.levelUpDisciple(disciple.discipleId);
            system.levelUpDisciple(disciple.discipleId);
            system.levelUpDisciple(disciple.discipleId);
            expect(disciple.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpDisciple('ghost');
            expect(result.error).toBe('DISCIPLE_NOT_FOUND');
        });

        it('should trigger discipleLeveledUp hook', () => {
            const { disciple } = system.recruitDisciple({});
            let called = false;
            system.registerHook('discipleLeveledUp', () => { called = true; });
            system.levelUpDisciple(disciple.discipleId);
            expect(called).toBe(true);
        });
    });

    describe('legendDisciple', () => {
        it('should set status to legendary', () => {
            const { disciple } = system.recruitDisciple({});
            system.legendDisciple(disciple.discipleId);
            expect(disciple.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendDisciple('ghost');
            expect(result.error).toBe('DISCIPLE_NOT_FOUND');
        });

        it('should trigger discipleLegendized hook', () => {
            const { disciple } = system.recruitDisciple({});
            let called = false;
            system.registerHook('discipleLegendized', () => { called = true; });
            system.legendDisciple(disciple.discipleId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDiscipleValue', () => {
        it('should calculate using formula', () => {
            const { disciple } = system.recruitDisciple({});
            // default: level=1, progress=20, tasks=[] => 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateDiscipleValue(disciple.discipleId)).toBe(140);
        });

        it('should reflect level, progress and tasks', () => {
            const { disciple } = system.recruitDisciple({});
            system.levelUpDisciple(disciple.discipleId);
            system.levelUpDisciple(disciple.discipleId);
            system.deepenProgress(disciple.discipleId, 10);
            system.addTask(disciple.discipleId, {});
            system.addTask(disciple.discipleId, {});
            // level=3, progress=30, tasks=2 => 3*100 + 30*2 + 2*30 = 300 + 60 + 60 = 420
            expect(system.calculateDiscipleValue(disciple.discipleId)).toBe(420);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDiscipleValue('ghost')).toBe(0);
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

        it('should execute default getDisciple', () => {
            const result = system.executeTool('getDisciple', { discipleId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('discipleRecruited', () => count++);
            unregister();
            system.recruitDisciple({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('discipleRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitDisciple({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDisciples = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDisciples = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitDisciple({});
            const json = system.toJSON();
            expect(json.disciples.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitDisciple({});
            const json = system.toJSON();
            const newSys = new CultivationDisciple();
            newSys.fromJSON(json);
            expect(newSys.disciples.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.discipleCount).toBe(0);
        });
    });
});
