/**
 * CultivationAssassin.js - 修真刺客
 * V601 Iteration 4/20 Round 25 - Cultivation Assassin
 */

export class CultivationAssassin {
    constructor(config = {}) {
        this.config = { maxAssassins: config.maxAssassins || 50, baseStealth: config.baseStealth || 20, ...config };
        this.assassins = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalAssassins: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getAssassin', (ctx) => this.getAssassin(ctx.assassinId));
        this.registerTool('recruitAssassin', (ctx) => this.recruitAssassin(ctx));
    }

    recruitAssassin(data = {}) {
        const id = data.assassinId || `asn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const assassin = {
            assassinId: id,
            handlerId: data.handlerId,
            name: data.name || 'Shadow Blade',
            type: data.type || 'dagger',
            stealth: data.stealth !== undefined ? data.stealth : this.config.baseStealth,
            targets: data.targets || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.assassins.set(id, assassin);
        this.stats.totalAssassins++;
        this._triggerHook('assassinRecruited', { assassinId: id });
        return { success: true, assassin };
    }

    getAssassin(id) { return this.assassins.get(id) ? { ...this.assassins.get(id) } : null; }
    listAssassins() { return Array.from(this.assassins.values()).map(a => ({ ...a })); }
    listByHandler(handlerId) { return Array.from(this.assassins.values()).filter(a => a.handlerId === handlerId).map(a => ({ ...a })); }
    listLegendary() { return Array.from(this.assassins.values()).filter(a => a.status === 'legendary').map(a => ({ ...a })); }

    addTarget(assassinId, target) {
        const assassin = this.assassins.get(assassinId);
        if (!assassin) return { success: false, error: 'ASSASSIN_NOT_FOUND' };
        assassin.targets.push(target);
        this._triggerHook('targetAdded', { assassinId, target });
        return { success: true, assassin: { ...assassin } };
    }

    sharpenStealth(assassinId, amount = 5) {
        const assassin = this.assassins.get(assassinId);
        if (!assassin) return { success: false, error: 'ASSASSIN_NOT_FOUND' };
        assassin.stealth += amount;
        this._triggerHook('stealthSharpened', { assassinId, newStealth: assassin.stealth });
        return { success: true };
    }

    levelUpAssassin(assassinId) {
        const assassin = this.assassins.get(assassinId);
        if (!assassin) return { success: false, error: 'ASSASSIN_NOT_FOUND' };
        assassin.level++;
        this._triggerHook('assassinLeveledUp', { assassinId, newLevel: assassin.level });
        return { success: true };
    }

    legendAssassin(assassinId) {
        const assassin = this.assassins.get(assassinId);
        if (!assassin) return { success: false, error: 'ASSASSIN_NOT_FOUND' };
        assassin.status = 'legendary';
        this._triggerHook('assassinLegendized', { assassinId });
        return { success: true };
    }

    calculateAssassinValue(assassinId) {
        const assassin = this.assassins.get(assassinId);
        if (!assassin) return 0;
        return assassin.level * 100 + assassin.stealth * 2 + assassin.targets.length * 30;
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
        if (this.stats.totalAssassins < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxAssassins += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { assassins: Array.from(this.assassins.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.assassins) this.assassins = new Map(data.assassins);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, assassinCount: this.assassins.size }; }
}
