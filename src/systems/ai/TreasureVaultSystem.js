/**
 * TreasureVaultSystem.js - 宝库系统
 * V336 Iteration 6/9 Round 6
 */
export class TreasureVaultSystem {
    constructor(config = {}) {
        this.config = { maxVaults: config.maxVaults || 50, maxItemsPerVault: config.maxItemsPerVault || 100, ...config };
        this.vaults = new Map();
        this.items = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalVaults: 0, totalStored: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getVault', (ctx) => this.getVault(ctx.vaultId));
        this.registerTool('listVaults', () => Array.from(this.vaults.values()).map(v => ({...v})));
    }

    createVault(data) {
        const id = data.id || `vlt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const vault = { vaultId: id, name: data.name || 'Vault', ownerId: data.ownerId, capacity: data.capacity || this.config.maxItemsPerVault, items: [], createdAt: Date.now() };
        this.vaults.set(id, vault);
        this.stats.totalVaults++;
        this._triggerHook('vaultCreated', { vaultId: id });
        return { success: true, vault };
    }

    getVault(id) { return this.vaults.get(id) ? { ...this.vaults.get(id) } : null; }
    listVaults() { return Array.from(this.vaults.values()).map(v => ({ ...v })); }
    listVaultsByOwner(ownerId) { return Array.from(this.vaults.values()).filter(v => v.ownerId === ownerId).map(v => ({ ...v })); }

    addItem(vaultId, itemData) {
        const vault = this.vaults.get(vaultId);
        if (!vault) return { success: false, error: 'VAULT_NOT_FOUND' };
        if (vault.items.length >= vault.capacity) return { success: false, error: 'VAULT_FULL' };
        const id = itemData.id || `itm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const item = { itemId: id, vaultId, name: itemData.name || 'Item', value: itemData.value || 0, storedAt: Date.now() };
        this.items.set(id, item);
        vault.items.push(id);
        this.stats.totalStored++;
        this._triggerHook('itemStored', { vaultId, itemId: id });
        return { success: true, item };
    }

    getItem(id) { return this.items.get(id) ? { ...this.items.get(id) } : null; }
    removeItem(itemId) {
        const item = this.items.get(itemId);
        if (!item) return { success: false, error: 'ITEM_NOT_FOUND' };
        const vault = this.vaults.get(item.vaultId);
        if (vault) vault.items = vault.items.filter(i => i !== itemId);
        this.items.delete(itemId);
        this._triggerHook('itemRemoved', { itemId });
        return { success: true };
    }

    listItems(vaultId) { return Array.from(this.items.values()).filter(i => i.vaultId === vaultId).map(i => ({ ...i })); }

    transferItem(itemId, targetVaultId) {
        const item = this.items.get(itemId);
        if (!item) return { success: false, error: 'ITEM_NOT_FOUND' };
        const targetVault = this.vaults.get(targetVaultId);
        if (!targetVault) return { success: false, error: 'VAULT_NOT_FOUND' };
        if (targetVault.items.length >= targetVault.capacity) return { success: false, error: 'TARGET_VAULT_FULL' };
        const sourceVault = this.vaults.get(item.vaultId);
        if (sourceVault) sourceVault.items = sourceVault.items.filter(i => i !== itemId);
        targetVault.items.push(itemId);
        item.vaultId = targetVaultId;
        this._triggerHook('itemTransferred', { itemId, targetVaultId });
        return { success: true };
    }

    calculateVaultValue(vaultId) {
        const items = this.listItems(vaultId);
        return items.reduce((sum, i) => sum + (i.value || 0), 0);
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
        this.config.maxItemsPerVault += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { vaults: Array.from(this.vaults.entries()), items: Array.from(this.items.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.vaults) this.vaults = new Map(data.vaults);
        if (data.items) this.items = new Map(data.items);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, vaultCount: this.vaults.size, itemCount: this.items.size }; }
}