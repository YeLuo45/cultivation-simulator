/**
 * CultivationMirage.js - 修真海市蜃楼系统
 * V770 Iteration 3/30 Round 31
 */
export class CultivationMirage {
    constructor(config = {}) {
        this.config = { maxMirages: config.maxMirages || 20, baseDepth: config.baseDepth || 20, ...config };
        this.mirages = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMirages: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMirage', (ctx) => this.getMirage(ctx.mirageId));
        this.registerTool('recruitMirage', (ctx) => this.recruitMirage(ctx));
    }

    recruitMirage(data) {
        const id = data.mirageId || `mir_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const mirage = {
            mirageId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Mirage',
            type: data.type || 'desert',
            depth: data.depth || this.config.baseDepth,
            illusions: data.illusions || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.mirages.set(id, mirage);
        this.stats.totalMirages++;
        this._triggerHook('mirageRecruited', { mirageId: id });
        return { success: true, mirage };
    }

    getMirage(id) { return this.mirages.get(id) ? { ...this.mirages.get(id) } : null; }
    listMirages() { return Array.from(this.mirages.values()).map(m => ({ ...m })); }
    listByMaster(masterId) { return Array.from(this.mirages.values()).filter(m => m.masterId === masterId).map(m => ({ ...m })); }
    listLegendary() { return Array.from(this.mirages.values()).filter(m => m.status === 'legendary').map(m => ({ ...m })); }

    addIllusion(mirageId, illusion) {
        const mirage = this.mirages.get(mirageId);
        if (!mirage) return { success: false, error: 'MIRAGE_NOT_FOUND' };
        mirage.illusions.push(illusion);
        this._triggerHook('illusionAdded', { mirageId, illusion });
        return { success: true };
    }

    raiseDepth(mirageId, amount = 5) {
        const mirage = this.mirages.get(mirageId);
        if (!mirage) return { success: false, error: 'MIRAGE_NOT_FOUND' };
        mirage.depth += amount;
        this._triggerHook('depthRaised', { mirageId, newDepth: mirage.depth });
        return { success: true };
    }

    levelUpMirage(mirageId) {
        const mirage = this.mirages.get(mirageId);
        if (!mirage) return { success: false, error: 'MIRAGE_NOT_FOUND' };
        mirage.level++;
        this._triggerHook('mirageLeveledUp', { mirageId, newLevel: mirage.level });
        return { success: true };
    }

    legendMirage(mirageId) {
        const mirage = this.mirages.get(mirageId);
        if (!mirage) return { success: false, error: 'MIRAGE_NOT_FOUND' };
        mirage.status = 'legendary';
        this._triggerHook('mirageLegendized', { mirageId });
        return { success: true };
    }

    calculateMirageValue(mirageId) {
        const mirage = this.mirages.get(mirageId);
        if (!mirage) return 0;
        return mirage.level * 100 + mirage.depth * 2 + mirage.illusions.length * 30;
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
        if (this.stats.totalMirages < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMirages += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { mirages: Array.from(this.mirages.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.mirages) this.mirages = new Map(data.mirages);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, mirageCount: this.mirages.size }; }
}
