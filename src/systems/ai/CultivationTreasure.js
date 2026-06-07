/**
 * CultivationTreasure.js - 修真宝物系统
 * V699 Iteration 22/30 Round 28
 */
export class CultivationTreasure {
    constructor(config = {}) {
        this.config = { maxTreasures: config.maxTreasures || 20, baseRarity: config.baseRarity || 20, ...config };
        this.treasures = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTreasures: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTreasure', (ctx) => this.getTreasure(ctx.treasureId));
        this.registerTool('recruitTreasure', (ctx) => this.recruitTreasure(ctx));
    }

    recruitTreasure(data) {
        const id = data.treasureId || data.id || `trsr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const treasure = {
            treasureId: id,
            masterId: data.masterId,
            name: data.name || 'Cultivation Treasure',
            type: data.type || 'weapon',
            rarity: data.rarity || this.config.baseRarity,
            enchantments: data.enchantments || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.treasures.set(id, treasure);
        this.stats.totalTreasures++;
        this._triggerHook('treasureRecruited', { treasureId: id });
        return { success: true, treasure };
    }

    getTreasure(id) { return this.treasures.get(id) ? { ...this.treasures.get(id) } : null; }
    listTreasures() { return Array.from(this.treasures.values()).map(t => ({ ...t })); }
    listByMaster(masterId) { return Array.from(this.treasures.values()).filter(t => t.masterId === masterId).map(t => ({ ...t })); }
    listLegendary() { return Array.from(this.treasures.values()).filter(t => t.status === 'legendary').map(t => ({ ...t })); }

    addEnchantment(treasureId, enchantment) {
        const treasure = this.treasures.get(treasureId);
        if (!treasure) return { success: false, error: 'TREASURE_NOT_FOUND' };
        treasure.enchantments.push(enchantment);
        this._triggerHook('enchantmentAdded', { treasureId, enchantment });
        return { success: true };
    }

    raiseRarity(treasureId, amount = 5) {
        const treasure = this.treasures.get(treasureId);
        if (!treasure) return { success: false, error: 'TREASURE_NOT_FOUND' };
        treasure.rarity += amount;
        this._triggerHook('rarityRaised', { treasureId, newRarity: treasure.rarity });
        return { success: true };
    }

    levelUpTreasure(treasureId) {
        const treasure = this.treasures.get(treasureId);
        if (!treasure) return { success: false, error: 'TREASURE_NOT_FOUND' };
        treasure.level++;
        this._triggerHook('treasureLeveledUp', { treasureId, newLevel: treasure.level });
        return { success: true };
    }

    legendTreasure(treasureId) {
        const treasure = this.treasures.get(treasureId);
        if (!treasure) return { success: false, error: 'TREASURE_NOT_FOUND' };
        treasure.status = 'legendary';
        this._triggerHook('treasureLegendized', { treasureId });
        return { success: true };
    }

    calculateTreasureValue(treasureId) {
        const treasure = this.treasures.get(treasureId);
        if (!treasure) return 0;
        return treasure.level * 100 + treasure.rarity * 2 + treasure.enchantments.length * 30;
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
        if (this.stats.totalTreasures < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTreasures += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { treasures: Array.from(this.treasures.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.treasures) this.treasures = new Map(data.treasures);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, treasureCount: this.treasures.size }; }
}
