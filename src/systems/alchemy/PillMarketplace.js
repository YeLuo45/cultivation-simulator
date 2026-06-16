/**
 * PillMarketplace.js - 丹药市集
 * V1066 P-20260614-256 Round 40 Iter 29/30
 */
export const LISTING_STATUS = ['active', 'sold', 'expired', 'cancelled'];
export const DEFAULT_LISTING_DURATION = 7 * 24 * 60 * 60 * 1000;

export class PillMarketplace {
    constructor(config = {}) {
        this.config = { defaultDuration: config.defaultDuration || DEFAULT_LISTING_DURATION, ...config };
        this.listings = new Map();   // listingId -> { id, item, quantity, price, seller, status, createdAt, expiresAt }
        this.bySeller = new Map();
        this.hooks = new Map();
        this.stats = { total: 0, totalSold: 0, totalRevenue: 0 };
    }
    _emit(ev, p) { const l = this.hooks.get(ev) || []; for (const x of l) { try { x(p); } catch {} } }
    registerHook(ev, fn) { if (!this.hooks.has(ev)) this.hooks.set(ev, []); this.hooks.get(ev).push(fn); }
    _newId() { return `lst_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

    list(item, quantity, price, seller, duration = null) {
        if (!item || !seller) return null;
        if (typeof quantity !== 'number' || quantity <= 0) return null;
        if (typeof price !== 'number' || price < 0) return null;
        const id = this._newId();
        const dur = duration || this.config.defaultDuration;
        const l = { id, item, quantity, price, seller, status: 'active', createdAt: Date.now(), expiresAt: Date.now() + dur };
        this.listings.set(id, l);
        if (!this.bySeller.has(seller)) this.bySeller.set(seller, []);
        this.bySeller.get(seller).push(id);
        this.stats.total++;
        return l;
    }
    get(id) { return this.listings.get(id) || null; }
    listAll() { return [...this.listings.values()]; }
    listActive() { return this.listAll().filter(l => l.status === 'active'); }
    listBySeller(seller) {
        const ids = this.bySeller.get(seller) || [];
        return ids.map(id => this.listings.get(id)).filter(Boolean);
    }
    listByItem(item) { return this.listAll().filter(l => l.item === item); }
    listByStatus(st) { return this.listAll().filter(l => l.status === st); }

    buy(buyer, listingId, quantity = 1) {
        const l = this.listings.get(listingId);
        if (!l) return null;
        if (l.status !== 'active') return null;
        if (quantity > l.quantity) return null;
        if (Date.now() > l.expiresAt) {
            l.status = 'expired';
            return null;
        }
        l.quantity -= quantity;
        if (l.quantity === 0) l.status = 'sold';
        this.stats.totalSold += quantity;
        this.stats.totalRevenue += quantity * l.price;
        this._emit('bought', { buyer, listingId, quantity, total: quantity * l.price });
        return { buyer, listingId, quantity, total: quantity * l.price };
    }
    cancel(listingId) {
        const l = this.listings.get(listingId);
        if (!l) return false;
        if (l.status !== 'active') return false;
        l.status = 'cancelled';
        return true;
    }
    sweepExpired() {
        let count = 0;
        for (const l of this.listings.values()) {
            if (l.status === 'active' && Date.now() > l.expiresAt) {
                l.status = 'expired';
                count++;
            }
        }
        return count;
    }
    isActive(id) { return this.listings.get(id)?.status === 'active'; }
    isSold(id) { return this.listings.get(id)?.status === 'sold'; }
    priceOf(id) { return this.listings.get(id)?.price || 0; }
    remaining(id) { return this.listings.get(id)?.quantity || 0; }
    cheapest(item) {
        const list = this.listByItem(item).filter(l => l.status === 'active');
        if (list.length === 0) return null;
        return list.reduce((best, l) => !best || l.price < best.price ? l : best, null);
    }
    report() { return { total: this.stats.total, totalSold: this.stats.totalSold, totalRevenue: this.stats.totalRevenue }; }
    reset() { this.listings.clear(); this.bySeller.clear(); this.stats = { total: 0, totalSold: 0, totalRevenue: 0 }; }
}
