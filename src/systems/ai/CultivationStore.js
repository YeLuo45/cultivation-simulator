/**
 * CultivationStore.js - 修真商店 (Cultivation Store System)
 * V539 Iteration 2/20 Round 22
 */
export class CultivationStore {
    constructor(config = {}) {
        this.config = { maxStores: config.maxStores || 50, baseSales: config.baseSales || 20, ...config };
        this.stores = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalStores: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getStore', (ctx) => this.getStore(ctx.storeId));
        this.registerTool('openStore', (ctx) => this.openStore(ctx));
    }

    openStore(data) {
        if (this.stores.size >= this.config.maxStores) return { success: false, error: 'MAX_STORES_REACHED' };
        const id = data.storeId || `str_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const store = {
            storeId: id,
            ownerId: data.ownerId,
            name: data.name || 'Mystic Shop',
            type: data.type || 'weapon',
            sales: data.sales !== undefined ? data.sales : this.config.baseSales,
            inventory: Array.isArray(data.inventory) ? [...data.inventory] : [],
            level: data.level || 1,
            status: 'open',
            createdAt: Date.now()
        };
        this.stores.set(id, store);
        this.stats.totalStores++;
        this._triggerHook('storeOpened', { storeId: id });
        return { success: true, store };
    }

    getStore(id) { return this.stores.get(id) ? { ...this.stores.get(id), inventory: [...this.stores.get(id).inventory] } : null; }
    listStores() { return Array.from(this.stores.values()).map(s => ({ ...s, inventory: [...s.inventory] })); }
    listByOwner(ownerId) { return Array.from(this.stores.values()).filter(s => s.ownerId === ownerId).map(s => ({ ...s, inventory: [...s.inventory] })); }
    listOpen() { return Array.from(this.stores.values()).filter(s => s.status === 'open').map(s => ({ ...s, inventory: [...s.inventory] })); }

    addInventory(storeId, item) {
        const store = this.stores.get(storeId);
        if (!store) return { success: false, error: 'STORE_NOT_FOUND' };
        if (store.status === 'closed') return { success: false, error: 'STORE_CLOSED' };
        store.inventory.push(item);
        this._triggerHook('inventoryAdded', { storeId, item, inventorySize: store.inventory.length });
        return { success: true, inventorySize: store.inventory.length };
    }

    increaseSales(storeId, amount = 5) {
        const store = this.stores.get(storeId);
        if (!store) return { success: false, error: 'STORE_NOT_FOUND' };
        store.sales += amount;
        this._triggerHook('salesIncreased', { storeId, newSales: store.sales });
        return { success: true, sales: store.sales };
    }

    levelUpStore(storeId) {
        const store = this.stores.get(storeId);
        if (!store) return { success: false, error: 'STORE_NOT_FOUND' };
        store.level++;
        this._triggerHook('storeLeveledUp', { storeId, newLevel: store.level });
        return { success: true, level: store.level };
    }

    closeStore(storeId) {
        const store = this.stores.get(storeId);
        if (!store) return { success: false, error: 'STORE_NOT_FOUND' };
        store.status = 'closed';
        this._triggerHook('storeClosed', { storeId });
        return { success: true };
    }

    calculateStoreValue(storeId) {
        const store = this.stores.get(storeId);
        if (!store) return 0;
        return store.level * 100 + store.sales * 2 + store.inventory.length * 30;
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
        if (this.stats.totalStores < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxStores += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { stores: Array.from(this.stores.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.stores) this.stores = new Map(data.stores);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, storeCount: this.stores.size }; }
}
