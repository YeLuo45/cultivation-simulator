/**
 * CultivationBoxer.js - 修真拳师
 * V618 Iteration 1/30 Round 26
 */
export class CultivationBoxer {
    constructor(config = {}) {
        this.config = { maxBoxers: config.maxBoxers || 50, basePower: config.basePower || 20, ...config };
        this.boxers = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBoxers: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBoxer', (ctx) => this.getBoxer(ctx.boxerId));
        this.registerTool('recruitBoxer', (ctx) => this.recruitBoxer(ctx));
    }

    recruitBoxer(data) {
        const id = data.boxerId || `bxr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const boxer = {
            boxerId: id,
            trainerId: data.trainerId,
            name: data.name || 'Anonymous Boxer',
            type: data.type || 'fist',
            power: data.power || this.config.basePower,
            techniques: data.techniques || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.boxers.set(id, boxer);
        this.stats.totalBoxers++;
        this._triggerHook('boxerRecruited', { boxerId: id });
        return { success: true, boxer };
    }

    getBoxer(id) { return this.boxers.get(id) ? { ...this.boxers.get(id) } : null; }
    listBoxers() { return Array.from(this.boxers.values()).map(b => ({ ...b })); }
    listByTrainer(trainerId) { return Array.from(this.boxers.values()).filter(b => b.trainerId === trainerId).map(b => ({ ...b })); }
    listLegendary() { return Array.from(this.boxers.values()).filter(b => b.status === 'legendary').map(b => ({ ...b })); }

    addTechnique(boxerId, technique) {
        const boxer = this.boxers.get(boxerId);
        if (!boxer) return { success: false, error: 'BOXER_NOT_FOUND' };
        boxer.techniques.push(technique);
        this._triggerHook('techniqueAdded', { boxerId, technique });
        return { success: true };
    }

    buildPower(boxerId, amount = 5) {
        const boxer = this.boxers.get(boxerId);
        if (!boxer) return { success: false, error: 'BOXER_NOT_FOUND' };
        boxer.power += amount;
        this._triggerHook('powerBuilt', { boxerId, newPower: boxer.power });
        return { success: true };
    }

    levelUpBoxer(boxerId) {
        const boxer = this.boxers.get(boxerId);
        if (!boxer) return { success: false, error: 'BOXER_NOT_FOUND' };
        boxer.level++;
        if (boxer.level >= 5 && boxer.status === 'novice') {
            boxer.status = 'veteran';
        }
        this._triggerHook('boxerLeveledUp', { boxerId, newLevel: boxer.level });
        return { success: true };
    }

    legendBoxer(boxerId) {
        const boxer = this.boxers.get(boxerId);
        if (!boxer) return { success: false, error: 'BOXER_NOT_FOUND' };
        boxer.status = 'legendary';
        this._triggerHook('boxerLegendized', { boxerId });
        return { success: true };
    }

    calculateBoxerValue(boxerId) {
        const boxer = this.boxers.get(boxerId);
        if (!boxer) return 0;
        return boxer.level * 100 + boxer.power * 2 + boxer.techniques.length * 30;
    }

    listVeterans() { return Array.from(this.boxers.values()).filter(b => b.status === 'veteran').map(b => ({ ...b })); }

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
        if (this.stats.totalBoxers < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBoxers += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { boxers: Array.from(this.boxers.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.boxers) this.boxers = new Map(data.boxers);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, boxerCount: this.boxers.size }; }
}
