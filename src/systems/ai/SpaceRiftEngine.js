/**
 * SpaceRiftEngine.js - 空间裂缝引擎
 * V353 Iteration 5/9 Round 8
 */
export class SpaceRiftEngine {
    constructor(config = {}) {
        this.config = { maxRifts: config.maxRifts || 50, baseRiftSize: config.baseRiftSize || 1, ...config };
        this.rifts = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRifts: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRift', (ctx) => this.getRift(ctx.riftId));
        this.registerTool('listRifts', () => Array.from(this.rifts.values()).map(r => ({...r})));
    }

    createRift(data) {
        const id = data.id || `rf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const rift = { riftId: id, name: data.name || 'Rift', location: data.location || 'unknown', size: data.size || this.config.baseRiftSize, stability: data.stability || 1.0, openedAt: Date.now(), status: 'stable' };
        this.rifts.set(id, rift);
        this.stats.totalRifts++;
        this._triggerHook('riftCreated', { riftId: id });
        return { success: true, rift };
    }

    getRift(id) { return this.rifts.get(id) ? { ...this.rifts.get(id) } : null; }
    listRifts() { return Array.from(this.rifts.values()).map(r => ({ ...r })); }
    listByLocation(loc) { return Array.from(this.rifts.values()).filter(r => r.location === loc).map(r => ({ ...r })); }
    listByStatus(status) { return Array.from(this.rifts.values()).filter(r => r.status === status).map(r => ({ ...r })); }

    expandRift(riftId, amount) {
        const rift = this.rifts.get(riftId);
        if (!rift) return { success: false, error: 'RIFT_NOT_FOUND' };
        rift.size += amount;
        rift.stability = Math.max(0, rift.stability - amount * 0.1);
        if (rift.stability < 0.3) rift.status = 'unstable';
        if (rift.stability === 0) rift.status = 'collapsed';
        this._triggerHook('riftExpanded', { riftId, newSize: rift.size });
        return { success: true, rift: { ...rift } };
    }

    stabilizeRift(riftId, amount) {
        const rift = this.rifts.get(riftId);
        if (!rift) return { success: false, error: 'RIFT_NOT_FOUND' };
        rift.stability = Math.min(1, rift.stability + amount);
        if (rift.stability > 0.7) rift.status = 'stable';
        this._triggerHook('riftStabilized', { riftId, newStability: rift.stability });
        return { success: true, rift: { ...rift } };
    }

    closeRift(riftId) {
        if (!this.rifts.has(riftId)) return { success: false, error: 'RIFT_NOT_FOUND' };
        this.rifts.delete(riftId);
        this._triggerHook('riftClosed', { riftId });
        return { success: true };
    }

    calculateFlux(riftId) {
        const rift = this.rifts.get(riftId);
        if (!rift) return null;
        return Math.floor(rift.size * (1 - rift.stability) * 100);
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
        if (this.stats.totalRifts < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxRifts += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { rifts: Array.from(this.rifts.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.rifts) this.rifts = new Map(data.rifts);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, riftCount: this.rifts.size }; }
}