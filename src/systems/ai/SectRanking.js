/**
 * SectRanking.js - 宗门排行系统
 * V462 Iteration 9/15 Round 17
 */
export class SectRanking {
    constructor(config = {}) {
        this.config = { maxRankings: config.maxRankings || 200, baseScore: config.baseScore || 1000, ...config };
        this.rankings = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRankings: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRanking', (ctx) => this.getRanking(ctx.rankingId));
        this.registerTool('registerRanking', (ctx) => this.registerRanking(ctx));
    }

    registerRanking(data) {
        const id = data.id || `rnk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const ranking = { rankingId: id, sectId: data.sectId, rank: 1, score: data.score || this.config.baseScore, achievements: [], victories: 0, status: 'stable', createdAt: Date.now() };
        this.rankings.set(id, ranking);
        this.stats.totalRankings++;
        this._triggerHook('rankingRegistered', { rankingId: id });
        return { success: true, ranking };
    }

    getRanking(id) { return this.rankings.get(id) ? { ...this.rankings.get(id) } : null; }
    listRankings() { return Array.from(this.rankings.values()).map(r => ({ ...r })); }
    listBySect(sectId) { return Array.from(this.rankings.values()).filter(r => r.sectId === sectId).map(r => ({ ...r })); }
    listTop(n = 10) { return Array.from(this.rankings.values()).sort((a, b) => b.score - a.score).slice(0, n).map(r => ({ ...r })); }
    listRising() { return Array.from(this.rankings.values()).filter(r => r.status === 'rising').map(r => ({ ...r })); }

    gainScore(rankingId, amount = 10) {
        const ranking = this.rankings.get(rankingId);
        if (!ranking) return { success: false, error: 'RANKING_NOT_FOUND' };
        ranking.score += amount;
        if (ranking.status !== 'falling') ranking.status = 'rising';
        this._recomputeRanks();
        this._triggerHook('scoreGained', { rankingId, newScore: ranking.score });
        return { success: true };
    }

    addAchievement(rankingId, achievement) {
        const ranking = this.rankings.get(rankingId);
        if (!ranking) return { success: false, error: 'RANKING_NOT_FOUND' };
        ranking.achievements.push(achievement);
        this._triggerHook('achievementAdded', { rankingId, achievement });
        return { success: true };
    }

    declareVictory(rankingId, amount = 5) {
        const ranking = this.rankings.get(rankingId);
        if (!ranking) return { success: false, error: 'RANKING_NOT_FOUND' };
        ranking.victories += amount;
        ranking.status = 'rising';
        this._triggerHook('victoryDeclared', { rankingId, victories: ranking.victories });
        return { success: true };
    }

    calculateRankScore(rankingId) {
        const ranking = this.rankings.get(rankingId);
        if (!ranking) return 0;
        return ranking.score + ranking.achievements.length * 50 + ranking.victories * 30;
    }

    _recomputeRanks() {
        const sorted = Array.from(this.rankings.values()).sort((a, b) => b.score - a.score);
        sorted.forEach((r, idx) => { r.rank = idx + 1; });
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
        if (this.stats.totalRankings < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxRankings += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { rankings: Array.from(this.rankings.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.rankings) this.rankings = new Map(data.rankings);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, rankingCount: this.rankings.size }; }
}
