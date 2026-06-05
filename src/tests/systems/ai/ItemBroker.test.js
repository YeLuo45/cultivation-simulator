/**
 * ItemBroker.test.js - 物品经纪人测试
 * V383 Iteration 8/9 Round 11 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ItemBroker } from '../../../systems/ai/ItemBroker.js';

describe('ItemBroker', () => {
    let system;
    beforeEach(() => { system = new ItemBroker(); });

    describe('registerBroker', () => {
        it('should register', () => {
            const { broker } = system.registerBroker({ name: 'B1' });
            expect(broker.name).toBe('B1');
        });

        it('should trigger brokerRegistered hook', () => {
            let called = false;
            system.registerHook('brokerRegistered', () => { called = true; });
            system.registerBroker({});
            expect(called).toBe(true);
        });
    });

    describe('getBroker', () => {
        it('should return', () => {
            const { broker } = system.registerBroker({});
            expect(system.getBroker(broker.brokerId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBroker('ghost')).toBeNull(); });
    });

    describe('listBrokers', () => {
        it('should list all', () => {
            system.registerBroker({});
            expect(system.listBrokers().length).toBe(1);
        });
    });

    describe('listBySpecialty', () => {
        it('should filter', () => {
            system.registerBroker({ specialty: 'weapons' });
            system.registerBroker({ specialty: 'potions' });
            expect(system.listBySpecialty('weapons').length).toBe(1);
        });
    });

    describe('listByRating', () => {
        it('should filter', () => {
            const { broker: b1 } = system.registerBroker({});
            const { broker: b2 } = system.registerBroker({});
            b1.rating = 5;
            b2.rating = 3;
            expect(system.listByRating(4).length).toBe(1);
        });
    });

    describe('findMatch', () => {
        it('should find best', () => {
            const { broker: b1 } = system.registerBroker({ specialty: 'weapons' });
            const { broker: b2 } = system.registerBroker({ specialty: 'weapons' });
            b1.rating = 3;
            b2.rating = 5;
            const match = system.findMatch('weapons');
            expect(match.brokerId).toBe(b2.brokerId);
        });

        it('should return null for none', () => {
            expect(system.findMatch('weapons')).toBeNull();
        });
    });

    describe('arrangeDeal', () => {
        it('should arrange', () => {
            const { broker } = system.registerBroker({});
            const result = system.arrangeDeal(broker.brokerId, 'b1', 's1', 'sword', 100);
            expect(result.success).toBe(true);
        });

        it('should reject missing broker', () => {
            const result = system.arrangeDeal('ghost', 'b1', 's1', 'sword', 100);
            expect(result.error).toBe('BROKER_NOT_FOUND');
        });

        it('should calculate commission', () => {
            const { broker } = system.registerBroker({ commission: 0.1 });
            const { deal } = system.arrangeDeal(broker.brokerId, 'b1', 's1', 'sword', 100);
            expect(deal.commission).toBe(10);
        });

        it('should trigger dealArranged hook', () => {
            const { broker } = system.registerBroker({});
            let called = false;
            system.registerHook('dealArranged', () => { called = true; });
            system.arrangeDeal(broker.brokerId, 'b1', 's1', 'sword', 100);
            expect(called).toBe(true);
        });
    });

    describe('getDeal', () => {
        it('should return', () => {
            const { broker } = system.registerBroker({});
            const { deal } = system.arrangeDeal(broker.brokerId, 'b1', 's1', 'sword', 100);
            expect(system.getDeal(deal.dealId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getDeal('ghost')).toBeNull(); });
    });

    describe('listDeals', () => {
        it('should list all', () => {
            const { broker } = system.registerBroker({});
            system.arrangeDeal(broker.brokerId, 'b1', 's1', 'sword', 100);
            expect(system.listDeals().length).toBe(1);
        });
    });

    describe('listByBroker', () => {
        it('should filter', () => {
            const { broker: b1 } = system.registerBroker({});
            const { broker: b2 } = system.registerBroker({});
            system.arrangeDeal(b1.brokerId, 'b1', 's1', 'sword', 100);
            system.arrangeDeal(b2.brokerId, 'b1', 's1', 'sword', 100);
            expect(system.listByBroker(b1.brokerId).length).toBe(1);
        });
    });

    describe('calculateTotalCommission', () => {
        it('should calculate', () => {
            const { broker } = system.registerBroker({ commission: 0.1 });
            system.arrangeDeal(broker.brokerId, 'b1', 's1', 'sword', 100);
            system.arrangeDeal(broker.brokerId, 'b1', 's1', 'potion', 200);
            expect(system.calculateTotalCommission(broker.brokerId)).toBe(30);
        });
    });

    describe('adjustRating', () => {
        it('should adjust up', () => {
            const { broker } = system.registerBroker({ rating: 3 });
            system.adjustRating(broker.brokerId, 1);
            expect(broker.rating).toBe(4);
        });

        it('should cap at 5', () => {
            const { broker } = system.registerBroker({ rating: 5 });
            system.adjustRating(broker.brokerId, 1);
            expect(broker.rating).toBe(5);
        });

        it('should reject missing', () => {
            const result = system.adjustRating('ghost', 1);
            expect(result.error).toBe('BROKER_NOT_FOUND');
        });

        it('should trigger ratingAdjusted hook', () => {
            const { broker } = system.registerBroker({});
            let called = false;
            system.registerHook('ratingAdjusted', () => { called = true; });
            system.adjustRating(broker.brokerId, 0.5);
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

        it('should execute default getBroker', () => {
            const result = system.executeTool('getBroker', { brokerId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('brokerRegistered', () => count++);
            unregister();
            system.registerBroker({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('brokerRegistered', () => { throw new Error('x'); });
            expect(() => system.registerBroker({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalDeals = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalDeals = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.registerBroker({});
            const json = system.toJSON();
            expect(json.brokers.length).toBe(1);
        });
        it('should deserialize', () => {
            system.registerBroker({});
            const json = system.toJSON();
            const newSys = new ItemBroker();
            newSys.fromJSON(json);
            expect(newSys.brokers.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.brokerCount).toBe(0);
        });
    });
});