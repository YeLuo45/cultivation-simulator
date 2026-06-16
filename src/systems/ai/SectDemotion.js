/**
 * SectDemotion.js - 宗门降级系统
 * V492 Iteration 9/15 Round 19 - Sect Demotion System
 *
 * 融合6大设计系统:
 * - generic-agent: 宗门降级循环
 * - chatdev: 宗门处分协调
 * - nanobot: 宗门降级mesh
 * - claude-code: 宗门降级分析工具
 * - thunderbolt: 宗门降级持久化
 * - ruflo: 宗门降级Hook
 */

export class SectDemotion {
    constructor(config = {}) {
        this.config = { maxDemotions: config.maxDemotions || 100, baseReason: config.baseReason || 'unspecified', ...config };
        this.demotions = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDemotions: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDemotion', (ctx) => this.getDemotion(ctx.demotionId));
        this.registerTool('recordDemotion', (ctx) => this.recordDemotion(ctx));
    }

    recordDemotion(data) {
        const id = data.demotionId || data.id || `dmt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        let reasons;
        if (Array.isArray(data.reason)) {
            reasons = [...data.reason];
        } else if (typeof data.reason === 'string') {
            reasons = [data.reason];
        } else {
            reasons = [this.config.baseReason];
        }
        const demotion = {
            demotionId: id,
            sectId: data.sectId,
            member: data.member,
            fromRank: data.fromRank,
            toRank: data.toRank,
            reason: reasons,
            status: 'pending',
            createdAt: Date.now()
        };
        this.demotions.set(id, demotion);
        this.stats.totalDemotions++;
        this._triggerHook('demotionRecorded', { demotionId: id });
        return { success: true, demotion };
    }

    getDemotion(id) { const d = this.demotions.get(id); return d ? { ...d, reason: [...d.reason] } : null; }
    listDemotions() { return Array.from(this.demotions.values()).map(d => ({ ...d, reason: [...d.reason] })); }
    listBySect(sectId) { return Array.from(this.demotions.values()).filter(d => d.sectId === sectId).map(d => ({ ...d, reason: [...d.reason] })); }
    listExecuted() { return Array.from(this.demotions.values()).filter(d => d.status === 'executed').map(d => ({ ...d, reason: [...d.reason] })); }

    addReason(demotionId, reason) {
        const demotion = this.demotions.get(demotionId);
        if (!demotion) return { success: false, error: 'DEMOTION_NOT_FOUND' };
        demotion.reason.push(reason);
        this._triggerHook('reasonAdded', { demotionId, reason });
        return { success: true };
    }

    executeDemotion(demotionId) {
        const demotion = this.demotions.get(demotionId);
        if (!demotion) return { success: false, error: 'DEMOTION_NOT_FOUND' };
        demotion.status = 'executed';
        this._triggerHook('demotionExecuted', { demotionId });
        return { success: true };
    }

    overturnDemotion(demotionId) {
        const demotion = this.demotions.get(demotionId);
        if (!demotion) return { success: false, error: 'DEMOTION_NOT_FOUND' };
        demotion.status = 'overturned';
        this._triggerHook('demotionOverturned', { demotionId });
        return { success: true };
    }

    calculateDemotionSeverity(demotionId) {
        const demotion = this.demotions.get(demotionId);
        if (!demotion) return 0;
        return demotion.reason.length * 5 + demotion.toRank.length;
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
        if (this.stats.totalDemotions < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDemotions += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { demotions: Array.from(this.demotions.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.demotions) this.demotions = new Map(data.demotions);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, demotionCount: this.demotions.size }; }
}
