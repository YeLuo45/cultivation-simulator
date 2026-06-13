/**
 * CultivationRogue.test.js - 修真盗贼测试
 * V608 Iteration 11/20 Round 25 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationRogue } from '../../../systems/ai/CultivationRogue.js';

describe('CultivationRogue', () => {
    let system;
    beforeEach(() => { system = new CultivationRogue(); });

    describe('recruitRogue', () => {
        it('should recruit rogue', () => {
            const { rogue } = system.recruitRogue({ handlerId: 'h1', name: 'Nightblade' });
            expect(rogue.handlerId).toBe('h1');
            expect(rogue.name).toBe('Nightblade');
        });

        it('should default name to Silent Shadow', () => {
            const { rogue } = system.recruitRogue({});
            expect(rogue.name).toBe('Silent Shadow');
        });

        it('should default type to stealth', () => {
            const { rogue } = system.recruitRogue({});
            expect(rogue.type).toBe('stealth');
        });

        it('should default cunning to baseCunning', () => {
            const { rogue } = system.recruitRogue({});
            expect(rogue.cunning).toBe(20);
        });

        it('should start at level 1', () => {
            const { rogue } = system.recruitRogue({});
            expect(rogue.level).toBe(1);
        });

        it('should start with novice status', () => {
            const { rogue } = system.recruitRogue({});
            expect(rogue.status).toBe('novice');
        });

        it('should start with empty tricks', () => {
            const { rogue } = system.recruitRogue({});
            expect(rogue.tricks).toEqual([]);
        });

        it('should generate rogueId', () => {
            const { rogue } = system.recruitRogue({});
            expect(rogue.rogueId).toBeDefined();
            expect(typeof rogue.rogueId).toBe('string');
        });

        it('should accept custom rogueId', () => {
            const { rogue } = system.recruitRogue({ rogueId: 'my-rogue' });
            expect(rogue.rogueId).toBe('my-rogue');
        });

        it('should trigger rogueRecruited hook', () => {
            let called = false;
            system.registerHook('rogueRecruited', () => { called = true; });
            system.recruitRogue({});
            expect(called).toBe(true);
        });

        it('should support all types', () => {
            const { rogue: r1 } = system.recruitRogue({ type: 'stealth' });
            const { rogue: r2 } = system.recruitRogue({ type: 'lockpick' });
            const { rogue: r3 } = system.recruitRogue({ type: 'trick' });
            expect(r1.type).toBe('stealth');
            expect(r2.type).toBe('lockpick');
            expect(r3.type).toBe('trick');
        });

        it('should accept custom cunning', () => {
            const { rogue } = system.recruitRogue({ cunning: 80 });
            expect(rogue.cunning).toBe(80);
        });
    });

    describe('getRogue', () => {
        it('should return rogue', () => {
            const { rogue } = system.recruitRogue({});
            expect(system.getRogue(rogue.rogueId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getRogue('ghost')).toBeNull(); });
    });

    describe('listRogues', () => {
        it('should list all', () => {
            system.recruitRogue({});
            system.recruitRogue({});
            expect(system.listRogues().length).toBe(2);
        });

        it('should return empty when no rogues', () => {
            expect(system.listRogues().length).toBe(0);
        });
    });

    describe('listByHandler', () => {
        it('should filter by handler', () => {
            system.recruitRogue({ handlerId: 'h1' });
            system.recruitRogue({ handlerId: 'h2' });
            system.recruitRogue({ handlerId: 'h1' });
            expect(system.listByHandler('h1').length).toBe(2);
        });

        it('should return empty for unknown handler', () => {
            system.recruitRogue({ handlerId: 'h1' });
            expect(system.listByHandler('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { rogue: r1 } = system.recruitRogue({});
            const { rogue: r2 } = system.recruitRogue({});
            system.legendRogue(r1.rogueId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].rogueId).toBe(r1.rogueId);
            expect(r2.status).toBe('novice');
        });

        it('should return empty when none legendary', () => {
            system.recruitRogue({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addTrick', () => {
        it('should add trick', () => {
            const { rogue } = system.recruitRogue({});
            system.addTrick(rogue.rogueId, 'shadow-step');
            expect(rogue.tricks).toContain('shadow-step');
        });

        it('should accumulate tricks', () => {
            const { rogue } = system.recruitRogue({});
            system.addTrick(rogue.rogueId, 't1');
            system.addTrick(rogue.rogueId, 't2');
            system.addTrick(rogue.rogueId, 't3');
            expect(rogue.tricks.length).toBe(3);
        });

        it('should reject missing rogue', () => {
            const result = system.addTrick('ghost', 't');
            expect(result.error).toBe('ROGUE_NOT_FOUND');
        });

        it('should trigger trickAdded hook', () => {
            const { rogue } = system.recruitRogue({});
            let called = false;
            system.registerHook('trickAdded', () => { called = true; });
            system.addTrick(rogue.rogueId, 't');
            expect(called).toBe(true);
        });
    });

    describe('sharpenCunning', () => {
        it('should increase cunning by default', () => {
            const { rogue } = system.recruitRogue({});
            system.sharpenCunning(rogue.rogueId);
            expect(rogue.cunning).toBe(25);
        });

        it('should increase cunning by custom amount', () => {
            const { rogue } = system.recruitRogue({});
            system.sharpenCunning(rogue.rogueId, 100);
            expect(rogue.cunning).toBe(120);
        });

        it('should reject missing rogue', () => {
            const result = system.sharpenCunning('ghost');
            expect(result.error).toBe('ROGUE_NOT_FOUND');
        });

        it('should trigger cunningSharpened hook', () => {
            const { rogue } = system.recruitRogue({});
            let called = false;
            system.registerHook('cunningSharpened', () => { called = true; });
            system.sharpenCunning(rogue.rogueId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpRogue', () => {
        it('should level up', () => {
            const { rogue } = system.recruitRogue({});
            system.levelUpRogue(rogue.rogueId);
            expect(rogue.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { rogue } = system.recruitRogue({});
            system.levelUpRogue(rogue.rogueId);
            system.levelUpRogue(rogue.rogueId);
            system.levelUpRogue(rogue.rogueId);
            expect(rogue.level).toBe(4);
        });

        it('should reject missing rogue', () => {
            const result = system.levelUpRogue('ghost');
            expect(result.error).toBe('ROGUE_NOT_FOUND');
        });

        it('should trigger rogueLeveledUp hook', () => {
            const { rogue } = system.recruitRogue({});
            let called = false;
            system.registerHook('rogueLeveledUp', () => { called = true; });
            system.levelUpRogue(rogue.rogueId);
            expect(called).toBe(true);
        });
    });

    describe('legendRogue', () => {
        it('should set status to legendary', () => {
            const { rogue } = system.recruitRogue({});
            system.legendRogue(rogue.rogueId);
            expect(rogue.status).toBe('legendary');
        });

        it('should reject missing rogue', () => {
            const result = system.legendRogue('ghost');
            expect(result.error).toBe('ROGUE_NOT_FOUND');
        });

        it('should trigger rogueLegendized hook', () => {
            const { rogue } = system.recruitRogue({});
            let called = false;
            system.registerHook('rogueLegendized', () => { called = true; });
            system.legendRogue(rogue.rogueId);
            expect(called).toBe(true);
        });
    });

    describe('calculateRogueValue', () => {
        it('should calculate base value', () => {
            const { rogue } = system.recruitRogue({});
            // level=1, cunning=20, tricks=0 -> 1*100 + 20*2 + 0 = 140
            expect(system.calculateRogueValue(rogue.rogueId)).toBe(140);
        });

        it('should include tricks in value', () => {
            const { rogue } = system.recruitRogue({});
            system.addTrick(rogue.rogueId, 't1');
            system.addTrick(rogue.rogueId, 't2');
            // level=1, cunning=20, tricks=2 -> 1*100 + 20*2 + 2*30 = 200
            expect(system.calculateRogueValue(rogue.rogueId)).toBe(200);
        });

        it('should scale with level', () => {
            const { rogue } = system.recruitRogue({});
            system.levelUpRogue(rogue.rogueId);
            system.levelUpRogue(rogue.rogueId);
            // level=3, cunning=20, tricks=0 -> 3*100 + 20*2 + 0 = 340
            expect(system.calculateRogueValue(rogue.rogueId)).toBe(340);
        });

        it('should scale with cunning', () => {
            const { rogue } = system.recruitRogue({});
            system.sharpenCunning(rogue.rogueId, 100);
            // level=1, cunning=120, tricks=0 -> 1*100 + 120*2 + 0 = 340
            expect(system.calculateRogueValue(rogue.rogueId)).toBe(340);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateRogueValue('ghost')).toBe(0);
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

        it('should execute default getRogue', () => {
            const result = system.executeTool('getRogue', { rogueId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitRogue', () => {
            const result = system.executeTool('recruitRogue', { handlerId: 'h1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('rogueRecruited', () => count++);
            unregister();
            system.recruitRogue({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('rogueRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitRogue({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalRogues = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalRogues = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitRogue({});
            const json = system.toJSON();
            expect(json.rogues.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitRogue({});
            const json = system.toJSON();
            const newSys = new CultivationRogue();
            newSys.fromJSON(json);
            expect(newSys.rogues.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.rogueCount).toBe(0);
        });
    });
});
