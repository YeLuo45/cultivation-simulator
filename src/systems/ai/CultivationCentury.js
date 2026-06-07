/**
 * CultivationCentury.js - 修真世纪系统
 * V826 Iteration 29/30 Round 32
 */
export class CultivationCentury {
    constructor(config = {}) {
        this.config = { maxCenturies: config.maxCenturies || 20, baseDepth: config.baseDepth || 20, ...config };
        this.centuries = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCenturies: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCentury', (ctx) => this.getCentury(ctx.centuryId));
        this.registerTool('recruitCentury', (ctx) => this.recruitCentury(ctx));
    }

    recruitCentury(data) {
        const id = data.centuryId || `cny_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const century = {
            centuryId: id,
            masterId: data.masterId,
            name: data.name || 'unnamed',
            type: data.type || 'ancient',
            depth: data.depth || this.config.baseDepth,
            decades: data.decades || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.centuries.set(id, century);
        this.stats.totalCenturies++;
        this._triggerHook('centuryRecruited', { centuryId: id });
        return { success: true, century };
    }

    getCentury(centuryId) { return this.centuries.get(centuryId) ? { ...this.centuries.get(centuryId) } : null; }
    listCenturies() { return Array.from(this.centuries.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.centuries.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.centuries.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addDecade(centuryId, decade) {
        const century = this.centuries.get(centuryId);
        if (!century) return { success: false, error: 'CENTURY_NOT_FOUND' };
        century.decades.push(decade);
        this._triggerHook('decadeAdded', { centuryId, decade });
        return { success: true };
    }

    raiseDepth(centuryId, amount = 5) {
        const century = this.centuries.get(centuryId);
        if (!century) return { success: false, error: 'CENTURY_NOT_FOUND' };
        century.depth += amount;
        this._triggerHook('depthRaised', { centuryId, newDepth: century.depth });
        return { success: true };
    }

    levelUpCentury(centuryId) {
        const century = this.centuries.get(centuryId);
        if (!century) return { success: false, error: 'CENTURY_NOT_FOUND' };
        century.level++;
        this._triggerHook('centuryLeveledUp', { centuryId, newLevel: century.level });
        return { success: true };
    }

    legendCentury(centuryId) {
        const century = this.centuries.get(centuryId);
        if (!century) return { success: false, error: 'CENTURY_NOT_FOUND' };
        century.status = 'legendary';
        this._triggerHook('centuryLegendized', { centuryId });
        return { success: true };
    }

    calculateCenturyValue(centuryId) {
        const century = this.centuries.get(centuryId);
        if (!century) return 0;
        return century.level * 100 + century.depth * 2 + century.decades.length * 30;
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
        if (this.stats.totalCenturies < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCenturies += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { centuries: Array.from(this.centuries.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.centuries) this.centuries = new Map(data.centuries);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, centuryCount: this.centuries.size }; }
}
