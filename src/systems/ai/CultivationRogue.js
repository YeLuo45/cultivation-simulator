/**
 * CultivationRogue.js - 修真盗贼
 * V608 Iteration 11/20 Round 25 - Cultivation Rogue
 */

export class CultivationRogue {
    constructor(config = {}) {
        this.config = { maxRogues: config.maxRogues || 50, baseCunning: config.baseCunning || 20, ...config };
        this.rogues = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRogues: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRogue', (ctx) => this.getRogue(ctx.rogueId));
        this.registerTool('recruitRogue', (ctx) => this.recruitRogue(ctx));
    }

    recruitRogue(data = {}) {
        const id = data.rogueId || `rge_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const rogue = {
            rogueId: id,
            handlerId: data.handlerId,
            name: data.name || 'Silent Shadow',
            type: data.type || 'stealth',
            cunning: data.cunning !== undefined ? data.cunning : this.config.baseCunning,
            tricks: data.tricks || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.rogues.set(id, rogue);
        this.stats.totalRogues++;
        this._triggerHook('rogueRecruited', { rogueId: id });
        return { success: true, rogue };
    }

    getRogue(id) { return this.rogues.get(id) ? { ...this.rogues.get(id) } : null; }
    listRogues() { return Array.from(this.rogues.values()).map(r => ({ ...r })); }
    listByHandler(handlerId) { return Array.from(this.rogues.values()).filter(r => r.handlerId === handlerId).map(r => ({ ...r })); }
    listLegendary() { return Array.from(this.rogues.values()).filter(r => r.status === 'legendary').map(r => ({ ...r })); }

    addTrick(rogueId, trick) {
        const rogue = this.rogues.get(rogueId);
        if (!rogue) return { success: false, error: 'ROGUE_NOT_FOUND' };
        rogue.tricks.push(trick);
        this._triggerHook('trickAdded', { rogueId, trick });
        return { success: true, rogue: { ...rogue } };
    }

    sharpenCunning(rogueId, amount = 5) {
        const rogue = this.rogues.get(rogueId);
        if (!rogue) return { success: false, error: 'ROGUE_NOT_FOUND' };
        rogue.cunning += amount;
        this._triggerHook('cunningSharpened', { rogueId, newCunning: rogue.cunning });
        return { success: true };
    }

    levelUpRogue(rogueId) {
        const rogue = this.rogues.get(rogueId);
        if (!rogue) return { success: false, error: 'ROGUE_NOT_FOUND' };
        rogue.level++;
        this._triggerHook('rogueLeveledUp', { rogueId, newLevel: rogue.level });
        return { success: true };
    }

    legendRogue(rogueId) {
        const rogue = this.rogues.get(rogueId);
        if (!rogue) return { success: false, error: 'ROGUE_NOT_FOUND' };
        rogue.status = 'legendary';
        this._triggerHook('rogueLegendized', { rogueId });
        return { success: true };
    }

    calculateRogueValue(rogueId) {
        const rogue = this.rogues.get(rogueId);
        if (!rogue) return 0;
        return rogue.level * 100 + rogue.cunning * 2 + rogue.tricks.length * 30;
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
        if (this.stats.totalRogues < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxRogues += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { rogues: Array.from(this.rogues.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.rogues) this.rogues = new Map(data.rogues);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, rogueCount: this.rogues.size }; }
}
