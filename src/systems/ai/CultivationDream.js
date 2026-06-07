/**
 * CultivationDream.js - 修真梦
 * V768 Iteration 1/30 Round 31 - Cultivation Dream
 */
export class CultivationDream {
    constructor(config = {}) {
        this.config = { maxDreams: config.maxDreams || 20, baseVividness: config.baseVividness || 20, ...config };
        this.dreams = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDreams: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDream', (ctx) => this.getDream(ctx.dreamId));
        this.registerTool('recruitDream', (ctx) => this.recruitDream(ctx));
    }

    recruitDream(data) {
        const id = data.id || `drm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const dream = {
            dreamId: id,
            masterId: data.masterId,
            name: data.name || 'Untitled Dream',
            type: data.type || 'lucid',
            vividness: data.vividness || this.config.baseVividness,
            visions: data.visions || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.dreams.set(id, dream);
        this.stats.totalDreams++;
        this._triggerHook('dreamRecruited', { dreamId: id });
        return { success: true, dream };
    }

    getDream(id) { return this.dreams.get(id) ? { ...this.dreams.get(id) } : null; }
    listDreams() { return Array.from(this.dreams.values()).map(d => ({ ...d })); }
    listByMaster(masterId) { return Array.from(this.dreams.values()).filter(d => d.masterId === masterId).map(d => ({ ...d })); }
    listLegendary() { return Array.from(this.dreams.values()).filter(d => d.status === 'legendary').map(d => ({ ...d })); }

    addVision(dreamId, vision) {
        const dream = this.dreams.get(dreamId);
        if (!dream) return { success: false, error: 'DREAM_NOT_FOUND' };
        dream.visions.push(vision);
        this._triggerHook('visionAdded', { dreamId, vision });
        return { success: true };
    }

    raiseVividness(dreamId, amount = 5) {
        const dream = this.dreams.get(dreamId);
        if (!dream) return { success: false, error: 'DREAM_NOT_FOUND' };
        dream.vividness += amount;
        if (dream.vividness >= 100) dream.status = 'veteran';
        this._triggerHook('vividnessRaised', { dreamId, newVividness: dream.vividness });
        return { success: true };
    }

    levelUpDream(dreamId) {
        const dream = this.dreams.get(dreamId);
        if (!dream) return { success: false, error: 'DREAM_NOT_FOUND' };
        dream.level++;
        this._triggerHook('dreamLeveledUp', { dreamId, newLevel: dream.level });
        return { success: true };
    }

    legendDream(dreamId) {
        const dream = this.dreams.get(dreamId);
        if (!dream) return { success: false, error: 'DREAM_NOT_FOUND' };
        dream.status = 'legendary';
        this._triggerHook('dreamLegendized', { dreamId });
        return { success: true };
    }

    calculateDreamValue(dreamId) {
        const dream = this.dreams.get(dreamId);
        if (!dream) return 0;
        return dream.level * 100 + dream.vividness * 2 + dream.visions.length * 30;
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
        if (this.stats.totalDreams < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDreams += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { dreams: Array.from(this.dreams.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.dreams) this.dreams = new Map(data.dreams);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, dreamCount: this.dreams.size }; }
}
