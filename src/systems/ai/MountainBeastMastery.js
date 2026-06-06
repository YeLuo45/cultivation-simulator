/**
 * MountainBeastMastery.js - 山兽驯服
 * V445 Iteration 7/15 Round 16 - Mountain Beast Mastery
 *
 * 融合6大设计系统:
 * - generic-agent: 山兽自循环
 * - chatdev: 山兽角色协调
 * - nanobot: 山兽mesh
 * - claude-code: 山兽分析工具
 * - thunderbolt: 山兽持久化
 * - ruflo: 山兽Hook
 */

export class MountainBeastMastery {
    constructor(config = {}) {
        this.config = { maxBeasts: config.maxBeasts || 100, baseFerocity: config.baseFerocity || 30, ...config };
        this.beasts = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBeasts: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBeast', (ctx) => this.getBeast(ctx.beastId));
        this.registerTool('encounterBeast', (ctx) => this.encounterBeast(ctx));
    }

    encounterBeast(data) {
        const id = data.beastId || `bst_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const beast = { beastId: id, tamerId: data.tamerId, name: data.name, species: data.species, ferocity: data.ferocity || this.config.baseFerocity, loyalty: data.loyalty || 0, habitat: data.habitat || 'wilds', status: data.status || 'wild', createdAt: Date.now() };
        this.beasts.set(id, beast);
        this.stats.totalBeasts++;
        this._triggerHook('beastEncountered', { beastId: id });
        return { success: true, beast };
    }

    getBeast(id) { return this.beasts.get(id) ? { ...this.beasts.get(id) } : null; }
    listBeasts() { return Array.from(this.beasts.values()).map(b => ({ ...b })); }
    listByTamer(tamerId) { return Array.from(this.beasts.values()).filter(b => b.tamerId === tamerId).map(b => ({ ...b })); }
    listBySpecies(species) { return Array.from(this.beasts.values()).filter(b => b.species === species).map(b => ({ ...b })); }

    tameBeast(beastId, amount = 5) {
        const beast = this.beasts.get(beastId);
        if (!beast) return { success: false, error: 'BEAST_NOT_FOUND' };
        beast.loyalty = Math.min(100, beast.loyalty + amount);
        if (beast.status === 'wild') beast.status = 'tamed';
        this._triggerHook('beastTamed', { beastId, newLoyalty: beast.loyalty });
        return { success: true, beast: { ...beast } };
    }

    reduceFerocity(beastId, amount = 2) {
        const beast = this.beasts.get(beastId);
        if (!beast) return { success: false, error: 'BEAST_NOT_FOUND' };
        beast.ferocity = Math.max(0, beast.ferocity - amount);
        this._triggerHook('ferocityReduced', { beastId, newFerocity: beast.ferocity });
        return { success: true, beast: { ...beast } };
    }

    bondBeast(beastId) {
        const beast = this.beasts.get(beastId);
        if (!beast) return { success: false, error: 'BEAST_NOT_FOUND' };
        beast.status = 'bonded';
        beast.loyalty = Math.max(beast.loyalty, 80);
        this._triggerHook('beastBonded', { beastId });
        return { success: true, beast: { ...beast } };
    }

    calculateBeastStrength(beastId) {
        const beast = this.beasts.get(beastId);
        if (!beast) return 0;
        return beast.ferocity * (1 + beast.loyalty / 100) + beast.habitat.length;
    }

    listWild() { return Array.from(this.beasts.values()).filter(b => b.status === 'wild').map(b => ({ ...b })); }

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
        if (this.stats.totalBeasts < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBeasts += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { beasts: Array.from(this.beasts.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.beasts) this.beasts = new Map(data.beasts);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, beastCount: this.beasts.size }; }
}
