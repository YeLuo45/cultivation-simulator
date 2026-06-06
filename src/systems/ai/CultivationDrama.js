/**
 * CultivationDrama.js - 修真戏
 * V558 Iteration 1/20 Round 23
 */
export class CultivationDrama {
    constructor(config = {}) {
        this.config = { maxDramas: config.maxDramas || 50, baseDrama: config.baseDrama || 20, ...config };
        this.dramas = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDramas: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDrama', (ctx) => this.getDrama(ctx.dramaId));
        this.registerTool('stageDrama', (ctx) => this.stageDrama(ctx));
    }

    stageDrama(data) {
        const id = data.id || `drama_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const drama = { dramaId: id, directorId: data.directorId, name: data.name || 'Mystic Drama', type: data.type || 'tragedy', drama: data.drama !== undefined ? data.drama : this.config.baseDrama, scenes: data.scenes || [], level: 1, status: 'staged', createdAt: Date.now() };
        this.dramas.set(id, drama);
        this.stats.totalDramas++;
        this._triggerHook('dramaStaged', { dramaId: id });
        return { success: true, drama };
    }

    getDrama(id) { return this.dramas.get(id) ? { ...this.dramas.get(id) } : null; }
    listDramas() { return Array.from(this.dramas.values()).map(d => ({ ...d })); }
    listByDirector(directorId) { return Array.from(this.dramas.values()).filter(d => d.directorId === directorId).map(d => ({ ...d })); }
    listMasterpiece() { return Array.from(this.dramas.values()).filter(d => d.status === 'masterpiece').map(d => ({ ...d })); }

    addScene(dramaId, scene) {
        const drama = this.dramas.get(dramaId);
        if (!drama) return { success: false, error: 'DRAMA_NOT_FOUND' };
        drama.scenes.push(scene);
        this._triggerHook('sceneAdded', { dramaId, scene });
        return { success: true };
    }

    increaseDrama(dramaId, amount = 5) {
        const drama = this.dramas.get(dramaId);
        if (!drama) return { success: false, error: 'DRAMA_NOT_FOUND' };
        drama.drama += amount;
        this._triggerHook('dramaIncreased', { dramaId, amount, newDrama: drama.drama });
        return { success: true };
    }

    levelUpDrama(dramaId) {
        const drama = this.dramas.get(dramaId);
        if (!drama) return { success: false, error: 'DRAMA_NOT_FOUND' };
        drama.level++;
        this._triggerHook('dramaLeveledUp', { dramaId, newLevel: drama.level });
        return { success: true };
    }

    masterDrama(dramaId) {
        const drama = this.dramas.get(dramaId);
        if (!drama) return { success: false, error: 'DRAMA_NOT_FOUND' };
        drama.status = 'masterpiece';
        this._triggerHook('dramaMastered', { dramaId });
        return { success: true };
    }

    calculateDramaValue(dramaId) {
        const drama = this.dramas.get(dramaId);
        if (!drama) return 0;
        return drama.level * 100 + drama.drama * 2 + drama.scenes.length * 30;
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
        if (this.stats.totalDramas < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDramas += 25;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { dramas: Array.from(this.dramas.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.dramas) this.dramas = new Map(data.dramas);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, dramaCount: this.dramas.size }; }
}
