/**
 * MedicalCultivation.test.js - 医术修真测试
 * V455 Iteration 2/15 Round 17 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MedicalCultivation } from '../../../systems/ai/MedicalCultivation.js';

describe('MedicalCultivation', () => {
    let system;
    beforeEach(() => { system = new MedicalCultivation(); });

    describe('prescribeTreatment', () => {
        it('should prescribe', () => {
            const { treatment } = system.prescribeTreatment({ healerId: 'h1', name: 'panacea', type: 'healing' });
            expect(treatment.healerId).toBe('h1');
            expect(treatment.name).toBe('panacea');
        });

        it('should default type to healing', () => {
            const { treatment } = system.prescribeTreatment({});
            expect(treatment.type).toBe('healing');
        });

        it('should default name', () => {
            const { treatment } = system.prescribeTreatment({});
            expect(treatment.name).toBe('mysterious_remedy');
        });

        it('should default efficacy from baseEfficacy', () => {
            const { treatment } = system.prescribeTreatment({});
            expect(treatment.efficacy).toBe(20);
        });

        it('should default ingredients to empty array', () => {
            const { treatment } = system.prescribeTreatment({});
            expect(treatment.ingredients).toEqual([]);
        });

        it('should default status to prescribing', () => {
            const { treatment } = system.prescribeTreatment({});
            expect(treatment.status).toBe('prescribing');
        });

        it('should trigger treatmentPrescribed hook', () => {
            let called = false;
            system.registerHook('treatmentPrescribed', () => { called = true; });
            system.prescribeTreatment({});
            expect(called).toBe(true);
        });
    });

    describe('getTreatment', () => {
        it('should return', () => {
            const { treatment } = system.prescribeTreatment({});
            expect(system.getTreatment(treatment.treatmentId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTreatment('ghost')).toBeNull(); });
    });

    describe('listTreatments', () => {
        it('should list all', () => {
            system.prescribeTreatment({});
            system.prescribeTreatment({});
            expect(system.listTreatments().length).toBe(2);
        });

        it('should return empty array initially', () => {
            expect(system.listTreatments()).toEqual([]);
        });
    });

    describe('listByHealer', () => {
        it('should filter', () => {
            system.prescribeTreatment({ healerId: 'h1' });
            system.prescribeTreatment({ healerId: 'h2' });
            expect(system.listByHealer('h1').length).toBe(1);
        });

        it('should return empty for unknown healer', () => {
            system.prescribeTreatment({ healerId: 'h1' });
            expect(system.listByHealer('unknown')).toEqual([]);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.prescribeTreatment({ type: 'healing' });
            system.prescribeTreatment({ type: 'cleansing' });
            system.prescribeTreatment({ type: 'strengthening' });
            expect(system.listByType('cleansing').length).toBe(1);
        });

        it('should return empty for unknown type', () => {
            system.prescribeTreatment({ type: 'healing' });
            expect(system.listByType('unknown')).toEqual([]);
        });
    });

    describe('addIngredient', () => {
        it('should add ingredient', () => {
            const { treatment } = system.prescribeTreatment({});
            const result = system.addIngredient(treatment.treatmentId, 'ginseng');
            expect(result.success).toBe(true);
            expect(result.ingredientCount).toBe(1);
        });

        it('should push to treatment ingredients', () => {
            const { treatment } = system.prescribeTreatment({});
            system.addIngredient(treatment.treatmentId, 'ginseng');
            expect(treatment.ingredients).toContain('ginseng');
        });

        it('should support multiple ingredients', () => {
            const { treatment } = system.prescribeTreatment({});
            system.addIngredient(treatment.treatmentId, 'ginseng');
            system.addIngredient(treatment.treatmentId, 'lingzhi');
            expect(treatment.ingredients.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addIngredient('ghost', 'ginseng');
            expect(result.error).toBe('TREATMENT_NOT_FOUND');
        });

        it('should trigger ingredientAdded hook', () => {
            const { treatment } = system.prescribeTreatment({});
            let called = false;
            system.registerHook('ingredientAdded', () => { called = true; });
            system.addIngredient(treatment.treatmentId, 'ginseng');
            expect(called).toBe(true);
        });
    });

    describe('refineTreatment', () => {
        it('should refine', () => {
            const { treatment } = system.prescribeTreatment({});
            system.refineTreatment(treatment.treatmentId, 10);
            expect(treatment.efficacy).toBe(30);
        });

        it('should default amount to 5', () => {
            const { treatment } = system.prescribeTreatment({});
            system.refineTreatment(treatment.treatmentId);
            expect(treatment.efficacy).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.refineTreatment('ghost', 5);
            expect(result.error).toBe('TREATMENT_NOT_FOUND');
        });

        it('should trigger treatmentRefined hook', () => {
            const { treatment } = system.prescribeTreatment({});
            let called = false;
            system.registerHook('treatmentRefined', () => { called = true; });
            system.refineTreatment(treatment.treatmentId, 10);
            expect(called).toBe(true);
        });
    });

    describe('applyTreatment', () => {
        it('should apply', () => {
            const { treatment } = system.prescribeTreatment({});
            system.applyTreatment(treatment.treatmentId);
            expect(treatment.status).toBe('applied');
        });

        it('should reject missing', () => {
            const result = system.applyTreatment('ghost');
            expect(result.error).toBe('TREATMENT_NOT_FOUND');
        });

        it('should trigger treatmentApplied hook', () => {
            const { treatment } = system.prescribeTreatment({});
            let called = false;
            system.registerHook('treatmentApplied', () => { called = true; });
            system.applyTreatment(treatment.treatmentId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMedicalPower', () => {
        it('should calculate with no ingredients', () => {
            const { treatment } = system.prescribeTreatment({});
            // efficacy=20, ingredients=0 -> 20 * (1 + 0/5) = 20
            expect(system.calculateMedicalPower(treatment.treatmentId)).toBe(20);
        });

        it('should calculate with ingredients', () => {
            const { treatment } = system.prescribeTreatment({});
            system.addIngredient(treatment.treatmentId, 'a');
            system.addIngredient(treatment.treatmentId, 'b');
            system.addIngredient(treatment.treatmentId, 'c');
            system.addIngredient(treatment.treatmentId, 'd');
            system.addIngredient(treatment.treatmentId, 'e');
            // efficacy=20, ingredients=5 -> 20 * (1 + 5/5) = 40
            expect(system.calculateMedicalPower(treatment.treatmentId)).toBe(40);
        });

        it('should reflect refine on efficacy', () => {
            const { treatment } = system.prescribeTreatment({});
            system.refineTreatment(treatment.treatmentId, 10);
            // efficacy=30, ingredients=0 -> 30 * 1 = 30
            expect(system.calculateMedicalPower(treatment.treatmentId)).toBe(30);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMedicalPower('ghost')).toBe(0);
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

        it('should execute default getTreatment', () => {
            const result = system.executeTool('getTreatment', { treatmentId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default prescribeTreatment', () => {
            const result = system.executeTool('prescribeTreatment', { healerId: 'h1' });
            expect(result.result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('treatmentPrescribed', () => count++);
            unregister();
            system.prescribeTreatment({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('treatmentPrescribed', () => { throw new Error('x'); });
            expect(() => system.prescribeTreatment({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTreatments = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
            expect(result.generation).toBe(1);
        });
        it('should not double evolve', () => {
            system.stats.totalTreatments = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
            expect(result.reason).toBe('ALREADY_EVOLVED');
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.prescribeTreatment({});
            const json = system.toJSON();
            expect(json.treatments.length).toBe(1);
        });
        it('should deserialize', () => {
            system.prescribeTreatment({});
            const json = system.toJSON();
            const newSys = new MedicalCultivation();
            newSys.fromJSON(json);
            expect(newSys.treatments.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.treatmentCount).toBe(0);
            expect(stats.totalTreatments).toBe(0);
        });
    });
});
