/**
 * CraftingDashboard.js - 工匠仪表盘
 * V518 Iteration 20/20 FINAL Round 20
 */
export class CraftingDashboard {
    constructor(config = {}) {
        this.config = { refreshInterval: config.refreshInterval || 5000, maxCrafts: config.maxCrafts || 100, baseQuality: config.baseQuality || 50, ...config };
        this.crafts = new Map();
        this.metrics = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCrafts: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCraft', (ctx) => this.getCraft(ctx.craftId));
        this.registerTool('getMetrics', (ctx) => this.getMetrics(ctx.craftId));
    }

    registerCraft(data) {
        const id = data.id || `cd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const craft = { craftId: id, name: data.name || 'Unnamed Craft', craftsman: data.craftsman || 'unknown', category: data.category || 'general', quality: data.quality || this.config.baseQuality, experience: data.experience || 0, masters: data.masters || 0, status: 'active', createdAt: Date.now(), lastRefresh: Date.now() };
        this.crafts.set(id, craft);
        this.metrics.set(id, { proficiency: 50, reputation: 60, income: 0, satisfaction: 75 });
        this.stats.totalCrafts++;
        this._triggerHook('craftRegistered', { craftId: id });
        return { success: true, craft };
    }

    getCraft(id) { return this.crafts.get(id) ? { ...this.crafts.get(id) } : null; }
    listCrafts() { return Array.from(this.crafts.values()).map(c => ({ ...c })); }
    listByCraftsman(craftsman) { return Array.from(this.crafts.values()).filter(c => c.craftsman === craftsman).map(c => ({ ...c })); }
    listByCategory(category) { return Array.from(this.crafts.values()).filter(c => c.category === category).map(c => ({ ...c })); }
    listByQuality(min) { return Array.from(this.crafts.values()).filter(c => c.quality >= min).map(c => ({ ...c })); }
    listTop(n = 10) { return [...this.listCrafts()].sort((a, b) => b.quality - a.quality).slice(0, n); }

    setMetrics(craftId, metrics) {
        const current = this.metrics.get(craftId);
        if (!current) return { success: false, error: 'CRAFT_NOT_FOUND' };
        this.metrics.set(craftId, { ...current, ...metrics, updatedAt: Date.now() });
        return { success: true };
    }

    getMetrics(craftId) { return this.metrics.get(craftId) ? { ...this.metrics.get(craftId) } : null; }

    refreshCraft(craftId) {
        const craft = this.crafts.get(craftId);
        if (!craft) return { success: false, error: 'CRAFT_NOT_FOUND' };
        craft.lastRefresh = Date.now();
        this._triggerHook('craftRefreshed', { craftId });
        return { success: true };
    }

    gainExperience(craftId, amount = 10) {
        const craft = this.crafts.get(craftId);
        if (!craft) return { success: false, error: 'CRAFT_NOT_FOUND' };
        craft.experience += amount;
        this._triggerHook('experienceGained', { craftId });
        return { success: true };
    }

    promoteCraft(craftId, amount = 5) {
        const craft = this.crafts.get(craftId);
        if (!craft) return { success: false, error: 'CRAFT_NOT_FOUND' };
        craft.quality += amount;
        this._triggerHook('craftPromoted', { craftId });
        return { success: true };
    }

    gainMaster(craftId) {
        const craft = this.crafts.get(craftId);
        if (!craft) return { success: false, error: 'CRAFT_NOT_FOUND' };
        craft.masters++;
        this._triggerHook('masterGained', { craftId });
        return { success: true };
    }

    changeCategory(craftId, newCategory) {
        const craft = this.crafts.get(craftId);
        if (!craft) return { success: false, error: 'CRAFT_NOT_FOUND' };
        craft.category = newCategory;
        this._triggerHook('categoryChanged', { craftId });
        return { success: true };
    }

    retireCraft(craftId) {
        const craft = this.crafts.get(craftId);
        if (!craft) return { success: false, error: 'CRAFT_NOT_FOUND' };
        craft.status = 'retired';
        this._triggerHook('craftRetired', { craftId });
        return { success: true };
    }

    calculateCraftingPower(craftId) {
        const craft = this.crafts.get(craftId);
        if (!craft) return 0;
        return craft.quality * 2 + craft.experience + craft.masters * 100;
    }

    deleteCraft(craftId) {
        if (!this.crafts.has(craftId)) return { success: false, error: 'CRAFT_NOT_FOUND' };
        this.crafts.delete(craftId);
        this.metrics.delete(craftId);
        this._triggerHook('craftDeleted', { craftId });
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
        if (this.stats.totalCrafts < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { crafts: Array.from(this.crafts.entries()), metrics: Array.from(this.metrics.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.crafts) this.crafts = new Map(data.crafts);
        if (data.metrics) this.metrics = new Map(data.metrics);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, craftCount: this.crafts.size }; }
}