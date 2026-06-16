/**
 * ArmorUpgrade.js - 护甲升级系统
 * V509 Iteration 11/20 Round 20
 */
export class ArmorUpgrade {
    constructor(config = {}) {
        this.config = { maxUpgrades: config.maxUpgrades || 100, baseDefense: config.baseDefense || 20, ...config };
        this.upgrades = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalUpgrades: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getUpgrade', (ctx) => this.getUpgrade(ctx.upgradeId));
        this.registerTool('planUpgrade', (ctx) => this.planUpgrade(ctx));
    }

    planUpgrade(data) {
        const id = data.upgradeId || `upg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const upgrade = {
            upgradeId: id,
            smithId: data.smithId,
            armorName: data.armorName,
            level: data.level || 1,
            defense: data.defense || this.config.baseDefense,
            enhancements: data.enhancements || [],
            status: 'planned',
            createdAt: Date.now()
        };
        this.upgrades.set(id, upgrade);
        this.stats.totalUpgrades++;
        this._triggerHook('upgradePlanned', { upgradeId: id });
        return { success: true, upgrade };
    }

    getUpgrade(id) { return this.upgrades.get(id) ? { ...this.upgrades.get(id) } : null; }
    listUpgrades() { return Array.from(this.upgrades.values()).map(u => ({ ...u })); }
    listBySmith(smithId) { return Array.from(this.upgrades.values()).filter(u => u.smithId === smithId).map(u => ({ ...u })); }
    listFinished() { return Array.from(this.upgrades.values()).filter(u => u.status === 'finished').map(u => ({ ...u })); }

    addEnhancement(upgradeId, enhancement) {
        const upgrade = this.upgrades.get(upgradeId);
        if (!upgrade) return { success: false, error: 'UPGRADE_NOT_FOUND' };
        upgrade.enhancements.push(enhancement);
        this._triggerHook('enhancementAdded', { upgradeId, enhancement });
        return { success: true };
    }

    increaseDefense(upgradeId, amount = 5) {
        const upgrade = this.upgrades.get(upgradeId);
        if (!upgrade) return { success: false, error: 'UPGRADE_NOT_FOUND' };
        upgrade.defense += amount;
        this._triggerHook('defenseIncreased', { upgradeId, newDefense: upgrade.defense });
        return { success: true };
    }

    levelUp(upgradeId) {
        const upgrade = this.upgrades.get(upgradeId);
        if (!upgrade) return { success: false, error: 'UPGRADE_NOT_FOUND' };
        upgrade.level++;
        this._triggerHook('upgradeLeveledUp', { upgradeId, newLevel: upgrade.level });
        return { success: true };
    }

    finishUpgrade(upgradeId) {
        const upgrade = this.upgrades.get(upgradeId);
        if (!upgrade) return { success: false, error: 'UPGRADE_NOT_FOUND' };
        upgrade.status = 'finished';
        this._triggerHook('upgradeFinished', { upgradeId });
        return { success: true };
    }

    calculateUpgradeValue(upgradeId) {
        const upgrade = this.upgrades.get(upgradeId);
        if (!upgrade) return 0;
        return upgrade.level * 100 + upgrade.defense + upgrade.enhancements.length * 20;
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
        if (this.stats.totalUpgrades < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxUpgrades += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { upgrades: Array.from(this.upgrades.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.upgrades) this.upgrades = new Map(data.upgrades);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, upgradeCount: this.upgrades.size }; }
}
