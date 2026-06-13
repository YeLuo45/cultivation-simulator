/**
 * BondEvolutionEngine.test.js - 羁绊进化引擎测试
 * V308 Iteration 5/9 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BondEvolutionEngine } from '../../../systems/ai/BondEvolutionEngine.js';

describe('BondEvolutionEngine', () => {
    let system;

    beforeEach(() => { system = new BondEvolutionEngine(); });

    describe('Default Paths', () => {
        it('should have default paths', () => {
            expect(system.evolutionPaths.size).toBe(3);
        });
    });

    describe('createBond', () => {
        it('should create bond', () => {
            const { bond } = system.createBond({ companions: ['a', 'b'] });
            expect(bond.level).toBe(0);
        });

        it('should default to soulmate path', () => {
            const { bond } = system.createBond({});
            expect(bond.pathId).toBe('soulmate');
        });

        it('should generate id', () => {
            const { bond } = system.createBond({});
            expect(bond.bondId).toBeDefined();
        });
    });

    describe('getBond', () => {
        it('should return bond', () => {
            const { bond } = system.createBond({});
            expect(system.getBond(bond.bondId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getBond('ghost')).toBeNull();
        });
    });

    describe('listBonds', () => {
        it('should list all', () => {
            system.createBond({});
            system.createBond({});
            expect(system.listBonds().length).toBe(2);
        });
    });

    describe('addExp', () => {
        it('should add exp', () => {
            const { bond } = system.createBond({});
            const result = system.addExp(bond.bondId, 50);
            expect(result.bond.exp).toBe(50);
        });

        it('should reject missing', () => {
            const result = system.addExp('ghost', 50);
            expect(result.error).toBe('BOND_NOT_FOUND');
        });

        it('should auto-evolve at threshold', () => {
            const { bond } = system.createBond({});
            const result = system.addExp(bond.bondId, 1000);
            expect(bond.level).toBeGreaterThan(0);
        });

        it('should trigger expGained hook', () => {
            const { bond } = system.createBond({});
            let called = false;
            system.registerHook('expGained', () => { called = true; });
            system.addExp(bond.bondId, 10);
            expect(called).toBe(true);
        });
    });

    describe('evolveBond', () => {
        it('should evolve', () => {
            const { bond } = system.createBond({});
            bond.exp = 1000;
            const result = system.evolveBond(bond.bondId);
            expect(result.success).toBe(true);
            expect(bond.level).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.evolveBond('ghost');
            expect(result.error).toBe('BOND_NOT_FOUND');
        });

        it('should reject max level', () => {
            const { bond } = system.createBond({});
            bond.level = system.config.maxEvolutionLevel;
            const result = system.evolveBond(bond.bondId);
            expect(result.error).toBe('MAX_LEVEL_REACHED');
        });

        it('should reject insufficient exp', () => {
            const { bond } = system.createBond({});
            const result = system.evolveBond(bond.bondId);
            expect(result.error).toBe('INSUFFICIENT_EXP');
        });

        it('should add to history', () => {
            const { bond } = system.createBond({});
            bond.exp = 1000;
            system.evolveBond(bond.bondId);
            expect(system.history.length).toBe(1);
        });

        it('should trigger bondEvolved hook', () => {
            const { bond } = system.createBond({});
            bond.exp = 1000;
            let called = false;
            system.registerHook('bondEvolved', () => { called = true; });
            system.evolveBond(bond.bondId);
            expect(called).toBe(true);
        });
    });

    describe('setPath', () => {
        it('should set path', () => {
            const { bond } = system.createBond({});
            const result = system.setPath(bond.bondId, 'dao_partner');
            expect(result.success).toBe(true);
        });

        it('should reject missing bond', () => {
            const result = system.setPath('ghost', 'dao_partner');
            expect(result.error).toBe('BOND_NOT_FOUND');
        });

        it('should reject invalid path', () => {
            const { bond } = system.createBond({});
            const result = system.setPath(bond.bondId, 'ghost');
            expect(result.error).toBe('PATH_NOT_FOUND');
        });
    });

    describe('getPathBonus', () => {
        it('should return bonuses', () => {
            const { bond } = system.createBond({});
            const bonus = system.getPathBonus(bond.bondId);
            expect(bonus).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getPathBonus('ghost')).toBeNull();
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

        it('should execute default getEvolutionStatus', () => {
            const result = system.executeTool('getEvolutionStatus', { bondId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default listPaths', () => {
            const result = system.executeTool('listPaths', {});
            expect(result.result.length).toBe(3);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('bondEvolved', () => count++);
            unregister();
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('bondEvolved', () => { throw new Error('x'); });
            const { bond } = system.createBond({});
            bond.exp = 1000;
            expect(() => system.evolveBond(bond.bondId)).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalEvolutions = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalEvolutions = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createBond({});
            const json = system.toJSON();
            expect(json.bonds.length).toBe(1);
        });

        it('should deserialize', () => {
            system.createBond({});
            const json = system.toJSON();
            const newSys = new BondEvolutionEngine();
            newSys.fromJSON(json);
            expect(newSys.bonds.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.pathCount).toBe(3);
        });
    });
});