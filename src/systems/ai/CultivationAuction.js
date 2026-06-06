/**
 * CultivationAuction.js - 修真拍卖
 * V541 Iteration 4/20 Round 22
 */
export class CultivationAuction {
    constructor(config = {}) {
        this.config = { maxAuctions: config.maxAuctions || 50, baseBids: config.baseBids || 10, ...config };
        this.auctions = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalAuctions: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getAuction', (ctx) => this.getAuction(ctx.auctionId));
        this.registerTool('startAuction', (ctx) => this.startAuction(ctx));
    }

    startAuction(data) {
        const id = data.id || `auc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const auction = { auctionId: id, hostId: data.hostId, name: data.name || 'Mystic Auction', type: data.type || 'treasure', bids: data.bids !== undefined ? data.bids : this.config.baseBids, lots: data.lots || [], level: 1, status: 'pending', createdAt: Date.now() };
        this.auctions.set(id, auction);
        this.stats.totalAuctions++;
        this._triggerHook('auctionStarted', { auctionId: id });
        return { success: true, auction };
    }

    getAuction(id) { return this.auctions.get(id) ? { ...this.auctions.get(id) } : null; }
    listAuctions() { return Array.from(this.auctions.values()).map(a => ({ ...a })); }
    listByHost(hostId) { return Array.from(this.auctions.values()).filter(a => a.hostId === hostId).map(a => ({ ...a })); }
    listActive() { return Array.from(this.auctions.values()).filter(a => a.status === 'active').map(a => ({ ...a })); }

    addLot(auctionId, lot) {
        const auction = this.auctions.get(auctionId);
        if (!auction) return { success: false, error: 'AUCTION_NOT_FOUND' };
        auction.lots.push(lot);
        this._triggerHook('lotAdded', { auctionId, lot });
        return { success: true };
    }

    increaseBids(auctionId, amount = 5) {
        const auction = this.auctions.get(auctionId);
        if (!auction) return { success: false, error: 'AUCTION_NOT_FOUND' };
        auction.bids += amount;
        this._triggerHook('bidsIncreased', { auctionId, amount, newBids: auction.bids });
        return { success: true };
    }

    levelUpAuction(auctionId) {
        const auction = this.auctions.get(auctionId);
        if (!auction) return { success: false, error: 'AUCTION_NOT_FOUND' };
        auction.level++;
        this._triggerHook('auctionLeveledUp', { auctionId, newLevel: auction.level });
        return { success: true };
    }

    closeAuction(auctionId) {
        const auction = this.auctions.get(auctionId);
        if (!auction) return { success: false, error: 'AUCTION_NOT_FOUND' };
        auction.status = 'closed';
        this._triggerHook('auctionClosed', { auctionId });
        return { success: true };
    }

    calculateAuctionValue(auctionId) {
        const auction = this.auctions.get(auctionId);
        if (!auction) return 0;
        return auction.level * 100 + auction.bids * 2 + auction.lots.length * 30;
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
        if (this.stats.totalAuctions < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxAuctions += 25;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { auctions: Array.from(this.auctions.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.auctions) this.auctions = new Map(data.auctions);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, auctionCount: this.auctions.size }; }
}
