/**
 * CultivationTown.js - 修真镇
 * V590 Iteration 13/20 Round 24
 *
 * 融合6大设计系统:
 * - generic-agent: 镇自循环
 * - chatdev: 镇角色协调
 * - nanobot: 镇mesh
 * - claude-code: 镇分析工具
 * - thunderbolt: 镇持久化
 * - ruflo: 镇Hook
 */

export class CultivationTown {
    constructor(config = {}) {
        this.config = { maxTowns: config.maxTowns || 50, baseEconomy: config.baseEconomy || 20, ...config };
        this.towns = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTowns: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTown', (ctx) => this.getTown(ctx.townId));
        this.registerTool('foundTown', (ctx) => this.foundTown(ctx));
    }

    foundTown(data) {
        const id = data.id || `twn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const town = {
            townId: id,
            elderId: data.elderId,
            name: data.name,
            type: data.type || 'trading',
            economy: data.economy || this.config.baseEconomy,
            shops: data.shops || [],
            level: 1,
            status: 'growing',
            createdAt: Date.now()
        };
        this.towns.set(id, town);
        this.stats.totalTowns++;
        this._triggerHook('townFounded', { townId: id });
        return { success: true, town };
    }

    getTown(id) { return this.towns.get(id) ? { ...this.towns.get(id) } : null; }
    listTowns() { return Array.from(this.towns.values()).map(t => ({ ...t })); }
    listByElder(elderId) { return Array.from(this.towns.values()).filter(t => t.elderId === elderId).map(t => ({ ...t })); }
    listEternal() { return Array.from(this.towns.values()).filter(t => t.status === 'eternal').map(t => ({ ...t })); }

    addShop(townId, shop) {
        const town = this.towns.get(townId);
        if (!town) return { success: false, error: 'TOWN_NOT_FOUND' };
        town.shops.push(shop);
        this._triggerHook('shopAdded', { townId, shop });
        return { success: true };
    }

    increaseEconomy(townId, amount = 5) {
        const town = this.towns.get(townId);
        if (!town) return { success: false, error: 'TOWN_NOT_FOUND' };
        town.economy += amount;
        this._triggerHook('economyIncreased', { townId, newEconomy: town.economy });
        return { success: true };
    }

    levelUpTown(townId) {
        const town = this.towns.get(townId);
        if (!town) return { success: false, error: 'TOWN_NOT_FOUND' };
        town.level++;
        this._triggerHook('townLeveledUp', { townId, newLevel: town.level });
        return { success: true };
    }

    eternalizeTown(townId) {
        const town = this.towns.get(townId);
        if (!town) return { success: false, error: 'TOWN_NOT_FOUND' };
        town.status = 'eternal';
        this._triggerHook('townEternalized', { townId });
        return { success: true };
    }

    calculateTownValue(townId) {
        const town = this.towns.get(townId);
        if (!town) return 0;
        return town.level * 100 + town.economy * 2 + town.shops.length * 30;
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
        if (this.stats.totalTowns < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTowns += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { towns: Array.from(this.towns.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.towns) this.towns = new Map(data.towns);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, townCount: this.towns.size }; }
}
