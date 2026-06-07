/**
 * CultivationFrost.test.js - 修真霜测试
 * V798 Iteration 1/30 Round 32 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationFrost } from '../../../systems/ai/CultivationFrost.js';

describe('CultivationFrost', () => {
    let system;
    beforeEach(() => { system = new CultivationFrost(); });

    describe('recruitFrost', () => {
        it('should recruit with default values', () => {
            const { frost } = system.recruitFrost({ name: 'Frost One' });
            expect(frost.name).toBe('Frost One');
            expect(frost.type).toBe('winter');
            expect(frost.chill).toBe(20);
            expect(frost.level).toBe(1);
            expect(frost.status).toBe('novice');
        });

        it('should support different types', () => {
            const { frost: f1 } = system.recruitFrost({ type: 'alpine' });
            const { frost: f2 } = system.recruitFrost({ type: 'magical' });
            expect(f1.type).toBe('alpine');
            expect(f2.type).toBe('magical');
        });

        it('should default to winter for invalid type', () => {
            const { frost } = system.recruitFrost({ type: 'lava' });
            expect(frost.type).toBe('winter');
        });

        it('should support master assignment', () => {
            const { frost } = system.recruitFrost({ masterId: 'master_x' });
            expect(frost.masterId).toBe('master_x');
        });

        it('should reject when max reached', () => {
            const sys = new CultivationFrost({ maxFrosts: 2 });
            sys.recruitFrost({});
            sys.recruitFrost({});
            const result = sys.recruitFrost({});
            expect(result.error).toBe('MAX_FROSTS_REACHED');
        });

        it('should trigger frostRecruited hook', () => {
            let called = false;
            system.registerHook('frostRecruited', () => { called = true; });
            system.recruitFrost({});
            expect(called).toBe(true);
        });
    });

    describe('getFrost', () => {
        it('should return frost', () => {
            const { frost } = system.recruitFrost({});
            expect(system.getFrost(frost.frostId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getFrost('ghost')).toBeNull();
        });
    });

    describe('listFrosts', () => {
        it('should list all', () => {
            system.recruitFrost({});
            system.recruitFrost({});
            expect(system.listFrosts().length).toBe(2);
        });

        it('should return empty array when none', () => {
            expect(system.listFrosts()).toEqual([]);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitFrost({ masterId: 'm1' });
            system.recruitFrost({ masterId: 'm1' });
            system.recruitFrost({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should return only legendary', () => {
            const { frost } = system.recruitFrost({});
            system.legendFrost(frost.frostId);
            system.recruitFrost({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addCrystal', () => {
        it('should add a crystal', () => {
            const { frost } = system.recruitFrost({});
            const result = system.addCrystal(frost.frostId, { clarity: 25 });
            expect(result.success).toBe(true);
            expect(frost.crystals.length).toBe(1);
        });

        it('should support multiple crystals', () => {
            const { frost } = system.recruitFrost({});
            system.addCrystal(frost.frostId, { clarity: 10 });
            system.addCrystal(frost.frostId, { clarity: 20 });
            expect(frost.crystals.length).toBe(2);
        });

        it('should reject missing frost', () => {
            const result = system.addCrystal('ghost', {});
            expect(result.error).toBe('FROST_NOT_FOUND');
        });

        it('should trigger crystalAdded hook', () => {
            const { frost } = system.recruitFrost({});
            let called = false;
            system.registerHook('crystalAdded', () => { called = true; });
            system.addCrystal(frost.frostId, {});
            expect(called).toBe(true);
        });
    });

    describe('raiseChill', () => {
        it('should raise chill by default amount', () => {
            const { frost } = system.recruitFrost({});
            system.raiseChill(frost.frostId);
            expect(frost.chill).toBe(25);
        });

        it('should accept custom amount', () => {
            const { frost } = system.recruitFrost({});
            system.raiseChill(frost.frostId, 15);
            expect(frost.chill).toBe(35);
        });

        it('should reject missing frost', () => {
            const result = system.raiseChill('ghost');
            expect(result.error).toBe('FROST_NOT_FOUND');
        });

        it('should trigger chillRaised hook', () => {
            const { frost } = system.recruitFrost({});
            let called = false;
            system.registerHook('chillRaised', () => { called = true; });
            system.raiseChill(frost.frostId);
            expect(called).toBe(true);
        });
    });

    describe('levelUpFrost', () => {
        it('should increment level', () => {
            const { frost } = system.recruitFrost({});
            system.levelUpFrost(frost.frostId);
            expect(frost.level).toBe(2);
        });

        it('should set veteran at level 10', () => {
            const { frost } = system.recruitFrost({});
            for (let i = 0; i < 9; i++) system.levelUpFrost(frost.frostId);
            expect(frost.status).toBe('veteran');
        });

        it('should reject missing frost', () => {
            const result = system.levelUpFrost('ghost');
            expect(result.error).toBe('FROST_NOT_FOUND');
        });
    });

    describe('legendFrost', () => {
        it('should set legendary', () => {
            const { frost } = system.recruitFrost({});
            system.legendFrost(frost.frostId);
            expect(frost.status).toBe('legendary');
        });

        it('should reject missing frost', () => {
            const result = system.legendFrost('ghost');
            expect(result.error).toBe('FROST_NOT_FOUND');
        });

        it('should trigger frostLegendized hook', () => {
            const { frost } = system.recruitFrost({});
            let called = false;
            system.registerHook('frostLegendized', () => { called = true; });
            system.legendFrost(frost.frostId);
            expect(called).toBe(true);
        });
    });

    describe('calculateFrostValue', () => {
        it('should calculate value', () => {
            const { frost } = system.recruitFrost({});
            system.addCrystal(frost.frostId, {});
            const value = system.calculateFrostValue(frost.frostId);
            // level 1 * 100 + chill 20 * 2 + 1 crystal * 30 = 100 + 40 + 30 = 170
            expect(value).toBe(170);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateFrostValue('ghost')).toBe(0);
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

        it('should execute default getFrost', () => {
            const result = system.executeTool('getFrost', { frostId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('frostRecruited', () => count++);
            unregister();
            system.recruitFrost({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('frostRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitFrost({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient recruits', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve after threshold', () => {
            for (let i = 0; i < 5; i++) system.recruitFrost({});
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            for (let i = 0; i < 5; i++) system.recruitFrost({});
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitFrost({});
            const json = system.toJSON();
            expect(json.frosts.length).toBe(1);
        });

        it('should deserialize', () => {
            system.recruitFrost({});
            const json = system.toJSON();
            const newSys = new CultivationFrost();
            newSys.fromJSON(json);
            expect(newSys.frosts.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with counts', () => {
            const { frost } = system.recruitFrost({});
            system.legendFrost(frost.frostId);
            const stats = system.getStats();
            expect(stats.frostCount).toBe(1);
            expect(stats.legendaryCount).toBe(1);
            expect(stats.totalRecruited).toBe(1);
        });
    });
});
