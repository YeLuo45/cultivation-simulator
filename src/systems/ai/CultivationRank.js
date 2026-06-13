/**
 * CultivationRank.js - 修真榜系统
 * V547 Iteration 10/20 Round 22
 */
export class CultivationRank {
    constructor(config = {}) {
        this.config = { maxRanks: config.maxRanks || 100, baseScore: config.baseScore || 1000, ...config };
        this.ranks = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRanks: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRank', (ctx) => this.getRank(ctx.rankId));
        this.registerTool('createRank', (ctx) => this.createRank(ctx));
    }

    createRank(data) {
        const id = data.id || `crk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const rank = {
            rankId: id,
            holderId: data.holderId,
            name: data.name || 'Unnamed Cultivator',
            type: data.type || 'combat',
            score: data.score || this.config.baseScore,
            achievements: data.achievements || [],
            level: data.level || 1,
            status: data.status || 'active',
            createdAt: Date.now()
        };
        this.ranks.set(id, rank);
        this.stats.totalRanks++;
        this._triggerHook('rankCreated', { rankId: id });
        return { success: true, rank };
    }

    getRank(id) { return this.ranks.get(id) ? { ...this.ranks.get(id) } : null; }
    listRanks() { return Array.from(this.ranks.values()).map(r => ({ ...r })); }
    listByHolder(holderId) { return Array.from(this.ranks.values()).filter(r => r.holderId === holderId).map(r => ({ ...r })); }
    listActive() { return Array.from(this.ranks.values()).filter(r => r.status === 'active').map(r => ({ ...r })); }

    addAchievement(rankId, achievement) {
        const rank = this.ranks.get(rankId);
        if (!rank) return { success: false, error: 'RANK_NOT_FOUND' };
        rank.achievements.push(achievement);
        this._triggerHook('achievementAdded', { rankId, achievement });
        return { success: true };
    }

    increaseScore(rankId, amount = 5) {
        const rank = this.ranks.get(rankId);
        if (!rank) return { success: false, error: 'RANK_NOT_FOUND' };
        rank.score += amount;
        this._triggerHook('scoreIncreased', { rankId, newScore: rank.score });
        return { success: true };
    }

    levelUpRank(rankId) {
        const rank = this.ranks.get(rankId);
        if (!rank) return { success: false, error: 'RANK_NOT_FOUND' };
        rank.level++;
        this._triggerHook('rankLeveledUp', { rankId, newLevel: rank.level });
        return { success: true };
    }

    retireRank(rankId) {
        const rank = this.ranks.get(rankId);
        if (!rank) return { success: false, error: 'RANK_NOT_FOUND' };
        rank.status = 'retired';
        this._triggerHook('rankRetired', { rankId });
        return { success: true };
    }

    calculateRankValue(rankId) {
        const rank = this.ranks.get(rankId);
        if (!rank) return 0;
        return rank.level * 100 + rank.score * 2 + rank.achievements.length * 30;
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
        if (this.stats.totalRanks < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxRanks += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { ranks: Array.from(this.ranks.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.ranks) this.ranks = new Map(data.ranks);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, rankCount: this.ranks.size }; }
}
