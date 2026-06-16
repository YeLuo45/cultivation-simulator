/**
 * InsightSystem.js - 修炼感悟系统
 * V341 Iteration 2/9 Round 7
 */
export class InsightSystem {
    constructor(config = {}) {
        this.config = { maxInsights: config.maxInsights || 200, baseExp: config.baseExp || 10, ...config };
        this.cultivators = new Map();
        this.insights = new Map();
        this.meditationSessions = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalInsights: 0, totalMeditations: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCultivator', (ctx) => this.getCultivator(ctx.cultivatorId));
        this.registerTool('gainInsight', (ctx) => this.gainInsight(ctx.cultivatorId, ctx.topic, ctx.quality));
    }

    registerCultivator(data) {
        const id = data.id || `cv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cultivator = { cultivatorId: id, name: data.name || 'Anonymous', comprehension: data.comprehension || 1.0, insightExp: 0, insightLevel: 1, createdAt: Date.now() };
        this.cultivators.set(id, cultivator);
        return { success: true, cultivator };
    }

    getCultivator(id) { return this.cultivators.get(id) ? { ...this.cultivators.get(id) } : null; }
    listCultivators() { return Array.from(this.cultivators.values()).map(c => ({ ...c })); }

    gainInsight(cultivatorId, topic, quality = 1) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        const id = `ins_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const exp = Math.floor(this.config.baseExp * quality * cultivator.comprehension);
        const insight = { insightId: id, cultivatorId, topic: topic || 'mystery', quality, exp, createdAt: Date.now() };
        this.insights.set(id, insight);
        cultivator.insightExp += exp;
        const newLevel = 1 + Math.floor(cultivator.insightExp / 100);
        const leveled = newLevel > cultivator.insightLevel;
        cultivator.insightLevel = newLevel;
        this.stats.totalInsights++;
        this._triggerHook('insightGained', { cultivatorId, insightId: id, exp });
        if (leveled) this._triggerHook('insightLevelUp', { cultivatorId, newLevel });
        return { success: true, insight, leveledUp: leveled, cultivator: { ...cultivator } };
    }

    getInsight(id) { return this.insights.get(id) ? { ...this.insights.get(id) } : null; }
    listInsights(cultivatorId) {
        if (cultivatorId) return Array.from(this.insights.values()).filter(i => i.cultivatorId === cultivatorId).map(i => ({ ...i }));
        return Array.from(this.insights.values()).map(i => ({ ...i }));
    }
    listByQuality(minQuality) { return Array.from(this.insights.values()).filter(i => i.quality >= minQuality).map(i => ({ ...i })); }

    startMeditation(cultivatorId, duration = 30) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        const id = `med_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const session = { sessionId: id, cultivatorId, duration, status: 'in_progress', startedAt: Date.now() };
        this.meditationSessions.set(id, session);
        this.stats.totalMeditations++;
        this._triggerHook('meditationStarted', { cultivatorId, sessionId: id });
        return { success: true, session };
    }

    completeMeditation(sessionId) {
        const session = this.meditationSessions.get(sessionId);
        if (!session) return { success: false, error: 'SESSION_NOT_FOUND' };
        if (session.status !== 'in_progress') return { success: false, error: 'SESSION_INACTIVE' };
        session.status = 'completed';
        session.completedAt = Date.now();
        const quality = Math.min(3, Math.floor(session.duration / 30) + 1);
        this.gainInsight(session.cultivatorId, 'meditation', quality);
        this._triggerHook('meditationCompleted', { sessionId });
        return { success: true, session: { ...session } };
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
        if (this.stats.totalInsights < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.baseExp += 5;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { cultivators: Array.from(this.cultivators.entries()), insights: Array.from(this.insights.entries()), meditationSessions: Array.from(this.meditationSessions.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.cultivators) this.cultivators = new Map(data.cultivators);
        if (data.insights) this.insights = new Map(data.insights);
        if (data.meditationSessions) this.meditationSessions = new Map(data.meditationSessions);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, cultivatorCount: this.cultivators.size, insightCount: this.insights.size }; }
}