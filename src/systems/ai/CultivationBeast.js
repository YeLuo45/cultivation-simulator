/**
 * CultivationBeast.js - 修真妖兽
 * V677 Iteration 30/30 FINAL Round 27
 */
export class CultivationBeast {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, maxBeasts: config.maxBeasts || 100, baseWildness: config.baseWildness || 20, ...config };
        this.beasts = new Map();
        this.metrics = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBeasts: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBeast', (ctx) => this.getBeast(ctx.beastId));
        this.registerTool('getMetrics', (ctx) => this.getMetrics(ctx.beastId));
        this.registerTool('listByType', (ctx) => this.listByType(ctx.type));
    }

    recruitBeast(data) {
        const id = data.id || `beast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const beast = { beastId: id, tamerId: data.tamerId || 'unknown', name: data.name || 'Unnamed Beast', type: data.type || 'wolf', wildness: data.wildness || this.config.baseWildness, abilities: data.abilities || [], level: data.level || 1, status: 'novice', recruitedAt: Date.now(), lastRefresh: Date.now() };
        this.beasts.set(id, beast);
        this.metrics.set(id, { wildness: 50, ferocity: 60, speed: 75 });
        this.stats.totalBeasts++;
        this._triggerHook('beastRecruited', { beastId: id });
        return { success: true, beast };
    }

    getBeast(id) { return this.beasts.get(id) ? { ...this.beasts.get(id) } : null; }
    listBeasts() { return Array.from(this.beasts.values()).map(b => ({ ...b })); }
    listByType(type) { return Array.from(this.beasts.values()).filter(b => b.type === type).map(b => ({ ...b })); }
    listByTamer(tamerId) { return Array.from(this.beasts.values()).filter(b => b.tamerId === tamerId).map(b => ({ ...b })); }
    listByLevel(min) { return Array.from(this.beasts.values()).filter(b => b.level >= min).map(b => ({ ...b })); }
    listLegendary() { return Array.from(this.beasts.values()).filter(b => b.status === 'legendary').map(b => ({ ...b })); }
    listTop(n = 10) { return [...this.listBeasts()].sort((a, b) => b.level - a.level).slice(0, n); }

    setMetrics(beastId, metrics) {
        const current = this.metrics.get(beastId);
        if (!current) return { success: false, error: 'BEAST_NOT_FOUND' };
        this.metrics.set(beastId, { ...current, ...metrics, updatedAt: Date.now() });
        return { success: true };
    }

    getMetrics(beastId) { return this.metrics.get(beastId) ? { ...this.metrics.get(beastId) } : null; }

    refreshBeast(beastId) {
        const beast = this.beasts.get(beastId);
        if (!beast) return { success: false, error: 'BEAST_NOT_FOUND' };
        beast.lastRefresh = Date.now();
        this._triggerHook('beastRefreshed', { beastId });
        return { success: true };
    }

    tameWildness(beastId, amount = 5) {
        const beast = this.beasts.get(beastId);
        if (!beast) return { success: false, error: 'BEAST_NOT_FOUND' };
        beast.wildness = Math.max(0, beast.wildness - amount);
        this._triggerHook('wildnessTamed', { beastId });
        return { success: true };
    }

    addAbility(beastId, ability) {
        const beast = this.beasts.get(beastId);
        if (!beast) return { success: false, error: 'BEAST_NOT_FOUND' };
        beast.abilities.push(ability);
        this._triggerHook('abilityAdded', { beastId });
        return { success: true };
    }

    promoteBeast(beastId) {
        const beast = this.beasts.get(beastId);
        if (!beast) return { success: false, error: 'BEAST_NOT_FOUND' };
        beast.level++;
        this._triggerHook('beastPromoted', { beastId });
        return { success: true };
    }

    trainBeast(beastId) {
        const beast = this.beasts.get(beastId);
        if (!beast) return { success: false, error: 'BEAST_NOT_FOUND' };
        beast.status = 'veteran';
        this._triggerHook('beastTrained', { beastId });
        return { success: true };
    }

    huntBeast(beastId) {
        const beast = this.beasts.get(beastId);
        if (!beast) return { success: false, error: 'BEAST_NOT_FOUND' };
        beast.status = 'hunting';
        this._triggerHook('beastHunting', { beastId });
        return { success: true };
    }

    legendBeast(beastId) {
        const beast = this.beasts.get(beastId);
        if (!beast) return { success: false, error: 'BEAST_NOT_FOUND' };
        beast.status = 'legendary';
        this._triggerHook('beastLegendized', { beastId });
        return { success: true };
    }

    changeType(beastId, newType) {
        const beast = this.beasts.get(beastId);
        if (!beast) return { success: false, error: 'BEAST_NOT_FOUND' };
        beast.type = newType;
        this._triggerHook('typeChanged', { beastId });
        return { success: true };
    }

    calculateBeastValue(beastId) {
        const beast = this.beasts.get(beastId);
        if (!beast) return 0;
        return beast.level * 100 + beast.wildness * 2 + beast.abilities.length * 30;
    }

    deleteBeast(beastId) {
        if (!this.beasts.has(beastId)) return { success: false, error: 'BEAST_NOT_FOUND' };
        this.beasts.delete(beastId);
        this.metrics.delete(beastId);
        this._triggerHook('beastDeleted', { beastId });
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
        if (this.stats.totalBeasts < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { beasts: Array.from(this.beasts.entries()), metrics: Array.from(this.metrics.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.beasts) this.beasts = new Map(data.beasts);
        if (data.metrics) this.metrics = new Map(data.metrics);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, beastCount: this.beasts.size }; }
}