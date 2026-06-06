/**
 * CultivationSageSaint.test.js - 修真圣贤测试
 * V657 Iteration 10/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSageSaint } from '../../../systems/ai/CultivationSageSaint.js';

describe('CultivationSageSaint', () => {
    let system;
    beforeEach(() => { system = new CultivationSageSaint(); });

    describe('recruitSageSaint', () => {
        it('should recruit a sage saint', () => {
            const { sageSaint } = system.recruitSageSaint({ masterId: 'm1', name: 'Saint Lao', type: 'dao' });
            expect(sageSaint.masterId).toBe('m1');
            expect(sageSaint.name).toBe('Saint Lao');
            expect(sageSaint.type).toBe('dao');
            expect(sageSaint.status).toBe('novice');
            expect(sageSaint.level).toBe(1);
        });

        it('should use defaults when not provided', () => {
            const { sageSaint } = system.recruitSageSaint({});
            expect(sageSaint.name).toBe('Unnamed Sage Saint');
            expect(sageSaint.type).toBe('philosophy');
            expect(sageSaint.wisdom).toBe(20);
            expect(sageSaint.teachings).toEqual([]);
        });

        it('should generate id if not provided', () => {
            const { sageSaint } = system.recruitSageSaint({});
            expect(sageSaint.saintId).toBeTruthy();
            expect(typeof sageSaint.saintId).toBe('string');
        });

        it('should use provided saintId', () => {
            const { sageSaint } = system.recruitSageSaint({ saintId: 'custom-saint-1' });
            expect(sageSaint.saintId).toBe('custom-saint-1');
        });

        it('should trigger sageSaintRecruited hook', () => {
            let called = false;
            system.registerHook('sageSaintRecruited', () => { called = true; });
            system.recruitSageSaint({});
            expect(called).toBe(true);
        });

        it('should increment totalSageSaints stat', () => {
            expect(system.stats.totalSageSaints).toBe(0);
            system.recruitSageSaint({});
            expect(system.stats.totalSageSaints).toBe(1);
            system.recruitSageSaint({});
            expect(system.stats.totalSageSaints).toBe(2);
        });
    });

    describe('getSageSaint', () => {
        it('should return a sage saint', () => {
            const { sageSaint } = system.recruitSageSaint({});
            expect(system.getSageSaint(sageSaint.saintId)).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getSageSaint('ghost')).toBeNull();
        });
    });

    describe('listSageSaints', () => {
        it('should list all', () => {
            system.recruitSageSaint({});
            system.recruitSageSaint({});
            expect(system.listSageSaints().length).toBe(2);
        });

        it('should return empty list when empty', () => {
            expect(system.listSageSaints().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitSageSaint({ masterId: 'm1' });
            system.recruitSageSaint({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty when no match', () => {
            system.recruitSageSaint({ masterId: 'm1' });
            expect(system.listByMaster('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { sageSaint: s1 } = system.recruitSageSaint({});
            system.recruitSageSaint({});
            system.legendSageSaint(s1.saintId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendary', () => {
            system.recruitSageSaint({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addTeaching', () => {
        it('should add teaching', () => {
            const { sageSaint } = system.recruitSageSaint({});
            system.addTeaching(sageSaint.saintId, 'compassion-teaching');
            expect(sageSaint.teachings.length).toBe(1);
            expect(sageSaint.teachings[0]).toBe('compassion-teaching');
        });

        it('should reject missing', () => {
            const result = system.addTeaching('ghost', 'x');
            expect(result.error).toBe('SAINT_NOT_FOUND');
        });

        it('should trigger teachingAdded hook', () => {
            const { sageSaint } = system.recruitSageSaint({});
            let called = false;
            system.registerHook('teachingAdded', () => { called = true; });
            system.addTeaching(sageSaint.saintId, 'virtue-teaching');
            expect(called).toBe(true);
        });
    });

    describe('deepenWisdom', () => {
        it('should deepen wisdom', () => {
            const { sageSaint } = system.recruitSageSaint({});
            system.deepenWisdom(sageSaint.saintId, 10);
            expect(sageSaint.wisdom).toBe(30);
        });

        it('should use default amount of 5', () => {
            const { sageSaint } = system.recruitSageSaint({});
            system.deepenWisdom(sageSaint.saintId);
            expect(sageSaint.wisdom).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.deepenWisdom('ghost', 5);
            expect(result.error).toBe('SAINT_NOT_FOUND');
        });

        it('should trigger wisdomDeepened hook', () => {
            const { sageSaint } = system.recruitSageSaint({});
            let called = false;
            system.registerHook('wisdomDeepened', () => { called = true; });
            system.deepenWisdom(sageSaint.saintId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSageSaint', () => {
        it('should level up', () => {
            const { sageSaint } = system.recruitSageSaint({});
            system.levelUpSageSaint(sageSaint.saintId);
            expect(sageSaint.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpSageSaint('ghost');
            expect(result.error).toBe('SAINT_NOT_FOUND');
        });

        it('should trigger sageSaintLeveledUp hook', () => {
            const { sageSaint } = system.recruitSageSaint({});
            let called = false;
            system.registerHook('sageSaintLeveledUp', () => { called = true; });
            system.levelUpSageSaint(sageSaint.saintId);
            expect(called).toBe(true);
        });
    });

    describe('legendSageSaint', () => {
        it('should set status to legendary', () => {
            const { sageSaint } = system.recruitSageSaint({});
            system.legendSageSaint(sageSaint.saintId);
            expect(sageSaint.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSageSaint('ghost');
            expect(result.error).toBe('SAINT_NOT_FOUND');
        });

        it('should trigger sageSaintLegendized hook', () => {
            const { sageSaint } = system.recruitSageSaint({});
            let called = false;
            system.registerHook('sageSaintLegendized', () => { called = true; });
            system.legendSageSaint(sageSaint.saintId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSageSaintValue', () => {
        it('should calculate value', () => {
            const { sageSaint } = system.recruitSageSaint({});
            system.addTeaching(sageSaint.saintId, 'teaching-1');
            // level=1, wisdom=20 (default baseWisdom), teachings=1
            // 1*100 + 20*2 + 1*30 = 100 + 40 + 30 = 170
            expect(system.calculateSageSaintValue(sageSaint.saintId)).toBe(170);
        });

        it('should reflect level and wisdom changes', () => {
            const { sageSaint } = system.recruitSageSaint({});
            system.levelUpSageSaint(sageSaint.saintId);
            system.deepenWisdom(sageSaint.saintId, 10);
            // level=2, wisdom=30, teachings=0
            // 2*100 + 30*2 + 0*30 = 200 + 60 + 0 = 260
            expect(system.calculateSageSaintValue(sageSaint.saintId)).toBe(260);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSageSaintValue('ghost')).toBe(0);
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

        it('should default context to empty object', () => {
            system.registerTool('test', (ctx) => Object.keys(ctx).length);
            const result = system.executeTool('test', null);
            expect(result.result).toBe(0);
        });

        it('should execute default getSageSaint', () => {
            const result = system.executeTool('getSageSaint', { saintId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitSageSaint', () => {
            const result = system.executeTool('recruitSageSaint', { name: 'ToolSaint' });
            expect(result.success).toBe(true);
            expect(result.result.sageSaint.name).toBe('ToolSaint');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('sageSaintRecruited', () => count++);
            unregister();
            system.recruitSageSaint({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('sageSaintRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSageSaint({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSageSaints = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalSageSaints = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSageSaint({});
            const json = system.toJSON();
            expect(json.sageSaints.length).toBe(1);
            expect(json.stats.totalSageSaints).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSageSaint({});
            const json = system.toJSON();
            const newSys = new CultivationSageSaint();
            newSys.fromJSON(json);
            expect(newSys.sageSaints.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.sageSaintCount).toBe(0);
            expect(stats.totalSageSaints).toBe(0);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
