/**
 * FormationBreaking.js - 破阵系统
 * V414 Iteration 6/15 Round 14
 */
export class FormationBreaking {
    constructor(config = {}) {
        this.config = { maxBreakings: config.maxBreakings || 100, baseDifficulty: config.baseDifficulty || 100, ...config };
        this.breakings = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBreakings: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBreaking', (ctx) => this.getBreaking(ctx.breakingId));
        this.registerTool('startBreaking', (ctx) => this.startBreaking(ctx));
    }

    startBreaking(data) {
        const id = data.id || `brk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const breaking = { breakingId: id, cultivatorId: data.cultivatorId, formationId: data.formationId, difficulty: data.difficulty || this.config.baseDifficulty, progress: 0, attempts: 0, status: 'attempted', startedAt: Date.now() };
        this.breakings.set(id, breaking);
        this.stats.totalBreakings++;
        this._triggerHook('breakingStarted', { breakingId: id });
        return { success: true, breaking };
    }

    getBreaking(id) { return this.breakings.get(id) ? { ...this.breakings.get(id) } : null; }
    listBreakings() { return Array.from(this.breakings.values()).map(b => ({ ...b })); }
    listByCultivator(cultivatorId) { return Array.from(this.breakings.values()).filter(b => b.cultivatorId === cultivatorId).map(b => ({ ...b })); }
    listByStatus(status) { return Array.from(this.breakings.values()).filter(b => b.status === status).map(b => ({ ...b })); }
    listByFormation(formationId) { return Array.from(this.breakings.values()).filter(b => b.formationId === formationId).map(b => ({ ...b })); }

    analyzeBreaking(breakingId, amount = 10) {
        const breaking = this.breakings.get(breakingId);
        if (!breaking) return { success: false, error: 'BREAKING_NOT_FOUND' };
        breaking.progress += amount;
        breaking.attempts++;
        this._triggerHook('breakingAnalyzed', { breakingId, progress: breaking.progress });
        return { success: true };
    }

    completeBreaking(breakingId) {
        const breaking = this.breakings.get(breakingId);
        if (!breaking) return { success: false, error: 'BREAKING_NOT_FOUND' };
        if (breaking.progress >= breaking.difficulty) {
            breaking.status = 'broken';
            this._triggerHook('breakingCompleted', { breakingId });
            return { success: true, status: 'broken' };
        } else {
            breaking.status = 'failed';
            this._triggerHook('breakingFailed', { breakingId });
            return { success: true, status: 'failed' };
        }
    }

    calculateProgressRate(breakingId) {
        const breaking = this.breakings.get(breakingId);
        if (!breaking) return 0;
        return breaking.progress / breaking.difficulty;
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
        if (this.stats.totalBreakings < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBreakings += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { breakings: Array.from(this.breakings.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.breakings) this.breakings = new Map(data.breakings);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, breakingCount: this.breakings.size }; }
}
