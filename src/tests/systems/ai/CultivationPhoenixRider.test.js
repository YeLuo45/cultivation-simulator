/**
 * CultivationPhoenixRider.test.js - 修真凤骑系统测试
 * V644 Iteration 27/30 Round 26 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationPhoenixRider } from '../../../systems/ai/CultivationPhoenixRider.js';

describe('CultivationPhoenixRider', () => {
    let system;
    beforeEach(() => { system = new CultivationPhoenixRider(); });

    describe('recruitPhoenixRider', () => {
        it('should recruit', () => {
            const { rider } = system.recruitPhoenixRider({ mentorId: 'm1', name: 'Crimson Wing' });
            expect(rider.mentorId).toBe('m1');
            expect(rider.name).toBe('Crimson Wing');
        });

        it('should default to novice status', () => {
            const { rider } = system.recruitPhoenixRider({});
            expect(rider.status).toBe('novice');
        });

        it('should default to vermilion type', () => {
            const { rider } = system.recruitPhoenixRider({});
            expect(rider.type).toBe('vermilion');
        });

        it('should default bond to baseBond', () => {
            const { rider } = system.recruitPhoenixRider({});
            expect(rider.bond).toBe(20);
        });

        it('should default level to 1', () => {
            const { rider } = system.recruitPhoenixRider({});
            expect(rider.level).toBe(1);
        });

        it('should default phoenixes to empty array', () => {
            const { rider } = system.recruitPhoenixRider({});
            expect(rider.phoenixes).toEqual([]);
        });

        it('should default name', () => {
            const { rider } = system.recruitPhoenixRider({});
            expect(rider.name).toBe('Vermilion Phoenix Rider');
        });

        it('should generate a riderId if not provided', () => {
            const { rider } = system.recruitPhoenixRider({});
            expect(rider.riderId).toBeTruthy();
            expect(typeof rider.riderId).toBe('string');
        });

        it('should accept custom riderId', () => {
            const { rider } = system.recruitPhoenixRider({ riderId: 'custom-phx-1' });
            expect(rider.riderId).toBe('custom-phx-1');
        });

        it('should accept snow type', () => {
            const { rider } = system.recruitPhoenixRider({ type: 'snow' });
            expect(rider.type).toBe('snow');
        });

        it('should accept peacock type', () => {
            const { rider } = system.recruitPhoenixRider({ type: 'peacock' });
            expect(rider.type).toBe('peacock');
        });

        it('should accept veteran status', () => {
            const { rider } = system.recruitPhoenixRider({ status: 'veteran' });
            expect(rider.status).toBe('veteran');
        });

        it('should increment totalPhoenixRiders stat', () => {
            expect(system.stats.totalPhoenixRiders).toBe(0);
            system.recruitPhoenixRider({});
            expect(system.stats.totalPhoenixRiders).toBe(1);
        });

        it('should set recruitedAt timestamp', () => {
            const before = Date.now();
            const { rider } = system.recruitPhoenixRider({});
            const after = Date.now();
            expect(rider.recruitedAt).toBeGreaterThanOrEqual(before);
            expect(rider.recruitedAt).toBeLessThanOrEqual(after);
        });

        it('should return success true', () => {
            const result = system.recruitPhoenixRider({});
            expect(result.success).toBe(true);
        });

        it('should accept custom bond value', () => {
            const { rider } = system.recruitPhoenixRider({ bond: 50 });
            expect(rider.bond).toBe(50);
        });

        it('should accept phoenixes array', () => {
            const phoenixes = [{ name: 'Huo' }];
            const { rider } = system.recruitPhoenixRider({ phoenixes });
            expect(rider.phoenixes).toEqual(phoenixes);
        });

        it('should trigger phoenixRiderRecruited hook', () => {
            let called = false;
            system.registerHook('phoenixRiderRecruited', () => { called = true; });
            system.recruitPhoenixRider({});
            expect(called).toBe(true);
        });
    });

    describe('getPhoenixRider', () => {
        it('should return rider', () => {
            const { rider } = system.recruitPhoenixRider({});
            expect(system.getPhoenixRider(rider.riderId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getPhoenixRider('ghost')).toBeNull(); });
        it('should return a copy of the rider', () => {
            const { rider } = system.recruitPhoenixRider({ name: 'Test' });
            const fetched = system.getPhoenixRider(rider.riderId);
            expect(fetched.name).toBe('Test');
            expect(fetched).not.toBe(rider);
        });
    });

    describe('listPhoenixRiders', () => {
        it('should return empty initially', () => {
            expect(system.listPhoenixRiders().length).toBe(0);
        });
        it('should list all', () => {
            system.recruitPhoenixRider({});
            system.recruitPhoenixRider({});
            expect(system.listPhoenixRiders().length).toBe(2);
        });
        it('should return copies', () => {
            const { rider } = system.recruitPhoenixRider({});
            const list = system.listPhoenixRiders();
            expect(list[0]).not.toBe(rider);
        });
    });

    describe('listByMentor', () => {
        it('should filter by mentor', () => {
            system.recruitPhoenixRider({ mentorId: 'm1' });
            system.recruitPhoenixRider({ mentorId: 'm2' });
            expect(system.listByMentor('m1').length).toBe(1);
        });
        it('should return empty for unknown mentor', () => {
            system.recruitPhoenixRider({ mentorId: 'm1' });
            expect(system.listByMentor('unknown').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { rider } = system.recruitPhoenixRider({});
            system.legendPhoenixRider(rider.riderId);
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitPhoenixRider({});
            expect(system.listLegendary().length).toBe(0);
        });

        it('should not include veteran riders', () => {
            system.recruitPhoenixRider({ status: 'veteran' });
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addPhoenix', () => {
        it('should add phoenix', () => {
            const { rider } = system.recruitPhoenixRider({});
            system.addPhoenix(rider.riderId, { name: 'Huo' });
            expect(rider.phoenixes.length).toBe(1);
        });

        it('should add multiple phoenixes', () => {
            const { rider } = system.recruitPhoenixRider({});
            system.addPhoenix(rider.riderId, { name: 'A' });
            system.addPhoenix(rider.riderId, { name: 'B' });
            expect(rider.phoenixes.length).toBe(2);
        });

        it('should reject missing rider', () => {
            const result = system.addPhoenix('ghost', { name: 'Huo' });
            expect(result.error).toBe('RIDER_NOT_FOUND');
        });

        it('should return success false when missing', () => {
            const result = system.addPhoenix('ghost', { name: 'Huo' });
            expect(result.success).toBe(false);
        });

        it('should trigger phoenixAdded hook', () => {
            const { rider } = system.recruitPhoenixRider({});
            let called = false;
            system.registerHook('phoenixAdded', () => { called = true; });
            system.addPhoenix(rider.riderId, { name: 'Huo' });
            expect(called).toBe(true);
        });
    });

    describe('deepenBond', () => {
        it('should deepen bond', () => {
            const { rider } = system.recruitPhoenixRider({ bond: 20 });
            system.deepenBond(rider.riderId, 10);
            expect(rider.bond).toBe(30);
        });

        it('should default amount to 5', () => {
            const { rider } = system.recruitPhoenixRider({ bond: 20 });
            system.deepenBond(rider.riderId);
            expect(rider.bond).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.deepenBond('ghost', 5);
            expect(result.error).toBe('RIDER_NOT_FOUND');
        });

        it('should return success false when missing', () => {
            const result = system.deepenBond('ghost', 5);
            expect(result.success).toBe(false);
        });

        it('should trigger bondDeepened hook', () => {
            const { rider } = system.recruitPhoenixRider({});
            let called = false;
            system.registerHook('bondDeepened', () => { called = true; });
            system.deepenBond(rider.riderId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpPhoenixRider', () => {
        it('should level up', () => {
            const { rider } = system.recruitPhoenixRider({});
            system.levelUpPhoenixRider(rider.riderId);
            expect(rider.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { rider } = system.recruitPhoenixRider({});
            system.levelUpPhoenixRider(rider.riderId);
            system.levelUpPhoenixRider(rider.riderId);
            system.levelUpPhoenixRider(rider.riderId);
            expect(rider.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpPhoenixRider('ghost');
            expect(result.error).toBe('RIDER_NOT_FOUND');
        });

        it('should return success false when missing', () => {
            const result = system.levelUpPhoenixRider('ghost');
            expect(result.success).toBe(false);
        });

        it('should trigger phoenixRiderLeveledUp hook', () => {
            const { rider } = system.recruitPhoenixRider({});
            let called = false;
            system.registerHook('phoenixRiderLeveledUp', () => { called = true; });
            system.levelUpPhoenixRider(rider.riderId);
            expect(called).toBe(true);
        });
    });

    describe('legendPhoenixRider', () => {
        it('should set status to legendary', () => {
            const { rider } = system.recruitPhoenixRider({});
            system.legendPhoenixRider(rider.riderId);
            expect(rider.status).toBe('legendary');
        });

        it('should upgrade from veteran to legendary', () => {
            const { rider } = system.recruitPhoenixRider({ status: 'veteran' });
            system.legendPhoenixRider(rider.riderId);
            expect(rider.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendPhoenixRider('ghost');
            expect(result.error).toBe('RIDER_NOT_FOUND');
        });

        it('should return success false when missing', () => {
            const result = system.legendPhoenixRider('ghost');
            expect(result.success).toBe(false);
        });

        it('should trigger phoenixRiderLegendized hook', () => {
            const { rider } = system.recruitPhoenixRider({});
            let called = false;
            system.registerHook('phoenixRiderLegendized', () => { called = true; });
            system.legendPhoenixRider(rider.riderId);
            expect(called).toBe(true);
        });
    });

    describe('calculatePhoenixRiderValue', () => {
        it('should calculate', () => {
            const { rider } = system.recruitPhoenixRider({ level: 2, bond: 30 });
            system.addPhoenix(rider.riderId, { name: 'A' });
            // 2*100 + 30*2 + 1*30 = 200 + 60 + 30 = 290
            expect(system.calculatePhoenixRiderValue(rider.riderId)).toBe(290);
        });

        it('should return 0 for missing', () => {
            expect(system.calculatePhoenixRiderValue('ghost')).toBe(0);
        });

        it('should calculate for default rider', () => {
            // level=1, bond=20, phoenixes=[] => 1*100 + 20*2 + 0 = 140
            const { rider } = system.recruitPhoenixRider({});
            expect(system.calculatePhoenixRiderValue(rider.riderId)).toBe(140);
        });

        it('should scale with multiple phoenixes', () => {
            const { rider } = system.recruitPhoenixRider({ level: 1, bond: 10 });
            system.addPhoenix(rider.riderId, { name: 'A' });
            system.addPhoenix(rider.riderId, { name: 'B' });
            system.addPhoenix(rider.riderId, { name: 'C' });
            // 1*100 + 10*2 + 3*30 = 210
            expect(system.calculatePhoenixRiderValue(rider.riderId)).toBe(210);
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

        it('should return success true when tool found', () => {
            system.registerTool('test', () => 'ok');
            const result = system.executeTool('test', {});
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

        it('should default context when undefined', () => {
            system.registerTool('noCtx', () => 'ok');
            const result = system.executeTool('noCtx');
            expect(result.result).toBe('ok');
        });

        it('should execute default getPhoenixRider tool', () => {
            const result = system.executeTool('getPhoenixRider', { riderId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default recruitPhoenixRider tool', () => {
            const result = system.executeTool('recruitPhoenixRider', { name: 'ToolRecruit' });
            expect(result.success).toBe(true);
            expect(result.result.rider.name).toBe('ToolRecruit');
        });

        it('should include default tools in listTools', () => {
            const tools = system.listTools();
            expect(tools).toContain('getPhoenixRider');
            expect(tools).toContain('recruitPhoenixRider');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('phoenixRiderRecruited', () => count++);
            unregister();
            system.recruitPhoenixRider({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('phoenixRiderRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitPhoenixRider({})).not.toThrow();
        });

        it('should support multiple handlers for same event', () => {
            let count = 0;
            system.registerHook('phoenixRiderRecruited', () => count++);
            system.registerHook('phoenixRiderRecruited', () => count++);
            system.recruitPhoenixRider({});
            expect(count).toBe(2);
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalPhoenixRiders = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalPhoenixRiders = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should increment evolutionCount', () => {
            system.stats.totalPhoenixRiders = 10;
            system.autoEvolve();
            expect(system.stats.evolutionCount).toBe(1);
        });
        it('should trigger systemEvolved hook', () => {
            system.stats.totalPhoenixRiders = 10;
            let called = false;
            system.registerHook('systemEvolved', () => { called = true; });
            system.autoEvolve();
            expect(called).toBe(true);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitPhoenixRider({});
            const json = system.toJSON();
            expect(json.phoenixriders.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitPhoenixRider({});
            const json = system.toJSON();
            const newSys = new CultivationPhoenixRider();
            newSys.fromJSON(json);
            expect(newSys.phoenixriders.size).toBe(1);
        });
        it('should preserve stats after fromJSON', () => {
            system.recruitPhoenixRider({});
            const json = system.toJSON();
            const newSys = new CultivationPhoenixRider();
            newSys.fromJSON(json);
            expect(newSys.stats.totalPhoenixRiders).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.phoenixRiderCount).toBe(0);
        });
        it('should reflect rider count after recruitment', () => {
            system.recruitPhoenixRider({});
            const stats = system.getStats();
            expect(stats.phoenixRiderCount).toBe(1);
        });
    });
});
