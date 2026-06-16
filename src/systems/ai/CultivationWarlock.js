/**
 * CultivationWarlock.js - 修真术师系统
 * V626 Iteration 9/30 Round 26
 */
export class CultivationWarlock {
    constructor(config = {}) {
        this.config = { maxWarlocks: config.maxWarlocks || 50, basePact: config.basePact || 20, ...config };
        this.warlocks = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalWarlocks: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getWarlock', (ctx) => this.getWarlock(ctx.warlockId));
        this.registerTool('recruitWarlock', (ctx) => this.recruitWarlock(ctx));
    }

    recruitWarlock(data) {
        if (this.warlocks.size >= this.config.maxWarlocks) return { success: false, error: 'MAX_WARLOCKS_REACHED' };
        const id = data.warlockId || `wlc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const warlock = {
            warlockId: id,
            patronId: data.patronId,
            name: data.name || 'Unnamed Warlock',
            type: data.type || 'pact',
            pact: data.pact != null ? data.pact : this.config.basePact,
            minions: data.minions || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.warlocks.set(id, warlock);
        this.stats.totalWarlocks++;
        this._triggerHook('warlockRecruited', { warlockId: id, patronId: warlock.patronId });
        return { success: true, warlock };
    }

    getWarlock(id) { return this.warlocks.get(id) ? { ...this.warlocks.get(id) } : null; }
    listWarlocks() { return Array.from(this.warlocks.values()).map(w => ({ ...w })); }
    listByPatron(patronId) { return Array.from(this.warlocks.values()).filter(w => w.patronId === patronId).map(w => ({ ...w })); }
    listLegendary() { return Array.from(this.warlocks.values()).filter(w => w.status === 'legendary').map(w => ({ ...w })); }

    addMinion(warlockId, minion) {
        const warlock = this.warlocks.get(warlockId);
        if (!warlock) return { success: false, error: 'WARLOCK_NOT_FOUND' };
        warlock.minions.push(minion);
        this._triggerHook('minionAdded', { warlockId, minion });
        return { success: true };
    }

    strengthenPact(warlockId, amount = 5) {
        const warlock = this.warlocks.get(warlockId);
        if (!warlock) return { success: false, error: 'WARLOCK_NOT_FOUND' };
        warlock.pact += amount;
        this._triggerHook('pactStrengthened', { warlockId, newPact: warlock.pact });
        return { success: true };
    }

    levelUpWarlock(warlockId) {
        const warlock = this.warlocks.get(warlockId);
        if (!warlock) return { success: false, error: 'WARLOCK_NOT_FOUND' };
        warlock.level++;
        this._triggerHook('warlockLeveledUp', { warlockId, newLevel: warlock.level });
        return { success: true };
    }

    legendWarlock(warlockId) {
        const warlock = this.warlocks.get(warlockId);
        if (!warlock) return { success: false, error: 'WARLOCK_NOT_FOUND' };
        warlock.status = 'legendary';
        this._triggerHook('warlockLegendized', { warlockId });
        return { success: true };
    }

    calculateWarlockValue(warlockId) {
        const warlock = this.warlocks.get(warlockId);
        if (!warlock) return 0;
        return warlock.level * 100 + warlock.pact * 2 + warlock.minions.length * 30;
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
        if (this.stats.totalWarlocks < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxWarlocks += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { warlocks: Array.from(this.warlocks.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.warlocks) this.warlocks = new Map(data.warlocks);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, warlockCount: this.warlocks.size }; }
}
