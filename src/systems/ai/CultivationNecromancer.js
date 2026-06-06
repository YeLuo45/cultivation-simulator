/**
 * CultivationNecromancer.js - 修真死灵师系统
 * V606 Iteration 9/20 Round 25
 */
export class CultivationNecromancer {
    constructor(config = {}) {
        this.config = { maxNecromancers: config.maxNecromancers || 50, baseCorruption: config.baseCorruption || 10, ...config };
        this.necromancers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalNecromancers: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getNecromancer', (ctx) => this.getNecromancer(ctx.necroId));
        this.registerTool('recruitNecromancer', (ctx) => this.recruitNecromancer(ctx));
    }

    recruitNecromancer(data) {
        if (this.necromancers.size >= this.config.maxNecromancers) return { success: false, error: 'MAX_NECROMANCERS_REACHED' };
        const id = data.necroId || `ncr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const necromancer = {
            necroId: id,
            patronId: data.patronId,
            name: data.name || 'Unnamed Necromancer',
            type: data.type || 'undead',
            corruption: data.corruption != null ? data.corruption : this.config.baseCorruption,
            minions: data.minions || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.necromancers.set(id, necromancer);
        this.stats.totalNecromancers++;
        this._triggerHook('necromancerRecruited', { necroId: id, patronId: necromancer.patronId });
        return { success: true, necromancer };
    }

    getNecromancer(id) { return this.necromancers.get(id) ? { ...this.necromancers.get(id) } : null; }
    listNecromancers() { return Array.from(this.necromancers.values()).map(n => ({ ...n })); }
    listByPatron(patronId) { return Array.from(this.necromancers.values()).filter(n => n.patronId === patronId).map(n => ({ ...n })); }
    listLegendary() { return Array.from(this.necromancers.values()).filter(n => n.status === 'legendary').map(n => ({ ...n })); }

    addMinion(necroId, minion) {
        const necromancer = this.necromancers.get(necroId);
        if (!necromancer) return { success: false, error: 'NECROMANCER_NOT_FOUND' };
        necromancer.minions.push(minion);
        this._triggerHook('minionAdded', { necroId, minion });
        return { success: true };
    }

    embraceCorruption(necroId, amount = 5) {
        const necromancer = this.necromancers.get(necroId);
        if (!necromancer) return { success: false, error: 'NECROMANCER_NOT_FOUND' };
        necromancer.corruption += amount;
        this._triggerHook('corruptionEmbraced', { necroId, newCorruption: necromancer.corruption });
        return { success: true };
    }

    levelUpNecromancer(necroId) {
        const necromancer = this.necromancers.get(necroId);
        if (!necromancer) return { success: false, error: 'NECROMANCER_NOT_FOUND' };
        necromancer.level++;
        this._triggerHook('necromancerLeveledUp', { necroId, newLevel: necromancer.level });
        return { success: true };
    }

    legendNecromancer(necroId) {
        const necromancer = this.necromancers.get(necroId);
        if (!necromancer) return { success: false, error: 'NECROMANCER_NOT_FOUND' };
        necromancer.status = 'legendary';
        this._triggerHook('necromancerLegendized', { necroId });
        return { success: true };
    }

    calculateNecromancerValue(necroId) {
        const necromancer = this.necromancers.get(necroId);
        if (!necromancer) return 0;
        return necromancer.level * 100 + necromancer.corruption * 2 + necromancer.minions.length * 30;
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
        if (this.stats.totalNecromancers < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxNecromancers += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { necromancers: Array.from(this.necromancers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.necromancers) this.necromancers = new Map(data.necromancers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, necromancerCount: this.necromancers.size }; }
}
