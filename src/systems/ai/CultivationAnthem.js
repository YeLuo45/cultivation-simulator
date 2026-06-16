/**
 * CultivationAnthem.js - 修真圣歌系统
 * V777 Iteration 10/30 Round 31
 */
export class CultivationAnthem {
    constructor(config = {}) {
        this.config = { maxAnthems: config.maxAnthems || 20, baseGrandeur: config.baseGrandeur || 20, ...config };
        this.anthems = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalAnthems: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getAnthem', (ctx) => this.getAnthem(ctx.anthemId));
        this.registerTool('recruitAnthem', (ctx) => this.recruitAnthem(ctx));
    }

    recruitAnthem(data) {
        const id = data.anthemId || `anthem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const anthem = { anthemId: id, masterId: data.masterId, name: data.name || 'Mystic Anthem', type: data.type || 'divine', grandeur: data.grandeur || this.config.baseGrandeur, choruses: data.choruses || [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.anthems.set(id, anthem);
        this.stats.totalAnthems++;
        this._triggerHook('anthemRecruited', { anthemId: id });
        return { success: true, anthem };
    }

    getAnthem(id) { return this.anthems.get(id) ? { ...this.anthems.get(id) } : null; }
    listAnthems() { return Array.from(this.anthems.values()).map(a => ({ ...a })); }
    listByMaster(masterId) { return Array.from(this.anthems.values()).filter(a => a.masterId === masterId).map(a => ({ ...a })); }
    listLegendary() { return Array.from(this.anthems.values()).filter(a => a.status === 'legendary').map(a => ({ ...a })); }

    addChorus(anthemId, chorus) {
        const anthem = this.anthems.get(anthemId);
        if (!anthem) return { success: false, error: 'ANTHEM_NOT_FOUND' };
        anthem.choruses.push(chorus);
        this._triggerHook('chorusAdded', { anthemId, chorus });
        return { success: true };
    }

    raiseGrandeur(anthemId, amount = 5) {
        const anthem = this.anthems.get(anthemId);
        if (!anthem) return { success: false, error: 'ANTHEM_NOT_FOUND' };
        anthem.grandeur += amount;
        this._triggerHook('grandeurRaised', { anthemId, newGrandeur: anthem.grandeur });
        return { success: true };
    }

    levelUpAnthem(anthemId) {
        const anthem = this.anthems.get(anthemId);
        if (!anthem) return { success: false, error: 'ANTHEM_NOT_FOUND' };
        anthem.level++;
        this._triggerHook('anthemLeveledUp', { anthemId, newLevel: anthem.level });
        return { success: true };
    }

    legendAnthem(anthemId) {
        const anthem = this.anthems.get(anthemId);
        if (!anthem) return { success: false, error: 'ANTHEM_NOT_FOUND' };
        anthem.status = 'legendary';
        this._triggerHook('anthemLegendized', { anthemId });
        return { success: true };
    }

    calculateAnthemValue(anthemId) {
        const anthem = this.anthems.get(anthemId);
        if (!anthem) return 0;
        return anthem.level * 100 + anthem.grandeur * 2 + anthem.choruses.length * 30;
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
        if (this.stats.totalAnthems < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxAnthems += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { anthems: Array.from(this.anthems.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.anthems) this.anthems = new Map(data.anthems);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, anthemCount: this.anthems.size }; }
}
