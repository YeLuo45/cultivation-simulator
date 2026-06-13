/**
 * CultivationAmber.js - 修真琥珀系统
 * V832 Iteration 5/30 Round 33
 */
export class CultivationAmber {
    constructor(config = {}) {
        this.config = { maxAmbers: config.maxAmbers || 20, baseWarmth: config.baseWarmth || 20, ...config };
        this.ambers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalAmbers: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getAmber', (ctx) => this.getAmber(ctx.amberId));
        this.registerTool('recruitAmber', (ctx) => this.recruitAmber(ctx));
    }

    recruitAmber(data) {
        const id = data.id || `amb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const amber = {
            amberId: id,
            masterId: data.masterId || 'unknown_master',
            name: data.name || 'unnamed_amber',
            type: data.type || 'golden',
            warmth: data.warmth || this.config.baseWarmth,
            inclusions: data.inclusions || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.ambers.set(id, amber);
        this.stats.totalAmbers++;
        this._triggerHook('amberRecruited', { amberId: id });
        return { success: true, amber };
    }

    getAmber(id) { return this.ambers.get(id) ? { ...this.ambers.get(id) } : null; }
    listAmbers() { return Array.from(this.ambers.values()).map(a => ({ ...a })); }
    listByMaster(masterId) { return Array.from(this.ambers.values()).filter(a => a.masterId === masterId).map(a => ({ ...a })); }
    listLegendary() { return Array.from(this.ambers.values()).filter(a => a.status === 'legendary').map(a => ({ ...a })); }

    addInclusion(amberId, inclusion) {
        const amber = this.ambers.get(amberId);
        if (!amber) return { success: false, error: 'AMBER_NOT_FOUND' };
        amber.inclusions.push(inclusion);
        if (amber.inclusions.length >= 5) amber.status = 'veteran';
        this._triggerHook('inclusionAdded', { amberId, inclusion });
        return { success: true };
    }

    raiseWarmth(amberId, amount = 5) {
        const amber = this.ambers.get(amberId);
        if (!amber) return { success: false, error: 'AMBER_NOT_FOUND' };
        amber.warmth += amount;
        this._triggerHook('warmthRaised', { amberId, newWarmth: amber.warmth });
        return { success: true };
    }

    levelUpAmber(amberId) {
        const amber = this.ambers.get(amberId);
        if (!amber) return { success: false, error: 'AMBER_NOT_FOUND' };
        amber.level++;
        this._triggerHook('amberLeveledUp', { amberId, newLevel: amber.level });
        return { success: true };
    }

    legendAmber(amberId) {
        const amber = this.ambers.get(amberId);
        if (!amber) return { success: false, error: 'AMBER_NOT_FOUND' };
        amber.status = 'legendary';
        this._triggerHook('amberLegendized', { amberId });
        return { success: true };
    }

    calculateAmberValue(amberId) {
        const amber = this.ambers.get(amberId);
        if (!amber) return 0;
        return amber.level * 100 + amber.warmth * 2 + amber.inclusions.length * 30;
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
        if (this.stats.totalAmbers < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxAmbers += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { ambers: Array.from(this.ambers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.ambers) this.ambers = new Map(data.ambers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, amberCount: this.ambers.size }; }
}
