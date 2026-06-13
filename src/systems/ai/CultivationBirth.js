/**
 * CultivationBirth.js - 修真诞生系统
 * V595 Iteration 18/20 Round 24 - Cultivation Birth
 */
export class CultivationBirth {
    constructor(config = {}) {
        this.config = { maxBirths: config.maxBirths || 50, basePotential: config.basePotential || 20, ...config };
        this.births = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBirths: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBirth', (ctx) => this.getBirth(ctx.birthId));
        this.registerTool('recordBirth', (ctx) => this.recordBirth(ctx || {}));
    }

    recordBirth(data) {
        const id = data.birthId || data.id || `brt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const birth = {
            birthId: id,
            parentId: data.parentId || null,
            name: data.name || 'Newborn',
            type: data.type || 'mortal',
            potential: data.potential != null ? data.potential : this.config.basePotential,
            talents: data.talents ? [...data.talents] : [],
            level: 1,
            status: 'newborn',
            createdAt: Date.now()
        };
        this.births.set(id, birth);
        this.stats.totalBirths++;
        this._triggerHook('birthRecorded', { birthId: id });
        return { success: true, birth };
    }

    getBirth(id) { return this.births.get(id) ? { ...this.births.get(id) } : null; }
    listBirths() { return Array.from(this.births.values()).map(b => ({ ...b })); }
    listByParent(parentId) { return Array.from(this.births.values()).filter(b => b.parentId === parentId).map(b => ({ ...b })); }
    listAscended() { return Array.from(this.births.values()).filter(b => b.status === 'ascended').map(b => ({ ...b })); }

    addTalent(birthId, talent) {
        const birth = this.births.get(birthId);
        if (!birth) return { success: false, error: 'BIRTH_NOT_FOUND' };
        birth.talents.push(talent);
        this._triggerHook('talentAdded', { birthId, talent });
        return { success: true };
    }

    awakenPotential(birthId, amount = 5) {
        const birth = this.births.get(birthId);
        if (!birth) return { success: false, error: 'BIRTH_NOT_FOUND' };
        birth.potential += amount;
        this._triggerHook('potentialAwakened', { birthId, newPotential: birth.potential });
        return { success: true };
    }

    levelUpBirth(birthId) {
        const birth = this.births.get(birthId);
        if (!birth) return { success: false, error: 'BIRTH_NOT_FOUND' };
        birth.level++;
        if (birth.status === 'newborn') birth.status = 'growing';
        this._triggerHook('birthLeveledUp', { birthId, newLevel: birth.level });
        return { success: true };
    }

    ascendBirth(birthId) {
        const birth = this.births.get(birthId);
        if (!birth) return { success: false, error: 'BIRTH_NOT_FOUND' };
        birth.status = 'ascended';
        this._triggerHook('birthAscended', { birthId });
        return { success: true };
    }

    calculateBirthValue(birthId) {
        const birth = this.births.get(birthId);
        if (!birth) return 0;
        return birth.level * 100 + birth.potential * 2 + birth.talents.length * 30;
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
        if (this.stats.totalBirths < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBirths += 25;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { births: Array.from(this.births.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.births) this.births = new Map(data.births);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, birthCount: this.births.size };
    }
}
