/**
 * AuctionHouse.test.js - 拍卖行测试
 * V377 Iteration 2/9 Round 11 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AuctionHouse } from '../../../systems/ai/AuctionHouse.js';

describe('AuctionHouse', () => {
    let system;
    beforeEach(() => { system = new AuctionHouse(); });

    describe('createAuction', () => {
        it('should create', () => {
            const { auction } = system.createAuction({ itemId: 'sword', sellerId: 's1' });
            expect(auction.itemId).toBe('sword');
        });

        it('should trigger auctionCreated hook', () => {
            let called = false;
            system.registerHook('auctionCreated', () => { called = true; });
            system.createAuction({});
            expect(called).toBe(true);
        });
    });

    describe('getAuction', () => {
        it('should return', () => {
            const { auction } = system.createAuction({});
            expect(system.getAuction(auction.auctionId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getAuction('ghost')).toBeNull(); });
    });

    describe('listAuctions', () => {
        it('should list all', () => {
            system.createAuction({});
            expect(system.listAuctions().length).toBe(1);
        });
    });

    describe('listActive', () => {
        it('should filter', () => {
            const { auction } = system.createAuction({});
            auction.status = 'ended';
            system.createAuction({});
            expect(system.listActive().length).toBe(1);
        });
    });

    describe('listBySeller', () => {
        it('should filter', () => {
            system.createAuction({ sellerId: 's1' });
            system.createAuction({ sellerId: 's2' });
            expect(system.listBySeller('s1').length).toBe(1);
        });
    });

    describe('listByItem', () => {
        it('should filter', () => {
            system.createAuction({ itemId: 'sword' });
            system.createAuction({ itemId: 'potion' });
            expect(system.listByItem('sword').length).toBe(1);
        });
    });

    describe('placeBid', () => {
        it('should place', () => {
            const { auction } = system.createAuction({ startingPrice: 100 });
            const result = system.placeBid(auction.auctionId, 'b1', 200);
            expect(result.success).toBe(true);
        });

        it('should reject missing', () => {
            const result = system.placeBid('ghost', 'b1', 200);
            expect(result.error).toBe('AUCTION_NOT_FOUND');
        });

        it('should reject inactive', () => {
            const { auction } = system.createAuction({});
            auction.status = 'ended';
            const result = system.placeBid(auction.auctionId, 'b1', 200);
            expect(result.error).toBe('AUCTION_INACTIVE');
        });

        it('should reject too low', () => {
            const { auction } = system.createAuction({ startingPrice: 100 });
            const result = system.placeBid(auction.auctionId, 'b1', 105);
            expect(result.error).toBe('BID_TOO_LOW');
        });

        it('should trigger bidPlaced hook', () => {
            const { auction } = system.createAuction({});
            let called = false;
            system.registerHook('bidPlaced', () => { called = true; });
            system.placeBid(auction.auctionId, 'b1', 200);
            expect(called).toBe(true);
        });
    });

    describe('getBid', () => {
        it('should return', () => {
            const { auction } = system.createAuction({});
            const { bid } = system.placeBid(auction.auctionId, 'b1', 200);
            expect(system.getBid(bid.bidId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getBid('ghost')).toBeNull(); });
    });

    describe('listBids', () => {
        it('should list all', () => {
            const { auction } = system.createAuction({});
            system.placeBid(auction.auctionId, 'b1', 200);
            expect(system.listBids().length).toBe(1);
        });
    });

    describe('listBidsByAuction', () => {
        it('should filter', () => {
            const { auction: a1 } = system.createAuction({});
            const { auction: a2 } = system.createAuction({});
            system.placeBid(a1.auctionId, 'b1', 200);
            system.placeBid(a2.auctionId, 'b1', 200);
            expect(system.listBidsByAuction(a1.auctionId).length).toBe(1);
        });
    });

    describe('listBidsByBidder', () => {
        it('should filter', () => {
            const { auction } = system.createAuction({});
            system.placeBid(auction.auctionId, 'b1', 200);
            system.placeBid(auction.auctionId, 'b2', 300);
            expect(system.listBidsByBidder('b1').length).toBe(1);
        });
    });

    describe('endAuction', () => {
        it('should end', () => {
            const { auction } = system.createAuction({});
            const result = system.endAuction(auction.auctionId);
            expect(auction.status).toBe('ended');
        });

        it('should reject missing', () => {
            const result = system.endAuction('ghost');
            expect(result.error).toBe('AUCTION_NOT_FOUND');
        });

        it('should trigger auctionEnded hook', () => {
            const { auction } = system.createAuction({});
            let called = false;
            system.registerHook('auctionEnded', () => { called = true; });
            system.endAuction(auction.auctionId);
            expect(called).toBe(true);
        });
    });

    describe('cancelAuction', () => {
        it('should cancel', () => {
            const { auction } = system.createAuction({});
            const result = system.cancelAuction(auction.auctionId);
            expect(auction.status).toBe('cancelled');
        });

        it('should reject missing', () => {
            const result = system.cancelAuction('ghost');
            expect(result.error).toBe('AUCTION_NOT_FOUND');
        });

        it('should trigger auctionCancelled hook', () => {
            const { auction } = system.createAuction({});
            let called = false;
            system.registerHook('auctionCancelled', () => { called = true; });
            system.cancelAuction(auction.auctionId);
            expect(called).toBe(true);
        });
    });

    describe('calculateTotalVolume', () => {
        it('should calculate', () => {
            const { auction } = system.createAuction({});
            system.placeBid(auction.auctionId, 'b1', 200);
            system.placeBid(auction.auctionId, 'b2', 300);
            expect(system.calculateTotalVolume()).toBe(500);
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

        it('should execute default getAuction', () => {
            const result = system.executeTool('getAuction', { auctionId: 'ghost' });
            expect(result.result).toBeNull();
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('auctionCreated', () => count++);
            unregister();
            system.createAuction({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('auctionCreated', () => { throw new Error('x'); });
            expect(() => system.createAuction({})).not.toThrow();
        });
    });

    describe('autoEvolve', () => {
        it('should not evolve with insufficient', () => {
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
        it('should evolve', () => {
            system.stats.totalAuctions = 10;
            const result = system.autoEvolve();
            expect(result.evolved).toBe(true);
        });
        it('should not double evolve', () => {
            system.stats.totalAuctions = 10;
            system.autoEvolve();
            const result = system.autoEvolve();
            expect(result.evolved).toBe(false);
        });
    });

    describe('Persistence', () => {
        it('should serialize', () => {
            system.createAuction({});
            const json = system.toJSON();
            expect(json.auctions.length).toBe(1);
        });
        it('should deserialize', () => {
            system.createAuction({});
            const json = system.toJSON();
            const newSys = new AuctionHouse();
            newSys.fromJSON(json);
            expect(newSys.auctions.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.auctionCount).toBe(0);
        });
    });
});