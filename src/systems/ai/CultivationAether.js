/**
 * CultivationAether.js - 修真以太
 * V725 Iteration 18/30 Round 29
 *
 * 融合6大设计系统:
 * - generic-agent: 以太自循环
 * - chatdev: 以太角色协调
 * - nanobot: 以太mesh
 * - claude-code: 以太分析工具
 * - thunderbolt: 以太持久化
 * - ruflo: 以太Hook
 */

export class CultivationAether {
    constructor(config = {}) {
        this.config = { maxAethers: config.maxAethers || 20, baseEssence: config.baseEssence || 20, ...config };
        this.aethers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalAethers: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getAether', (ctx) => this.getAether(ctx.aetherId));
        this.registerTool('recruitAether', (ctx) => this.recruitAether(ctx));
    }

    recruitAether(data) {
        const id = data.id || `ath_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const aether = {
            aetherId: id,
            masterId: data.masterId,
            name: data.name || 'Cultivation Aether',
            type: data.type || 'celestial',
            essence: data.essence !== undefined ? data.essence : this.config.baseEssence,
            currents: data.currents || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.aethers.set(id, aether);
        this.stats.totalAethers++;
        this._triggerHook('aetherRecruited', { aetherId: id });
        return { success: true, aether };
    }

    getAether(id) { return this.aethers.get(id) ? { ...this.aethers.get(id) } : null; }
    listAethers() { return Array.from(this.aethers.values()).map(a => ({ ...a })); }
    listByMaster(masterId) { return Array.from(this.aethers.values()).filter(a => a.masterId === masterId).map(a => ({ ...a })); }
    listLegendary() { return Array.from(this.aethers.values()).filter(a => a.status === 'legendary').map(a => ({ ...a })); }

    addCurrent(aetherId, current) {
        const aether = this.aethers.get(aetherId);
        if (!aether) return { success: false, error: 'AETHER_NOT_FOUND' };
        aether.currents.push(current);
        this._triggerHook('currentAdded', { aetherId, current });
        return { success: true };
    }

    raiseEssence(aetherId, amount = 5) {
        const aether = this.aethers.get(aetherId);
        if (!aether) return { success: false, error: 'AETHER_NOT_FOUND' };
        aether.essence += amount;
        this._triggerHook('essenceRaised', { aetherId, newEssence: aether.essence });
        return { success: true };
    }

    levelUpAether(aetherId) {
        const aether = this.aethers.get(aetherId);
        if (!aether) return { success: false, error: 'AETHER_NOT_FOUND' };
        aether.level++;
        this._triggerHook('aetherLeveledUp', { aetherId, newLevel: aether.level });
        return { success: true };
    }

    legendAether(aetherId) {
        const aether = this.aethers.get(aetherId);
        if (!aether) return { success: false, error: 'AETHER_NOT_FOUND' };
        aether.status = 'legendary';
        this._triggerHook('aetherLegendized', { aetherId });
        return { success: true };
    }

    calculateAetherValue(aetherId) {
        const aether = this.aethers.get(aetherId);
        if (!aether) return 0;
        return aether.level * 100 + aether.essence * 2 + aether.currents.length * 30;
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
        if (this.stats.totalAethers < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxAethers += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { aethers: Array.from(this.aethers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.aethers) this.aethers = new Map(data.aethers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, aetherCount: this.aethers.size }; }
}
