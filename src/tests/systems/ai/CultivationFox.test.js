/**
 * CultivationFox.test.js - 修真狐测试
 * V721 Iteration 14/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationFox } from '../../../systems/ai/CultivationFox.js';

describe('CultivationFox', () => {
    let system;
    beforeEach(() => { system = new CultivationFox(); });

    describe('recruitFox', () => {
        it('should create a fox', () => {
            const { fox } = system.recruitFox({ name: 'Huli' });
            expect(fox.name).toBe('Huli');
        });

        it('should default type to white', () => {
            const { fox } = system.recruitFox({});
            expect(fox.type).toBe('white');
        });

        it('should default cunning to baseCunning (20)', () => {
            const { fox } = system.recruitFox({});
            expect(fox.cunning).toBe(20);
        });

        it('should default status to novice', () => {
            const { fox } = system.recruitFox({});
            expect(fox.status).toBe('novice');
        });

        it('should trigger foxRecruited hook', () => {
            let called = false;
            system.registerHook('foxRecruited', () => { called = true; });
            system.recruitFox({});
            expect(called).toBe(true);
        });

        it('should increment totalFoxes stat', () => {
            system.recruitFox({});
            expect(system.stats.totalFoxes).toBe(1);
        });
    });

    describe('getFox', () => {
        it('should return fox by id', () => {
            const { fox } = system.recruitFox({});
            expect(system.getFox(fox.foxId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getFox('ghost')).toBeNull(); });
    });

    describe('listFoxes', () => {
        it('should list all foxes', () => {
            system.recruitFox({});
            system.recruitFox({});
            expect(system.listFoxes().length).toBe(2);
        });
        it('should return empty list when no foxes', () => {
            expect(system.listFoxes().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by masterId', () => {
            system.recruitFox({ masterId: 'm1' });
            system.recruitFox({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitFox({ type: 'nine-tailed' });
            system.recruitFox({ type: 'celestial' });
            expect(system.listByType('nine-tailed').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary foxes', () => {
            system.recruitFox({});
            const { fox } = system.recruitFox({});
            system.legendFox(fox.foxId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none are legendary', () => {
            system.recruitFox({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addTail', () => {
        it('should add a tail to the array', () => {
            const { fox } = system.recruitFox({});
            system.addTail(fox.foxId, 'fire-tail');
            expect(fox.tails.length).toBe(1);
            expect(fox.tails[0]).toBe('fire-tail');
        });

        it('should reject missing fox', () => {
            const result = system.addTail('ghost', 'tail');
            expect(result.error).toBe('FOX_NOT_FOUND');
        });

        it('should trigger tailAdded hook', () => {
            const { fox } = system.recruitFox({});
            let called = false;
            system.registerHook('tailAdded', () => { called = true; });
            system.addTail(fox.foxId, 'ice-tail');
            expect(called).toBe(true);
        });
    });

    describe('raiseCunning', () => {
        it('should raise cunning by default 5', () => {
            const { fox } = system.recruitFox({});
            system.raiseCunning(fox.foxId);
            expect(fox.cunning).toBe(25);
        });

        it('should raise cunning by custom amount', () => {
            const { fox } = system.recruitFox({});
            system.raiseCunning(fox.foxId, 10);
            expect(fox.cunning).toBe(30);
        });

        it('should reject missing fox', () => {
            const result = system.raiseCunning('ghost', 5);
            expect(result.error).toBe('FOX_NOT_FOUND');
        });

        it('should trigger cunningRaised hook', () => {
            const { fox } = system.recruitFox({});
            let called = false;
            system.registerHook('cunningRaised', () => { called = true; });
            system.raiseCunning(fox.foxId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpFox', () => {
        it('should increment level', () => {
            const { fox } = system.recruitFox({});
            system.levelUpFox(fox.foxId);
            expect(fox.level).toBe(2);
        });

        it('should reject missing fox', () => {
            const result = system.levelUpFox('ghost');
            expect(result.error).toBe('FOX_NOT_FOUND');
        });

        it('should trigger foxLeveledUp hook', () => {
            const { fox } = system.recruitFox({});
            let called = false;
            system.registerHook('foxLeveledUp', () => { called = true; });
            system.levelUpFox(fox.foxId);
            expect(called).toBe(true);
        });
    });

    describe('legendFox', () => {
        it('should set status to legendary', () => {
            const { fox } = system.recruitFox({});
            system.legendFox(fox.foxId);
            expect(fox.status).toBe('legendary');
        });

        it('should reject missing fox', () => {
            const result = system.legendFox('ghost');
            expect(result.error).toBe('FOX_NOT_FOUND');
        });

        it('should trigger foxLegendized hook', () => {
            const { fox } = system.recruitFox({});
            let called = false;
            system.registerHook('foxLegendized', () => { called = true; });
            system.legendFox(fox.foxId);
            expect(called).toBe(true);
        });
    });

    describe('trainFox', () => {
        it('should set status to veteran', () => {
            const { fox } = system.recruitFox({});
            system.trainFox(fox.foxId);
            expect(fox.status).toBe('veteran');
        });

        it('should reject missing fox', () => {
            const result = system.trainFox('ghost');
            expect(result.error).toBe('FOX_NOT_FOUND');
        });

        it('should trigger foxTrained hook', () => {
            const { fox } = system.recruitFox({});
            let called = false;
            system.registerHook('foxTrained', () => { called = true; });
            system.trainFox(fox.foxId);
            expect(called).toBe(true);
        });
    });

    describe('calculateFoxValue', () => {
        it('should calculate value: level*100 + cunning*2 + tails.length*30', () => {
            const { fox } = system.recruitFox({});
            fox.level = 2;
            fox.cunning = 30;
            fox.tails = ['a', 'b'];
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateFoxValue(fox.foxId)).toBe(320);
        });

        it('should return 0 for missing fox', () => {
            expect(system.calculateFoxValue('ghost')).toBe(0);
        });

        it('should calculate correctly with default values', () => {
            const { fox } = system.recruitFox({});
            // 1*100 + 20*2 + 0*30 = 100 + 40 + 0 = 140
            expect(system.calculateFoxValue(fox.foxId)).toBe(140);
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

        it('should execute default getFox tool', () => {
            const result = system.executeTool('getFox', { foxId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('foxRecruited', () => count++);
            unregister();
            system.recruitFox({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('foxRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitFox({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient foxes', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve when totalFoxes >= 5', () => {
            system.stats.totalFoxes = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalFoxes = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize to JSON', () => {
            system.recruitFox({});
            const json = system.toJSON();
            expect(json.foxes.length).toBe(1);
        });
        it('should deserialize from JSON', () => {
            system.recruitFox({});
            const json = system.toJSON();
            const newSys = new CultivationFox();
            newSys.fromJSON(json);
            expect(newSys.foxes.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats with foxCount', () => {
            const stats = system.getStats();
            expect(stats.foxCount).toBe(0);
        });

        it('should reflect foxCount after recruitment', () => {
            system.recruitFox({});
            system.recruitFox({});
            expect(system.getStats().foxCount).toBe(2);
        });
    });
});
