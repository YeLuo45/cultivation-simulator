/**
 * CultivationTier.js - 修真境界系统
 * V550 Iteration 13/20 Round 22 - Cultivation Tier
 */

export class CultivationTier {
    constructor(config = {}) {
        this.config = { maxTiers: config.maxTiers || 50, basePower: config.basePower || 20, ...config };
        this.tiers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTiers: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTier', (ctx) => this.getTier(ctx.tierId));
        this.registerTool('openTier', (ctx) => this.openTier(ctx));
    }

    openTier(data) {
        const id = data.tierId || `tier_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const tier = {
            tierId: id,
            cultivatorId: data.cultivatorId,
            name: data.name || 'Unnamed Tier',
            type: data.type || 'mortal',
            power: data.power !== undefined ? data.power : this.config.basePower,
            breakthroughs: [],
            level: data.level || 1,
            status: data.status || 'forming',
            createdAt: Date.now()
        };
        this.tiers.set(id, tier);
        this.stats.totalTiers++;
        this._triggerHook('tierOpened', { tierId: id });
        return { success: true, tier };
    }

    getTier(id) { return this.tiers.get(id) ? { ...this.tiers.get(id) } : null; }
    listTiers() { return Array.from(this.tiers.values()).map(t => ({ ...t })); }
    listByCultivator(cultivatorId) { return Array.from(this.tiers.values()).filter(t => t.cultivatorId === cultivatorId).map(t => ({ ...t })); }
    listPeak() { return Array.from(this.tiers.values()).filter(t => t.status === 'peak').map(t => ({ ...t })); }

    addBreakthrough(tierId, breakthrough) {
        const tier = this.tiers.get(tierId);
        if (!tier) return { success: false, error: 'TIER_NOT_FOUND' };
        tier.breakthroughs.push(breakthrough);
        this._triggerHook('breakthroughAdded', { tierId, breakthrough });
        return { success: true, tier: { ...tier } };
    }

    increasePower(tierId, amount = 5) {
        const tier = this.tiers.get(tierId);
        if (!tier) return { success: false, error: 'TIER_NOT_FOUND' };
        tier.power += amount;
        this._triggerHook('powerIncreased', { tierId, newPower: tier.power });
        return { success: true };
    }

    levelUpTier(tierId) {
        const tier = this.tiers.get(tierId);
        if (!tier) return { success: false, error: 'TIER_NOT_FOUND' };
        tier.level++;
        this._triggerHook('tierLeveledUp', { tierId, newLevel: tier.level });
        return { success: true };
    }

    peakTier(tierId) {
        const tier = this.tiers.get(tierId);
        if (!tier) return { success: false, error: 'TIER_NOT_FOUND' };
        tier.status = 'peak';
        this._triggerHook('tierPeak', { tierId });
        return { success: true };
    }

    calculateTierPower(tierId) {
        const tier = this.tiers.get(tierId);
        if (!tier) return 0;
        return tier.level * 100 + tier.power * 2 + tier.breakthroughs.length * 30;
    }

    listByType(type) { return Array.from(this.tiers.values()).filter(t => t.type === type).map(t => ({ ...t })); }

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
        if (this.stats.totalTiers < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTiers += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { tiers: Array.from(this.tiers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.tiers) this.tiers = new Map(data.tiers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, tierCount: this.tiers.size }; }
}
