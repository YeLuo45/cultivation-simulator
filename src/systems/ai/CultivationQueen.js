/**
 * CultivationQueen.js - 修真王后系统
 * V729 Iteration 22/30 Round 29
 */
export class CultivationQueen {
    constructor(config = {}) {
        this.config = { maxQueens: config.maxQueens || 10, baseGrace: config.baseGrace || 20, ...config };
        this.queens = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalQueens: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getQueen', (ctx) => this.getQueen(ctx.queenId));
        this.registerTool('recruitQueen', (ctx) => this.recruitQueen(ctx));
    }

    recruitQueen(data) {
        const id = data.queenId || `queen_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const queen = {
            queenId: id,
            realmId: data.realmId,
            name: data.name,
            type: data.type || 'wise',
            grace: data.grace || this.config.baseGrace,
            favors: data.favors || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.queens.set(id, queen);
        this.stats.totalQueens++;
        this._triggerHook('queenRecruited', { queenId: id });
        return { success: true, queen };
    }

    getQueen(id) { return this.queens.get(id) ? { ...this.queens.get(id) } : null; }
    listQueens() { return Array.from(this.queens.values()).map(q => ({ ...q })); }
    listByRealm(realmId) { return Array.from(this.queens.values()).filter(q => q.realmId === realmId).map(q => ({ ...q })); }
    listLegendary() { return Array.from(this.queens.values()).filter(q => q.status === 'legendary').map(q => ({ ...q })); }

    addFavor(queenId, favor) {
        const queen = this.queens.get(queenId);
        if (!queen) return { success: false, error: 'QUEEN_NOT_FOUND' };
        queen.favors.push(favor);
        this._triggerHook('favorAdded', { queenId, favor });
        return { success: true };
    }

    raiseGrace(queenId, amount = 5) {
        const queen = this.queens.get(queenId);
        if (!queen) return { success: false, error: 'QUEEN_NOT_FOUND' };
        queen.grace += amount;
        this._triggerHook('graceRaised', { queenId, newGrace: queen.grace });
        return { success: true };
    }

    levelUpQueen(queenId) {
        const queen = this.queens.get(queenId);
        if (!queen) return { success: false, error: 'QUEEN_NOT_FOUND' };
        queen.level++;
        this._triggerHook('queenLeveledUp', { queenId, newLevel: queen.level });
        return { success: true };
    }

    legendQueen(queenId) {
        const queen = this.queens.get(queenId);
        if (!queen) return { success: false, error: 'QUEEN_NOT_FOUND' };
        queen.status = 'legendary';
        this._triggerHook('queenLegendized', { queenId });
        return { success: true };
    }

    calculateQueenValue(queenId) {
        const queen = this.queens.get(queenId);
        if (!queen) return 0;
        return queen.level * 100 + queen.grace * 2 + queen.favors.length * 30;
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
        if (this.stats.totalQueens < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxQueens += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { queens: Array.from(this.queens.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.queens) this.queens = new Map(data.queens);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, queenCount: this.queens.size }; }
}
