/**
 * CultivationMud.test.js - 修真泥系统测试
 * V846 Iteration 19/30 Round 33 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMud } from '../../../systems/ai/CultivationMud.js';

describe('CultivationMud', () => {
    let system;
    beforeEach(() => { system = new CultivationMud(); });

    describe('recruitMud', () => {
        it('should create', () => {
            const { mud } = system.recruitMud({ masterId: 'm1', name: 'Ooze', type: 'swamp' });
            expect(mud.masterId).toBe('m1');
            expect(mud.name).toBe('Ooze');
            expect(mud.type).toBe('swamp');
        });

        it('should default type to river and use baseViscosity', () => {
            const { mud } = system.recruitMud({});
            expect(mud.type).toBe('river');
            expect(mud.viscosity).toBe(20);
            expect(mud.status).toBe('novice');
            expect(mud.level).toBe(1);
            expect(mud.footprints).toEqual([]);
        });

        it('should accept custom viscosity and footprints', () => {
            const { mud } = system.recruitMud({ viscosity: 50, footprints: ['boot', 'paw'] });
            expect(mud.viscosity).toBe(50);
            expect(mud.footprints.length).toBe(2);
        });

        it('should trigger mudRecruited hook', () => {
            let called = false;
            system.registerHook('mudRecruited', () => { called = true; });
            system.recruitMud({});
            expect(called).toBe(true);
        });

        it('should reject when at maxMuds', () => {
            const small = new CultivationMud({ maxMuds: 1 });
            small.recruitMud({});
            const result = small.recruitMud({});
            expect(result.error).toBe('MAX_MUDS_REACHED');
        });
    });

    describe('getMud', () => {
        it('should return', () => {
            const { mud } = system.recruitMud({});
            expect(system.getMud(mud.mudId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMud('ghost')).toBeNull(); });
    });

    describe('listMuds', () => {
        it('should list all', () => {
            system.recruitMud({});
            system.recruitMud({});
            expect(system.listMuds().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitMud({ masterId: 'm1' });
            system.recruitMud({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { mud: a } = system.recruitMud({});
            const { mud: b } = system.recruitMud({});
            system.legendMud(a.mudId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addFootprint', () => {
        it('should add', () => {
            const { mud } = system.recruitMud({});
            system.addFootprint(mud.mudId, 'tiger-paw');
            expect(mud.footprints.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addFootprint('ghost', 'x');
            expect(result.error).toBe('MUD_NOT_FOUND');
        });

        it('should trigger footprintAdded hook', () => {
            const { mud } = system.recruitMud({});
            let called = false;
            system.registerHook('footprintAdded', () => { called = true; });
            system.addFootprint(mud.mudId, 'ginseng-print');
            expect(called).toBe(true);
        });
    });

    describe('raiseViscosity', () => {
        it('should raise with custom amount', () => {
            const { mud } = system.recruitMud({});
            system.raiseViscosity(mud.mudId, 10);
            expect(mud.viscosity).toBe(30);
        });

        it('should default amount to 5', () => {
            const { mud } = system.recruitMud({});
            system.raiseViscosity(mud.mudId);
            expect(mud.viscosity).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseViscosity('ghost', 5);
            expect(result.error).toBe('MUD_NOT_FOUND');
        });

        it('should trigger viscosityRaised hook', () => {
            const { mud } = system.recruitMud({});
            let called = false;
            system.registerHook('viscosityRaised', () => { called = true; });
            system.raiseViscosity(mud.mudId, 3);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMud', () => {
        it('should level up', () => {
            const { mud } = system.recruitMud({});
            system.levelUpMud(mud.mudId);
            expect(mud.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpMud('ghost');
            expect(result.error).toBe('MUD_NOT_FOUND');
        });

        it('should trigger mudLeveledUp hook', () => {
            const { mud } = system.recruitMud({});
            let called = false;
            system.registerHook('mudLeveledUp', () => { called = true; });
            system.levelUpMud(mud.mudId);
            expect(called).toBe(true);
        });
    });

    describe('legendMud', () => {
        it('should legendize', () => {
            const { mud } = system.recruitMud({});
            system.legendMud(mud.mudId);
            expect(mud.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendMud('ghost');
            expect(result.error).toBe('MUD_NOT_FOUND');
        });

        it('should trigger mudLegendized hook', () => {
            const { mud } = system.recruitMud({});
            let called = false;
            system.registerHook('mudLegendized', () => { called = true; });
            system.legendMud(mud.mudId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMudValue', () => {
        it('should calculate', () => {
            const { mud } = system.recruitMud({ level: 2, viscosity: 30 });
            system.addFootprint(mud.mudId, 'a');
            system.addFootprint(mud.mudId, 'b');
            // level*100 + viscosity*2 + footprints*30 = 200 + 60 + 60 = 320
            expect(system.calculateMudValue(mud.mudId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMudValue('ghost')).toBe(0);
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

        it('should execute default getMud', () => {
            const result = system.executeTool('getMud', { mudId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('mudRecruited', () => count++);
            unregister();
            system.recruitMud({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('mudRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitMud({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMuds = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMuds = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitMud({});
            const json = system.toJSON();
            expect(json.muds.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitMud({});
            const json = system.toJSON();
            const newSys = new CultivationMud();
            newSys.fromJSON(json);
            expect(newSys.muds.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.mudCount).toBe(0);
        });
    });
});
