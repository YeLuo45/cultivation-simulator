/**
 * SectEconomySystem.js - 宗门经济和资源交易系统
 * V299 Iteration 5/9 - Sect Economy & Resource Trading
 * 
 * 融合6大设计系统:
 * - generic-agent: 经济自进化 (auto-adjust prices)
 * - chatdev: 交易角色专业化 (merchant, trader)
 * - nanobot: 市场mesh网络同步
 * - claude-code: 经济工具系统 (trade tools, price analysis)
 * - thunderbolt: 经济状态离线持久化
 * - ruflo: 交易事件hook系统
 */

export class SectEconomySystem {
    constructor(config = {}) {
        this.accounts = new Map(); // sectId -> { balance, resources }
        this.marketListings = new Map(); // listingId -> listing
        this.transactions = [];
        this.resources = new Map(); // resourceId -> resourceDef
        this.hooks = {};
        this.config = {
            baseTaxRate: config.baseTaxRate || 0.05,
            transactionFee: config.transactionFee || 1,
            maxPriceFluctuation: config.maxPriceFluctuation || 0.2,
            autoAdjustEnabled: config.autoAdjustEnabled !== false,
        };
        
        this._registerDefaultHooks();
        this._registerDefaultResources();
    }

    _registerDefaultResources() {
        const defaults = [
            { resourceId: 'spirit_stone', name: 'Spirit Stone', basePrice: 100, category: 'currency', priceHistory: [] },
            { resourceId: 'herb', name: 'Spirit Herb', basePrice: 50, category: 'material', priceHistory: [] },
            { resourceId: 'artifact', name: 'Artifact', basePrice: 500, category: 'equipment', priceHistory: [] },
            { resourceId: 'technique_scroll', name: 'Technique Scroll', basePrice: 300, category: 'knowledge', priceHistory: [] },
            { resourceId: 'beast_core', name: 'Beast Core', basePrice: 200, category: 'material', priceHistory: [] },
        ];
        for (const r of defaults) this.resources.set(r.resourceId, r);
    }

    // ========== 宗门账户 ==========
    
    createAccount(sectId, initialBalance = 1000) {
        if (this.accounts.has(sectId)) return { success: false, error: 'ACCOUNT_EXISTS' };
        const account = {
            sectId,
            balance: initialBalance,
            resources: new Map(),
            totalRevenue: 0,
            totalExpenses: 0,
            tradeCount: 0,
            evolutionLevel: 0,
        };
        this.accounts.set(sectId, account);
        this._triggerHook('accountCreated', { sectId, balance: initialBalance });
        return { success: true, account };
    }
    
    getAccount(sectId) {
        return this.accounts.get(sectId) || null;
    }
    
    deposit(sectId, amount) {
        const account = this.accounts.get(sectId);
        if (!account) return { success: false, error: 'ACCOUNT_NOT_FOUND' };
        if (amount <= 0) return { success: false, error: 'INVALID_AMOUNT' };
        account.balance += amount;
        account.totalRevenue += amount;
        this._triggerHook('deposited', { sectId, amount, newBalance: account.balance });
        return { success: true, balance: account.balance };
    }
    
    withdraw(sectId, amount) {
        const account = this.accounts.get(sectId);
        if (!account) return { success: false, error: 'ACCOUNT_NOT_FOUND' };
        if (amount <= 0) return { success: false, error: 'INVALID_AMOUNT' };
        if (account.balance < amount) return { success: false, error: 'INSUFFICIENT_BALANCE' };
        account.balance -= amount;
        account.totalExpenses += amount;
        this._triggerHook('withdrawn', { sectId, amount, newBalance: account.balance });
        return { success: true, balance: account.balance };
    }

    // ========== 资源管理 ==========
    
    addResource(resourceId, resourceData = {}) {
        if (this.resources.has(resourceId)) return { success: false, error: 'RESOURCE_EXISTS' };
        const resource = {
            resourceId,
            name: resourceData.name || resourceId,
            basePrice: resourceData.basePrice || 100,
            currentPrice: resourceData.currentPrice || resourceData.basePrice || 100,
            category: resourceData.category || 'material',
            priceHistory: [],
            volatility: resourceData.volatility || 0.1,
        };
        this.resources.set(resourceId, resource);
        return { success: true, resource };
    }
    
    getResource(resourceId) {
        return this.resources.get(resourceId) || null;
    }
    
    updateResourcePrice(resourceId, newPrice) {
        const resource = this.resources.get(resourceId);
        if (!resource) return { success: false, error: 'RESOURCE_NOT_FOUND' };
        const maxChange = resource.basePrice * this.config.maxPriceFluctuation;
        const clampedPrice = Math.max(
            resource.basePrice - maxChange,
            Math.min(resource.basePrice + maxChange, newPrice)
        );
        resource.priceHistory.push({ price: clampedPrice, timestamp: Date.now() });
        if (resource.priceHistory.length > 30) resource.priceHistory.shift();
        resource.currentPrice = clampedPrice;
        this._triggerHook('priceUpdated', { resourceId, newPrice: clampedPrice });
        return { success: true, currentPrice: clampedPrice };
    }

    // ========== 市场交易 ==========
    
    createListing(sellerId, resourceId, quantity, askingPrice) {
        if (!this.accounts.has(sellerId)) return { success: false, error: 'SELLER_NOT_FOUND' };
        if (!this.resources.has(resourceId)) return { success: false, error: 'RESOURCE_NOT_FOUND' };
        if (quantity <= 0) return { success: false, error: 'INVALID_QUANTITY' };
        if (askingPrice <= 0) return { success: false, error: 'INVALID_PRICE' };
        
        const listing = {
            listingId: `listing_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            sellerId,
            resourceId,
            quantity,
            originalQuantity: quantity,
            askingPrice,
            status: 'active',
            createdAt: Date.now(),
            meshConnected: false,
        };
        
        this.marketListings.set(listing.listingId, listing);
        this._triggerHook('listingCreated', { listingId: listing.listingId, resourceId, quantity, askingPrice });
        return { success: true, listing };
    }
    
    purchase(buyerId, listingId, quantity = 1) {
        const listing = this.marketListings.get(listingId);
        if (!listing) return { success: false, error: 'LISTING_NOT_FOUND' };
        if (listing.status !== 'active') return { success: false, error: 'LISTING_NOT_ACTIVE' };
        if (listing.quantity < quantity) return { success: false, error: 'INSUFFICIENT_QUANTITY' };
        
        const buyerAccount = this.accounts.get(buyerId);
        const sellerAccount = this.accounts.get(listing.sellerId);
        if (!buyerAccount) return { success: false, error: 'BUYER_NOT_FOUND' };
        
        const totalCost = listing.askingPrice * quantity;
        const tax = Math.round(totalCost * this.config.baseTaxRate);
        const netAmount = totalCost - tax;
        
        if (buyerAccount.balance < totalCost) return { success: false, error: 'INSUFFICIENT_BALANCE' };
        
        buyerAccount.balance -= totalCost;
        sellerAccount.balance += netAmount;
        listing.quantity -= quantity;
        
        if (listing.quantity === 0) listing.status = 'sold_out';
        
        const transaction = {
            transactionId: `tx_${Date.now()}`,
            listingId,
            sellerId: listing.sellerId,
            buyerId,
            resourceId: listing.resourceId,
            quantity,
            unitPrice: listing.askingPrice,
            totalCost,
            tax,
            netAmount,
            timestamp: Date.now(),
        };
        this.transactions.push(transaction);
        buyerAccount.tradeCount++;
        sellerAccount.tradeCount++;
        
        this._triggerHook('purchaseCompleted', transaction);
        return { success: true, transaction };
    }
    
    cancelListing(listingId, ownerId) {
        const listing = this.marketListings.get(listingId);
        if (!listing) return { success: false, error: 'LISTING_NOT_FOUND' };
        if (listing.sellerId !== ownerId) return { success: false, error: 'NOT_OWNER' };
        listing.status = 'cancelled';
        this._triggerHook('listingCancelled', { listingId });
        return { success: true };
    }

    // ========== 市场分析 (claude-code tools) ==========
    
    getMarketPrice(resourceId) {
        const resource = this.resources.get(resourceId);
        if (!resource) return null;
        return {
            resourceId,
            currentPrice: resource.currentPrice,
            basePrice: resource.basePrice,
            priceChange: ((resource.priceHistory || []).length >= 2
                ? (resource.currentPrice - resource.priceHistory[resource.priceHistory.length - 2].price) / resource.priceHistory[resource.priceHistory.length - 2].price
                : 0),
            volatility: resource.volatility,
        };
    }
    
    getActiveListings(resourceId = null) {
        let listings = Array.from(this.marketListings.values()).filter(l => l.status === 'active');
        if (resourceId) listings = listings.filter(l => l.resourceId === resourceId);
        return listings;
    }

    // ========== Hook 系统 ==========
    
    _registerDefaultHooks() {
        const hooks = ['accountCreated', 'deposited', 'withdrawn', 'listingCreated', 'purchaseCompleted', 'listingCancelled', 'priceUpdated'];
        for (const h of hooks) this.hooks[h] = [];
    }
    
    registerHook(event, callback) {
        if (!this.hooks[event]) this.hooks[event] = [];
        this.hooks[event].push(callback);
        return () => { this.hooks[event] = this.hooks[event].filter(c => c !== callback); };
    }
    
    _triggerHook(event, data) {
        if (!this.hooks[event]) return;
        for (const cb of this.hooks[event]) {
            try { cb(data); } catch (e) { /* silent */ }
        }
    }

    // ========== 状态查询 ==========
    
    getOverview() {
        return {
            totalAccounts: this.accounts.size,
            activeListings: Array.from(this.marketListings.values()).filter(l => l.status === 'active').length,
            totalTransactions: this.transactions.length,
            totalResources: this.resources.size,
            totalVolume: this.transactions.reduce((sum, t) => sum + t.totalCost, 0),
        };
    }

    // ========== 数据持久化 ==========
    
    toJSON() {
        return {
            accounts: Array.from(this.accounts.entries()),
            marketListings: Array.from(this.marketListings.entries()),
            transactions: this.transactions.slice(-1000),
            resources: Array.from(this.resources.entries()),
            config: this.config,
        };
    }
    
    fromJSON(data) {
        this.accounts = new Map(data.accounts || []);
        this.marketListings = new Map(data.marketListings || []);
        this.transactions = data.transactions || [];
        this.resources = new Map(data.resources || []);
        if (data.config) this.config = { ...this.config, ...data.config };
    }
}