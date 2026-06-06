/**
 * CultivationDragonRider.test.js - 修真龙骑系统测试
 * V643 Iteration 26/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationDragonRider } from '../../../systems/ai/CultivationDragonRider.js';

describe('CultivationDragonRider', () => {
    let system;
    beforeEach(() => { system = new CultivationDragonRider(); });

    describe('recruitDragonRider', () => {
        it('should recruit', () => {
            const { rider } = system.recruitDragonRider({ trainerId: 't1', name: 'Azure Knight' });
            expect(rider.trainerId).toBe('t1');
            expect(rider.name).toBe('Azure Knight');
        });

        it('should default to novice status', () => {
            const { rider } = system.recruitDragonRider({});
            expect(rider.status).toBe('novice');
        });

        it('should default to azure type', () => {
            const { rider } = system.recruitDragonRider({});
            expect(rider.type).toBe('azure');
        });

        it('should default bond to baseBond', () => {
            const { rider } = system.recruitDragonRider({});
            expect(rider.bond).toBe(20);
        });

        it('should trigger dragonRiderRecruited hook', () => {
            let called = false;
            system.registerHook('dragonRiderRecruited', () => { called = true; });
            system.recruitDragonRider({});
            expect(called).toBe(true);
        });
    });

    describe('getDragonRider', () => {
        it('should return', () => {
            const { rider } = system.recruitDragonRider({});
            expect(system.getDragonRider(rider.riderId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDragonRider('ghost')).toBeNull(); });
    });

    describe('listDragonRiders', () => {
        it('should list all', () => {
            system.recruitDragonRider({});
            system.recruitDragonRider({});
            expect(system.listDragonRiders().length).toBe(2);
        });
    });

    describe('listByTrainer', () => {
        it('should filter by trainer', () => {
            system.recruitDragonRider({ trainerId: 't1' });
            system.recruitDragonRider({ trainerId: 't2' });
            expect(system.listByTrainer('t1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { rider } = system.recruitDragonRider({});
            system.legendDragonRider(rider.riderId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitDragonRider({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addDragon', () => {
        it('should add dragon', () => {
            const { rider } = system.recruitDragonRider({});
            system.addDragon(rider.riderId, { name: 'Fang' });
            expect(rider.dragons.length).toBe(1);
        });

        it('should reject missing rider', () => {
            const result = system.addDragon('ghost', { name: 'Fang' });
            expect(result.error).toBe('RIDER_NOT_FOUND');
        });

        it('should trigger dragonAdded hook', () => {
            const { rider } = system.recruitDragonRider({});
            let called = false;
            system.registerHook('dragonAdded', () => { called = true; });
            system.addDragon(rider.riderId, { name: 'Fang' });
            expect(called).toBe(true);
        });
    });

    describe('strengthenBond', () => {
        it('should strengthen bond', () => {
            const { rider } = system.recruitDragonRider({ bond: 20 });
            system.strengthenBond(rider.riderId, 10);
            expect(rider.bond).toBe(30);
        });

        it('should default amount to 5', () => {
            const { rider } = system.recruitDragonRider({ bond: 20 });
            system.strengthenBond(rider.riderId);
            expect(rider.bond).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.strengthenBond('ghost', 5);
            expect(result.error).toBe('RIDER_NOT_FOUND');
        });

        it('should trigger bondStrengthened hook', () => {
            const { rider } = system.recruitDragonRider({});
            let called = false;
            system.registerHook('bondStrengthened', () => { called = true; });
            system.strengthenBond(rider.riderId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpDragonRider', () => {
        it('should level up', () => {
            const { rider } = system.recruitDragonRider({});
            system.levelUpDragonRider(rider.riderId);
            expect(rider.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpDragonRider('ghost');
            expect(result.error).toBe('RIDER_NOT_FOUND');
        });

        it('should trigger dragonRiderLeveledUp hook', () => {
            const { rider } = system.recruitDragonRider({});
            let called = false;
            system.registerHook('dragonRiderLeveledUp', () => { called = true; });
            system.levelUpDragonRider(rider.riderId);
            expect(called).toBe(true);
        });
    });

    describe('legendDragonRider', () => {
        it('should set status to legendary', () => {
            const { rider } = system.recruitDragonRider({});
            system.legendDragonRider(rider.riderId);
            expect(rider.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendDragonRider('ghost');
            expect(result.error).toBe('RIDER_NOT_FOUND');
        });

        it('should trigger dragonRiderLegendized hook', () => {
            const { rider } = system.recruitDragonRider({});
            let called = false;
            system.registerHook('dragonRiderLegendized', () => { called = true; });
            system.legendDragonRider(rider.riderId);
            expect(called).toBe(true);
        });
    });

    describe('calculateDragonRiderValue', () => {
        it('should calculate', () => {
            const { rider } = system.recruitDragonRider({ level: 2, bond: 30 });
            system.addDragon(rider.riderId, { name: 'A' });
            // 2*100 + 30*2 + 1*30 = 200 + 60 + 30 = 290
            expect(system.calculateDragonRiderValue(rider.riderId)).toBe(290);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateDragonRiderValue('ghost')).toBe(0);
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

        it('should default context when undefined', () => {
            system.registerTool('noCtx', () => 'ok');
            const result = system.executeTool('noCtx');
            expect(result.result).toBe('ok');
        });

        it('should execute default getDragonRider', () => {
            const result = system.executeTool('getDragonRider', { riderId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('dragonRiderRecruited', () => count++);
            unregister();
            system.recruitDragonRider({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('dragonRiderRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitDragonRider({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDragonRiders = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDragonRiders = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitDragonRider({});
            const json = system.toJSON();
            expect(json.dragonriders.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitDragonRider({});
            const json = system.toJSON();
            const newSys = new CultivationDragonRider();
            newSys.fromJSON(json);
            expect(newSys.dragonriders.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.dragonRiderCount).toBe(0);
        });
    });
});
