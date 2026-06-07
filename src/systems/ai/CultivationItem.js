/**
 * CultivationItem.js - 修真物品
 * V698 Iteration 21/30 Round 28 - Cultivation Item
 */
export class CultivationItem {
    constructor(config = {}) {
        this.config = { maxItems: config.maxItems || 100, baseValue: config.baseValue || 20, ...config };
        this.items = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalItems: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getItem', (ctx) => this.getItem(ctx.itemId));
        this.registerTool('recruitItem', (ctx) => this.recruitItem(ctx));
    }

    recruitItem(data) {
        const id = data.id || `itm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const item = {
            itemId: id,
            masterId: data.masterId,
            name: data.name || 'unnamed-item',
            type: data.type || 'consumable',
            value: data.value || this.config.baseValue,
            enchantments: data.enchantments || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.items.set(id, item);
        this.stats.totalItems++;
        this._triggerHook('itemRecruited', { itemId: id });
        return { success: true, item };
    }

    getItem(id) { return this.items.get(id) ? { ...this.items.get(id) } : null; }
    listItems() { return Array.from(this.items.values()).map(i => ({ ...i })); }
    listByMaster(masterId) { return Array.from(this.items.values()).filter(i => i.masterId === masterId).map(i => ({ ...i })); }
    listLegendary() { return Array.from(this.items.values()).filter(i => i.status === 'legendary').map(i => ({ ...i })); }

    addEnchantment(itemId, enchantment) {
        const item = this.items.get(itemId);
        if (!item) return { success: false, error: 'ITEM_NOT_FOUND' };
        item.enchantments.push(enchantment);
        this._triggerHook('enchantmentAdded', { itemId, enchantment });
        return { success: true };
    }

    raiseValue(itemId, amount = 5) {
        const item = this.items.get(itemId);
        if (!item) return { success: false, error: 'ITEM_NOT_FOUND' };
        item.value += amount;
        this._triggerHook('valueRaised', { itemId, newValue: item.value });
        return { success: true };
    }

    levelUpItem(itemId) {
        const item = this.items.get(itemId);
        if (!item) return { success: false, error: 'ITEM_NOT_FOUND' };
        item.level++;
        if (item.level >= 5) item.status = 'veteran';
        this._triggerHook('itemLeveledUp', { itemId, newLevel: item.level });
        return { success: true };
    }

    legendItem(itemId) {
        const item = this.items.get(itemId);
        if (!item) return { success: false, error: 'ITEM_NOT_FOUND' };
        item.status = 'legendary';
        this._triggerHook('itemLegendized', { itemId });
        return { success: true };
    }

    calculateItemValue(itemId) {
        const item = this.items.get(itemId);
        if (!item) return 0;
        return item.level * 100 + item.value * 2 + item.enchantments.length * 30;
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
        if (this.stats.totalItems < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxItems += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { items: Array.from(this.items.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.items) this.items = new Map(data.items);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, itemCount: this.items.size }; }
}
