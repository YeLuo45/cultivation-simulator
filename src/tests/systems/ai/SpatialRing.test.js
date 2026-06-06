/**
 * SpatialRing.test.js - 储物戒系统测试
 * V449 Iteration 11/15 Round 16 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SpatialRing } from '../../../systems/ai/SpatialRing.js';

describe('SpatialRing', () => {
    let system;
    beforeEach(() => { system = new SpatialRing(); });

    describe('forgeRing', () => {
        it('should forge', () => {
            const { ring } = system.forgeRing({ ownerId: 'o1' });
            expect(ring.ownerId).toBe('o1');
        });

        it('should set defaults', () => {
            const { ring } = system.forgeRing({});
            expect(ring.tier).toBe(1);
            expect(ring.capacity).toBe(100);
            expect(ring.name).toBe('Spatial Ring');
            expect(ring.status).toBe('empty');
            expect(ring.items).toEqual([]);
        });

        it('should generate ringId', () => {
            const { ring } = system.forgeRing({});
            expect(ring.ringId).toBeTruthy();
            expect(typeof ring.ringId).toBe('string');
        });

        it('should accept custom name and tier', () => {
            const { ring } = system.forgeRing({ name: 'Celestial Ring', tier: 5, capacity: 500 });
            expect(ring.name).toBe('Celestial Ring');
            expect(ring.tier).toBe(5);
            expect(ring.capacity).toBe(500);
        });

        it('should accept custom id', () => {
            const { ring } = system.forgeRing({ id: 'custom-id' });
            expect(ring.ringId).toBe('custom-id');
        });

        it('should track totalRings in stats', () => {
            system.forgeRing({});
            system.forgeRing({});
            expect(system.stats.totalRings).toBe(2);
        });

        it('should trigger ringForged hook', () => {
            let called = false;
            system.registerHook('ringForged', () => { called = true; });
            system.forgeRing({});
            expect(called).toBe(true);
        });
    });

    describe('getRing', () => {
        it('should return ring', () => {
            const { ring } = system.forgeRing({});
            expect(system.getRing(ring.ringId)).not.toBeNull();
        });

        it('should return null for missing', () => {
            expect(system.getRing('ghost')).toBeNull();
        });

        it('should return a copy not the original reference', () => {
            const { ring } = system.forgeRing({});
            const fetched = system.getRing(ring.ringId);
            fetched.name = 'changed';
            expect(ring.name).toBe('Spatial Ring');
        });
    });

    describe('listRings', () => {
        it('should list all', () => {
            system.forgeRing({});
            expect(system.listRings().length).toBe(1);
        });

        it('should return empty array when no rings', () => {
            expect(system.listRings()).toEqual([]);
        });

        it('should list multiple', () => {
            system.forgeRing({});
            system.forgeRing({});
            system.forgeRing({});
            expect(system.listRings().length).toBe(3);
        });
    });

    describe('listByOwner', () => {
        it('should filter by owner', () => {
            system.forgeRing({ ownerId: 'o1' });
            system.forgeRing({ ownerId: 'o2' });
            expect(system.listByOwner('o1').length).toBe(1);
        });

        it('should return empty for unknown owner', () => {
            system.forgeRing({ ownerId: 'o1' });
            expect(system.listByOwner('unknown')).toEqual([]);
        });

        it('should list multiple for same owner', () => {
            system.forgeRing({ ownerId: 'o1' });
            system.forgeRing({ ownerId: 'o1' });
            system.forgeRing({ ownerId: 'o2' });
            expect(system.listByOwner('o1').length).toBe(2);
        });
    });

    describe('listByTier', () => {
        it('should filter by tier', () => {
            system.forgeRing({ tier: 1 });
            system.forgeRing({ tier: 5 });
            expect(system.listByTier(5).length).toBe(1);
        });

        it('should return empty for unknown tier', () => {
            system.forgeRing({ tier: 1 });
            expect(system.listByTier(99)).toEqual([]);
        });

        it('should return multiple for same tier', () => {
            system.forgeRing({ tier: 3 });
            system.forgeRing({ tier: 3 });
            expect(system.listByTier(3).length).toBe(2);
        });
    });

    describe('storeItem', () => {
        it('should store item', () => {
            const { ring } = system.forgeRing({});
            const result = system.storeItem(ring.ringId, { id: 'potion', qty: 1 });
            expect(result.success).toBe(true);
            expect(ring.items.length).toBe(1);
        });

        it('should update status to loaded when storing', () => {
            const { ring } = system.forgeRing({});
            system.storeItem(ring.ringId, { id: 'potion' });
            expect(ring.status).toBe('loaded');
        });

        it('should update status to full when at capacity', () => {
            const { ring } = system.forgeRing({ capacity: 1 });
            system.storeItem(ring.ringId, { id: 'potion' });
            expect(ring.status).toBe('full');
        });

        it('should reject when ring is full', () => {
            const { ring } = system.forgeRing({ capacity: 1 });
            system.storeItem(ring.ringId, { id: 'a' });
            const result = system.storeItem(ring.ringId, { id: 'b' });
            expect(result.error).toBe('RING_FULL');
        });

        it('should reject missing ring', () => {
            const result = system.storeItem('ghost', { id: 'potion' });
            expect(result.error).toBe('RING_NOT_FOUND');
        });

        it('should trigger itemStored hook', () => {
            const { ring } = system.forgeRing({});
            let called = false;
            system.registerHook('itemStored', () => { called = true; });
            system.storeItem(ring.ringId, { id: 'potion' });
            expect(called).toBe(true);
        });
    });

    describe('removeItem', () => {
        it('should remove item', () => {
            const { ring } = system.forgeRing({});
            const item = { id: 'potion' };
            system.storeItem(ring.ringId, item);
            const result = system.removeItem(ring.ringId, item);
            expect(result.success).toBe(true);
            expect(ring.items.length).toBe(0);
        });

        it('should update status to empty when last item removed', () => {
            const { ring } = system.forgeRing({});
            const item = { id: 'potion' };
            system.storeItem(ring.ringId, item);
            system.removeItem(ring.ringId, item);
            expect(ring.status).toBe('empty');
        });

        it('should update status to loaded when items remain', () => {
            const { ring } = system.forgeRing({});
            system.storeItem(ring.ringId, { id: 'a' });
            system.storeItem(ring.ringId, { id: 'b' });
            system.removeItem(ring.ringId, { id: 'a' });
            expect(ring.status).toBe('loaded');
        });

        it('should reject missing ring', () => {
            const result = system.removeItem('ghost', { id: 'potion' });
            expect(result.error).toBe('RING_NOT_FOUND');
        });

        it('should reject missing item', () => {
            const { ring } = system.forgeRing({});
            const result = system.removeItem(ring.ringId, { id: 'ghost' });
            expect(result.error).toBe('ITEM_NOT_FOUND');
        });

        it('should trigger itemRemoved hook', () => {
            const { ring } = system.forgeRing({});
            const item = { id: 'potion' };
            system.storeItem(ring.ringId, item);
            let called = false;
            system.registerHook('itemRemoved', () => { called = true; });
            system.removeItem(ring.ringId, item);
            expect(called).toBe(true);
        });
    });

    describe('upgradeRing', () => {
        it('should upgrade with default amount', () => {
            const { ring } = system.forgeRing({});
            const result = system.upgradeRing(ring.ringId);
            expect(result.success).toBe(true);
            expect(ring.capacity).toBe(110);
        });

        it('should upgrade with custom amount', () => {
            const { ring } = system.forgeRing({});
            system.upgradeRing(ring.ringId, 50);
            expect(ring.capacity).toBe(150);
        });

        it('should increment tier', () => {
            const { ring } = system.forgeRing({ tier: 1 });
            system.upgradeRing(ring.ringId);
            expect(ring.tier).toBe(2);
        });

        it('should reject missing ring', () => {
            const result = system.upgradeRing('ghost');
            expect(result.error).toBe('RING_NOT_FOUND');
        });

        it('should trigger ringUpgraded hook', () => {
            const { ring } = system.forgeRing({});
            let called = false;
            system.registerHook('ringUpgraded', () => { called = true; });
            system.upgradeRing(ring.ringId);
            expect(called).toBe(true);
        });
    });

    describe('calculateStorageCapacity', () => {
        it('should return capacity + items.length', () => {
            const { ring } = system.forgeRing({ capacity: 100 });
            system.storeItem(ring.ringId, { id: 'a' });
            system.storeItem(ring.ringId, { id: 'b' });
            expect(system.calculateStorageCapacity(ring.ringId)).toBe(102);
        });

        it('should return 0 for missing ring', () => {
            expect(system.calculateStorageCapacity('ghost')).toBe(0);
        });

        it('should return just capacity when empty', () => {
            const { ring } = system.forgeRing({ capacity: 50 });
            expect(system.calculateStorageCapacity(ring.ringId)).toBe(50);
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
            expect(result.success).toBe(true);
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

        it('should execute default getRing', () => {
            const result = system.executeTool('getRing', { ringId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('ringForged', () => count++);
            unregister();
            system.forgeRing({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('ringForged', () => { throw new Error('x'); });
            expect(() => system.forgeRing({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });

        it('should evolve when totalRings >= 5', () => {
            system.stats.totalRings = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });

        it('should not double evolve', () => {
            system.stats.totalRings = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.forgeRing({});
            const json = system.toJSON();
            expect(json.rings.length).toBe(1);
        });

        it('should deserialize', () => {
            system.forgeRing({});
            const json = system.toJSON();
            const newSys = new SpatialRing();
            newSys.fromJSON(json);
            expect(newSys.rings.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.ringCount).toBe(0);
        });
    });

    describe('Config', () => {
        it('should accept custom config', () => {
            const custom = new SpatialRing({ maxRings: 500, baseCapacity: 200 });
            expect(custom.config.maxRings).toBe(500);
            expect(custom.config.baseCapacity).toBe(200);
        });
    });
});
