/**
 * TreasureVault.js - 宝库系统
 * V502 Iteration 4/20 Round 20
 */
export class TreasureVault {
    constructor(config = {}) {
        this.config = { maxVaults: config.maxVaults || 100, baseGold: config.baseGold || 1000, ...config };
        this.vaults = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalVaults: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getVault', (ctx) => this.getVault(ctx.vaultId));
        this.registerTool('openVault', (ctx) => this.openVault(ctx));
    }

    openVault(data) {
        const id = data.vaultId || data.id || `tvlt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const vault = { vaultId: id, ownerId: data.ownerId, name: data.name || 'Treasure Vault', gold: data.gold || this.config.baseGold, gems: data.gems || [], artifacts: data.artifacts || [], status: data.status || 'locked', createdAt: Date.now() };
        this.vaults.set(id, vault);
        this.stats.totalVaults++;
        this._triggerHook('vaultOpened', { vaultId: id });
        return { success: true, vault };
    }

    getVault(id) { return this.vaults.get(id) ? { ...this.vaults.get(id) } : null; }
    listVaults() { return Array.from(this.vaults.values()).map(v => ({ ...v })); }
    listByOwner(ownerId) { return Array.from(this.vaults.values()).filter(v => v.ownerId === ownerId).map(v => ({ ...v })); }
    listUnlocked() { return Array.from(this.vaults.values()).filter(v => v.status === 'unlocked').map(v => ({ ...v })); }

    depositGold(vaultId, amount = 100) {
        const vault = this.vaults.get(vaultId);
        if (!vault) return { success: false, error: 'VAULT_NOT_FOUND' };
        vault.gold += amount;
        this._triggerHook('goldDeposited', { vaultId, amount, newGold: vault.gold });
        return { success: true };
    }

    addGem(vaultId, gem) {
        const vault = this.vaults.get(vaultId);
        if (!vault) return { success: false, error: 'VAULT_NOT_FOUND' };
        vault.gems.push(gem);
        this._triggerHook('gemAdded', { vaultId, gem });
        return { success: true };
    }

    storeArtifact(vaultId, artifact) {
        const vault = this.vaults.get(vaultId);
        if (!vault) return { success: false, error: 'VAULT_NOT_FOUND' };
        vault.artifacts.push(artifact);
        this._triggerHook('artifactStored', { vaultId, artifact });
        return { success: true };
    }

    unlockVault(vaultId) {
        const vault = this.vaults.get(vaultId);
        if (!vault) return { success: false, error: 'VAULT_NOT_FOUND' };
        vault.status = 'unlocked';
        this._triggerHook('vaultUnlocked', { vaultId });
        return { success: true };
    }

    calculateVaultValue(vaultId) {
        const vault = this.vaults.get(vaultId);
        if (!vault) return 0;
        return vault.gold + vault.gems.length * 500 + vault.artifacts.length * 2000;
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
        this.config.maxVaults += 50;
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
