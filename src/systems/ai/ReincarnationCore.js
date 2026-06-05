/**
 * ReincarnationCore.js - 轮回核心
 * V367 Iteration 1/9 Round 10 - Reincarnation Core
 *
 * 融合6大设计系统:
 * - generic-agent: 轮回自循环
 * - chatdev: 轮回角色协调
 * - nanobot: 业力mesh
 * - claude-code: 轮回分析工具
 * - thunderbolt: 轮回持久化
 * - ruflo: 轮回Hook
 */

export class ReincarnationCore {
    constructor(config = {}) {
        this.config = { maxCycles: config.maxCycles || 100, baseKarma: config.baseKarma || 0, ...config };
        this.souls = new Map();
        this.cycles = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCycles: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSoul', (ctx) => this.getSoul(ctx.soulId));
        this.registerTool('listSouls', () => Array.from(this.souls.values()).map(s => ({...s})));
    }

    registerSoul(data) {
        const id = data.id || `soul_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const soul = { soulId: id, name: data.name || 'Soul', karma: data.karma || this.config.baseKarma, cycle: 0, level: 1, age: 0, createdAt: Date.now() };
        this.souls.set(id, soul);
        this._triggerHook('soulRegistered', { soulId: id });
        return { success: true, soul };
    }

    getSoul(id) { return this.souls.get(id) ? { ...this.souls.get(id) } : null; }
    listSouls() { return Array.from(this.souls.values()).map(s => ({ ...s })); }
    listByLevel(level) { return Array.from(this.souls.values()).filter(s => s.level === level).map(s => ({ ...s })); }
    listByKarma(min, max) { return Array.from(this.souls.values()).filter(s => s.karma >= min && s.karma <= max).map(s => ({ ...s })); }

    reincarnate(soulId, newName) {
        const soul = this.souls.get(soulId);
        if (!soul) return { success: false, error: 'SOUL_NOT_FOUND' };
        const id = `cyc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cycle = { cycleId: id, soulId, cycleNumber: soul.cycle + 1, karma: soul.karma, newName: newName || `${soul.name}-${soul.cycle + 1}`, reincarnatedAt: Date.now() };
        this.cycles.set(id, cycle);
        soul.cycle++;
        soul.name = cycle.newName;
        soul.karma = Math.floor(soul.karma * 0.9);
        this.stats.totalCycles++;
        this._triggerHook('reincarnationCompleted', { soulId, cycleId: id });
        return { success: true, cycle, soul: { ...soul } };
    }

    addKarma(soulId, amount) {
        const soul = this.souls.get(soulId);
        if (!soul) return { success: false, error: 'SOUL_NOT_FOUND' };
        soul.karma += amount;
        this._triggerHook('karmaChanged', { soulId, amount });
        return { success: true, soul: { ...soul } };
    }

    advanceAge(soulId, years) {
        const soul = this.souls.get(soulId);
        if (!soul) return { success: false, error: 'SOUL_NOT_FOUND' };
        soul.age += years;
        this._triggerHook('ageAdvanced', { soulId, years });
        return { success: true };
    }

    getCycle(id) { return this.cycles.get(id) ? { ...this.cycles.get(id) } : null; }
    listCycles() { return Array.from(this.cycles.values()).map(c => ({ ...c })); }
    listCyclesBySoul(soulId) { return Array.from(this.cycles.values()).filter(c => c.soulId === soulId).map(c => ({ ...c })); }

    calculateSoulLevel(soulId) {
        const soul = this.souls.get(soulId);
        if (!soul) return null;
        return 1 + Math.floor(soul.cycle / 3) + Math.floor(Math.abs(soul.karma) / 100);
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
        if (this.stats.totalCycles < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCycles += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { souls: Array.from(this.souls.entries()), cycles: Array.from(this.cycles.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.souls) this.souls = new Map(data.souls);
        if (data.cycles) this.cycles = new Map(data.cycles);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, soulCount: this.souls.size, cycleCount: this.cycles.size }; }
}