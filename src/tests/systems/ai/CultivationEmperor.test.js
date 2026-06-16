/**
 * CultivationEmperor.test.js - 修真皇帝系统测试
 * V730 Iteration 23/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationEmperor } from '../../../systems/ai/CultivationEmperor.js';

describe('CultivationEmperor', () => {
    let system;
    beforeEach(() => { system = new CultivationEmperor(); });

    describe('recruitEmperor', () => {
        it('should recruit an emperor', () => {
            const { emperor } = system.recruitEmperor({ empireId: 'e1', name: 'Divine Emperor', type: 'divine' });
            expect(emperor.empireId).toBe('e1');
            expect(emperor.name).toBe('Divine Emperor');
            expect(emperor.type).toBe('divine');
        });

        it('should default type to righteous', () => {
            const { emperor } = system.recruitEmperor({ empireId: 'e1', name: 'E' });
            expect(emperor.type).toBe('righteous');
        });

        it('should default mandate to baseMandate', () => {
            const { emperor } = system.recruitEmperor({ empireId: 'e1', name: 'E' });
            expect(emperor.mandate).toBe(20);
        });

        it('should start with novice status and level 1', () => {
            const { emperor } = system.recruitEmperor({ empireId: 'e1', name: 'E' });
            expect(emperor.status).toBe('novice');
            expect(emperor.level).toBe(1);
        });

        it('should start with empty edicts', () => {
            const { emperor } = system.recruitEmperor({ empireId: 'e1', name: 'E' });
            expect(emperor.edicts).toEqual([]);
        });

        it('should support custom mandate and edicts', () => {
            const { emperor } = system.recruitEmperor({ empireId: 'e1', name: 'E', mandate: 99, edicts: ['e1'] });
            expect(emperor.mandate).toBe(99);
            expect(emperor.edicts).toEqual(['e1']);
        });

        it('should trigger emperorRecruited hook', () => {
            let called = false;
            system.registerHook('emperorRecruited', () => { called = true; });
            system.recruitEmperor({ empireId: 'e1', name: 'E' });
            expect(called).toBe(true);
        });
    });

    describe('getEmperor', () => {
        it('should return emperor', () => {
            const { emperor } = system.recruitEmperor({ empireId: 'e1', name: 'E' });
            const found = system.getEmperor(emperor.emperorId);
            expect(found).not.toBeNull();
            expect(found.emperorId).toBe(emperor.emperorId);
        });

        it('should return null for missing', () => {
            expect(system.getEmperor('ghost')).toBeNull();
        });
    });

    describe('listEmperors', () => {
        it('should list all', () => {
            system.recruitEmperor({ empireId: 'e1', name: 'A' });
            system.recruitEmperor({ empireId: 'e2', name: 'B' });
            expect(system.listEmperors().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listEmperors()).toEqual([]);
        });
    });

    describe('listByEmpire', () => {
        it('should filter by empire', () => {
            system.recruitEmperor({ empireId: 'e1', name: 'A' });
            system.recruitEmperor({ empireId: 'e2', name: 'B' });
            system.recruitEmperor({ empireId: 'e1', name: 'C' });
            expect(system.listByEmpire('e1').length).toBe(2);
        });

        it('should return empty for unknown empire', () => {
            system.recruitEmperor({ empireId: 'e1', name: 'A' });
            expect(system.listByEmpire('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should return only legendary', () => {
            const { emperor: a } = system.recruitEmperor({ empireId: 'e1', name: 'A' });
            system.recruitEmperor({ empireId: 'e1', name: 'B' });
            system.legendEmperor(a.emperorId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addEdict', () => {
        it('should add edict', () => {
            const { emperor } = system.recruitEmperor({ empireId: 'e1', name: 'E' });
            system.addEdict(emperor.emperorId, 'no-war');
            expect(emperor.edicts).toContain('no-war');
        });

        it('should reject missing emperor', () => {
            const result = system.addEdict('ghost', 'e');
            expect(result.error).toBe('EMPEROR_NOT_FOUND');
        });

        it('should trigger edictAdded hook', () => {
            const { emperor } = system.recruitEmperor({ empireId: 'e1', name: 'E' });
            let called = false;
            system.registerHook('edictAdded', () => { called = true; });
            system.addEdict(emperor.emperorId, 'e1');
            expect(called).toBe(true);
        });
    });

    describe('raiseMandate', () => {
        it('should raise by default 5', () => {
            const { emperor } = system.recruitEmperor({ empireId: 'e1', name: 'E' });
            system.raiseMandate(emperor.emperorId);
            expect(emperor.mandate).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { emperor } = system.recruitEmperor({ empireId: 'e1', name: 'E' });
            system.raiseMandate(emperor.emperorId, 50);
            expect(emperor.mandate).toBe(70);
        });

        it('should reject missing emperor', () => {
            const result = system.raiseMandate('ghost', 10);
            expect(result.error).toBe('EMPEROR_NOT_FOUND');
        });

        it('should trigger mandateRaised hook', () => {
            const { emperor } = system.recruitEmperor({ empireId: 'e1', name: 'E' });
            let called = false;
            system.registerHook('mandateRaised', () => { called = true; });
            system.raiseMandate(emperor.emperorId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpEmperor', () => {
        it('should increment level', () => {
            const { emperor } = system.recruitEmperor({ empireId: 'e1', name: 'E' });
            system.levelUpEmperor(emperor.emperorId);
            expect(emperor.level).toBe(2);
        });

        it('should reject missing emperor', () => {
            const result = system.levelUpEmperor('ghost');
            expect(result.error).toBe('EMPEROR_NOT_FOUND');
        });
    });

    describe('legendEmperor', () => {
        it('should set status to legendary', () => {
            const { emperor } = system.recruitEmperor({ empireId: 'e1', name: 'E' });
            system.legendEmperor(emperor.emperorId);
            expect(emperor.status).toBe('legendary');
        });

        it('should reject missing emperor', () => {
            const result = system.legendEmperor('ghost');
            expect(result.error).toBe('EMPEROR_NOT_FOUND');
        });

        it('should trigger emperorLegendized hook', () => {
            const { emperor } = system.recruitEmperor({ empireId: 'e1', name: 'E' });
            let called = false;
            system.registerHook('emperorLegendized', () => { called = true; });
            system.legendEmperor(emperor.emperorId);
            expect(called).toBe(true);
        });
    });

    describe('calculateEmperorValue', () => {
        it('should calculate base value', () => {
            const { emperor } = system.recruitEmperor({ empireId: 'e1', name: 'E' });
            // level=1 * 100 + mandate=20 * 2 + edicts=0 * 30 = 140
            expect(system.calculateEmperorValue(emperor.emperorId)).toBe(140);
        });

        it('should account for level and edicts', () => {
            const { emperor } = system.recruitEmperor({ empireId: 'e1', name: 'E' });
            system.levelUpEmperor(emperor.emperorId); // 2
            system.levelUpEmperor(emperor.emperorId); // 3
            system.addEdict(emperor.emperorId, 'd1');
            system.addEdict(emperor.emperorId, 'd2');
            system.raiseMandate(emperor.emperorId, 10); // 30
            // level=3 * 100 + mandate=30 * 2 + edicts=2 * 30 = 300+60+60=420
            expect(system.calculateEmperorValue(emperor.emperorId)).toBe(420);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateEmperorValue('ghost')).toBe(0);
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

        it('should execute default getEmperor', () => {
            const result = system.executeTool('getEmperor', { emperorId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('emperorRecruited', () => count++);
            unregister();
            system.recruitEmperor({ empireId: 'e1', name: 'E' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('emperorRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitEmperor({ empireId: 'e1', name: 'E' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalEmperors = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalEmperors = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitEmperor({ empireId: 'e1', name: 'E' });
            const json = system.toJSON();
            expect(json.emperors.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitEmperor({ empireId: 'e1', name: 'E' });
            const json = system.toJSON();
            const newSys = new CultivationEmperor();
            newSys.fromJSON(json);
            expect(newSys.emperors.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.emperorCount).toBe(0);
        });
    });
});
