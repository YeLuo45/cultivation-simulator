/**
 * MasterApprentice.test.js - 师徒系统测试
 * V475 Iteration 7/15 Round 18 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MasterApprentice } from '../../../systems/ai/MasterApprentice.js';

describe('MasterApprentice', () => {
    let system;
    beforeEach(() => { system = new MasterApprentice(); });

    describe('formBond', () => {
        it('should form bond', () => {
            const { bond } = system.formBond({ masterId: 'm1', apprenticeId: 'a1' });
            expect(bond.masterId).toBe('m1');
            expect(bond.apprenticeId).toBe('a1');
        });

        it('should default dao to sword', () => {
            const { bond } = system.formBond({});
            expect(bond.dao).toBe('sword');
        });

        it('should set status to proposed', () => {
            const { bond } = system.formBond({});
            expect(bond.status).toBe('proposed');
        });

        it('should default intimacy from config', () => {
            const { bond } = system.formBond({});
            expect(bond.intimacy).toBe(10);
        });

        it('should initialize mastery to 0', () => {
            const { bond } = system.formBond({});
            expect(bond.mastery).toBe(0);
        });

        it('should trigger bondFormed hook', () => {
            let called = false;
            system.registerHook('bondFormed', () => { called = true; });
            system.formBond({});
            expect(called).toBe(true);
        });
    });

    describe('getBond', () => {
        it('should return bond', () => {
            const { bond } = system.formBond({});
            expect(system.getBond(bond.bondId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBond('ghost')).toBeNull(); });
    });

    describe('listBonds', () => {
        it('should list all', () => {
            system.formBond({});
            system.formBond({});
            expect(system.listBonds().length).toBe(2);
        });

        it('should return empty initially', () => {
            expect(system.listBonds().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.formBond({ masterId: 'm1', apprenticeId: 'a1' });
            system.formBond({ masterId: 'm2', apprenticeId: 'a2' });
            expect(system.listByMaster('m1').length).toBe(1);
        });

        it('should return empty for unknown master', () => {
            system.formBond({});
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listByApprentice', () => {
        it('should filter by apprentice', () => {
            system.formBond({ masterId: 'm1', apprenticeId: 'a1' });
            system.formBond({ masterId: 'm2', apprenticeId: 'a2' });
            expect(system.listByApprentice('a1').length).toBe(1);
        });

        it('should return empty for unknown apprentice', () => {
            system.formBond({});
            expect(system.listByApprentice('ghost').length).toBe(0);
        });
    });

    describe('strengthenBond', () => {
        it('should increase intimacy', () => {
            const { bond } = system.formBond({});
            system.strengthenBond(bond.bondId, 15);
            expect(bond.intimacy).toBe(25);
        });

        it('should use default amount of 5', () => {
            const { bond } = system.formBond({});
            system.strengthenBond(bond.bondId);
            expect(bond.intimacy).toBe(15);
        });

        it('should transition status to active', () => {
            const { bond } = system.formBond({});
            system.strengthenBond(bond.bondId, 5);
            expect(bond.status).toBe('active');
        });

        it('should reject missing', () => {
            const result = system.strengthenBond('ghost', 10);
            expect(result.error).toBe('BOND_NOT_FOUND');
        });

        it('should trigger bondStrengthened hook', () => {
            const { bond } = system.formBond({});
            let called = false;
            system.registerHook('bondStrengthened', () => { called = true; });
            system.strengthenBond(bond.bondId, 10);
            expect(called).toBe(true);
        });
    });

    describe('extendDuration', () => {
        it('should increase duration', () => {
            const { bond } = system.formBond({});
            system.extendDuration(bond.bondId, 60);
            expect(bond.duration).toBe(60);
        });

        it('should use default amount of 30', () => {
            const { bond } = system.formBond({});
            system.extendDuration(bond.bondId);
            expect(bond.duration).toBe(30);
        });

        it('should transition status to active', () => {
            const { bond } = system.formBond({});
            system.extendDuration(bond.bondId, 30);
            expect(bond.status).toBe('active');
        });

        it('should reject missing', () => {
            const result = system.extendDuration('ghost', 30);
            expect(result.error).toBe('BOND_NOT_FOUND');
        });

        it('should trigger durationExtended hook', () => {
            const { bond } = system.formBond({});
            let called = false;
            system.registerHook('durationExtended', () => { called = true; });
            system.extendDuration(bond.bondId, 30);
            expect(called).toBe(true);
        });
    });

    describe('teachApprentice', () => {
        it('should increase mastery', () => {
            const { bond } = system.formBond({});
            system.teachApprentice(bond.bondId, 'sword-strike');
            expect(bond.mastery).toBe(1);
        });

        it('should accumulate mastery on multiple teachings', () => {
            const { bond } = system.formBond({});
            system.teachApprentice(bond.bondId, 'a');
            system.teachApprentice(bond.bondId, 'b');
            system.teachApprentice(bond.bondId, 'c');
            expect(bond.mastery).toBe(3);
        });

        it('should store last technique', () => {
            const { bond } = system.formBond({});
            system.teachApprentice(bond.bondId, 'fireball');
            expect(bond.lastTechnique).toBe('fireball');
        });

        it('should reject missing', () => {
            const result = system.teachApprentice('ghost', 'technique');
            expect(result.error).toBe('BOND_NOT_FOUND');
        });

        it('should trigger apprenticeTaught hook', () => {
            const { bond } = system.formBond({});
            let called = false;
            system.registerHook('apprenticeTaught', () => { called = true; });
            system.teachApprentice(bond.bondId, 'sword-strike');
            expect(called).toBe(true);
        });
    });

    describe('severBond', () => {
        it('should set status to severed', () => {
            const { bond } = system.formBond({});
            system.severBond(bond.bondId);
            expect(bond.status).toBe('severed');
        });

        it('should reject missing', () => {
            const result = system.severBond('ghost');
            expect(result.error).toBe('BOND_NOT_FOUND');
        });

        it('should trigger bondSevered hook', () => {
            const { bond } = system.formBond({});
            let called = false;
            system.registerHook('bondSevered', () => { called = true; });
            system.severBond(bond.bondId);
            expect(called).toBe(true);
        });
    });

    describe('calculateBondStrength', () => {
        it('should calculate', () => {
            const { bond } = system.formBond({ dao: 'sword' });
            // intimacy=10, duration=0, dao.length=5 (sword)
            // = 10*2 + 0/10 + 5 = 25
            expect(system.calculateBondStrength(bond.bondId)).toBe(25);
        });

        it('should factor in duration', () => {
            const { bond } = system.formBond({ dao: 'sword' });
            system.extendDuration(bond.bondId, 100);
            // intimacy=10, duration=100, dao.length=5
            // = 10*2 + 100/10 + 5 = 35
            expect(system.calculateBondStrength(bond.bondId)).toBe(35);
        });

        it('should factor in intimacy', () => {
            const { bond } = system.formBond({ dao: 'sword' });
            system.strengthenBond(bond.bondId, 10);
            // intimacy=20, duration=0, dao.length=5
            // = 20*2 + 0/10 + 5 = 45
            expect(system.calculateBondStrength(bond.bondId)).toBe(45);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateBondStrength('ghost')).toBe(0);
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
            const unregister = system.registerHook('bondFormed', () => count++);
            unregister();
            system.formBond({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('bondFormed', () => { throw new Error('x'); });
            expect(() => system.formBond({})).not.toThrow();
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
            system.formBond({});
            const json = system.toJSON();
            expect(json.bonds.length).toBe(1);
        });
        it('should deserialize', () => {
            system.formBond({});
            const json = system.toJSON();
            const newSys = new MasterApprentice();
            newSys.fromJSON(json);
            expect(newSys.bonds.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.bondCount).toBe(0);
        });
    });
});
