/**
 * CultivationClass.test.js - 修真阶级系统测试
 * V551 Iteration 14/20 Round 22 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationClass } from '../../../systems/ai/CultivationClass.js';

describe('CultivationClass', () => {
    let system;
    beforeEach(() => { system = new CultivationClass(); });

    describe('openClass', () => {
        it('should create', () => {
            const { class: cls } = system.openClass({ ownerId: 'o1', name: 'Masons' });
            expect(cls.ownerId).toBe('o1');
            expect(cls.name).toBe('Masons');
        });

        it('should default type to worker', () => {
            const { class: cls } = system.openClass({ ownerId: 'o1' });
            expect(cls.type).toBe('worker');
        });

        it('should default reputation to baseReputation', () => {
            const { class: cls } = system.openClass({ ownerId: 'o1' });
            expect(cls.reputation).toBe(20);
        });

        it('should default status to forming', () => {
            const { class: cls } = system.openClass({ ownerId: 'o1' });
            expect(cls.status).toBe('forming');
        });

        it('should initialize deeds as empty array', () => {
            const { class: cls } = system.openClass({ ownerId: 'o1' });
            expect(cls.deeds).toEqual([]);
            expect(cls.deeds.length).toBe(0);
        });

        it('should support custom classId', () => {
            const { class: cls } = system.openClass({ classId: 'custom-id', ownerId: 'o1' });
            expect(cls.classId).toBe('custom-id');
        });

        it('should support type scholar', () => {
            const { class: cls } = system.openClass({ ownerId: 'o1', type: 'scholar' });
            expect(cls.type).toBe('scholar');
        });

        it('should support type warrior', () => {
            const { class: cls } = system.openClass({ ownerId: 'o1', type: 'warrior' });
            expect(cls.type).toBe('warrior');
        });

        it('should initialize level to 1', () => {
            const { class: cls } = system.openClass({ ownerId: 'o1' });
            expect(cls.level).toBe(1);
        });

        it('should trigger classOpened hook', () => {
            let called = false;
            system.registerHook('classOpened', () => { called = true; });
            system.openClass({});
            expect(called).toBe(true);
        });

        it('should increment totalClasses stat', () => {
            system.openClass({});
            expect(system.stats.totalClasses).toBe(1);
        });

        it('should reject when maxClasses reached', () => {
            const sys = new CultivationClass({ maxClasses: 1 });
            sys.openClass({});
            const result = sys.openClass({});
            expect(result.error).toBe('MAX_CLASSES_REACHED');
        });
    });

    describe('getClass', () => {
        it('should return', () => {
            const { class: cls } = system.openClass({});
            expect(system.getClass(cls.classId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getClass('ghost')).toBeNull(); });
    });

    describe('listClasses', () => {
        it('should list all', () => {
            system.openClass({});
            system.openClass({});
            expect(system.listClasses().length).toBe(2);
        });

        it('should return empty list when none', () => {
            expect(system.listClasses().length).toBe(0);
        });
    });

    describe('listByOwner', () => {
        it('should filter', () => {
            system.openClass({ ownerId: 'o1' });
            system.openClass({ ownerId: 'o2' });
            system.openClass({ ownerId: 'o1' });
            expect(system.listByOwner('o1').length).toBe(2);
        });

        it('should return empty for unknown owner', () => {
            system.openClass({ ownerId: 'o1' });
            expect(system.listByOwner('unknown').length).toBe(0);
        });
    });

    describe('listEstablished', () => {
        it('should filter only established/renowned', () => {
            const { class: c1 } = system.openClass({ ownerId: 'o1' });
            system.openClass({ ownerId: 'o1' });
            system.establishClass(c1.classId);
            const result = system.listEstablished();
            expect(result.length).toBe(1);
        });
    });

    describe('addDeed', () => {
        it('should add deed', () => {
            const { class: cls } = system.openClass({});
            system.addDeed(cls.classId, 'helped a traveler');
            expect(cls.deeds).toContain('helped a traveler');
        });

        it('should add multiple deeds', () => {
            const { class: cls } = system.openClass({});
            system.addDeed(cls.classId, 'deed1');
            system.addDeed(cls.classId, 'deed2');
            expect(cls.deeds.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addDeed('ghost', 'x');
            expect(result.error).toBe('CLASS_NOT_FOUND');
        });

        it('should trigger deedAdded hook', () => {
            const { class: cls } = system.openClass({});
            let called = false;
            system.registerHook('deedAdded', () => { called = true; });
            system.addDeed(cls.classId, 'test');
            expect(called).toBe(true);
        });
    });

    describe('increaseReputation', () => {
        it('should increase by default 5', () => {
            const { class: cls } = system.openClass({});
            system.increaseReputation(cls.classId);
            expect(cls.reputation).toBe(25);
        });

        it('should increase by custom amount', () => {
            const { class: cls } = system.openClass({});
            system.increaseReputation(cls.classId, 100);
            expect(cls.reputation).toBe(120);
        });

        it('should reject missing', () => {
            const result = system.increaseReputation('ghost', 10);
            expect(result.error).toBe('CLASS_NOT_FOUND');
        });

        it('should trigger reputationIncreased hook', () => {
            const { class: cls } = system.openClass({});
            let called = false;
            system.registerHook('reputationIncreased', () => { called = true; });
            system.increaseReputation(cls.classId, 5);
            expect(called).toBe(true);
        });
    });

    describe('levelUpClass', () => {
        it('should level up', () => {
            const { class: cls } = system.openClass({});
            system.levelUpClass(cls.classId);
            expect(cls.level).toBe(2);
        });

        it('should level up multiple times', () => {
            const { class: cls } = system.openClass({});
            system.levelUpClass(cls.classId);
            system.levelUpClass(cls.classId);
            expect(cls.level).toBe(3);
        });

        it('should reject missing', () => {
            const result = system.levelUpClass('ghost');
            expect(result.error).toBe('CLASS_NOT_FOUND');
        });

        it('should trigger classLeveledUp hook', () => {
            const { class: cls } = system.openClass({});
            let called = false;
            system.registerHook('classLeveledUp', () => { called = true; });
            system.levelUpClass(cls.classId);
            expect(called).toBe(true);
        });
    });

    describe('establishClass', () => {
        it('should set status to established', () => {
            const { class: cls } = system.openClass({});
            system.establishClass(cls.classId);
            expect(cls.status).toBe('established');
        });

        it('should reject missing', () => {
            const result = system.establishClass('ghost');
            expect(result.error).toBe('CLASS_NOT_FOUND');
        });

        it('should trigger classEstablished hook', () => {
            const { class: cls } = system.openClass({});
            let called = false;
            system.registerHook('classEstablished', () => { called = true; });
            system.establishClass(cls.classId);
            expect(called).toBe(true);
        });
    });

    describe('calculateClassValue', () => {
        it('should calculate', () => {
            const { class: cls } = system.openClass({});
            // level 1 * 100 + reputation 20 * 2 + deeds 0 * 30 = 140
            expect(system.calculateClassValue(cls.classId)).toBe(140);
        });

        it('should include deeds', () => {
            const { class: cls } = system.openClass({});
            system.addDeed(cls.classId, 'a');
            system.addDeed(cls.classId, 'b');
            // level 1 * 100 + reputation 20 * 2 + deeds 2 * 30 = 200
            expect(system.calculateClassValue(cls.classId)).toBe(200);
        });

        it('should include level', () => {
            const { class: cls } = system.openClass({});
            system.levelUpClass(cls.classId);
            // level 2 * 100 + reputation 20 * 2 + deeds 0 * 30 = 240
            expect(system.calculateClassValue(cls.classId)).toBe(240);
        });

        it('should include reputation', () => {
            const { class: cls } = system.openClass({});
            system.increaseReputation(cls.classId, 30);
            // level 1 * 100 + reputation 50 * 2 + deeds 0 * 30 = 200
            expect(system.calculateClassValue(cls.classId)).toBe(200);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateClassValue('ghost')).toBe(0);
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

        it('should execute default getClass', () => {
            const result = system.executeTool('getClass', { classId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('classOpened', () => count++);
            unregister();
            system.openClass({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('classOpened', () => { throw new Error('x'); });
            expect(() => system.openClass({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalClasses = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalClasses = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openClass({});
            const json = system.toJSON();
            expect(json.classes.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openClass({});
            const json = system.toJSON();
            const newSys = new CultivationClass();
            newSys.fromJSON(json);
            expect(newSys.classes.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.classCount).toBe(0);
        });

        it('should include totalClasses', () => {
            system.openClass({});
            const stats = system.getStats();
            expect(stats.totalClasses).toBe(1);
        });
    });
});
