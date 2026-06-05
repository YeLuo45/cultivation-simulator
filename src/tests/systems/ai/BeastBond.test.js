/**
 * BeastBond.test.js - 灵兽契约系统测试
 * V327 Iteration 6/9 Round 5 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BeastBond } from '../../../systems/ai/BeastBond.js';

describe('BeastBond', () => {
    let system;
    beforeEach(() => { system = new BeastBond(); });

    describe('Default Bond Types', () => {
        it('should have default types', () => { expect(system.bondTypes.size).toBe(3); });
        it('should contain soul', () => { expect(system.bondTypes.get('soul')).not.toBeUndefined(); });
    });

    describe('createBond', () => {
        it('should create', () => {
            const { bond } = system.createBond({ typeId: 'soul', cultivatorId: 'c1', beastId: 'b1' });
            expect(bond.cultivatorId).toBe('c1');
        });

        it('should start at level 1', () => {
            const { bond } = system.createBond({ typeId: 'soul' });
            expect(bond.level).toBe(1);
        });

        it('should reject missing type', () => {
            const result = system.createBond({ typeId: 'ghost' });
            expect(result.error).toBe('TYPE_NOT_FOUND');
        });

        it('should trigger bondCreated hook', () => {
            let called = false;
            system.registerHook('bondCreated', () => { called = true; });
            system.createBond({ typeId: 'soul' });
            expect(called).toBe(true);
        });
    });

    describe('getBond', () => {
        it('should return', () => {
            const { bond } = system.createBond({ typeId: 'soul' });
            expect(system.getBond(bond.bondId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBond('ghost')).toBeNull(); });
    });

    describe('listBonds', () => {
        it('should list all', () => {
            system.createBond({ typeId: 'soul' });
            expect(system.listBonds().length).toBe(1);
        });
    });

    describe('getBondsByCultivator', () => {
        it('should filter', () => {
            system.createBond({ typeId: 'soul', cultivatorId: 'c1' });
            system.createBond({ typeId: 'soul', cultivatorId: 'c2' });
            expect(system.getBondsByCultivator('c1').length).toBe(1);
        });
    });

    describe('strengthenBond', () => {
        it('should strengthen', () => {
            const { bond } = system.createBond({ typeId: 'soul' });
            const result = system.strengthenBond(bond.bondId, 50);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.strengthenBond('ghost', 50);
            expect(result.error).toBe('BOND_NOT_FOUND');
        });

        it('should level up at threshold', () => {
            const { bond } = system.createBond({ typeId: 'soul' });
            system.strengthenBond(bond.bondId, 1000);
            expect(bond.level).toBeGreaterThan(1);
        });

        it('should trigger bondLevelUp hook', () => {
            const { bond } = system.createBond({ typeId: 'soul' });
            let called = false;
            system.registerHook('bondLevelUp', () => { called = true; });
            system.strengthenBond(bond.bondId, 1000);
            expect(called).toBe(true);
        });

        it('should trigger bondStrengthened hook', () => {
            const { bond } = system.createBond({ typeId: 'soul' });
            let called = false;
            system.registerHook('bondStrengthened', () => { called = true; });
            system.strengthenBond(bond.bondId, 10);
            expect(called).toBe(true);
        });
    });

    describe('severBond', () => {
        it('should sever', () => {
            const { bond } = system.createBond({ typeId: 'soul' });
            const result = system.severBond(bond.bondId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.severBond('ghost');
            expect(result.error).toBe('BOND_NOT_FOUND');
        });

        it('should trigger bondSevered hook', () => {
            const { bond } = system.createBond({ typeId: 'soul' });
            let called = false;
            system.registerHook('bondSevered', () => { called = true; });
            system.severBond(bond.bondId);
            expect(called).toBe(true);
        });
    });

    describe('getBondBenefits', () => {
        it('should return benefits', () => {
            const { bond } = system.createBond({ typeId: 'soul' });
            const benefits = system.getBondBenefits(bond.bondId);
            expect(benefits.power).toBeGreaterThan(0);
        });

        it('should return null for missing', () => { expect(system.getBondBenefits('ghost')).toBeNull(); });

        it('should scale with level', () => {
            const { bond } = system.createBond({ typeId: 'soul' });
            const before = system.getBondBenefits(bond.bondId).power;
            bond.level = 5;
            const after = system.getBondBenefits(bond.bondId).power;
            expect(after).toBeGreaterThan(before);
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

        it('should execute default getBond', () => {
            const result = system.executeTool('getBond', { bondId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('bondCreated', () => count++);
            unregister();
            system.createBond({ typeId: 'soul' });
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('bondCreated', () => { throw new Error('x'); });
            expect(() => system.createBond({ typeId: 'soul' })).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalBonds = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalBonds = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createBond({ typeId: 'soul' });
            const json = system.toJSON();
            expect(json.bonds.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createBond({ typeId: 'soul' });
            const json = system.toJSON();
            const newSys = new BeastBond();
            newSys.fromJSON(json);
            expect(newSys.bonds.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.typeCount).toBe(3);
        });
    });
});