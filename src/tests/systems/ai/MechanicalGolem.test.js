/**
 * MechanicalGolem.test.js - 机关傀儡测试
 * V452 Iteration 14/15 Round 16 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MechanicalGolem } from '../../../systems/ai/MechanicalGolem.js';

describe('MechanicalGolem', () => {
    let system;
    beforeEach(() => { system = new MechanicalGolem(); });

    describe('assembleGolem', () => {
        it('should assemble', () => {
            const { golem } = system.assembleGolem({ masterId: 'm1', name: 'Iron Golem', type: 'warrior' });
            expect(golem.masterId).toBe('m1');
            expect(golem.name).toBe('Iron Golem');
            expect(golem.type).toBe('warrior');
        });

        it('should default to base strength', () => {
            const { golem } = system.assembleGolem({});
            expect(golem.strength).toBe(30);
        });

        it('should set status to assembled', () => {
            const { golem } = system.assembleGolem({});
            expect(golem.status).toBe('assembled');
        });

        it('should default to empty parts', () => {
            const { golem } = system.assembleGolem({});
            expect(golem.parts).toEqual([]);
        });

        it('should trigger golemAssembled hook', () => {
            let called = false;
            system.registerHook('golemAssembled', () => { called = true; });
            system.assembleGolem({});
            expect(called).toBe(true);
        });
    });

    describe('getGolem', () => {
        it('should return', () => {
            const { golem } = system.assembleGolem({});
            expect(system.getGolem(golem.golemId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getGolem('ghost')).toBeNull(); });
    });

    describe('listGolems', () => {
        it('should list all', () => {
            system.assembleGolem({});
            system.assembleGolem({});
            expect(system.listGolems().length).toBe(2);
        });
    });

    describe('listByMaster', () => {
        it('should filter', () => {
            system.assembleGolem({ masterId: 'm1' });
            system.assembleGolem({ masterId: 'm2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });
    });

    describe('listByType', () => {
        it('should filter', () => {
            system.assembleGolem({ type: 'warrior' });
            system.assembleGolem({ type: 'guardian' });
            expect(system.listByType('guardian').length).toBe(1);
        });
    });

    describe('addPart', () => {
        it('should add part', () => {
            const { golem } = system.assembleGolem({});
            system.addPart(golem.golemId, 'left_arm');
            expect(golem.parts).toContain('left_arm');
        });

        it('should reject missing', () => {
            const result = system.addPart('ghost', 'arm');
            expect(result.error).toBe('GOLEM_NOT_FOUND');
        });

        it('should trigger partAdded hook', () => {
            const { golem } = system.assembleGolem({});
            let called = false;
            system.registerHook('partAdded', () => { called = true; });
            system.addPart(golem.golemId, 'arm');
            expect(called).toBe(true);
        });
    });

    describe('increaseStrength', () => {
        it('should increase with custom amount', () => {
            const { golem } = system.assembleGolem({});
            system.increaseStrength(golem.golemId, 20);
            expect(golem.strength).toBe(50);
        });

        it('should default to 5', () => {
            const { golem } = system.assembleGolem({});
            system.increaseStrength(golem.golemId);
            expect(golem.strength).toBe(35);
        });

        it('should reject missing', () => {
            const result = system.increaseStrength('ghost', 5);
            expect(result.error).toBe('GOLEM_NOT_FOUND');
        });

        it('should trigger strengthIncreased hook', () => {
            const { golem } = system.assembleGolem({});
            let called = false;
            system.registerHook('strengthIncreased', () => { called = true; });
            system.increaseStrength(golem.golemId, 10);
            expect(called).toBe(true);
        });
    });

    describe('chargeEnergy', () => {
        it('should charge with custom amount', () => {
            const { golem } = system.assembleGolem({});
            system.chargeEnergy(golem.golemId, 50);
            expect(golem.energy).toBe(50);
        });

        it('should default to 10', () => {
            const { golem } = system.assembleGolem({});
            system.chargeEnergy(golem.golemId);
            expect(golem.energy).toBe(10);
        });

        it('should reject missing', () => {
            const result = system.chargeEnergy('ghost', 10);
            expect(result.error).toBe('GOLEM_NOT_FOUND');
        });

        it('should trigger energyCharged hook', () => {
            const { golem } = system.assembleGolem({});
            let called = false;
            system.registerHook('energyCharged', () => { called = true; });
            system.chargeEnergy(golem.golemId, 10);
            expect(called).toBe(true);
        });
    });

    describe('activateGolem', () => {
        it('should set status to active', () => {
            const { golem } = system.assembleGolem({});
            system.activateGolem(golem.golemId);
            expect(golem.status).toBe('active');
        });

        it('should reject missing', () => {
            const result = system.activateGolem('ghost');
            expect(result.error).toBe('GOLEM_NOT_FOUND');
        });

        it('should trigger golemActivated hook', () => {
            const { golem } = system.assembleGolem({});
            let called = false;
            system.registerHook('golemActivated', () => { called = true; });
            system.activateGolem(golem.golemId);
            expect(called).toBe(true);
        });
    });

    describe('calculateGolemPower', () => {
        it('should calculate with parts and energy', () => {
            const { golem } = system.assembleGolem({ strength: 50 });
            system.chargeEnergy(golem.golemId, 100);
            system.addPart(golem.golemId, 'arm');
            system.addPart(golem.golemId, 'leg');
            // 50 * (100/100) + 2 * 3 = 50 + 6 = 56
            expect(system.calculateGolemPower(golem.golemId)).toBeCloseTo(56, 5);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateGolemPower('ghost')).toBe(0);
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

        it('should execute default getGolem', () => {
            const result = system.executeTool('getGolem', { golemId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('golemAssembled', () => count++);
            unregister();
            system.assembleGolem({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('golemAssembled', () => { throw new Error('x'); });
            expect(() => system.assembleGolem({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalGolems = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalGolems = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.assembleGolem({});
            const json = system.toJSON();
            expect(json.golems.length).toBe(1);
        });
        it('should deserialize', () => {
            system.assembleGolem({});
            const json = system.toJSON();
            const newSys = new MechanicalGolem();
            newSys.fromJSON(json);
            expect(newSys.golems.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.golemCount).toBe(0);
        });
    });
});
