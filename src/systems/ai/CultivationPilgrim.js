/**
 * CultivationPilgrim.js - 修真朝圣系统
 * V655 Iteration 8/30 Round 27
 */
export class CultivationPilgrim {
    constructor(config = {}) {
        this.config = { maxPilgrims: config.maxPilgrims || 50, baseDevotion: config.baseDevotion || 20, ...config };
        this.pilgrims = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPilgrims: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPilgrim', (ctx) => this.getPilgrim(ctx.pilgrimId));
        this.registerTool('recruitPilgrim', (ctx) => this.recruitPilgrim(ctx));
    }

    recruitPilgrim(data) {
        const id = data.pilgrimId || `pilgrim_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const pilgrim = {
            pilgrimId: id,
            masterId: data.masterId,
            name: data.name || 'Mystic Pilgrim',
            type: data.type || 'sacred',
            devotion: data.devotion || this.config.baseDevotion,
            sites: data.sites || [],
            level: data.level || 1,
            status: data.status || 'novice',
            recruitedAt: Date.now()
        };
        this.pilgrims.set(id, pilgrim);
        this.stats.totalPilgrims++;
        this._triggerHook('pilgrimRecruited', { pilgrimId: id, masterId: data.masterId });
        return { success: true, pilgrim };
    }

    getPilgrim(id) { return this.pilgrims.get(id) ? { ...this.pilgrims.get(id) } : null; }
    listPilgrims() { return Array.from(this.pilgrims.values()).map(p => ({ ...p })); }
    listByMaster(masterId) { return Array.from(this.pilgrims.values()).filter(p => p.masterId === masterId).map(p => ({ ...p })); }
    listLegendary() { return Array.from(this.pilgrims.values()).filter(p => p.status === 'legendary').map(p => ({ ...p })); }

    addSite(pilgrimId, site) {
        const pilgrim = this.pilgrims.get(pilgrimId);
        if (!pilgrim) return { success: false, error: 'PILGRIM_NOT_FOUND' };
        pilgrim.sites.push(site);
        this._triggerHook('siteAdded', { pilgrimId, site });
        return { success: true };
    }

    raiseDevotion(pilgrimId, amount = 5) {
        const pilgrim = this.pilgrims.get(pilgrimId);
        if (!pilgrim) return { success: false, error: 'PILGRIM_NOT_FOUND' };
        pilgrim.devotion += amount;
        this._triggerHook('devotionRaised', { pilgrimId, newDevotion: pilgrim.devotion });
        return { success: true };
    }

    levelUpPilgrim(pilgrimId) {
        const pilgrim = this.pilgrims.get(pilgrimId);
        if (!pilgrim) return { success: false, error: 'PILGRIM_NOT_FOUND' };
        pilgrim.level++;
        this._triggerHook('pilgrimLeveledUp', { pilgrimId, newLevel: pilgrim.level });
        return { success: true };
    }

    legendPilgrim(pilgrimId) {
        const pilgrim = this.pilgrims.get(pilgrimId);
        if (!pilgrim) return { success: false, error: 'PILGRIM_NOT_FOUND' };
        pilgrim.status = 'legendary';
        this._triggerHook('pilgrimLegendized', { pilgrimId });
        return { success: true };
    }

    calculatePilgrimValue(pilgrimId) {
        const pilgrim = this.pilgrims.get(pilgrimId);
        if (!pilgrim) return 0;
        return pilgrim.level * 100 + pilgrim.devotion * 2 + pilgrim.sites.length * 30;
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
        if (this.stats.totalPilgrims < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPilgrims += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { pilgrims: Array.from(this.pilgrims.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.pilgrims) this.pilgrims = new Map(data.pilgrims);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, pilgrimCount: this.pilgrims.size }; }
}
