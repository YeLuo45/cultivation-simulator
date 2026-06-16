/**
 * CultivationFortress.test.js - 修真要塞测试
 * V717 Iteration 10/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationFortress } from '../../../systems/ai/CultivationFortress.js';

describe('CultivationFortress', () => {
    let system;
    beforeEach(() => { system = new CultivationFortress(); });

    describe('recruitFortress', () => {
        it('should recruit', () => {
            const { fortress } = system.recruitFortress({ masterId: 'm1', name: 'Ironhold', type: 'jade' });
            expect(fortress.masterId).toBe('m1');
            expect(fortress.name).toBe('Ironhold');
            expect(fortress.type).toBe('jade');
        });

        it('should default to iron type and novice status', () => {
            const { fortress } = system.recruitFortress({ masterId: 'm1', name: 'Bastion' });
            expect(fortress.type).toBe('iron');
            expect(fortress.status).toBe('novice');
            expect(fortress.garrison).toBe(20);
            expect(fortress.level).toBe(1);
        });

        it('should accept custom garrison and towers', () => {
            const { fortress } = system.recruitFortress({ masterId: 'm1', name: 'Keep', type: 'grand', garrison: 50, towers: ['t1', 't2'] });
            expect(fortress.garrison).toBe(50);
            expect(fortress.towers.length).toBe(2);
        });

        it('should trigger fortressRecruited hook', () => {
            let called = false;
            system.registerHook('fortressRecruited', () => { called = true; });
            system.recruitFortress({ masterId: 'm1', name: 'X' });
            expect(called).toBe(true);
        });
    });

    describe('getFortress', () => {
        it('should return', () => {
            const { fortress } = system.recruitFortress({ masterId: 'm1', name: 'X' });
            expect(system.getFortress(fortress.fortressId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getFortress('ghost')).toBeNull(); });
    });

    describe('listFortresses', () => {
        it('should list all', () => {
            system.recruitFortress({ masterId: 'm1', name: 'A' });
            system.recruitFortress({ masterId: 'm2', name: 'B' });
            expect(system.listFortresses().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitFortress({ masterId: 'm1', name: 'A' });
            system.recruitFortress({ masterId: 'm2', name: 'B' });
            system.recruitFortress({ masterId: 'm1', name: 'C' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should filter by legendary status', () => {
            const { fortress } = system.recruitFortress({ masterId: 'm1', name: 'A' });
            system.recruitFortress({ masterId: 'm2', name: 'B' });
            system.legendFortress(fortress.fortressId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addTower', () => {
        it('should add tower', () => {
            const { fortress } = system.recruitFortress({ masterId: 'm1', name: 'A' });
            system.addTower(fortress.fortressId, 'Watch Tower');
            expect(fortress.towers.length).toBe(1);
            expect(fortress.towers[0]).toBe('Watch Tower');
        });

        it('should reject missing', () => {
            const result = system.addTower('ghost', 't');
            expect(result.error).toBe('FORTRESS_NOT_FOUND');
        });

        it('should trigger towerAdded hook', () => {
            const { fortress } = system.recruitFortress({ masterId: 'm1', name: 'A' });
            let called = false;
            system.registerHook('towerAdded', () => { called = true; });
            system.addTower(fortress.fortressId, 'Arrow Tower');
            expect(called).toBe(true);
        });
    });

    describe('raiseGarrison', () => {
        it('should raise by amount', () => {
            const { fortress } = system.recruitFortress({ masterId: 'm1', name: 'A' });
            system.raiseGarrison(fortress.fortressId, 15);
            expect(fortress.garrison).toBe(35);
        });

        it('should use default amount of 5', () => {
            const { fortress } = system.recruitFortress({ masterId: 'm1', name: 'A' });
            system.raiseGarrison(fortress.fortressId);
            expect(fortress.garrison).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseGarrison('ghost', 100);
            expect(result.error).toBe('FORTRESS_NOT_FOUND');
        });

        it('should trigger garrisonRaised hook', () => {
            const { fortress } = system.recruitFortress({ masterId: 'm1', name: 'A' });
            let called = false;
            system.registerHook('garrisonRaised', () => { called = true; });
            system.raiseGarrison(fortress.fortressId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpFortress', () => {
        it('should level up', () => {
            const { fortress } = system.recruitFortress({ masterId: 'm1', name: 'A' });
            system.levelUpFortress(fortress.fortressId);
            expect(fortress.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpFortress('ghost');
            expect(result.error).toBe('FORTRESS_NOT_FOUND');
        });

        it('should trigger fortressLeveledUp hook', () => {
            const { fortress } = system.recruitFortress({ masterId: 'm1', name: 'A' });
            let called = false;
            system.registerHook('fortressLeveledUp', () => { called = true; });
            system.levelUpFortress(fortress.fortressId);
            expect(called).toBe(true);
        });
    });

    describe('legendFortress', () => {
        it('should set status to legendary', () => {
            const { fortress } = system.recruitFortress({ masterId: 'm1', name: 'A' });
            system.legendFortress(fortress.fortressId);
            expect(fortress.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendFortress('ghost');
            expect(result.error).toBe('FORTRESS_NOT_FOUND');
        });

        it('should trigger fortressLegendized hook', () => {
            const { fortress } = system.recruitFortress({ masterId: 'm1', name: 'A' });
            let called = false;
            system.registerHook('fortressLegendized', () => { called = true; });
            system.legendFortress(fortress.fortressId);
            expect(called).toBe(true);
        });
    });

    describe('calculateFortressValue', () => {
        it('should calculate value', () => {
            const { fortress } = system.recruitFortress({ masterId: 'm1', name: 'A' });
            system.levelUpFortress(fortress.fortressId);
            system.levelUpFortress(fortress.fortressId);
            system.raiseGarrison(fortress.fortressId, 5);
            system.addTower(fortress.fortressId, 't1');
            system.addTower(fortress.fortressId, 't2');
            system.addTower(fortress.fortressId, 't3');
            // level=3, garrison=25, towers.length=3 => 3*100 + 25*2 + 3*30 = 300 + 50 + 90 = 440
            expect(system.calculateFortressValue(fortress.fortressId)).toBe(440);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateFortressValue('ghost')).toBe(0);
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

        it('should execute default getFortress', () => {
            const result = system.executeTool('getFortress', { fortressId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('fortressRecruited', () => count++);
            unregister();
            system.recruitFortress({ masterId: 'm1', name: 'X' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('fortressRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitFortress({ masterId: 'm1', name: 'X' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalFortresses = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalFortresses = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitFortress({ masterId: 'm1', name: 'A' });
            const json = system.toJSON();
            expect(json.fortresses.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitFortress({ masterId: 'm1', name: 'A' });
            const json = system.toJSON();
            const newSys = new CultivationFortress();
            newSys.fromJSON(json);
            expect(newSys.fortresses.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.fortressCount).toBe(0);
        });
    });
});
