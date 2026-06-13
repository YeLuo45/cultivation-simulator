/**
 * CultivationHammerman.test.js - 修真锤手测试
 * V622 Iteration 5/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationHammerman } from '../../../systems/ai/CultivationHammerman.js';

describe('CultivationHammerman', () => {
    let system;
    beforeEach(() => { system = new CultivationHammerman(); });

    describe('recruitHammerman', () => {
        it('should recruit', () => {
            const { hammerman } = system.recruitHammerman({ trainerId: 't1', name: 'Hammer Li', type: 'sledge' });
            expect(hammerman.trainerId).toBe('t1');
            expect(hammerman.name).toBe('Hammer Li');
            expect(hammerman.type).toBe('sledge');
            expect(hammerman.impact).toBe(20);
            expect(hammerman.level).toBe(1);
            expect(hammerman.status).toBe('novice');
            expect(hammerman.hammers).toEqual([]);
        });

        it('should trigger hammermanRecruited hook', () => {
            let called = false;
            system.registerHook('hammermanRecruited', () => { called = true; });
            system.recruitHammerman({});
            expect(called).toBe(true);
        });
    });

    describe('getHammerman', () => {
        it('should return', () => {
            const { hammerman } = system.recruitHammerman({});
            expect(system.getHammerman(hammerman.hammermanId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getHammerman('ghost')).toBeNull(); });
    });

    describe('listHammermen', () => {
        it('should list all', () => {
            system.recruitHammerman({});
            system.recruitHammerman({});
            expect(system.listHammermen().length).toBe(2);
        });
    });

    describe('listByTrainer', () => {
        it('should filter', () => {
            system.recruitHammerman({ trainerId: 't1' });
            system.recruitHammerman({ trainerId: 't2' });
            expect(system.listByTrainer('t1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter', () => {
            const { hammerman } = system.recruitHammerman({});
            system.legendHammerman(hammerman.hammermanId);
            system.recruitHammerman({});
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addHammer', () => {
        it('should add hammer', () => {
            const { hammerman } = system.recruitHammerman({});
            system.addHammer(hammerman.hammermanId, 'Dragon Mallet');
            expect(hammerman.hammers).toContain('Dragon Mallet');
            expect(hammerman.hammers.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addHammer('ghost', 'Mallet');
            expect(result.error).toBe('HAMMERMAN_NOT_FOUND');
        });

        it('should trigger hammerAdded hook', () => {
            const { hammerman } = system.recruitHammerman({});
            let called = false;
            system.registerHook('hammerAdded', () => { called = true; });
            system.addHammer(hammerman.hammermanId, 'Sledge');
            expect(called).toBe(true);
        });
    });

    describe('raiseImpact', () => {
        it('should raise with amount', () => {
            const { hammerman } = system.recruitHammerman({});
            system.raiseImpact(hammerman.hammermanId, 10);
            expect(hammerman.impact).toBe(30);
        });

        it('should raise with default', () => {
            const { hammerman } = system.recruitHammerman({});
            system.raiseImpact(hammerman.hammermanId);
            expect(hammerman.impact).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseImpact('ghost', 10);
            expect(result.error).toBe('HAMMERMAN_NOT_FOUND');
        });

        it('should trigger impactRaised hook', () => {
            const { hammerman } = system.recruitHammerman({});
            let called = false;
            system.registerHook('impactRaised', () => { called = true; });
            system.raiseImpact(hammerman.hammermanId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpHammerman', () => {
        it('should level up', () => {
            const { hammerman } = system.recruitHammerman({});
            system.levelUpHammerman(hammerman.hammermanId);
            expect(hammerman.level).toBe(2);
        });

        it('should promote to veteran at level 5', () => {
            const { hammerman } = system.recruitHammerman({});
            for (let i = 0; i < 4; i++) system.levelUpHammerman(hammerman.hammermanId);
            expect(hammerman.level).toBe(5);
            expect(hammerman.status).toBe('veteran');
        });

        it('should reject missing', () => {
            const result = system.levelUpHammerman('ghost');
            expect(result.error).toBe('HAMMERMAN_NOT_FOUND');
        });

        it('should trigger hammermanLeveledUp hook', () => {
            const { hammerman } = system.recruitHammerman({});
            let called = false;
            system.registerHook('hammermanLeveledUp', () => { called = true; });
            system.levelUpHammerman(hammerman.hammermanId);
            expect(called).toBe(true);
        });
    });

    describe('legendHammerman', () => {
        it('should legendize', () => {
            const { hammerman } = system.recruitHammerman({});
            system.legendHammerman(hammerman.hammermanId);
            expect(hammerman.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendHammerman('ghost');
            expect(result.error).toBe('HAMMERMAN_NOT_FOUND');
        });

        it('should trigger hammermanLegendized hook', () => {
            const { hammerman } = system.recruitHammerman({});
            let called = false;
            system.registerHook('hammermanLegendized', () => { called = true; });
            system.legendHammerman(hammerman.hammermanId);
            expect(called).toBe(true);
        });
    });

    describe('calculateHammermanValue', () => {
        it('should calculate', () => {
            const { hammerman } = system.recruitHammerman({});
            system.levelUpHammerman(hammerman.hammermanId);
            system.raiseImpact(hammerman.hammermanId, 5);
            system.addHammer(hammerman.hammermanId, 'Sledge');
            // level=2, impact=25, hammers.length=1 => 2*100 + 25*2 + 1*30 = 200+50+30 = 280
            expect(system.calculateHammermanValue(hammerman.hammermanId)).toBe(280);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateHammermanValue('ghost')).toBe(0);
        });
    });

    describe('listVeterans', () => {
        it('should filter', () => {
            const { hammerman } = system.recruitHammerman({});
            for (let i = 0; i < 4; i++) system.levelUpHammerman(hammerman.hammermanId);
            system.recruitHammerman({});
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

        it('should execute default getHammerman', () => {
            const result = system.executeTool('getHammerman', { hammermanId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('hammermanRecruited', () => count++);
            unregister();
            system.recruitHammerman({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('hammermanRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitHammerman({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalHammermen = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalHammermen = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitHammerman({});
            const json = system.toJSON();
            expect(json.hammermen.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitHammerman({});
            const json = system.toJSON();
            const newSys = new CultivationHammerman();
            newSys.fromJSON(json);
            expect(newSys.hammermen.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.hammermanCount).toBe(0);
        });
    });
});
