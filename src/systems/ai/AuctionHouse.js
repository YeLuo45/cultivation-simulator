/**
 * AuctionHouse.js - 拍卖行
 * V377 Iteration 2/9 Round 11
 */
export class AuctionHouse {
    constructor(config = {}) {
        this.config = { maxAuctions: config.maxAuctions || 50, minBidIncrement: config.minBidIncrement || 10, ...config };
        this.auctions = new Map();
        this.bids = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalAuctions: 0, totalBids: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getAuction', (ctx) => this.getAuction(ctx.auctionId));
        this.registerTool('createAuction', (ctx) => this.createAuction(ctx));
    }

    createAuction(data) {
        const id = data.id || `auc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const auction = { auctionId: id, itemId: data.itemId, sellerId: data.sellerId, startingPrice: data.startingPrice || 100, currentBid: data.startingPrice || 100, currentBidder: null, status: 'active', createdAt: Date.now(), endTime: data.endTime || Date.now() + 86400000 };
        this.auctions.set(id, auction);
        this.stats.totalAuctions++;
        this._triggerHook('auctionCreated', { auctionId: id });
        return { success: true, auction };
    }

    getAuction(id) { return this.auctions.get(id) ? { ...this.auctions.get(id) } : null; }
    listAuctions() { return Array.from(this.auctions.values()).map(a => ({ ...a })); }
    listActive() { return Array.from(this.auctions.values()).filter(a => a.status === 'active').map(a => ({ ...a })); }
    listBySeller(sellerId) { return Array.from(this.auctions.values()).filter(a => a.sellerId === sellerId).map(a => ({ ...a })); }
    listByItem(itemId) { return Array.from(this.auctions.values()).filter(a => a.itemId === itemId).map(a => ({ ...a })); }

    placeBid(auctionId, bidderId, amount) {
        const auction = this.auctions.get(auctionId);
        if (!auction) return { success: false, error: 'AUCTION_NOT_FOUND' };
        if (auction.status !== 'active') return { success: false, error: 'AUCTION_INACTIVE' };
        if (amount < auction.currentBid + this.config.minBidIncrement) return { success: false, error: 'BID_TOO_LOW' };
        auction.currentBid = amount;
        auction.currentBidder = bidderId;
        const id = `bid_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const bid = { bidId: id, auctionId, bidderId, amount, placedAt: Date.now() };
        this.bids.set(id, bid);
        this.stats.totalBids++;
        this._triggerHook('bidPlaced', { auctionId, bidderId, amount });
        return { success: true, bid };
    }

    getBid(id) { return this.bids.get(id) ? { ...this.bids.get(id) } : null; }
    listBids() { return Array.from(this.bids.values()).map(b => ({ ...b })); }
    listBidsByAuction(auctionId) { return Array.from(this.bids.values()).filter(b => b.auctionId === auctionId).map(b => ({ ...b })); }
    listBidsByBidder(bidderId) { return Array.from(this.bids.values()).filter(b => b.bidderId === bidderId).map(b => ({ ...b })); }

    endAuction(auctionId) {
        const auction = this.auctions.get(auctionId);
        if (!auction) return { success: false, error: 'AUCTION_NOT_FOUND' };
        auction.status = 'ended';
        this._triggerHook('auctionEnded', { auctionId, winner: auction.currentBidder });
        return { success: true, winner: auction.currentBidder, finalBid: auction.currentBid };
    }

    cancelAuction(auctionId) {
        const auction = this.auctions.get(auctionId);
        if (!auction) return { success: false, error: 'AUCTION_NOT_FOUND' };
        auction.status = 'cancelled';
        this._triggerHook('auctionCancelled', { auctionId });
        return { success: true };
    }

    calculateTotalVolume() { return Array.from(this.bids.values()).reduce((s, b) => s + b.amount, 0); }

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
        this.config.maxAuctions += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { auctions: Array.from(this.auctions.entries()), bids: Array.from(this.bids.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.auctions) this.auctions = new Map(data.auctions);
        if (data.bids) this.bids = new Map(data.bids);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, auctionCount: this.auctions.size, bidCount: this.bids.size }; }
}