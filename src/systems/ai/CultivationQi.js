/**
 * CultivationQi.js - 修真气系统
 * V723 Iteration 16/30 Round 29
 */
export class CultivationQi {
    constructor(config = {}) {
        this.config = { maxQis: config.maxQis || 30, basePotency: config.basePotency || 20, ...config };
        this.qis = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalQis: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getQi', (ctx) => this.getQi(ctx.qiId));
        this.registerTool('recruitQi', (ctx) => this.recruitQi(ctx));
    }

    recruitQi(data) {
        const id = data.qiId || `qi_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const qi = { qiId: id, masterId: data.masterId, name: data.name || 'Unnamed Qi', type: data.type || 'mixed', potency: data.potency || this.config.basePotency, channels: data.channels || [], level: 1, status: 'novice', createdAt: Date.now() };
        this.qis.set(id, qi);
        this.stats.totalQis++;
        this._triggerHook('qiRecruited', { qiId: id });
        return { success: true, qi };
    }

    getQi(id) { return this.qis.get(id) ? { ...this.qis.get(id) } : null; }
    listQis() { return Array.from(this.qis.values()).map(q => ({ ...q })); }
    listByMaster(masterId) { return Array.from(this.qis.values()).filter(q => q.masterId === masterId).map(q => ({ ...q })); }
    listLegendary() { return Array.from(this.qis.values()).filter(q => q.status === 'legendary').map(q => ({ ...q })); }

    addChannel(qiId, channel) {
        const qi = this.qis.get(qiId);
        if (!qi) return { success: false, error: 'QI_NOT_FOUND' };
        qi.channels.push(channel);
        this._triggerHook('channelAdded', { qiId, channel, channelCount: qi.channels.length });
        return { success: true };
    }

    raisePotency(qiId, amount = 5) {
        const qi = this.qis.get(qiId);
        if (!qi) return { success: false, error: 'QI_NOT_FOUND' };
        qi.potency += amount;
        this._triggerHook('potencyRaised', { qiId, newPotency: qi.potency });
        return { success: true };
    }

    levelUpQi(qiId) {
        const qi = this.qis.get(qiId);
        if (!qi) return { success: false, error: 'QI_NOT_FOUND' };
        qi.level++;
        this._triggerHook('qiLeveledUp', { qiId, newLevel: qi.level });
        return { success: true };
    }

    legendQi(qiId) {
        const qi = this.qis.get(qiId);
        if (!qi) return { success: false, error: 'QI_NOT_FOUND' };
        qi.status = 'legendary';
        this._triggerHook('qiLegendized', { qiId });
        return { success: true };
    }

    calculateQiValue(qiId) {
        const qi = this.qis.get(qiId);
        if (!qi) return 0;
        return qi.level * 100 + qi.potency * 2 + qi.channels.length * 30;
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
        if (this.stats.totalQis < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxQis += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { qis: Array.from(this.qis.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.qis) this.qis = new Map(data.qis);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, qiCount: this.qis.size }; }
}
