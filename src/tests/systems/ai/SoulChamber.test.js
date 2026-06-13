/**
 * SoulChamber.test.js - 灵魂殿堂测试
 * V371 Iteration 5/9 Round 10 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SoulChamber } from '../../../systems/ai/SoulChamber.js';

describe('SoulChamber', () => {
    let system;
    beforeEach(() => { system = new SoulChamber(); });

    describe('createChamber', () => {
        it('should create', () => {
            const { chamber } = system.createChamber({ name: 'C1' });
            expect(chamber.name).toBe('C1');
        });

        it('should trigger chamberCreated hook', () => {
            let called = false;
            system.registerHook('chamberCreated', () => { called = true; });
            system.createChamber({});
            expect(called).toBe(true);
        });
    });

    describe('getChamber', () => {
        it('should return', () => {
            const { chamber } = system.createChamber({});
            expect(system.getChamber(chamber.chamberId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getChamber('ghost')).toBeNull(); });
    });

    describe('listChambers', () => {
        it('should list all', () => {
            system.createChamber({});
            expect(system.listChambers().length).toBe(1);
        });
    });

    describe('listByOwner', () => {
        it('should filter', () => {
            system.createChamber({ ownerId: 'o1' });
            system.createChamber({ ownerId: 'o2' });
            expect(system.listByOwner('o1').length).toBe(1);
        });
    });

    describe('listByLevel', () => {
        it('should filter', () => {
            const { chamber: c1 } = system.createChamber({});
            const { chamber: c2 } = system.createChamber({});
            c1.level = 1;
            c2.level = 2;
            expect(system.listByLevel(2).length).toBe(1);
        });
    });

    describe('addResident', () => {
        it('should add', () => {
            const { chamber } = system.createChamber({});
            const result = system.addResident(chamber.chamberId, 's1');
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.addResident('ghost', 's1');
            expect(result.error).toBe('CHAMBER_NOT_FOUND');
        });

        it('should reject full', () => {
            const { chamber } = system.createChamber({ capacity: 1 });
            system.addResident(chamber.chamberId, 's1');
            const result = system.addResident(chamber.chamberId, 's2');
            expect(result.error).toBe('CHAMBER_FULL');
        });

        it('should trigger residentAdded hook', () => {
            const { chamber } = system.createChamber({});
            let called = false;
            system.registerHook('residentAdded', () => { called = true; });
            system.addResident(chamber.chamberId, 's1');
            expect(called).toBe(true);
        });
    });

    describe('removeResident', () => {
        it('should remove', () => {
            const { chamber } = system.createChamber({});
            system.addResident(chamber.chamberId, 's1');
            const result = system.removeResident(chamber.chamberId, 's1');
            expect(result.success).toBe(true);
        });

        it('should reject missing chamber', () => {
            const result = system.removeResident('ghost', 's1');
            expect(result.error).toBe('CHAMBER_NOT_FOUND');
        });

        it('should reject missing resident', () => {
            const { chamber } = system.createChamber({});
            const result = system.removeResident(chamber.chamberId, 'ghost');
            expect(result.error).toBe('RESIDENT_NOT_FOUND');
        });

        it('should trigger residentRemoved hook', () => {
            const { chamber } = system.createChamber({});
            system.addResident(chamber.chamberId, 's1');
            let called = false;
            system.registerHook('residentRemoved', () => { called = true; });
            system.removeResident(chamber.chamberId, 's1');
            expect(called).toBe(true);
        });
    });

    describe('upgradeChamber', () => {
        it('should upgrade', () => {
            const { chamber } = system.createChamber({});
            system.upgradeChamber(chamber.chamberId);
            expect(chamber.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.upgradeChamber('ghost');
            expect(result.error).toBe('CHAMBER_NOT_FOUND');
        });

        it('should trigger chamberUpgraded hook', () => {
            const { chamber } = system.createChamber({});
            let called = false;
            system.registerHook('chamberUpgraded', () => { called = true; });
            system.upgradeChamber(chamber.chamberId);
            expect(called).toBe(true);
        });
    });

    describe('destroyChamber', () => {
        it('should destroy', () => {
            const { chamber } = system.createChamber({});
            const result = system.destroyChamber(chamber.chamberId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.destroyChamber('ghost');
            expect(result.error).toBe('CHAMBER_NOT_FOUND');
        });

        it('should trigger chamberDestroyed hook', () => {
            const { chamber } = system.createChamber({});
            let called = false;
            system.registerHook('chamberDestroyed', () => { called = true; });
            system.destroyChamber(chamber.chamberId);
            expect(called).toBe(true);
        });
    });

    describe('getResidentCount', () => {
        it('should return', () => {
            const { chamber } = system.createChamber({});
            system.addResident(chamber.chamberId, 's1');
            expect(system.getResidentCount(chamber.chamberId)).toBe(1);
        });

        it('should return 0 for missing', () => {
            expect(system.getResidentCount('ghost')).toBe(0);
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

        it('should execute default getChamber', () => {
            const result = system.executeTool('getChamber', { chamberId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('chamberCreated', () => count++);
            unregister();
            system.createChamber({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('chamberCreated', () => { throw new Error('x'); });
            expect(() => system.createChamber({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalChambers = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalChambers = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createChamber({});
            const json = system.toJSON();
            expect(json.chambers.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createChamber({});
            const json = system.toJSON();
            const newSys = new SoulChamber();
            newSys.fromJSON(json);
            expect(newSys.chambers.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.chamberCount).toBe(0);
        });
    });
});