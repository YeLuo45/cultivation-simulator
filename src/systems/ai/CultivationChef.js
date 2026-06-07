/**
 * CultivationChef.js - 修真厨师
 * V708 Iteration 1/30 Round 29 - Cultivation Chef
 *
 * 融合6大设计系统:
 * - generic-agent: 厨师自循环
 * - chatdev: 厨师角色协调
 * - nanobot: 菜肴mesh
 * - claude-code: 厨师分析工具
 * - thunderbolt: 厨师持久化
 * - ruflo: 厨师Hook
 */

export class CultivationChef {
    constructor(config = {}) {
        this.config = { maxChefs: config.maxChefs || 30, baseCulinary: config.baseCulinary || 20, ...config };
        this.chefs = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalChefs: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getChef', (ctx) => this.getChef(ctx.chefId));
        this.registerTool('recruitChef', (ctx) => this.recruitChef(ctx));
    }

    recruitChef(data) {
        const id = data.id || `chf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const chef = {
            chefId: id,
            masterId: data.masterId,
            name: data.name,
            type: data.type || 'earthly',
            culinary: data.culinary || this.config.baseCulinary,
            dishes: data.dishes || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.chefs.set(id, chef);
        this.stats.totalChefs++;
        this._triggerHook('chefRecruited', { chefId: id });
        return { success: true, chef };
    }

    getChef(id) { return this.chefs.get(id) ? { ...this.chefs.get(id) } : null; }
    listChefs() { return Array.from(this.chefs.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.chefs.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.chefs.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addDish(chefId, dish) {
        const chef = this.chefs.get(chefId);
        if (!chef) return { success: false, error: 'CHEF_NOT_FOUND' };
        chef.dishes.push(dish);
        this._triggerHook('dishAdded', { chefId, dish, dishCount: chef.dishes.length });
        return { success: true };
    }

    raiseCulinary(chefId, amount = 5) {
        const chef = this.chefs.get(chefId);
        if (!chef) return { success: false, error: 'CHEF_NOT_FOUND' };
        chef.culinary += amount;
        this._triggerHook('culinaryRaised', { chefId, newCulinary: chef.culinary });
        return { success: true };
    }

    levelUpChef(chefId) {
        const chef = this.chefs.get(chefId);
        if (!chef) return { success: false, error: 'CHEF_NOT_FOUND' };
        chef.level++;
        this._triggerHook('chefLeveledUp', { chefId, newLevel: chef.level });
        return { success: true };
    }

    legendChef(chefId) {
        const chef = this.chefs.get(chefId);
        if (!chef) return { success: false, error: 'CHEF_NOT_FOUND' };
        chef.status = 'legendary';
        this._triggerHook('chefLegendized', { chefId });
        return { success: true };
    }

    calculateChefValue(chefId) {
        const chef = this.chefs.get(chefId);
        if (!chef) return 0;
        return chef.level * 100 + chef.culinary * 2 + chef.dishes.length * 30;
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
        if (this.stats.totalChefs < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxChefs += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { chefs: Array.from(this.chefs.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.chefs) this.chefs = new Map(data.chefs);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, chefCount: this.chefs.size }; }
}
