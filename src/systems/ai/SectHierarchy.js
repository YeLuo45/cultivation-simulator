/**
 * SectHierarchy.js - 宗门等级系统
 * V490 Iteration 7/15 Round 19 - Sect Hierarchy System
 *
 * 融合6大设计系统:
 * - generic-agent: 宗门等级自循环
 * - chatdev: 宗门等级角色协调
 * - nanobot: 宗门等级mesh
 * - claude-code: 宗门等级工具
 * - thunderbolt: 宗门等级持久化
 * - ruflo: 宗门等级Hook
 */

export class SectHierarchy {
    constructor(config = {}) {
        this.config = { maxRanks: config.maxRanks || 20, baseLevel: config.baseLevel || 1, ...config };
        this.ranks = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRanks: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRank', (ctx) => this.getRank(ctx.rankId));
        this.registerTool('defineRank', (ctx) => this.defineRank(ctx));
    }

    defineRank(data) {
        const id = data.rankId || data.id || `rnk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const rank = {
            rankId: id,
            sectId: data.sectId,
            name: data.name || 'Unnamed Rank',
            level: data.level || this.config.baseLevel,
            requirements: Array.isArray(data.requirements) ? [...data.requirements] : [],
            members: Array.isArray(data.members) ? [...data.members] : [],
            status: 'active',
            createdAt: Date.now()
        };
        this.ranks.set(id, rank);
        this.stats.totalRanks++;
        this._triggerHook('rankDefined', { rankId: id });
        return { success: true, rank };
    }

    getRank(id) { return this.ranks.get(id) ? { ...this.ranks.get(id) } : null; }
    listRanks() { return Array.from(this.ranks.values()).map(r => ({ ...r })); }
    listBySect(sectId) { return Array.from(this.ranks.values()).filter(r => r.sectId === sectId).map(r => ({ ...r })); }
    listActive() { return Array.from(this.ranks.values()).filter(r => r.status === 'active').map(r => ({ ...r })); }

    addMember(rankId, member) {
        const rank = this.ranks.get(rankId);
        if (!rank) return { success: false, error: 'RANK_NOT_FOUND' };
        rank.members.push(member);
        this._triggerHook('memberAdded', { rankId, member });
        return { success: true };
    }

    increaseLevel(rankId) {
        const rank = this.ranks.get(rankId);
        if (!rank) return { success: false, error: 'RANK_NOT_FOUND' };
        rank.level++;
        this._triggerHook('levelIncreased', { rankId, newLevel: rank.level });
        return { success: true };
    }

    abolishRank(rankId) {
        const rank = this.ranks.get(rankId);
        if (!rank) return { success: false, error: 'RANK_NOT_FOUND' };
        rank.status = 'abolished';
        this._triggerHook('rankAbolished', { rankId });
        return { success: true };
    }

    calculateHierarchyPower(rankId) {
        const rank = this.ranks.get(rankId);
        if (!rank) return 0;
        return rank.level * 100 + rank.members.length * 5;
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
