/**
 * CultivationKey.test.js - 修真钥匙系统测试
 * V755 Iteration 18/30 Round 30 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationKey } from '../../../systems/ai/CultivationKey.js';

describe('CultivationKey', () => {
    let system;
    beforeEach(() => { system = new CultivationKey(); });

    describe('recruitKey', () => {
        it('should recruit key', () => {
            const { key } = system.recruitKey({ masterId: 'm1', name: 'Celestial Key', type: 'gold' });
            expect(key.masterId).toBe('m1');
            expect(key.name).toBe('Celestial Key');
            expect(key.type).toBe('gold');
        });

        it('should default type to silver', () => {
            const { key } = system.recruitKey({});
            expect(key.type).toBe('silver');
        });

        it('should default name to Unnamed Key', () => {
            const { key } = system.recruitKey({});
            expect(key.name).toBe('Unnamed Key');
        });

        it('should default mastery to baseMastery', () => {
            const { key } = system.recruitKey({});
            expect(key.mastery).toBe(20);
        });

        it('should start at level 1', () => {
            const { key } = system.recruitKey({});
            expect(key.level).toBe(1);
        });

        it('should start with status novice', () => {
            const { key } = system.recruitKey({});
            expect(key.status).toBe('novice');
        });

        it('should start with empty notches', () => {
            const { key } = system.recruitKey({});
            expect(key.notches).toEqual([]);
        });

        it('should generate keyId', () => {
            const { key } = system.recruitKey({});
            expect(key.keyId).toBeDefined();
            expect(typeof key.keyId).toBe('string');
        });

        it('should accept custom keyId', () => {
            const { key } = system.recruitKey({ keyId: 'my-key' });
            expect(key.keyId).toBe('my-key');
        });

        it('should support all types', () => {
            const { key: k1 } = system.recruitKey({ type: 'gold' });
            const { key: k2 } = system.recruitKey({ type: 'silver' });
            const { key: k3 } = system.recruitKey({ type: 'divine' });
            expect(k1.type).toBe('gold');
            expect(k2.type).toBe('silver');
            expect(k3.type).toBe('divine');
        });

        it('should trigger keyRecruited hook', () => {
            let called = false;
            system.registerHook('keyRecruited', () => { called = true; });
            system.recruitKey({});
            expect(called).toBe(true);
        });
    });

    describe('getKey', () => {
        it('should return key', () => {
            const { key } = system.recruitKey({});
            expect(system.getKey(key.keyId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getKey('ghost')).toBeNull(); });
    });

    describe('listKeys', () => {
        it('should list all', () => {
            system.recruitKey({});
            system.recruitKey({});
            expect(system.listKeys().length).toBe(2);
        });

        it('should return empty when no keys', () => {
            expect(system.listKeys().length).toBe(0);
        });
    });

    describe('listByMaster', () => {
        it('should filter by master', () => {
            system.recruitKey({ masterId: 'm1' });
            system.recruitKey({ masterId: 'm2' });
            system.recruitKey({ masterId: 'm1' });
            expect(system.listByMaster('m1').length).toBe(2);
        });

        it('should return empty for missing master', () => {
            system.recruitKey({ masterId: 'm1' });
            expect(system.listByMaster('ghost').length).toBe(0);
        });
    });

    describe('listLegendary', () => {
        it('should filter legendary', () => {
            const { key: k1 } = system.recruitKey({});
            const { key: k2 } = system.recruitKey({});
            system.legendKey(k1.keyId);
            const legendary = system.listLegendary();
            expect(legendary.length).toBe(1);
            expect(legendary[0].keyId).toBe(k1.keyId);
        });

        it('should return empty when none legendary', () => {
            system.recruitKey({});
            expect(system.listLegendary().length).toBe(0);
        });
    });

    describe('addNotch', () => {
        it('should add notch', () => {
            const { key } = system.recruitKey({});
            system.addNotch(key.keyId, 'dragon-notch');
            expect(key.notches).toContain('dragon-notch');
            expect(key.notches.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addNotch('ghost', 'notch');
            expect(result.error).toBe('KEY_NOT_FOUND');
        });

        it('should trigger notchAdded hook', () => {
            const { key } = system.recruitKey({});
            let called = false;
            system.registerHook('notchAdded', () => { called = true; });
            system.addNotch(key.keyId, 'notch');
            expect(called).toBe(true);
        });

        it('should add multiple notches', () => {
            const { key } = system.recruitKey({});
            system.addNotch(key.keyId, 'notch1');
            system.addNotch(key.keyId, 'notch2');
            expect(key.notches.length).toBe(2);
        });
    });

    describe('raiseMastery', () => {
        it('should raise mastery', () => {
            const { key } = system.recruitKey({});
            system.raiseMastery(key.keyId, 10);
            expect(key.mastery).toBe(30);
        });

        it('should default amount to 5', () => {
            const { key } = system.recruitKey({});
            system.raiseMastery(key.keyId);
            expect(key.mastery).toBe(25);
        });

        it('should reject missing', () => {
            const result = system.raiseMastery('ghost', 10);
            expect(result.error).toBe('KEY_NOT_FOUND');
        });

        it('should trigger masteryRaised hook', () => {
            const { key } = system.recruitKey({});
            let called = false;
            system.registerHook('masteryRaised', () => { called = true; });
            system.raiseMastery(key.keyId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpKey', () => {
        it('should level up', () => {
            const { key } = system.recruitKey({});
            system.levelUpKey(key.keyId);
            expect(key.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpKey('ghost');
            expect(result.error).toBe('KEY_NOT_FOUND');
        });

        it('should trigger keyLeveledUp hook', () => {
            const { key } = system.recruitKey({});
            let called = false;
            system.registerHook('keyLeveledUp', () => { called = true; });
            system.levelUpKey(key.keyId);
            expect(called).toBe(true);
        });
    });

    describe('legendKey', () => {
        it('should set status to legendary', () => {
            const { key } = system.recruitKey({});
            system.legendKey(key.keyId);
            expect(key.status).toBe('legendary');
        });

        it('should reject missing', () => {
            const result = system.legendKey('ghost');
            expect(result.error).toBe('KEY_NOT_FOUND');
        });

        it('should trigger keyLegendized hook', () => {
            const { key } = system.recruitKey({});
            let called = false;
            system.registerHook('keyLegendized', () => { called = true; });
            system.legendKey(key.keyId);
            expect(called).toBe(true);
        });
    });

    describe('listByType', () => {
        it('should filter by type', () => {
            system.recruitKey({ type: 'gold' });
            system.recruitKey({ type: 'silver' });
            system.recruitKey({ type: 'divine' });
            expect(system.listByType('silver').length).toBe(1);
        });

        it('should return empty for missing type', () => {
            system.recruitKey({ type: 'gold' });
            expect(system.listByType('cosmic').length).toBe(0);
        });
    });

    describe('listVeteran', () => {
        it('should return empty when no veteran keys', () => {
            system.recruitKey({});
            expect(system.listVeteran().length).toBe(0);
        });
    });

    describe('calculateKeyValue', () => {
        it('should calculate for default key', () => {
            const { key } = system.recruitKey({});
            // level 1 * 100 + mastery 20 * 2 + 0 notches * 30 = 100 + 40 + 0 = 140
            expect(system.calculateKeyValue(key.keyId)).toBe(140);
        });

        it('should incorporate level, mastery, and notches', () => {
            const { key } = system.recruitKey({});
            system.levelUpKey(key.keyId); // level 2
            system.raiseMastery(key.keyId, 10); // mastery 30
            system.addNotch(key.keyId, 'notch1'); // 1 notch
            system.addNotch(key.keyId, 'notch2'); // 2 notches
            // 2*100 + 30*2 + 2*30 = 200 + 60 + 60 = 320
            expect(system.calculateKeyValue(key.keyId)).toBe(320);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateKeyValue('ghost')).toBe(0);
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

        it('should execute default getKey', () => {
            const result = system.executeTool('getKey', { keyId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('keyRecruited', () => count++);
            unregister();
            system.recruitKey({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('keyRecruited', () => { throw new Error('x'); });
            expect(() => system.recruitKey({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalKeys = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalKeys = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.recruitKey({});
            const json = system.toJSON();
            expect(json.keys.length).toBe(1);
        });
        it('should deserialize', () => {
            system.recruitKey({});
            const json = system.toJSON();
            const newSys = new CultivationKey();
            newSys.fromJSON(json);
            expect(newSys.keys.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.keyCount).toBe(0);
        });
    });
});
