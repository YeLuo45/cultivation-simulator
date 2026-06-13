/**
 * CultivationDestiny.test.js - 修真天意测试
 * V742 Iteration 5/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDestiny } from '../../../systems/ai/CultivationDestiny.js';

describe('CultivationDestiny', () => {
    let system;
    beforeEach(() => { system = new CultivationDestiny(); });

    describe('recruitDestiny', () => {
        it('should recruit', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1', name: 'Destiny1', type: 'chosen' });
            expect(destiny.masterId).toBe('m1');
            expect(destiny.name).toBe('Destiny1');
            expect(destiny.type).toBe('chosen');
        });

        it('should default name to unnamed', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            expect(destiny.name).toBe('unnamed');
        });

        it('should default type to chosen', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            expect(destiny.type).toBe('chosen');
        });

        it('should default fate to baseFate', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            expect(destiny.fate).toBe(20);
        });

        it('should set level to 1 and status to novice', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            expect(destiny.level).toBe(1);
            expect(destiny.status).toBe('novice');
        });

        it('should init empty omens', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            expect(destiny.omens).toEqual([]);
        });

        it('should generate id if not provided', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            expect(destiny.destinyId).toBeTruthy();
        });

        it('should respect provided id', () => {
            const { destiny } = system.recruitDestiny({ id: 'custom-destiny', masterId: 'm1' });
            expect(destiny.destinyId).toBe('custom-destiny');
        });

        it('should accept custom omens', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1', omens: ['o1', 'o2'] });
            expect(destiny.omens.length).toBe(2);
        });

        it('should accept custom fate', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1', fate: 99 });
            expect(destiny.fate).toBe(99);
        });

        it('should increment totalDestinies', () => {
            system.recruitDestiny({ masterId: 'm1' });
            expect(system.stats.totalDestinies).toBe(1);
        });

        it('should trigger destinyRecruited hook', () => {
            let called = false;
            system.registerHook('destinyRecruited', () => { called = true; });
            system.recruitDestiny({ masterId: 'm1' });
            expect(called).toBe(true);
        });
    });

    describe('getDestiny', () => {
        it('should return destiny', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            expect(system.getDestiny(destiny.destinyId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDestiny('ghost')).toBeNull(); });
    });

    describe('listDestinies', () => {
        it('should list all', () => {
            system.recruitDestiny({ masterId: 'm1' });
            system.recruitDestiny({ masterId: 'm2' });
            expect(system.listDestinies().length).toBe(2);
        });

        it('should return empty array when none', () => {
            expect(system.listDestinies().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitDestiny({ masterId: 'm1' });
            system.recruitDestiny({ masterId: 'm2' });
            system.recruitDestiny({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for unknown master', () => {
            system.recruitDestiny({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should list only legendary', () => {
            const { destiny: d1 } = system.recruitDestiny({ masterId: 'm1' });
            system.recruitDestiny({ masterId: 'm1' });
            system.legendDestiny(d1.destinyId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitDestiny({ masterId: 'm1' });
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addOmen', () => {
        it('should add omen', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            system.addOmen(destiny.destinyId, 'o1');
            expect(destiny.omens.length).toBe(1);
            expect(destiny.omens[0]).toBe('o1');
        });

        it('should reject missing destiny', () => {
            const result = system.addOmen('ghost', 'o1');
            expect(result.error).toBe('DESTINY_NOT_FOUND');
        });

        it('should promote to veteran at 3 omens', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            system.addOmen(destiny.destinyId, 'o1');
            system.addOmen(destiny.destinyId, 'o2');
            system.addOmen(destiny.destinyId, 'o3');
            expect(destiny.status).toBe('veteran');
        });

        it('should not promote past veteran', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            system.legendDestiny(destiny.destinyId);
            system.addOmen(destiny.destinyId, 'o1');
            system.addOmen(destiny.destinyId, 'o2');
            system.addOmen(destiny.destinyId, 'o3');
            expect(destiny.status).toBe('legendary');
        });

        it('should trigger omenAdded hook', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            let called = false;
            system.registerHook('omenAdded', () => { called = true; });
            system.addOmen(destiny.destinyId, 'o1');
            expect(called).toBe(true);
        });
    });

    describe('raiseFate', () => {
        it('should raise by default 5', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            system.raiseFate(destiny.destinyId);
            expect(destiny.fate).toBe(25);
        });

        it('should raise by custom amount', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            system.raiseFate(destiny.destinyId, 50);
            expect(destiny.fate).toBe(70);
        });

        it('should reject missing destiny', () => {
            const result = system.raiseFate('ghost', 5);
            expect(result.error).toBe('DESTINY_NOT_FOUND');
        });

        it('should trigger fateRaised hook', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            let called = false;
            system.registerHook('fateRaised', () => { called = true; });
            system.raiseFate(destiny.destinyId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDestiny', () => {
        it('should level up', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            system.levelUpDestiny(destiny.destinyId);
            expect(destiny.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            system.levelUpDestiny(destiny.destinyId);
            system.levelUpDestiny(destiny.destinyId);
            system.levelUpDestiny(destiny.destinyId);
            expect(destiny.level).toBe(4);
        });

        it('should reject missing destiny', () => {
            const result = system.levelUpDestiny('ghost');
            expect(result.error).toBe('DESTINY_NOT_FOUND');
        });

        it('should trigger destinyLeveledUp hook', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            let called = false;
            system.registerHook('destinyLeveledUp', () => { called = true; });
            system.levelUpDestiny(destiny.destinyId);
            expect(called).toBe(true);
        });
    });

    describe('legendDestiny', () => {
        it('should set status to legendary', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            system.legendDestiny(destiny.destinyId);
            expect(destiny.status).toBe('legendary');
        });

        it('should reject missing destiny', () => {
            const result = system.legendDestiny('ghost');
            expect(result.error).toBe('DESTINY_NOT_FOUND');
        });

        it('should trigger destinyLegendized hook', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            let called = false;
            system.registerHook('destinyLegendized', () => { called = true; });
            system.legendDestiny(destiny.destinyId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDestinyValue', () => {
        it('should calculate base value', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            // level=1, fate=20, omens=0 -> 100 + 40 + 0 = 140
            expect(system.calculateDestinyValue(destiny.destinyId)).toBe(140);
        });

        it('should factor in level', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            system.levelUpDestiny(destiny.destinyId);
            system.levelUpDestiny(destiny.destinyId);
            // level=3, fate=20, omens=0 -> 300 + 40 + 0 = 340
            expect(system.calculateDestinyValue(destiny.destinyId)).toBe(340);
        });

        it('should factor in omens', () => {
            const { destiny } = system.recruitDestiny({ masterId: 'm1' });
            system.addOmen(destiny.destinyId, 'o1');
            system.addOmen(destiny.destinyId, 'o2');
            // level=1, fate=20, omens=2 -> 100 + 40 + 60 = 200
            expect(system.calculateDestinyValue(destiny.destinyId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDestinyValue('ghost')).toBe(0);
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

        it('should execute default getDestiny', () => {
            const result = system.executeTool('getDestiny', { destinyId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('destinyRecruited', () => count++);
            unregister();
            system.recruitDestiny({ masterId: 'm1' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('destinyRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitDestiny({ masterId: 'm1' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDestinies = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalDestinies = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitDestiny({ masterId: 'm1' });
            const json = system.toJSON();
            expect(json.destinies.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitDestiny({ masterId: 'm1' });
            const json = system.toJSON();
            const newSys = new CultivationDestiny();
            newSys.fromJSON(json);
            expect(newSys.destinies.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.destinyCount).toBe(0);
            expect(stats.totalDestinies).toBe(0);
        });
    });

    describe('config defaults', () => {
        it('should accept custom config', () => {
            const sys = new CultivationDestiny({ maxDestinies: 50, baseFate: 10 });
            expect(sys.config.maxDestinies).toBe(50);
            expect(sys.config.baseFate).toBe(10);
        });
    });
});
