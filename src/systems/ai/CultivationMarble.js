/**
 * CultivationMarble.js - 修真大理石系统
 * V840 Iteration 13/30 Round 33
 */
export class CultivationMarble {
    constructor(config = {}) {
        this.config = { maxMarbles: config.maxMarbles || 20, baseSmoothness: config.baseSmoothness || 20, ...config };
        this.marbles = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMarbles: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMarble', (ctx) => this.getMarble(ctx.marbleId));
        this.registerTool('recruitMarble', (ctx) => this.recruitMarble(ctx));
    }

    recruitMarble(data) {
        const id = data.marbleId || data.id || `mbl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const marble = {
            marbleId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Marble',
            type: data.type || 'carrara',
            smoothness: data.smoothness || this.config.baseSmoothness,
            veins: data.veins || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.marbles.set(id, marble);
        this.stats.totalMarbles++;
        this._triggerHook('marbleRecruited', { marbleId: id });
        return { success: true, marble };
    }

    getMarble(id) { return this.marbles.get(id) ? { ...this.marbles.get(id) } : null; }
    listMarbles() { return Array.from(this.marbles.values()).map(m => ({ ...m })); }
    listByMaster(masterId) { return Array.from(this.marbles.values()).filter(m => m.masterId === masterId).map(m => ({ ...m })); }
    listLegendary() { return Array.from(this.marbles.values()).filter(m => m.status === 'legendary').map(m => ({ ...m })); }

    addVein(marbleId, vein) {
        const marble = this.marbles.get(marbleId);
        if (!marble) return { success: false, error: 'MARBLE_NOT_FOUND' };
        marble.veins.push(vein);
        this._triggerHook('veinAdded', { marbleId, vein });
        return { success: true };
    }

    raiseSmoothness(marbleId, amount = 5) {
        const marble = this.marbles.get(marbleId);
        if (!marble) return { success: false, error: 'MARBLE_NOT_FOUND' };
        marble.smoothness += amount;
        this._triggerHook('smoothnessRaised', { marbleId, newSmoothness: marble.smoothness });
        return { success: true };
    }

    levelUpMarble(marbleId) {
        const marble = this.marbles.get(marbleId);
        if (!marble) return { success: false, error: 'MARBLE_NOT_FOUND' };
        marble.level++;
        this._triggerHook('marbleLeveledUp', { marbleId, newLevel: marble.level });
        return { success: true };
    }

    legendMarble(marbleId) {
        const marble = this.marbles.get(marbleId);
        if (!marble) return { success: false, error: 'MARBLE_NOT_FOUND' };
        marble.status = 'legendary';
        this._triggerHook('marbleLegendized', { marbleId });
        return { success: true };
    }

    calculateMarbleValue(marbleId) {
        const marble = this.marbles.get(marbleId);
        if (!marble) return 0;
        return marble.level * 100 + marble.smoothness * 2 + marble.veins.length * 30;
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
        if (this.stats.totalMarbles < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMarbles += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { marbles: Array.from(this.marbles.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.marbles) this.marbles = new Map(data.marbles);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, marbleCount: this.marbles.size }; }
}
