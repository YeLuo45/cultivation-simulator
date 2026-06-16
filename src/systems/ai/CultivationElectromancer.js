/**
 * CultivationElectromancer.js - 修真雷电师
 * V630 Iteration 13/30 Round 26
 */
export class CultivationElectromancer {
    constructor(config = {}) {
        this.config = { maxElectromancers: config.maxElectromancers || 50, baseVoltage: config.baseVoltage || 20, ...config };
        this.electromancers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalElectromancers: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getElectromancer', (ctx) => this.getElectromancer(ctx.electromancerId));
        this.registerTool('recruitElectromancer', (ctx) => this.recruitElectromancer(ctx));
    }

    recruitElectromancer(data) {
        const id = data.id || `em_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const electromancer = { electromancerId: id, mentorId: data.mentorId || null, name: data.name || 'Anonymous', type: data.type || 'lightning', voltage: data.voltage || this.config.baseVoltage, storms: [], level: 1, status: 'novice', createdAt: Date.now() };
        this.electromancers.set(id, electromancer);
        this.stats.totalElectromancers++;
        this._triggerHook('electromancerRecruited', { electromancerId: id });
        return { success: true, electromancer };
    }

    getElectromancer(id) { return this.electromancers.get(id) ? { ...this.electromancers.get(id) } : null; }
    listElectromancers() { return Array.from(this.electromancers.values()).map(e => ({ ...e })); }
    listByMentor(mentorId) { return Array.from(this.electromancers.values()).filter(e => e.mentorId === mentorId).map(e => ({ ...e })); }
    listLegendary() { return Array.from(this.electromancers.values()).filter(e => e.status === 'legendary').map(e => ({ ...e })); }

    addStorm(electromancerId, storm) {
        const electromancer = this.electromancers.get(electromancerId);
        if (!electromancer) return { success: false, error: 'ELECTROMANCER_NOT_FOUND' };
        electromancer.storms.push(storm);
        this._triggerHook('stormAdded', { electromancerId, storm });
        return { success: true };
    }

    increaseVoltage(electromancerId, amount = 5) {
        const electromancer = this.electromancers.get(electromancerId);
        if (!electromancer) return { success: false, error: 'ELECTROMANCER_NOT_FOUND' };
        electromancer.voltage += amount;
        this._triggerHook('voltageIncreased', { electromancerId, newVoltage: electromancer.voltage });
        return { success: true };
    }

    levelUpElectromancer(electromancerId) {
        const electromancer = this.electromancers.get(electromancerId);
        if (!electromancer) return { success: false, error: 'ELECTROMANCER_NOT_FOUND' };
        electromancer.level++;
        if (electromancer.level >= 5 && electromancer.status === 'novice') electromancer.status = 'veteran';
        this._triggerHook('electromancerLeveledUp', { electromancerId, newLevel: electromancer.level });
        return { success: true };
    }

    legendElectromancer(electromancerId) {
        const electromancer = this.electromancers.get(electromancerId);
        if (!electromancer) return { success: false, error: 'ELECTROMANCER_NOT_FOUND' };
        electromancer.status = 'legendary';
        this._triggerHook('electromancerLegendized', { electromancerId });
        return { success: true };
    }

    calculateElectromancerValue(electromancerId) {
        const electromancer = this.electromancers.get(electromancerId);
        if (!electromancer) return 0;
        return electromancer.level * 100 + electromancer.voltage * 2 + electromancer.storms.length * 30;
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
        if (this.stats.totalElectromancers < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxElectromancers += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { electromancers: Array.from(this.electromancers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.electromancers) this.electromancers = new Map(data.electromancers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, electromancerCount: this.electromancers.size }; }
}
