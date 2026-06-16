/**
 * CultivationChronos.js - 修真时间
 * V827 Iteration 30/30 FINAL Round 32
 */
export class CultivationChronos {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, maxChronos: config.maxChronos || 30, baseEternity: config.baseEternity || 20, ...config };
        this.chronos = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalFlowed: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getChronos', (ctx) => this.getChronos(ctx.chronosId));
        this.registerTool('listByEpoch', (ctx) => this.listByEpoch(ctx.epoch));
    }

    flowChronos(data) {
        const id = data.id || `chronos_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const chronos = {
            chronosId: id, masterId: data.masterId || 'unknown', name: data.name || 'Unnamed Chronos',
            type: data.type || 'linear', epoch: data.epoch || 'present',
            eternity: data.eternity || this.config.baseEternity, moments: data.moments || [],
            level: data.level || 1, status: 'novice',
            flowedAt: Date.now(), lastFlow: Date.now()
        };
        this.chronos.set(id, chronos);
        this.stats.totalFlowed++;
        this._triggerHook('chronosFlowed', { chronosId: id });
        return { success: true, chronos };
    }

    getChronos(id) { return this.chronos.get(id) ? { ...this.chronos.get(id) } : null; }
    listChronoses() { return Array.from(this.chronos.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.chronos.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listByEpoch(epoch) { return Array.from(this.chronos.values()).filter(c => c.epoch === epoch).map(c => ({ ...c })); }
    listByType(type) { return Array.from(this.chronos.values()).filter(c => c.type === type).map(c => ({ ...c })); }
    listVeteran() { return Array.from(this.chronos.values()).filter(c => c.status === 'veteran' || c.status === 'legendary').map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.chronos.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }
    listTop(n = 10) { return [...this.listChronoses()].sort((a, b) => b.level - a.level).slice(0, n); }

    addMoment(chronosId, moment) {
        const chronos = this.chronos.get(chronosId);
        if (!chronos) return { success: false, error: 'CHRONOS_NOT_FOUND' };
        chronos.moments.push(moment);
        this._triggerHook('momentAdded', { chronosId });
        return { success: true };
    }

    raiseEternity(chronosId, amount = 5) {
        const chronos = this.chronos.get(chronosId);
        if (!chronos) return { success: false, error: 'CHRONOS_NOT_FOUND' };
        chronos.eternity = Math.max(0, chronos.eternity + amount);
        this._triggerHook('eternityRaised', { chronosId });
        return { success: true };
    }

    promoteChronos(chronosId) {
        const chronos = this.chronos.get(chronosId);
        if (!chronos) return { success: false, error: 'CHRONOS_NOT_FOUND' };
        chronos.level++;
        this._triggerHook('chronosPromoted', { chronosId });
        return { success: true };
    }

    veteranizeChronos(chronosId) {
        const chronos = this.chronos.get(chronosId);
        if (!chronos) return { success: false, error: 'CHRONOS_NOT_FOUND' };
        chronos.status = 'veteran';
        this._triggerHook('chronosVeteranized', { chronosId });
        return { success: true };
    }

    legendizeChronos(chronosId) {
        const chronos = this.chronos.get(chronosId);
        if (!chronos) return { success: false, error: 'CHRONOS_NOT_FOUND' };
        chronos.status = 'legendary';
        this._triggerHook('chronosLegendized', { chronosId });
        return { success: true };
    }

    changeType(chronosId, newType) {
        const chronos = this.chronos.get(chronosId);
        if (!chronos) return { success: false, error: 'CHRONOS_NOT_FOUND' };
        chronos.type = newType;
        this._triggerHook('typeChanged', { chronosId });
        return { success: true };
    }

    changeEpoch(chronosId, newEpoch) {
        const chronos = this.chronos.get(chronosId);
        if (!chronos) return { success: false, error: 'CHRONOS_NOT_FOUND' };
        chronos.epoch = newEpoch;
        this._triggerHook('epochChanged', { chronosId });
        return { success: true };
    }

    tickChronos(chronosId) {
        const chronos = this.chronos.get(chronosId);
        if (!chronos) return { success: false, error: 'CHRONOS_NOT_FOUND' };
        chronos.lastFlow = Date.now();
        this._triggerHook('chronosTicked', { chronosId });
        return { success: true };
    }

    calculateChronosValue(chronosId) {
        const chronos = this.chronos.get(chronosId);
        if (!chronos) return 0;
        return chronos.level * 100 + chronos.eternity * 2 + chronos.moments.length * 30;
    }

    mergeChronoses(chronosId, otherChronosId) {
        const chronos = this.chronos.get(chronosId);
        const other = this.chronos.get(otherChronosId);
        if (!chronos || !other) return { success: false, error: 'CHRONOS_NOT_FOUND' };
        chronos.eternity = Math.max(chronos.eternity, other.eternity);
        chronos.moments = [...chronos.moments, ...other.moments];
        this.chronos.delete(otherChronosId);
        this._triggerHook('chronosesMerged', { chronosId, otherChronosId });
        return { success: true };
    }

    deleteChronos(chronosId) {
        if (!this.chronos.has(chronosId)) return { success: false, error: 'CHRONOS_NOT_FOUND' };
        this.chronos.delete(chronosId);
        this._triggerHook('chronosDeleted', { chronosId });
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
        if (this.stats.totalFlowed < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { chronos: Array.from(this.chronos.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.chronos) this.chronos = new Map(data.chronos);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, chronosCount: this.chronos.size }; }
}