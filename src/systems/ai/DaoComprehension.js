/**
 * DaoComprehension.js - 道悟
 * V421 Iteration 13/15 Round 14 - Dao Comprehension
 *
 * 融合6大设计系统:
 * - generic-agent: 道悟自循环
 * - chatdev: 道悟角色协调
 * - nanobot: 道悟mesh
 * - claude-code: 道悟分析工具
 * - thunderbolt: 道悟持久化
 * - ruflo: 道悟Hook
 */

export class DaoComprehension {
    constructor(config = {}) {
        this.config = { maxComprehensions: config.maxComprehensions || 100, baseLevel: config.baseLevel || 1, ...config };
        this.comprehensions = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalComprehensions: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getComprehension', (ctx) => this.getComprehension(ctx.comprehensionId));
        this.registerTool('beginComprehension', (ctx) => this.beginComprehension(ctx));
    }

    beginComprehension(data) {
        const id = data.id || `dao_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const comprehension = {
            comprehensionId: id,
            cultivatorId: data.cultivatorId,
            dao: data.dao || 'unknown',
            level: data.level || this.config.baseLevel,
            insights: data.insights || 0,
            fragments: data.fragments || [],
            status: data.status || 'developing',
            createdAt: Date.now()
        };
        this.comprehensions.set(id, comprehension);
        this.stats.totalComprehensions++;
        this._triggerHook('comprehensionBegun', { comprehensionId: id });
        return { success: true, comprehension };
    }

    getComprehension(id) { return this.comprehensions.get(id) ? { ...this.comprehensions.get(id) } : null; }
    listComprehensions() { return Array.from(this.comprehensions.values()).map(c => ({ ...c })); }
    listByCultivator(cultivatorId) { return Array.from(this.comprehensions.values()).filter(c => c.cultivatorId === cultivatorId).map(c => ({ ...c })); }
    listByDao(dao) { return Array.from(this.comprehensions.values()).filter(c => c.dao === dao).map(c => ({ ...c })); }

    gainInsight(comprehensionId, amount = 5) {
        const comprehension = this.comprehensions.get(comprehensionId);
        if (!comprehension) return { success: false, error: 'COMPREHENSION_NOT_FOUND' };
        comprehension.insights += amount;
        this._triggerHook('insightGained', { comprehensionId, newInsights: comprehension.insights });
        return { success: true, comprehension: { ...comprehension } };
    }

    collectFragment(comprehensionId, fragment) {
        const comprehension = this.comprehensions.get(comprehensionId);
        if (!comprehension) return { success: false, error: 'COMPREHENSION_NOT_FOUND' };
        comprehension.fragments.push(fragment);
        this._triggerHook('fragmentCollected', { comprehensionId, fragment });
        return { success: true, comprehension: { ...comprehension } };
    }

    awakenDao(comprehensionId) {
        const comprehension = this.comprehensions.get(comprehensionId);
        if (!comprehension) return { success: false, error: 'COMPREHENSION_NOT_FOUND' };
        if (comprehension.insights < 10) return { success: false, error: 'INSUFFICIENT_INSIGHTS' };
        comprehension.status = 'awakened';
        this._triggerHook('daoAwakened', { comprehensionId });
        return { success: true, comprehension: { ...comprehension } };
    }

    calculateDaoProgress(comprehensionId) {
        const comprehension = this.comprehensions.get(comprehensionId);
        if (!comprehension) return 0;
        return comprehension.level * 10 + comprehension.insights + comprehension.fragments.length * 3;
    }

    listMastered() { return Array.from(this.comprehensions.values()).filter(c => c.status === 'mastered').map(c => ({ ...c })); }

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
        if (this.stats.totalComprehensions < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxComprehensions += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { comprehensions: Array.from(this.comprehensions.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.comprehensions) this.comprehensions = new Map(data.comprehensions);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, comprehensionCount: this.comprehensions.size }; }
}
