/**
 * KarmaEngine.js - 因果业力引擎
 * V340 Iteration 1/9 Round 7 - Karma Engine
 *
 * 融合6大设计系统:
 * - generic-agent: 因果自循环
 * - chatdev: 业报协调
 * - nanobot: 缘分mesh
 * - claude-code: 业力分析工具
 * - thunderbolt: 因果状态持久化
 * - ruflo: 业报Hook事件
 */

export class KarmaEngine {
    constructor(config = {}) {
        this.config = {
            maxKarma: config.maxKarma || 1000,
            baseKarma: config.baseKarma || 0,
            decayRate: config.decayRate || 0.01,
            ...config
        };
        this.cultivators = new Map();
        this.actions = new Map();
        this.karmaLog = new Map();
        this.fateLines = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalActions: 0, totalKarma: 0, evolutionCount: 0 };
        this._registerDefaults();
        this._registerDefaultTools();
    }

    _registerDefaults() {
        const actionTypes = [
            { typeId: 'good', label: 'Good Deed', karma: 10, alignment: 'light' },
            { typeId: 'evil', label: 'Evil Deed', karma: -15, alignment: 'dark' },
            { typeId: 'neutral', label: 'Neutral Act', karma: 0, alignment: 'balanced' },
            { typeId: 'sacrifice', label: 'Sacrifice', karma: 25, alignment: 'light' },
            { typeId: 'greed', label: 'Greed', karma: -10, alignment: 'dark' }
        ];
        for (const t of actionTypes) this.actions.set(t.typeId, t);
    }

    _registerDefaultTools() {
        this.registerTool('getKarma', (ctx) => this.getCultivatorKarma(ctx.cultivatorId));
        this.registerTool('recordAction', (ctx) => this.recordAction(ctx.cultivatorId, ctx.actionId));
    }

    registerCultivator(data) {
        const id = data.id || `cv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cultivator = {
            cultivatorId: id,
            name: data.name || 'Anonymous',
            karma: data.karma || this.config.baseKarma,
            alignment: data.alignment || 'balanced',
            actionCount: 0,
            registeredAt: Date.now()
        };
        this.cultivators.set(id, cultivator);
        return { success: true, cultivator };
    }

    getCultivator(id) { return this.cultivators.get(id) ? { ...this.cultivators.get(id) } : null; }
    listCultivators() { return Array.from(this.cultivators.values()).map(c => ({ ...c })); }

    recordAction(cultivatorId, actionId) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        const action = this.actions.get(actionId);
        if (!action) return { success: false, error: 'ACTION_NOT_FOUND' };
        cultivator.karma = Math.max(-this.config.maxKarma, Math.min(this.config.maxKarma, cultivator.karma + action.karma));
        cultivator.alignment = cultivator.karma > 0 ? 'light' : cultivator.karma < 0 ? 'dark' : 'balanced';
        cultivator.actionCount++;
        this.stats.totalActions++;
        this.stats.totalKarma = Math.abs(cultivator.karma);
        const logId = `kl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const log = { logId, cultivatorId, actionId, karma: action.karma, newKarma: cultivator.karma, timestamp: Date.now() };
        this.karmaLog.set(logId, log);
        this._triggerHook('actionRecorded', { cultivatorId, actionId, newKarma: cultivator.karma });
        return { success: true, log, cultivator: { ...cultivator } };
    }

    getKarmaLog(cultivatorId) {
        return Array.from(this.karmaLog.values()).filter(l => l.cultivatorId === cultivatorId).map(l => ({ ...l }));
    }

    getCultivatorKarma(cultivatorId) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return null;
        return cultivator.karma;
    }

    applyDecay(cultivatorId) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        const decay = cultivator.karma * this.config.decayRate;
        cultivator.karma = cultivator.karma - decay;
        this._triggerHook('karmaDecayed', { cultivatorId, newKarma: cultivator.karma });
        return { success: true, karma: cultivator.karma };
    }

    getFateLine(cultivatorId) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return null;
        if (this.fateLines.has(cultivatorId)) return { ...this.fateLines.get(cultivatorId) };
        const fateLineId = `fl_${cultivatorId}_${Date.now()}`;
        const fateLine = { fateLineId, cultivatorId, alignment: cultivator.alignment, destiny: this._calculateDestiny(cultivator) };
        this.fateLines.set(fateLineId, fateLine);
        return { ...fateLine };
    }

    _calculateDestiny(cultivator) {
        if (cultivator.karma > 100) return 'saint_path';
        if (cultivator.karma > 0) return 'righteous_path';
        if (cultivator.karma > -100) return 'demonic_path';
        return 'fallen_path';
    }

    listActions() { return Array.from(this.actions.values()).map(a => ({ ...a })); }
    getAction(id) { return this.actions.get(id) ? { ...this.actions.get(id) } : null; }

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
        if (this.stats.totalActions < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxKarma += 200;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() {
        return {
            cultivators: Array.from(this.cultivators.entries()),
            actions: Array.from(this.actions.entries()),
            karmaLog: Array.from(this.karmaLog.entries()),
            fateLines: Array.from(this.fateLines.entries()),
            stats: this.stats, config: this.config
        };
    }
    fromJSON(data) {
        if (data.cultivators) this.cultivators = new Map(data.cultivators);
        if (data.actions) this.actions = new Map(data.actions);
        if (data.karmaLog) this.karmaLog = new Map(data.karmaLog);
        if (data.fateLines) this.fateLines = new Map(data.fateLines);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() {
        return { ...this.stats, cultivatorCount: this.cultivators.size, actionTypeCount: this.actions.size };
    }
}