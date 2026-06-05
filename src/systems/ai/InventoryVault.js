/**
 * InventoryVault.js - 仓库库存
 * V380 Iteration 5/9 Round 11
 */
export class InventoryVault {
    constructor(config = {}) {
        this.config = { maxItems: config.maxItems || 500, baseCapacity: config.baseCapacity || 100, ...config };
        this.vaults = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalVaults: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getVault', (ctx) => this.getVault(ctx.vaultId));
        this.registerTool('createVault', (ctx) => this.createVault(ctx));
    }

    createVault(data) {
        const id = data.id || `vlt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const vault = { vaultId: id, ownerId: data.ownerId, capacity: data.capacity || this.config.baseCapacity, items: [], level: 1, createdAt: Date.now() };
        this.vaults.set(id, vault);
        this.stats.totalVaults++;
        this._triggerHook('vaultCreated', { vaultId: id });
        return { success: true, vault };
    }

    getVault(id) { return this.vaults.get(id) ? { ...this.vaults.get(id) } : null; }
    listVaults() { return Array.from(this.vaults.values()).map(v => ({ ...v })); }
    listByOwner(ownerId) { return Array.from(this.vaults.values()).filter(v => v.ownerId === ownerId).map(v => ({ ...v })); }

    addItem(vaultId, itemId, quantity = 1) {
        const vault = this.vaults.get(vaultId);
        if (!vault) return { success: false, error: 'VAULT_NOT_FOUND' };
        const currentSize = vault.items.reduce((s, i) => s + i.quantity, 0);
        if (currentSize + quantity > vault.capacity) return { success: false, error: 'VAULT_FULL' };
        const existing = vault.items.find(i => i.itemId === itemId);
        if (existing) existing.quantity += quantity;
        else vault.items.push({ itemId, quantity });
        this._triggerHook('itemAdded', { vaultId, itemId, quantity });
        return { success: true };
    }

    removeItem(vaultId, itemId, quantity = 1) {
        const vault = this.vaults.get(vaultId);
        if (!vault) return { success: false, error: 'VAULT_NOT_FOUND' };
        const idx = vault.items.findIndex(i => i.itemId === itemId);
        if (idx < 0) return { success: false, error: 'ITEM_NOT_FOUND' };
        const item = vault.items[idx];
        if (item.quantity < quantity) return { success: false, error: 'INSUFFICIENT_QUANTITY' };
        item.quantity -= quantity;
        if (item.quantity === 0) vault.items.splice(idx, 1);
        this._triggerHook('itemRemoved', { vaultId, itemId, quantity });
        return { success: true };
    }

    getItemQuantity(vaultId, itemId) {
        const vault = this.vaults.get(vaultId);
        if (!vault) return null;
        const item = vault.items.find(i => i.itemId === itemId);
        return item ? item.quantity : 0;
    }

    upgradeVault(vaultId) {
        const vault = this.vaults.get(vaultId);
        if (!vault) return { success: false, error: 'VAULT_NOT_FOUND' };
        vault.level++;
        vault.capacity += 20;
        this._triggerHook('vaultUpgraded', { vaultId, newLevel: vault.level });
        return { success: true };
    }

    transferItem(fromVaultId, toVaultId, itemId, quantity) {
        const removeResult = this.removeItem(fromVaultId, itemId, quantity);
        if (!removeResult.success) return removeResult;
        const addResult = this.addItem(toVaultId, itemId, quantity);
        if (!addResult.success) { this.addItem(fromVaultId, itemId, quantity); return addResult; }
        this._triggerHook('itemTransferred', { fromVaultId, toVaultId, itemId, quantity });
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
        if (this.stats.totalVaults < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxItems += 100;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { vaults: Array.from(this.vaults.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.vaults) this.vaults = new Map(data.vaults);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, vaultCount: this.vaults.size }; }
}