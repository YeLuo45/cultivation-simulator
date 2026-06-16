/**
 * PillAuctioneer.js - 丹药拍卖师
 * V1064 P-20260614-254 Round 40 Iter 27/30
 */
export const AUCTION_STATUS = ['upcoming', 'live', 'ended', 'cancelled'];
export const BID_STATUS = ['leading', 'outbid', 'won', 'lost'];

export class PillAuctioneer {
    constructor(config = {}) {
        this.config = { ...config };
        this.auctions = new Map();   // auctionId -> { id, item, startingPrice, currentPrice, leader, status, bids, endedAt }
        this.hooks = new Map();
        this.stats = { totalAuctions: 0, totalBids: 0, totalRevenue: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `auc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    listAuction(item, startingPrice) {
        if (!item || typeof startingPrice !== 'number' || startingPrice < 0) return null;
        const id = this._newId();
        const a = { id, item, startingPrice, currentPrice: startingPrice, leader: null, status: 'upcoming', bids: [], startedAt: Date.now(), endedAt: null };
        this.auctions.set(id, a);
        this.stats.totalAuctions++;
        return a;
    }
    get(id) { return this.auctions.get(id) || null; }
    listAll() { return [...this.auctions.values()]; }
    listByStatus(st) { return this.listAll().filter(a => a.status === st); }
    listLive() { return this.listByStatus('live'); }
    listEnded() { return this.listByStatus('ended'); }

    start(id) {
        const a = this.auctions.get(id);
        if (!a) return false;
        if (a.status !== 'upcoming') return false;
        a.status = 'live';
        return true;
    }
    bid(auctionId, bidder, amount) {
        const a = this.auctions.get(auctionId);
        if (!a) return null;
        if (a.status !== 'live') return null;
        if (amount <= a.currentPrice) return null;
        if (a.leader) {
            const prev = a.bids.find(b => b.bidder === a.leader);
            if (prev) prev.status = 'outbid';
        }
        const bid = { bidder, amount, status: 'leading', ts: Date.now() };
        a.bids.push(bid);
        a.currentPrice = amount;
        a.leader = bidder;
        this.stats.totalBids++;
        this._emit('bid', { auctionId, ...bid });
        return bid;
    }
    end(auctionId) {
        const a = this.auctions.get(auctionId);
        if (!a) return false;
        if (a.status !== 'live') return false;
        a.status = 'ended';
        a.endedAt = Date.now();
        if (a.leader) {
            const win = a.bids.find(b => b.bidder === a.leader);
            if (win) win.status = 'won';
            this.stats.totalRevenue += a.currentPrice;
        }
        this._emit('ended', a);
        return true;
    }
    cancel(auctionId) {
        const a = this.auctions.get(auctionId);
        if (!a) return false;
        a.status = 'cancelled';
        return true;
    }
    highestBid(auctionId) { return this.auctions.get(auctionId)?.currentPrice || 0; }
    leaderOf(auctionId) { return this.auctions.get(auctionId)?.leader || null; }
    isLive(id) { return this.auctions.get(id)?.status === 'live'; }
    isEnded(id) { return this.auctions.get(id)?.status === 'ended'; }
    bidCount(auctionId) { return this.auctions.get(auctionId)?.bids.length || 0; }
    bidHistory(auctionId) { return [...(this.auctions.get(auctionId)?.bids || [])]; }
    isLeading(auctionId, bidder) { return this.auctions.get(auctionId)?.leader === bidder; }
    revenue() { return this.stats.totalRevenue; }
    report() { return { totalAuctions: this.stats.totalAuctions, totalBids: this.stats.totalBids, totalRevenue: this.stats.totalRevenue }; }
    reset() { this.auctions.clear(); this.stats = { totalAuctions: 0, totalBids: 0, totalRevenue: 0 }; }
}
