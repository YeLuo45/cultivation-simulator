/**
 * BattlefieldCommand.test.js - 战场指挥系统测试
 * V319 Iteration 7/9 Round 4 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BattlefieldCommand } from '../../../systems/ai/BattlefieldCommand.js';

describe('BattlefieldCommand', () => {
    let system;
    beforeEach(() => { system = new BattlefieldCommand(); });

    describe('registerCommander', () => {
        it('should register', () => {
            const { commander } = system.registerCommander({ name: 'C1' });
            expect(commander.name).toBe('C1');
        });

        it('should default leadership to 50', () => {
            const { commander } = system.registerCommander({});
            expect(commander.leadership).toBe(50);
        });

        it('should default rank to sergeant', () => {
            const { commander } = system.registerCommander({});
            expect(commander.rank).toBe('sergeant');
        });
    });

    describe('getCommander', () => {
        it('should return', () => {
            const { commander } = system.registerCommander({});
            expect(system.getCommander(commander.commanderId)).not.toBeNull();
        });

        it('should return null for missing', () => { expect(system.getCommander('ghost')).toBeNull(); });
    });

    describe('listCommanders', () => {
        it('should list all', () => {
            system.registerCommander({});
            expect(system.listCommanders().length).toBe(1);
        });
    });

    describe('issueOrder', () => {
        it('should issue', () => {
            const { commander } = system.registerCommander({});
            const result = system.issueOrder(commander.commanderId, 'attack', 't1');
            expect(result.success).toBe(true);
        });

        it('should reject missing commander', () => {
            const result = system.issueOrder('ghost', 'attack', 't1');
            expect(result.error).toBe('COMMANDER_NOT_FOUND');
        });

        it('should compute power from leadership', () => {
            const { commander } = system.registerCommander({ leadership: 100 });
            const { order } = system.issueOrder(commander.commanderId, 'attack', 't1');
            expect(order.power).toBeGreaterThan(10);
        });

        it('should increment experience', () => {
            const { commander } = system.registerCommander({});
            system.issueOrder(commander.commanderId, 'attack', 't1');
            expect(commander.experience).toBe(1);
        });

        it('should increment totalCommands', () => {
            const { commander } = system.registerCommander({});
            system.issueOrder(commander.commanderId, 'attack', 't1');
            expect(system.stats.totalCommands).toBe(1);
        });

        it('should trigger orderIssued hook', () => {
            const { commander } = system.registerCommander({});
            let called = false;
            system.registerHook('orderIssued', () => { called = true; });
            system.issueOrder(commander.commanderId, 'attack', 't1');
            expect(called).toBe(true);
        });
    });

    describe('getOrder', () => {
        it('should return', () => {
            const { commander } = system.registerCommander({});
            const { order } = system.issueOrder(commander.commanderId, 'attack', 't1');
            expect(system.getOrder(order.orderId)).not.toBeNull();
        });

        it('should return null for missing', () => { expect(system.getOrder('ghost')).toBeNull(); });
    });

    describe('listOrders', () => {
        it('should list all', () => {
            const { commander } = system.registerCommander({});
            system.issueOrder(commander.commanderId, 'attack', 't1');
            expect(system.listOrders().length).toBe(1);
        });
    });

    describe('completeOrder', () => {
        it('should complete', () => {
            const { commander } = system.registerCommander({});
            const { order } = system.issueOrder(commander.commanderId, 'attack', 't1');
            const result = system.completeOrder(order.orderId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.completeOrder('ghost');
            expect(result.error).toBe('ORDER_NOT_FOUND');
        });

        it('should reject already completed', () => {
            const { commander } = system.registerCommander({});
            const { order } = system.issueOrder(commander.commanderId, 'attack', 't1');
            system.completeOrder(order.orderId);
            const result = system.completeOrder(order.orderId);
            expect(result.error).toBe('ALREADY_COMPLETED');
        });

        it('should trigger orderCompleted hook', () => {
            const { commander } = system.registerCommander({});
            const { order } = system.issueOrder(commander.commanderId, 'attack', 't1');
            let called = false;
            system.registerHook('orderCompleted', () => { called = true; });
            system.completeOrder(order.orderId);
            expect(called).toBe(true);
        });
    });

    describe('failOrder', () => {
        it('should fail', () => {
            const { commander } = system.registerCommander({});
            const { order } = system.issueOrder(commander.commanderId, 'attack', 't1');
            const result = system.failOrder(order.orderId, 'disobey');
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.failOrder('ghost');
            expect(result.error).toBe('ORDER_NOT_FOUND');
        });
    });

    describe('calculateCommandPower', () => {
        it('should calculate', () => {
            const { commander } = system.registerCommander({});
            const result = system.calculateCommandPower(commander.commanderId);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.calculateCommandPower('ghost');
            expect(result.error).toBe('COMMANDER_NOT_FOUND');
        });

        it('should increase with experience', () => {
            const { commander } = system.registerCommander({});
            const r1 = system.calculateCommandPower(commander.commanderId);
            commander.experience = 100;
            const r2 = system.calculateCommandPower(commander.commanderId);
            expect(r2.power).toBeGreaterThan(r1.power);
        });
    });

    describe('promoteCommander', () => {
        it('should promote', () => {
            const { commander } = system.registerCommander({});
            const result = system.promoteCommander(commander.commanderId);
            expect(result.success).toBe(true);
            expect(result.rank).toBe('captain');
        });

        it('should reject missing', () => {
            const result = system.promoteCommander('ghost');
            expect(result.error).toBe('COMMANDER_NOT_FOUND');
        });

        it('should reject max rank', () => {
            const { commander } = system.registerCommander({ rank: 'general' });
            const result = system.promoteCommander(commander.commanderId);
            expect(result.error).toBe('MAX_RANK');
        });

        it('should trigger commanderPromoted hook', () => {
            const { commander } = system.registerCommander({});
            let called = false;
            system.registerHook('commanderPromoted', () => { called = true; });
            system.promoteCommander(commander.commanderId);
            expect(called).toBe(true);
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

        it('should execute default getCommander', () => {
            const result = system.executeTool('getCommander', { commanderId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('orderIssued', () => count++);
            unregister();
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('orderIssued', () => { throw new Error('x'); });
            const { commander } = system.registerCommander({});
            expect(() => system.issueOrder(commander.commanderId, 'attack', 't1')).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalCommands = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalCommands = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerCommander({});
            const json = system.toJSON();
            expect(json.commanders.length).toBe(1);
        });
        it('should deserialize', () => {
            system.registerCommander({});
            const json = system.toJSON();
            const newSys = new BattlefieldCommand();
            newSys.fromJSON(json);
            expect(newSys.commanders.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.commanderCount).toBe(0);
        });
    });
});