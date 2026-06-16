/**
 * CultivationGateway.js - 修真门户系统
 * V752 Iteration 15/30 Round 30 - Cultivation Gateway
 */

export class CultivationGateway {
    constructor(config = {}) {
        this.config = { maxGateways: config.maxGateways || 20, basePotency: config.basePotency || 20, ...config };
        this.gateways = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGateways: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getGateway', (ctx) => this.getGateway(ctx.gatewayId));
        this.registerTool('recruitGateway', (ctx) => this.recruitGateway(ctx));
    }

    recruitGateway(data) {
        const id = data.gatewayId || `gtw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const gateway = {
            gatewayId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Gateway',
            type: data.type || 'small',
            potency: data.potency || this.config.basePotency,
            seals: data.seals || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.gateways.set(id, gateway);
        this.stats.totalGateways++;
        this._triggerHook('gatewayRecruited', { gatewayId: id });
        return { success: true, gateway };
    }

    getGateway(id) { return this.gateways.get(id) ? { ...this.gateways.get(id) } : null; }
    listGateways() { return Array.from(this.gateways.values()).map(g => ({ ...g })); }
    listByMaster(masterId) { return Array.from(this.gateways.values()).filter(g => g.masterId === masterId).map(g => ({ ...g })); }
    listLegendary() { return Array.from(this.gateways.values()).filter(g => g.status === 'legendary').map(g => ({ ...g })); }

    addSeal(gatewayId, seal) {
        const gateway = this.gateways.get(gatewayId);
        if (!gateway) return { success: false, error: 'GATEWAY_NOT_FOUND' };
        gateway.seals.push(seal);
        this._triggerHook('sealAdded', { gatewayId, seal });
        return { success: true, gateway: { ...gateway } };
    }

    raisePotency(gatewayId, amount = 5) {
        const gateway = this.gateways.get(gatewayId);
        if (!gateway) return { success: false, error: 'GATEWAY_NOT_FOUND' };
        gateway.potency += amount;
        this._triggerHook('potencyRaised', { gatewayId, newPotency: gateway.potency });
        return { success: true };
    }

    levelUpGateway(gatewayId) {
        const gateway = this.gateways.get(gatewayId);
        if (!gateway) return { success: false, error: 'GATEWAY_NOT_FOUND' };
        gateway.level++;
        this._triggerHook('gatewayLeveledUp', { gatewayId, newLevel: gateway.level });
        return { success: true };
    }

    legendGateway(gatewayId) {
        const gateway = this.gateways.get(gatewayId);
        if (!gateway) return { success: false, error: 'GATEWAY_NOT_FOUND' };
        gateway.status = 'legendary';
        this._triggerHook('gatewayLegendized', { gatewayId });
        return { success: true };
    }

    calculateGatewayValue(gatewayId) {
        const gateway = this.gateways.get(gatewayId);
        if (!gateway) return 0;
        return gateway.level * 100 + gateway.potency * 2 + gateway.seals.length * 30;
    }

    listByType(type) { return Array.from(this.gateways.values()).filter(g => g.type === type).map(g => ({ ...g })); }
    listVeteran() { return Array.from(this.gateways.values()).filter(g => g.status === 'veteran').map(g => ({ ...g })); }

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
        if (this.stats.totalGateways < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxGateways += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { gateways: Array.from(this.gateways.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.gateways) this.gateways = new Map(data.gateways);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, gatewayCount: this.gateways.size }; }
}
