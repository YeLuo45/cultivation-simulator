/**
 * CultivationGod.test.js - 修真神测试
 * V670 Iteration 23/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationGod } from '../../../systems/ai/CultivationGod.js';

describe('CultivationGod', () => {
    let system;
    beforeEach(() => { system = new CultivationGod(); });

    describe('recruitGod', () => {
        it('should recruit a god', () => {
            const { god } = system.recruitGod({ realmId: 'r1', name: 'Jade Emperor', type: 'celestial' });
            expect(god.realmId).toBe('r1');
            expect(god.name).toBe('Jade Emperor');
            expect(god.type).toBe('celestial');
            expect(god.status).toBe('novice');
            expect(god.level).toBe(1);
        });

        it('should use defaults when not provided', () => {
            const { god } = system.recruitGod({});
            expect(god.name).toBe('Unnamed God');
            expect(god.type).toBe('deity');
            expect(god.divinity).toBe(20);
            expect(god.miracles).toEqual([]);
        });

        it('should generate id if not provided', () => {
            const { god } = system.recruitGod({});
            expect(god.godId).toBeTruthy();
            expect(typeof god.godId).toBe('string');
        });

        it('should use provided godId', () => {
            const { god } = system.recruitGod({ godId: 'custom-god-1' });
            expect(god.godId).toBe('custom-god-1');
        });

        it('should trigger godRecruited hook', () => {
            let called = false;
            system.registerHook('godRecruited', () => { called = true; });
            system.recruitGod({});
            expect(called).toBe(true);
        });

        it('should increment totalGods stat', () => {
            expect(system.stats.totalGods).toBe(0);
            system.recruitGod({});
            expect(system.stats.totalGods).toBe(1);
            system.recruitGod({});
            expect(system.stats.totalGods).toBe(2);
        });
    });

    describe('getGod', () => {
        it('should return a god', () => {
            const { god } = system.recruitGod({});
            expect(system.getGod(god.godId)).not.toBeNull();
        });
        it('should return null for missing', () => {
            expect(system.getGod('ghost')).toBeNull();
        });
    });

    describe('listGods', () => {
        it('should list all', () => {
            system.recruitGod({});
            system.recruitGod({});
            expect(system.listGods().length).toBe(2);
        });

        it('should return empty list when empty', () => {
            expect(system.listGods().length).toBe(0);
        });
    });

    describe('listByRealm', () => {
        it('should filter by realm', () => {
            system.recruitGod({ realmId: 'r1' });
            system.recruitGod({ realmId: 'r2' });
            expect(system.listByRealm('r1').length).toBe(1);
        });

        it('should return empty when no match', () => {
            system.recruitGod({ realmId: 'r1' });
            expect(system.listByRealm('ghost')).toEqual([]);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { god: g1 } = system.recruitGod({});
            system.recruitGod({});
            system.legendGod(g1.godId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when no legendary', () => {
            system.recruitGod({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addMiracle', () => {
        it('should add miracle', () => {
            const { god } = system.recruitGod({});
            system.addMiracle(god.godId, 'healing-miracle');
            expect(god.miracles.length).toBe(1);
            expect(god.miracles[0]).toBe('healing-miracle');
        });

        it('should reject missing', () => {
            const result = system.addMiracle('ghost', 'x');
            expect(result.error).toBe('GOD_NOT_FOUND');
        });

        it('should trigger miracleAdded hook', () => {
            const { god } = system.recruitGod({});
            let called = false;
            system.registerHook('miracleAdded', () => { called = true; });
            system.addMiracle(god.godId, 'storm-miracle');
            expect(called).toBe(true);
        });
    });

    describe('raiseDivinity', () => {
        it('should raise divinity', () => {
            const { god } = system.recruitGod({});
            system.raiseDivinity(god.godId, 10);
            expect(god.divinity).toBe(30);
        });

        it('should use default amount of 5', () => {
            const { god } = system.recruitGod({});
            system.raiseDivinity(god.godId);
            expect(god.divinity).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseDivinity('ghost', 5);
            expect(result.error).toBe('GOD_NOT_FOUND');
        });

        it('should trigger divinityRaised hook', () => {
            const { god } = system.recruitGod({});
            let called = false;
            system.registerHook('divinityRaised', () => { called = true; });
            system.raiseDivinity(god.godId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpGod', () => {
        it('should level up', () => {
            const { god } = system.recruitGod({});
            system.levelUpGod(god.godId);
            expect(god.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpGod('ghost');
            expect(result.error).toBe('GOD_NOT_FOUND');
        });

        it('should trigger godLeveledUp hook', () => {
            const { god } = system.recruitGod({});
            let called = false;
            system.registerHook('godLeveledUp', () => { called = true; });
            system.levelUpGod(god.godId);
            expect(called).toBe(true);
        });
    });

    describe('legendGod', () => {
        it('should set status to legendary', () => {
            const { god } = system.recruitGod({});
            system.legendGod(god.godId);
            expect(god.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendGod('ghost');
            expect(result.error).toBe('GOD_NOT_FOUND');
        });

        it('should trigger godLegendized hook', () => {
            const { god } = system.recruitGod({});
            let called = false;
            system.registerHook('godLegendized', () => { called = true; });
            system.legendGod(god.godId);
            expect(called).toBe(true);
        });
    });

    describe('calculateGodValue', () => {
        it('should calculate value', () => {
            const { god } = system.recruitGod({});
            system.addMiracle(god.godId, 'miracle-1');
            // level=1, divinity=20 (default baseDivinity), miracles=1
            // 1*100 + 20*2 + 1*30 = 100 + 40 + 30 = 170
            expect(system.calculateGodValue(god.godId)).toBe(170);
        });

        it('should reflect level and divinity changes', () => {
            const { god } = system.recruitGod({});
            system.levelUpGod(god.godId);
            system.raiseDivinity(god.godId, 10);
            // level=2, divinity=30, miracles=0
            // 2*100 + 30*2 + 0*30 = 200 + 60 + 0 = 260
            expect(system.calculateGodValue(god.godId)).toBe(260);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateGodValue('ghost')).toBe(0);
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

        it('should execute default getGod', () => {
            const result = system.executeTool('getGod', { godId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitGod', () => {
            const result = system.executeTool('recruitGod', { name: 'ToolGod' });
            expect(result.success).toBe(true);
            expect(result.result.god.name).toBe('ToolGod');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('godRecruited', () => count++);
            unregister();
            system.recruitGod({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('godRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitGod({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalGods = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalGods = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitGod({});
            const json = system.toJSON();
            expect(json.gods.length).toBe(1);
            expect(json.stats.totalGods).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitGod({});
            const json = system.toJSON();
            const newSys = new CultivationGod();
            newSys.fromJSON(json);
            expect(newSys.gods.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.godCount).toBe(0);
            expect(stats.totalGods).toBe(0);
            expect(stats.evolutionCount).toBe(0);
        });
    });
});
