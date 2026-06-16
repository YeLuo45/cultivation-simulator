/**
 * KarmaExchangeSystem.js - 缘分交换系统
 * V309 Iteration 6/9 - Fate Exchange Hub
 */
export class KarmaExchangeSystem {
    constructor(config = {}) {
        this.config = {
            maxKarmaPerExchange: config.maxKarmaPerExchange || 1000,
            exchangeFee: config.exchangeFee || 0.05,
            ...config
        };
        this.karmaPool = new Map();
        this.exchanges = new Map();
        this.marketListings = new Map();
        this.history = [];
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalExchanged: 0, totalKarma: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getKarma', (ctx) => this.getKarma(ctx.cultivatorId));
        this.registerTool('getMarketListings', () => Array.from(this.marketListings.values()));
    }

    addKarma(cultivatorId, amount) {
        if (!this.karmaPool.has(cultivatorId)) this.karmaPool.set(cultivatorId, 0);
        const current = this.karmaPool.get(cultivatorId);
        const newAmount = Math.max(0, current + amount);
        this.karmaPool.set(cultivatorId, newAmount);
        this._triggerHook('karmaChanged', { cultivatorId, amount, total: newAmount });
        return { success: true, total: newAmount };
    }

    getKarma(cultivatorId) { return this.karmaPool.get(cultivatorId) || 0; }

    transferKarma(fromId, toId, amount) {
        if (amount <= 0) return { success: false, error: 'INVALID_AMOUNT' };
        if (amount > this.config.maxKarmaPerExchange) return { success: false, error: 'EXCEEDS_MAX' };
        const fromKarma = this.getKarma(fromId);
        if (fromKarma < amount) return { success: false, error: 'INSUFFICIENT_KARMA' };
        const fee = Math.floor(amount * this.config.exchangeFee);
        const net = amount - fee;
        this.karmaPool.set(fromId, fromKarma - amount);
        this.addKarma(toId, net);
        this.stats.totalExchanged++;
        this.stats.totalKarma += amount;
        this._triggerHook('karmaTransferred', { fromId, toId, amount, fee });
        return { success: true, transferred: net, fee };
    }

    createListing(sellerId, amount, price) {
        if (amount > this.getKarma(sellerId)) return { success: false, error: 'INSUFFICIENT_KARMA' };
        const id = `lst_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const listing = { id, sellerId, amount, price, status: 'active', createdAt: Date.now() };
        this.marketListings.set(id, listing);
        return { success: true, listing };
    }

    buyListing(listingId, buyerId) {
        const listing = this.marketListings.get(listingId);
        if (!listing) return { success: false, error: 'LISTING_NOT_FOUND' };
        if (listing.status !== 'active') return { success: false, error: 'INACTIVE' };
        listing.status = 'sold';
        listing.buyerId = buyerId;
        listing.soldAt = Date.now();
        this.addKarma(buyerId, listing.amount);
        this.history.push({ ...listing });
        this._triggerHook('listingSold', { listingId, buyerId });
        return { success: true, listing };
    }

    cancelListing(listingId) {
        const listing = this.marketListings.get(listingId);
        if (!listing) return { success: false, error: 'LISTING_NOT_FOUND' };
        if (listing.status !== 'active') return { success: false, error: 'INACTIVE' };
        listing.status = 'cancelled';
        return { success: true };
    }

    registerTool(name, handler) { this.tools.set(name, { name, handler }); }
    executeTool(name, context) {
        const tool = this.tools.get(name);
        if (!tool) return { success: false, error: 'TOOL_NOT_FOUND' };
        try { return { success: true, result: tool.handler(context || {}) }; }
        catch (e) { return { success: false, error: e.message }; }
    }
    listTools() { return Array.from(this.tools.keys()); }

    registerHook(event, handler) {
        if (!this.hooks.has(event)) this.hooks.set(event, []);
        this.hooks.get(event).push(handler);
        return () => { const arr = this.hooks.get(event); if (arr) { const idx = arr.indexOf(handler); if (idx >= 0) arr.splice(idx, 1); } };
    }
    _triggerHook(event, data) {
        const handlers = this.hooks.get(event);
        if (!handlers) return;
        for (const h of handlers) { try { h(data); } catch (e) {} }
    }

    autoEvolve() {
        if (this.stats.totalExchanged < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.exchangeFee = Math.max(0, this.config.exchangeFee - 0.01);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { karmaPool: Array.from(this.karmaPool.entries()), marketListings: Array.from(this.marketListings.entries()), history: this.history, stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.karmaPool) this.karmaPool = new Map(data.karmaPool);
        if (data.marketListings) this.marketListings = new Map(data.marketListings);
        if (data.history) this.history = data.history;
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, karmaHolderCount: this.karmaPool.size, activeListingCount: Array.from(this.marketListings.values()).filter(l => l.status === 'active').length }; }
}