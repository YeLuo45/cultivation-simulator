/**
 * CultivationGiant.test.js - 修真巨人系统测试
 * V676 Iteration 29/30 Round 27 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationGiant } from '../../../systems/ai/CultivationGiant.js';

describe('CultivationGiant', () => {
    let system;
    beforeEach(() => { system = new CultivationGiant(); });

    describe('recruitGiant', () => {
        it('should recruit', () => {
            const { giant } = system.recruitGiant({ masterId: 'm1', name: 'Titan', type: 'stone' });
            expect(giant.masterId).toBe('m1');
            expect(giant.name).toBe('Titan');
            expect(giant.type).toBe('stone');
        });

        it('should default type to stone', () => {
            const { giant } = system.recruitGiant({ masterId: 'm1' });
            expect(giant.type).toBe('stone');
        });

        it('should set base strength', () => {
            const { giant } = system.recruitGiant({ masterId: 'm1' });
            expect(giant.strength).toBe(20);
        });

        it('should trigger giantRecruited hook', () => {
            let called = false;
            system.registerHook('giantRecruited', () => { called = true; });
            system.recruitGiant({});
            expect(called).toBe(true);
        });
    });

    describe('getGiant', () => {
        it('should return', () => {
            const { giant } = system.recruitGiant({});
            expect(system.getGiant(giant.giantId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getGiant('ghost')).toBeNull(); });
    });

    describe('listGiants', () => {
        it('should list all', () => {
            system.recruitGiant({});
            system.recruitGiant({});
            expect(system.listGiants().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitGiant({ masterId: 'm1' });
            system.recruitGiant({ masterId: 'm2' });
            system.recruitGiant({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });
    });

    describe('listLegendary', () => {
        it('should return legendary only', () => {
            const { giant } = system.recruitGiant({});
            system.recruitGiant({});
            system.legendGiant(giant.giantId);
            expect(system.listLegendary().length).toBe(1);
        });
    });

    describe('addBoulder', () => {
        it('should add boulder', () => {
            const { giant } = system.recruitGiant({});
            system.addBoulder(giant.giantId, { name: 'boulder1', size: 50 });
            expect(giant.boulders.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addBoulder('ghost', { name: 'b' });
            expect(result.error).toBe('GIANT_NOT_FOUND');
        });

        it('should trigger boulderAdded hook', () => {
            const { giant } = system.recruitGiant({});
            let called = false;
            system.registerHook('boulderAdded', () => { called = true; });
            system.addBoulder(giant.giantId, { name: 'b' });
            expect(called).toBe(true);
        });
    });

    describe('raiseStrength', () => {
        it('should raise', () => {
            const { giant } = system.recruitGiant({});
            system.raiseStrength(giant.giantId, 10);
            expect(giant.strength).toBe(30);
        });

        it('should default amount to 5', () => {
            const { giant } = system.recruitGiant({});
            system.raiseStrength(giant.giantId);
            expect(giant.strength).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseStrength('ghost', 10);
            expect(result.error).toBe('GIANT_NOT_FOUND');
        });

        it('should trigger strengthRaised hook', () => {
            const { giant } = system.recruitGiant({});
            let called = false;
            system.registerHook('strengthRaised', () => { called = true; });
            system.raiseStrength(giant.giantId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpGiant', () => {
        it('should level up', () => {
            const { giant } = system.recruitGiant({});
            system.levelUpGiant(giant.giantId);
            expect(giant.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpGiant('ghost');
            expect(result.error).toBe('GIANT_NOT_FOUND');
        });

        it('should trigger giantLeveledUp hook', () => {
            const { giant } = system.recruitGiant({});
            let called = false;
            system.registerHook('giantLeveledUp', () => { called = true; });
            system.levelUpGiant(giant.giantId);
            expect(called).toBe(true);
        });
    });

    describe('legendGiant', () => {
        it('should legendize', () => {
            const { giant } = system.recruitGiant({});
            system.legendGiant(giant.giantId);
            expect(giant.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendGiant('ghost');
            expect(result.error).toBe('GIANT_NOT_FOUND');
        });

        it('should trigger giantLegendized hook', () => {
            const { giant } = system.recruitGiant({});
            let called = false;
            system.registerHook('giantLegendized', () => { called = true; });
            system.legendGiant(giant.giantId);
            expect(called).toBe(true);
        });
    });

    describe('calculateGiantValue', () => {
        it('should calculate', () => {
            const { giant } = system.recruitGiant({});
            system.addBoulder(giant.giantId, { name: 'b' });
            // level 1 * 100 + 20 * 2 + 1 * 30 = 100 + 40 + 30 = 170
            expect(system.calculateGiantValue(giant.giantId)).toBe(170);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateGiantValue('ghost')).toBe(0);
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

        it('should execute default recruitGiant tool', () => {
            const result = system.executeTool('recruitGiant', { masterId: 'm1', name: 'G' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('giantRecruited', () => count++);
            unregister();
            system.recruitGiant({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('giantRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitGiant({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalGiants = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalGiants = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitGiant({});
            const json = system.toJSON();
            expect(json.giants.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitGiant({});
            const json = system.toJSON();
            const newSys = new CultivationGiant();
            newSys.fromJSON(json);
            expect(newSys.giants.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.giantCount).toBe(0);
        });
    });
});
