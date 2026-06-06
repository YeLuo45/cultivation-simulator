/**
 * CultivationOrder.js - 修真秩序
 * V552 Iteration 15/20 Round 22
 */
export class CultivationOrder {
    constructor(config = {}) {
        this.config = { maxOrders: config.maxOrders || 30, baseStability: config.baseStability || 20, ...config };
        this.orders = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalOrders: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getOrder', (ctx) => this.getOrder(ctx.orderId));
        this.registerTool('openOrder', (ctx) => this.openOrder(ctx));
    }

    openOrder(data) {
        const id = data.id || `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const order = { orderId: id, founderId: data.founderId, name: data.name || '无名秩序', type: data.type || 'celestial', stability: data.stability || this.config.baseStability, members: data.members || [], level: 1, status: 'forming', createdAt: Date.now() };
        this.orders.set(id, order);
        this.stats.totalOrders++;
        this._triggerHook('orderOpened', { orderId: id });
        return { success: true, order };
    }

    getOrder(id) { return this.orders.get(id) ? { ...this.orders.get(id) } : null; }
    listOrders() { return Array.from(this.orders.values()).map(o => ({ ...o })); }
    listByFounder(founderId) { return Array.from(this.orders.values()).filter(o => o.founderId === founderId).map(o => ({ ...o })); }
    listStable() { return Array.from(this.orders.values()).filter(o => o.status === 'stable' || o.status === 'eternal').map(o => ({ ...o })); }

    addMember(orderId, member) {
        const order = this.orders.get(orderId);
        if (!order) return { success: false, error: 'ORDER_NOT_FOUND' };
        order.members.push(member);
        this._triggerHook('memberAdded', { orderId, member });
        return { success: true };
    }

    increaseStability(orderId, amount = 5) {
        const order = this.orders.get(orderId);
        if (!order) return { success: false, error: 'ORDER_NOT_FOUND' };
        order.stability += amount;
        if (order.stability >= 50 && order.status === 'forming') order.status = 'stable';
        this._triggerHook('stabilityIncreased', { orderId, amount, newStability: order.stability });
        return { success: true };
    }

    levelUpOrder(orderId) {
        const order = this.orders.get(orderId);
        if (!order) return { success: false, error: 'ORDER_NOT_FOUND' };
        order.level++;
        this._triggerHook('orderLeveledUp', { orderId, newLevel: order.level });
        return { success: true };
    }

    eternizeOrder(orderId) {
        const order = this.orders.get(orderId);
        if (!order) return { success: false, error: 'ORDER_NOT_FOUND' };
        order.status = 'eternal';
        this._triggerHook('orderEternalized', { orderId });
        return { success: true };
    }

    calculateOrderPower(orderId) {
        const order = this.orders.get(orderId);
        if (!order) return 0;
        return order.level * 100 + order.stability * 2 + order.members.length * 30;
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
        this.config.maxOrders += 20;
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
