/**
 * CultivationBirth.test.js - 修真诞生系统测试
 * V595 Iteration 18/20 Round 24 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationBirth } from '../../../systems/ai/CultivationBirth.js';

describe('CultivationBirth', () => {
    let system;
    beforeEach(() => { system = new CultivationBirth(); });

    describe('recordBirth', () => {
        it('should record a new birth', () => {
            const { birth } = system.recordBirth({ name: 'Lingering', type: 'mortal' });
            expect(birth.name).toBe('Lingering');
            expect(birth.type).toBe('mortal');
        });

        it('should default type to mortal', () => {
            const { birth } = system.recordBirth({ name: 'X' });
            expect(birth.type).toBe('mortal');
        });

        it('should default potential to basePotential', () => {
            const { birth } = system.recordBirth({ name: 'X' });
            expect(birth.potential).toBe(20);
        });

        it('should accept custom potential', () => {
            const { birth } = system.recordBirth({ name: 'X', potential: 50 });
            expect(birth.potential).toBe(50);
        });

        it('should default level to 1 and status to newborn', () => {
            const { birth } = system.recordBirth({ name: 'X' });
            expect(birth.level).toBe(1);
            expect(birth.status).toBe('newborn');
        });

        it('should accept spirit type', () => {
            const { birth } = system.recordBirth({ name: 'Y', type: 'spirit' });
            expect(birth.type).toBe('spirit');
        });

        it('should accept divine type', () => {
            const { birth } = system.recordBirth({ name: 'Z', type: 'divine' });
            expect(birth.type).toBe('divine');
        });

        it('should accept parentId', () => {
            const { birth } = system.recordBirth({ name: 'X', parentId: 'p1' });
            expect(birth.parentId).toBe('p1');
        });

        it('should accept initial talents', () => {
            const { birth } = system.recordBirth({ name: 'X', talents: ['sword', 'fire'] });
            expect(birth.talents.length).toBe(2);
            expect(birth.talents[0]).toBe('sword');
        });

        it('should generate a unique id', () => {
            const a = system.recordBirth({});
            const b = system.recordBirth({});
            expect(a.birth.birthId).not.toBe(b.birth.birthId);
        });

        it('should accept provided id', () => {
            const { birth } = system.recordBirth({ id: 'custom_id', name: 'X' });
            expect(birth.birthId).toBe('custom_id');
        });

        it('should trigger birthRecorded hook', () => {
            let called = false;
            system.registerHook('birthRecorded', () => { called = true; });
            system.recordBirth({});
            expect(called).toBe(true);
        });

        it('should increment totalBirths', () => {
            system.recordBirth({});
            system.recordBirth({});
            expect(system.stats.totalBirths).toBe(2);
        });
    });

    describe('getBirth', () => {
        it('should return a birth by id', () => {
            const { birth } = system.recordBirth({ name: 'Lingering' });
            expect(system.getBirth(birth.birthId)).not.toBeNull();
            expect(system.getBirth(birth.birthId).name).toBe('Lingering');
        });

        it('should return null for missing', () => {
            expect(system.getBirth('ghost')).toBeNull();
        });
    });

    describe('listBirths', () => {
        it('should list all births', () => {
            system.recordBirth({ name: 'A' });
            system.recordBirth({ name: 'B' });
            expect(system.listBirths().length).toBe(2);
        });

        it('should return empty list when none', () => {
            expect(system.listBirths().length).toBe(0);
        });
    });

    describe('listByParent', () => {
        it('should filter by parentId', () => {
            system.recordBirth({ parentId: 'p1', name: 'A' });
            system.recordBirth({ parentId: 'p1', name: 'B' });
            system.recordBirth({ parentId: 'p2', name: 'C' });
            expect(system.listByParent('p1').length).toBe(2);
        });

        it('should return empty for unknown parent', () => {
            system.recordBirth({ parentId: 'p1' });
            expect(system.listByParent('ghost')).toEqual([]);
        });
    });

    describe('listAscended', () => {
        it('should return only ascended births', () => {
            const { birth } = system.recordBirth({ name: 'A' });
            system.recordBirth({ name: 'B' });
            system.ascendBirth(birth.birthId);
            const ascended = system.listAscended();
            expect(ascended.length).toBe(1);
            expect(ascended[0].birthId).toBe(birth.birthId);
        });

        it('should return empty when none ascended', () => {
            system.recordBirth({ name: 'A' });
            expect(system.listAscended().length).toBe(0);
        });
    });

    describe('addTalent', () => {
        it('should add a talent', () => {
            const { birth } = system.recordBirth({ name: 'A' });
            const result = system.addTalent(birth.birthId, 'sword');
            expect(result.success).toBe(true);
            expect(birth.talents).toContain('sword');
        });

        it('should add multiple talents', () => {
            const { birth } = system.recordBirth({ name: 'A' });
            system.addTalent(birth.birthId, 'sword');
            system.addTalent(birth.birthId, 'fire');
            expect(birth.talents.length).toBe(2);
        });

        it('should reject missing birth', () => {
            const result = system.addTalent('ghost', 'sword');
            expect(result.error).toBe('BIRTH_NOT_FOUND');
        });

        it('should trigger talentAdded hook', () => {
            const { birth } = system.recordBirth({ name: 'A' });
            let called = false;
            system.registerHook('talentAdded', () => { called = true; });
            system.addTalent(birth.birthId, 'sword');
            expect(called).toBe(true);
        });
    });

    describe('awakenPotential', () => {
        it('should awaken potential with default amount', () => {
            const { birth } = system.recordBirth({ name: 'A' });
            system.awakenPotential(birth.birthId);
            expect(birth.potential).toBe(25);
        });

        it('should awaken potential with custom amount', () => {
            const { birth } = system.recordBirth({ name: 'A' });
            system.awakenPotential(birth.birthId, 10);
            expect(birth.potential).toBe(30);
        });

        it('should reject missing birth', () => {
            const result = system.awakenPotential('ghost', 5);
            expect(result.error).toBe('BIRTH_NOT_FOUND');
        });

        it('should trigger potentialAwakened hook', () => {
            const { birth } = system.recordBirth({ name: 'A' });
            let called = false;
            system.registerHook('potentialAwakened', () => { called = true; });
            system.awakenPotential(birth.birthId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpBirth', () => {
        it('should increment level', () => {
            const { birth } = system.recordBirth({ name: 'A' });
            system.levelUpBirth(birth.birthId);
            expect(birth.level).toBe(2);
        });

        it('should change status from newborn to growing', () => {
            const { birth } = system.recordBirth({ name: 'A' });
            system.levelUpBirth(birth.birthId);
            expect(birth.status).toBe('growing');
        });

        it('should keep growing status on subsequent levelups', () => {
            const { birth } = system.recordBirth({ name: 'A' });
            system.levelUpBirth(birth.birthId);
            system.levelUpBirth(birth.birthId);
            expect(birth.status).toBe('growing');
        });

        it('should reject missing birth', () => {
            const result = system.levelUpBirth('ghost');
            expect(result.error).toBe('BIRTH_NOT_FOUND');
        });

        it('should trigger birthLeveledUp hook', () => {
            const { birth } = system.recordBirth({ name: 'A' });
            let called = false;
            system.registerHook('birthLeveledUp', () => { called = true; });
            system.levelUpBirth(birth.birthId);
            expect(called).toBe(true);
        });
    });

    describe('ascendBirth', () => {
        it('should set status to ascended', () => {
            const { birth } = system.recordBirth({ name: 'A' });
            const result = system.ascendBirth(birth.birthId);
            expect(result.success).toBe(true);
            expect(birth.status).toBe('ascended');
        });

        it('should reject missing birth', () => {
            const result = system.ascendBirth('ghost');
            expect(result.error).toBe('BIRTH_NOT_FOUND');
        });

        it('should trigger birthAscended hook', () => {
            const { birth } = system.recordBirth({ name: 'A' });
            let called = false;
            system.registerHook('birthAscended', () => { called = true; });
            system.ascendBirth(birth.birthId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBirthValue', () => {
        it('should calculate default value', () => {
            const { birth } = system.recordBirth({ name: 'A' });
            // level=1, potential=20, talents=[]: 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateBirthValue(birth.birthId)).toBe(140);
        });

        it('should include talents in calculation', () => {
            const { birth } = system.recordBirth({ name: 'A' });
            system.addTalent(birth.birthId, 'sword');
            system.addTalent(birth.birthId, 'fire');
            // 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateBirthValue(birth.birthId)).toBe(200);
        });

        it('should include level in calculation', () => {
            const { birth } = system.recordBirth({ name: 'A' });
            system.levelUpBirth(birth.birthId);
            // 2*100 + 20*2 + 0*30 = 240
            expect(system.calculateBirthValue(birth.birthId)).toBe(240);
        });

        it('should include awakened potential', () => {
            const { birth } = system.recordBirth({ name: 'A' });
            system.awakenPotential(birth.birthId, 10);
            // 1*100 + 30*2 + 0*30 = 160
            expect(system.calculateBirthValue(birth.birthId)).toBe(160);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBirthValue('ghost')).toBe(0);
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

        it('should execute default getBirth tool', () => {
            const result = system.executeTool('getBirth', { birthId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recordBirth tool', () => {
            const result = system.executeTool('recordBirth', { name: 'X' });
            expect(result.success).toBe(true);
            expect(result.result.birth.name).toBe('X');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('birthRecorded', () => count++);
            unregister();
            system.recordBirth({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('birthRecorded', () => { throw new Error('x'); });
            expect(() => system.recordBirth({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve when totalBirths >= 5', () => {
            system.stats.totalBirths = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalBirths = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recordBirth({ name: 'A' });
            const json = system.toJSON();
            expect(json.births.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recordBirth({ name: 'A' });
            const json = system.toJSON();
            const newSys = new CultivationBirth();
            newSys.fromJSON(json);
            expect(newSys.births.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.birthCount).toBe(0);
        });
    });
});
