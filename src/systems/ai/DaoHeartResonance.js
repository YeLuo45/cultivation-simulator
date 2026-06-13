/**
 * DaoHeartResonance.js - 道心共鸣系统
 * V311 Iteration 8/9 - Dao Heart Resonance
 */
export class DaoHeartResonance {
    constructor(config = {}) {
        this.config = {
            maxResonanceLevel: config.maxResonanceLevel || 100,
            harmonyThreshold: config.harmonyThreshold || 70,
            ...config
        };
        this.daoHearts = new Map();
        this.resonanceEvents = new Map();
        this.history = [];
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalResonances: 0, totalHarmonies: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDaoHeart', (ctx) => this.getDaoHeart(ctx.cultivatorId));
        this.registerTool('calculateResonance', (ctx) => this.calculateResonance(ctx.cultivatorA, ctx.cultivatorB));
    }

    registerDaoHeart(data) {
        const id = data.id || `dh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const heart = {
            id, ownerId: data.ownerId || id, purity: data.purity || 0.5,
            steadfastness: data.steadfastness || 0.5, wisdom: data.wisdom || 0.5,
            compassion: data.compassion || 0.5, daoPath: data.daoPath || 'balanced',
            history: []
        };
        this.daoHearts.set(id, heart);
        return { success: true, heart };
    }

    getDaoHeart(id) { const h = this.daoHearts.get(id); return h ? { ...h } : null; }
    listDaoHearts() { return Array.from(this.daoHearts.values()).map(h => ({ ...h })); }

    cultivateHeart(id, attribute, amount) {
        const heart = this.daoHearts.get(id);
        if (!heart) return { success: false, error: 'HEART_NOT_FOUND' };
        if (!['purity', 'steadfastness', 'wisdom', 'compassion'].includes(attribute)) {
            return { success: false, error: 'INVALID_ATTRIBUTE' };
        }
        heart[attribute] = Math.max(0, Math.min(1, heart[attribute] + amount));
        heart.history.push({ attribute, amount, timestamp: Date.now() });
        this._triggerHook('heartCultivated', { id, attribute, amount });
        return { success: true, heart: { ...heart } };
    }

    calculateResonance(idA, idB) {
        const a = this.daoHearts.get(idA);
        const b = this.daoHearts.get(idB);
        if (!a || !b) return { success: false, error: 'HEART_NOT_FOUND' };
        const resonance = (
            (a.purity + b.purity) / 2 * 25 +
            (a.steadfastness + b.steadfastness) / 2 * 25 +
            (a.wisdom + b.wisdom) / 2 * 25 +
            (a.compassion + b.compassion) / 2 * 25
        );
        const pathMatch = a.daoPath === b.daoPath ? 1 : 0.5;
        const final = Math.round(resonance * pathMatch);
        return { success: true, resonance: final, pathMatch: a.daoPath === b.daoPath };
    }

    induceResonance(idA, idB) {
        const calc = this.calculateResonance(idA, idB);
        if (!calc.success) return calc;
        const id = `res_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const event = {
            id, cultivatorA: idA, cultivatorB: idB, level: calc.resonance,
            timestamp: Date.now()
        };
        this.resonanceEvents.set(id, event);
        this.history.push(event);
        this.stats.totalResonances++;
        if (calc.resonance >= this.config.harmonyThreshold) {
            this.stats.totalHarmonies++;
            this._triggerHook('harmonyAchieved', { id, level: calc.resonance });
        }
        this._triggerHook('resonanceInduced', event);
        return { success: true, event };
    }

    getResonanceEvent(id) { const e = this.resonanceEvents.get(id); return e ? { ...e } : null; }
    listResonanceEvents(filter = {}) {
        const all = Array.from(this.resonanceEvents.values());
        if (filter.minLevel !== undefined) return all.filter(e => e.level >= filter.minLevel);
        return all;
    }

    getResonanceHistory() { return [...this.history]; }

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
        if (this.stats.totalResonances < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.harmonyThreshold = Math.max(50, this.config.harmonyThreshold - 5);
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() {
        return { daoHearts: Array.from(this.daoHearts.entries()), resonanceEvents: Array.from(this.resonanceEvents.entries()), history: this.history, stats: this.stats, config: this.config };
    }
    fromJSON(data) {
        if (data.daoHearts) this.daoHearts = new Map(data.daoHearts);
        if (data.resonanceEvents) this.resonanceEvents = new Map(data.resonanceEvents);
        if (data.history) this.history = data.history;
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, heartCount: this.daoHearts.size, eventCount: this.resonanceEvents.size }; }
}