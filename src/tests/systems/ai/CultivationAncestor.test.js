/**
 * CultivationAncestor.test.js - 修真祖先测试
 * V667 Iteration 20/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationAncestor } from '../../../systems/ai/CultivationAncestor.js';

describe('CultivationAncestor', () => {
    let system;
    beforeEach(() => { system = new CultivationAncestor(); });

    describe('recruitAncestor', () => {
        it('should create with lineage and name', () => {
            const { ancestor } = system.recruitAncestor({ lineageId: 'l1', name: 'Dragon Ancestor' });
            expect(ancestor.lineageId).toBe('l1');
            expect(ancestor.name).toBe('Dragon Ancestor');
        });

        it('should default name to "Unnamed Ancestor"', () => {
            const { ancestor } = system.recruitAncestor({});
            expect(ancestor.name).toBe('Unnamed Ancestor');
        });

        it('should default type to "ancient"', () => {
            const { ancestor } = system.recruitAncestor({});
            expect(ancestor.type).toBe('ancient');
        });

        it('should default bloodline to 20', () => {
            const { ancestor } = system.recruitAncestor({});
            expect(ancestor.bloodline).toBe(20);
        });

        it('should default level to 1', () => {
            const { ancestor } = system.recruitAncestor({});
            expect(ancestor.level).toBe(1);
        });

        it('should default status to "novice"', () => {
            const { ancestor } = system.recruitAncestor({});
            expect(ancestor.status).toBe('novice');
        });

        it('should use provided id', () => {
            const { ancestor } = system.recruitAncestor({ id: 'my_ancestor' });
            expect(ancestor.ancestorId).toBe('my_ancestor');
        });

        it('should start with empty arts array', () => {
            const { ancestor } = system.recruitAncestor({});
            expect(ancestor.arts).toEqual([]);
        });

        it('should copy provided arts', () => {
            const { ancestor } = system.recruitAncestor({ arts: ['fireball', 'heal'] });
            expect(ancestor.arts).toEqual(['fireball', 'heal']);
        });

        it('should accept primordial type', () => {
            const { ancestor } = system.recruitAncestor({ type: 'primordial' });
            expect(ancestor.type).toBe('primordial');
        });

        it('should accept eternal type', () => {
            const { ancestor } = system.recruitAncestor({ type: 'eternal' });
            expect(ancestor.type).toBe('eternal');
        });

        it('should trigger ancestorRecruited hook', () => {
            let called = false;
            system.registerHook('ancestorRecruited', () => { called = true; });
            system.recruitAncestor({});
            expect(called).toBe(true);
        });

        it('should respect config baseBloodline', () => {
            const custom = new CultivationAncestor({ baseBloodline: 50 });
            const { ancestor } = custom.recruitAncestor({});
            expect(ancestor.bloodline).toBe(50);
        });

        it('should respect provided bloodline', () => {
            const { ancestor } = system.recruitAncestor({ bloodline: 100 });
            expect(ancestor.bloodline).toBe(100);
        });
    });

    describe('getAncestor', () => {
        it('should return ancestor', () => {
            const { ancestor } = system.recruitAncestor({});
            expect(system.getAncestor(ancestor.ancestorId)).not.toBeNull();
        });

        it('should return a copy with arts array', () => {
            const { ancestor } = system.recruitAncestor({});
            const got = system.getAncestor(ancestor.ancestorId);
            expect(got.arts).toEqual([]);
        });

        it('should return null for missing', () => {
            expect(system.getAncestor('ghost')).toBeNull();
        });
    });

    describe('listAncestors', () => {
        it('should list all', () => {
            system.recruitAncestor({});
            system.recruitAncestor({});
            expect(system.listAncestors().length).toBe(2);
        });

        it('should return empty when no ancestors', () => {
            expect(system.listAncestors().length).toBe(0);
        });
    });

    describe('listByLineage', () => {
        it('should filter by lineage', () => {
            system.recruitAncestor({ lineageId: 'l1' });
            system.recruitAncestor({ lineageId: 'l2' });
            expect(system.listByLineage('l1').length).toBe(1);
        });

        it('should return empty for unknown lineage', () => {
            system.recruitAncestor({ lineageId: 'l1' });
            expect(system.listByLineage('ghost').length).toBe(0);
        });

        it('should return multiple from same lineage', () => {
            system.recruitAncestor({ lineageId: 'l1' });
            system.recruitAncestor({ lineageId: 'l1' });
            system.recruitAncestor({ lineageId: 'l2' });
            expect(system.listByLineage('l1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should filter by legendary status', () => {
            const { ancestor } = system.recruitAncestor({});
            system.legendAncestor(ancestor.ancestorId);
            system.recruitAncestor({});
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitAncestor({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addArt', () => {
        it('should add art to ancestor', () => {
            const { ancestor } = system.recruitAncestor({});
            system.addArt(ancestor.ancestorId, 'fireball');
            expect(ancestor.arts).toContain('fireball');
        });

        it('should add multiple arts', () => {
            const { ancestor } = system.recruitAncestor({});
            system.addArt(ancestor.ancestorId, 'fireball');
            system.addArt(ancestor.ancestorId, 'heal');
            expect(ancestor.arts.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addArt('ghost', 'fireball');
            expect(result.error).toBe('ANCESTOR_NOT_FOUND');
        });

        it('should trigger artAdded hook', () => {
            const { ancestor } = system.recruitAncestor({});
            let called = false;
            system.registerHook('artAdded', () => { called = true; });
            system.addArt(ancestor.ancestorId, 'fireball');
            expect(called).toBe(true);
        });
    });

    describe('strengthenBloodline', () => {
        it('should increase bloodline', () => {
            const { ancestor } = system.recruitAncestor({});
            system.strengthenBloodline(ancestor.ancestorId, 10);
            expect(ancestor.bloodline).toBe(30);
        });

        it('should use default amount of 5', () => {
            const { ancestor } = system.recruitAncestor({});
            system.strengthenBloodline(ancestor.ancestorId);
            expect(ancestor.bloodline).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.strengthenBloodline('ghost', 10);
            expect(result.error).toBe('ANCESTOR_NOT_FOUND');
        });

        it('should trigger bloodlineStrengthened hook', () => {
            const { ancestor } = system.recruitAncestor({});
            let called = false;
            system.registerHook('bloodlineStrengthened', () => { called = true; });
            system.strengthenBloodline(ancestor.ancestorId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpAncestor', () => {
        it('should increase level', () => {
            const { ancestor } = system.recruitAncestor({});
            system.levelUpAncestor(ancestor.ancestorId);
            expect(ancestor.level).toBe(2);
        });

        it('should support multiple level ups', () => {
            const { ancestor } = system.recruitAncestor({});
            system.levelUpAncestor(ancestor.ancestorId);
            system.levelUpAncestor(ancestor.ancestorId);
            system.levelUpAncestor(ancestor.ancestorId);
            expect(ancestor.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpAncestor('ghost');
            expect(result.error).toBe('ANCESTOR_NOT_FOUND');
        });

        it('should trigger ancestorLeveledUp hook', () => {
            const { ancestor } = system.recruitAncestor({});
            let called = false;
            system.registerHook('ancestorLeveledUp', () => { called = true; });
            system.levelUpAncestor(ancestor.ancestorId);
            expect(called).toBe(true);
        });
    });

    describe('legendAncestor', () => {
        it('should set status to legendary', () => {
            const { ancestor } = system.recruitAncestor({});
            system.legendAncestor(ancestor.ancestorId);
            expect(ancestor.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendAncestor('ghost');
            expect(result.error).toBe('ANCESTOR_NOT_FOUND');
        });

        it('should trigger ancestorLegendized hook', () => {
            const { ancestor } = system.recruitAncestor({});
            let called = false;
            system.registerHook('ancestorLegendized', () => { called = true; });
            system.legendAncestor(ancestor.ancestorId);
            expect(called).toBe(true);
        });
    });

    describe('calculateAncestorValue', () => {
        it('should calculate with default values', () => {
            // level=1, bloodline=20, arts=0 => 100+40+0=140
            const { ancestor } = system.recruitAncestor({});
            expect(system.calculateAncestorValue(ancestor.ancestorId)).toBe(140);
        });

        it('should include level', () => {
            // level=3, bloodline=20, arts=0 => 300+40+0=340
            const { ancestor } = system.recruitAncestor({ level: 3 });
            expect(system.calculateAncestorValue(ancestor.ancestorId)).toBe(340);
        });

        it('should include bloodline', () => {
            // level=1, bloodline=50, arts=0 => 100+100+0=200
            const { ancestor } = system.recruitAncestor({ bloodline: 50 });
            expect(system.calculateAncestorValue(ancestor.ancestorId)).toBe(200);
        });

        it('should include arts count', () => {
            // level=1, bloodline=20, arts=2 => 100+40+60=200
            const { ancestor } = system.recruitAncestor({ arts: ['fire', 'ice'] });
            expect(system.calculateAncestorValue(ancestor.ancestorId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateAncestorValue('ghost')).toBe(0);
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

        it('should execute default getAncestor', () => {
            const result = system.executeTool('getAncestor', { ancestorId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('ancestorRecruited', () => count++);
            unregister();
            system.recruitAncestor({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('ancestorRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitAncestor({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalAncestors = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalAncestors = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitAncestor({});
            const json = system.toJSON();
            expect(json.ancestors.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitAncestor({});
            const json = system.toJSON();
            const newSys = new CultivationAncestor();
            newSys.fromJSON(json);
            expect(newSys.ancestors.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.ancestorCount).toBe(0);
        });
    });
});
