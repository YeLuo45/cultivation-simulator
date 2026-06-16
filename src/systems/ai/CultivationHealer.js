/**
 * CultivationHealer.js - 修真医师系统
 * V603 Iteration 6/20 Round 25
 */
export class CultivationHealer {
    constructor(config = {}) {
        this.config = { maxHealers: config.maxHealers || 50, baseHealing: config.baseHealing || 20, ...config };
        this.healers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalHealers: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getHealer', (ctx) => this.getHealer(ctx.healerId));
        this.registerTool('recruitHealer', (ctx) => this.recruitHealer(ctx));
    }

    recruitHealer(data) {
        const id = data.healerId || `heal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const healer = { healerId: id, mentorId: data.mentorId, name: data.name || 'Mystic Healer', type: data.type || 'physical', healing: data.healing || this.config.baseHealing, cures: data.cures || [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.healers.set(id, healer);
        this.stats.totalHealers++;
        this._triggerHook('healerRecruited', { healerId: id });
        return { success: true, healer };
    }

    getHealer(id) { return this.healers.get(id) ? { ...this.healers.get(id) } : null; }
    listHealers() { return Array.from(this.healers.values()).map(h => ({ ...h })); }
    listByMentor(mentorId) { return Array.from(this.healers.values()).filter(h => h.mentorId === mentorId).map(h => ({ ...h })); }
    listLegendary() { return Array.from(this.healers.values()).filter(h => h.status === 'legendary').map(h => ({ ...h })); }

    addCure(healerId, cure) {
        const healer = this.healers.get(healerId);
        if (!healer) return { success: false, error: 'HEALER_NOT_FOUND' };
        healer.cures.push(cure);
        this._triggerHook('cureAdded', { healerId, cure });
        return { success: true };
    }

    boostHealing(healerId, amount = 5) {
        const healer = this.healers.get(healerId);
        if (!healer) return { success: false, error: 'HEALER_NOT_FOUND' };
        healer.healing += amount;
        this._triggerHook('healingBoosted', { healerId, newHealing: healer.healing });
        return { success: true };
    }

    levelUpHealer(healerId) {
        const healer = this.healers.get(healerId);
        if (!healer) return { success: false, error: 'HEALER_NOT_FOUND' };
        healer.level++;
        this._triggerHook('healerLeveledUp', { healerId, newLevel: healer.level });
        return { success: true };
    }

    legendHealer(healerId) {
        const healer = this.healers.get(healerId);
        if (!healer) return { success: false, error: 'HEALER_NOT_FOUND' };
        healer.status = 'legendary';
        this._triggerHook('healerLegendized', { healerId });
        return { success: true };
    }

    calculateHealerValue(healerId) {
        const healer = this.healers.get(healerId);
        if (!healer) return 0;
        return healer.level * 100 + healer.healing * 2 + healer.cures.length * 30;
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
        if (this.stats.totalHealers < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxHealers += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { healers: Array.from(this.healers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.healers) this.healers = new Map(data.healers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, healerCount: this.healers.size }; }
}
