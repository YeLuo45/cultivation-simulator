/**
 * CultivationTechnique.test.js - 修真技法测试
 * V693 Iteration 16/30 Round 28 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationTechnique } from '../../../systems/ai/CultivationTechnique.js';

describe('CultivationTechnique', () => {
    let system;
    beforeEach(() => { system = new CultivationTechnique(); });

    describe('recruitTechnique', () => {
        it('should recruit', () => {
            const { technique } = system.recruitTechnique({ masterId: 'm1', name: 'SwordSlash' });
            expect(technique.masterId).toBe('m1');
            expect(technique.name).toBe('SwordSlash');
        });

        it('should use baseMastery default', () => {
            const { technique } = system.recruitTechnique({});
            expect(technique.mastery).toBe(20);
        });

        it('should default type to sword', () => {
            const { technique } = system.recruitTechnique({});
            expect(technique.type).toBe('sword');
        });

        it('should default status to novice', () => {
            const { technique } = system.recruitTechnique({});
            expect(technique.status).toBe('novice');
        });

        it('should accept custom secrets', () => {
            const { technique } = system.recruitTechnique({ secrets: ['a', 'b'] });
            expect(technique.secrets).toEqual(['a', 'b']);
        });

        it('should default secrets to empty', () => {
            const { technique } = system.recruitTechnique({});
            expect(technique.secrets).toEqual([]);
        });

        it('should default level to 1', () => {
            const { technique } = system.recruitTechnique({});
            expect(technique.level).toBe(1);
        });

        it('should trigger techniqueRecruited hook', () => {
            let called = false;
            system.registerHook('techniqueRecruited', () => { called = true; });
            system.recruitTechnique({});
            expect(called).toBe(true);
        });
    });

    describe('getTechnique', () => {
        it('should return', () => {
            const { technique } = system.recruitTechnique({});
            expect(system.getTechnique(technique.techniqueId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTechnique('ghost')).toBeNull(); });
        it('should copy secrets array', () => {
            const { technique } = system.recruitTechnique({ secrets: ['s1'] });
            const t = system.getTechnique(technique.techniqueId);
            t.secrets.push('s2');
            expect(system.getTechnique(technique.techniqueId).secrets.length).toBe(1);
        });
    });

    describe('listTechniques', () => {
        it('should list all', () => {
            system.recruitTechnique({});
            system.recruitTechnique({});
            expect(system.listTechniques().length).toBe(2);
        });
        it('should be empty initially', () => {
            expect(system.listTechniques().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.recruitTechnique({ masterId: 'm1' });
            system.recruitTechnique({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary only', () => {
            const { technique: t1 } = system.recruitTechnique({});
            const { technique: t2 } = system.recruitTechnique({});
            system.legendTechnique(t1.techniqueId);
            const result = system.listLegendary();
            expect(result.length).toBe(1);
            expect(result[0].techniqueId).toBe(t1.techniqueId);
            expect(t2.status).toBe('novice');
        });
    });

    describe('addSecret', () => {
        it('should add a secret', () => {
            const { technique } = system.recruitTechnique({});
            system.addSecret(technique.techniqueId, 'hidden-truth');
            expect(system.getTechnique(technique.techniqueId).secrets).toContain('hidden-truth');
        });

        it('should reject missing', () => {
            const result = system.addSecret('ghost', 'x');
            expect(result.error).toBe('TECHNIQUE_NOT_FOUND');
        });

        it('should trigger secretAdded hook', () => {
            const { technique } = system.recruitTechnique({});
            let called = false;
            system.registerHook('secretAdded', () => { called = true; });
            system.addSecret(technique.techniqueId, 's1');
            expect(called).toBe(true);
        });
    });

    describe('raiseMastery', () => {
        it('should raise mastery with default amount', () => {
            const { technique } = system.recruitTechnique({});
            system.raiseMastery(technique.techniqueId);
            expect(system.getTechnique(technique.techniqueId).mastery).toBe(25);
        });

        it('should raise mastery with custom amount', () => {
            const { technique } = system.recruitTechnique({});
            system.raiseMastery(technique.techniqueId, 10);
            expect(system.getTechnique(technique.techniqueId).mastery).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.raiseMastery('ghost', 5);
            expect(result.error).toBe('TECHNIQUE_NOT_FOUND');
        });

        it('should trigger masteryRaised hook', () => {
            const { technique } = system.recruitTechnique({});
            let called = false;
            system.registerHook('masteryRaised', () => { called = true; });
            system.raiseMastery(technique.techniqueId, 7);
            expect(called).toBe(true);
        });
    });

    describe('levelUpTechnique', () => {
        it('should level up', () => {
            const { technique } = system.recruitTechnique({});
            system.levelUpTechnique(technique.techniqueId);
            expect(system.getTechnique(technique.techniqueId).level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpTechnique('ghost');
            expect(result.error).toBe('TECHNIQUE_NOT_FOUND');
        });

        it('should trigger techniqueLeveledUp hook', () => {
            const { technique } = system.recruitTechnique({});
            let called = false;
            system.registerHook('techniqueLeveledUp', () => { called = true; });
            system.levelUpTechnique(technique.techniqueId);
            expect(called).toBe(true);
        });
    });

    describe('legendTechnique', () => {
        it('should set status to legendary', () => {
            const { technique } = system.recruitTechnique({});
            system.legendTechnique(technique.techniqueId);
            expect(system.getTechnique(technique.techniqueId).status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendTechnique('ghost');
            expect(result.error).toBe('TECHNIQUE_NOT_FOUND');
        });

        it('should trigger techniqueLegendized hook', () => {
            const { technique } = system.recruitTechnique({});
            let called = false;
            system.registerHook('techniqueLegendized', () => { called = true; });
            system.legendTechnique(technique.techniqueId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTechniqueValue', () => {
        it('should calculate', () => {
            const { technique } = system.recruitTechnique({ mastery: 10 });
            // level 1 * 100 + mastery 10 * 2 + secrets 0 * 30 = 120
            expect(system.calculateTechniqueValue(technique.techniqueId)).toBe(120);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTechniqueValue('ghost')).toBe(0);
        });

        it('should include secrets contribution', () => {
            const { technique } = system.recruitTechnique({ mastery: 0, secrets: ['a', 'b'] });
            // 1*100 + 0*2 + 2*30 = 160
            expect(system.calculateTechniqueValue(technique.techniqueId)).toBe(160);
        });

        it('should include level contribution', () => {
            const { technique } = system.recruitTechnique({ mastery: 0 });
            system.levelUpTechnique(technique.techniqueId);
            system.levelUpTechnique(technique.techniqueId);
            // 3*100 + 0*2 + 0*30 = 300
            expect(system.calculateTechniqueValue(technique.techniqueId)).toBe(300);
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

        it('should execute default getTechnique', () => {
            const result = system.executeTool('getTechnique', { techniqueId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('techniqueRecruited', () => count++);
            unregister();
            system.recruitTechnique({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('techniqueRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitTechnique({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTechniques = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalTechniques = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitTechnique({});
            const json = system.toJSON();
            expect(json.techniques.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitTechnique({});
            const json = system.toJSON();
            const newSys = new CultivationTechnique();
            newSys.fromJSON(json);
            expect(newSys.techniques.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.techniqueCount).toBe(0);
        });
    });
});
