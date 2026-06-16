/**
 * CultivationBattleSaint.js - 修真战圣
 * V637 Iteration 20/30 Round 26
 */
export class CultivationBattleSaint {
    constructor(config = {}) {
        this.config = { maxBattleSaints: config.maxBattleSaints || 20, baseAura: config.baseAura || 20, ...config };
        this.battleSaints = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBattleSaints: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBattleSaint', (ctx) => this.getBattleSaint(ctx.saintId));
        this.registerTool('recruitBattleSaint', (ctx) => this.recruitBattleSaint(ctx));
    }

    recruitBattleSaint(data) {
        const id = data.saintId || `snt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const saint = {
            saintId: id,
            masterId: data.masterId,
            name: data.name || 'Anonymous Saint',
            type: data.type || 'warrior',
            aura: data.aura || this.config.baseAura,
            techniques: data.techniques || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.battleSaints.set(id, saint);
        this.stats.totalBattleSaints++;
        this._triggerHook('battleSaintRecruited', { saintId: id });
        return { success: true, saint };
    }

    getBattleSaint(id) { return this.battleSaints.get(id) ? { ...this.battleSaints.get(id) } : null; }
    listBattleSaints() { return Array.from(this.battleSaints.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.battleSaints.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.battleSaints.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addTechnique(saintId, technique) {
        const saint = this.battleSaints.get(saintId);
        if (!saint) return { success: false, error: 'SAINT_NOT_FOUND' };
        saint.techniques.push(technique);
        this._triggerHook('techniqueAdded', { saintId, technique });
        return { success: true };
    }

    intensifyAura(saintId, amount = 5) {
        const saint = this.battleSaints.get(saintId);
        if (!saint) return { success: false, error: 'SAINT_NOT_FOUND' };
        saint.aura += amount;
        this._triggerHook('auraIntensified', { saintId, newAura: saint.aura });
        return { success: true };
    }

    levelUpBattleSaint(saintId) {
        const saint = this.battleSaints.get(saintId);
        if (!saint) return { success: false, error: 'SAINT_NOT_FOUND' };
        saint.level++;
        if (saint.level >= 5 && saint.status === 'novice') {
            saint.status = 'veteran';
        }
        this._triggerHook('battleSaintLeveledUp', { saintId, newLevel: saint.level });
        return { success: true };
    }

    legendBattleSaint(saintId) {
        const saint = this.battleSaints.get(saintId);
        if (!saint) return { success: false, error: 'SAINT_NOT_FOUND' };
        saint.status = 'legendary';
        this._triggerHook('battleSaintLegendized', { saintId });
        return { success: true };
    }

    calculateBattleSaintValue(saintId) {
        const saint = this.battleSaints.get(saintId);
        if (!saint) return 0;
        return saint.level * 100 + saint.aura * 2 + saint.techniques.length * 30;
    }

    listVeterans() { return Array.from(this.battleSaints.values()).filter(s => s.status === 'veteran').map(s => ({ ...s })); }

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
        if (this.stats.totalBattleSaints < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBattleSaints += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { battleSaints: Array.from(this.battleSaints.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.battleSaints) this.battleSaints = new Map(data.battleSaints);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, battleSaintCount: this.battleSaints.size }; }
}
