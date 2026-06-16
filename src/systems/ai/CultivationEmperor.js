/**
 * CultivationEmperor.js - 修真皇帝系统
 * V730 Iteration 23/30 Round 29
 */
export class CultivationEmperor {
    constructor(config = {}) {
        this.config = { maxEmperors: config.maxEmperors || 5, baseMandate: config.baseMandate || 20, ...config };
        this.emperors = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEmperors: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getEmperor', (ctx) => this.getEmperor(ctx.emperorId));
        this.registerTool('recruitEmperor', (ctx) => this.recruitEmperor(ctx));
    }

    recruitEmperor(data) {
        const id = data.emperorId || `emperor_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const emperor = {
            emperorId: id,
            empireId: data.empireId,
            name: data.name,
            type: data.type || 'righteous',
            mandate: data.mandate || this.config.baseMandate,
            edicts: data.edicts || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.emperors.set(id, emperor);
        this.stats.totalEmperors++;
        this._triggerHook('emperorRecruited', { emperorId: id });
        return { success: true, emperor };
    }

    getEmperor(id) { return this.emperors.get(id) ? { ...this.emperors.get(id) } : null; }
    listEmperors() { return Array.from(this.emperors.values()).map(e => ({ ...e })); }
    listByEmpire(empireId) { return Array.from(this.emperors.values()).filter(e => e.empireId === empireId).map(e => ({ ...e })); }
    listLegendary() { return Array.from(this.emperors.values()).filter(e => e.status === 'legendary').map(e => ({ ...e })); }

    addEdict(emperorId, edict) {
        const emperor = this.emperors.get(emperorId);
        if (!emperor) return { success: false, error: 'EMPEROR_NOT_FOUND' };
        emperor.edicts.push(edict);
        this._triggerHook('edictAdded', { emperorId, edict });
        return { success: true };
    }

    raiseMandate(emperorId, amount = 5) {
        const emperor = this.emperors.get(emperorId);
        if (!emperor) return { success: false, error: 'EMPEROR_NOT_FOUND' };
        emperor.mandate += amount;
        this._triggerHook('mandateRaised', { emperorId, newMandate: emperor.mandate });
        return { success: true };
    }

    levelUpEmperor(emperorId) {
        const emperor = this.emperors.get(emperorId);
        if (!emperor) return { success: false, error: 'EMPEROR_NOT_FOUND' };
        emperor.level++;
        this._triggerHook('emperorLeveledUp', { emperorId, newLevel: emperor.level });
        return { success: true };
    }

    legendEmperor(emperorId) {
        const emperor = this.emperors.get(emperorId);
        if (!emperor) return { success: false, error: 'EMPEROR_NOT_FOUND' };
        emperor.status = 'legendary';
        this._triggerHook('emperorLegendized', { emperorId });
        return { success: true };
    }

    calculateEmperorValue(emperorId) {
        const emperor = this.emperors.get(emperorId);
        if (!emperor) return 0;
        return emperor.level * 100 + emperor.mandate * 2 + emperor.edicts.length * 30;
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
        if (this.stats.totalEmperors < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxEmperors += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { emperors: Array.from(this.emperors.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.emperors) this.emperors = new Map(data.emperors);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, emperorCount: this.emperors.size }; }
}
