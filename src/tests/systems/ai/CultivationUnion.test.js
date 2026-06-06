/**
 * CultivationUnion.test.js - 修真联盟系统测试
 * V555 Iteration 18/20 Round 22 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationUnion } from '../../../systems/ai/CultivationUnion.js';

describe('CultivationUnion', () => {
    let system;
    beforeEach(() => { system = new CultivationUnion(); });

    describe('openUnion', () => {
        it('should open', () => {
            const { union } = system.openUnion({ founderId: 'u1', name: '天剑宗' });
            expect(union.founderId).toBe('u1');
            expect(union.name).toBe('天剑宗');
        });

        it('should default members to empty array', () => {
            const { union } = system.openUnion({});
            expect(union.members).toEqual([]);
        });

        it('should set status to forming', () => {
            const { union } = system.openUnion({});
            expect(union.status).toBe('forming');
        });

        it('should default strength from config', () => {
            const { union } = system.openUnion({});
            expect(union.strength).toBe(20);
        });

        it('should accept custom strength', () => {
            const { union } = system.openUnion({ strength: 80 });
            expect(union.strength).toBe(80);
        });

        it('should generate unionId', () => {
            const { union } = system.openUnion({});
            expect(union.unionId).toBeTruthy();
        });

        it('should accept custom members', () => {
            const { union } = system.openUnion({ members: ['m1', 'm2', 'm3'] });
            expect(union.members.length).toBe(3);
        });

        it('should default type to alliance', () => {
            const { union } = system.openUnion({});
            expect(union.type).toBe('alliance');
        });

        it('should accept custom type war', () => {
            const { union } = system.openUnion({ type: 'war' });
            expect(union.type).toBe('war');
        });

        it('should default level to 1', () => {
            const { union } = system.openUnion({});
            expect(union.level).toBe(1);
        });

        it('should trigger unionOpened hook', () => {
            let called = false;
            system.registerHook('unionOpened', () => { called = true; });
            system.openUnion({});
            expect(called).toBe(true);
        });
    });

    describe('getUnion', () => {
        it('should return union', () => {
            const { union } = system.openUnion({});
            expect(system.getUnion(union.unionId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getUnion('ghost')).toBeNull(); });
    });

    describe('listUnions', () => {
        it('should list all', () => {
            system.openUnion({});
            system.openUnion({});
            system.openUnion({});
            expect(system.listUnions().length).toBe(3);
        });

        it('should return empty initially', () => {
            expect(system.listUnions().length).toBe(0);
        });
    });

    describe('listByFounder', () => {
        it('should filter by founder', () => {
            system.openUnion({ founderId: 'u1' });
            system.openUnion({ founderId: 'u2' });
            system.openUnion({ founderId: 'u1' });
            expect(system.listByFounder('u1').length).toBe(2);
        });

        it('should return empty for unknown founder', () => {
            system.openUnion({});
            expect(system.listByFounder('ghost').length).toBe(0);
        });
    });

    describe('listStable', () => {
        it('should filter stable status', () => {
            const { union: u1 } = system.openUnion({ members: ['m1'] });
            const { union: u2 } = system.openUnion({});
            system.increaseStrength(u1.unionId, 5); // u1 becomes stable
            u2.status = 'forming';
            expect(system.listStable().length).toBe(1);
        });

        it('should include eternal status', () => {
            const { union } = system.openUnion({ members: ['m1'] });
            system.increaseStrength(union.unionId, 5);
            system.eternizeUnion(union.unionId);
            expect(system.listStable().length).toBe(1);
        });

        it('should return empty when no stable', () => {
            system.openUnion({});
            expect(system.listStable().length).toBe(0);
        });
    });

    describe('addMember', () => {
        it('should add member to members array', () => {
            const { union } = system.openUnion({});
            system.addMember(union.unionId, 'm1');
            expect(union.members.length).toBe(1);
            expect(union.members[0]).toBe('m1');
        });

        it('should add multiple members', () => {
            const { union } = system.openUnion({});
            system.addMember(union.unionId, 'm1');
            system.addMember(union.unionId, 'm2');
            system.addMember(union.unionId, 'm3');
            expect(union.members.length).toBe(3);
        });

        it('should reject missing union', () => {
            const result = system.addMember('ghost', 'm1');
            expect(result.error).toBe('UNION_NOT_FOUND');
        });

        it('should trigger memberAdded hook', () => {
            const { union } = system.openUnion({});
            let called = false;
            system.registerHook('memberAdded', () => { called = true; });
            system.addMember(union.unionId, 'm1');
            expect(called).toBe(true);
        });
    });

    describe('increaseStrength', () => {
        it('should increase strength by amount', () => {
            const { union } = system.openUnion({});
            system.increaseStrength(union.unionId, 30);
            expect(union.strength).toBe(50);
        });

        it('should use default amount of 5', () => {
            const { union } = system.openUnion({});
            system.increaseStrength(union.unionId);
            expect(union.strength).toBe(25);
        });

        it('should set status to stable when members exist', () => {
            const { union } = system.openUnion({ members: ['m1'] });
            system.increaseStrength(union.unionId, 5);
            expect(union.status).toBe('stable');
        });

        it('should not change status if no members', () => {
            const { union } = system.openUnion({});
            system.increaseStrength(union.unionId, 5);
            expect(union.status).toBe('forming');
        });

        it('should reject missing union', () => {
            const result = system.increaseStrength('ghost', 10);
            expect(result.error).toBe('UNION_NOT_FOUND');
        });

        it('should trigger strengthIncreased hook', () => {
            const { union } = system.openUnion({});
            let called = false;
            system.registerHook('strengthIncreased', () => { called = true; });
            system.increaseStrength(union.unionId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpUnion', () => {
        it('should increment level by 1', () => {
            const { union } = system.openUnion({});
            system.levelUpUnion(union.unionId);
            expect(union.level).toBe(2);
        });

        it('should increment multiple times', () => {
            const { union } = system.openUnion({});
            system.levelUpUnion(union.unionId);
            system.levelUpUnion(union.unionId);
            system.levelUpUnion(union.unionId);
            expect(union.level).toBe(4);
        });

        it('should reject missing union', () => {
            const result = system.levelUpUnion('ghost');
            expect(result.error).toBe('UNION_NOT_FOUND');
        });

        it('should trigger unionLeveledUp hook', () => {
            const { union } = system.openUnion({});
            let called = false;
            system.registerHook('unionLeveledUp', () => { called = true; });
            system.levelUpUnion(union.unionId);
            expect(called).toBe(true);
        });
    });

    describe('eternizeUnion', () => {
        it('should set status to eternal', () => {
            const { union } = system.openUnion({});
            system.eternizeUnion(union.unionId);
            expect(union.status).toBe('eternal');
        });

        it('should reject missing union', () => {
            const result = system.eternizeUnion('ghost');
            expect(result.error).toBe('UNION_NOT_FOUND');
        });

        it('should trigger unionEternalized hook', () => {
            const { union } = system.openUnion({});
            let called = false;
            system.registerHook('unionEternalized', () => { called = true; });
            system.eternizeUnion(union.unionId);
            expect(called).toBe(true);
        });
    });

    describe('calculateUnionPower', () => {
        it('should calculate power = level * 100 + strength * 2 + members.length * 30', () => {
            const { union } = system.openUnion({ strength: 20, members: ['m1', 'm2'] });
            system.levelUpUnion(union.unionId); // level=2
            // 2 * 100 + 20 * 2 + 2 * 30 = 200 + 40 + 60 = 300
            expect(system.calculateUnionPower(union.unionId)).toBe(300);
        });

        it('should calculate with no members', () => {
            const { union } = system.openUnion({ strength: 20 });
            // 1 * 100 + 20 * 2 + 0 * 30 = 100 + 40 + 0 = 140
            expect(system.calculateUnionPower(union.unionId)).toBe(140);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateUnionPower('ghost')).toBe(0);
        });

        it('should increase power when members added', () => {
            const { union } = system.openUnion({ strength: 20 });
            const before = system.calculateUnionPower(union.unionId);
            system.addMember(union.unionId, 'm1');
            const after = system.calculateUnionPower(union.unionId);
            expect(after - before).toBe(30);
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

        it('should execute default getUnion', () => {
            const result = system.executeTool('getUnion', { unionId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should handle missing context gracefully', () => {
            system.registerTool('echo', (ctx) => ctx);
            const result = system.executeTool('echo');
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('unionOpened', () => count++);
            unregister();
            system.openUnion({});
            expect(count).toBe(0);
        });

        it('should handle unregister when handler not in array', () => {
            const handler = () => {};
            const unregister = system.registerHook('unionOpened', handler);
            // Manually remove handler to force idx === -1 branch
            system.hooks.get('unionOpened').splice(0, 1);
            expect(() => unregister()).not.toThrow();
        });

        it('should handle unregister when event map entry missing', () => {
            const handler = () => {};
            const unregister = system.registerHook('unionOpened', handler);
            // Remove the event entry entirely
            system.hooks.delete('unionOpened');
            expect(() => unregister()).not.toThrow();
        });

        it('should handle errors silently', () => {
            system.registerHook('unionOpened', () => { throw new Error('x'); });
            expect(() => system.openUnion({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalUnions = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalUnions = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.openUnion({});
            const json = system.toJSON();
            expect(json.unions.length).toBe(1);
        });
        it('should deserialize', () => {
            system.openUnion({});
            const json = system.toJSON();
            const newSys = new CultivationUnion();
            newSys.fromJSON(json);
            expect(newSys.unions.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.unionCount).toBe(0);
        });
    });
});
