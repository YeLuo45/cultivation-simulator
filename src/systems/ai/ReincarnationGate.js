/**
 * ReincarnationGate.js - 轮回之门
 * V373 Iteration 7/9 Round 10
 */
export class ReincarnationGate {
    constructor(config = {}) {
        this.config = { maxGates: config.maxGates || 50, baseCost: config.baseCost || 100, ...config };
        this.gates = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGates: 0, totalOpenings: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getGate', (ctx) => this.getGate(ctx.gateId));
        this.registerTool('createGate', (ctx) => this.createGate(ctx));
    }

    createGate(data) {
        const id = data.id || `gt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const gate = { gateId: id, name: data.name || 'Gate', realm: data.realm || 'mortal', cost: data.cost || this.config.baseCost, openings: 0, createdAt: Date.now() };
        this.gates.set(id, gate);
        this.stats.totalGates++;
        this._triggerHook('gateCreated', { gateId: id });
        return { success: true, gate };
    }

    getGate(id) { return this.gates.get(id) ? { ...this.gates.get(id) } : null; }
    listGates() { return Array.from(this.gates.values()).map(g => ({ ...g })); }
    listByRealm(realm) { return Array.from(this.gates.values()).filter(g => g.realm === realm).map(g => ({ ...g })); }

    openGate(gateId) {
        const gate = this.gates.get(gateId);
        if (!gate) return { success: false, error: 'GATE_NOT_FOUND' };
        gate.openings++;
        this.stats.totalOpenings++;
        this._triggerHook('gateOpened', { gateId });
        return { success: true, gate: { ...gate } };
    }

    closeGate(gateId) {
        const gate = this.gates.get(gateId);
        if (!gate) return { success: false, error: 'GATE_NOT_FOUND' };
        this._triggerHook('gateClosed', { gateId });
        return { success: true };
    }

    destroyGate(gateId) {
        if (!this.gates.has(gateId)) return { success: false, error: 'GATE_NOT_FOUND' };
        this.gates.delete(gateId);
        this._triggerHook('gateDestroyed', { gateId });
        return { success: true };
    }

    calculateTotalOpenings() { return Array.from(this.gates.values()).reduce((s, g) => s + g.openings, 0); }
    listOpenGates() { return Array.from(this.gates.values()).filter(g => g.openings > 0).map(g => ({ ...g })); }

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
        if (this.stats.totalGates < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxGates += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { gates: Array.from(this.gates.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.gates) this.gates = new Map(data.gates);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, gateCount: this.gates.size }; }
}