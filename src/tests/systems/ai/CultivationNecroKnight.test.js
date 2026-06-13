/**
 * CultivationNecroKnight.test.js - 修真死骑测试
 * V623 Iteration 6/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationNecroKnight } from '../../../systems/ai/CultivationNecroKnight.js';

describe('CultivationNecroKnight', () => {
    let system;
    beforeEach(() => { system = new CultivationNecroKnight(); });

    describe('recruitNecroKnight', () => {
        it('should recruit with full data', () => {
            const { necroknight } = system.recruitNecroKnight({ masterId: 'm1', name: 'Bone Reaper', type: 'skeleton' });
            expect(necroknight.masterId).toBe('m1');
            expect(necroknight.name).toBe('Bone Reaper');
            expect(necroknight.type).toBe('skeleton');
            expect(necroknight.undeath).toBe(20);
            expect(necroknight.level).toBe(1);
            expect(necroknight.status).toBe('novice');
            expect(necroknight.steeds).toEqual([]);
        });

        it('should use defaults when not provided', () => {
            const { necroknight } = system.recruitNecroKnight({});
            expect(necroknight.name).toBe('Anonymous Necro Knight');
            expect(necroknight.type).toBe('skeleton');
        });

        it('should use provided undeath', () => {
            const { necroknight } = system.recruitNecroKnight({ undeath: 80 });
            expect(necroknight.undeath).toBe(80);
        });

        it('should use provided steeds', () => {
            const { necroknight } = system.recruitNecroKnight({ steeds: ['Nightmare'] });
            expect(necroknight.steeds).toEqual(['Nightmare']);
        });

        it('should use provided necroId', () => {
            const { necroknight } = system.recruitNecroKnight({ necroId: 'nkt_xyz' });
            expect(necroknight.necroId).toBe('nkt_xyz');
        });

        it('should trigger necroKnightRecruited hook', () => {
            let called = false;
            system.registerHook('necroKnightRecruited', () => { called = true; });
            system.recruitNecroKnight({});
            expect(called).toBe(true);
        });

        it('should increment totalNecroKnights stat', () => {
            system.recruitNecroKnight({});
            system.recruitNecroKnight({});
            expect(system.stats.totalNecroKnights).toBe(2);
        });

        it('should respect max cap', () => {
            system.config.maxNecroKnights = 2;
            system.recruitNecroKnight({});
            system.recruitNecroKnight({});
            const result = system.recruitNecroKnight({});
            expect(result.success).toBe(false);
            expect(result.error).toBe('MAX_NECROKNIGHTS_REACHED');
        });
    });

    describe('getNecroKnight', () => {
        it('should return existing', () => {
            const { necroknight } = system.recruitNecroKnight({});
            expect(system.getNecroKnight(necroknight.necroId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getNecroKnight('ghost')).toBeNull(); });
        it('should return a copy (not internal reference)', () => {
            const { necroknight } = system.recruitNecroKnight({});
            const retrieved = system.getNecroKnight(necroknight.necroId);
            retrieved.name = 'Modified';
            expect(system.necroknights.get(necroknight.necroId).name).toBe('Anonymous Necro Knight');
        });
    });

    describe('listNecroKnights', () => {
        it('should list all', () => {
            system.recruitNecroKnight({});
            system.recruitNecroKnight({});
            expect(system.listNecroKnights().length).toBe(2);
        });
        it('should return empty array when none', () => {
            expect(system.listNecroKnights()).toEqual([]);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitNecroKnight({ masterId: 'm1' });
            system.recruitNecroKnight({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
        it('should return empty for unknown master', () => {
            system.recruitNecroKnight({ masterId: 'm1' });
            expect(system.listByMaster('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { necroknight } = system.recruitNecroKnight({});
            system.legendNecroKnight(necroknight.necroId);
            system.recruitNecroKnight({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addSteed', () => {
        it('should add steed', () => {
            const { necroknight } = system.recruitNecroKnight({});
            system.addSteed(necroknight.necroId, 'Nightmare');
            expect(necroknight.steeds).toContain('Nightmare');
            expect(necroknight.steeds.length).toBe(1);
        });

        it('should add multiple steeds', () => {
            const { necroknight } = system.recruitNecroKnight({});
            system.addSteed(necroknight.necroId, 'Nightmare');
            system.addSteed(necroknight.necroId, 'Hellhound');
            expect(necroknight.steeds.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addSteed('ghost', 'Pegasus');
            expect(result.error).toBe('NECROKNIGHT_NOT_FOUND');
        });

        it('should trigger steedAdded hook', () => {
            const { necroknight } = system.recruitNecroKnight({});
            let called = false;
            system.registerHook('steedAdded', () => { called = true; });
            system.addSteed(necroknight.necroId, 'Undead Steed');
            expect(called).toBe(true);
        });
    });

    describe('gainUndeath', () => {
        it('should gain with amount', () => {
            const { necroknight } = system.recruitNecroKnight({});
            system.gainUndeath(necroknight.necroId, 15);
            expect(necroknight.undeath).toBe(35);
        });

        it('should gain with default amount', () => {
            const { necroknight } = system.recruitNecroKnight({});
            system.gainUndeath(necroknight.necroId);
            expect(necroknight.undeath).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.gainUndeath('ghost', 10);
            expect(result.error).toBe('NECROKNIGHT_NOT_FOUND');
        });

        it('should trigger undeathGained hook', () => {
            const { necroknight } = system.recruitNecroKnight({});
            let called = false;
            system.registerHook('undeathGained', () => { called = true; });
            system.gainUndeath(necroknight.necroId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpNecroKnight', () => {
        it('should level up', () => {
            const { necroknight } = system.recruitNecroKnight({});
            system.levelUpNecroKnight(necroknight.necroId);
            expect(necroknight.level).toBe(2);
        });

        it('should promote to veteran at level 5', () => {
            const { necroknight } = system.recruitNecroKnight({});
            for (let i = 0; i < 4; i++) system.levelUpNecroKnight(necroknight.necroId);
            expect(necroknight.level).toBe(5);
            expect(necroknight.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.levelUpNecroKnight('ghost');
            expect(result.error).toBe('NECROKNIGHT_NOT_FOUND');
        });

        it('should trigger necroKnightLeveledUp hook', () => {
            const { necroknight } = system.recruitNecroKnight({});
            let called = false;
            system.registerHook('necroKnightLeveledUp', () => { called = true; });
            system.levelUpNecroKnight(necroknight.necroId);
            expect(called).toBe(true);
        });
    });

    describe('legendNecroKnight', () => {
        it('should legendize', () => {
            const { necroknight } = system.recruitNecroKnight({});
            system.legendNecroKnight(necroknight.necroId);
            expect(necroknight.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendNecroKnight('ghost');
            expect(result.error).toBe('NECROKNIGHT_NOT_FOUND');
        });

        it('should trigger necroKnightLegendized hook', () => {
            const { necroknight } = system.recruitNecroKnight({});
            let called = false;
            system.registerHook('necroKnightLegendized', () => { called = true; });
            system.legendNecroKnight(necroknight.necroId);
            expect(called).toBe(true);
        });
    });

    describe('calculateNecroKnightValue', () => {
        it('should calculate', () => {
            const { necroknight } = system.recruitNecroKnight({});
            system.levelUpNecroKnight(necroknight.necroId);
            system.gainUndeath(necroknight.necroId, 5);
            system.addSteed(necroknight.necroId, 'Nightmare');
            // level=2, undeath=25, steeds.length=1 => 2*100 + 25*2 + 1*30 = 200+50+30 = 280
            expect(system.calculateNecroKnightValue(necroknight.necroId)).toBe(280);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateNecroKnightValue('ghost')).toBe(0);
        });

        it('should return base value for new necroknight', () => {
            const { necroknight } = system.recruitNecroKnight({});
            // level=1, undeath=20, steeds.length=0 => 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateNecroKnightValue(necroknight.necroId)).toBe(140);
        });
    });

    describe('listVeterans', () => {
        it('should filter veterans', () => {
            const { necroknight } = system.recruitNecroKnight({});
            for (let i = 0; i < 4; i++) system.levelUpNecroKnight(necroknight.necroId);
            system.recruitNecroKnight({});
            expect(system.listVeterans().length).toBe(1);
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

        it('should execute default getNecroKnight', () => {
            const result = system.executeTool('getNecroKnight', { necroId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('necroKnightRecruited', () => count++);
            unregister();
            system.recruitNecroKnight({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('necroKnightRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitNecroKnight({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalNecroKnights = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalNecroKnights = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitNecroKnight({});
            const json = system.toJSON();
            expect(json.necroknights.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitNecroKnight({});
            const json = system.toJSON();
            const newSys = new CultivationNecroKnight();
            newSys.fromJSON(json);
            expect(newSys.necroknights.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.necroknightCount).toBe(0);
        });
    });

    describe('Constructor', () => {
        it('should accept custom config', () => {
            const sys = new CultivationNecroKnight({ maxNecroKnights: 10, baseUndeath: 50 });
            expect(sys.config.maxNecroKnights).toBe(10);
            expect(sys.config.baseUndeath).toBe(50);
        });
    });
});
