/**
 * CultivationNinja.js - 修真忍者
 * V616 Iteration 19/20 Round 25 - Cultivation Ninja
 */

export class CultivationNinja {
    constructor(config = {}) {
        this.config = { maxNinjas: config.maxNinjas || 50, baseAgility: config.baseAgility || 20, ...config };
        this.ninjas = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalNinjas: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getNinja', (ctx) => this.getNinja(ctx.ninjaId));
        this.registerTool('recruitNinja', (ctx) => this.recruitNinja(ctx));
    }

    recruitNinja(data = {}) {
        const id = data.ninjaId || `nin_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const ninja = {
            ninjaId: id,
            handlerId: data.handlerId,
            name: data.name || 'Silent Shadow',
            type: data.type || 'shadow',
            agility: data.agility !== undefined ? data.agility : this.config.baseAgility,
            weapons: data.weapons || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.ninjas.set(id, ninja);
        this.stats.totalNinjas++;
        this._triggerHook('ninjaRecruited', { ninjaId: id });
        return { success: true, ninja };
    }

    getNinja(id) { return this.ninjas.get(id) ? { ...this.ninjas.get(id) } : null; }
    listNinjas() { return Array.from(this.ninjas.values()).map(n => ({ ...n })); }
    listByHandler(handlerId) { return Array.from(this.ninjas.values()).filter(n => n.handlerId === handlerId).map(n => ({ ...n })); }
    listLegendary() { return Array.from(this.ninjas.values()).filter(n => n.status === 'legendary').map(n => ({ ...n })); }

    addWeapon(ninjaId, weapon) {
        const ninja = this.ninjas.get(ninjaId);
        if (!ninja) return { success: false, error: 'NINJA_NOT_FOUND' };
        ninja.weapons.push(weapon);
        this._triggerHook('weaponAdded', { ninjaId, weapon });
        return { success: true, ninja: { ...ninja } };
    }

    sharpenAgility(ninjaId, amount = 5) {
        const ninja = this.ninjas.get(ninjaId);
        if (!ninja) return { success: false, error: 'NINJA_NOT_FOUND' };
        ninja.agility += amount;
        this._triggerHook('agilitySharpened', { ninjaId, newAgility: ninja.agility });
        return { success: true };
    }

    levelUpNinja(ninjaId) {
        const ninja = this.ninjas.get(ninjaId);
        if (!ninja) return { success: false, error: 'NINJA_NOT_FOUND' };
        ninja.level++;
        this._triggerHook('ninjaLeveledUp', { ninjaId, newLevel: ninja.level });
        return { success: true };
    }

    legendNinja(ninjaId) {
        const ninja = this.ninjas.get(ninjaId);
        if (!ninja) return { success: false, error: 'NINJA_NOT_FOUND' };
        ninja.status = 'legendary';
        this._triggerHook('ninjaLegendized', { ninjaId });
        return { success: true };
    }

    calculateNinjaValue(ninjaId) {
        const ninja = this.ninjas.get(ninjaId);
        if (!ninja) return 0;
        return ninja.level * 100 + ninja.agility * 2 + ninja.weapons.length * 30;
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
        if (this.stats.totalNinjas < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxNinjas += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { ninjas: Array.from(this.ninjas.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.ninjas) this.ninjas = new Map(data.ninjas);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, ninjaCount: this.ninjas.size }; }
}
