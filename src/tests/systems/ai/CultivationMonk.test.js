/**
 * CultivationMonk.test.js - 修真武僧测试
 * V615 Iteration 18/20 Round 25 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationMonk } from '../../../systems/ai/CultivationMonk.js';

describe('CultivationMonk', () => {
    let system;
    beforeEach(() => { system = new CultivationMonk(); });

    describe('recruitMonk', () => {
        it('should recruit', () => {
            const { monk } = system.recruitMonk({ abbotId: 'a1', name: 'Hui', type: 'fist' });
            expect(monk.abbotId).toBe('a1');
            expect(monk.name).toBe('Hui');
            expect(monk.type).toBe('fist');
            expect(monk.discipline).toBe(20);
            expect(monk.level).toBe(1);
            expect(monk.status).toBe('novice');
            expect(monk.mantras).toEqual([]);
        });

        it('should trigger monkRecruited hook', () => {
            let called = false;
            system.registerHook('monkRecruited', () => { called = true; });
            system.recruitMonk({});
            expect(called).toBe(true);
        });
    });

    describe('getMonk', () => {
        it('should return', () => {
            const { monk } = system.recruitMonk({});
            expect(system.getMonk(monk.monkId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMonk('ghost')).toBeNull(); });
    });

    describe('listMonks', () => {
        it('should list all', () => {
            system.recruitMonk({});
            system.recruitMonk({});
            expect(system.listMonks().length).toBe(2);
        });
    });

    describe('listByAbbot', () => {
        it('should filter', () => {
            system.recruitMonk({ abbotId: 'a1' });
            system.recruitMonk({ abbotId: 'a2' });
            expect(system.listByAbbot('a1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter', () => {
            const { monk } = system.recruitMonk({});
            system.legendMonk(monk.monkId);
            system.recruitMonk({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addMantra', () => {
        it('should add mantra', () => {
            const { monk } = system.recruitMonk({});
            system.addMantra(monk.monkId, 'Om Mani Padme Hum');
            expect(monk.mantras).toContain('Om Mani Padme Hum');
            expect(monk.mantras.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addMantra('ghost', 'Mantra of Light');
            expect(result.error).toBe('MONK_NOT_FOUND');
        });

        it('should trigger mantraAdded hook', () => {
            const { monk } = system.recruitMonk({});
            let called = false;
            system.registerHook('mantraAdded', () => { called = true; });
            system.addMantra(monk.monkId, 'Heart Sutra');
            expect(called).toBe(true);
        });
    });

    describe('deepenDiscipline', () => {
        it('should deepen with amount', () => {
            const { monk } = system.recruitMonk({});
            system.deepenDiscipline(monk.monkId, 10);
            expect(monk.discipline).toBe(30);
        });

        it('should deepen with default', () => {
            const { monk } = system.recruitMonk({});
            system.deepenDiscipline(monk.monkId);
            expect(monk.discipline).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.deepenDiscipline('ghost', 10);
            expect(result.error).toBe('MONK_NOT_FOUND');
        });

        it('should trigger disciplineDeepened hook', () => {
            const { monk } = system.recruitMonk({});
            let called = false;
            system.registerHook('disciplineDeepened', () => { called = true; });
            system.deepenDiscipline(monk.monkId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpMonk', () => {
        it('should level up', () => {
            const { monk } = system.recruitMonk({});
            system.levelUpMonk(monk.monkId);
            expect(monk.level).toBe(2);
        });

        it('should promote to veteran at level 5', () => {
            const { monk } = system.recruitMonk({});
            for (let i = 0; i < 4; i++) system.levelUpMonk(monk.monkId);
            expect(monk.level).toBe(5);
            expect(monk.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.levelUpMonk('ghost');
            expect(result.error).toBe('MONK_NOT_FOUND');
        });

        it('should trigger monkLeveledUp hook', () => {
            const { monk } = system.recruitMonk({});
            let called = false;
            system.registerHook('monkLeveledUp', () => { called = true; });
            system.levelUpMonk(monk.monkId);
            expect(called).toBe(true);
        });
    });

    describe('legendMonk', () => {
        it('should legendize', () => {
            const { monk } = system.recruitMonk({});
            system.legendMonk(monk.monkId);
            expect(monk.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendMonk('ghost');
            expect(result.error).toBe('MONK_NOT_FOUND');
        });

        it('should trigger monkLegendized hook', () => {
            const { monk } = system.recruitMonk({});
            let called = false;
            system.registerHook('monkLegendized', () => { called = true; });
            system.legendMonk(monk.monkId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMonkValue', () => {
        it('should calculate', () => {
            const { monk } = system.recruitMonk({});
            system.levelUpMonk(monk.monkId);
            system.deepenDiscipline(monk.monkId, 5);
            system.addMantra(monk.monkId, 'Lotus Sutra');
            // level=2, discipline=25, mantras.length=1 => 2*100 + 25*2 + 1*30 = 200+50+30 = 280
            expect(system.calculateMonkValue(monk.monkId)).toBe(280);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMonkValue('ghost')).toBe(0);
        });
    });

    describe('listVeterans', () => {
        it('should filter', () => {
            const { monk } = system.recruitMonk({});
            for (let i = 0; i < 4; i++) system.levelUpMonk(monk.monkId);
            system.recruitMonk({});
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

        it('should execute default getMonk', () => {
            const result = system.executeTool('getMonk', { monkId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('monkRecruited', () => count++);
            unregister();
            system.recruitMonk({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('monkRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitMonk({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMonks = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMonks = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitMonk({});
            const json = system.toJSON();
            expect(json.monks.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitMonk({});
            const json = system.toJSON();
            const newSys = new CultivationMonk();
            newSys.fromJSON(json);
            expect(newSys.monks.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.monkCount).toBe(0);
        });
    });
});
