/**
 * CultivationBridge.js - 修真桥系统
 * V748 Iteration 11/30 Round 30 - Cultivation Bridge
 */

export class CultivationBridge {
    constructor(config = {}) {
        this.config = { maxBridges: config.maxBridges || 20, baseStrength: config.baseStrength || 20, ...config };
        this.bridges = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBridges: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBridge', (ctx) => this.getBridge(ctx.bridgeId));
        this.registerTool('recruitBridge', (ctx) => this.recruitBridge(ctx));
    }

    recruitBridge(data) {
        const id = data.bridgeId || `brg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const bridge = {
            bridgeId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Bridge',
            type: data.type || 'stone',
            strength: data.strength || this.config.baseStrength,
            arches: data.arches || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.bridges.set(id, bridge);
        this.stats.totalBridges++;
        this._triggerHook('bridgeRecruited', { bridgeId: id });
        return { success: true, bridge };
    }

    getBridge(id) { return this.bridges.get(id) ? { ...this.bridges.get(id) } : null; }
    listBridges() { return Array.from(this.bridges.values()).map(b => ({ ...b })); }
    listByMaster(masterId) { return Array.from(this.bridges.values()).filter(b => b.masterId === masterId).map(b => ({ ...b })); }
    listLegendary() { return Array.from(this.bridges.values()).filter(b => b.status === 'legendary').map(b => ({ ...b })); }

    addArch(bridgeId, arch) {
        const bridge = this.bridges.get(bridgeId);
        if (!bridge) return { success: false, error: 'BRIDGE_NOT_FOUND' };
        bridge.arches.push(arch);
        this._triggerHook('archAdded', { bridgeId, arch });
        return { success: true, bridge: { ...bridge } };
    }

    raiseStrength(bridgeId, amount = 5) {
        const bridge = this.bridges.get(bridgeId);
        if (!bridge) return { success: false, error: 'BRIDGE_NOT_FOUND' };
        bridge.strength += amount;
        this._triggerHook('strengthRaised', { bridgeId, newStrength: bridge.strength });
        return { success: true };
    }

    levelUpBridge(bridgeId) {
        const bridge = this.bridges.get(bridgeId);
        if (!bridge) return { success: false, error: 'BRIDGE_NOT_FOUND' };
        bridge.level++;
        this._triggerHook('bridgeLeveledUp', { bridgeId, newLevel: bridge.level });
        return { success: true };
    }

    legendBridge(bridgeId) {
        const bridge = this.bridges.get(bridgeId);
        if (!bridge) return { success: false, error: 'BRIDGE_NOT_FOUND' };
        bridge.status = 'legendary';
        this._triggerHook('bridgeLegendized', { bridgeId });
        return { success: true };
    }

    calculateBridgeValue(bridgeId) {
        const bridge = this.bridges.get(bridgeId);
        if (!bridge) return 0;
        return bridge.level * 100 + bridge.strength * 2 + bridge.arches.length * 30;
    }

    listByType(type) { return Array.from(this.bridges.values()).filter(b => b.type === type).map(b => ({ ...b })); }
    listVeteran() { return Array.from(this.bridges.values()).filter(b => b.status === 'veteran').map(b => ({ ...b })); }

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
        if (this.stats.totalBridges < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBridges += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { bridges: Array.from(this.bridges.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.bridges) this.bridges = new Map(data.bridges);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, bridgeCount: this.bridges.size }; }
}
