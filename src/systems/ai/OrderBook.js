/**
 * OrderBook.js - 订单簿
 * V381 Iteration 6/9 Round 11
 */
export class OrderBook {
    constructor(config = {}) {
        this.config = { maxOrders: config.maxOrders || 200, ...config };
        this.orders = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalOrders: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getOrder', (ctx) => this.getOrder(ctx.orderId));
        this.registerTool('placeOrder', (ctx) => this.placeOrder(ctx));
    }

    placeOrder(data) {
        const id = data.id || `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const order = { orderId: id, traderId: data.traderId, itemId: data.itemId, type: data.type || 'buy', price: data.price, quantity: data.quantity || 1, status: 'open', createdAt: Date.now() };
        this.orders.set(id, order);
        this.stats.totalOrders++;
        this._triggerHook('orderPlaced', { orderId: id });
        return { success: true, order };
    }

    getOrder(id) { return this.orders.get(id) ? { ...this.orders.get(id) } : null; }
    listOrders() { return Array.from(this.orders.values()).map(o => ({ ...o })); }
    listOpen() { return Array.from(this.orders.values()).filter(o => o.status === 'open').map(o => ({ ...o })); }
    listByType(type) { return Array.from(this.orders.values()).filter(o => o.type === type).map(o => ({ ...o })); }
    listByTrader(traderId) { return Array.from(this.orders.values()).filter(o => o.traderId === traderId).map(o => ({ ...o })); }
    listByItem(itemId) { return Array.from(this.orders.values()).filter(o => o.itemId === itemId).map(o => ({ ...o })); }

    cancelOrder(orderId) {
        const order = this.orders.get(orderId);
        if (!order) return { success: false, error: 'ORDER_NOT_FOUND' };
        if (order.status !== 'open') return { success: false, error: 'ORDER_INACTIVE' };
        order.status = 'cancelled';
        this._triggerHook('orderCancelled', { orderId });
        return { success: true };
    }

    fillOrder(orderId) {
        const order = this.orders.get(orderId);
        if (!order) return { success: false, error: 'ORDER_NOT_FOUND' };
        if (order.status !== 'open') return { success: false, error: 'ORDER_INACTIVE' };
        order.status = 'filled';
        this._triggerHook('orderFilled', { orderId });
        return { success: true };
    }

    findBestBid(itemId) {
        const bids = this.listByItem(itemId).filter(o => o.type === 'buy' && o.status === 'open').sort((a, b) => b.price - a.price);
        return bids.length > 0 ? bids[0].price : null;
    }

    findBestAsk(itemId) {
        const asks = this.listByItem(itemId).filter(o => o.type === 'sell' && o.status === 'open').sort((a, b) => a.price - b.price);
        return asks.length > 0 ? asks[0].price : null;
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
        if (this.stats.totalOrders < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxOrders += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { orders: Array.from(this.orders.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.orders) this.orders = new Map(data.orders);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, orderCount: this.orders.size }; }
}