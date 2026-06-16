/**
 * CultivationFlow.js - 修真流系统
 * V744 Iteration 7/30 Round 30
 */
export class CultivationFlow {
    constructor(config = {}) {
        this.config = { maxFlows: config.maxFlows || 20, baseFluidity: config.baseFluidity || 20, ...config };
        this.flows = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalFlows: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getFlow', (ctx) => this.getFlow(ctx.flowId));
        this.registerTool('recruitFlow', (ctx) => this.recruitFlow(ctx));
    }

    recruitFlow(data) {
        if (this.flows.size >= this.config.maxFlows) return { success: false, error: 'MAX_FLOWS_REACHED' };
        const id = data.flowId || `flw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const flow = {
            flowId: id,
            masterId: data.masterId,
            name: data.name || 'unnamed-flow',
            type: data.type || 'water',
            fluidity: data.fluidity || this.config.baseFluidity,
            streams: data.streams || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.flows.set(id, flow);
        this.stats.totalFlows++;
        this._triggerHook('flowRecruited', { flowId: id });
        return { success: true, flow };
    }

    getFlow(id) { return this.flows.get(id) ? { ...this.flows.get(id) } : null; }
    listFlows() { return Array.from(this.flows.values()).map(f => ({ ...f })); }
    listByMaster(masterId) { return Array.from(this.flows.values()).filter(f => f.masterId === masterId).map(f => ({ ...f })); }
    listLegendary() { return Array.from(this.flows.values()).filter(f => f.status === 'legendary').map(f => ({ ...f })); }

    addStream(flowId, stream) {
        const flow = this.flows.get(flowId);
        if (!flow) return { success: false, error: 'FLOW_NOT_FOUND' };
        flow.streams.push(stream);
        this._triggerHook('streamAdded', { flowId, stream, totalStreams: flow.streams.length });
        return { success: true };
    }

    raiseFluidity(flowId, amount = 5) {
        const flow = this.flows.get(flowId);
        if (!flow) return { success: false, error: 'FLOW_NOT_FOUND' };
        flow.fluidity += amount;
        this._triggerHook('fluidityRaised', { flowId, newFluidity: flow.fluidity });
        return { success: true };
    }

    levelUpFlow(flowId) {
        const flow = this.flows.get(flowId);
        if (!flow) return { success: false, error: 'FLOW_NOT_FOUND' };
        flow.level++;
        if (flow.level >= 5) flow.status = 'veteran';
        this._triggerHook('flowLeveledUp', { flowId, newLevel: flow.level });
        return { success: true };
    }

    legendFlow(flowId) {
        const flow = this.flows.get(flowId);
        if (!flow) return { success: false, error: 'FLOW_NOT_FOUND' };
        flow.status = 'legendary';
        this._triggerHook('flowLegendized', { flowId });
        return { success: true };
    }

    calculateFlowValue(flowId) {
        const flow = this.flows.get(flowId);
        if (!flow) return 0;
        return flow.level * 100 + flow.fluidity * 2 + flow.streams.length * 30;
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
        if (this.stats.totalFlows < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxFlows += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { flows: Array.from(this.flows.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.flows) this.flows = new Map(data.flows);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, flowCount: this.flows.size }; }
}
