/**
 * CultivationMidnight.js - 修真子夜
 * V818 Iteration 21/30 Round 32
 */
export class CultivationMidnight {
    constructor(config = {}) {
        this.config = { maxMidnights: config.maxMidnights || 20, baseStillness: config.baseStillness || 20, ...config };
        this.midnights = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMidnights: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMidnight', (ctx) => this.getMidnight(ctx.midnightId));
        this.registerTool('recruitMidnight', (ctx) => this.recruitMidnight(ctx));
    }

    recruitMidnight(data = {}) {
        const id = data.midnightId || `mid_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const midnight = {
            midnightId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Midnight',
            type: data.type || 'dark',
            stillness: data.stillness !== undefined ? data.stillness : this.config.baseStillness,
            secrets: data.secrets ? [...data.secrets] : [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.midnights.set(id, midnight);
        this.stats.totalMidnights++;
        this._triggerHook('midnightRecruited', { midnightId: id });
        return { success: true, midnight };
    }

    getMidnight(id) { return this.midnights.get(id) ? { ...this.midnights.get(id), secrets: [...(this.midnights.get(id).secrets || [])] } : null; }
    listMidnights() { return Array.from(this.midnights.values()).map(m => ({ ...m, secrets: [...(m.secrets || [])] })); }
    listByMaster(masterId) { return Array.from(this.midnights.values()).filter(m => m.masterId === masterId).map(m => ({ ...m, secrets: [...(m.secrets || [])] })); }
    listLegendary() { return Array.from(this.midnights.values()).filter(m => m.status === 'legendary').map(m => ({ ...m, secrets: [...(m.secrets || [])] })); }

    addSecret(midnightId, secret) {
        const midnight = this.midnights.get(midnightId);
        if (!midnight) return { success: false, error: 'MIDNIGHT_NOT_FOUND' };
        midnight.secrets.push(secret);
        this._triggerHook('secretAdded', { midnightId, secret });
        return { success: true };
    }

    raiseStillness(midnightId, amount = 5) {
        const midnight = this.midnights.get(midnightId);
        if (!midnight) return { success: false, error: 'MIDNIGHT_NOT_FOUND' };
        midnight.stillness += amount;
        this._triggerHook('stillnessRaised', { midnightId, newStillness: midnight.stillness });
        return { success: true };
    }

    levelUpMidnight(midnightId) {
        const midnight = this.midnights.get(midnightId);
        if (!midnight) return { success: false, error: 'MIDNIGHT_NOT_FOUND' };
        midnight.level++;
        this._triggerHook('midnightLeveledUp', { midnightId, newLevel: midnight.level });
        return { success: true };
    }

    legendMidnight(midnightId) {
        const midnight = this.midnights.get(midnightId);
        if (!midnight) return { success: false, error: 'MIDNIGHT_NOT_FOUND' };
        midnight.status = 'legendary';
        this._triggerHook('midnightLegendized', { midnightId });
        return { success: true };
    }

    calculateMidnightValue(midnightId) {
        const midnight = this.midnights.get(midnightId);
        if (!midnight) return 0;
        return midnight.level * 100 + midnight.stillness * 2 + midnight.secrets.length * 30;
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
        if (this.stats.totalMidnights < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMidnights += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { midnights: Array.from(this.midnights.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.midnights) this.midnights = new Map(data.midnights);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, midnightCount: this.midnights.size }; }
}
