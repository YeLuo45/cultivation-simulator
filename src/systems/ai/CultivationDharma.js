/**
 * CultivationDharma.js - 修真法
 * V740 Iteration 3/30 Round 30
 */
export class CultivationDharma {
    constructor(config = {}) {
        this.config = { maxDharmas: config.maxDharmas || 20, basePurity: config.basePurity || 20, ...config };
        this.dharmas = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDharmas: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDharma', (ctx) => this.getDharma(ctx.dharmaId));
        this.registerTool('recruitDharma', (ctx) => this.recruitDharma(ctx));
    }

    recruitDharma(data) {
        const id = data.dharmaId || `dhm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const dharma = { dharmaId: id, masterId: data.masterId, name: data.name || 'Anonymous Dharma', type: data.type || 'righteous', purity: data.purity || this.config.basePurity, teachings: data.teachings || [], level: 1, status: 'novice', createdAt: Date.now() };
        this.dharmas.set(id, dharma);
        this.stats.totalDharmas++;
        this._triggerHook('dharmaRecruited', { dharmaId: id });
        return { success: true, dharma };
    }

    getDharma(id) { return this.dharmas.get(id) ? { ...this.dharmas.get(id) } : null; }
    listDharmas() { return Array.from(this.dharmas.values()).map(d => ({ ...d })); }
    listByMaster(masterId) { return Array.from(this.dharmas.values()).filter(d => d.masterId === masterId).map(d => ({ ...d })); }
    listLegendary() { return Array.from(this.dharmas.values()).filter(d => d.status === 'legendary').map(d => ({ ...d })); }

    addTeaching(dharmaId, teaching) {
        const dharma = this.dharmas.get(dharmaId);
        if (!dharma) return { success: false, error: 'DHARMA_NOT_FOUND' };
        dharma.teachings.push(teaching);
        this._triggerHook('teachingAdded', { dharmaId, teaching });
        return { success: true };
    }

    raisePurity(dharmaId, amount = 5) {
        const dharma = this.dharmas.get(dharmaId);
        if (!dharma) return { success: false, error: 'DHARMA_NOT_FOUND' };
        dharma.purity += amount;
        this._triggerHook('purityRaised', { dharmaId, amount: dharma.purity });
        return { success: true };
    }

    levelUpDharma(dharmaId) {
        const dharma = this.dharmas.get(dharmaId);
        if (!dharma) return { success: false, error: 'DHARMA_NOT_FOUND' };
        dharma.level++;
        this._triggerHook('dharmaLeveledUp', { dharmaId, newLevel: dharma.level });
        return { success: true };
    }

    legendDharma(dharmaId) {
        const dharma = this.dharmas.get(dharmaId);
        if (!dharma) return { success: false, error: 'DHARMA_NOT_FOUND' };
        dharma.status = 'legendary';
        this._triggerHook('dharmaLegendized', { dharmaId });
        return { success: true };
    }

    calculateDharmaValue(dharmaId) {
        const dharma = this.dharmas.get(dharmaId);
        if (!dharma) return 0;
        return dharma.level * 100 + dharma.purity * 2 + dharma.teachings.length * 30;
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
        if (this.stats.totalDharmas < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDharmas += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { dharmas: Array.from(this.dharmas.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.dharmas) this.dharmas = new Map(data.dharmas);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, dharmaCount: this.dharmas.size }; }
}
