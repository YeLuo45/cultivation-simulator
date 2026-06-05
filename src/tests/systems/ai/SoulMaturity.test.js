/**
 * SoulMaturity.test.js - 灵魂成熟度测试
 * V374 Iteration 8/9 Round 10 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SoulMaturity } from '../../../systems/ai/SoulMaturity.js';

describe('SoulMaturity', () => {
    let system;
    beforeEach(() => { system = new SoulMaturity(); });

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

    describe('listByStage', () => {
        it('should filter', () => {
            const { soul: s1 } = system.registerSoul({});
            const { soul: s2 } = system.registerSoul({});
            s1.stage = 1;
            s2.stage = 2;
            expect(system.listByStage(1).length).toBe(1);
        });
    });

    describe('listByMaturity', () => {
        it('should filter', () => {
            const { soul: s1 } = system.registerSoul({});
            const { soul: s2 } = system.registerSoul({});
            s1.maturity = 50;
            s2.maturity = 200;
            expect(system.listByMaturity(100).length).toBe(1);
        });
    });

    describe('growMaturity', () => {
        it('should grow', () => {
            const { soul } = system.registerSoul({});
            system.growMaturity(soul.soulId, 50);
            expect(soul.maturity).toBe(50);
        });

        it('should increment stage', () => {
            const { soul } = system.registerSoul({});
            system.growMaturity(soul.soulId, 100);
            expect(soul.stage).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.growMaturity('ghost', 10);
            expect(result.error).toBe('SOUL_NOT_FOUND');
        });

        it('should trigger maturityGrew hook', () => {
            const { soul } = system.registerSoul({});
            let called = false;
            system.registerHook('maturityGrew', () => { called = true; });
            system.growMaturity(soul.soulId, 10);
            expect(called).toBe(true);
        });

        it('should trigger stageUp', () => {
            const { soul } = system.registerSoul({});
            let called = false;
            system.registerHook('stageUp', () => { called = true; });
            system.growMaturity(soul.soulId, 100);
            expect(called).toBe(true);
        });
    });

    describe('addExperience', () => {
        it('should add', () => {
            const { soul } = system.registerSoul({});
            system.addExperience(soul.soulId, 5);
            expect(soul.experiences).toBe(5);
        });

        it('should reject missing', () => {
            const result = system.addExperience('ghost', 1);
            expect(result.error).toBe('SOUL_NOT_FOUND');
        });

        it('should trigger experienceAdded hook', () => {
            const { soul } = system.registerSoul({});
            let called = false;
            system.registerHook('experienceAdded', () => { called = true; });
            system.addExperience(soul.soulId, 1);
            expect(called).toBe(true);
        });
    });

    describe('calculateTotalMaturity', () => {
        it('should calculate', () => {
            const { soul: s1 } = system.registerSoul({});
            const { soul: s2 } = system.registerSoul({});
            s1.maturity = 50;
            s2.maturity = 100;
            expect(system.calculateTotalMaturity()).toBe(150);
        });
    });

    describe('calculateAverageMaturity', () => {
        it('should calculate', () => {
            const { soul: s1 } = system.registerSoul({});
            const { soul: s2 } = system.registerSoul({});
            s1.maturity = 50;
            s2.maturity = 100;
            expect(system.calculateAverageMaturity()).toBe(75);
        });

        it('should return 0 for empty', () => {
            expect(system.calculateAverageMaturity()).toBe(0);
        });
    });

    describe('findMatureSouls', () => {
        it('should find', () => {
            const { soul: s1 } = system.registerSoul({});
            const { soul: s2 } = system.registerSoul({});
            s1.maturity = 200;
            s2.maturity = 50;
            expect(system.findMatureSouls(100).length).toBe(1);
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
            system.stats.totalGrowths = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalGrowths = 10;
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
            const newSys = new SoulMaturity();
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