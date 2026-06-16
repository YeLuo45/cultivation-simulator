/**
 * CultivationPyromancer.js - 修真火焰师
 * V628 Iteration 11/30 Round 26
 */
export class CultivationPyromancer {
    constructor(config = {}) {
        this.config = { maxPyromancers: config.maxPyromancers || 50, baseHeat: config.baseHeat || 20, ...config };
        this.pyromancers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPyromancers: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPyromancer', (ctx) => this.getPyromancer(ctx.pyromancerId));
        this.registerTool('recruitPyromancer', (ctx) => this.recruitPyromancer(ctx));
    }

    recruitPyromancer(data) {
        const id = data.pyromancerId || `pyr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const validTypes = ['fire', 'lava', 'ash'];
        const type = validTypes.includes(data.type) ? data.type : 'fire';
        const pyromancer = { pyromancerId: id, mentorId: data.mentorId || null, name: data.name || 'Anonymous', type, heat: data.heat != null ? data.heat : this.config.baseHeat, flames: data.flames || [], level: data.level || 1, status: data.status || 'novice', createdAt: Date.now() };
        this.pyromancers.set(id, pyromancer);
        this.stats.totalPyromancers++;
        this._triggerHook('pyromancerRecruited', { pyromancerId: id, mentorId: pyromancer.mentorId });
        return { success: true, pyromancer };
    }

    getPyromancer(pyromancerId) { return this.pyromancers.get(pyromancerId) ? { ...this.pyromancers.get(pyromancerId) } : null; }
    listPyromancers() { return Array.from(this.pyromancers.values()).map(p => ({ ...p })); }
    listByMentor(mentorId) { return Array.from(this.pyromancers.values()).filter(p => p.mentorId === mentorId).map(p => ({ ...p })); }
    listLegendary() { return Array.from(this.pyromancers.values()).filter(p => p.status === 'legendary').map(p => ({ ...p })); }

    addFlame(pyromancerId, flame) {
        const pyromancer = this.pyromancers.get(pyromancerId);
        if (!pyromancer) return { success: false, error: 'PYROMANCER_NOT_FOUND' };
        pyromancer.flames.push(flame);
        this._triggerHook('flameAdded', { pyromancerId, flame, flameCount: pyromancer.flames.length });
        return { success: true, flames: [...pyromancer.flames] };
    }

    increaseHeat(pyromancerId, amount = 5) {
        const pyromancer = this.pyromancers.get(pyromancerId);
        if (!pyromancer) return { success: false, error: 'PYROMANCER_NOT_FOUND' };
        pyromancer.heat += amount;
        this._triggerHook('heatIncreased', { pyromancerId, amount, newHeat: pyromancer.heat });
        return { success: true, heat: pyromancer.heat };
    }

    levelUpPyromancer(pyromancerId) {
        const pyromancer = this.pyromancers.get(pyromancerId);
        if (!pyromancer) return { success: false, error: 'PYROMANCER_NOT_FOUND' };
        pyromancer.level++;
        this._triggerHook('pyromancerLeveledUp', { pyromancerId, newLevel: pyromancer.level });
        return { success: true, level: pyromancer.level };
    }

    legendPyromancer(pyromancerId) {
        const pyromancer = this.pyromancers.get(pyromancerId);
        if (!pyromancer) return { success: false, error: 'PYROMANCER_NOT_FOUND' };
        pyromancer.status = 'legendary';
        this._triggerHook('pyromancerLegendized', { pyromancerId });
        return { success: true, status: pyromancer.status };
    }

    calculatePyromancerValue(pyromancerId) {
        const pyromancer = this.pyromancers.get(pyromancerId);
        if (!pyromancer) return 0;
        return pyromancer.level * 100 + pyromancer.heat * 2 + pyromancer.flames.length * 30;
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
        if (this.stats.totalPyromancers < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPyromancers += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { pyromancers: Array.from(this.pyromancers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.pyromancers) this.pyromancers = new Map(data.pyromancers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, pyromancerCount: this.pyromancers.size }; }
}
