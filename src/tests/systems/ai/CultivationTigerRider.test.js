/**
 * CultivationTigerRider.test.js - 修真虎骑系统测试
 * V645 Iteration 28/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationTigerRider } from '../../../systems/ai/CultivationTigerRider.js';

describe('CultivationTigerRider', () => {
    let system;
    beforeEach(() => { system = new CultivationTigerRider(); });

    describe('recruitTigerRider', () => {
        it('should recruit', () => {
            const { rider } = system.recruitTigerRider({ masterId: 'm1', name: 'Bengal Knight' });
            expect(rider.masterId).toBe('m1');
            expect(rider.name).toBe('Bengal Knight');
        });

        it('should default to novice status', () => {
            const { rider } = system.recruitTigerRider({});
            expect(rider.status).toBe('novice');
        });

        it('should default to bengal type', () => {
            const { rider } = system.recruitTigerRider({});
            expect(rider.type).toBe('bengal');
        });

        it('should default bond to baseBond', () => {
            const { rider } = system.recruitTigerRider({});
            expect(rider.bond).toBe(20);
        });

        it('should trigger tigerRiderRecruited hook', () => {
            let called = false;
            system.registerHook('tigerRiderRecruited', () => { called = true; });
            system.recruitTigerRider({});
            expect(called).toBe(true);
        });
    });

    describe('getTigerRider', () => {
        it('should return', () => {
            const { rider } = system.recruitTigerRider({});
            expect(system.getTigerRider(rider.riderId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTigerRider('ghost')).toBeNull(); });
    });

    describe('listTigerRiders', () => {
        it('should list all', () => {
            system.recruitTigerRider({});
            system.recruitTigerRider({});
            expect(system.listTigerRiders().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitTigerRider({ masterId: 'm1' });
            system.recruitTigerRider({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { rider } = system.recruitTigerRider({});
            system.legendTigerRider(rider.riderId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitTigerRider({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addTiger', () => {
        it('should add tiger', () => {
            const { rider } = system.recruitTigerRider({});
            system.addTiger(rider.riderId, { name: 'Fang' });
            expect(rider.tigers.length).toBe(1);
        });

        it('should reject missing rider', () => {
            const result = system.addTiger('ghost', { name: 'Fang' });
            expect(result.error).toBe('RIDER_NOT_FOUND');
        });

        it('should trigger tigerAdded hook', () => {
            const { rider } = system.recruitTigerRider({});
            let called = false;
            system.registerHook('tigerAdded', () => { called = true; });
            system.addTiger(rider.riderId, { name: 'Fang' });
            expect(called).toBe(true);
        });
    });

    describe('tameBond', () => {
        it('should tame bond', () => {
            const { rider } = system.recruitTigerRider({ bond: 20 });
            system.tameBond(rider.riderId, 10);
            expect(rider.bond).toBe(30);
        });

        it('should default amount to 5', () => {
            const { rider } = system.recruitTigerRider({ bond: 20 });
            system.tameBond(rider.riderId);
            expect(rider.bond).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.tameBond('ghost', 5);
            expect(result.error).toBe('RIDER_NOT_FOUND');
        });

        it('should trigger bondTamed hook', () => {
            const { rider } = system.recruitTigerRider({});
            let called = false;
            system.registerHook('bondTamed', () => { called = true; });
            system.tameBond(rider.riderId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpTigerRider', () => {
        it('should level up', () => {
            const { rider } = system.recruitTigerRider({});
            system.levelUpTigerRider(rider.riderId);
            expect(rider.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpTigerRider('ghost');
            expect(result.error).toBe('RIDER_NOT_FOUND');
        });

        it('should trigger tigerRiderLeveledUp hook', () => {
            const { rider } = system.recruitTigerRider({});
            let called = false;
            system.registerHook('tigerRiderLeveledUp', () => { called = true; });
            system.levelUpTigerRider(rider.riderId);
            expect(called).toBe(true);
        });
    });

    describe('legendTigerRider', () => {
        it('should set status to legendary', () => {
            const { rider } = system.recruitTigerRider({});
            system.legendTigerRider(rider.riderId);
            expect(rider.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendTigerRider('ghost');
            expect(result.error).toBe('RIDER_NOT_FOUND');
        });

        it('should trigger tigerRiderLegendized hook', () => {
            const { rider } = system.recruitTigerRider({});
            let called = false;
            system.registerHook('tigerRiderLegendized', () => { called = true; });
            system.legendTigerRider(rider.riderId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTigerRiderValue', () => {
        it('should calculate', () => {
            const { rider } = system.recruitTigerRider({ level: 2, bond: 30 });
            system.addTiger(rider.riderId, { name: 'A' });
            // 2*100 + 30*2 + 1*30 = 200 + 60 + 30 = 290
            expect(system.calculateTigerRiderValue(rider.riderId)).toBe(290);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTigerRiderValue('ghost')).toBe(0);
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

        it('should execute default getTigerRider', () => {
            const result = system.executeTool('getTigerRider', { riderId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('tigerRiderRecruited', () => count++);
            unregister();
            system.recruitTigerRider({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('tigerRiderRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitTigerRider({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTigerRiders = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalTigerRiders = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitTigerRider({});
            const json = system.toJSON();
            expect(json.tigerriders.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitTigerRider({});
            const json = system.toJSON();
            const newSys = new CultivationTigerRider();
            newSys.fromJSON(json);
            expect(newSys.tigerriders.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.tigerRiderCount).toBe(0);
        });
    });
});
