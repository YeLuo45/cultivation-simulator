/**
 * CultivationMortal.js - 修真凡人
 * V668 Iteration 21/30 Round 27
 */
export class CultivationMortal {
    constructor(config = {}) {
        this.config = { maxMortals: config.maxMortals || 50, baseHealth: config.baseHealth || 20, ...config };
        this.mortals = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMortals: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMortal', (ctx) => this.getMortal(ctx.mortalId));
        this.registerTool('recruitMortal', (ctx) => this.recruitMortal(ctx));
    }

    recruitMortal(data) {
        const id = data.mortalId || `mrt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const mortal = {
            mortalId: id,
            parentId: data.parentId,
            name: data.name || 'Anonymous Mortal',
            type: data.type || 'common',
            health: data.health || this.config.baseHealth,
            lifespans: data.lifespans || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.mortals.set(id, mortal);
        this.stats.totalMortals++;
        this._triggerHook('mortalRecruited', { mortalId: id });
        return { success: true, mortal };
    }

    getMortal(id) { return this.mortals.get(id) ? { ...this.mortals.get(id) } : null; }
    listMortals() { return Array.from(this.mortals.values()).map(m => ({ ...m })); }
    listByParent(parentId) { return Array.from(this.mortals.values()).filter(m => m.parentId === parentId).map(m => ({ ...m })); }
    listLegendary() { return Array.from(this.mortals.values()).filter(m => m.status === 'legendary').map(m => ({ ...m })); }

    addLifespan(mortalId, lifespan) {
        const mortal = this.mortals.get(mortalId);
        if (!mortal) return { success: false, error: 'MORTAL_NOT_FOUND' };
        mortal.lifespans.push(lifespan);
        this._triggerHook('lifespanAdded', { mortalId, lifespan });
        return { success: true };
    }

    improveHealth(mortalId, amount = 5) {
        const mortal = this.mortals.get(mortalId);
        if (!mortal) return { success: false, error: 'MORTAL_NOT_FOUND' };
        mortal.health += amount;
        this._triggerHook('healthImproved', { mortalId, newHealth: mortal.health });
        return { success: true };
    }

    levelUpMortal(mortalId) {
        const mortal = this.mortals.get(mortalId);
        if (!mortal) return { success: false, error: 'MORTAL_NOT_FOUND' };
        mortal.level++;
        if (mortal.level >= 5 && mortal.status === 'novice') {
            mortal.status = 'veteran';
        }
        this._triggerHook('mortalLeveledUp', { mortalId, newLevel: mortal.level });
        return { success: true };
    }

    legendMortal(mortalId) {
        const mortal = this.mortals.get(mortalId);
        if (!mortal) return { success: false, error: 'MORTAL_NOT_FOUND' };
        mortal.status = 'legendary';
        this._triggerHook('mortalLegendized', { mortalId });
        return { success: true };
    }

    calculateMortalValue(mortalId) {
        const mortal = this.mortals.get(mortalId);
        if (!mortal) return 0;
        return mortal.level * 100 + mortal.health * 2 + mortal.lifespans.length * 30;
    }

    listVeterans() { return Array.from(this.mortals.values()).filter(m => m.status === 'veteran').map(m => ({ ...m })); }

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
        if (this.stats.totalMortals < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMortals += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { mortals: Array.from(this.mortals.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.mortals) this.mortals = new Map(data.mortals);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, mortalCount: this.mortals.size }; }
}
