/**
 * CultivationDevil.test.js - 修真魔系统测试
 * V671 Iteration 24/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDevil } from '../../../systems/ai/CultivationDevil.js';

describe('CultivationDevil', () => {
    let system;
    beforeEach(() => { system = new CultivationDevil(); });

    describe('recruitDevil', () => {
        it('should recruit', () => {
            const { devil } = system.recruitDevil({ overlordId: 'o1', name: 'Asmodeus' });
            expect(devil.overlordId).toBe('o1');
            expect(devil.name).toBe('Asmodeus');
        });

        it('should use default type and evil', () => {
            const { devil } = system.recruitDevil({});
            expect(devil.type).toBe('demon');
            expect(devil.evil).toBe(20);
        });

        it('should accept custom type demon', () => {
            const { devil } = system.recruitDevil({ type: 'demon' });
            expect(devil.type).toBe('demon');
        });

        it('should accept custom type evil', () => {
            const { devil } = system.recruitDevil({ type: 'evil' });
            expect(devil.type).toBe('evil');
        });

        it('should accept custom type dark', () => {
            const { devil } = system.recruitDevil({ type: 'dark' });
            expect(devil.type).toBe('dark');
        });

        it('should reject when max reached', () => {
            const small = new CultivationDevil({ maxDevils: 1 });
            small.recruitDevil({});
            const result = small.recruitDevil({});
            expect(result.error).toBe('MAX_DEVILS_REACHED');
        });

        it('should trigger devilRecruited hook', () => {
            let called = false;
            system.registerHook('devilRecruited', () => { called = true; });
            system.recruitDevil({});
            expect(called).toBe(true);
        });

        it('should set initial status to novice', () => {
            const { devil } = system.recruitDevil({});
            expect(devil.status).toBe('novice');
            expect(devil.level).toBe(1);
        });

        it('should accept custom evil including 0', () => {
            const { devil } = system.recruitDevil({ evil: 0 });
            expect(devil.evil).toBe(0);
        });

        it('should accept custom overlord and curses', () => {
            const { devil } = system.recruitDevil({ overlordId: 'ov42', curses: [{ name: 'initial' }] });
            expect(devil.overlordId).toBe('ov42');
            expect(devil.curses.length).toBe(1);
        });

        it('should accept custom devilId', () => {
            const { devil } = system.recruitDevil({ devilId: 'custom_dvl_1' });
            expect(devil.devilId).toBe('custom_dvl_1');
        });
    });

    describe('getDevil', () => {
        it('should return', () => {
            const { devil } = system.recruitDevil({});
            expect(system.getDevil(devil.devilId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDevil('ghost')).toBeNull(); });
        it('should return a copy not the original reference', () => {
            const { devil } = system.recruitDevil({});
            const fetched = system.getDevil(devil.devilId);
            expect(fetched).not.toBe(devil);
        });
    });

    describe('listDevils', () => {
        it('should list all', () => {
            system.recruitDevil({});
            system.recruitDevil({});
            expect(system.listDevils().length).toBe(2);
        });
        it('should return empty when none', () => {
            expect(system.listDevils().length).toBe(0);
        });
    });

    describe('listByOverlord', () => {
        it('should filter', () => {
            system.recruitDevil({ overlordId: 'o1' });
            system.recruitDevil({ overlordId: 'o2' });
            expect(system.listByOverlord('o1').length).toBe(1);
        });
        it('should return empty for unknown overlord', () => {
            system.recruitDevil({ overlordId: 'o1' });
            expect(system.listByOverlord('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { devil: d1 } = system.recruitDevil({});
            const { devil: d2 } = system.recruitDevil({});
            system.legendDevil(d1.devilId);
            expect(system.listLegendary().length).toBe(1);
            expect(system.listLegendary()[0].devilId).toBe(d1.devilId);
        });
    });

    describe('addCurse', () => {
        it('should add curse', () => {
            const { devil } = system.recruitDevil({});
            system.addCurse(devil.devilId, { name: 'CurseOfDoom' });
            expect(devil.curses.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addCurse('ghost', {});
            expect(result.error).toBe('DEVIL_NOT_FOUND');
        });

        it('should trigger curseAdded hook', () => {
            const { devil } = system.recruitDevil({});
            let called = false;
            system.registerHook('curseAdded', () => { called = true; });
            system.addCurse(devil.devilId, { name: 'Decay' });
            expect(called).toBe(true);
        });
    });

    describe('raiseEvil', () => {
        it('should raise evil', () => {
            const { devil } = system.recruitDevil({});
            system.raiseEvil(devil.devilId, 10);
            expect(devil.evil).toBe(30);
        });

        it('should use default amount', () => {
            const { devil } = system.recruitDevil({});
            system.raiseEvil(devil.devilId);
            expect(devil.evil).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseEvil('ghost', 5);
            expect(result.error).toBe('DEVIL_NOT_FOUND');
        });

        it('should trigger evilRaised hook', () => {
            const { devil } = system.recruitDevil({});
            let called = false;
            system.registerHook('evilRaised', () => { called = true; });
            system.raiseEvil(devil.devilId, 3);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDevil', () => {
        it('should level up', () => {
            const { devil } = system.recruitDevil({});
            system.levelUpDevil(devil.devilId);
            expect(devil.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpDevil('ghost');
            expect(result.error).toBe('DEVIL_NOT_FOUND');
        });

        it('should trigger devilLeveledUp hook', () => {
            const { devil } = system.recruitDevil({});
            let called = false;
            system.registerHook('devilLeveledUp', () => { called = true; });
            system.levelUpDevil(devil.devilId);
            expect(called).toBe(true);
        });
    });

    describe('legendDevil', () => {
        it('should legendize', () => {
            const { devil } = system.recruitDevil({});
            system.legendDevil(devil.devilId);
            expect(devil.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendDevil('ghost');
            expect(result.error).toBe('DEVIL_NOT_FOUND');
        });

        it('should trigger devilLegendized hook', () => {
            const { devil } = system.recruitDevil({});
            let called = false;
            system.registerHook('devilLegendized', () => { called = true; });
            system.legendDevil(devil.devilId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDevilValue', () => {
        it('should calculate', () => {
            const { devil } = system.recruitDevil({});
            system.levelUpDevil(devil.devilId);
            system.raiseEvil(devil.devilId, 5);
            system.addCurse(devil.devilId, { name: 'curse' });
            const value = system.calculateDevilValue(devil.devilId);
            expect(value).toBe(2 * 100 + 25 * 2 + 1 * 30);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDevilValue('ghost')).toBe(0);
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

        it('should execute tool with undefined context', () => {
            system.registerTool('nocontext', (ctx) => ctx);
            const result = system.executeTool('nocontext');
            expect(result.success).toBe(true);
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

        it('should execute default getDevil', () => {
            const result = system.executeTool('getDevil', { devilId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitDevil via tool', () => {
            const result = system.executeTool('recruitDevil', { name: 'ToolRecruited' });
            expect(result.result.success).toBe(true);
            expect(result.result.devil.name).toBe('ToolRecruited');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('devilRecruited', () => count++);
            unregister();
            system.recruitDevil({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('devilRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitDevil({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDevils = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDevils = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitDevil({});
            const json = system.toJSON();
            expect(json.devils.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitDevil({});
            const json = system.toJSON();
            const newSys = new CultivationDevil();
            newSys.fromJSON(json);
            expect(newSys.devils.size).toBe(1);
        });
        it('should deserialize empty data', () => {
            const newSys = new CultivationDevil();
            const result = newSys.fromJSON({});
            expect(result.success).toBe(true);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.devilCount).toBe(0);
        });
    });
});
