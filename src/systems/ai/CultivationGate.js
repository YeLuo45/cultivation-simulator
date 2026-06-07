/**
 * CultivationGate.js - 修真闸系统
 * V754 Iteration 17/30 Round 30 - Cultivation Gate
 */

export class CultivationGate {
    constructor(config = {}) {
        this.config = { maxGates: config.maxGates || 20, baseAuthority: config.baseAuthority || 20, ...config };
        this.gates = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGates: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getGate', (ctx) => this.getGate(ctx.gateId));
        this.registerTool('recruitGate', (ctx) => this.recruitGate(ctx));
    }

    recruitGate(data) {
        const id = data.gateId || `gte_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const gate = {
            gateId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Gate',
            type: data.type || 'small',
            authority: data.authority || this.config.baseAuthority,
            bars: data.bars || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.gates.set(id, gate);
        this.stats.totalGates++;
        this._triggerHook('gateRecruited', { gateId: id });
        return { success: true, gate };
    }

    getGate(id) { return this.gates.get(id) ? { ...this.gates.get(id) } : null; }
    listGates() { return Array.from(this.gates.values()).map(g => ({ ...g })); }
    listByMaster(masterId) { return Array.from(this.gates.values()).filter(g => g.masterId === masterId).map(g => ({ ...g })); }
    listLegendary() { return Array.from(this.gates.values()).filter(g => g.status === 'legendary').map(g => ({ ...g })); }

    addBar(gateId, bar) {
        const gate = this.gates.get(gateId);
        if (!gate) return { success: false, error: 'GATE_NOT_FOUND' };
        gate.bars.push(bar);
        this._triggerHook('barAdded', { gateId, bar });
        return { success: true, gate: { ...gate } };
    }

    raiseAuthority(gateId, amount = 5) {
        const gate = this.gates.get(gateId);
        if (!gate) return { success: false, error: 'GATE_NOT_FOUND' };
        gate.authority += amount;
        this._triggerHook('authorityRaised', { gateId, newAuthority: gate.authority });
        return { success: true };
    }

    levelUpGate(gateId) {
        const gate = this.gates.get(gateId);
        if (!gate) return { success: false, error: 'GATE_NOT_FOUND' };
        gate.level++;
        this._triggerHook('gateLeveledUp', { gateId, newLevel: gate.level });
        return { success: true };
    }

    legendGate(gateId) {
        const gate = this.gates.get(gateId);
        if (!gate) return { success: false, error: 'GATE_NOT_FOUND' };
        gate.status = 'legendary';
        this._triggerHook('gateLegendized', { gateId });
        return { success: true };
    }

    calculateGateValue(gateId) {
        const gate = this.gates.get(gateId);
        if (!gate) return 0;
        return gate.level * 100 + gate.authority * 2 + gate.bars.length * 30;
    }

    listByType(type) { return Array.from(this.gates.values()).filter(g => g.type === type).map(g => ({ ...g })); }
    listVeteran() { return Array.from(this.gates.values()).filter(g => g.status === 'veteran').map(g => ({ ...g })); }

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
        this.config.maxGates += 30;
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
