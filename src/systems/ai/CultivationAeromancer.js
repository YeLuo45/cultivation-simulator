/**
 * CultivationAeromancer.js - 修真风系师
 * V632 Iteration 15/30 Round 26
 */
export class CultivationAeromancer {
    constructor(config = {}) {
        this.config = { maxAeromancers: config.maxAeromancers || 50, baseAir: config.baseAir || 20, ...config };
        this.aeromancers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalAeromancers: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getAeromancer', (ctx) => this.getAeromancer(ctx.aeromancerId));
        this.registerTool('recruitAeromancer', (ctx) => this.recruitAeromancer(ctx));
    }

    recruitAeromancer(data) {
        const id = data.id || `aero_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const aeromancer = { aeromancerId: id, mentorId: data.mentorId || null, name: data.name || 'Anonymous', type: data.type || 'breeze', air: data.air || this.config.baseAir, gales: data.gales || [], level: 1, status: 'novice', recruitedAt: Date.now() };
        this.aeromancers.set(id, aeromancer);
        this.stats.totalAeromancers++;
        this._triggerHook('aeromancerRecruited', { aeromancerId: id });
        return { success: true, aeromancer };
    }

    getAeromancer(id) { return this.aeromancers.get(id) ? { ...this.aeromancers.get(id) } : null; }
    listAeromancers() { return Array.from(this.aeromancers.values()).map(a => ({ ...a })); }
    listByMentor(mentorId) { return Array.from(this.aeromancers.values()).filter(a => a.mentorId === mentorId).map(a => ({ ...a })); }
    listLegendary() { return Array.from(this.aeromancers.values()).filter(a => a.status === 'legendary').map(a => ({ ...a })); }

    addGale(aeromancerId, gale) {
        const aeromancer = this.aeromancers.get(aeromancerId);
        if (!aeromancer) return { success: false, error: 'AEROMANCER_NOT_FOUND' };
        const galeName = (gale && typeof gale === 'object') ? (gale.name || 'gale') : gale;
        aeromancer.gales.push({ name: galeName, addedAt: Date.now() });
        this._triggerHook('galeAdded', { aeromancerId, gale: galeName });
        return { success: true };
    }

    deepenAir(aeromancerId, amount = 5) {
        const aeromancer = this.aeromancers.get(aeromancerId);
        if (!aeromancer) return { success: false, error: 'AEROMANCER_NOT_FOUND' };
        aeromancer.air += amount;
        this._triggerHook('airDeepened', { aeromancerId, newAir: aeromancer.air });
        return { success: true };
    }

    levelUpAeromancer(aeromancerId) {
        const aeromancer = this.aeromancers.get(aeromancerId);
        if (!aeromancer) return { success: false, error: 'AEROMANCER_NOT_FOUND' };
        aeromancer.level++;
        this._triggerHook('aeromancerLeveledUp', { aeromancerId, newLevel: aeromancer.level });
        return { success: true };
    }

    legendAeromancer(aeromancerId) {
        const aeromancer = this.aeromancers.get(aeromancerId);
        if (!aeromancer) return { success: false, error: 'AEROMANCER_NOT_FOUND' };
        aeromancer.status = 'legendary';
        this._triggerHook('aeromancerLegendized', { aeromancerId });
        return { success: true };
    }

    calculateAeromancerValue(aeromancerId) {
        const aeromancer = this.aeromancers.get(aeromancerId);
        if (!aeromancer) return 0;
        return aeromancer.level * 100 + aeromancer.air * 2 + aeromancer.gales.length * 30;
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
        if (this.stats.totalAeromancers < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxAeromancers += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { aeromancers: Array.from(this.aeromancers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.aeromancers) this.aeromancers = new Map(data.aeromancers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, aeromancerCount: this.aeromancers.size }; }
}
