/**
 * CultivationMyth.js - 修真神话系统
 * V572 Iteration 15/20 Round 23
 */
export class CultivationMyth {
    constructor(config = {}) {
        this.config = { maxMyths: config.maxMyths || 30, baseMythos: config.baseMythos || 20, ...config };
        this.myths = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMyths: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMyth', (ctx) => this.getMyth(ctx.mythId));
        this.registerTool('recordMyth', (ctx) => this.recordMyth(ctx));
    }

    recordMyth(data) {
        const id = data.id || `myth_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const myth = {
            mythId: id,
            keeperId: data.keeperId,
            name: data.name,
            type: data.type || 'creation',
            mythos: data.mythos || this.config.baseMythos,
            gods: data.gods || [],
            level: 1,
            status: 'hidden',
            createdAt: Date.now()
        };
        this.myths.set(id, myth);
        this.stats.totalMyths++;
        this._triggerHook('mythRecorded', { mythId: id });
        return { success: true, myth };
    }

    getMyth(id) { return this.myths.get(id) ? { ...this.myths.get(id) } : null; }
    listMyths() { return Array.from(this.myths.values()).map(m => ({ ...m })); }
    listByKeeper(keeperId) { return Array.from(this.myths.values()).filter(m => m.keeperId === keeperId).map(m => ({ ...m })); }
    listEternal() { return Array.from(this.myths.values()).filter(m => m.status === 'eternal').map(m => ({ ...m })); }

    addGod(mythId, god) {
        const myth = this.myths.get(mythId);
        if (!myth) return { success: false, error: 'MYTH_NOT_FOUND' };
        myth.gods.push(god);
        this._triggerHook('godAdded', { mythId, god });
        return { success: true };
    }

    deepenMythos(mythId, amount = 5) {
        const myth = this.myths.get(mythId);
        if (!myth) return { success: false, error: 'MYTH_NOT_FOUND' };
        myth.mythos += amount;
        this._triggerHook('mythosDeepened', { mythId, newMythos: myth.mythos });
        return { success: true };
    }

    levelUpMyth(mythId) {
        const myth = this.myths.get(mythId);
        if (!myth) return { success: false, error: 'MYTH_NOT_FOUND' };
        myth.level++;
        this._triggerHook('mythLeveledUp', { mythId, newLevel: myth.level });
        return { success: true };
    }

    eternizeMyth(mythId) {
        const myth = this.myths.get(mythId);
        if (!myth) return { success: false, error: 'MYTH_NOT_FOUND' };
        myth.status = 'eternal';
        this._triggerHook('mythEternalized', { mythId });
        return { success: true };
    }

    calculateMythValue(mythId) {
        const myth = this.myths.get(mythId);
        if (!myth) return 0;
        return myth.level * 100 + myth.mythos * 2 + myth.gods.length * 30;
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
        if (this.stats.totalMyths < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMyths += 15;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { myths: Array.from(this.myths.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.myths) this.myths = new Map(data.myths);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, mythCount: this.myths.size }; }
}
