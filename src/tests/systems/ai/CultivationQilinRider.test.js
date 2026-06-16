/**
 * CultivationQilinRider.test.js - 修真麒麟骑系统测试
 * V646 Iteration 29/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationQilinRider } from '../../../systems/ai/CultivationQilinRider.js';

describe('CultivationQilinRider', () => {
    let system;
    beforeEach(() => { system = new CultivationQilinRider(); });

    describe('recruitQilinRider', () => {
        it('should recruit', () => {
            const { rider } = system.recruitQilinRider({ senseiId: 's1', name: 'Jade Knight' });
            expect(rider.senseiId).toBe('s1');
            expect(rider.name).toBe('Jade Knight');
        });

        it('should default to novice status', () => {
            const { rider } = system.recruitQilinRider({});
            expect(rider.status).toBe('novice');
        });

        it('should default to golden type', () => {
            const { rider } = system.recruitQilinRider({});
            expect(rider.type).toBe('golden');
        });

        it('should default bond to baseBond', () => {
            const { rider } = system.recruitQilinRider({});
            expect(rider.bond).toBe(20);
        });

        it('should trigger qilinRiderRecruited hook', () => {
            let called = false;
            system.registerHook('qilinRiderRecruited', () => { called = true; });
            system.recruitQilinRider({});
            expect(called).toBe(true);
        });
    });

    describe('getQilinRider', () => {
        it('should return', () => {
            const { rider } = system.recruitQilinRider({});
            expect(system.getQilinRider(rider.riderId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getQilinRider('ghost')).toBeNull(); });
    });

    describe('listQilinRiders', () => {
        it('should list all', () => {
            system.recruitQilinRider({});
            system.recruitQilinRider({});
            expect(system.listQilinRiders().length).toBe(2);
        });
    });

    describe('listBySensei', () => {
        it('should filter by sensei', () => {
            system.recruitQilinRider({ senseiId: 's1' });
            system.recruitQilinRider({ senseiId: 's2' });
            expect(system.listBySensei('s1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { rider } = system.recruitQilinRider({});
            system.legendQilinRider(rider.riderId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitQilinRider({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addQilin', () => {
        it('should add qilin', () => {
            const { rider } = system.recruitQilinRider({});
            system.addQilin(rider.riderId, { name: 'Sparkle' });
            expect(rider.qilins.length).toBe(1);
        });

        it('should reject missing rider', () => {
            const result = system.addQilin('ghost', { name: 'Sparkle' });
            expect(result.error).toBe('RIDER_NOT_FOUND');
        });

        it('should trigger qilinAdded hook', () => {
            const { rider } = system.recruitQilinRider({});
            let called = false;
            system.registerHook('qilinAdded', () => { called = true; });
            system.addQilin(rider.riderId, { name: 'Sparkle' });
            expect(called).toBe(true);
        });
    });

    describe('raiseBond', () => {
        it('should raise bond', () => {
            const { rider } = system.recruitQilinRider({ bond: 20 });
            system.raiseBond(rider.riderId, 10);
            expect(rider.bond).toBe(30);
        });

        it('should default amount to 5', () => {
            const { rider } = system.recruitQilinRider({ bond: 20 });
            system.raiseBond(rider.riderId);
            expect(rider.bond).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseBond('ghost', 5);
            expect(result.error).toBe('RIDER_NOT_FOUND');
        });

        it('should trigger bondRaised hook', () => {
            const { rider } = system.recruitQilinRider({});
            let called = false;
            system.registerHook('bondRaised', () => { called = true; });
            system.raiseBond(rider.riderId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpQilinRider', () => {
        it('should level up', () => {
            const { rider } = system.recruitQilinRider({});
            system.levelUpQilinRider(rider.riderId);
            expect(rider.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpQilinRider('ghost');
            expect(result.error).toBe('RIDER_NOT_FOUND');
        });

        it('should trigger qilinRiderLeveledUp hook', () => {
            const { rider } = system.recruitQilinRider({});
            let called = false;
            system.registerHook('qilinRiderLeveledUp', () => { called = true; });
            system.levelUpQilinRider(rider.riderId);
            expect(called).toBe(true);
        });
    });

    describe('legendQilinRider', () => {
        it('should set status to legendary', () => {
            const { rider } = system.recruitQilinRider({});
            system.legendQilinRider(rider.riderId);
            expect(rider.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendQilinRider('ghost');
            expect(result.error).toBe('RIDER_NOT_FOUND');
        });

        it('should trigger qilinRiderLegendized hook', () => {
            const { rider } = system.recruitQilinRider({});
            let called = false;
            system.registerHook('qilinRiderLegendized', () => { called = true; });
            system.legendQilinRider(rider.riderId);
            expect(called).toBe(true);
        });
    });

    describe('calculateQilinRiderValue', () => {
        it('should calculate', () => {
            const { rider } = system.recruitQilinRider({ level: 2, bond: 30 });
            system.addQilin(rider.riderId, { name: 'A' });
            // 2*100 + 30*2 + 1*30 = 200 + 60 + 30 = 290
            expect(system.calculateQilinRiderValue(rider.riderId)).toBe(290);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateQilinRiderValue('ghost')).toBe(0);
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

        it('should execute default getQilinRider', () => {
            const result = system.executeTool('getQilinRider', { riderId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('qilinRiderRecruited', () => count++);
            unregister();
            system.recruitQilinRider({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('qilinRiderRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitQilinRider({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalQilinRiders = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalQilinRiders = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitQilinRider({});
            const json = system.toJSON();
            expect(json.qilinriders.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitQilinRider({});
            const json = system.toJSON();
            const newSys = new CultivationQilinRider();
            newSys.fromJSON(json);
            expect(newSys.qilinriders.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.qilinRiderCount).toBe(0);
        });
    });
});
