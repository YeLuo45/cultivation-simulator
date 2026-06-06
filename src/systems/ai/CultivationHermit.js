/**
 * CultivationHermit.js - 修真隐士
 * V653 Iteration 6/30 Round 27
 */
export class CultivationHermit {
    constructor(config = {}) {
        this.config = { maxHermits: config.maxHermits || 30, baseSolitude: config.baseSolitude || 20, ...config };
        this.hermits = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalHermits: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getHermit', (ctx) => this.getHermit(ctx.hermitId));
        this.registerTool('recruitHermit', (ctx) => this.recruitHermit(ctx));
    }

    recruitHermit(data) {
        const id = data.hermitId || `hmt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const hermit = {
            hermitId: id,
            hostId: data.hostId || null,
            name: data.name || 'Anonymous Hermit',
            type: data.type || 'mountain',
            solitude: data.solitude || this.config.baseSolitude,
            mantras: data.mantras || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.hermits.set(id, hermit);
        this.stats.totalHermits++;
        this._triggerHook('hermitRecruited', { hermitId: id });
        return { success: true, hermit };
    }

    getHermit(id) { return this.hermits.get(id) ? { ...this.hermits.get(id) } : null; }
    listHermits() { return Array.from(this.hermits.values()).map(h => ({ ...h })); }
    listByHermit(hostId) { return Array.from(this.hermits.values()).filter(h => h.hostId === hostId).map(h => ({ ...h })); }
    listLegendary() { return Array.from(this.hermits.values()).filter(h => h.status === 'legendary').map(h => ({ ...h })); }

    addMantra(hermitId, mantra) {
        const hermit = this.hermits.get(hermitId);
        if (!hermit) return { success: false, error: 'HERMIT_NOT_FOUND' };
        hermit.mantras.push(mantra);
        this._triggerHook('mantraAdded', { hermitId, mantra });
        return { success: true };
    }

    deepenSolitude(hermitId, amount = 5) {
        const hermit = this.hermits.get(hermitId);
        if (!hermit) return { success: false, error: 'HERMIT_NOT_FOUND' };
        hermit.solitude += amount;
        this._triggerHook('solitudeDeepened', { hermitId, newSolitude: hermit.solitude });
        return { success: true };
    }

    levelUpHermit(hermitId) {
        const hermit = this.hermits.get(hermitId);
        if (!hermit) return { success: false, error: 'HERMIT_NOT_FOUND' };
        hermit.level++;
        if (hermit.level >= 5 && hermit.status === 'novice') {
            hermit.status = 'veteran';
        }
        this._triggerHook('hermitLeveledUp', { hermitId, newLevel: hermit.level });
        return { success: true };
    }

    legendHermit(hermitId) {
        const hermit = this.hermits.get(hermitId);
        if (!hermit) return { success: false, error: 'HERMIT_NOT_FOUND' };
        hermit.status = 'legendary';
        this._triggerHook('hermitLegendized', { hermitId });
        return { success: true };
    }

    calculateHermitValue(hermitId) {
        const hermit = this.hermits.get(hermitId);
        if (!hermit) return 0;
        return hermit.level * 100 + hermit.solitude * 2 + hermit.mantras.length * 30;
    }

    listVeterans() { return Array.from(this.hermits.values()).filter(h => h.status === 'veteran').map(h => ({ ...h })); }

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
        if (this.stats.totalHermits < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxHermits += 15;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { hermits: Array.from(this.hermits.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.hermits) this.hermits = new Map(data.hermits);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, hermitCount: this.hermits.size }; }
}
