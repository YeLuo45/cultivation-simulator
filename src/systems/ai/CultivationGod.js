/**
 * CultivationGod.js - 修真神
 * V670 Iteration 23/30 Round 27 - Cultivation God
 */
export class CultivationGod {
    constructor(config = {}) {
        this.config = { maxGods: config.maxGods || 5, baseDivinity: config.baseDivinity || 20, ...config };
        this.gods = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGods: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getGod', (ctx) => this.getGod(ctx.godId));
        this.registerTool('recruitGod', (ctx) => this.recruitGod(ctx));
    }

    recruitGod(data) {
        const id = data.godId || `god_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const god = {
            godId: id,
            realmId: data.realmId,
            name: data.name || 'Unnamed God',
            type: data.type || 'deity',
            divinity: data.divinity || this.config.baseDivinity,
            miracles: data.miracles || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.gods.set(id, god);
        this.stats.totalGods++;
        this._triggerHook('godRecruited', { godId: id });
        return { success: true, god };
    }

    getGod(id) { return this.gods.get(id) ? { ...this.gods.get(id) } : null; }
    listGods() { return Array.from(this.gods.values()).map(g => ({ ...g })); }
    listByRealm(realmId) { return Array.from(this.gods.values()).filter(g => g.realmId === realmId).map(g => ({ ...g })); }
    listLegendary() { return Array.from(this.gods.values()).filter(g => g.status === 'legendary').map(g => ({ ...g })); }

    addMiracle(godId, miracle) {
        const god = this.gods.get(godId);
        if (!god) return { success: false, error: 'GOD_NOT_FOUND' };
        god.miracles.push(miracle);
        this._triggerHook('miracleAdded', { godId, miracle });
        return { success: true };
    }

    raiseDivinity(godId, amount = 5) {
        const god = this.gods.get(godId);
        if (!god) return { success: false, error: 'GOD_NOT_FOUND' };
        god.divinity += amount;
        this._triggerHook('divinityRaised', { godId, newDivinity: god.divinity });
        return { success: true };
    }

    levelUpGod(godId) {
        const god = this.gods.get(godId);
        if (!god) return { success: false, error: 'GOD_NOT_FOUND' };
        god.level++;
        this._triggerHook('godLeveledUp', { godId, newLevel: god.level });
        return { success: true };
    }

    legendGod(godId) {
        const god = this.gods.get(godId);
        if (!god) return { success: false, error: 'GOD_NOT_FOUND' };
        god.status = 'legendary';
        this._triggerHook('godLegendized', { godId });
        return { success: true };
    }

    calculateGodValue(godId) {
        const god = this.gods.get(godId);
        if (!god) return 0;
        return god.level * 100 + god.divinity * 2 + god.miracles.length * 30;
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
        if (this.stats.totalGods < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxGods += 5;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { gods: Array.from(this.gods.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.gods) this.gods = new Map(data.gods);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, godCount: this.gods.size }; }
}
