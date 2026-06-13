/**
 * MindCore.js - 心境核心
 * V394 Iteration 1/15 Round 13 - Mind Core
 *
 * 融合6大设计系统:
 * - generic-agent: 心境自循环
 * - chatdev: 心境角色协调
 * - nanobot: 心境mesh
 * - claude-code: 心境分析工具
 * - thunderbolt: 心境持久化
 * - ruflo: 心境Hook
 */

export class MindCore {
    constructor(config = {}) {
        this.config = { maxMinds: config.maxMinds || 100, baseClarity: config.baseClarity || 50, ...config };
        this.minds = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMinds: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMind', (ctx) => this.getMind(ctx.mindId));
        this.registerTool('registerMind', (ctx) => this.registerMind(ctx));
    }

    registerMind(data) {
        const id = data.id || `mnd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const mind = { mindId: id, cultivatorId: data.cultivatorId, clarity: data.clarity || this.config.baseClarity, stability: 100, focus: 100, calmness: 100, daoHeart: 0, createdAt: Date.now() };
        this.minds.set(id, mind);
        this.stats.totalMinds++;
        this._triggerHook('mindRegistered', { mindId: id });
        return { success: true, mind };
    }

    getMind(id) { return this.minds.get(id) ? { ...this.minds.get(id) } : null; }
    listMinds() { return Array.from(this.minds.values()).map(m => ({ ...m })); }
    listByCultivator(cultivatorId) { return Array.from(this.minds.values()).filter(m => m.cultivatorId === cultivatorId).map(m => ({ ...m })); }
    listByClarity(min) { return Array.from(this.minds.values()).filter(m => m.clarity >= min).map(m => ({ ...m })); }

    meditate(mindId, amount = 5) {
        const mind = this.minds.get(mindId);
        if (!mind) return { success: false, error: 'MIND_NOT_FOUND' };
        mind.clarity = Math.min(100, mind.clarity + amount);
        mind.calmness = Math.min(100, mind.calmness + amount);
        mind.daoHeart++;
        this._triggerHook('meditationDone', { mindId, newClarity: mind.clarity });
        return { success: true, mind: { ...mind } };
    }

    disturb(mindId, amount = 10) {
        const mind = this.minds.get(mindId);
        if (!mind) return { success: false, error: 'MIND_NOT_FOUND' };
        mind.clarity = Math.max(0, mind.clarity - amount);
        mind.calmness = Math.max(0, mind.calmness - amount);
        mind.stability = Math.max(0, mind.stability - amount);
        this._triggerHook('mindDisturbed', { mindId, newClarity: mind.clarity });
        return { success: true };
    }

    focusOn(mindId, amount = 5) {
        const mind = this.minds.get(mindId);
        if (!mind) return { success: false, error: 'MIND_NOT_FOUND' };
        mind.focus = Math.min(100, mind.focus + amount);
        this._triggerHook('mindFocused', { mindId });
        return { success: true };
    }

    calculatePower(mindId) {
        const mind = this.minds.get(mindId);
        if (!mind) return 0;
        return (mind.clarity + mind.stability + mind.focus + mind.calmness) / 4 + mind.daoHeart * 2;
    }

    listStable() { return Array.from(this.minds.values()).filter(m => m.stability >= 80).map(m => ({ ...m })); }

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
        if (this.stats.totalMinds < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMinds += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { minds: Array.from(this.minds.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.minds) this.minds = new Map(data.minds);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, mindCount: this.minds.size }; }
}