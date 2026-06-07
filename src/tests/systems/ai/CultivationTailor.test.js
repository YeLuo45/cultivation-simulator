/**
 * CultivationTailor.test.js - 修真裁缝测试
 * V710 Iteration 3/30 Round 29 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationTailor } from '../../../systems/ai/CultivationTailor.js';

describe('CultivationTailor', () => {
    let system;
    beforeEach(() => { system = new CultivationTailor(); });

    describe('recruitTailor', () => {
        it('should recruit', () => {
            const { tailor } = system.recruitTailor({ masterId: 'm1', name: 'Silk Weaver', type: 'silk' });
            expect(tailor.masterId).toBe('m1');
            expect(tailor.name).toBe('Silk Weaver');
            expect(tailor.type).toBe('silk');
        });

        it('should trigger tailorRecruited hook', () => {
            let called = false;
            system.registerHook('tailorRecruited', () => { called = true; });
            system.recruitTailor({});
            expect(called).toBe(true);
        });

        it('should set default status to novice', () => {
            const { tailor } = system.recruitTailor({});
            expect(tailor.status).toBe('novice');
        });

        it('should set default tailoring to baseTailoring', () => {
            const { tailor } = system.recruitTailor({});
            expect(tailor.tailoring).toBe(20);
        });

        it('should set default garments to empty array', () => {
            const { tailor } = system.recruitTailor({});
            expect(tailor.garments).toEqual([]);
        });

        it('should set default level to 1', () => {
            const { tailor } = system.recruitTailor({});
            expect(tailor.level).toBe(1);
        });

        it('should set default type to silk', () => {
            const { tailor } = system.recruitTailor({});
            expect(tailor.type).toBe('silk');
        });

        it('should set createdAt timestamp', () => {
            const { tailor } = system.recruitTailor({});
            expect(typeof tailor.createdAt).toBe('number');
        });

        it('should generate tailorId', () => {
            const { tailor } = system.recruitTailor({});
            expect(tailor.tailorId).toBeTruthy();
        });

        it('should increment totalTailors', () => {
            system.recruitTailor({});
            system.recruitTailor({});
            expect(system.stats.totalTailors).toBe(2);
        });
    });

    describe('getTailor', () => {
        it('should return', () => {
            const { tailor } = system.recruitTailor({});
            expect(system.getTailor(tailor.tailorId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTailor('ghost')).toBeNull(); });
    });

    describe('listTailors', () => {
        it('should list all', () => {
            system.recruitTailor({});
            system.recruitTailor({});
            expect(system.listTailors().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listTailors().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitTailor({ masterId: 'm1' });
            system.recruitTailor({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty when none match', () => {
            system.recruitTailor({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { tailor } = system.recruitTailor({});
            system.legendTailor(tailor.tailorId);
            system.recruitTailor({});
            expect(system.listLegendary().length).toBe(1);
        });

        it('should return empty when none legendary', () => {
            system.recruitTailor({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addGarment', () => {
        it('should add garment', () => {
            const { tailor } = system.recruitTailor({});
            system.addGarment(tailor.tailorId, 'celestial robe');
            expect(tailor.garments.length).toBe(1);
            expect(tailor.garments[0]).toBe('celestial robe');
        });

        it('should add multiple garments', () => {
            const { tailor } = system.recruitTailor({});
            system.addGarment(tailor.tailorId, 'celestial robe');
            system.addGarment(tailor.tailorId, 'phoenix cloak');
            expect(tailor.garments.length).toBe(2);
        });

        it('should change status to veteran on first garment', () => {
            const { tailor } = system.recruitTailor({});
            system.addGarment(tailor.tailorId, 'celestial robe');
            expect(tailor.status).toBe('veteran');
        });

        it('should not downgrade legendary status', () => {
            const { tailor } = system.recruitTailor({});
            system.legendTailor(tailor.tailorId);
            system.addGarment(tailor.tailorId, 'celestial robe');
            expect(tailor.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.addGarment('ghost', 'celestial robe');
            expect(result.error).toBe('TAILOR_NOT_FOUND');
        });

        it('should trigger garmentAdded hook', () => {
            const { tailor } = system.recruitTailor({});
            let called = false;
            system.registerHook('garmentAdded', () => { called = true; });
            system.addGarment(tailor.tailorId, 'celestial robe');
            expect(called).toBe(true);
        });
    });

    describe('raiseTailoring', () => {
        it('should raise tailoring by default', () => {
            const { tailor } = system.recruitTailor({});
            system.raiseTailoring(tailor.tailorId);
            expect(tailor.tailoring).toBe(25);
        });

        it('should raise tailoring by amount', () => {
            const { tailor } = system.recruitTailor({});
            system.raiseTailoring(tailor.tailorId, 10);
            expect(tailor.tailoring).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raiseTailoring('ghost', 10);
            expect(result.error).toBe('TAILOR_NOT_FOUND');
        });

        it('should trigger tailoringRaised hook', () => {
            const { tailor } = system.recruitTailor({});
            let called = false;
            system.registerHook('tailoringRaised', () => { called = true; });
            system.raiseTailoring(tailor.tailorId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpTailor', () => {
        it('should level up', () => {
            const { tailor } = system.recruitTailor({});
            system.levelUpTailor(tailor.tailorId);
            expect(tailor.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { tailor } = system.recruitTailor({});
            system.levelUpTailor(tailor.tailorId);
            system.levelUpTailor(tailor.tailorId);
            system.levelUpTailor(tailor.tailorId);
            expect(tailor.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpTailor('ghost');
            expect(result.error).toBe('TAILOR_NOT_FOUND');
        });

        it('should trigger tailorLeveledUp hook', () => {
            const { tailor } = system.recruitTailor({});
            let called = false;
            system.registerHook('tailorLeveledUp', () => { called = true; });
            system.levelUpTailor(tailor.tailorId);
            expect(called).toBe(true);
        });
    });

    describe('legendTailor', () => {
        it('should mark as legendary', () => {
            const { tailor } = system.recruitTailor({});
            system.legendTailor(tailor.tailorId);
            expect(tailor.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendTailor('ghost');
            expect(result.error).toBe('TAILOR_NOT_FOUND');
        });

        it('should trigger tailorLegendized hook', () => {
            const { tailor } = system.recruitTailor({});
            let called = false;
            system.registerHook('tailorLegendized', () => { called = true; });
            system.legendTailor(tailor.tailorId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTailorValue', () => {
        it('should calculate', () => {
            const { tailor } = system.recruitTailor({});
            // level=1, tailoring=20, garments=0: 1*100 + 20*2 + 0*30 = 140
            expect(system.calculateTailorValue(tailor.tailorId)).toBe(140);
        });

        it('should calculate with garments', () => {
            const { tailor } = system.recruitTailor({});
            system.addGarment(tailor.tailorId, 'celestial robe');
            system.addGarment(tailor.tailorId, 'phoenix cloak');
            // level=1, tailoring=20, garments=2: 100 + 40 + 60 = 200
            expect(system.calculateTailorValue(tailor.tailorId)).toBe(200);
        });

        it('should calculate with level up and tailoring raised', () => {
            const { tailor } = system.recruitTailor({});
            system.levelUpTailor(tailor.tailorId);
            system.levelUpTailor(tailor.tailorId);
            system.raiseTailoring(tailor.tailorId, 30);
            // level=3, tailoring=50, garments=0: 300 + 100 + 0 = 400
            expect(system.calculateTailorValue(tailor.tailorId)).toBe(400);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTailorValue('ghost')).toBe(0);
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

        it('should execute default getTailor', () => {
            const result = system.executeTool('getTailor', { tailorId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('tailorRecruited', () => count++);
            unregister();
            system.recruitTailor({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('tailorRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitTailor({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTailors = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalTailors = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitTailor({});
            const json = system.toJSON();
            expect(json.tailors.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitTailor({});
            const json = system.toJSON();
            const newSys = new CultivationTailor();
            newSys.fromJSON(json);
            expect(newSys.tailors.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.tailorCount).toBe(0);
        });
    });
});
