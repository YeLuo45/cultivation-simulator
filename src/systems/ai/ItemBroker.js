/**
 * ItemBroker.js - 物品经纪人
 * V383 Iteration 8/9 Round 11
 */
export class ItemBroker {
    constructor(config = {}) {
        this.config = { maxBrokers: config.maxBrokers || 50, baseCommission: config.baseCommission || 0.05, ...config };
        this.brokers = new Map();
        this.deals = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDeals: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBroker', (ctx) => this.getBroker(ctx.brokerId));
        this.registerTool('registerBroker', (ctx) => this.registerBroker(ctx));
    }

    registerBroker(data) {
        const id = data.id || `brk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const broker = { brokerId: id, name: data.name || 'Broker', specialty: data.specialty || 'general', commission: data.commission || this.config.baseCommission, rating: data.rating || 5.0, createdAt: Date.now() };
        this.brokers.set(id, broker);
        this._triggerHook('brokerRegistered', { brokerId: id });
        return { success: true, broker };
    }

    getBroker(id) { return this.brokers.get(id) ? { ...this.brokers.get(id) } : null; }
    listBrokers() { return Array.from(this.brokers.values()).map(b => ({ ...b })); }
    listBySpecialty(specialty) { return Array.from(this.brokers.values()).filter(b => b.specialty === specialty).map(b => ({ ...b })); }
    listByRating(min) { return Array.from(this.brokers.values()).filter(b => b.rating >= min).map(b => ({ ...b })); }

    findMatch(specialty) {
        return this.listBySpecialty(specialty).sort((a, b) => b.rating - a.rating)[0] || null;
    }

    arrangeDeal(brokerId, buyerId, sellerId, itemId, price) {
        const broker = this.brokers.get(brokerId);
        if (!broker) return { success: false, error: 'BROKER_NOT_FOUND' };
        const commission = Math.floor(price * broker.commission);
        const id = `dl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const deal = { dealId: id, brokerId, buyerId, sellerId, itemId, price, commission, arrangedAt: Date.now() };
        this.deals.set(id, deal);
        this.stats.totalDeals++;
        this._triggerHook('dealArranged', { dealId: id });
        return { success: true, deal };
    }

    getDeal(id) { return this.deals.get(id) ? { ...this.deals.get(id) } : null; }
    listDeals() { return Array.from(this.deals.values()).map(d => ({ ...d })); }
    listByBroker(brokerId) { return Array.from(this.deals.values()).filter(d => d.brokerId === brokerId).map(d => ({ ...d })); }

    calculateTotalCommission(brokerId) {
        return this.listByBroker(brokerId).reduce((s, d) => s + d.commission, 0);
    }

    adjustRating(brokerId, delta) {
        const broker = this.brokers.get(brokerId);
        if (!broker) return { success: false, error: 'BROKER_NOT_FOUND' };
        broker.rating = Math.max(0, Math.min(5, broker.rating + delta));
        this._triggerHook('ratingAdjusted', { brokerId, newRating: broker.rating });
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
        if (this.stats.totalDeals < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBrokers += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { brokers: Array.from(this.brokers.entries()), deals: Array.from(this.deals.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.brokers) this.brokers = new Map(data.brokers);
        if (data.deals) this.deals = new Map(data.deals);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, brokerCount: this.brokers.size }; }
}