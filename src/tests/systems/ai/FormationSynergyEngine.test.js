/**
 * FormationSynergyEngine.test.js - 阵法协同引擎测试
 * V318 Iteration 6/9 Round 4 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FormationSynergyEngine } from '../../../systems/ai/FormationSynergyEngine.js';

describe('FormationSynergyEngine', () => {
    let system;
    beforeEach(() => { system = new FormationSynergyEngine(); });

    describe('Default Combinations', () => {
        it('should have default combinations', () => { expect(system.combinations.size).toBe(2); });
        it('should contain sword_array', () => { expect(system.getCombination('sword_array')).not.toBeNull(); });
    });

    describe('registerCombination', () => {
        it('should register', () => {
            const { combo } = system.registerCombination({ name: 'Custom' });
            expect(combo.name).toBe('Custom');
        });

        it('should trigger combinationRegistered hook', () => {
            let called = false;
            system.registerHook('combinationRegistered', () => { called = true; });
            system.registerCombination({});
            expect(called).toBe(true);
        });
    });

    describe('getCombination', () => {
        it('should return', () => { expect(system.getCombination('sword_array')).not.toBeNull(); });
        it('should return null for missing', () => { expect(system.getCombination('ghost')).toBeNull(); });
    });

    describe('listCombinations', () => {
        it('should list all', () => { expect(system.listCombinations().length).toBe(2); });
    });

    describe('detectSynergy', () => {
        it('should detect matching', () => {
            const result = system.detectSynergy(['iron_sword', 'jade_blade']);
            expect(result.length).toBe(1);
        });

        it('should not detect partial', () => {
            const result = system.detectSynergy(['iron_sword']);
            expect(result.length).toBe(0);
        });

        it('should return empty for empty input', () => {
            expect(system.detectSynergy([]).length).toBe(0);
        });
    });

    describe('activateSynergy', () => {
        it('should activate', () => {
            const result = system.activateSynergy('sword_array', 'c1');
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.activateSynergy('ghost', 'c1');
            expect(result.error).toBe('COMBINATION_NOT_FOUND');
        });

        it('should increment totalSynergies', () => {
            system.activateSynergy('sword_array', 'c1');
            expect(system.stats.totalSynergies).toBe(1);
        });

        it('should trigger synergyActivated hook', () => {
            let called = false;
            system.registerHook('synergyActivated', () => { called = true; });
            system.activateSynergy('sword_array', 'c1');
            expect(called).toBe(true);
        });
    });

    describe('getSynergy', () => {
        it('should return', () => {
            const { synergy } = system.activateSynergy('sword_array', 'c1');
            expect(system.getSynergy(synergy.synergyId)).not.toBeNull();
        });

        it('should return null for missing', () => { expect(system.getSynergy('ghost')).toBeNull(); });
    });

    describe('listSynergies', () => {
        it('should list all', () => {
            system.activateSynergy('sword_array', 'c1');
            expect(system.listSynergies().length).toBe(1);
        });
    });

    describe('calculateSynergyBonus', () => {
        it('should calculate', () => {
            const result = system.calculateSynergyBonus(['iron_sword', 'jade_blade']);
            expect(result.bonus.attack).toBe(0.3);
        });

        it('should be 0 for no synergy', () => {
            const result = system.calculateSynergyBonus([]);
            expect(result.count).toBe(0);
        });
    });

    describe('endSynergy', () => {
        it('should end', () => {
            const { synergy } = system.activateSynergy('sword_array', 'c1');
            const result = system.endSynergy(synergy.synergyId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.endSynergy('ghost');
            expect(result.error).toBe('SYNERGY_NOT_FOUND');
        });

        it('should reject inactive', () => {
            const { synergy } = system.activateSynergy('sword_array', 'c1');
            synergy.status = 'ended';
            const result = system.endSynergy(synergy.synergyId);
            expect(result.error).toBe('SYNERGY_INACTIVE');
        });

        it('should trigger synergyEnded hook', () => {
            const { synergy } = system.activateSynergy('sword_array', 'c1');
            let called = false;
            system.registerHook('synergyEnded', () => { called = true; });
            system.endSynergy(synergy.synergyId);
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

        it('should execute default getCombination', () => {
            const result = system.executeTool('getCombination', { comboId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default listCombinations', () => {
            const result = system.executeTool('listCombinations', {});
            expect(result.result.length).toBe(2);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('synergyActivated', () => count++);
            unregister();
            system.activateSynergy('sword_array', 'c1');
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('synergyActivated', () => { throw new Error('x'); });
            expect(() => system.activateSynergy('sword_array', 'c1')).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalSynergies = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalSynergies = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.activateSynergy('sword_array', 'c1');
            const json = system.toJSON();
            expect(json.synergies.length).toBe(1);
        });
        it('should deserialize', () => {
            system.activateSynergy('sword_array', 'c1');
            const json = system.toJSON();
            const newSys = new FormationSynergyEngine();
            newSys.fromJSON(json);
            expect(newSys.synergies.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.combinationCount).toBe(2);
        });
    });
});