/**
 * CombatSimulationEngine.test.js - 战斗仿真引擎测试
 * V317 Iteration 5/9 Round 4 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CombatSimulationEngine } from '../../../systems/ai/CombatSimulationEngine.js';

describe('CombatSimulationEngine', () => {
    let system;
    beforeEach(() => { system = new CombatSimulationEngine(); });

    describe('registerFighter', () => {
        it('should register fighter', () => {
            const { fighter } = system.registerFighter({ name: 'F1' });
            expect(fighter.name).toBe('F1');
        });

        it('should default hp to 100', () => {
            const { fighter } = system.registerFighter({});
            expect(fighter.hp).toBe(100);
        });

        it('should default attack to 10', () => {
            const { fighter } = system.registerFighter({});
            expect(fighter.attack).toBe(10);
        });

        it('should default defense to 5', () => {
            const { fighter } = system.registerFighter({});
            expect(fighter.defense).toBe(5);
        });
    });

    describe('getFighter', () => {
        it('should return fighter', () => {
            const { fighter } = system.registerFighter({});
            expect(system.getFighter(fighter.fighterId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getFighter('ghost')).toBeNull();
        });
    });

    describe('listFighters', () => {
        it('should list all', () => {
            system.registerFighter({});
            system.registerFighter({});
            expect(system.listFighters().length).toBe(2);
        });
    });

    describe('runSimulation', () => {
        it('should simulate', () => {
            const { fighter: a } = system.registerFighter({ attack: 50 });
            const { fighter: b } = system.registerFighter({ hp: 100 });
            const result = system.runSimulation(a.fighterId, b.fighterId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const { fighter: a } = system.registerFighter({});
            const result = system.runSimulation(a.fighterId, 'ghost');
            expect(result.error).toBe('FIGHTER_NOT_FOUND');
        });

        it('should determine winner', () => {
            const { fighter: a } = system.registerFighter({ attack: 1000 });
            const { fighter: b } = system.registerFighter({ hp: 1 });
            const result = system.runSimulation(a.fighterId, b.fighterId);
            expect(result.result.winner).toBe(a.fighterId);
        });

        it('should have log', () => {
            const { fighter: a } = system.registerFighter({ attack: 50 });
            const { fighter: b } = system.registerFighter({});
            const result = system.runSimulation(a.fighterId, b.fighterId);
            expect(result.result.log.length).toBeGreaterThan(0);
        });

        it('should increment totalSimulations', () => {
            const { fighter: a } = system.registerFighter({ attack: 50 });
            const { fighter: b } = system.registerFighter({});
            system.runSimulation(a.fighterId, b.fighterId);
            expect(system.stats.totalSimulations).toBe(1);
        });

        it('should trigger simulationCompleted hook', () => {
            const { fighter: a } = system.registerFighter({ attack: 50 });
            const { fighter: b } = system.registerFighter({});
            let called = false;
            system.registerHook('simulationCompleted', () => { called = true; });
            system.runSimulation(a.fighterId, b.fighterId);
            expect(called).toBe(true);
        });
    });

    describe('getSimulation', () => {
        it('should return sim', () => {
            const { fighter: a } = system.registerFighter({ attack: 50 });
            const { fighter: b } = system.registerFighter({});
            const { result } = system.runSimulation(a.fighterId, b.fighterId);
            expect(system.getSimulation(result.simId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getSimulation('ghost')).toBeNull();
        });
    });

    describe('listSimulations', () => {
        it('should list all', () => {
            const { fighter: a } = system.registerFighter({ attack: 50 });
            const { fighter: b } = system.registerFighter({});
            system.runSimulation(a.fighterId, b.fighterId);
            expect(system.listSimulations().length).toBe(1);
        });
    });

    describe('calculateWinRate', () => {
        it('should calculate', () => {
            const { fighter: a } = system.registerFighter({ attack: 1000 });
            const { fighter: b } = system.registerFighter({ hp: 1 });
            const result = system.calculateWinRate(a.fighterId, b.fighterId, 10);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const { fighter: a } = system.registerFighter({});
            const result = system.calculateWinRate(a.fighterId, 'ghost');
            expect(result.error).toBe('FIGHTER_NOT_FOUND');
        });

        it('should return 1.0 for dominant fighter', () => {
            const { fighter: a } = system.registerFighter({ attack: 1000 });
            const { fighter: b } = system.registerFighter({ hp: 1 });
            const result = system.calculateWinRate(a.fighterId, b.fighterId, 10);
            expect(result.winRate).toBe(1);
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

        it('should execute default getFighter', () => {
            const result = system.executeTool('getFighter', { fighterId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('simulationCompleted', () => count++);
            unregister();
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('simulationCompleted', () => { throw new Error('x'); });
            const { fighter: a } = system.registerFighter({});
            const { fighter: b } = system.registerFighter({});
            expect(() => system.runSimulation(a.fighterId, b.fighterId)).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSimulations = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSimulations = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerFighter({});
            const json = system.toJSON();
            expect(json.fighters.length).toBe(1);
        });
        it('should deserialize', () => {
            system.registerFighter({});
            const json = system.toJSON();
            const newSys = new CombatSimulationEngine();
            newSys.fromJSON(json);
            expect(newSys.fighters.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.fighterCount).toBe(0);
        });
    });
});