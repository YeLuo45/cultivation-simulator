/**
 * CultivationAscetic.js - 修真苦修
 * V656 Iteration 9/30 Round 27
 */
export class CultivationAscetic {
    constructor(config = {}) {
        this.config = { maxAscetics: config.maxAscetics || 30, basePurity: config.basePurity || 20, ...config };
        this.ascetics = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalAscetics: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getAscetic', (ctx) => this.getAscetic(ctx.asceticId));
        this.registerTool('recruitAscetic', (ctx) => this.recruitAscetic(ctx));
    }

    recruitAscetic(data) {
        const id = data.asceticId || `asc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const ascetic = {
            asceticId: id,
            abbotId: data.abbotId,
            name: data.name || 'Anonymous Ascetic',
            type: data.type || 'fasting',
            purity: data.purity || this.config.basePurity,
            practices: data.practices || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.ascetics.set(id, ascetic);
        this.stats.totalAscetics++;
        this._triggerHook('asceticRecruited', { asceticId: id });
        return { success: true, ascetic };
    }

    getAscetic(id) { return this.ascetics.get(id) ? { ...this.ascetics.get(id) } : null; }
    listAscetics() { return Array.from(this.ascetics.values()).map(a => ({ ...a })); }
    listByAbbot(abbotId) { return Array.from(this.ascetics.values()).filter(a => a.abbotId === abbotId).map(a => ({ ...a })); }
    listLegendary() { return Array.from(this.ascetics.values()).filter(a => a.status === 'legendary').map(a => ({ ...a })); }

    addPractice(asceticId, practice) {
        const ascetic = this.ascetics.get(asceticId);
        if (!ascetic) return { success: false, error: 'ASCETIC_NOT_FOUND' };
        ascetic.practices.push(practice);
        this._triggerHook('practiceAdded', { asceticId, practice });
        return { success: true };
    }

    deepenPurity(asceticId, amount = 5) {
        const ascetic = this.ascetics.get(asceticId);
        if (!ascetic) return { success: false, error: 'ASCETIC_NOT_FOUND' };
        ascetic.purity += amount;
        this._triggerHook('purityDeepened', { asceticId, newPurity: ascetic.purity });
        return { success: true };
    }

    levelUpAscetic(asceticId) {
        const ascetic = this.ascetics.get(asceticId);
        if (!ascetic) return { success: false, error: 'ASCETIC_NOT_FOUND' };
        ascetic.level++;
        if (ascetic.level >= 5 && ascetic.status === 'novice') {
            ascetic.status = 'veteran';
        }
        this._triggerHook('asceticLeveledUp', { asceticId, newLevel: ascetic.level });
        return { success: true };
    }

    legendAscetic(asceticId) {
        const ascetic = this.ascetics.get(asceticId);
        if (!ascetic) return { success: false, error: 'ASCETIC_NOT_FOUND' };
        ascetic.status = 'legendary';
        this._triggerHook('asceticLegendized', { asceticId });
        return { success: true };
    }

    calculateAsceticValue(asceticId) {
        const ascetic = this.ascetics.get(asceticId);
        if (!ascetic) return 0;
        return ascetic.level * 100 + ascetic.purity * 2 + ascetic.practices.length * 30;
    }

    listVeterans() { return Array.from(this.ascetics.values()).filter(a => a.status === 'veteran').map(a => ({ ...a })); }

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
        if (this.stats.totalAscetics < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxAscetics += 15;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { ascetics: Array.from(this.ascetics.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.ascetics) this.ascetics = new Map(data.ascetics);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, asceticCount: this.ascetics.size }; }
}
