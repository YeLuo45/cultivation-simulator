/**
 * CultivationAuction.test.js - 修真拍卖测试
 * V541 Iteration 4/20 Round 22 - 测试覆盖率目标: 99%+
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CultivationAuction } from '../../../systems/ai/CultivationAuction.js';

describe('CultivationAuction', () => {
    let system;
    beforeEach(() => { system = new CultivationAuction(); });

    describe('startAuction', () => {
        it('should create', () => {
            const { auction } = system.startAuction({ hostId: 'h1', name: 'Celestial Bidding', type: 'treasure' });
            expect(auction.hostId).toBe('h1');
            expect(auction.name).toBe('Celestial Bidding');
            expect(auction.type).toBe('treasure');
            expect(auction.status).toBe('pending');
            expect(auction.bids).toBe(10);
            expect(auction.level).toBe(1);
        });

        it('should accept all valid types', () => {
            const types = ['treasure', 'estate', 'servant'];
            for (const t of types) {
                const { auction } = system.startAuction({ type: t });
                expect(auction.type).toBe(t);
            }
        });

        it('should trigger auctionStarted hook', () => {
            let called = false;
            system.registerHook('auctionStarted', () => { called = true; });
            system.startAuction({});
            expect(called).toBe(true);
        });
    });

    describe('getAuction', () => {
        it('should return', () => {
            const { auction } = system.startAuction({});
            expect(system.getAuction(auction.auctionId)).not.toBeNull();
        });
        it('should return null for missing', () => { expect(system.getAuction('ghost')).toBeNull(); });
    });

    describe('listAuctions', () => {
        it('should list all', () => {
            system.startAuction({});
            system.startAuction({});
            expect(system.listAuctions().length).toBe(2);
        });
    });

    describe('listByHost', () => {
        it('should filter', () => {
            system.startAuction({ hostId: 'h1' });
            system.startAuction({ hostId: 'h2' });
            expect(system.listByHost('h1').length).toBe(1);
        });
    });

    describe('listActive', () => {
        it('should filter active auctions', () => {
            const { auction: a1 } = system.startAuction({ hostId: 'h1' });
            const { auction: a2 } = system.startAuction({ hostId: 'h2' });
            // startAuction returns the internal map reference, so mutation reflects
            a1.status = 'active';
            a2.status = 'closed';
            const active = system.listActive();
            expect(active.length).toBe(1);
            expect(active[0].auctionId).toBe(a1.auctionId);
        });

        it('should return empty when none active', () => {
            system.startAuction({});
            system.startAuction({});
            expect(system.listActive().length).toBe(0);
        });
    });

    describe('addLot', () => {
        it('should add lot', () => {
            const { auction } = system.startAuction({});
            system.addLot(auction.auctionId, { id: 'l1', name: 'Spirit Sword' });
            expect(auction.lots.length).toBe(1);
        });

        it('should reject missing', () => {
            const result = system.addLot('ghost', { id: 'l1' });
            expect(result.error).toBe('AUCTION_NOT_FOUND');
        });

        it('should trigger lotAdded hook', () => {
            const { auction } = system.startAuction({});
            let called = false;
            system.registerHook('lotAdded', () => { called = true; });
            system.addLot(auction.auctionId, { id: 'l1' });
            expect(called).toBe(true);
        });
    });

    describe('increaseBids', () => {
        it('should increase with default amount', () => {
            const { auction } = system.startAuction({});
            system.increaseBids(auction.auctionId);
            expect(auction.bids).toBe(15);
        });

        it('should increase with custom amount', () => {
            const { auction } = system.startAuction({});
            system.increaseBids(auction.auctionId, 20);
            expect(auction.bids).toBe(30);
        });

        it('should reject missing', () => {
            const result = system.increaseBids('ghost', 10);
            expect(result.error).toBe('AUCTION_NOT_FOUND');
        });

        it('should trigger bidsIncreased hook', () => {
            const { auction } = system.startAuction({});
            let called = false;
            system.registerHook('bidsIncreased', () => { called = true; });
            system.increaseBids(auction.auctionId, 10);
            expect(called).toBe(true);
        });
    });

    describe('levelUpAuction', () => {
        it('should level up', () => {
            const { auction } = system.startAuction({});
            system.levelUpAuction(auction.auctionId);
            expect(auction.level).toBe(2);
        });

        it('should reject missing', () => {
            const result = system.levelUpAuction('ghost');
            expect(result.error).toBe('AUCTION_NOT_FOUND');
        });

        it('should trigger auctionLeveledUp hook', () => {
            const { auction } = system.startAuction({});
            let called = false;
            system.registerHook('auctionLeveledUp', () => { called = true; });
            system.levelUpAuction(auction.auctionId);
            expect(called).toBe(true);
        });
    });

    describe('closeAuction', () => {
        it('should close', () => {
            const { auction } = system.startAuction({});
            system.closeAuction(auction.auctionId);
            expect(auction.status).toBe('closed');
        });

        it('should reject missing', () => {
            const result = system.closeAuction('ghost');
            expect(result.error).toBe('AUCTION_NOT_FOUND');
        });

        it('should trigger auctionClosed hook', () => {
            const { auction } = system.startAuction({});
            let called = false;
            system.registerHook('auctionClosed', () => { called = true; });
            system.closeAuction(auction.auctionId);
            expect(called).toBe(true);
        });
    });

    describe('calculateAuctionValue', () => {
        it('should calculate default', () => {
            const { auction } = system.startAuction({});
            // level=1, bids=10, lots=[] => 1*100 + 10*2 + 0*30 = 120
            expect(system.calculateAuctionValue(auction.auctionId)).toBe(120);
        });

        it('should calculate with lots and level up', () => {
            const { auction } = system.startAuction({});
            system.addLot(auction.auctionId, { id: 'l1' });
            system.addLot(auction.auctionId, { id: 'l2' });
            system.levelUpAuction(auction.auctionId);
            // level=2, bids=10, lots=2 => 2*100 + 10*2 + 2*30 = 200 + 20 + 60 = 280
            expect(system.calculateAuctionValue(auction.auctionId)).toBe(280);
        });

        it('should return 0 for missing', () => {
            expect(system.calculateAuctionValue('ghost')).toBe(0);
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

        it('should execute default startAuction', () => {
            const result = system.executeTool('startAuction', { hostId: 'h1' });
            expect(result.success).toBe(true);
            expect(result.result.auction.hostId).toBe('h1');
        });
    });

    describe('Hook System', () => {
        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('auctionStarted', () => count++);
            unregister();
            system.startAuction({});
            expect(count).toBe(0);
        });

        it('should handle errors silently', () => {
            system.registerHook('auctionStarted', () => { throw new Error('x'); });
            expect(() => system.startAuction({})).not.toThrow();
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
            expect(result.generation).toBe(1);
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
            system.startAuction({});
            const json = system.toJSON();
            expect(json.auctions.length).toBe(1);
        });
        it('should deserialize', () => {
            system.startAuction({});
            const json = system.toJSON();
            const newSys = new CultivationAuction();
            newSys.fromJSON(json);
            expect(newSys.auctions.size).toBe(1);
        });
    });

    describe('getStats', () => {
        it('should return stats', () => {
            const stats = system.getStats();
            expect(stats.auctionCount).toBe(0);
            expect(stats.totalAuctions).toBe(0);
        });
    });

    describe('constructor', () => {
        it('should accept custom config', () => {
            const sys = new CultivationAuction({ maxAuctions: 200, baseBids: 50 });
            expect(sys.config.maxAuctions).toBe(200);
            expect(sys.config.baseBids).toBe(50);
        });

        it('should start with default status pending', () => {
            const { auction } = system.startAuction({});
            expect(auction.status).toBe('pending');
        });

        it('should allow custom bids in data', () => {
            const { auction } = system.startAuction({ bids: 99 });
            expect(auction.bids).toBe(99);
        });
    });
});
