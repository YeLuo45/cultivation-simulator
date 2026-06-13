/**
 * ReincarnationCore.test.js - 轮回核心测试
 * V367 Iteration 1/9 Round 10 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ReincarnationCore } from '../../../systems/ai/ReincarnationCore.js';

describe('ReincarnationCore', () => {
    let system;
    beforeEach(() => { system = new ReincarnationCore(); });

    describe('registerSoul', () => {
        it('should register', () => {
            const { soul } = system.registerSoul({ name: 'S1' });
            expect(soul.name).toBe('S1');
        });

        it('should trigger soulRegistered hook', () => {
            let called = false;
            system.registerHook('soulRegistered', () => { called = true; });
            system.registerSoul({});
            expect(called).toBe(true);
        });
    });

    describe('getSoul', () => {
        it('should return', () => {
            const { soul } = system.registerSoul({});
            expect(system.getSoul(soul.soulId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getSoul('ghost')).toBeNull(); });
    });

    describe('listSouls', () => {
        it('should list all', () => {
            system.registerSoul({});
            expect(system.listSouls().length).toBe(1);
        });
    });

    describe('listByLevel', () => {
        it('should filter', () => {
            const { soul: s1 } = system.registerSoul({});
            const { soul: s2 } = system.registerSoul({});
            s1.level = 1;
            s2.level = 2;
            expect(system.listByLevel(1).length).toBe(1);
        });
    });

    describe('listByKarma', () => {
        it('should filter', () => {
            const { soul: s1 } = system.registerSoul({});
            const { soul: s2 } = system.registerSoul({});
            s1.karma = 10;
            s2.karma = 100;
            expect(system.listByKarma(50, 200).length).toBe(1);
        });
    });

    describe('reincarnate', () => {
        it('should reincarnate', () => {
            const { soul } = system.registerSoul({});
            const result = system.reincarnate(soul.soulId, 'S2');
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.reincarnate('ghost');
            expect(result.error).toBe('SOUL_NOT_FOUND');
        });

        it('should increment cycle', () => {
            const { soul } = system.registerSoul({});
            system.reincarnate(soul.soulId);
            expect(soul.cycle).toBe(1);
        });

        it('should trigger reincarnationCompleted hook', () => {
            const { soul } = system.registerSoul({});
            let called = false;
            system.registerHook('reincarnationCompleted', () => { called = true; });
            system.reincarnate(soul.soulId);
            expect(called).toBe(true);
        });
    });

    describe('addKarma', () => {
        it('should add', () => {
            const { soul } = system.registerSoul({});
            system.addKarma(soul.soulId, 10);
            expect(soul.karma).toBe(10);
        });

        it('should reject missing', () => {
            const result = system.addKarma('ghost', 10);
            expect(result.error).toBe('SOUL_NOT_FOUND');
        });

        it('should trigger karmaChanged hook', () => {
            const { soul } = system.registerSoul({});
            let called = false;
            system.registerHook('karmaChanged', () => { called = true; });
            system.addKarma(soul.soulId, 10);
            expect(called).toBe(true);
        });
    });

    describe('advanceAge', () => {
        it('should advance', () => {
            const { soul } = system.registerSoul({});
            system.advanceAge(soul.soulId, 10);
            expect(soul.age).toBe(10);
        });

        it('should reject missing', () => {
            const result = system.advanceAge('ghost', 10);
            expect(result.error).toBe('SOUL_NOT_FOUND');
        });

        it('should trigger ageAdvanced hook', () => {
            const { soul } = system.registerSoul({});
            let called = false;
            system.registerHook('ageAdvanced', () => { called = true; });
            system.advanceAge(soul.soulId, 10);
            expect(called).toBe(true);
        });
    });

    describe('getCycle', () => {
        it('should return', () => {
            const { soul } = system.registerSoul({});
            const { cycle } = system.reincarnate(soul.soulId);
            expect(system.getCycle(cycle.cycleId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getCycle('ghost')).toBeNull(); });
    });

    describe('listCycles', () => {
        it('should list all', () => {
            const { soul } = system.registerSoul({});
            system.reincarnate(soul.soulId);
            expect(system.listCycles().length).toBe(1);
        });
    });

    describe('listCyclesBySoul', () => {
        it('should filter', () => {
            const { soul: s1 } = system.registerSoul({});
            const { soul: s2 } = system.registerSoul({});
            system.reincarnate(s1.soulId);
            system.reincarnate(s2.soulId);
            expect(system.listCyclesBySoul(s1.soulId).length).toBe(1);
        });
    });

    describe('calculateSoulLevel', () => {
        it('should calculate', () => {
            const { soul } = system.registerSoul({});
            soul.cycle = 5;
            soul.karma = 100;
            expect(system.calculateSoulLevel(soul.soulId)).toBeGreaterThan(1);
        });

        it('should return null for missing', () => {
            expect(system.calculateSoulLevel('ghost')).toBeNull();
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

        it('should execute default getSoul', () => {
            const result = system.executeTool('getSoul', { soulId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('soulRegistered', () => count++);
            unregister();
            system.registerSoul({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('soulRegistered', () => { throw new Error('x'); });
            expect(() => system.registerSoul({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCycles = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCycles = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerSoul({});
            const json = system.toJSON();
            expect(json.souls.length).toBe(1);
        });
        it('should deserialize', () => {
            system.registerSoul({});
            const json = system.toJSON();
            const newSys = new ReincarnationCore();
            newSys.fromJSON(json);
            expect(newSys.souls.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.soulCount).toBe(0);
        });
    });
});