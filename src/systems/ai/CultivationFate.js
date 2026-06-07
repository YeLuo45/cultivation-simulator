/**
 * CultivationFate.js - 修真命运
 * V738 Iteration 1/30 Round 30
 */
export class CultivationFate {
    constructor(config = {}) {
        this.config = { maxFates: config.maxFates || 20, baseInevitability: config.baseInevitability || 20, ...config };
        this.fates = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalFates: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getFate', (ctx) => this.getFate(ctx.fateId));
        this.registerTool('recruitFate', (ctx) => this.recruitFate(ctx));
    }

    recruitFate(data) {
        const id = data.id || `fate_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const fate = {
            fateId: id,
            masterId: data.masterId,
            name: data.name || 'unnamed',
            type: data.type || 'destined',
            inevitability: data.inevitability || this.config.baseInevitability,
            threads: data.threads || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.fates.set(id, fate);
        this.stats.totalFates++;
        this._triggerHook('fateRecruited', { fateId: id });
        return { success: true, fate };
    }

    getFate(id) { return this.fates.get(id) ? { ...this.fates.get(id) } : null; }
    listFates() { return Array.from(this.fates.values()).map(f => ({ ...f })); }
    listByMaster(masterId) { return Array.from(this.fates.values()).filter(f => f.masterId === masterId).map(f => ({ ...f })); }
    listLegendary() { return Array.from(this.fates.values()).filter(f => f.status === 'legendary').map(f => ({ ...f })); }

    addThread(fateId, thread) {
        const fate = this.fates.get(fateId);
        if (!fate) return { success: false, error: 'FATE_NOT_FOUND' };
        fate.threads.push(thread);
        if (fate.threads.length >= 3 && fate.status === 'novice') fate.status = 'veteran';
        this._triggerHook('threadAdded', { fateId, thread });
        return { success: true };
    }

    raiseInevitability(fateId, amount = 5) {
        const fate = this.fates.get(fateId);
        if (!fate) return { success: false, error: 'FATE_NOT_FOUND' };
        fate.inevitability += amount;
        this._triggerHook('inevitabilityRaised', { fateId, newInevitability: fate.inevitability });
        return { success: true };
    }

    levelUpFate(fateId) {
        const fate = this.fates.get(fateId);
        if (!fate) return { success: false, error: 'FATE_NOT_FOUND' };
        fate.level++;
        this._triggerHook('fateLeveledUp', { fateId, newLevel: fate.level });
        return { success: true };
    }

    legendFate(fateId) {
        const fate = this.fates.get(fateId);
        if (!fate) return { success: false, error: 'FATE_NOT_FOUND' };
        fate.status = 'legendary';
        this._triggerHook('fateLegendized', { fateId });
        return { success: true };
    }

    calculateFateValue(fateId) {
        const fate = this.fates.get(fateId);
        if (!fate) return 0;
        return fate.level * 100 + fate.inevitability * 2 + fate.threads.length * 30;
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
        if (this.stats.totalFates < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxFates += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { fates: Array.from(this.fates.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.fates) this.fates = new Map(data.fates);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, fateCount: this.fates.size }; }
}
