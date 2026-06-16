/**
 * CultivationSpring.js - 修真泉系统
 * V692 Iteration 15/30 Round 28
 */
export class CultivationSpring {
    constructor(config = {}) {
        this.config = { maxSprings: config.maxSprings || 10, basePurity: config.basePurity || 20, ...config };
        this.springs = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSprings: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSpring', (ctx) => this.getSpring(ctx.springId));
        this.registerTool('recruitSpring', (ctx) => this.recruitSpring(ctx));
    }

    recruitSpring(data = {}) {
        const id = data.springId || `spr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const spring = {
            springId: id,
            masterId: data.masterId || null,
            name: data.name || 'unnamed-spring',
            type: data.type || 'spirit',
            purity: data.purity || this.config.basePurity,
            streams: data.streams || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.springs.set(id, spring);
        this.stats.totalSprings++;
        this._triggerHook('springRecruited', { springId: id });
        return { success: true, spring };
    }

    getSpring(id) { return this.springs.get(id) ? { ...this.springs.get(id) } : null; }
    listSprings() { return Array.from(this.springs.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.springs.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.springs.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addStream(springId, stream) {
        const spring = this.springs.get(springId);
        if (!spring) return { success: false, error: 'SPRING_NOT_FOUND' };
        spring.streams.push(stream);
        this._triggerHook('streamAdded', { springId, stream });
        return { success: true };
    }

    raisePurity(springId, amount = 5) {
        const spring = this.springs.get(springId);
        if (!spring) return { success: false, error: 'SPRING_NOT_FOUND' };
        spring.purity += amount;
        this._triggerHook('purityRaised', { springId, newPurity: spring.purity });
        return { success: true };
    }

    levelUpSpring(springId) {
        const spring = this.springs.get(springId);
        if (!spring) return { success: false, error: 'SPRING_NOT_FOUND' };
        spring.level++;
        this._triggerHook('springLeveledUp', { springId, newLevel: spring.level });
        return { success: true };
    }

    legendSpring(springId) {
        const spring = this.springs.get(springId);
        if (!spring) return { success: false, error: 'SPRING_NOT_FOUND' };
        spring.status = 'legendary';
        this._triggerHook('springLegendized', { springId });
        return { success: true };
    }

    calculateSpringValue(springId) {
        const spring = this.springs.get(springId);
        if (!spring) return 0;
        return spring.level * 100 + spring.purity * 2 + spring.streams.length * 30;
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
        if (this.stats.totalSprings < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSprings += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { springs: Array.from(this.springs.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.springs) this.springs = new Map(data.springs);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, springCount: this.springs.size }; }
}
