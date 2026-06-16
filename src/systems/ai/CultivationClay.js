/**
 * CultivationClay.js - 修真黏土系统
 * V844 Iteration 17/30 Round 33
 */
export class CultivationClay {
    constructor(config = {}) {
        this.config = { maxClays: config.maxClays || 20, basePlasticity: config.basePlasticity || 20, ...config };
        this.clays = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalClays: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getClay', (ctx) => this.getClay(ctx.clayId));
        this.registerTool('recruitClay', (ctx) => this.recruitClay(ctx));
    }

    recruitClay(data) {
        const id = data.id || `cly_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const clay = {
            clayId: id,
            masterId: data.masterId || 'unknown_master',
            name: data.name || 'unnamed_clay',
            type: data.type || 'earthen',
            plasticity: data.plasticity || this.config.basePlasticity,
            vessels: data.vessels || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.clays.set(id, clay);
        this.stats.totalClays++;
        this._triggerHook('clayRecruited', { clayId: id });
        return { success: true, clay };
    }

    getClay(id) { return this.clays.get(id) ? { ...this.clays.get(id) } : null; }
    listClays() { return Array.from(this.clays.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.clays.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.clays.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addVessel(clayId, vessel) {
        const clay = this.clays.get(clayId);
        if (!clay) return { success: false, error: 'CLAY_NOT_FOUND' };
        clay.vessels.push(vessel);
        if (clay.vessels.length >= 5) clay.status = 'veteran';
        this._triggerHook('vesselAdded', { clayId, vessel });
        return { success: true };
    }

    raisePlasticity(clayId, amount = 5) {
        const clay = this.clays.get(clayId);
        if (!clay) return { success: false, error: 'CLAY_NOT_FOUND' };
        clay.plasticity += amount;
        this._triggerHook('plasticityRaised', { clayId, newPlasticity: clay.plasticity });
        return { success: true };
    }

    levelUpClay(clayId) {
        const clay = this.clays.get(clayId);
        if (!clay) return { success: false, error: 'CLAY_NOT_FOUND' };
        clay.level++;
        this._triggerHook('clayLeveledUp', { clayId, newLevel: clay.level });
        return { success: true };
    }

    legendClay(clayId) {
        const clay = this.clays.get(clayId);
        if (!clay) return { success: false, error: 'CLAY_NOT_FOUND' };
        clay.status = 'legendary';
        this._triggerHook('clayLegendized', { clayId });
        return { success: true };
    }

    calculateClayValue(clayId) {
        const clay = this.clays.get(clayId);
        if (!clay) return 0;
        return clay.level * 100 + clay.plasticity * 2 + clay.vessels.length * 30;
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
        if (this.stats.totalClays < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxClays += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { clays: Array.from(this.clays.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.clays) this.clays = new Map(data.clays);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, clayCount: this.clays.size }; }
}
