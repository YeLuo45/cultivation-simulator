/**
 * CultivationDruidess.js - 修真女德系统
 * V624 Iteration 7/30 Round 26
 */
export class CultivationDruidess {
    constructor(config = {}) {
        this.config = { maxDruidesses: config.maxDruidesses || 30, baseHarmony: config.baseHarmony || 20, ...config };
        this.druidesses = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDruidesses: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDruidess', (ctx) => this.getDruidess(ctx.druidessId));
        this.registerTool('recruitDruidess', (ctx) => this.recruitDruidess(ctx));
    }

    recruitDruidess(data) {
        const id = data.druidessId || `drs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const druidess = { druidessId: id, mentorId: data.mentorId, name: data.name || 'Mystic Druidess', type: data.type || 'forest', harmony: data.harmony || this.config.baseHarmony, companions: data.companions || [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.druidesses.set(id, druidess);
        this.stats.totalDruidesses++;
        this._triggerHook('druidessRecruited', { druidessId: id });
        return { success: true, druidess };
    }

    getDruidess(id) { return this.druidesses.get(id) ? { ...this.druidesses.get(id) } : null; }
    listDruidesses() { return Array.from(this.druidesses.values()).map(d => ({ ...d })); }
    listByMentor(mentorId) { return Array.from(this.druidesses.values()).filter(d => d.mentorId === mentorId).map(d => ({ ...d })); }
    listLegendary() { return Array.from(this.druidesses.values()).filter(d => d.status === 'legendary').map(d => ({ ...d })); }

    addCompanion(druidessId, companion) {
        const druidess = this.druidesses.get(druidessId);
        if (!druidess) return { success: false, error: 'DRUIDESS_NOT_FOUND' };
        druidess.companions.push(companion);
        this._triggerHook('companionAdded', { druidessId, companion });
        return { success: true };
    }

    deepenHarmony(druidessId, amount = 5) {
        const druidess = this.druidesses.get(druidessId);
        if (!druidess) return { success: false, error: 'DRUIDESS_NOT_FOUND' };
        druidess.harmony += amount;
        this._triggerHook('harmonyDeepened', { druidessId, newHarmony: druidess.harmony });
        return { success: true };
    }

    levelUpDruidess(druidessId) {
        const druidess = this.druidesses.get(druidessId);
        if (!druidess) return { success: false, error: 'DRUIDESS_NOT_FOUND' };
        druidess.level++;
        this._triggerHook('druidessLeveledUp', { druidessId, newLevel: druidess.level });
        return { success: true };
    }

    legendDruidess(druidessId) {
        const druidess = this.druidesses.get(druidessId);
        if (!druidess) return { success: false, error: 'DRUIDESS_NOT_FOUND' };
        druidess.status = 'legendary';
        this._triggerHook('druidessLegendized', { druidessId });
        return { success: true };
    }

    calculateDruidessValue(druidessId) {
        const druidess = this.druidesses.get(druidessId);
        if (!druidess) return 0;
        return druidess.level * 100 + druidess.harmony * 2 + druidess.companions.length * 30;
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
        if (this.stats.totalDruidesses < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDruidesses += 15;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { druidesses: Array.from(this.druidesses.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.druidesses) this.druidesses = new Map(data.druidesses);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, druidessCount: this.druidesses.size }; }
}
