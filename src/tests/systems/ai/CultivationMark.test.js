/**
 * CultivationMark.test.js - 修真标记系统测试
 * V765 Iteration 28/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMark } from '../../../systems/ai/CultivationMark.js';

describe('CultivationMark', () => {
    let system;
    beforeEach(() => { system = new CultivationMark(); });

    describe('recruitMark', () => {
        it('should recruit mark', () => {
            const { mark } = system.recruitMark({ masterId: 'm1', name: 'Dragon Mark', type: 'clan' });
            expect(mark.masterId).toBe('m1');
            expect(mark.name).toBe('Dragon Mark');
            expect(mark.type).toBe('clan');
        });

        it('should default type to personal', () => {
            const { mark } = system.recruitMark({});
            expect(mark.type).toBe('personal');
        });

        it('should default name to Unnamed Mark', () => {
            const { mark } = system.recruitMark({});
            expect(mark.name).toBe('Unnamed Mark');
        });

        it('should default sharpness to baseSharpness', () => {
            const { mark } = system.recruitMark({});
            expect(mark.sharpness).toBe(20);
        });

        it('should start at level 1', () => {
            const { mark } = system.recruitMark({});
            expect(mark.level).toBe(1);
        });

        it('should start with status novice', () => {
            const { mark } = system.recruitMark({});
            expect(mark.status).toBe('novice');
        });

        it('should start with empty scars', () => {
            const { mark } = system.recruitMark({});
            expect(mark.scars).toEqual([]);
        });

        it('should generate markId', () => {
            const { mark } = system.recruitMark({});
            expect(mark.markId).toBeDefined();
            expect(typeof mark.markId).toBe('string');
        });

        it('should accept custom markId', () => {
            const { mark } = system.recruitMark({ markId: 'my-mark' });
            expect(mark.markId).toBe('my-mark');
        });

        it('should support all types', () => {
            const { mark: m1 } = system.recruitMark({ type: 'personal' });
            const { mark: m2 } = system.recruitMark({ type: 'clan' });
            const { mark: m3 } = system.recruitMark({ type: 'divine' });
            expect(m1.type).toBe('personal');
            expect(m2.type).toBe('clan');
            expect(m3.type).toBe('divine');
        });

        it('should trigger markRecruited hook', () => {
            let called = false;
            system.registerHook('markRecruited', () => { called = true; });
            system.recruitMark({});
            expect(called).toBe(true);
        });
    });

    describe('getMark', () => {
        it('should return mark', () => {
            const { mark } = system.recruitMark({});
            expect(system.getMark(mark.markId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMark('ghost')).toBeNull(); });
    });

    describe('listMarks', () => {
        it('should list all', () => {
            system.recruitMark({});
            system.recruitMark({});
            expect(system.listMarks().length).toBe(2);
        });

        it('should return empty when no marks', () => {
            expect(system.listMarks().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitMark({ masterId: 'm1' });
            system.recruitMark({ masterId: 'm2' });
            system.recruitMark({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for missing master', () => {
            system.recruitMark({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { mark: m1 } = system.recruitMark({});
            const { mark: m2 } = system.recruitMark({});
            system.legendMark(m1.markId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].markId).toBe(m1.markId);
        });

        it('should return empty when none legendary', () => {
            system.recruitMark({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addScar', () => {
        it('should add scar', () => {
            const { mark } = system.recruitMark({});
            system.addScar(mark.markId, 'battle-wound');
            expect(mark.scars).toContain('battle-wound');
            expect(mark.scars.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addScar('ghost', 'scar');
            expect(result.error).toBe('MARK_NOT_FOUND');
        });

        it('should trigger scarAdded hook', () => {
            const { mark } = system.recruitMark({});
            let called = false;
            system.registerHook('scarAdded', () => { called = true; });
            system.addScar(mark.markId, 'scar');
            expect(called).toBe(true);
        });

        it('should add multiple scars', () => {
            const { mark } = system.recruitMark({});
            system.addScar(mark.markId, 'scar1');
            system.addScar(mark.markId, 'scar2');
            expect(mark.scars.length).toBe(2);
        });
    });

    describe('raiseSharpness', () => {
        it('should raise sharpness', () => {
            const { mark } = system.recruitMark({});
            system.raiseSharpness(mark.markId, 10);
            expect(mark.sharpness).toBe(30);
        });

        it('should default amount to 5', () => {
            const { mark } = system.recruitMark({});
            system.raiseSharpness(mark.markId);
            expect(mark.sharpness).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseSharpness('ghost', 10);
            expect(result.error).toBe('MARK_NOT_FOUND');
        });

        it('should trigger sharpnessRaised hook', () => {
            const { mark } = system.recruitMark({});
            let called = false;
            system.registerHook('sharpnessRaised', () => { called = true; });
            system.raiseSharpness(mark.markId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMark', () => {
        it('should level up', () => {
            const { mark } = system.recruitMark({});
            system.levelUpMark(mark.markId);
            expect(mark.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpMark('ghost');
            expect(result.error).toBe('MARK_NOT_FOUND');
        });

        it('should trigger markLeveledUp hook', () => {
            const { mark } = system.recruitMark({});
            let called = false;
            system.registerHook('markLeveledUp', () => { called = true; });
            system.levelUpMark(mark.markId);
            expect(called).toBe(true);
        });
    });

    describe('legendMark', () => {
        it('should set status to legendary', () => {
            const { mark } = system.recruitMark({});
            system.legendMark(mark.markId);
            expect(mark.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendMark('ghost');
            expect(result.error).toBe('MARK_NOT_FOUND');
        });

        it('should trigger markLegendized hook', () => {
            const { mark } = system.recruitMark({});
            let called = false;
            system.registerHook('markLegendized', () => { called = true; });
            system.legendMark(mark.markId);
            expect(called).toBe(true);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitMark({ type: 'personal' });
            system.recruitMark({ type: 'clan' });
            system.recruitMark({ type: 'divine' });
            expect(system.listByType('clan').length).toBe(1);
        });

        it('should return empty for missing type', () => {
            system.recruitMark({ type: 'personal' });
            expect(system.listByType('cosmic').length).toBe(0);
        });
    });

    describe('listVeteran', () => {
        it('should return empty when no veteran marks', () => {
            system.recruitMark({});
            expect(system.listVeteran().length).toBe(0);
        });
    });

    describe('calculateMarkValue', () => {
        it('should calculate for default mark', () => {
            const { mark } = system.recruitMark({});
            // level 1 * 100 + sharpness 20 * 2 + 0 scars * 30 = 100 + 40 + 0 = 140
            expect(system.calculateMarkValue(mark.markId)).toBe(140);
        });

        it('should incorporate level, sharpness, and scars', () => {
            const { mark } = system.recruitMark({});
            system.levelUpMark(mark.markId); // level 2
            system.raiseSharpness(mark.markId, 10); // sharpness 30
            system.addScar(mark.markId, 'scar1'); // 1 scar
            system.addScar(mark.markId, 'scar2'); // 2 scars
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateMarkValue(mark.markId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMarkValue('ghost')).toBe(0);
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

        it('should execute default getMark', () => {
            const result = system.executeTool('getMark', { markId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('markRecruited', () => count++);
            unregister();
            system.recruitMark({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('markRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitMark({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMarks = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMarks = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitMark({});
            const json = system.toJSON();
            expect(json.marks.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitMark({});
            const json = system.toJSON();
            const newSys = new CultivationMark();
            newSys.fromJSON(json);
            expect(newSys.marks.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.markCount).toBe(0);
        });
    });
});
