/**
 * CultivationAurora.js - 修真极光系统
 * V812 Iteration 15/30 Round 32
 *
 * 融合6大设计系统:
 * - generic-agent: 极光自循环
 * - chatdev: 极光角色协调
 * - nanobot: 极光mesh
 * - claude-code: 极光分析工具
 * - thunderbolt: 极光持久化
 * - ruflo: 极光Hook
 */

export class CultivationAurora {
    constructor(config = {}) {
        this.config = { maxAuroras: config.maxAuroras || 20, baseRadiance: config.baseRadiance || 20, ...config };
        this.auroras = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalAuroras: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getAurora', (ctx) => this.getAurora(ctx.auroraId));
        this.registerTool('recruitAurora', (ctx) => this.recruitAurora(ctx));
    }

    recruitAurora(data) {
        const id = data.auroraId || `aur_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const aurora = {
            auroraId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Aurora',
            type: data.type || 'polar',
            radiance: data.radiance || this.config.baseRadiance,
            colors: data.colors || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.auroras.set(id, aurora);
        this.stats.totalAuroras++;
        this._triggerHook('auroraRecruited', { auroraId: id });
        return { success: true, aurora };
    }

    getAurora(id) { return this.auroras.get(id) ? { ...this.auroras.get(id) } : null; }
    listAuroras() { return Array.from(this.auroras.values()).map(a => ({ ...a })); }
    listByMaster(masterId) { return Array.from(this.auroras.values()).filter(a => a.masterId === masterId).map(a => ({ ...a })); }
    listLegendary() { return Array.from(this.auroras.values()).filter(a => a.status === 'legendary').map(a => ({ ...a })); }

    addColor(auroraId, color) {
        const aurora = this.auroras.get(auroraId);
        if (!aurora) return { success: false, error: 'AURORA_NOT_FOUND' };
        aurora.colors.push(color);
        this._triggerHook('colorAdded', { auroraId, color });
        return { success: true, aurora: { ...aurora } };
    }

    raiseRadiance(auroraId, amount = 5) {
        const aurora = this.auroras.get(auroraId);
        if (!aurora) return { success: false, error: 'AURORA_NOT_FOUND' };
        aurora.radiance += amount;
        this._triggerHook('radianceRaised', { auroraId, newRadiance: aurora.radiance });
        return { success: true };
    }

    levelUpAurora(auroraId) {
        const aurora = this.auroras.get(auroraId);
        if (!aurora) return { success: false, error: 'AURORA_NOT_FOUND' };
        aurora.level++;
        this._triggerHook('auroraLeveledUp', { auroraId, newLevel: aurora.level });
        return { success: true };
    }

    legendAurora(auroraId) {
        const aurora = this.auroras.get(auroraId);
        if (!aurora) return { success: false, error: 'AURORA_NOT_FOUND' };
        aurora.status = 'legendary';
        this._triggerHook('auroraLegendized', { auroraId });
        return { success: true, aurora: { ...aurora } };
    }

    calculateAuroraValue(auroraId) {
        const aurora = this.auroras.get(auroraId);
        if (!aurora) return 0;
        return aurora.level * 100 + aurora.radiance * 2 + aurora.colors.length * 30;
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
        if (this.stats.totalAuroras < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxAuroras += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { auroras: Array.from(this.auroras.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.auroras) this.auroras = new Map(data.auroras);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, auroraCount: this.auroras.size }; }
}
