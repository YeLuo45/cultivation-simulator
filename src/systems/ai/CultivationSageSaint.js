/**
 * CultivationSageSaint.js - 修真圣贤
 * V657 Iteration 10/30 Round 27 - Cultivation Sage Saint
 */
export class CultivationSageSaint {
    constructor(config = {}) {
        this.config = { maxSageSaints: config.maxSageSaints || 20, baseWisdom: config.baseWisdom || 20, ...config };
        this.sageSaints = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSageSaints: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSageSaint', (ctx) => this.getSageSaint(ctx.saintId));
        this.registerTool('recruitSageSaint', (ctx) => this.recruitSageSaint(ctx));
    }

    recruitSageSaint(data) {
        const id = data.saintId || `st_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const sageSaint = {
            saintId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Sage Saint',
            type: data.type || 'philosophy',
            wisdom: data.wisdom || this.config.baseWisdom,
            teachings: data.teachings || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.sageSaints.set(id, sageSaint);
        this.stats.totalSageSaints++;
        this._triggerHook('sageSaintRecruited', { saintId: id });
        return { success: true, sageSaint };
    }

    getSageSaint(id) { return this.sageSaints.get(id) ? { ...this.sageSaints.get(id) } : null; }
    listSageSaints() { return Array.from(this.sageSaints.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.sageSaints.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.sageSaints.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addTeaching(saintId, teaching) {
        const sageSaint = this.sageSaints.get(saintId);
        if (!sageSaint) return { success: false, error: 'SAINT_NOT_FOUND' };
        sageSaint.teachings.push(teaching);
        this._triggerHook('teachingAdded', { saintId, teaching });
        return { success: true };
    }

    deepenWisdom(saintId, amount = 5) {
        const sageSaint = this.sageSaints.get(saintId);
        if (!sageSaint) return { success: false, error: 'SAINT_NOT_FOUND' };
        sageSaint.wisdom += amount;
        this._triggerHook('wisdomDeepened', { saintId, newWisdom: sageSaint.wisdom });
        return { success: true };
    }

    levelUpSageSaint(saintId) {
        const sageSaint = this.sageSaints.get(saintId);
        if (!sageSaint) return { success: false, error: 'SAINT_NOT_FOUND' };
        sageSaint.level++;
        this._triggerHook('sageSaintLeveledUp', { saintId, newLevel: sageSaint.level });
        return { success: true };
    }

    legendSageSaint(saintId) {
        const sageSaint = this.sageSaints.get(saintId);
        if (!sageSaint) return { success: false, error: 'SAINT_NOT_FOUND' };
        sageSaint.status = 'legendary';
        this._triggerHook('sageSaintLegendized', { saintId });
        return { success: true };
    }

    calculateSageSaintValue(saintId) {
        const sageSaint = this.sageSaints.get(saintId);
        if (!sageSaint) return 0;
        return sageSaint.level * 100 + sageSaint.wisdom * 2 + sageSaint.teachings.length * 30;
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
        if (this.stats.totalSageSaints < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSageSaints += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { sageSaints: Array.from(this.sageSaints.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.sageSaints) this.sageSaints = new Map(data.sageSaints);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, sageSaintCount: this.sageSaints.size }; }
}
