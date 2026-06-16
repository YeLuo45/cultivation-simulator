/**
 * CultivationTemple.js - 修真神殿系统
 * V714 Iteration 7/30 Round 29 - Cultivation Temple
 */

export class CultivationTemple {
    constructor(config = {}) {
        this.config = { maxTemples: config.maxTemples || 20, baseSanctity: config.baseSanctity || 20, ...config };
        this.temples = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTemples: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTemple', (ctx) => this.getTemple(ctx.templeId));
        this.registerTool('recruitTemple', (ctx) => this.recruitTemple(ctx));
    }

    recruitTemple(data) {
        const id = data.templeId || `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const temple = {
            templeId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Temple',
            type: data.type || 'divine',
            sanctity: data.sanctity !== undefined ? data.sanctity : this.config.baseSanctity,
            altars: [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.temples.set(id, temple);
        this.stats.totalTemples++;
        this._triggerHook('templeRecruited', { templeId: id });
        return { success: true, temple };
    }

    getTemple(id) { return this.temples.get(id) ? { ...this.temples.get(id) } : null; }
    listTemples() { return Array.from(this.temples.values()).map(t => ({ ...t })); }
    listByMaster(masterId) { return Array.from(this.temples.values()).filter(t => t.masterId === masterId).map(t => ({ ...t })); }
    listLegendary() { return Array.from(this.temples.values()).filter(t => t.status === 'legendary').map(t => ({ ...t })); }

    addAltar(templeId, altar) {
        const temple = this.temples.get(templeId);
        if (!temple) return { success: false, error: 'TEMPLE_NOT_FOUND' };
        temple.altars.push(altar);
        this._triggerHook('altarAdded', { templeId, altar });
        return { success: true, temple: { ...temple } };
    }

    raiseSanctity(templeId, amount = 5) {
        const temple = this.temples.get(templeId);
        if (!temple) return { success: false, error: 'TEMPLE_NOT_FOUND' };
        temple.sanctity += amount;
        this._triggerHook('sanctityRaised', { templeId, newSanctity: temple.sanctity });
        return { success: true };
    }

    levelUpTemple(templeId) {
        const temple = this.temples.get(templeId);
        if (!temple) return { success: false, error: 'TEMPLE_NOT_FOUND' };
        temple.level++;
        this._triggerHook('templeLeveledUp', { templeId, newLevel: temple.level });
        return { success: true };
    }

    legendTemple(templeId) {
        const temple = this.temples.get(templeId);
        if (!temple) return { success: false, error: 'TEMPLE_NOT_FOUND' };
        temple.status = 'legendary';
        this._triggerHook('templeLegendized', { templeId });
        return { success: true };
    }

    calculateTempleValue(templeId) {
        const temple = this.temples.get(templeId);
        if (!temple) return 0;
        return temple.level * 100 + temple.sanctity * 2 + temple.altars.length * 30;
    }

    listByType(type) { return Array.from(this.temples.values()).filter(t => t.type === type).map(t => ({ ...t })); }

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
        if (this.stats.totalTemples < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTemples += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { temples: Array.from(this.temples.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.temples) this.temples = new Map(data.temples);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, templeCount: this.temples.size }; }
}
