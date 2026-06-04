/**
 * KarmaExchangeSystem.test.js - 缘分交换系统测试
 * V309 Iteration 6/9 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { KarmaExchangeSystem } from '../../../systems/ai/KarmaExchangeSystem.js';

describe('KarmaExchangeSystem', () => {
    let system;

    beforeEach(() => { system = new KarmaExchangeSystem(); });

    describe('addKarma', () => {
        it('should add karma', () => {
            const result = system.addKarma('c1', 100);
            expect(result.total).toBe(100);
        });

        it('should default to 0', () => {
            expect(system.getKarma('c1')).toBe(0);
        });

        it('should subtract negative', () => {
            system.addKarma('c1', 100);
            system.addKarma('c1', -50);
            expect(system.getKarma('c1')).toBe(50);
        });

        it('should floor at 0', () => {
            system.addKarma('c1', 100);
            system.addKarma('c1', -200);
            expect(system.getKarma('c1')).toBe(0);
        });

        it('should trigger karmaChanged hook', () => {
            let called = false;
            system.registerHook('karmaChanged', () => { called = true; });
            system.addKarma('c1', 10);
            expect(called).toBe(true);
        });
    });

    describe('getKarma', () => {
        it('should return karma', () => {
            system.addKarma('c1', 50);
            expect(system.getKarma('c1')).toBe(50);
        });
    });

    describe('transferKarma', () => {
        it('should transfer', () => {
            system.addKarma('c1', 100);
            const result = system.transferKarma('c1', 'c2', 50);
            expect(result.success).toBe(true);
        });

        it('should reject invalid amount', () => {
            const result = system.transferKarma('c1', 'c2', 0);
            expect(result.error).toBe('INVALID_AMOUNT');
        });

        it('should reject negative amount', () => {
            const result = system.transferKarma('c1', 'c2', -10);
            expect(result.error).toBe('INVALID_AMOUNT');
        });

        it('should reject exceeds max', () => {
            const result = system.transferKarma('c1', 'c2', 99999);
            expect(result.error).toBe('EXCEEDS_MAX');
        });

        it('should reject insufficient karma', () => {
            const result = system.transferKarma('c1', 'c2', 50);
            expect(result.error).toBe('INSUFFICIENT_KARMA');
        });

        it('should deduct from sender', () => {
            system.addKarma('c1', 100);
            system.transferKarma('c1', 'c2', 50);
            expect(system.getKarma('c1')).toBe(50);
        });

        it('should credit receiver minus fee', () => {
            system.addKarma('c1', 100);
            system.transferKarma('c1', 'c2', 100);
            // 5% fee, so receiver gets 95
            expect(system.getKarma('c2')).toBe(95);
        });

        it('should increment totalExchanged', () => {
            system.addKarma('c1', 100);
            system.transferKarma('c1', 'c2', 50);
            expect(system.stats.totalExchanged).toBe(1);
        });

        it('should trigger karmaTransferred hook', () => {
            system.addKarma('c1', 100);
            let called = false;
            system.registerHook('karmaTransferred', () => { called = true; });
            system.transferKarma('c1', 'c2', 50);
            expect(called).toBe(true);
        });
    });

    describe('createListing', () => {
        it('should create listing', () => {
            system.addKarma('c1', 100);
            const result = system.createListing('c1', 50, 100);
            expect(result.success).toBe(true);
        });

        it('should reject insufficient karma', () => {
            const result = system.createListing('c1', 50, 100);
            expect(result.error).toBe('INSUFFICIENT_KARMA');
        });
    });

    describe('buyListing', () => {
        it('should buy', () => {
            system.addKarma('c1', 100);
            const { listing } = system.createListing('c1', 50, 100);
            const result = system.buyListing(listing.id, 'c2');
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.buyListing('ghost', 'c2');
            expect(result.error).toBe('LISTING_NOT_FOUND');
        });

        it('should reject inactive', () => {
            system.addKarma('c1', 100);
            const { listing } = system.createListing('c1', 50, 100);
            listing.status = 'sold';
            const result = system.buyListing(listing.id, 'c2');
            expect(result.error).toBe('INACTIVE');
        });

        it('should add karma to buyer', () => {
            system.addKarma('c1', 100);
            const { listing } = system.createListing('c1', 50, 100);
            system.buyListing(listing.id, 'c2');
            expect(system.getKarma('c2')).toBe(50);
        });

        it('should trigger listingSold hook', () => {
            system.addKarma('c1', 100);
            const { listing } = system.createListing('c1', 50, 100);
            let called = false;
            system.registerHook('listingSold', () => { called = true; });
            system.buyListing(listing.id, 'c2');
            expect(called).toBe(true);
        });
    });

    describe('cancelListing', () => {
        it('should cancel', () => {
            system.addKarma('c1', 100);
            const { listing } = system.createListing('c1', 50, 100);
            const result = system.cancelListing(listing.id);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.cancelListing('ghost');
            expect(result.error).toBe('LISTING_NOT_FOUND');
        });

        it('should reject inactive', () => {
            system.addKarma('c1', 100);
            const { listing } = system.createListing('c1', 50, 100);
            listing.status = 'sold';
            const result = system.cancelListing(listing.id);
            expect(result.error).toBe('INACTIVE');
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

        it('should execute default getKarma', () => {
            const result = system.executeTool('getKarma', { cultivatorId: 'c1' });
            expect(result.result).toBe(0);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('karmaChanged', () => count++);
            unregister();
            system.addKarma('c1', 10);
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('karmaChanged', () => { throw new Error('x'); });
            expect(() => system.addKarma('c1', 10)).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve', () => {
            system.stats.totalExchanged = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalExchanged = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.addKarma('c1', 100);
            const json = system.toJSON();
            expect(json.karmaPool.length).toBe(1);
        });

        it('should deserialize', () => {
            system.addKarma('c1', 100);
            const json = system.toJSON();
            const newSys = new KarmaExchangeSystem();
            newSys.fromJSON(json);
            expect(newSys.getKarma('c1')).toBe(100);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.karmaHolderCount).toBe(0);
        });
    });
});