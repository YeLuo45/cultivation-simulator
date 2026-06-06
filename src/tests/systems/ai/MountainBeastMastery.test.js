/**
 * MountainBeastMastery.test.js - 山兽驯服测试
 * V445 Iteration 7/15 Round 16 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MountainBeastMastery } from '../../../systems/ai/MountainBeastMastery.js';

describe('MountainBeastMastery', () => {
    let system;
    beforeEach(() => { system = new MountainBeastMastery(); });

    describe('encounterBeast', () => {
        it('should encounter', () => {
            const { beast } = system.encounterBeast({ tamerId: 't1', name: 'Frostfang', species: 'wolf' });
            expect(beast.tamerId).toBe('t1');
        });

        it('should set defaults', () => {
            const { beast } = system.encounterBeast({});
            expect(beast.ferocity).toBe(30);
            expect(beast.loyalty).toBe(0);
            expect(beast.status).toBe('wild');
        });

        it('should respect custom data', () => {
            const { beast } = system.encounterBeast({ name: 'Ember', species: 'tiger', ferocity: 80, habitat: 'volcano' });
            expect(beast.name).toBe('Ember');
            expect(beast.species).toBe('tiger');
            expect(beast.ferocity).toBe(80);
            expect(beast.habitat).toBe('volcano');
        });

        it('should trigger beastEncountered hook', () => {
            let called = false;
            system.registerHook('beastEncountered', () => { called = true; });
            system.encounterBeast({});
            expect(called).toBe(true);
        });

        it('should accept custom beastId', () => {
            const { beast } = system.encounterBeast({ beastId: 'my-beast', name: 'A' });
            expect(beast.beastId).toBe('my-beast');
        });
    });

    describe('getBeast', () => {
        it('should return', () => {
            const { beast } = system.encounterBeast({ name: 'A' });
            expect(system.getBeast(beast.beastId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBeast('ghost')).toBeNull(); });
        it('should return a copy', () => {
            const { beast } = system.encounterBeast({ name: 'A' });
            const fetched = system.getBeast(beast.beastId);
            fetched.name = 'mutated';
            const again = system.getBeast(beast.beastId);
            expect(again.name).toBe('A');
        });
    });

    describe('listBeasts', () => {
        it('should list all', () => {
            system.encounterBeast({});
            system.encounterBeast({});
            expect(system.listBeasts().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listBeasts().length).toBe(0);
        });
    });

    describe('listByTamer', () => {
        it('should filter', () => {
            system.encounterBeast({ tamerId: 't1' });
            system.encounterBeast({ tamerId: 't2' });
            expect(system.listByTamer('t1').length).toBe(1);
        });

        it('should return empty for unknown tamer', () => {
            system.encounterBeast({ tamerId: 't1' });
            expect(system.listByTamer('unknown').length).toBe(0);
        });
    });

    describe('listBySpecies', () => {
        it('should filter', () => {
            system.encounterBeast({ species: 'wolf' });
            system.encounterBeast({ species: 'tiger' });
            expect(system.listBySpecies('wolf').length).toBe(1);
        });

        it('should return empty for unknown species', () => {
            system.encounterBeast({ species: 'wolf' });
            expect(system.listBySpecies('dragon').length).toBe(0);
        });
    });

    describe('tameBeast', () => {
        it('should tame', () => {
            const { beast } = system.encounterBeast({});
            system.tameBeast(beast.beastId, 10);
            expect(beast.loyalty).toBe(10);
        });

        it('should change status from wild to tamed', () => {
            const { beast } = system.encounterBeast({});
            expect(beast.status).toBe('wild');
            system.tameBeast(beast.beastId, 5);
            expect(beast.status).toBe('tamed');
        });

        it('should cap loyalty at 100', () => {
            const { beast } = system.encounterBeast({});
            system.tameBeast(beast.beastId, 200);
            expect(beast.loyalty).toBe(100);
        });

        it('should reject missing', () => {
            const result = system.tameBeast('ghost', 10);
            expect(result.error).toBe('BEAST_NOT_FOUND');
        });

        it('should trigger beastTamed hook', () => {
            const { beast } = system.encounterBeast({});
            let called = false;
            system.registerHook('beastTamed', () => { called = true; });
            system.tameBeast(beast.beastId, 5);
            expect(called).toBe(true);
        });

        it('should use default amount', () => {
            const { beast } = system.encounterBeast({});
            system.tameBeast(beast.beastId);
            expect(beast.loyalty).toBe(5);
        });
    });

    describe('reduceFerocity', () => {
        it('should reduce', () => {
            const { beast } = system.encounterBeast({ ferocity: 50 });
            system.reduceFerocity(beast.beastId, 10);
            expect(beast.ferocity).toBe(40);
        });

        it('should cap ferocity at 0', () => {
            const { beast } = system.encounterBeast({ ferocity: 20 });
            system.reduceFerocity(beast.beastId, 50);
            expect(beast.ferocity).toBe(0);
        });

        it('should reject missing', () => {
            const result = system.reduceFerocity('ghost', 5);
            expect(result.error).toBe('BEAST_NOT_FOUND');
        });

        it('should trigger ferocityReduced hook', () => {
            const { beast } = system.encounterBeast({ ferocity: 50 });
            let called = false;
            system.registerHook('ferocityReduced', () => { called = true; });
            system.reduceFerocity(beast.beastId, 5);
            expect(called).toBe(true);
        });

        it('should use default amount', () => {
            const { beast } = system.encounterBeast({ ferocity: 30 });
            system.reduceFerocity(beast.beastId);
            expect(beast.ferocity).toBe(28);
        });
    });

    describe('bondBeast', () => {
        it('should bond', () => {
            const { beast } = system.encounterBeast({});
            system.bondBeast(beast.beastId);
            expect(beast.status).toBe('bonded');
        });

        it('should set loyalty to at least 80', () => {
            const { beast } = system.encounterBeast({});
            system.bondBeast(beast.beastId);
            expect(beast.loyalty).toBeGreaterThanOrEqual(80);
        });

        it('should not reduce loyalty if already higher', () => {
            const { beast } = system.encounterBeast({});
            system.tameBeast(beast.beastId, 90);
            system.bondBeast(beast.beastId);
            expect(beast.loyalty).toBe(90);
        });

        it('should reject missing', () => {
            const result = system.bondBeast('ghost');
            expect(result.error).toBe('BEAST_NOT_FOUND');
        });

        it('should trigger beastBonded hook', () => {
            const { beast } = system.encounterBeast({});
            let called = false;
            system.registerHook('beastBonded', () => { called = true; });
            system.bondBeast(beast.beastId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBeastStrength', () => {
        it('should calculate', () => {
            const { beast } = system.encounterBeast({ ferocity: 30, loyalty: 50, habitat: 'mountains' });
            // 30 * (1 + 50/100) + 9 = 30 * 1.5 + 9 = 45 + 9 = 54
            expect(system.calculateBeastStrength(beast.beastId)).toBeCloseTo(54, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBeastStrength('ghost')).toBe(0);
        });

        it('should handle zero loyalty', () => {
            const { beast } = system.encounterBeast({ ferocity: 30, loyalty: 0, habitat: 'forest' });
            // 30 * 1 + 6 = 36
            expect(system.calculateBeastStrength(beast.beastId)).toBeCloseTo(36, 5);
        });

        it('should handle high loyalty', () => {
            const { beast } = system.encounterBeast({ ferocity: 30, loyalty: 100, habitat: 'peaks' });
            // 30 * 2 + 5 = 65
            expect(system.calculateBeastStrength(beast.beastId)).toBeCloseTo(65, 5);
        });
    });

    describe('listWild', () => {
        it('should filter wild beasts', () => {
            const { beast: a } = system.encounterBeast({});
            system.encounterBeast({});
            system.tameBeast(a.beastId, 5);
            expect(system.listWild().length).toBe(1);
        });

        it('should return empty when none wild', () => {
            const { beast } = system.encounterBeast({});
            system.tameBeast(beast.beastId, 5);
            expect(system.listWild().length).toBe(0);
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

        it('should execute default getBeast', () => {
            const result = system.executeTool('getBeast', { beastId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('beastEncountered', () => count++);
            unregister();
            system.encounterBeast({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('beastEncountered', () => { throw new Error('x'); });
            expect(() => system.encounterBeast({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBeasts = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalBeasts = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.encounterBeast({});
            const json = system.toJSON();
            expect(json.beasts.length).toBe(1);
        });
        it('should deserialize', () => {
            system.encounterBeast({});
            const json = system.toJSON();
            const newSys = new MountainBeastMastery();
            newSys.fromJSON(json);
            expect(newSys.beasts.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.beastCount).toBe(0);
        });
    });
});
