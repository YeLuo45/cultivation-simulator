/**
 * CultivationSymphony.test.js - 修真交响系统测试
 * V794 Iteration 27/30 Round 31 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationSymphony } from '../../../systems/ai/CultivationSymphony.js';

describe('CultivationSymphony', () => {
    let system;
    beforeEach(() => { system = new CultivationSymphony(); });

    describe('recruitSymphony', () => {
        it('should recruit', () => {
            const { symphony } = system.recruitSymphony({ masterId: 'm1', name: 'Grand Symphony', type: 'cosmic' });
            expect(symphony.masterId).toBe('m1');
            expect(symphony.name).toBe('Grand Symphony');
            expect(symphony.type).toBe('cosmic');
        });

        it('should default type to grand', () => {
            const { symphony } = system.recruitSymphony({});
            expect(symphony.type).toBe('grand');
        });

        it('should default status to novice', () => {
            const { symphony } = system.recruitSymphony({});
            expect(symphony.status).toBe('novice');
        });

        it('should default level to 1', () => {
            const { symphony } = system.recruitSymphony({});
            expect(symphony.level).toBe(1);
        });

        it('should default movements to empty array', () => {
            const { symphony } = system.recruitSymphony({});
            expect(symphony.movements).toEqual([]);
        });

        it('should default grandeur to baseGrandeur', () => {
            const { symphony } = system.recruitSymphony({});
            expect(symphony.grandeur).toBe(20);
        });

        it('should assign auto id when missing', () => {
            const { symphony } = system.recruitSymphony({});
            expect(symphony.symphonyId).toMatch(/^symphony_/);
        });

        it('should use provided symphonyId', () => {
            const { symphony } = system.recruitSymphony({ symphonyId: 's_explicit' });
            expect(symphony.symphonyId).toBe('s_explicit');
        });

        it('should trigger symphonyRecruited hook', () => {
            let called = false;
            system.registerHook('symphonyRecruited', () => { called = true; });
            system.recruitSymphony({});
            expect(called).toBe(true);
        });

        it('should respect custom config baseGrandeur', () => {
            const customSystem = new CultivationSymphony({ baseGrandeur: 50 });
            const { symphony } = customSystem.recruitSymphony({});
            expect(symphony.grandeur).toBe(50);
        });
    });

    describe('getSymphony', () => {
        it('should return', () => {
            const { symphony } = system.recruitSymphony({});
            expect(system.getSymphony(symphony.symphonyId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSymphony('ghost')).toBeNull(); });
        it('should return a copy (not reference)', () => {
            const { symphony } = system.recruitSymphony({ name: 'Original' });
            const fetched = system.getSymphony(symphony.symphonyId);
            fetched.name = 'Mutated';
            const refetched = system.getSymphony(symphony.symphonyId);
            expect(refetched.name).toBe('Original');
        });
    });

    describe('listSymphonies', () => {
        it('should list all', () => {
            system.recruitSymphony({});
            system.recruitSymphony({});
            expect(system.listSymphonies().length).toBe(2);
        });

        it('should return empty when none', () => {
            expect(system.listSymphonies().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitSymphony({ masterId: 'm1' });
            system.recruitSymphony({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.recruitSymphony({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { symphony: a } = system.recruitSymphony({});
            const { symphony: b } = system.recruitSymphony({});
            system.legendSymphony(a.symphonyId);
            expect(system.listLegendary().length).toBe(1);
            expect(b.symphonyId).toBeDefined();
        });

        it('should return empty when none legendary', () => {
            system.recruitSymphony({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addMovement', () => {
        it('should add movement', () => {
            const { symphony } = system.recruitSymphony({});
            system.addMovement(symphony.symphonyId, 'overture');
            expect(symphony.movements).toContain('overture');
        });

        it('should add multiple movements', () => {
            const { symphony } = system.recruitSymphony({});
            system.addMovement(symphony.symphonyId, 'overture');
            system.addMovement(symphony.symphonyId, 'crescendo');
            expect(symphony.movements.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addMovement('ghost', 'overture');
            expect(result.error).toBe('SYMPHONY_NOT_FOUND');
        });

        it('should trigger movementAdded hook', () => {
            const { symphony } = system.recruitSymphony({});
            let called = false;
            system.registerHook('movementAdded', () => { called = true; });
            system.addMovement(symphony.symphonyId, 'overture');
            expect(called).toBe(true);
        });
    });

    describe('raiseGrandeur', () => {
        it('should raise grandeur', () => {
            const { symphony } = system.recruitSymphony({});
            system.raiseGrandeur(symphony.symphonyId, 10);
            expect(symphony.grandeur).toBe(30);
        });

        it('should default amount to 5', () => {
            const { symphony } = system.recruitSymphony({});
            system.raiseGrandeur(symphony.symphonyId);
            expect(symphony.grandeur).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseGrandeur('ghost', 10);
            expect(result.error).toBe('SYMPHONY_NOT_FOUND');
        });

        it('should trigger grandeurRaised hook', () => {
            const { symphony } = system.recruitSymphony({});
            let called = false;
            system.registerHook('grandeurRaised', () => { called = true; });
            system.raiseGrandeur(symphony.symphonyId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpSymphony', () => {
        it('should increment level', () => {
            const { symphony } = system.recruitSymphony({});
            system.levelUpSymphony(symphony.symphonyId);
            expect(symphony.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { symphony } = system.recruitSymphony({});
            system.levelUpSymphony(symphony.symphonyId);
            system.levelUpSymphony(symphony.symphonyId);
            system.levelUpSymphony(symphony.symphonyId);
            expect(symphony.level).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.levelUpSymphony('ghost');
            expect(result.error).toBe('SYMPHONY_NOT_FOUND');
        });
    });

    describe('legendSymphony', () => {
        it('should set status to legendary', () => {
            const { symphony } = system.recruitSymphony({});
            system.legendSymphony(symphony.symphonyId);
            expect(symphony.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendSymphony('ghost');
            expect(result.error).toBe('SYMPHONY_NOT_FOUND');
        });

        it('should trigger symphonyLegendized hook', () => {
            const { symphony } = system.recruitSymphony({});
            let called = false;
            system.registerHook('symphonyLegendized', () => { called = true; });
            system.legendSymphony(symphony.symphonyId);
            expect(called).toBe(true);
        });
    });

    describe('calculateSymphonyValue', () => {
        it('should calculate', () => {
            const { symphony } = system.recruitSymphony({});
            system.addMovement(symphony.symphonyId, 'overture');
            // value = 1 * 100 + 20 * 2 + 1 * 30 = 100 + 40 + 30 = 170
            expect(system.calculateSymphonyValue(symphony.symphonyId)).toBeCloseTo(170, 5);
        });

        it('should recalculate after level up', () => {
            const { symphony } = system.recruitSymphony({});
            system.levelUpSymphony(symphony.symphonyId);
            // value = 2 * 100 + 20 * 2 + 0 * 30 = 200 + 40 + 0 = 240
            expect(system.calculateSymphonyValue(symphony.symphonyId)).toBeCloseTo(240, 5);
        });

        it('should recalculate after grandeur raise', () => {
            const { symphony } = system.recruitSymphony({});
            system.raiseGrandeur(symphony.symphonyId, 5);
            // value = 1 * 100 + 25 * 2 + 0 * 30 = 100 + 50 + 0 = 150
            expect(system.calculateSymphonyValue(symphony.symphonyId)).toBeCloseTo(150, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateSymphonyValue('ghost')).toBe(0);
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

        it('should execute default getSymphony', () => {
            const result = system.executeTool('getSymphony', { symphonyId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle undefined context with default', () => {
            system.registerTool('echo', (ctx) => ctx);
            const result = system.executeTool('echo');
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('symphonyRecruited', () => count++);
            unregister();
            system.recruitSymphony({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('symphonyRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitSymphony({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSymphonies = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSymphonies = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitSymphony({});
            const json = system.toJSON();
            expect(json.symphonies.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitSymphony({});
            const json = system.toJSON();
            const newSys = new CultivationSymphony();
            newSys.fromJSON(json);
            expect(newSys.symphonies.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            system.recruitSymphony({});
            const stats = system.getStats();
            expect(stats.symphonyCount).toBe(1);
        });
    });
});
