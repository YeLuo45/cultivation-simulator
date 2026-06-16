/**
 * SectVisitor.js - 宗门访客
 * V497 Iteration 14/15 Round 19
 */
export class SectVisitor {
    constructor(config = {}) {
        this.config = { maxVisitors: config.maxVisitors || 100, baseIntent: config.baseIntent || 'unknown', ...config };
        this.visitors = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalVisitors: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getVisitor', (ctx) => this.getVisitor(ctx.visitorId));
        this.registerTool('welcomeVisitor', (ctx) => this.welcomeVisitor(ctx));
    }

    welcomeVisitor(data) {
        const id = data.id || `vis_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const visitor = { visitorId: id, sectId: data.sectId, name: data.name, origin: data.origin, intent: data.intent || this.config.baseIntent, gifts: [], status: 'welcomed', createdAt: Date.now() };
        this.visitors.set(id, visitor);
        this.stats.totalVisitors++;
        this._triggerHook('visitorWelcomed', { visitorId: id });
        return { success: true, visitor };
    }

    getVisitor(id) { return this.visitors.get(id) ? { ...this.visitors.get(id) } : null; }
    listVisitors() { return Array.from(this.visitors.values()).map(v => ({ ...v })); }
    listBySect(sectId) { return Array.from(this.visitors.values()).filter(v => v.sectId === sectId).map(v => ({ ...v })); }
    listWelcomed() { return Array.from(this.visitors.values()).filter(v => v.status === 'welcomed').map(v => ({ ...v })); }

    addGift(visitorId, gift) {
        const visitor = this.visitors.get(visitorId);
        if (!visitor) return { success: false, error: 'VISITOR_NOT_FOUND' };
        visitor.gifts.push(gift);
        this._triggerHook('giftAdded', { visitorId, gift });
        return { success: true };
    }

    rejectVisitor(visitorId) {
        const visitor = this.visitors.get(visitorId);
        if (!visitor) return { success: false, error: 'VISITOR_NOT_FOUND' };
        visitor.status = 'rejected';
        this._triggerHook('visitorRejected', { visitorId });
        return { success: true };
    }

    expelVisitor(visitorId) {
        const visitor = this.visitors.get(visitorId);
        if (!visitor) return { success: false, error: 'VISITOR_NOT_FOUND' };
        visitor.status = 'expelled';
        this._triggerHook('visitorExpelled', { visitorId });
        return { success: true };
    }

    calculateVisitorValue(visitorId) {
        const visitor = this.visitors.get(visitorId);
        if (!visitor) return 0;
        return visitor.gifts.length * 10 + (visitor.intent ? visitor.intent.length : 0);
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
        if (this.stats.totalVisitors < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxVisitors += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { visitors: Array.from(this.visitors.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.visitors) this.visitors = new Map(data.visitors);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, visitorCount: this.visitors.size }; }
}
