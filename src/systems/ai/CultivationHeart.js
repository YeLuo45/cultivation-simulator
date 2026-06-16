/**
 * CultivationHeart.js - 道心系统
 * V520 Iteration 2/20 Round 21
 */
export class CultivationHeart {
    constructor(config = {}) {
        this.config = { maxHearts: config.maxHearts || 100, basePurity: config.basePurity || 30, ...config };
        this.hearts = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalHearts: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getHeart', (ctx) => this.getHeart(ctx.heartId));
        this.registerTool('awakenHeart', (ctx) => this.awakenHeart(ctx));
    }

    awakenHeart(data) {
        const id = data.id || `hrt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const heart = { heartId: id, cultivatorId: data.cultivatorId, name: data.name || '无名道心', dao: data.dao || [], purity: data.purity || this.config.basePurity, level: 1, status: 'awakened', createdAt: Date.now() };
        this.hearts.set(id, heart);
        this.stats.totalHearts++;
        this._triggerHook('heartAwakened', { heartId: id });
        return { success: true, heart };
    }

    getHeart(id) { return this.hearts.get(id) ? { ...this.hearts.get(id) } : null; }
    listHearts() { return Array.from(this.hearts.values()).map(h => ({ ...h })); }
    listByCultivator(cultivatorId) { return Array.from(this.hearts.values()).filter(h => h.cultivatorId === cultivatorId).map(h => ({ ...h })); }
    listAwakened() { return Array.from(this.hearts.values()).filter(h => h.status === 'awakened' || h.status === 'transcendent').map(h => ({ ...h })); }

    addDao(heartId, dao) {
        const heart = this.hearts.get(heartId);
        if (!heart) return { success: false, error: 'HEART_NOT_FOUND' };
        if (typeof dao === 'string' && !heart.dao.includes(dao)) heart.dao.push(dao);
        this._triggerHook('daoAdded', { heartId, dao });
        return { success: true };
    }

    increasePurity(heartId, amount = 5) {
        const heart = this.hearts.get(heartId);
        if (!heart) return { success: false, error: 'HEART_NOT_FOUND' };
        heart.purity += amount;
        this._triggerHook('purityIncreased', { heartId, newPurity: heart.purity });
        return { success: true };
    }

    levelUpHeart(heartId) {
        const heart = this.hearts.get(heartId);
        if (!heart) return { success: false, error: 'HEART_NOT_FOUND' };
        heart.level++;
        this._triggerHook('heartLeveledUp', { heartId, newLevel: heart.level });
        return { success: true };
    }

    transcendHeart(heartId) {
        const heart = this.hearts.get(heartId);
        if (!heart) return { success: false, error: 'HEART_NOT_FOUND' };
        heart.status = 'transcendent';
        this._triggerHook('heartTranscended', { heartId });
        return { success: true };
    }

    calculateHeartPower(heartId) {
        const heart = this.hearts.get(heartId);
        if (!heart) return 0;
        return heart.level * 100 + heart.purity * 2 + heart.dao.length * 50;
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
        if (this.stats.totalHearts < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxHearts += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { hearts: Array.from(this.hearts.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.hearts) this.hearts = new Map(data.hearts);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, heartCount: this.hearts.size }; }
}
