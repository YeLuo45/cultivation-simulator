/**
 * CultivationLock.test.js - 修真锁系统测试
 * V756 Iteration 19/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationLock } from '../../../systems/ai/CultivationLock.js';

describe('CultivationLock', () => {
    let system;
    beforeEach(() => { system = new CultivationLock(); });

    describe('recruitLock', () => {
        it('should recruit lock', () => {
            const { lock } = system.recruitLock({ masterId: 'm1', name: 'Celestial Lock', type: 'gold' });
            expect(lock.masterId).toBe('m1');
            expect(lock.name).toBe('Celestial Lock');
            expect(lock.type).toBe('gold');
        });

        it('should default type to silver', () => {
            const { lock } = system.recruitLock({});
            expect(lock.type).toBe('silver');
        });

        it('should default name to Unnamed Lock', () => {
            const { lock } = system.recruitLock({});
            expect(lock.name).toBe('Unnamed Lock');
        });

        it('should default resistance to baseResistance', () => {
            const { lock } = system.recruitLock({});
            expect(lock.resistance).toBe(20);
        });

        it('should start at level 1', () => {
            const { lock } = system.recruitLock({});
            expect(lock.level).toBe(1);
        });

        it('should start with status novice', () => {
            const { lock } = system.recruitLock({});
            expect(lock.status).toBe('novice');
        });

        it('should start with empty pins', () => {
            const { lock } = system.recruitLock({});
            expect(lock.pins).toEqual([]);
        });

        it('should generate lockId', () => {
            const { lock } = system.recruitLock({});
            expect(lock.lockId).toBeDefined();
            expect(typeof lock.lockId).toBe('string');
        });

        it('should accept custom lockId', () => {
            const { lock } = system.recruitLock({ lockId: 'my-lock' });
            expect(lock.lockId).toBe('my-lock');
        });

        it('should support all types', () => {
            const { lock: l1 } = system.recruitLock({ type: 'gold' });
            const { lock: l2 } = system.recruitLock({ type: 'silver' });
            const { lock: l3 } = system.recruitLock({ type: 'divine' });
            expect(l1.type).toBe('gold');
            expect(l2.type).toBe('silver');
            expect(l3.type).toBe('divine');
        });

        it('should trigger lockRecruited hook', () => {
            let called = false;
            system.registerHook('lockRecruited', () => { called = true; });
            system.recruitLock({});
            expect(called).toBe(true);
        });
    });

    describe('getLock', () => {
        it('should return lock', () => {
            const { lock } = system.recruitLock({});
            expect(system.getLock(lock.lockId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getLock('ghost')).toBeNull(); });
    });

    describe('listLocks', () => {
        it('should list all', () => {
            system.recruitLock({});
            system.recruitLock({});
            expect(system.listLocks().length).toBe(2);
        });

        it('should return empty when no locks', () => {
            expect(system.listLocks().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitLock({ masterId: 'm1' });
            system.recruitLock({ masterId: 'm2' });
            system.recruitLock({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for missing master', () => {
            system.recruitLock({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { lock: l1 } = system.recruitLock({});
            const { lock: l2 } = system.recruitLock({});
            system.legendLock(l1.lockId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].lockId).toBe(l1.lockId);
        });

        it('should return empty when none legendary', () => {
            system.recruitLock({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addPin', () => {
        it('should add pin', () => {
            const { lock } = system.recruitLock({});
            system.addPin(lock.lockId, 'dragon-pin');
            expect(lock.pins).toContain('dragon-pin');
            expect(lock.pins.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addPin('ghost', 'pin');
            expect(result.error).toBe('LOCK_NOT_FOUND');
        });

        it('should trigger pinAdded hook', () => {
            const { lock } = system.recruitLock({});
            let called = false;
            system.registerHook('pinAdded', () => { called = true; });
            system.addPin(lock.lockId, 'pin');
            expect(called).toBe(true);
        });

        it('should add multiple pins', () => {
            const { lock } = system.recruitLock({});
            system.addPin(lock.lockId, 'pin1');
            system.addPin(lock.lockId, 'pin2');
            expect(lock.pins.length).toBe(2);
        });
    });

    describe('raiseResistance', () => {
        it('should raise resistance', () => {
            const { lock } = system.recruitLock({});
            system.raiseResistance(lock.lockId, 10);
            expect(lock.resistance).toBe(30);
        });

        it('should default amount to 5', () => {
            const { lock } = system.recruitLock({});
            system.raiseResistance(lock.lockId);
            expect(lock.resistance).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseResistance('ghost', 10);
            expect(result.error).toBe('LOCK_NOT_FOUND');
        });

        it('should trigger resistanceRaised hook', () => {
            const { lock } = system.recruitLock({});
            let called = false;
            system.registerHook('resistanceRaised', () => { called = true; });
            system.raiseResistance(lock.lockId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpLock', () => {
        it('should level up', () => {
            const { lock } = system.recruitLock({});
            system.levelUpLock(lock.lockId);
            expect(lock.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpLock('ghost');
            expect(result.error).toBe('LOCK_NOT_FOUND');
        });

        it('should trigger lockLeveledUp hook', () => {
            const { lock } = system.recruitLock({});
            let called = false;
            system.registerHook('lockLeveledUp', () => { called = true; });
            system.levelUpLock(lock.lockId);
            expect(called).toBe(true);
        });
    });

    describe('legendLock', () => {
        it('should set status to legendary', () => {
            const { lock } = system.recruitLock({});
            system.legendLock(lock.lockId);
            expect(lock.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendLock('ghost');
            expect(result.error).toBe('LOCK_NOT_FOUND');
        });

        it('should trigger lockLegendized hook', () => {
            const { lock } = system.recruitLock({});
            let called = false;
            system.registerHook('lockLegendized', () => { called = true; });
            system.legendLock(lock.lockId);
            expect(called).toBe(true);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitLock({ type: 'gold' });
            system.recruitLock({ type: 'silver' });
            system.recruitLock({ type: 'divine' });
            expect(system.listByType('silver').length).toBe(1);
        });

        it('should return empty for missing type', () => {
            system.recruitLock({ type: 'gold' });
            expect(system.listByType('cosmic').length).toBe(0);
        });
    });

    describe('listVeteran', () => {
        it('should return empty when no veteran locks', () => {
            system.recruitLock({});
            expect(system.listVeteran().length).toBe(0);
        });
    });

    describe('calculateLockValue', () => {
        it('should calculate for default lock', () => {
            const { lock } = system.recruitLock({});
            // level 1 * 100 + resistance 20 * 2 + 0 pins * 30 = 100 + 40 + 0 = 140
            expect(system.calculateLockValue(lock.lockId)).toBe(140);
        });

        it('should incorporate level, resistance, and pins', () => {
            const { lock } = system.recruitLock({});
            system.levelUpLock(lock.lockId); // level 2
            system.raiseResistance(lock.lockId, 10); // resistance 30
            system.addPin(lock.lockId, 'pin1'); // 1 pin
            system.addPin(lock.lockId, 'pin2'); // 2 pins
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateLockValue(lock.lockId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateLockValue('ghost')).toBe(0);
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

        it('should execute default getLock', () => {
            const result = system.executeTool('getLock', { lockId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('lockRecruited', () => count++);
            unregister();
            system.recruitLock({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('lockRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitLock({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalLocks = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalLocks = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitLock({});
            const json = system.toJSON();
            expect(json.locks.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitLock({});
            const json = system.toJSON();
            const newSys = new CultivationLock();
            newSys.fromJSON(json);
            expect(newSys.locks.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.lockCount).toBe(0);
        });
    });
});
