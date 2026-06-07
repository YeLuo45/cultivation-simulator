/**
 * CultivationStance.js - 修真架势
 * V695 Iteration 18/30 Round 28 - Cultivation Stance
 */
export class CultivationStance {
    constructor(config = {}) {
        this.config = { maxStances: config.maxStances || 20, baseStability: config.baseStability || 20, ...config };
        this.stances = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalStances: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getStance', (ctx) => this.getStance(ctx.stanceId));
        this.registerTool('recruitStance', (ctx) => this.recruitStance(ctx));
    }

    recruitStance(data) {
        const id = data.id || `stn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const stance = {
            stanceId: id,
            masterId: data.masterId,
            name: data.name || 'unnamed-stance',
            type: data.type || 'horse',
            stability: data.stability || this.config.baseStability,
            transitions: data.transitions || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.stances.set(id, stance);
        this.stats.totalStances++;
        this._triggerHook('stanceRecruited', { stanceId: id });
        return { success: true, stance };
    }

    getStance(id) { return this.stances.get(id) ? { ...this.stances.get(id) } : null; }
    listStances() { return Array.from(this.stances.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.stances.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.stances.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addTransition(stanceId, transition) {
        const stance = this.stances.get(stanceId);
        if (!stance) return { success: false, error: 'STANCE_NOT_FOUND' };
        stance.transitions.push(transition);
        this._triggerHook('transitionAdded', { stanceId, transition });
        return { success: true };
    }

    strengthenStability(stanceId, amount = 5) {
        const stance = this.stances.get(stanceId);
        if (!stance) return { success: false, error: 'STANCE_NOT_FOUND' };
        stance.stability += amount;
        this._triggerHook('stabilityStrengthened', { stanceId, newStability: stance.stability });
        return { success: true };
    }

    levelUpStance(stanceId) {
        const stance = this.stances.get(stanceId);
        if (!stance) return { success: false, error: 'STANCE_NOT_FOUND' };
        stance.level++;
        if (stance.level >= 5) stance.status = 'veteran';
        this._triggerHook('stanceLeveledUp', { stanceId, newLevel: stance.level });
        return { success: true };
    }

    legendStance(stanceId) {
        const stance = this.stances.get(stanceId);
        if (!stance) return { success: false, error: 'STANCE_NOT_FOUND' };
        stance.status = 'legendary';
        this._triggerHook('stanceLegendized', { stanceId });
        return { success: true };
    }

    calculateStanceValue(stanceId) {
        const stance = this.stances.get(stanceId);
        if (!stance) return 0;
        return stance.level * 100 + stance.stability * 2 + stance.transitions.length * 30;
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
        if (this.stats.totalStances < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxStances += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { stances: Array.from(this.stances.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.stances) this.stances = new Map(data.stances);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, stanceCount: this.stances.size }; }
}
