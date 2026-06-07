/**
 * CultivationReverie.js - 修真遐想
 * V797 Iteration 30/30 FINAL Round 31
 */
export class CultivationReverie {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, maxReveries: config.maxReveries || 30, baseImagination: config.baseImagination || 20, ...config };
        this.reveries = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDrifted: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getReverie', (ctx) => this.getReverie(ctx.reverieId));
        this.registerTool('listByMood', (ctx) => this.listByMood(ctx.mood));
    }

    driftReverie(data) {
        const id = data.id || `reverie_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const reverie = {
            reverieId: id, masterId: data.masterId || 'unknown', name: data.name || 'Unnamed Reverie',
            type: data.type || 'waking', mood: data.mood || 'serene', imagination: data.imagination || this.config.baseImagination,
            visions: data.visions || [], level: data.level || 1, status: 'novice',
            driftedAt: Date.now(), lastDrift: Date.now()
        };
        this.reveries.set(id, reverie);
        this.stats.totalDrifted++;
        this._triggerHook('reverieDrifted', { reverieId: id });
        return { success: true, reverie };
    }

    getReverie(id) { return this.reveries.get(id) ? { ...this.reveries.get(id) } : null; }
    listReveries() { return Array.from(this.reveries.values()).map(r => ({ ...r })); }
    listByMaster(masterId) { return Array.from(this.reveries.values()).filter(r => r.masterId === masterId).map(r => ({ ...r })); }
    listByMood(mood) { return Array.from(this.reveries.values()).filter(r => r.mood === mood).map(r => ({ ...r })); }
    listByType(type) { return Array.from(this.reveries.values()).filter(r => r.type === type).map(r => ({ ...r })); }
    listVeteran() { return Array.from(this.reveries.values()).filter(r => r.status === 'veteran' || r.status === 'legendary').map(r => ({ ...r })); }
    listLegendary() { return Array.from(this.reveries.values()).filter(r => r.status === 'legendary').map(r => ({ ...r })); }
    listTop(n = 10) { return [...this.listReveries()].sort((a, b) => b.level - a.level).slice(0, n); }

    addVision(reverieId, vision) {
        const reverie = this.reveries.get(reverieId);
        if (!reverie) return { success: false, error: 'REVERIE_NOT_FOUND' };
        reverie.visions.push(vision);
        this._triggerHook('visionAdded', { reverieId });
        return { success: true };
    }

    raiseImagination(reverieId, amount = 5) {
        const reverie = this.reveries.get(reverieId);
        if (!reverie) return { success: false, error: 'REVERIE_NOT_FOUND' };
        reverie.imagination = Math.max(0, reverie.imagination + amount);
        this._triggerHook('imaginationRaised', { reverieId });
        return { success: true };
    }

    promoteReverie(reverieId) {
        const reverie = this.reveries.get(reverieId);
        if (!reverie) return { success: false, error: 'REVERIE_NOT_FOUND' };
        reverie.level++;
        this._triggerHook('reveriePromoted', { reverieId });
        return { success: true };
    }

    veteranizeReverie(reverieId) {
        const reverie = this.reveries.get(reverieId);
        if (!reverie) return { success: false, error: 'REVERIE_NOT_FOUND' };
        reverie.status = 'veteran';
        this._triggerHook('reverieVeteranized', { reverieId });
        return { success: true };
    }

    legendizeReverie(reverieId) {
        const reverie = this.reveries.get(reverieId);
        if (!reverie) return { success: false, error: 'REVERIE_NOT_FOUND' };
        reverie.status = 'legendary';
        this._triggerHook('reverieLegendized', { reverieId });
        return { success: true };
    }

    changeType(reverieId, newType) {
        const reverie = this.reveries.get(reverieId);
        if (!reverie) return { success: false, error: 'REVERIE_NOT_FOUND' };
        reverie.type = newType;
        this._triggerHook('typeChanged', { reverieId });
        return { success: true };
    }

    changeMood(reverieId, newMood) {
        const reverie = this.reveries.get(reverieId);
        if (!reverie) return { success: false, error: 'REVERIE_NOT_FOUND' };
        reverie.mood = newMood;
        this._triggerHook('moodChanged', { reverieId });
        return { success: true };
    }

    wakeReverie(reverieId) {
        const reverie = this.reveries.get(reverieId);
        if (!reverie) return { success: false, error: 'REVERIE_NOT_FOUND' };
        reverie.lastDrift = Date.now();
        this._triggerHook('reverieWoken', { reverieId });
        return { success: true };
    }

    calculateReverieValue(reverieId) {
        const reverie = this.reveries.get(reverieId);
        if (!reverie) return 0;
        return reverie.level * 100 + reverie.imagination * 2 + reverie.visions.length * 30;
    }

    mergeReveries(reverieId, otherReverieId) {
        const reverie = this.reveries.get(reverieId);
        const other = this.reveries.get(otherReverieId);
        if (!reverie || !other) return { success: false, error: 'REVERIE_NOT_FOUND' };
        reverie.imagination = Math.max(reverie.imagination, other.imagination);
        reverie.visions = [...reverie.visions, ...other.visions];
        this.reveries.delete(otherReverieId);
        this._triggerHook('reveriesMerged', { reverieId, otherReverieId });
        return { success: true };
    }

    deleteReverie(reverieId) {
        if (!this.reveries.has(reverieId)) return { success: false, error: 'REVERIE_NOT_FOUND' };
        this.reveries.delete(reverieId);
        this._triggerHook('reverieDeleted', { reverieId });
        return { success: true };
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
        if (this.stats.totalDrifted < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { reveries: Array.from(this.reveries.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.reveries) this.reveries = new Map(data.reveries);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, reverieCount: this.reveries.size }; }
}