/**
 * CultivationDreamParallelLives.js - 修真平行人生
 * V874 Iteration 8/30 Round 34
 */
export const CHOICE_BRANCHES = ['martial', 'scholar', 'merchant'];
export const OUTCOME_TYPES = ['triumph', 'struggle', 'neutral', 'tragedy', 'enlightenment'];
export const COMPARISON_RULES = ['divergence_point', 'key_decisions', 'convergence', 'cumulative', 'dominant_path'];

export class CultivationDreamParallelLives {
    constructor(config = {}) {
        this.config = { maxLives: config.maxLives || 50, baseChoices: config.baseChoices ?? 3, ...config };
        this.lives = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEntered: 0, totalExited: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getLife', (ctx) => this.getLife(ctx.lifeId));
        this.registerTool('listByBranch', (ctx) => this.listByBranch(ctx.choiceBranch));
    }

    enterParallelLife(dreamId, choiceBranch) {
        if (!CHOICE_BRANCHES.includes(choiceBranch)) return { success: false, error: 'INVALID_BRANCH' };
        const id = `life_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const outcome = OUTCOME_TYPES[Math.floor(Math.random() * OUTCOME_TYPES.length)];
        const life = {
            id, dreamId, choiceBranch, outcome,
            choicesCount: this.config.baseChoices,
            parallelAt: Date.now(), exited: false
        };
        this.lives.set(id, life);
        this.stats.totalEntered++;
        this._triggerHook('lifeEntered', { id, dreamId, choiceBranch });
        return { success: true, life };
    }

    getLife(id) { return this.lives.get(id) ? { ...this.lives.get(id) } : null; }
    listLives() { return Array.from(this.lives.values()).map(l => ({ ...l })); }
    listByBranch(choiceBranch) { return Array.from(this.lives.values()).filter(l => l.choiceBranch === choiceBranch).map(l => ({ ...l })); }
    listByDream(dreamId) { return Array.from(this.lives.values()).filter(l => l.dreamId === dreamId).map(l => ({ ...l })); }
    listActive() { return Array.from(this.lives.values()).filter(l => !l.exited).map(l => ({ ...l })); }

    compareOutcomes(lifeIds) {
        if (!Array.isArray(lifeIds) || lifeIds.length < 2) return { success: false, error: 'NEED_TWO_LIVES' };
        const valid = lifeIds.filter(id => this.lives.has(id));
        if (valid.length < 2) return { success: false, error: 'INSUFFICIENT_LIVES' };
        const outcomes = valid.map(id => ({ id, outcome: this.lives.get(id).outcome, branch: this.lives.get(id).choiceBranch }));
        const branches = new Set(outcomes.map(o => o.branch));
        const similarity = branches.size === 1 ? 1 : 0;
        this._triggerHook('outcomesCompared', { lifeIds: valid });
        return { success: true, outcomes, similarity, count: valid.length };
    }

    exitParallel(lifeId) {
        const life = this.lives.get(lifeId);
        if (!life) return { success: false, error: 'LIFE_NOT_FOUND' };
        life.exited = true;
        life.exitedAt = Date.now();
        this.stats.totalExited++;
        this._triggerHook('lifeExited', { lifeId });
        return { success: true };
    }

    addChoice(lifeId, count = 1) {
        const life = this.lives.get(lifeId);
        if (!life) return { success: false, error: 'LIFE_NOT_FOUND' };
        life.choicesCount = Math.max(0, life.choicesCount + count);
        return { success: true, choicesCount: life.choicesCount };
    }

    setOutcome(lifeId, outcome) {
        const life = this.lives.get(lifeId);
        if (!life) return { success: false, error: 'LIFE_NOT_FOUND' };
        if (!OUTCOME_TYPES.includes(outcome)) return { success: false, error: 'INVALID_OUTCOME' };
        life.outcome = outcome;
        return { success: true };
    }

    deleteLife(lifeId) {
        if (!this.lives.has(lifeId)) return { success: false, error: 'LIFE_NOT_FOUND' };
        this.lives.delete(lifeId);
        this._triggerHook('lifeDeleted', { lifeId });
        return { success: true };
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

    toJSON() { return { lives: Array.from(this.lives.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.lives) this.lives = new Map(data.lives);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, lifeCount: this.lives.size }; }
}
