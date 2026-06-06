/**
 * CultivationProphet.js - 修真预言家系统
 * V652 Iteration 5/30 Round 27 - Cultivation Prophet
 *
 * 融合6大设计系统:
 * - generic-agent: 预言家自循环
 * - chatdev: 预言家角色协调
 * - nanobot: 预言家mesh
 * - claude-code: 预言家分析工具
 * - thunderbolt: 预言家持久化
 * - ruflo: 预言家Hook
 */

export class CultivationProphet {
    constructor(config = {}) {
        this.config = { maxProphets: config.maxProphets || 20, baseVision: config.baseVision || 20, ...config };
        this.prophets = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalProphets: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getProphet', (ctx) => this.getProphet(ctx.prophetId));
        this.registerTool('recruitProphet', (ctx) => this.recruitProphet(ctx));
    }

    recruitProphet(data) {
        const id = data.prophetId || `prp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const prophet = {
            prophetId: id,
            elderId: data.elderId,
            name: data.name || 'Prophet',
            type: data.type || 'divine',
            vision: data.vision || this.config.baseVision,
            prophecies: data.prophecies || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.prophets.set(id, prophet);
        this.stats.totalProphets++;
        this._triggerHook('prophetRecruited', { prophetId: id });
        return { success: true, prophet };
    }

    getProphet(id) { return this.prophets.get(id) ? { ...this.prophets.get(id) } : null; }
    listProphets() { return Array.from(this.prophets.values()).map(p => ({ ...p })); }
    listByElder(elderId) { return Array.from(this.prophets.values()).filter(p => p.elderId === elderId).map(p => ({ ...p })); }
    listLegendary() { return Array.from(this.prophets.values()).filter(p => p.status === 'legendary').map(p => ({ ...p })); }

    addProphecy(prophetId, prophecy) {
        const prophet = this.prophets.get(prophetId);
        if (!prophet) return { success: false, error: 'PROPHET_NOT_FOUND' };
        prophet.prophecies.push(prophecy);
        this._triggerHook('prophecyAdded', { prophetId, prophecy });
        return { success: true, prophet: { ...prophet } };
    }

    sharpenVision(prophetId, amount = 5) {
        const prophet = this.prophets.get(prophetId);
        if (!prophet) return { success: false, error: 'PROPHET_NOT_FOUND' };
        prophet.vision += amount;
        this._triggerHook('visionSharpened', { prophetId, newVision: prophet.vision });
        return { success: true };
    }

    levelUpProphet(prophetId) {
        const prophet = this.prophets.get(prophetId);
        if (!prophet) return { success: false, error: 'PROPHET_NOT_FOUND' };
        prophet.level++;
        this._triggerHook('prophetLeveledUp', { prophetId, newLevel: prophet.level });
        return { success: true };
    }

    legendProphet(prophetId) {
        const prophet = this.prophets.get(prophetId);
        if (!prophet) return { success: false, error: 'PROPHET_NOT_FOUND' };
        prophet.status = 'legendary';
        this._triggerHook('prophetLegendized', { prophetId });
        return { success: true };
    }

    calculateProphetValue(prophetId) {
        const prophet = this.prophets.get(prophetId);
        if (!prophet) return 0;
        return prophet.level * 100 + prophet.vision * 2 + prophet.prophecies.length * 30;
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
        if (this.stats.totalProphets < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxProphets += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { prophets: Array.from(this.prophets.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.prophets) this.prophets = new Map(data.prophets);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, prophetCount: this.prophets.size }; }
}
