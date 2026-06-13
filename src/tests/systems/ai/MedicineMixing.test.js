/**
 * MedicineMixing.test.js - 药剂调配系统测试
 * V505 Iteration 7/20 Round 20 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MedicineMixing } from '../../../systems/ai/MedicineMixing.js';

describe('MedicineMixing', () => {
    let system;
    beforeEach(() => { system = new MedicineMixing(); });

    describe('mixMedicine', () => {
        it('should mix', () => {
            const { medicine } = system.mixMedicine({ mixerId: 'm1', type: 'tonic', name: 'Healing Brew' });
            expect(medicine.mixerId).toBe('m1');
            expect(medicine.type).toBe('tonic');
            expect(medicine.name).toBe('Healing Brew');
        });

        it('should default to tonic type', () => {
            const { medicine } = system.mixMedicine({});
            expect(medicine.type).toBe('tonic');
        });

        it('should default status to mixed', () => {
            const { medicine } = system.mixMedicine({});
            expect(medicine.status).toBe('mixed');
        });

        it('should trigger medicineMixed hook', () => {
            let called = false;
            system.registerHook('medicineMixed', () => { called = true; });
            system.mixMedicine({});
            expect(called).toBe(true);
        });
    });

    describe('getMedicine', () => {
        it('should return', () => {
            const { medicine } = system.mixMedicine({});
            expect(system.getMedicine(medicine.medicineId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getMedicine('ghost')).toBeNull(); });
    });

    describe('listMedicines', () => {
        it('should list all', () => {
            system.mixMedicine({});
            system.mixMedicine({});
            expect(system.listMedicines().length).toBe(2);
        });
    });

    describe('listByMixer', () => {
        it('should filter', () => {
            system.mixMedicine({ mixerId: 'm1' });
            system.mixMedicine({ mixerId: 'm2' });
            expect(system.listByMixer('m1').length).toBe(1);
        });

        it('should return empty for unknown mixer', () => {
            system.mixMedicine({ mixerId: 'm1' });
            expect(system.listByMixer('ghost').length).toBe(0);
        });
    });

    describe('listConcentrated', () => {
        it('should filter concentrated', () => {
            const { medicine: a } = system.mixMedicine({});
            const { medicine: b } = system.mixMedicine({});
            system.concentrateMedicine(a.medicineId);
            expect(system.listConcentrated().length).toBe(1);
            expect(b.medicineId).toBeDefined();
        });

        it('should return empty when none concentrated', () => {
            system.mixMedicine({});
            expect(system.listConcentrated().length).toBe(0);
        });
    });

    describe('addComponent', () => {
        it('should add component', () => {
            const { medicine } = system.mixMedicine({});
            system.addComponent(medicine.medicineId, 'ginseng');
            expect(medicine.components).toContain('ginseng');
        });

        it('should add multiple components', () => {
            const { medicine } = system.mixMedicine({});
            system.addComponent(medicine.medicineId, 'ginseng');
            system.addComponent(medicine.medicineId, 'deer_horn');
            expect(medicine.components.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addComponent('ghost', 'ginseng');
            expect(result.error).toBe('MEDICINE_NOT_FOUND');
        });

        it('should trigger componentAdded hook', () => {
            const { medicine } = system.mixMedicine({});
            let called = false;
            system.registerHook('componentAdded', () => { called = true; });
            system.addComponent(medicine.medicineId, 'ginseng');
            expect(called).toBe(true);
        });
    });

    describe('increaseEfficacy', () => {
        it('should increase efficacy', () => {
            const { medicine } = system.mixMedicine({});
            system.increaseEfficacy(medicine.medicineId, 10);
            expect(medicine.efficacy).toBe(25);
        });

        it('should default amount to 5', () => {
            const { medicine } = system.mixMedicine({});
            system.increaseEfficacy(medicine.medicineId);
            expect(medicine.efficacy).toBe(20);
        });

        it('should reject missing', () => {
            const result = system.increaseEfficacy('ghost', 10);
            expect(result.error).toBe('MEDICINE_NOT_FOUND');
        });

        it('should trigger efficacyIncreased hook', () => {
            const { medicine } = system.mixMedicine({});
            let called = false;
            system.registerHook('efficacyIncreased', () => { called = true; });
            system.increaseEfficacy(medicine.medicineId, 5);
            expect(called).toBe(true);
        });
    });

    describe('concentrateMedicine', () => {
        it('should set status to concentrated', () => {
            const { medicine } = system.mixMedicine({});
            system.concentrateMedicine(medicine.medicineId);
            expect(medicine.status).toBe('concentrated');
        });

        it('should reject missing', () => {
            const result = system.concentrateMedicine('ghost');
            expect(result.error).toBe('MEDICINE_NOT_FOUND');
        });

        it('should trigger medicineConcentrated hook', () => {
            const { medicine } = system.mixMedicine({});
            let called = false;
            system.registerHook('medicineConcentrated', () => { called = true; });
            system.concentrateMedicine(medicine.medicineId);
            expect(called).toBe(true);
        });
    });

    describe('calculateMedicinePower', () => {
        it('should calculate', () => {
            const { medicine } = system.mixMedicine({});
            system.addComponent(medicine.medicineId, 'ginseng');
            system.addComponent(medicine.medicineId, 'deer_horn');
            // power = 15 * 10 + 2 * 5 = 150 + 10 = 160
            expect(system.calculateMedicinePower(medicine.medicineId)).toBeCloseTo(160, 5);
        });

        it('should recalculate after efficacy change', () => {
            const { medicine } = system.mixMedicine({});
            system.increaseEfficacy(medicine.medicineId, 5);
            // power = 20 * 10 + 0 * 5 = 200
            expect(system.calculateMedicinePower(medicine.medicineId)).toBeCloseTo(200, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateMedicinePower('ghost')).toBe(0);
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

        it('should execute default getMedicine', () => {
            const result = system.executeTool('getMedicine', { medicineId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('medicineMixed', () => count++);
            unregister();
            system.mixMedicine({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('medicineMixed', () => { throw new Error('x'); });
            expect(() => system.mixMedicine({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalMedicines = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalMedicines = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.mixMedicine({});
            const json = system.toJSON();
            expect(json.medicines.length).toBe(1);
        });
        it('should deserialize', () => {
            system.mixMedicine({});
            const json = system.toJSON();
            const newSys = new MedicineMixing();
            newSys.fromJSON(json);
            expect(newSys.medicines.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.medicineCount).toBe(0);
        });

        it('should reflect medicines count after mix', () => {
            system.mixMedicine({});
            const stats = system.getStats();
            expect(stats.medicineCount).toBe(1);
        });
    });
});
