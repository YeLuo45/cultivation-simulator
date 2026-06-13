/**
 * CultivationFrost.js - 修真霜
 * V798 Iteration 1/30 Round 32
 */
export class CultivationFrost {
    constructor(config = {}) {
        this.config = { maxFrosts: config.maxFrosts || 20, baseChill: config.baseChill || 20, ...config };
        this.frosts = new Map();
        this.crystalLogs = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRecruited: 0, totalCrystals: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getFrost', (ctx) => this.getFrost(ctx.frostId));
        this.registerTool('recruitFrost', (ctx) => this.recruitFrost(ctx));
    }

    recruitFrost(data = {}) {
        if (this.frosts.size >= this.config.maxFrosts) {
            return { success: false, error: 'MAX_FROSTS_REACHED' };
        }
        const id = data.frostId || `frs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const validTypes = ['winter', 'alpine', 'magical'];
        const type = validTypes.includes(data.type) ? data.type : 'winter';
        const frost = {
            frostId: id,
            masterId: data.masterId || null,
            name: data.name || 'Anonymous Frost',
            type,
            chill: data.chill || this.config.baseChill,
            crystals: [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.frosts.set(id, frost);
        this.stats.totalRecruited++;
        this._triggerHook('frostRecruited', { frostId: id, masterId: frost.masterId, type });
        return { success: true, frost };
    }

    getFrost(id) { return this.frosts.get(id) ? { ...this.frosts.get(id), crystals: [...this.frosts.get(id).crystals] } : null; }

    listFrosts() { return Array.from(this.frosts.values()).map(f => ({ ...f, crystals: [...f.crystals] })); }

    listByMaster(masterId) { return Array.from(this.frosts.values()).filter(f => f.masterId === masterId).map(f => ({ ...f, crystals: [...f.crystals] })); }

    listLegendary() { return Array.from(this.frosts.values()).filter(f => f.status === 'legendary').map(f => ({ ...f, crystals: [...f.crystals] })); }

    addCrystal(frostId, crystal) {
        const frost = this.frosts.get(frostId);
        if (!frost) return { success: false, error: 'FROST_NOT_FOUND' };
        const crystalData = {
            crystalId: crystal.crystalId || `cry_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            clarity: crystal.clarity || 10,
            facetCount: crystal.facetCount || 6,
            addedAt: Date.now()
        };
        frost.crystals.push(crystalData);
        this.stats.totalCrystals++;
        this._triggerHook('crystalAdded', { frostId, crystalId: crystalData.crystalId, clarity: crystalData.clarity });
        return { success: true, crystal: crystalData };
    }

    raiseChill(frostId, amount = 5) {
        const frost = this.frosts.get(frostId);
        if (!frost) return { success: false, error: 'FROST_NOT_FOUND' };
        frost.chill += amount;
        this._triggerHook('chillRaised', { frostId, newChill: frost.chill, amount });
        return { success: true, newChill: frost.chill };
    }

    levelUpFrost(frostId) {
        const frost = this.frosts.get(frostId);
        if (!frost) return { success: false, error: 'FROST_NOT_FOUND' };
        frost.level++;
        if (frost.level >= 10) frost.status = 'veteran';
        this._triggerHook('frostLeveledUp', { frostId, newLevel: frost.level });
        return { success: true, newLevel: frost.level };
    }

    legendFrost(frostId) {
        const frost = this.frosts.get(frostId);
        if (!frost) return { success: false, error: 'FROST_NOT_FOUND' };
        frost.status = 'legendary';
        this._triggerHook('frostLegendized', { frostId, name: frost.name });
        return { success: true, status: frost.status };
    }

    calculateFrostValue(frostId) {
        const frost = this.frosts.get(frostId);
        if (!frost) return 0;
        return frost.level * 100 + frost.chill * 2 + frost.crystals.length * 30;
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
        if (this.stats.totalRecruited < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.baseChill += 5;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { frosts: Array.from(this.frosts.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.frosts) this.frosts = new Map(data.frosts);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, frostCount: this.frosts.size, legendaryCount: this.listLegendary().length }; }
}
