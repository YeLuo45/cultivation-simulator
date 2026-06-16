/**
 * CultivationArchitect.test.js - 修真建筑师测试
 * V711 Iteration 4/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationArchitect } from '../../../systems/ai/CultivationArchitect.js';

describe('CultivationArchitect', () => {
    let system;
    beforeEach(() => { system = new CultivationArchitect(); });

    describe('recruitArchitect', () => {
        it('should recruit', () => {
            const { architect } = system.recruitArchitect({ masterId: 'm1', name: 'Jade Builder', type: 'jade' });
            expect(architect.masterId).toBe('m1');
            expect(architect.name).toBe('Jade Builder');
            expect(architect.type).toBe('jade');
        });

        it('should trigger architectRecruited hook', () => {
            let called = false;
            system.registerHook('architectRecruited', () => { called = true; });
            system.recruitArchitect({});
            expect(called).toBe(true);
        });

        it('should set default status to novice', () => {
            const { architect } = system.recruitArchitect({});
            expect(architect.status).toBe('novice');
        });

        it('should set default designing to baseDesigning', () => {
            const { architect } = system.recruitArchitect({});
            expect(architect.designing).toBe(20);
        });

        it('should set default structures to empty array', () => {
            const { architect } = system.recruitArchitect({});
            expect(architect.structures).toEqual([]);
        });

        it('should set default level to 1', () => {
            const { architect } = system.recruitArchitect({});
            expect(architect.level).toBe(1);
        });

        it('should set default type to jade', () => {
            const { architect } = system.recruitArchitect({});
            expect(architect.type).toBe('jade');
        });

        it('should set createdAt timestamp', () => {
            const { architect } = system.recruitArchitect({});
            expect(typeof architect.createdAt).toBe('number');
        });

        it('should generate architectId', () => {
            const { architect } = system.recruitArchitect({});
            expect(architect.architectId).toBeTruthy();
        });

        it('should increment totalArchitects', () => {
            system.recruitArchitect({});
            system.recruitArchitect({});
            expect(system.stats.totalArchitects).toBe(2);
        });

        it('should accept wood type', () => {
            const { architect } = system.recruitArchitect({ type: 'wood' });
            expect(architect.type).toBe('wood');
        });

        it('should accept stone type', () => {
            const { architect } = system.recruitArchitect({ type: 'stone' });
            expect(architect.type).toBe('stone');
        });

        it('should use custom id when provided', () => {
            const { architect } = system.recruitArchitect({ id: 'custom-id' });
            expect(architect.architectId).toBe('custom-id');
        });

        it('should respect custom designing value', () => {
            const { architect } = system.recruitArchitect({ designing: 50 });
            expect(architect.designing).toBe(50);
        });

        it('should respect custom structures value', () => {
            const { architect } = system.recruitArchitect({ structures: ['temple'] });
            expect(architect.structures).toEqual(['temple']);
        });
    });

    describe('getArchitect', () => {
        it('should return', () => {
            const { architect } = system.recruitArchitect({});
            expect(system.getArchitect(architect.architectId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getArchitect('ghost')).toBeNull(); });
        it('should return copy not reference', () => {
            const { architect } = system.recruitArchitect({});
            const a = system.getArchitect(architect.architectId);
            a.name = 'modified';
            expect(system.architects.get(architect.architectId).name).not.toBe('modified');
        });
    });

    describe('listArchitects', () => {
        it('should list all', () => {
            system.recruitArchitect({});
            system.recruitArchitect({});
            expect(system.listArchitects().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listArchitects().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitArchitect({ masterId: 'm1' });
            system.recruitArchitect({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty when none match', () => {
            system.recruitArchitect({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });

        it('should return multiple for same master', () => {
            system.recruitArchitect({ masterId: 'm1' });
            system.recruitArchitect({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { architect } = system.recruitArchitect({});
            system.legendArchitect(architect.architectId);
            system.recruitArchitect({});
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitArchitect({});
            expect(system.listLegendary().length).toBe(0);
        });

        it('should return multiple when several legendary', () => {
            const { architect: a1 } = system.recruitArchitect({});
            const { architect: a2 } = system.recruitArchitect({});
            system.legendArchitect(a1.architectId);
            system.legendArchitect(a2.architectId);
            expect(system.listLegendary().length).toBe(2);
        });
    });

    describe('addStructure', () => {
        it('should add structure', () => {
            const { architect } = system.recruitArchitect({});
            system.addStructure(architect.architectId, 'celestial palace');
            expect(architect.structures.length).toBe(1);
            expect(architect.structures[0]).toBe('celestial palace');
        });

        it('should add multiple structures', () => {
            const { architect } = system.recruitArchitect({});
            system.addStructure(architect.architectId, 'celestial palace');
            system.addStructure(architect.architectId, 'dragon tower');
            expect(architect.structures.length).toBe(2);
        });

        it('should change status to veteran on first structure', () => {
            const { architect } = system.recruitArchitect({});
            system.addStructure(architect.architectId, 'celestial palace');
            expect(architect.status).toBe('veteran');
        });

        it('should not downgrade legendary status', () => {
            const { architect } = system.recruitArchitect({});
            system.legendArchitect(architect.architectId);
            system.addStructure(architect.architectId, 'celestial palace');
            expect(architect.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.addStructure('ghost', 'celestial palace');
            expect(result.error).toBe('ARCHITECT_NOT_FOUND');
        });

        it('should trigger structureAdded hook', () => {
            const { architect } = system.recruitArchitect({});
            let called = false;
            system.registerHook('structureAdded', () => { called = true; });
            system.addStructure(architect.architectId, 'celestial palace');
            expect(called).toBe(true);
        });

        it('should pass structure and count in hook data', () => {
            const { architect } = system.recruitArchitect({});
            let data = null;
            system.registerHook('structureAdded', (d) => { data = d; });
            system.addStructure(architect.architectId, 'celestial palace');
            expect(data.structure).toBe('celestial palace');
            expect(data.structureCount).toBe(1);
        });
    });

    describe('raiseDesigning', () => {
        it('should raise designing by default', () => {
            const { architect } = system.recruitArchitect({});
            system.raiseDesigning(architect.architectId);
            expect(architect.designing).toBe(25);
        });

        it('should raise designing by amount', () => {
            const { architect } = system.recruitArchitect({});
            system.raiseDesigning(architect.architectId, 10);
            expect(architect.designing).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raiseDesigning('ghost', 10);
            expect(result.error).toBe('ARCHITECT_NOT_FOUND');
        });

        it('should trigger designingRaised hook', () => {
            const { architect } = system.recruitArchitect({});
            let called = false;
            system.registerHook('designingRaised', () => { called = true; });
            system.raiseDesigning(architect.architectId, 10);
            expect(called).toBe(true);
        });

        it('should accumulate multiple raises', () => {
            const { architect } = system.recruitArchitect({});
            system.raiseDesigning(architect.architectId, 10);
            system.raiseDesigning(architect.architectId, 15);
            expect(architect.designing).toBe(45);
        });
    });

    describe('levelUpArchitect', () => {
        it('should level up', () => {
            const { architect } = system.recruitArchitect({});
            system.levelUpArchitect(architect.architectId);
            expect(architect.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { architect } = system.recruitArchitect({});
            system.levelUpArchitect(architect.architectId);
            system.levelUpArchitect(architect.architectId);
            system.levelUpArchitect(architect.architectId);
            expect(architect.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpArchitect('ghost');
            expect(result.error).toBe('ARCHITECT_NOT_FOUND');
        });

        it('should trigger architectLeveledUp hook', () => {
            const { architect } = system.recruitArchitect({});
            let called = false;
            system.registerHook('architectLeveledUp', () => { called = true; });
            system.levelUpArchitect(architect.architectId);
            expect(called).toBe(true);
        });
    });

    describe('legendArchitect', () => {
        it('should mark as legendary', () => {
            const { architect } = system.recruitArchitect({});
            system.legendArchitect(architect.architectId);
            expect(architect.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendArchitect('ghost');
            expect(result.error).toBe('ARCHITECT_NOT_FOUND');
        });

        it('should trigger architectLegendized hook', () => {
            const { architect } = system.recruitArchitect({});
            let called = false;
            system.registerHook('architectLegendized', () => { called = true; });
            system.legendArchitect(architect.architectId);
            expect(called).toBe(true);
        });

        it('should work after veteran status', () => {
            const { architect } = system.recruitArchitect({});
            system.addStructure(architect.architectId, 'celestial palace');
            expect(architect.status).toBe('veteran');
            system.legendArchitect(architect.architectId);
            expect(architect.status).toBe('legendary');
        });
    });

    describe('calculateArchitectValue', () => {
        it('should calculate', () => {
            const { architect } = system.recruitArchitect({});
            // level=1, designing=20, structures=0: 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateArchitectValue(architect.architectId)).toBe(140);
        });

        it('should calculate with structures', () => {
            const { architect } = system.recruitArchitect({});
            system.addStructure(architect.architectId, 'celestial palace');
            system.addStructure(architect.architectId, 'dragon tower');
            // level=1, designing=20, structures=2: 100 + 40 + 60 = 200
            expect(system.calculateArchitectValue(architect.architectId)).toBe(200);
        });

        it('should calculate with level up and designing raised', () => {
            const { architect } = system.recruitArchitect({});
            system.levelUpArchitect(architect.architectId);
            system.levelUpArchitect(architect.architectId);
            system.raiseDesigning(architect.architectId, 30);
            // level=3, designing=50, structures=0: 300 + 100 + 0 = 400
            expect(system.calculateArchitectValue(architect.architectId)).toBe(400);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateArchitectValue('ghost')).toBe(0);
        });

        it('should calculate with all factors combined', () => {
            const { architect } = system.recruitArchitect({});
            system.levelUpArchitect(architect.architectId);
            system.raiseDesigning(architect.architectId, 10);
            system.addStructure(architect.architectId, 'celestial palace');
            // level=2, designing=30, structures=1: 200 + 60 + 30 = 290
            expect(system.calculateArchitectValue(architect.architectId)).toBe(290);
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

        it('should execute default getArchitect', () => {
            const result = system.executeTool('getArchitect', { architectId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should list default tools', () => {
            const tools = system.listTools();
            expect(tools).toContain('getArchitect');
            expect(tools).toContain('recruitArchitect');
        });

        it('should execute default recruitArchitect', () => {
            const result = system.executeTool('recruitArchitect', { masterId: 'm1', name: 'Test' });
            expect(result.result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('architectRecruited', () => count++);
            unregister();
            system.recruitArchitect({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('architectRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitArchitect({})).not.toThrow();
        });

        it('should support multiple handlers', () => {
            let a = 0, b = 0;
            system.registerHook('architectRecruited', () => a++);
            system.registerHook('architectRecruited', () => b++);
            system.recruitArchitect({});
            expect(a).toBe(1);
            expect(b).toBe(1);
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalArchitects = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalArchitects = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should increase maxArchitects', () => {
            const oldMax = system.config.maxArchitects;
            system.stats.totalArchitects = 10;
            system.autoEvolve();
            expect(system.config.maxArchitects).toBe(oldMax + 30);
        });
        it('should trigger systemEvolved hook', () => {
            let called = false;
            system.registerHook('systemEvolved', () => { called = true; });
            system.stats.totalArchitects = 10;
            system.autoEvolve();
            expect(called).toBe(true);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitArchitect({});
            const json = system.toJSON();
            expect(json.architects.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitArchitect({});
            const json = system.toJSON();
            const newSys = new CultivationArchitect();
            newSys.fromJSON(json);
            expect(newSys.architects.size).toBe(1);
        });
        it('should preserve stats on serialize', () => {
            system.recruitArchitect({});
            const json = system.toJSON();
            expect(json.stats.totalArchitects).toBe(1);
        });
        it('should preserve config on serialize', () => {
            const json = system.toJSON();
            expect(json.config.maxArchitects).toBe(20);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.architectCount).toBe(0);
        });
        it('should reflect architect count', () => {
            system.recruitArchitect({});
            system.recruitArchitect({});
            const stats = system.getStats();
            expect(stats.architectCount).toBe(2);
        });
    });
});
