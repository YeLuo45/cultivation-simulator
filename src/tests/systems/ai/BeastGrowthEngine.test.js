/**
 * BeastGrowthEngine.test.js - 灵兽成长引擎测试
 * V325 Iteration 4/9 Round 5 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BeastGrowthEngine } from '../../../systems/ai/BeastGrowthEngine.js';

describe('BeastGrowthEngine', () => {
    let system;
    beforeEach(() => { system = new BeastGrowthEngine(); });

    describe('Default Stages', () => {
        it('should have default stages', () => { expect(system.growthStages.size).toBe(5); });
        it('should have evolution paths', () => { expect(system.evolutionPaths.size).toBe(2); });
    });

    describe('registerBeast', () => {
        it('should register', () => {
            const { beast } = system.registerBeast({ power: 50 });
            expect(beast.power).toBe(50);
        });

        it('should default to infant stage', () => {
            const { beast } = system.registerBeast({});
            expect(beast.stage).toBe('infant');
        });

        it('should default to level 1', () => {
            const { beast } = system.registerBeast({});
            expect(beast.level).toBe(1);
        });
    });

    describe('getBeast', () => {
        it('should return', () => {
            const { beast } = system.registerBeast({});
            expect(system.getBeast(beast.beastId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBeast('ghost')).toBeNull(); });
    });

    describe('listBeasts', () => {
        it('should list all', () => {
            system.registerBeast({});
            expect(system.listBeasts().length).toBe(1);
        });
    });

    describe('addExp', () => {
        it('should add exp', () => {
            const { beast } = system.registerBeast({});
            const result = system.addExp(beast.beastId, 50);
            expect(beast.exp).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.addExp('ghost', 50);
            expect(result.error).toBe('BEAST_NOT_FOUND');
        });

        it('should trigger expGained hook', () => {
            const { beast } = system.registerBeast({});
            let called = false;
            system.registerHook('expGained', () => { called = true; });
            system.addExp(beast.beastId, 10);
            expect(called).toBe(true);
        });

        it('should level up at threshold', () => {
            const { beast } = system.registerBeast({});
            system.addExp(beast.beastId, 1000);
            expect(beast.level).toBeGreaterThan(1);
        });

        it('should increment totalLevelUps', () => {
            const { beast } = system.registerBeast({});
            system.addExp(beast.beastId, 1000);
            expect(system.stats.totalLevelUps).toBeGreaterThan(0);
        });

        it('should trigger levelUp hook', () => {
            const { beast } = system.registerBeast({});
            let called = false;
            system.registerHook('levelUp', () => { called = true; });
            system.addExp(beast.beastId, 1000);
            expect(called).toBe(true);
        });

        it('should change stage at threshold', () => {
            const { beast } = system.registerBeast({});
            system.addExp(beast.beastId, 100000);
            expect(beast.stage).not.toBe('infant');
        });

        it('should trigger stageChanged hook', () => {
            const { beast } = system.registerBeast({});
            let called = false;
            system.registerHook('stageChanged', () => { called = true; });
            system.addExp(beast.beastId, 100000);
            expect(called).toBe(true);
        });
    });

    describe('getCurrentStage', () => {
        it('should return stage', () => {
            const { beast } = system.registerBeast({});
            expect(system.getCurrentStage(beast.beastId)).toBe('infant');
        });

        it('should return null for missing', () => { expect(system.getCurrentStage('ghost')).toBeNull(); });
    });

    describe('listStages', () => {
        it('should list all', () => { expect(system.listStages().length).toBe(5); });
    });

    describe('evolveBeast', () => {
        it('should evolve', () => {
            const { beast } = system.registerBeast({ element: 'fire', level: 95 });
            const result = system.evolveBeast(beast.beastId, 'fire');
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.evolveBeast('ghost', 'fire');
            expect(result.error).toBe('BEAST_NOT_FOUND');
        });

        it('should reject missing path', () => {
            const { beast } = system.registerBeast({ element: 'fire', level: 95 });
            const result = system.evolveBeast(beast.beastId, 'ghost');
            expect(result.error).toBe('PATH_NOT_FOUND');
        });

        it('should reject element mismatch', () => {
            const { beast } = system.registerBeast({ element: 'water', level: 95 });
            const result = system.evolveBeast(beast.beastId, 'fire');
            expect(result.error).toBe('ELEMENT_MISMATCH');
        });

        it('should reject insufficient level', () => {
            const { beast } = system.registerBeast({ element: 'fire', level: 50 });
            const result = system.evolveBeast(beast.beastId, 'fire');
            expect(result.error).toBe('INSUFFICIENT_LEVEL');
        });

        it('should increment totalEvolutions', () => {
            const { beast } = system.registerBeast({ element: 'fire', level: 95 });
            system.evolveBeast(beast.beastId, 'fire');
            expect(system.stats.totalEvolutions).toBe(1);
        });

        it('should trigger beastEvolved hook', () => {
            const { beast } = system.registerBeast({ element: 'fire', level: 95 });
            let called = false;
            system.registerHook('beastEvolved', () => { called = true; });
            system.evolveBeast(beast.beastId, 'fire');
            expect(called).toBe(true);
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
            const unregister = system.registerHook('expGained', () => count++);
            unregister();
            const { beast } = system.registerBeast({});
            system.addExp(beast.beastId, 10);
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('expGained', () => { throw new Error('x'); });
            const { beast } = system.registerBeast({});
            expect(() => system.addExp(beast.beastId, 10)).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalLevelUps = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalLevelUps = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerBeast({});
            const json = system.toJSON();
            expect(json.beasts.length).toBe(1);
        });
        it('should deserialize', () => {
            system.registerBeast({});
            const json = system.toJSON();
            const newSys = new BeastGrowthEngine();
            newSys.fromJSON(json);
            expect(newSys.beasts.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.stageCount).toBe(5);
        });
    });
});