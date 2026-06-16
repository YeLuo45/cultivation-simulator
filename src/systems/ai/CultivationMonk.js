/**
 * CultivationMonk.js - 修真武僧
 * V615 Iteration 18/20 Round 25
 */
export class CultivationMonk {
    constructor(config = {}) {
        this.config = { maxMonks: config.maxMonks || 50, baseDiscipline: config.baseDiscipline || 20, ...config };
        this.monks = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMonks: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMonk', (ctx) => this.getMonk(ctx.monkId));
        this.registerTool('recruitMonk', (ctx) => this.recruitMonk(ctx));
    }

    recruitMonk(data) {
        const id = data.monkId || `mnk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const monk = {
            monkId: id,
            abbotId: data.abbotId,
            name: data.name || 'Anonymous Monk',
            type: data.type || 'fist',
            discipline: data.discipline || this.config.baseDiscipline,
            mantras: data.mantras || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.monks.set(id, monk);
        this.stats.totalMonks++;
        this._triggerHook('monkRecruited', { monkId: id });
        return { success: true, monk };
    }

    getMonk(id) { return this.monks.get(id) ? { ...this.monks.get(id) } : null; }
    listMonks() { return Array.from(this.monks.values()).map(m => ({ ...m })); }
    listByAbbot(abbotId) { return Array.from(this.monks.values()).filter(m => m.abbotId === abbotId).map(m => ({ ...m })); }
    listLegendary() { return Array.from(this.monks.values()).filter(m => m.status === 'legendary').map(m => ({ ...m })); }

    addMantra(monkId, mantra) {
        const monk = this.monks.get(monkId);
        if (!monk) return { success: false, error: 'MONK_NOT_FOUND' };
        monk.mantras.push(mantra);
        this._triggerHook('mantraAdded', { monkId, mantra });
        return { success: true };
    }

    deepenDiscipline(monkId, amount = 5) {
        const monk = this.monks.get(monkId);
        if (!monk) return { success: false, error: 'MONK_NOT_FOUND' };
        monk.discipline += amount;
        this._triggerHook('disciplineDeepened', { monkId, newDiscipline: monk.discipline });
        return { success: true };
    }

    levelUpMonk(monkId) {
        const monk = this.monks.get(monkId);
        if (!monk) return { success: false, error: 'MONK_NOT_FOUND' };
        monk.level++;
        if (monk.level >= 5 && monk.status === 'novice') {
            monk.status = 'veteran';
        }
        this._triggerHook('monkLeveledUp', { monkId, newLevel: monk.level });
        return { success: true };
    }

    legendMonk(monkId) {
        const monk = this.monks.get(monkId);
        if (!monk) return { success: false, error: 'MONK_NOT_FOUND' };
        monk.status = 'legendary';
        this._triggerHook('monkLegendized', { monkId });
        return { success: true };
    }

    calculateMonkValue(monkId) {
        const monk = this.monks.get(monkId);
        if (!monk) return 0;
        return monk.level * 100 + monk.discipline * 2 + monk.mantras.length * 30;
    }

    listVeterans() { return Array.from(this.monks.values()).filter(m => m.status === 'veteran').map(m => ({ ...m })); }

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
        if (this.stats.totalMonks < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMonks += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { monks: Array.from(this.monks.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.monks) this.monks = new Map(data.monks);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, monkCount: this.monks.size }; }
}
