/**
 * TalismanAuctioneer.js - 符箓拍卖
 * V1156 Round 43 Iter 29/30
 */
export const AUCTION_STATUS = ['pending', 'active', 'sold', 'unsold', 'cancelled'];
export const AUCTION_TYPES = ['standard', 'reserve', 'silent', 'flash', 'royal'];

export class TalismanAuctioneer {
    constructor(config = {}) {
        this.config = { ...config };
        this.auctions = new Map();   // aid -> { id, talisman, type, status, currentBid, reservePrice, bidder, ts }
        this.hooks = new Map();
        this.stats = { total: 0, totalSold: 0, totalUnsold: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `au_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    list(talisman, startingBid = 10, reservePrice = 0, type = 'standard') {
        if (!talisman) return null;
        if (!AUCTION_TYPES.includes(type)) type = 'standard';
        const id = this._newId();
        const a = { id, talisman, type, status: 'pending', currentBid: startingBid, reservePrice, bidder: null, ts: Date.now() };
        this.auctions.set(id, a);
        this.stats.total++;
        return a;
    }
    get(id) { return this.auctions.get(id) || null; }
    listAll() { return [...this.auctions.values()]; }
    listByStatus(st) { return this.listAll().filter(a => a.status === st); }
    listByType(type) { return this.listAll().filter(a => a.type === type); }
    listByBidder(bidder) { return this.listAll().filter(a => a.bidder === bidder); }
    listActive() { return this.listByStatus('active'); }

    setStatus(id, status) {
        const a = this.auctions.get(id);
        if (!a) return false;
        if (!AUCTION_STATUS.includes(status)) return false;
        a.status = status;
        if (status === 'sold') {
            this.stats.totalSold++;
            this._emit('sold', a);
        } else if (status === 'unsold') {
            this.stats.totalUnsold++;
        }
        return true;
    }
    start(id) { return this.setStatus(id, 'active'); }
    cancel(id) { return this.setStatus(id, 'cancelled'); }
    bid(id, bidder, amount) {
        const a = this.auctions.get(id);
        if (!a) return false;
        if (a.status !== 'active' && a.status !== 'pending') return false;
        if (amount <= a.currentBid) return false;
        a.currentBid = amount;
        a.bidder = bidder;
        if (a.status === 'pending') a.status = 'active';
        this._emit('bid', a);
        return true;
    }
    finalize(id) {
        const a = this.auctions.get(id);
        if (!a) return false;
        if (a.status !== 'active') return false;
        if (a.currentBid >= a.reservePrice) {
            a.status = 'sold';
            this.stats.totalSold++;
            this._emit('sold', a);
        } else {
            a.status = 'unsold';
            this.stats.totalUnsold++;
        }
        return true;
    }
    setReserve(id, reserve) {
        const a = this.auctions.get(id);
        if (!a) return false;
        a.reservePrice = Math.max(0, reserve);
        return true;
    }
    isActive(id) { return this.auctions.get(id)?.status === 'active'; }
    isSold(id) { return this.auctions.get(id)?.status === 'sold'; }
    isUnsold(id) { return this.auctions.get(id)?.status === 'unsold'; }
    isCancelled(id) { return this.auctions.get(id)?.status === 'cancelled'; }
    currentBidOf(id) { return this.auctions.get(id)?.currentBid || 0; }
    reserveOf(id) { return this.auctions.get(id)?.reservePrice || 0; }
    bidderOf(id) { return this.auctions.get(id)?.bidder || null; }
    sellRate() { return this.stats.total === 0 ? 0 : this.stats.totalSold / this.stats.total; }
    bidderCount(bidder) { return this.listByBidder(bidder).length; }
    bestBid() {
        const list = this.listAll().filter(a => a.bidder);
        if (list.length === 0) return null;
        return list.reduce((best, a) => !best || a.currentBid > best.currentBid ? a : best, null);
    }
    countByStatus() {
        const c = {};
        for (const st of AUCTION_STATUS) c[st] = 0;
        for (const a of this.auctions.values()) c[a.status] = (c[a.status] || 0) + 1;
        return c;
    }
    report() { return { total: this.stats.total, totalSold: this.stats.totalSold, totalUnsold: this.stats.totalUnsold, sellRate: this.sellRate() }; }
    reset() { this.auctions.clear(); this.stats = { total: 0, totalSold: 0, totalUnsold: 0 }; }
}
