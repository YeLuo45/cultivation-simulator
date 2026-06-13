/**
 * TalismanCrafting.test.js - 符箓制作测试
 * V440 Iteration 2/15 Round 16 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TalismanCrafting } from '../../../systems/ai/TalismanCrafting.js';

describe('TalismanCrafting', () => {
    let system;
    beforeEach(() => { system = new TalismanCrafting(); });

    describe('craftTalisman', () => {
        it('should craft', () => {
            const { talisman } = system.craftTalisman({ crafterId: 'c1', name: 'Fire Talisman', type: 'attack' });
            expect(talisman.crafterId).toBe('c1');
            expect(talisman.name).toBe('Fire Talisman');
            expect(talisman.type).toBe('attack');
        });

        it('should default type and power', () => {
            const { talisman } = system.craftTalisman({ crafterId: 'c1' });
            expect(talisman.type).toBe('attack');
            expect(talisman.power).toBe(20);
            expect(talisman.charges).toBe(1);
            expect(talisman.status).toBe('draft');
        });

        it('should trigger talismanCrafted hook', () => {
            let called = false;
            system.registerHook('talismanCrafted', () => { called = true; });
            system.craftTalisman({});
            expect(called).toBe(true);
        });
    });

    describe('getTalisman', () => {
        it('should return', () => {
            const { talisman } = system.craftTalisman({});
            expect(system.getTalisman(talisman.talismanId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getTalisman('ghost')).toBeNull(); });
    });

    describe('listTalismans', () => {
        it('should list all', () => {
            system.craftTalisman({});
            system.craftTalisman({});
            expect(system.listTalismans().length).toBe(2);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.craftTalisman({ type: 'attack' });
            system.craftTalisman({ type: 'defense' });
            system.craftTalisman({ type: 'attack' });
            expect(system.listByType('attack').length).toBe(2);
            expect(system.listByType('defense').length).toBe(1);
        });
    });

    describe('listByCrafter', () => {
        it('should filter by crafter', () => {
            system.craftTalisman({ crafterId: 'c1' });
            system.craftTalisman({ crafterId: 'c2' });
            expect(system.listByCrafter('c1').length).toBe(1);
        });
    });

    describe('empowerTalisman', () => {
        it('should empower', () => {
            const { talisman } = system.craftTalisman({});
            system.empowerTalisman(talisman.talismanId, 10);
            expect(talisman.power).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.empowerTalisman('ghost', 10);
            expect(result.error).toBe('TALISMAN_NOT_FOUND');
        });

        it('should trigger talismanEmpowered hook', () => {
            const { talisman } = system.craftTalisman({});
            let called = false;
            system.registerHook('talismanEmpowered', () => { called = true; });
            system.empowerTalisman(talisman.talismanId, 5);
            expect(called).toBe(true);
        });
    });

    describe('rechargeTalisman', () => {
        it('should recharge', () => {
            const { talisman } = system.craftTalisman({});
            system.rechargeTalisman(talisman.talismanId, 3);
            expect(talisman.charges).toBe(4);
        });

        it('should reject missing', () => {
            const result = system.rechargeTalisman('ghost', 2);
            expect(result.error).toBe('TALISMAN_NOT_FOUND');
        });

        it('should trigger talismanRecharged hook', () => {
            const { talisman } = system.craftTalisman({});
            let called = false;
            system.registerHook('talismanRecharged', () => { called = true; });
            system.rechargeTalisman(talisman.talismanId, 2);
            expect(called).toBe(true);
        });
    });

    describe('activateTalisman', () => {
        it('should activate', () => {
            const { talisman } = system.craftTalisman({});
            system.activateTalisman(talisman.talismanId);
            expect(talisman.status).toBe('active');
        });

        it('should reject missing', () => {
            const result = system.activateTalisman('ghost');
            expect(result.error).toBe('TALISMAN_NOT_FOUND');
        });

        it('should trigger talismanActivated hook', () => {
            const { talisman } = system.craftTalisman({});
            let called = false;
            system.registerHook('talismanActivated', () => { called = true; });
            system.activateTalisman(talisman.talismanId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTalismanStrength', () => {
        it('should calculate', () => {
            const { talisman } = system.craftTalisman({ power: 50, charges: 3 });
            expect(system.calculateTalismanStrength(talisman.talismanId)).toBe(150);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateTalismanStrength('ghost')).toBe(0);
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

        it('should execute default getTalisman', () => {
            const result = system.executeTool('getTalisman', { talismanId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('talismanCrafted', () => count++);
            unregister();
            system.craftTalisman({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('talismanCrafted', () => { throw new Error('x'); });
            expect(() => system.craftTalisman({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalTalismans = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalTalismans = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.craftTalisman({});
            const json = system.toJSON();
            expect(json.talismans.length).toBe(1);
        });
        it('should deserialize', () => {
            system.craftTalisman({});
            const json = system.toJSON();
            const newSys = new TalismanCrafting();
            newSys.fromJSON(json);
            expect(newSys.talismans.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.talismanCount).toBe(0);
        });
    });
});
