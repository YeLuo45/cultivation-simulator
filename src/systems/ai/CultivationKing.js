/**
 * CultivationKing.js - 修真国王系统
 * V728 Iteration 21/30 Round 29
 */
export class CultivationKing {
    constructor(config = {}) {
        this.config = { maxKings: config.maxKings || 10, baseSovereignty: config.baseSovereignty || 20, ...config };
        this.kings = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalKings: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getKing', (ctx) => this.getKing(ctx.kingId));
        this.registerTool('recruitKing', (ctx) => this.recruitKing(ctx));
    }

    recruitKing(data) {
        const id = data.kingId || `king_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const king = {
            kingId: id,
            realmId: data.realmId,
            name: data.name,
            type: data.type || 'wise',
            sovereignty: data.sovereignty || this.config.baseSovereignty,
            decrees: data.decrees || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.kings.set(id, king);
        this.stats.totalKings++;
        this._triggerHook('kingRecruited', { kingId: id });
        return { success: true, king };
    }

    getKing(id) { return this.kings.get(id) ? { ...this.kings.get(id) } : null; }
    listKings() { return Array.from(this.kings.values()).map(k => ({ ...k })); }
    listByRealm(realmId) { return Array.from(this.kings.values()).filter(k => k.realmId === realmId).map(k => ({ ...k })); }
    listLegendary() { return Array.from(this.kings.values()).filter(k => k.status === 'legendary').map(k => ({ ...k })); }

    addDecree(kingId, decree) {
        const king = this.kings.get(kingId);
        if (!king) return { success: false, error: 'KING_NOT_FOUND' };
        king.decrees.push(decree);
        this._triggerHook('decreeAdded', { kingId, decree });
        return { success: true };
    }

    raiseSovereignty(kingId, amount = 5) {
        const king = this.kings.get(kingId);
        if (!king) return { success: false, error: 'KING_NOT_FOUND' };
        king.sovereignty += amount;
        this._triggerHook('sovereigntyRaised', { kingId, newSovereignty: king.sovereignty });
        return { success: true };
    }

    levelUpKing(kingId) {
        const king = this.kings.get(kingId);
        if (!king) return { success: false, error: 'KING_NOT_FOUND' };
        king.level++;
        this._triggerHook('kingLeveledUp', { kingId, newLevel: king.level });
        return { success: true };
    }

    legendKing(kingId) {
        const king = this.kings.get(kingId);
        if (!king) return { success: false, error: 'KING_NOT_FOUND' };
        king.status = 'legendary';
        this._triggerHook('kingLegendized', { kingId });
        return { success: true };
    }

    calculateKingValue(kingId) {
        const king = this.kings.get(kingId);
        if (!king) return 0;
        return king.level * 100 + king.sovereignty * 2 + king.decrees.length * 30;
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
        if (this.stats.totalKings < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxKings += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { kings: Array.from(this.kings.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.kings) this.kings = new Map(data.kings);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, kingCount: this.kings.size }; }
}
