/**
 * SectVisitor.test.js - 宗门访客测试
 * V497 Iteration 14/15 Round 19 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectVisitor } from '../../../systems/ai/SectVisitor.js';

describe('SectVisitor', () => {
    let system;
    beforeEach(() => { system = new SectVisitor(); });

    describe('welcomeVisitor', () => {
        it('should welcome', () => {
            const { visitor } = system.welcomeVisitor({ sectId: 's1', name: 'Elder Zhao', origin: 'Azure Peak', intent: 'alliance' });
            expect(visitor.sectId).toBe('s1');
            expect(visitor.name).toBe('Elder Zhao');
            expect(visitor.origin).toBe('Azure Peak');
            expect(visitor.intent).toBe('alliance');
        });

        it('should default intent', () => {
            const { visitor } = system.welcomeVisitor({ sectId: 's1' });
            expect(visitor.intent).toBe('unknown');
        });

        it('should set status to welcomed', () => {
            const { visitor } = system.welcomeVisitor({});
            expect(visitor.status).toBe('welcomed');
        });

        it('should track stats', () => {
            system.welcomeVisitor({});
            expect(system.stats.totalVisitors).toBe(1);
        });

        it('should trigger visitorWelcomed hook', () => {
            let called = false;
            system.registerHook('visitorWelcomed', () => { called = true; });
            system.welcomeVisitor({});
            expect(called).toBe(true);
        });
    });

    describe('getVisitor', () => {
        it('should return', () => {
            const { visitor } = system.welcomeVisitor({});
            expect(system.getVisitor(visitor.visitorId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getVisitor('ghost')).toBeNull(); });
    });

    describe('listVisitors', () => {
        it('should list all', () => {
            system.welcomeVisitor({});
            system.welcomeVisitor({});
            expect(system.listVisitors().length).toBe(2);
        });
        it('should return empty when none', () => {
            expect(system.listVisitors().length).toBe(0);
        });
    });

    describe('listBySect', () => {
        it('should filter by sect', () => {
            system.welcomeVisitor({ sectId: 's1' });
            system.welcomeVisitor({ sectId: 's2' });
            system.welcomeVisitor({ sectId: 's1' });
            expect(system.listBySect('s1').length).toBe(2);
        });
        it('should return empty for unknown sect', () => {
            system.welcomeVisitor({ sectId: 's1' });
            expect(system.listBySect('ghost').length).toBe(0);
        });
    });

    describe('listWelcomed', () => {
        it('should filter welcomed', () => {
            const { visitor: v1 } = system.welcomeVisitor({});
            const { visitor: v2 } = system.welcomeVisitor({});
            system.rejectVisitor(v2.visitorId);
            expect(system.listWelcomed().length).toBe(1);
        });
    });

    describe('addGift', () => {
        it('should add gift', () => {
            const { visitor } = system.welcomeVisitor({});
            system.addGift(visitor.visitorId, { item: 'jade' });
            expect(visitor.gifts.length).toBe(1);
        });

        it('should add multiple gifts', () => {
            const { visitor } = system.welcomeVisitor({});
            system.addGift(visitor.visitorId, { item: 'jade' });
            system.addGift(visitor.visitorId, { item: 'scroll' });
            expect(visitor.gifts.length).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.addGift('ghost', { item: 'jade' });
            expect(result.error).toBe('VISITOR_NOT_FOUND');
        });

        it('should trigger giftAdded hook', () => {
            const { visitor } = system.welcomeVisitor({});
            let called = false;
            system.registerHook('giftAdded', () => { called = true; });
            system.addGift(visitor.visitorId, { item: 'jade' });
            expect(called).toBe(true);
        });
    });

    describe('rejectVisitor', () => {
        it('should reject', () => {
            const { visitor } = system.welcomeVisitor({});
            system.rejectVisitor(visitor.visitorId);
            expect(visitor.status).toBe('rejected');
        });

        it('should reject missing', () => {
            const result = system.rejectVisitor('ghost');
            expect(result.error).toBe('VISITOR_NOT_FOUND');
        });

        it('should trigger visitorRejected hook', () => {
            const { visitor } = system.welcomeVisitor({});
            let called = false;
            system.registerHook('visitorRejected', () => { called = true; });
            system.rejectVisitor(visitor.visitorId);
            expect(called).toBe(true);
        });
    });

    describe('expelVisitor', () => {
        it('should expel', () => {
            const { visitor } = system.welcomeVisitor({});
            system.expelVisitor(visitor.visitorId);
            expect(visitor.status).toBe('expelled');
        });

        it('should expel missing', () => {
            const result = system.expelVisitor('ghost');
            expect(result.error).toBe('VISITOR_NOT_FOUND');
        });

        it('should trigger visitorExpelled hook', () => {
            const { visitor } = system.welcomeVisitor({});
            let called = false;
            system.registerHook('visitorExpelled', () => { called = true; });
            system.expelVisitor(visitor.visitorId);
            expect(called).toBe(true);
        });
    });

    describe('calculateVisitorValue', () => {
        it('should calculate with no gifts', () => {
            const { visitor } = system.welcomeVisitor({ intent: 'hello' });
            expect(system.calculateVisitorValue(visitor.visitorId)).toBe(5);
        });

        it('should include gifts', () => {
            const { visitor } = system.welcomeVisitor({ intent: 'hi' });
            system.addGift(visitor.visitorId, { item: 'a' });
            system.addGift(visitor.visitorId, { item: 'b' });
            expect(system.calculateVisitorValue(visitor.visitorId)).toBe(22);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateVisitorValue('ghost')).toBe(0);
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

        it('should execute default getVisitor', () => {
            const result = system.executeTool('getVisitor', { visitorId: 'ghost' });
            expect(result.result).toBeNull();
        });

        it('should execute default welcomeVisitor', () => {
            const result = system.executeTool('welcomeVisitor', { sectId: 's1' });
            expect(result.success).toBe(true);
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('visitorWelcomed', () => count++);
            unregister();
            system.welcomeVisitor({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('visitorWelcomed', () => { throw new Error('x'); });
            expect(() => system.welcomeVisitor({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalVisitors = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalVisitors = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.welcomeVisitor({});
            const json = system.toJSON();
            expect(json.visitors.length).toBe(1);
        });
        it('should deserialize', () => {
            system.welcomeVisitor({});
            const json = system.toJSON();
            const newSys = new SectVisitor();
            newSys.fromJSON(json);
            expect(newSys.visitors.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.visitorCount).toBe(0);
        });
    });
});
