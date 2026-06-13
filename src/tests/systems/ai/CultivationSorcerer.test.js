/**
 * CultivationSorcerer.test.js - 修真术士系统测试
 * V625 Iteration 8/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSorcerer } from '../../../systems/ai/CultivationSorcerer.js';

describe('CultivationSorcerer', () => {
    let system;
    beforeEach(() => { system = new CultivationSorcerer(); });

    describe('recruitSorcerer', () => {
        it('should recruit with given fields', () => {
            const { sorcerer } = system.recruitSorcerer({ masterId: 'm1', name: 'Storm Caster', type: 'storm' });
            expect(sorcerer.masterId).toBe('m1');
            expect(sorcerer.name).toBe('Storm Caster');
            expect(sorcerer.type).toBe('storm');
        });

        it('should default type to storm and arcane to 20', () => {
            const { sorcerer } = system.recruitSorcerer({ masterId: 'm1' });
            expect(sorcerer.type).toBe('storm');
            expect(sorcerer.arcane).toBe(20);
            expect(sorcerer.level).toBe(1);
            expect(sorcerer.status).toBe('novice');
            expect(sorcerer.spells).toEqual([]);
        });

        it('should generate a sorcererId when not provided', () => {
            const { sorcerer } = system.recruitSorcerer({});
            expect(sorcerer.sorcererId).toBeTruthy();
            expect(typeof sorcerer.sorcererId).toBe('string');
        });

        it('should trigger sorcererRecruited hook', () => {
            let called = false;
            system.registerHook('sorcererRecruited', () => { called = true; });
            system.recruitSorcerer({});
            expect(called).toBe(true);
        });
    });

    describe('getSorcerer', () => {
        it('should return sorcerer copy', () => {
            const { sorcerer } = system.recruitSorcerer({});
            const found = system.getSorcerer(sorcerer.sorcererId);
            expect(found).not.toBeNull();
            expect(found.sorcererId).toBe(sorcerer.sorcererId);
        });
        it('should return null for missing', () => { expect(system.getSorcerer('ghost')).toBeNull(); });
    });

    describe('listSorcerers', () => {
        it('should list all sorcerers', () => {
            system.recruitSorcerer({});
            system.recruitSorcerer({});
            system.recruitSorcerer({});
            expect(system.listSorcerers().length).toBe(3);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitSorcerer({ masterId: 'm1' });
            system.recruitSorcerer({ masterId: 'm2' });
            system.recruitSorcerer({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
            expect(system.listByMaster('m2').length).toBe(1);
            expect(system.listByMaster('m3').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary sorcerers', () => {
            const { sorcerer: a } = system.recruitSorcerer({});
            const { sorcerer: b } = system.recruitSorcerer({});
            system.legendSorcerer(a.sorcererId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].sorcererId).toBe(a.sorcererId);
            expect(b.status).toBe('novice');
        });
    });

    describe('addSpell', () => {
        it('should add a spell to sorcerer', () => {
            const { sorcerer } = system.recruitSorcerer({});
            const result = system.addSpell(sorcerer.sorcererId, 'lightning');
            expect(result.success).toBe(true);
            expect(sorcerer.spells).toContain('lightning');
        });

        it('should reject missing sorcerer', () => {
            const result = system.addSpell('ghost', 'x');
            expect(result.error).toBe('SORCERER_NOT_FOUND');
        });

        it('should trigger spellAdded hook', () => {
            const { sorcerer } = system.recruitSorcerer({});
            let called = false;
            system.registerHook('spellAdded', () => { called = true; });
            system.addSpell(sorcerer.sorcererId, 'shadow_blast');
            expect(called).toBe(true);
        });
    });

    describe('increaseArcane', () => {
        it('should increase arcane by default 5', () => {
            const { sorcerer } = system.recruitSorcerer({});
            system.increaseArcane(sorcerer.sorcererId);
            expect(sorcerer.arcane).toBe(25);
        });

        it('should increase arcane by custom amount', () => {
            const { sorcerer } = system.recruitSorcerer({});
            system.increaseArcane(sorcerer.sorcererId, 30);
            expect(sorcerer.arcane).toBe(50);
        });

        it('should reject missing sorcerer', () => {
            const result = system.increaseArcane('ghost', 10);
            expect(result.error).toBe('SORCERER_NOT_FOUND');
        });

        it('should trigger arcaneIncreased hook', () => {
            const { sorcerer } = system.recruitSorcerer({});
            let called = false;
            system.registerHook('arcaneIncreased', () => { called = true; });
            system.increaseArcane(sorcerer.sorcererId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSorcerer', () => {
        it('should increase level by 1', () => {
            const { sorcerer } = system.recruitSorcerer({});
            system.levelUpSorcerer(sorcerer.sorcererId);
            expect(sorcerer.level).toBe(2);
        });

        it('should increase level multiple times', () => {
            const { sorcerer } = system.recruitSorcerer({});
            system.levelUpSorcerer(sorcerer.sorcererId);
            system.levelUpSorcerer(sorcerer.sorcererId);
            system.levelUpSorcerer(sorcerer.sorcererId);
            expect(sorcerer.level).toBe(4);
        });

        it('should reject missing sorcerer', () => {
            const result = system.levelUpSorcerer('ghost');
            expect(result.error).toBe('SORCERER_NOT_FOUND');
        });

        it('should trigger sorcererLeveledUp hook', () => {
            const { sorcerer } = system.recruitSorcerer({});
            let called = false;
            system.registerHook('sorcererLeveledUp', () => { called = true; });
            system.levelUpSorcerer(sorcerer.sorcererId);
            expect(called).toBe(true);
        });
    });

    describe('legendSorcerer', () => {
        it('should set status to legendary', () => {
            const { sorcerer } = system.recruitSorcerer({});
            system.legendSorcerer(sorcerer.sorcererId);
            expect(sorcerer.status).toBe('legendary');
        });

        it('should reject missing sorcerer', () => {
            const result = system.legendSorcerer('ghost');
            expect(result.error).toBe('SORCERER_NOT_FOUND');
        });

        it('should trigger sorcererLegendized hook', () => {
            const { sorcerer } = system.recruitSorcerer({});
            let called = false;
            system.registerHook('sorcererLegendized', () => { called = true; });
            system.legendSorcerer(sorcerer.sorcererId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSorcererValue', () => {
        it('should calculate value with default stats', () => {
            const { sorcerer } = system.recruitSorcerer({});
            // level=1 * 100 + arcane=20 * 2 + spells=0 * 30 = 140
            expect(system.calculateSorcererValue(sorcerer.sorcererId)).toBe(140);
        });

        it('should calculate value with spells and leveled up', () => {
            const { sorcerer } = system.recruitSorcerer({});
            system.levelUpSorcerer(sorcerer.sorcererId);
            system.levelUpSorcerer(sorcerer.sorcererId);
            system.addSpell(sorcerer.sorcererId, 'lightning');
            system.addSpell(sorcerer.sorcererId, 'thunder');
            // level=3 * 100 + arcane=20 * 2 + spells=2 * 30 = 300 + 40 + 60 = 400
            expect(system.calculateSorcererValue(sorcerer.sorcererId)).toBe(400);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSorcererValue('ghost')).toBe(0);
        });
    });

    describe('Tool System', () => {
        it('should register and list tool', () => {
            system.registerTool('test', () => 'ok');
            expect(system.listTools()).toContain('test');
        });

        it('should execute custom tool', () => {
            system.registerTool('test', (ctx) => ctx.value);
            const result = system.executeTool('test', { value: 42 });
            expect(result.success).toBe(true);
            expect(result.result).toBe(42);
        });

        it('should reject missing tool', () => {
            const result = system.executeTool('ghost', {});
            expect(result.error).toBe('TOOL_NOT_FOUND');
        });

        it('should handle tool execution errors', () => {
            system.registerTool('bad', () => { throw new Error('boom'); });
            const result = system.executeTool('bad', {});
            expect(result.success).toBe(false);
            expect(result.error).toBe('boom');
        });

        it('should default to empty context when none provided', () => {
            system.registerTool('echo', (ctx) => ctx);
            const result = system.executeTool('echo');
            expect(result.success).toBe(true);
            expect(result.result).toEqual({});
        });

        it('should execute default getSorcerer tool', () => {
            const { sorcerer } = system.recruitSorcerer({});
            const result = system.executeTool('getSorcerer', { sorcererId: sorcerer.sorcererId });
            expect(result.success).toBe(true);
            expect(result.result.sorcererId).toBe(sorcerer.sorcererId);
        });

        it('should execute default recruitSorcerer tool', () => {
            const result = system.executeTool('recruitSorcerer', { masterId: 'm1', name: 'X', type: 'blood' });
            expect(result.success).toBe(true);
            expect(result.result.sorcerer.masterId).toBe('m1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('sorcererRecruited', () => count++);
            unregister();
            system.recruitSorcerer({});
            expect(count).toBe(0);
        });

        it('should handle errors silently in hooks', () => {
            system.registerHook('sorcererRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSorcerer({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient sorcerers', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when threshold met', () => {
            system.stats.totalSorcerers = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
            expect(system.config.maxSorcerers).toBe(70);
        });
        it('should not double evolve', () => {
            system.stats.totalSorcerers = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitSorcerer({});
            system.recruitSorcerer({});
            const json = system.toJSON();
            expect(json.sorcerers.length).toBe(2);
            expect(json.stats.totalSorcerers).toBe(2);
        });

        it('should deserialize from JSON', () => {
            system.recruitSorcerer({ name: 'A' });
            const json = system.toJSON();
            const newSys = new CultivationSorcerer();
            newSys.fromJSON(json);
            expect(newSys.sorcerers.size).toBe(1);
            expect(newSys.stats.totalSorcerers).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with count', () => {
            system.recruitSorcerer({});
            const stats = system.getStats();
            expect(stats.sorcererCount).toBe(1);
            expect(stats.totalSorcerers).toBe(1);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
