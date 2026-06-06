/**
 * BlessingArts.test.js - 祝福术系统测试
 * V458 Iteration 5/15 Round 17 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BlessingArts } from '../../../systems/ai/BlessingArts.js';

describe('BlessingArts', () => {
    let system;
    beforeEach(() => { system = new BlessingArts(); });

    describe('conferBlessing', () => {
        it('should confer', () => {
            const { blessing } = system.conferBlessing({ granterId: 'g1', name: 'Fortune', type: 'luck' });
            expect(blessing.granterId).toBe('g1');
            expect(blessing.name).toBe('Fortune');
            expect(blessing.type).toBe('luck');
        });

        it('should trigger blessingConferred hook', () => {
            let called = false;
            system.registerHook('blessingConferred', () => { called = true; });
            system.conferBlessing({});
            expect(called).toBe(true);
        });
    });

    describe('getBlessing', () => {
        it('should return', () => {
            const { blessing } = system.conferBlessing({});
            expect(system.getBlessing(blessing.blessingId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBlessing('ghost')).toBeNull(); });
    });

    describe('listBlessings', () => {
        it('should list all', () => {
            system.conferBlessing({});
            expect(system.listBlessings().length).toBe(1);
        });
    });

    describe('listByGranter', () => {
        it('should filter', () => {
            system.conferBlessing({ granterId: 'g1' });
            system.conferBlessing({ granterId: 'g2' });
            expect(system.listByGranter('g1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.conferBlessing({ type: 'luck' });
            system.conferBlessing({ type: 'health' });
            expect(system.listByType('luck').length).toBe(1);
        });
    });

    describe('empowerBlessing', () => {
        it('should empower', () => {
            const { blessing } = system.conferBlessing({});
            system.empowerBlessing(blessing.blessingId, 10);
            expect(blessing.power).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.empowerBlessing('ghost', 10);
            expect(result.error).toBe('BLESSING_NOT_FOUND');
        });

        it('should trigger blessingEmpowered hook', () => {
            const { blessing } = system.conferBlessing({});
            let called = false;
            system.registerHook('blessingEmpowered', () => { called = true; });
            system.empowerBlessing(blessing.blessingId, 5);
            expect(called).toBe(true);
        });
    });

    describe('addBeneficiary', () => {
        it('should add beneficiary', () => {
            const { blessing } = system.conferBlessing({});
            system.addBeneficiary(blessing.blessingId, 'person1');
            expect(blessing.beneficiaries).toContain('person1');
        });

        it('should reject missing', () => {
            const result = system.addBeneficiary('ghost', 'person1');
            expect(result.error).toBe('BLESSING_NOT_FOUND');
        });

        it('should trigger beneficiaryAdded hook', () => {
            const { blessing } = system.conferBlessing({});
            let called = false;
            system.registerHook('beneficiaryAdded', () => { called = true; });
            system.addBeneficiary(blessing.blessingId, 'person1');
            expect(called).toBe(true);
        });
    });

    describe('bless', () => {
        it('should activate', () => {
            const { blessing } = system.conferBlessing({});
            system.bless(blessing.blessingId);
            expect(blessing.status).toBe('active');
        });

        it('should reject missing', () => {
            const result = system.bless('ghost');
            expect(result.error).toBe('BLESSING_NOT_FOUND');
        });

        it('should trigger blessingActivated hook', () => {
            const { blessing } = system.conferBlessing({});
            let called = false;
            system.registerHook('blessingActivated', () => { called = true; });
            system.bless(blessing.blessingId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBlessingPower', () => {
        it('should calculate', () => {
            const { blessing } = system.conferBlessing({});
            system.addBeneficiary(blessing.blessingId, 'p1');
            system.addBeneficiary(blessing.blessingId, 'p2');
            // power=20, beneficiaries=2 -> 20 * (1 + 2/5) = 20 * 1.4 = 28
            expect(system.calculateBlessingPower(blessing.blessingId)).toBeCloseTo(28, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBlessingPower('ghost')).toBe(0);
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

        it('should execute default getBlessing', () => {
            const result = system.executeTool('getBlessing', { blessingId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('blessingConferred', () => count++);
            unregister();
            system.conferBlessing({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('blessingConferred', () => { throw new Error('x'); });
            expect(() => system.conferBlessing({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBlessings = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalBlessings = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.conferBlessing({});
            const json = system.toJSON();
            expect(json.blessings.length).toBe(1);
        });
        it('should deserialize', () => {
            system.conferBlessing({});
            const json = system.toJSON();
            const newSys = new BlessingArts();
            newSys.fromJSON(json);
            expect(newSys.blessings.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.blessingCount).toBe(0);
        });
    });
});
