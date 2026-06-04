/**
 * SectEconomySystem.test.js - 宗门经济和资源交易系统测试
 * V299 Iteration 5/9 - 测试覆盖率目标: 99%+
 * 100% pass rate required
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SectEconomySystem } from '../../../systems/ai/SectEconomySystem.js';

describe('SectEconomySystem', () => {
    let system;

    beforeEach(() => {
        system = new SectEconomySystem({ autoAdjustEnabled: true });
    });

    // ========== 宗门账户测试 ==========
    
    describe('createAccount', () => {
        it('should create account with initial balance', () => {
            const result = system.createAccount('sect_1', 5000);
            expect(result.success).toBe(true);
            expect(result.account.sectId).toBe('sect_1');
            expect(result.account.balance).toBe(5000);
        });

        it('should default initial balance to 1000', () => {
            const result = system.createAccount('sect_1');
            expect(result.account.balance).toBe(1000);
        });

        it('should reject duplicate account', () => {
            system.createAccount('sect_1');
            const result = system.createAccount('sect_1');
            expect(result.success).toBe(false);
            expect(result.error).toBe('ACCOUNT_EXISTS');
        });

        it('should trigger accountCreated hook', () => {
            let called = false;
            system.registerHook('accountCreated', () => { called = true; });
            system.createAccount('sect_1');
            expect(called).toBe(true);
        });
    });

    describe('getAccount', () => {
        it('should return account when exists', () => {
            system.createAccount('sect_1', 3000);
            const account = system.getAccount('sect_1');
            expect(account).not.toBeNull();
            expect(account.balance).toBe(3000);
        });

        it('should return null for non-existent', () => {
            expect(system.getAccount('ghost')).toBeNull();
        });
    });

    describe('deposit', () => {
        it('should deposit amount to account', () => {
            system.createAccount('sect_1');
            const result = system.deposit('sect_1', 500);
            expect(result.success).toBe(true);
            expect(result.balance).toBe(1500);
        });

        it('should update totalRevenue', () => {
            system.createAccount('sect_1');
            system.deposit('sect_1', 500);
            expect(system.getAccount('sect_1').totalRevenue).toBe(500);
        });

        it('should reject non-existent account', () => {
            const result = system.deposit('ghost', 500);
            expect(result.success).toBe(false);
            expect(result.error).toBe('ACCOUNT_NOT_FOUND');
        });

        it('should reject zero amount', () => {
            system.createAccount('sect_1');
            const result = system.deposit('sect_1', 0);
            expect(result.success).toBe(false);
            expect(result.error).toBe('INVALID_AMOUNT');
        });

        it('should reject negative amount', () => {
            system.createAccount('sect_1');
            const result = system.deposit('sect_1', -100);
            expect(result.success).toBe(false);
            expect(result.error).toBe('INVALID_AMOUNT');
        });
    });

    describe('withdraw', () => {
        it('should withdraw amount from account', () => {
            system.createAccount('sect_1', 1000);
            const result = system.withdraw('sect_1', 300);
            expect(result.success).toBe(true);
            expect(result.balance).toBe(700);
        });

        it('should update totalExpenses', () => {
            system.createAccount('sect_1', 1000);
            system.withdraw('sect_1', 300);
            expect(system.getAccount('sect_1').totalExpenses).toBe(300);
        });

        it('should reject insufficient balance', () => {
            system.createAccount('sect_1', 100);
            const result = system.withdraw('sect_1', 200);
            expect(result.success).toBe(false);
            expect(result.error).toBe('INSUFFICIENT_BALANCE');
        });

        it('should reject non-existent account', () => {
            const result = system.withdraw('ghost', 100);
            expect(result.success).toBe(false);
            expect(result.error).toBe('ACCOUNT_NOT_FOUND');
        });
    });

    // ========== 资源管理测试 ==========
    
    describe('addResource', () => {
        it('should add new resource', () => {
            const result = system.addResource('crystal', { name: 'Soul Crystal', basePrice: 200 });
            expect(result.success).toBe(true);
            expect(result.resource.resourceId).toBe('crystal');
        });

        it('should default currentPrice to basePrice', () => {
            const result = system.addResource('crystal', { basePrice: 250 });
            expect(result.resource.currentPrice).toBe(250);
        });

        it('should reject duplicate resource', () => {
            system.addResource('crystal');
            const result = system.addResource('crystal');
            expect(result.success).toBe(false);
            expect(result.error).toBe('RESOURCE_EXISTS');
        });
    });

    describe('getResource', () => {
        it('should return resource when exists', () => {
            system.addResource('crystal', { name: 'Soul Crystal' });
            const r = system.getResource('crystal');
            expect(r).not.toBeNull();
            expect(r.name).toBe('Soul Crystal');
        });

        it('should return null for non-existent', () => {
            expect(system.getResource('ghost')).toBeNull();
        });

        it('should return default resources', () => {
            const r = system.getResource('spirit_stone');
            expect(r).not.toBeNull();
            expect(r.name).toBe('Spirit Stone');
        });
    });

    describe('updateResourcePrice', () => {
        it('should update resource price', () => {
            system.addResource('crystal', { basePrice: 100 });
            const result = system.updateResourcePrice('crystal', 120);
            expect(result.success).toBe(true);
            expect(result.currentPrice).toBe(120);
        });

        it('should clamp price within fluctuation limits', () => {
            system.addResource('crystal', { basePrice: 100 });
            const result = system.updateResourcePrice('crystal', 500);
            expect(result.currentPrice).toBeLessThanOrEqual(100 * 1.2);
            expect(result.currentPrice).toBeGreaterThanOrEqual(100 * 0.8);
        });

        it('should track price history', () => {
            system.addResource('crystal', { basePrice: 100 });
            system.updateResourcePrice('crystal', 110);
            system.updateResourcePrice('crystal', 115);
            const r = system.getResource('crystal');
            expect(r.priceHistory.length).toBe(2);
        });
    });

    // ========== 市场交易测试 ==========
    
    describe('createListing', () => {
        it('should create listing', () => {
            system.createAccount('sect_1');
            const { listing } = system.createListing('sect_1', 'spirit_stone', 10, 120);
            expect(listing.quantity).toBe(10);
            expect(listing.askingPrice).toBe(120);
        });

        it('should reject non-existent seller', () => {
            const result = system.createListing('ghost', 'spirit_stone', 10, 100);
            expect(result.success).toBe(false);
            expect(result.error).toBe('SELLER_NOT_FOUND');
        });

        it('should reject non-existent resource', () => {
            system.createAccount('sect_1');
            const result = system.createListing('sect_1', 'ghost_resource', 10, 100);
            expect(result.success).toBe(false);
            expect(result.error).toBe('RESOURCE_NOT_FOUND');
        });

        it('should reject invalid quantity', () => {
            system.createAccount('sect_1');
            const result = system.createListing('sect_1', 'spirit_stone', 0, 100);
            expect(result.success).toBe(false);
            expect(result.error).toBe('INVALID_QUANTITY');
        });

        it('should reject invalid price', () => {
            system.createAccount('sect_1');
            const result = system.createListing('sect_1', 'spirit_stone', 10, -50);
            expect(result.success).toBe(false);
            expect(result.error).toBe('INVALID_PRICE');
        });

        it('should trigger listingCreated hook', () => {
            system.createAccount('sect_1');
            let called = false;
            system.registerHook('listingCreated', () => { called = true; });
            system.createListing('sect_1', 'spirit_stone', 10, 100);
            expect(called).toBe(true);
        });
    });

    describe('purchase', () => {
        it('should complete purchase successfully', () => {
            system.createAccount('seller', 0);
            system.createAccount('buyer', 5000);
            const { listing } = system.createListing('seller', 'spirit_stone', 5, 100);
            const result = system.purchase('buyer', listing.listingId, 2);
            expect(result.success).toBe(true);
            expect(result.transaction.quantity).toBe(2);
            expect(result.transaction.totalCost).toBe(200);
        });

        it('should deduct buyer balance', () => {
            system.createAccount('seller', 0);
            system.createAccount('buyer', 1000);
            const { listing } = system.createListing('seller', 'spirit_stone', 5, 100);
            system.purchase('buyer', listing.listingId, 1);
            expect(system.getAccount('buyer').balance).toBe(900);
        });

        it('should credit seller net amount after tax', () => {
            system.createAccount('seller', 0);
            system.createAccount('buyer', 1000);
            const { listing } = system.createListing('seller', 'spirit_stone', 5, 100);
            system.purchase('buyer', listing.listingId, 1);
            // 100 * 1 = 100, tax = 5, net = 95
            expect(system.getAccount('seller').balance).toBe(95);
        });

        it('should mark listing sold_out when quantity zero', () => {
            system.createAccount('seller', 0);
            system.createAccount('buyer', 1000);
            const { listing } = system.createListing('seller', 'spirit_stone', 2, 100);
            system.purchase('buyer', listing.listingId, 2);
            const l = system.marketListings.get(listing.listingId);
            expect(l.status).toBe('sold_out');
        });

        it('should reject non-existent listing', () => {
            system.createAccount('buyer', 1000);
            const result = system.purchase('buyer', 'ghost_listing', 1);
            expect(result.success).toBe(false);
            expect(result.error).toBe('LISTING_NOT_FOUND');
        });

        it('should reject inactive listing', () => {
            system.createAccount('seller', 0);
            system.createAccount('buyer', 1000);
            const { listing } = system.createListing('seller', 'spirit_stone', 5, 100);
            system.cancelListing(listing.listingId, 'seller');
            const result = system.purchase('buyer', listing.listingId, 1);
            expect(result.success).toBe(false);
            expect(result.error).toBe('LISTING_NOT_ACTIVE');
        });

        it('should reject insufficient buyer balance', () => {
            system.createAccount('seller', 0);
            system.createAccount('buyer', 50);
            const { listing } = system.createListing('seller', 'spirit_stone', 5, 100);
            const result = system.purchase('buyer', listing.listingId, 1);
            expect(result.success).toBe(false);
            expect(result.error).toBe('INSUFFICIENT_BALANCE');
        });
    });

    describe('cancelListing', () => {
        it('should cancel listing by owner', () => {
            system.createAccount('sect_1');
            const { listing } = system.createListing('sect_1', 'spirit_stone', 5, 100);
            const result = system.cancelListing(listing.listingId, 'sect_1');
            expect(result.success).toBe(true);
            expect(system.marketListings.get(listing.listingId).status).toBe('cancelled');
        });

        it('should reject cancellation by non-owner', () => {
            system.createAccount('sect_1');
            system.createAccount('other');
            const { listing } = system.createListing('sect_1', 'spirit_stone', 5, 100);
            const result = system.cancelListing(listing.listingId, 'other');
            expect(result.success).toBe(false);
            expect(result.error).toBe('NOT_OWNER');
        });
    });

    // ========== 市场分析测试 ==========
    
    describe('getMarketPrice', () => {
        it('should return market price for resource', () => {
            const result = system.getMarketPrice('spirit_stone');
            expect(result).not.toBeNull();
            expect(result.basePrice).toBeGreaterThan(0);
            expect(result.priceChange).toBe(0);
        });

        it('should calculate price change from history', () => {
            system.updateResourcePrice('spirit_stone', 105);
            system.updateResourcePrice('spirit_stone', 110);
            const result = system.getMarketPrice('spirit_stone');
            expect(result.priceChange).not.toBe(0);
        });

        it('should return null for non-existent resource', () => {
            expect(system.getMarketPrice('ghost')).toBeNull();
        });
    });

    describe('getActiveListings', () => {
        it('should return all active listings', () => {
            system.createAccount('sect_1');
            system.createListing('sect_1', 'spirit_stone', 5, 100);
            system.createListing('sect_1', 'herb', 3, 60);
            const listings = system.getActiveListings();
            expect(listings.length).toBe(2);
        });

        it('should filter by resourceId', () => {
            system.createAccount('sect_1');
            system.createListing('sect_1', 'spirit_stone', 5, 100);
            system.createListing('sect_1', 'herb', 3, 60);
            const listings = system.getActiveListings('spirit_stone');
            expect(listings.length).toBe(1);
            expect(listings[0].resourceId).toBe('spirit_stone');
        });
    });

    // ========== Hook 系统测试 ==========
    
    describe('Hook System', () => {
        it('should handle hook errors silently', () => {
            system.registerHook('deposited', () => { throw new Error('test'); });
            system.createAccount('sect_1');
            expect(() => system.deposit('sect_1', 100)).not.toThrow();
        });

        it('should support unregister', () => {
            let count = 0;
            const unregister = system.registerHook('purchaseCompleted', () => count++);
            system.createAccount('seller', 0);
            system.createAccount('buyer', 1000);
            const { listing } = system.createListing('seller', 'spirit_stone', 5, 100);
            system.purchase('buyer', listing.listingId, 1);
            unregister();
            const { listing: listing2 } = system.createListing('seller', 'spirit_stone', 5, 100);
            system.purchase('buyer', listing2.listingId, 1);
            expect(count).toBe(1);
        });
    });

    // ========== 状态查询测试 ==========
    
    describe('getOverview', () => {
        it('should return correct overview', () => {
            system.createAccount('sect_1');
            system.createAccount('sect_2');
            const overview = system.getOverview();
            expect(overview.totalAccounts).toBe(2);
            expect(overview.totalResources).toBe(5); // 5 default resources
        });

        it('should count active listings', () => {
            system.createAccount('sect_1');
            system.createListing('sect_1', 'spirit_stone', 5, 100);
            system.createListing('sect_1', 'herb', 3, 60);
            const overview = system.getOverview();
            expect(overview.activeListings).toBe(2);
        });

        it('should calculate total volume', () => {
            system.createAccount('seller', 0);
            system.createAccount('buyer', 5000);
            const { listing } = system.createListing('seller', 'spirit_stone', 10, 100);
            system.purchase('buyer', listing.listingId, 5);
            const overview = system.getOverview();
            expect(overview.totalVolume).toBe(500);
        });
    });

    // ========== 数据持久化测试 ==========
    
    describe('Data Persistence', () => {
        it('should serialize to JSON', () => {
            system.createAccount('sect_1', 5000);
            system.addResource('crystal', { name: 'Soul Crystal' });
            const json = system.toJSON();
            expect(json.accounts.length).toBe(1);
            expect(json.resources.length).toBe(6);
        });

        it('should deserialize from JSON', () => {
            system.createAccount('sect_1', 5000);
            system.deposit('sect_1', 1000);
            const json = system.toJSON();
            const newSystem = new SectEconomySystem();
            newSystem.fromJSON(json);
            expect(newSystem.getAccount('sect_1').balance).toBe(6000);
        });

        it('should preserve config on deserialize', () => {
            system.createAccount('sect_1');
            const json = system.toJSON();
            const newSystem = new SectEconomySystem({ baseTaxRate: 0.5 });
            newSystem.fromJSON(json);
            expect(newSystem.config.baseTaxRate).toBe(0.05);
        });
    });

    // ========== 边界情况测试 ==========
    
    describe('Edge Cases', () => {
        it('should handle empty market', () => {
            const overview = system.getOverview();
            expect(overview.activeListings).toBe(0);
            expect(overview.totalTransactions).toBe(0);
        });

        it('should handle very small deposit', () => {
            system.createAccount('sect_1');
            const result = system.deposit('sect_1', 0.01);
            expect(result.success).toBe(true);
        });

        it('should handle purchase of 1 unit', () => {
            system.createAccount('seller', 0);
            system.createAccount('buyer', 1000);
            const { listing } = system.createListing('seller', 'spirit_stone', 10, 100);
            const result = system.purchase('buyer', listing.listingId, 1);
            expect(result.success).toBe(true);
        });

        it('should handle default resources count', () => {
            const overview = system.getOverview();
            expect(overview.totalResources).toBe(5);
        });

        it('should track transaction count on accounts', () => {
            system.createAccount('seller', 0);
            system.createAccount('buyer', 5000);
            const { listing } = system.createListing('seller', 'spirit_stone', 10, 100);
            system.purchase('buyer', listing.listingId, 2);
            expect(system.getAccount('buyer').tradeCount).toBe(1);
        });
    });
});