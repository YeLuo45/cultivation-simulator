/**
 * CultivationAssassin.test.js - 修真刺客测试
 * V601 Iteration 4/20 Round 25 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationAssassin } from '../../../systems/ai/CultivationAssassin.js';

describe('CultivationAssassin', () => {
    let system;
    beforeEach(() => { system = new CultivationAssassin(); });

    describe('recruitAssassin', () => {
        it('should recruit assassin', () => {
            const { assassin } = system.recruitAssassin({ handlerId: 'h1', name: 'Crimson Fang' });
            expect(assassin.handlerId).toBe('h1');
            expect(assassin.name).toBe('Crimson Fang');
        });

        it('should default name to Shadow Blade', () => {
            const { assassin } = system.recruitAssassin({});
            expect(assassin.name).toBe('Shadow Blade');
        });

        it('should default type to dagger', () => {
            const { assassin } = system.recruitAssassin({});
            expect(assassin.type).toBe('dagger');
        });

        it('should default stealth to baseStealth', () => {
            const { assassin } = system.recruitAssassin({});
            expect(assassin.stealth).toBe(20);
        });

        it('should start at level 1', () => {
            const { assassin } = system.recruitAssassin({});
            expect(assassin.level).toBe(1);
        });

        it('should start with novice status', () => {
            const { assassin } = system.recruitAssassin({});
            expect(assassin.status).toBe('novice');
        });

        it('should start with empty targets', () => {
            const { assassin } = system.recruitAssassin({});
            expect(assassin.targets).toEqual([]);
        });

        it('should generate assassinId', () => {
            const { assassin } = system.recruitAssassin({});
            expect(assassin.assassinId).toBeDefined();
            expect(typeof assassin.assassinId).toBe('string');
        });

        it('should accept custom assassinId', () => {
            const { assassin } = system.recruitAssassin({ assassinId: 'my-assassin' });
            expect(assassin.assassinId).toBe('my-assassin');
        });

        it('should trigger assassinRecruited hook', () => {
            let called = false;
            system.registerHook('assassinRecruited', () => { called = true; });
            system.recruitAssassin({});
            expect(called).toBe(true);
        });

        it('should support all types', () => {
            const { assassin: a1 } = system.recruitAssassin({ type: 'dagger' });
            const { assassin: a2 } = system.recruitAssassin({ type: 'poison' });
            const { assassin: a3 } = system.recruitAssassin({ type: 'shadow' });
            expect(a1.type).toBe('dagger');
            expect(a2.type).toBe('poison');
            expect(a3.type).toBe('shadow');
        });

        it('should accept custom stealth', () => {
            const { assassin } = system.recruitAssassin({ stealth: 80 });
            expect(assassin.stealth).toBe(80);
        });
    });

    describe('getAssassin', () => {
        it('should return assassin', () => {
            const { assassin } = system.recruitAssassin({});
            expect(system.getAssassin(assassin.assassinId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getAssassin('ghost')).toBeNull(); });
    });

    describe('listAssassins', () => {
        it('should list all', () => {
            system.recruitAssassin({});
            system.recruitAssassin({});
            expect(system.listAssassins().length).toBe(2);
        });

        it('should return empty when no assassins', () => {
            expect(system.listAssassins().length).toBe(0);
        });
    });

    describe('listByHandler', () => {
        it('should filter by handler', () => {
            system.recruitAssassin({ handlerId: 'h1' });
            system.recruitAssassin({ handlerId: 'h2' });
            system.recruitAssassin({ handlerId: 'h1' });
            expect(system.listByHandler('h1').length).toBe(2);
        });

        it('should return empty for unknown handler', () => {
            system.recruitAssassin({ handlerId: 'h1' });
            expect(system.listByHandler('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { assassin: a1 } = system.recruitAssassin({});
            const { assassin: a2 } = system.recruitAssassin({});
            system.legendAssassin(a1.assassinId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].assassinId).toBe(a1.assassinId);
            expect(a2.status).toBe('novice');
        });

        it('should return empty when none legendary', () => {
            system.recruitAssassin({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addTarget', () => {
        it('should add target', () => {
            const { assassin } = system.recruitAssassin({});
            system.addTarget(assassin.assassinId, 'cultivator-1');
            expect(assassin.targets).toContain('cultivator-1');
        });

        it('should accumulate targets', () => {
            const { assassin } = system.recruitAssassin({});
            system.addTarget(assassin.assassinId, 't1');
            system.addTarget(assassin.assassinId, 't2');
            system.addTarget(assassin.assassinId, 't3');
            expect(assassin.targets.length).toBe(3);
        });

        it('should reject missing assassin', () => {
            const result = system.addTarget('ghost', 't');
            expect(result.error).toBe('ASSASSIN_NOT_FOUND');
        });

        it('should trigger targetAdded hook', () => {
            const { assassin } = system.recruitAssassin({});
            let called = false;
            system.registerHook('targetAdded', () => { called = true; });
            system.addTarget(assassin.assassinId, 't');
            expect(called).toBe(true);
        });
    });

    describe('sharpenStealth', () => {
        it('should increase stealth by default', () => {
            const { assassin } = system.recruitAssassin({});
            system.sharpenStealth(assassin.assassinId);
            expect(assassin.stealth).toBe(25);
        });

        it('should increase stealth by custom amount', () => {
            const { assassin } = system.recruitAssassin({});
            system.sharpenStealth(assassin.assassinId, 100);
            expect(assassin.stealth).toBe(120);
        });

        it('should reject missing assassin', () => {
            const result = system.sharpenStealth('ghost');
            expect(result.error).toBe('ASSASSIN_NOT_FOUND');
        });

        it('should trigger stealthSharpened hook', () => {
            const { assassin } = system.recruitAssassin({});
            let called = false;
            system.registerHook('stealthSharpened', () => { called = true; });
            system.sharpenStealth(assassin.assassinId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpAssassin', () => {
        it('should level up', () => {
            const { assassin } = system.recruitAssassin({});
            system.levelUpAssassin(assassin.assassinId);
            expect(assassin.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { assassin } = system.recruitAssassin({});
            system.levelUpAssassin(assassin.assassinId);
            system.levelUpAssassin(assassin.assassinId);
            system.levelUpAssassin(assassin.assassinId);
            expect(assassin.level).toBe(4);
        });

        it('should reject missing assassin', () => {
            const result = system.levelUpAssassin('ghost');
            expect(result.error).toBe('ASSASSIN_NOT_FOUND');
        });

        it('should trigger assassinLeveledUp hook', () => {
            const { assassin } = system.recruitAssassin({});
            let called = false;
            system.registerHook('assassinLeveledUp', () => { called = true; });
            system.levelUpAssassin(assassin.assassinId);
            expect(called).toBe(true);
        });
    });

    describe('legendAssassin', () => {
        it('should set status to legendary', () => {
            const { assassin } = system.recruitAssassin({});
            system.legendAssassin(assassin.assassinId);
            expect(assassin.status).toBe('legendary');
        });

        it('should reject missing assassin', () => {
            const result = system.legendAssassin('ghost');
            expect(result.error).toBe('ASSASSIN_NOT_FOUND');
        });

        it('should trigger assassinLegendized hook', () => {
            const { assassin } = system.recruitAssassin({});
            let called = false;
            system.registerHook('assassinLegendized', () => { called = true; });
            system.legendAssassin(assassin.assassinId);
            expect(called).toBe(true);
        });
    });

    describe('calculateAssassinValue', () => {
        it('should calculate base value', () => {
            const { assassin } = system.recruitAssassin({});
            // level=1, stealth=20, targets=0 -> 1*100 + 20*2 + 0 = 140
            expect(system.calculateAssassinValue(assassin.assassinId)).toBe(140);
        });

        it('should include targets in value', () => {
            const { assassin } = system.recruitAssassin({});
            system.addTarget(assassin.assassinId, 't1');
            system.addTarget(assassin.assassinId, 't2');
            // level=1, stealth=20, targets=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateAssassinValue(assassin.assassinId)).toBe(200);
        });

        it('should scale with level', () => {
            const { assassin } = system.recruitAssassin({});
            system.levelUpAssassin(assassin.assassinId);
            system.levelUpAssassin(assassin.assassinId);
            // level=3, stealth=20, targets=0 -> 3*100 + 20*2 + 0 = 340
            expect(system.calculateAssassinValue(assassin.assassinId)).toBe(340);
        });

        it('should scale with stealth', () => {
            const { assassin } = system.recruitAssassin({});
            system.sharpenStealth(assassin.assassinId, 100);
            // level=1, stealth=120, targets=0 -> 1*100 + 120*2 + 0 = 340
            expect(system.calculateAssassinValue(assassin.assassinId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateAssassinValue('ghost')).toBe(0);
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

        it('should handle undefined context', () => {
            system.registerTool('test', (ctx) => ctx);
            const result = system.executeTool('test');
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

        it('should execute default getAssassin', () => {
            const result = system.executeTool('getAssassin', { assassinId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitAssassin', () => {
            const result = system.executeTool('recruitAssassin', { handlerId: 'h1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('assassinRecruited', () => count++);
            unregister();
            system.recruitAssassin({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('assassinRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitAssassin({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalAssassins = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalAssassins = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitAssassin({});
            const json = system.toJSON();
            expect(json.assassins.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitAssassin({});
            const json = system.toJSON();
            const newSys = new CultivationAssassin();
            newSys.fromJSON(json);
            expect(newSys.assassins.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.assassinCount).toBe(0);
        });
    });
});
