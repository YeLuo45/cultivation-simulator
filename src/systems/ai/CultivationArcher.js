/**
 * CultivationArcher.js - 修真弓手
 * V600 Iteration 3/20 Round 25
 */
export class CultivationArcher {
    constructor(config = {}) {
        this.config = { maxArchers: config.maxArchers || 50, baseAccuracy: config.baseAccuracy || 70, ...config };
        this.archers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalArchers: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getArcher', (ctx) => this.getArcher(ctx.archerId));
        this.registerTool('recruitArcher', (ctx) => this.recruitArcher(ctx));
    }

    recruitArcher(data) {
        const id = data.id || `arc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const archer = {
            archerId: id,
            trainerId: data.trainerId,
            name: data.name || 'Archer',
            type: data.type || 'longbow',
            accuracy: data.accuracy || this.config.baseAccuracy,
            arrows: data.arrows || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.archers.set(id, archer);
        this.stats.totalArchers++;
        this._triggerHook('archerRecruited', { archerId: id });
        return { success: true, archer };
    }

    getArcher(id) { return this.archers.get(id) ? { ...this.archers.get(id) } : null; }
    listArchers() { return Array.from(this.archers.values()).map(a => ({ ...a })); }
    listByTrainer(trainerId) { return Array.from(this.archers.values()).filter(a => a.trainerId === trainerId).map(a => ({ ...a })); }
    listLegendary() { return Array.from(this.archers.values()).filter(a => a.status === 'legendary').map(a => ({ ...a })); }

    addArrow(archerId, arrow) {
        const archer = this.archers.get(archerId);
        if (!archer) return { success: false, error: 'ARCHER_NOT_FOUND' };
        archer.arrows.push(arrow);
        this._triggerHook('arrowAdded', { archerId, arrow });
        return { success: true };
    }

    improveAccuracy(archerId, amount = 5) {
        const archer = this.archers.get(archerId);
        if (!archer) return { success: false, error: 'ARCHER_NOT_FOUND' };
        archer.accuracy += amount;
        this._triggerHook('accuracyImproved', { archerId, newAccuracy: archer.accuracy });
        return { success: true };
    }

    levelUpArcher(archerId) {
        const archer = this.archers.get(archerId);
        if (!archer) return { success: false, error: 'ARCHER_NOT_FOUND' };
        archer.level++;
        this._triggerHook('archerLeveledUp', { archerId, newLevel: archer.level });
        return { success: true };
    }

    legendArcher(archerId) {
        const archer = this.archers.get(archerId);
        if (!archer) return { success: false, error: 'ARCHER_NOT_FOUND' };
        archer.status = 'legendary';
        this._triggerHook('archerLegendized', { archerId });
        return { success: true };
    }

    calculateArcherValue(archerId) {
        const archer = this.archers.get(archerId);
        if (!archer) return 0;
        return archer.level * 100 + archer.accuracy * 2 + archer.arrows.length * 30;
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
        if (this.stats.totalArchers < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxArchers += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { archers: Array.from(this.archers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.archers) this.archers = new Map(data.archers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, archerCount: this.archers.size }; }
}
