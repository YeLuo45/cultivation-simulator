/**
 * DimensionalRift.js - 空间裂隙
 * V461 Iteration 8/15 Round 17 - Dimensional Rift
 *
 * 融合6大设计系统:
 * - generic-agent: 空间裂隙自循环
 * - chatdev: 空间裂隙角色协调
 * - nanobot: 空间裂隙mesh
 * - claude-code: 空间裂隙分析工具
 * - thunderbolt: 空间裂隙持久化
 * - ruflo: 空间裂隙Hook
 */

export class DimensionalRift {
    constructor(config = {}) {
        this.config = { maxRifts: config.maxRifts || 50, baseStability: config.baseStability || 50, ...config };
        this.rifts = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRifts: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRift', (ctx) => this.getRift(ctx.riftId));
        this.registerTool('openRift', (ctx) => this.openRift(ctx));
    }

    openRift(data) {
        const id = data.id || `rft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const rift = {
            riftId: id,
            controllerId: data.controllerId,
            name: data.name || 'Dimensional Rift',
            origin: data.origin || 'origin_point',
            dimension: data.dimension || 'unknown_dimension',
            stability: data.stability !== undefined ? data.stability : this.config.baseStability,
            creatures: data.creatures ? [...data.creatures] : [],
            status: data.status || 'unstable',
            createdAt: Date.now()
        };
        this.rifts.set(id, rift);
        this.stats.totalRifts++;
        this._triggerHook('riftOpened', { riftId: id });
        return { success: true, rift };
    }

    getRift(id) { return this.rifts.get(id) ? { ...this.rifts.get(id) } : null; }
    listRifts() { return Array.from(this.rifts.values()).map(r => ({ ...r })); }
    listByController(controllerId) { return Array.from(this.rifts.values()).filter(r => r.controllerId === controllerId).map(r => ({ ...r })); }
    listStable() { return Array.from(this.rifts.values()).filter(r => r.status === 'stable').map(r => ({ ...r })); }

    stabilizeRift(riftId, amount = 5) {
        const rift = this.rifts.get(riftId);
        if (!rift) return { success: false, error: 'RIFT_NOT_FOUND' };
        rift.stability += amount;
        this._triggerHook('riftStabilized', { riftId, newStability: rift.stability });
        return { success: true };
    }

    addCreature(riftId, creature) {
        const rift = this.rifts.get(riftId);
        if (!rift) return { success: false, error: 'RIFT_NOT_FOUND' };
        rift.creatures.push(creature);
        this._triggerHook('creatureAdded', { riftId, creature, total: rift.creatures.length });
        return { success: true };
    }

    sealRift(riftId) {
        const rift = this.rifts.get(riftId);
        if (!rift) return { success: false, error: 'RIFT_NOT_FOUND' };
        rift.status = 'sealed';
        this._triggerHook('riftSealed', { riftId });
        return { success: true };
    }

    calculateRiftPower(riftId) {
        const rift = this.rifts.get(riftId);
        if (!rift) return 0;
        return rift.stability * rift.creatures.length;
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
        this.config.maxRifts += 30;
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
