/**
 * CultivationEmerald.js - 修真绿宝石系统
 * V835 Iteration 8/30 Round 33
 */
export class CultivationEmerald {
    constructor(config = {}) {
        this.config = { maxEmeralds: config.maxEmeralds || 20, baseLushness: config.baseLushness || 20, ...config };
        this.emeralds = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEmeralds: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getEmerald', (ctx) => this.getEmerald(ctx.emeraldId));
        this.registerTool('recruitEmerald', (ctx) => this.recruitEmerald(ctx));
    }

    recruitEmerald(data) {
        const id = data.id || `emr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const emerald = {
            emeraldId: id,
            masterId: data.masterId || 'unknown_master',
            name: data.name || 'unnamed_emerald',
            type: data.type || 'colombian',
            lushness: data.lushness || this.config.baseLushness,
            inclusions: data.inclusions || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.emeralds.set(id, emerald);
        this.stats.totalEmeralds++;
        this._triggerHook('emeraldRecruited', { emeraldId: id });
        return { success: true, emerald };
    }

    getEmerald(id) { return this.emeralds.get(id) ? { ...this.emeralds.get(id) } : null; }
    listEmeralds() { return Array.from(this.emeralds.values()).map(e => ({ ...e })); }
    listByMaster(masterId) { return Array.from(this.emeralds.values()).filter(e => e.masterId === masterId).map(e => ({ ...e })); }
    listLegendary() { return Array.from(this.emeralds.values()).filter(e => e.status === 'legendary').map(e => ({ ...e })); }

    addInclusion(emeraldId, inclusion) {
        const emerald = this.emeralds.get(emeraldId);
        if (!emerald) return { success: false, error: 'EMERALD_NOT_FOUND' };
        emerald.inclusions.push(inclusion);
        if (emerald.inclusions.length >= 5) emerald.status = 'veteran';
        this._triggerHook('inclusionAdded', { emeraldId, inclusion });
        return { success: true };
    }

    raiseLushness(emeraldId, amount = 5) {
        const emerald = this.emeralds.get(emeraldId);
        if (!emerald) return { success: false, error: 'EMERALD_NOT_FOUND' };
        emerald.lushness += amount;
        this._triggerHook('lushnessRaised', { emeraldId, newLushness: emerald.lushness });
        return { success: true };
    }

    levelUpEmerald(emeraldId) {
        const emerald = this.emeralds.get(emeraldId);
        if (!emerald) return { success: false, error: 'EMERALD_NOT_FOUND' };
        emerald.level++;
        this._triggerHook('emeraldLeveledUp', { emeraldId, newLevel: emerald.level });
        return { success: true };
    }

    legendEmerald(emeraldId) {
        const emerald = this.emeralds.get(emeraldId);
        if (!emerald) return { success: false, error: 'EMERALD_NOT_FOUND' };
        emerald.status = 'legendary';
        this._triggerHook('emeraldLegendized', { emeraldId });
        return { success: true };
    }

    calculateEmeraldValue(emeraldId) {
        const emerald = this.emeralds.get(emeraldId);
        if (!emerald) return 0;
        return emerald.level * 100 + emerald.lushness * 2 + emerald.inclusions.length * 30;
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
        if (this.stats.totalEmeralds < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxEmeralds += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { emeralds: Array.from(this.emeralds.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.emeralds) this.emeralds = new Map(data.emeralds);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, emeraldCount: this.emeralds.size }; }
}
