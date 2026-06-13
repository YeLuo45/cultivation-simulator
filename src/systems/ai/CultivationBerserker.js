/**
 * CultivationBerserker.js - 修真狂战士
 * V609 Iteration 12/20 Round 25
 */
export class CultivationBerserker {
    constructor(config = {}) {
        this.config = { maxBerserkers: config.maxBerserkers || 50, baseRage: config.baseRage || 10, ...config };
        this.berserkers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBerserkers: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBerserker', (ctx) => this.getBerserker(ctx.berserkerId));
        this.registerTool('recruitBerserker', (ctx) => this.recruitBerserker(ctx));
    }

    recruitBerserker(data) {
        const id = data.berserkerId || `brk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const berserker = {
            berserkerId: id,
            handlerId: data.handlerId,
            name: data.name || 'Anonymous Berserker',
            type: data.type || 'axe',
            rage: data.rage || this.config.baseRage,
            frenzies: data.frenzies || [],
            level: 1,
            status: 'calm',
            createdAt: Date.now()
        };
        this.berserkers.set(id, berserker);
        this.stats.totalBerserkers++;
        this._triggerHook('berserkerRecruited', { berserkerId: id });
        return { success: true, berserker };
    }

    getBerserker(id) { return this.berserkers.get(id) ? { ...this.berserkers.get(id) } : null; }
    listBerserkers() { return Array.from(this.berserkers.values()).map(b => ({ ...b })); }
    listByHandler(handlerId) { return Array.from(this.berserkers.values()).filter(b => b.handlerId === handlerId).map(b => ({ ...b })); }
    listLegendary() { return Array.from(this.berserkers.values()).filter(b => b.status === 'legendary').map(b => ({ ...b })); }

    addFrenzy(berserkerId, frenzy) {
        const berserker = this.berserkers.get(berserkerId);
        if (!berserker) return { success: false, error: 'BERSERKER_NOT_FOUND' };
        berserker.frenzies.push(frenzy);
        if (berserker.frenzies.length >= 3 && berserker.status === 'calm') {
            berserker.status = 'furious';
        }
        this._triggerHook('frenzyAdded', { berserkerId, frenzy });
        return { success: true };
    }

    buildRage(berserkerId, amount = 5) {
        const berserker = this.berserkers.get(berserkerId);
        if (!berserker) return { success: false, error: 'BERSERKER_NOT_FOUND' };
        berserker.rage += amount;
        this._triggerHook('rageBuilt', { berserkerId, newRage: berserker.rage });
        return { success: true };
    }

    levelUpBerserker(berserkerId) {
        const berserker = this.berserkers.get(berserkerId);
        if (!berserker) return { success: false, error: 'BERSERKER_NOT_FOUND' };
        berserker.level++;
        this._triggerHook('berserkerLeveledUp', { berserkerId, newLevel: berserker.level });
        return { success: true };
    }

    legendBerserker(berserkerId) {
        const berserker = this.berserkers.get(berserkerId);
        if (!berserker) return { success: false, error: 'BERSERKER_NOT_FOUND' };
        berserker.status = 'legendary';
        this._triggerHook('berserkerLegendized', { berserkerId });
        return { success: true };
    }

    calculateBerserkerValue(berserkerId) {
        const berserker = this.berserkers.get(berserkerId);
        if (!berserker) return 0;
        return berserker.level * 100 + berserker.rage * 2 + berserker.frenzies.length * 30;
    }

    listFurious() { return Array.from(this.berserkers.values()).filter(b => b.status === 'furious').map(b => ({ ...b })); }

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
        if (this.stats.totalBerserkers < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBerserkers += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { berserkers: Array.from(this.berserkers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.berserkers) this.berserkers = new Map(data.berserkers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, berserkerCount: this.berserkers.size }; }
}
