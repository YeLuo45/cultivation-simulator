/**
 * CultivationHail.js - 修真雹
 * V801 Iteration 4/30 Round 32
 */
export class CultivationHail {
    constructor(config = {}) {
        this.config = { maxHails: config.maxHails || 20, baseDensity: config.baseDensity || 20, ...config };
        this.hails = new Map();
        this.stoneLogs = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRecruited: 0, totalStones: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getHail', (ctx) => this.getHail(ctx.hailId));
        this.registerTool('recruitHail', (ctx) => this.recruitHail(ctx));
    }

    recruitHail(data = {}) {
        if (this.hails.size >= this.config.maxHails) {
            return { success: false, error: 'MAX_HAILS_REACHED' };
        }
        const id = data.hailId || `hal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const validTypes = ['winter', 'stormy', 'divine'];
        const type = validTypes.includes(data.type) ? data.type : 'winter';
        const hail = {
            hailId: id,
            masterId: data.masterId || null,
            name: data.name || 'Anonymous Hail',
            type,
            density: data.density || this.config.baseDensity,
            stones: [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.hails.set(id, hail);
        this.stats.totalRecruited++;
        this._triggerHook('hailRecruited', { hailId: id, masterId: hail.masterId, type });
        return { success: true, hail };
    }

    getHail(id) { return this.hails.get(id) ? { ...this.hails.get(id), stones: [...this.hails.get(id).stones] } : null; }

    listHails() { return Array.from(this.hails.values()).map(h => ({ ...h, stones: [...h.stones] })); }

    listByMaster(masterId) { return Array.from(this.hails.values()).filter(h => h.masterId === masterId).map(h => ({ ...h, stones: [...h.stones] })); }

    listLegendary() { return Array.from(this.hails.values()).filter(h => h.status === 'legendary').map(h => ({ ...h, stones: [...h.stones] })); }

    addStone(hailId, stone) {
        const hail = this.hails.get(hailId);
        if (!hail) return { success: false, error: 'HAIL_NOT_FOUND' };
        const stoneData = {
            stoneId: stone.stoneId || `stn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            weight: stone.weight || 10,
            hardness: stone.hardness || 6,
            addedAt: Date.now()
        };
        hail.stones.push(stoneData);
        this.stats.totalStones++;
        this._triggerHook('stoneAdded', { hailId, stoneId: stoneData.stoneId, weight: stoneData.weight });
        return { success: true, stone: stoneData };
    }

    raiseDensity(hailId, amount = 5) {
        const hail = this.hails.get(hailId);
        if (!hail) return { success: false, error: 'HAIL_NOT_FOUND' };
        hail.density += amount;
        this._triggerHook('densityRaised', { hailId, newDensity: hail.density, amount });
        return { success: true, newDensity: hail.density };
    }

    levelUpHail(hailId) {
        const hail = this.hails.get(hailId);
        if (!hail) return { success: false, error: 'HAIL_NOT_FOUND' };
        hail.level++;
        if (hail.level >= 10) hail.status = 'veteran';
        this._triggerHook('hailLeveledUp', { hailId, newLevel: hail.level });
        return { success: true, newLevel: hail.level };
    }

    legendHail(hailId) {
        const hail = this.hails.get(hailId);
        if (!hail) return { success: false, error: 'HAIL_NOT_FOUND' };
        hail.status = 'legendary';
        this._triggerHook('hailLegendized', { hailId, name: hail.name });
        return { success: true, status: hail.status };
    }

    calculateHailValue(hailId) {
        const hail = this.hails.get(hailId);
        if (!hail) return 0;
        return hail.level * 100 + hail.density * 2 + hail.stones.length * 30;
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
        this.config.baseDensity += 5;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { hails: Array.from(this.hails.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.hails) this.hails = new Map(data.hails);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, hailCount: this.hails.size, legendaryCount: this.listLegendary().length }; }
}
