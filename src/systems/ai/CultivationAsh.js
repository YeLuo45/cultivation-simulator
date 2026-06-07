/**
 * CultivationAsh.js - 修真灰系统
 * V848 Iteration 21/30 Round 33
 */
export class CultivationAsh {
    constructor(config = {}) {
        this.config = { maxAshes: config.maxAshes || 20, baseWarmth: config.baseWarmth || 20, ...config };
        this.ashes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalAshes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getAsh', (ctx) => this.getAsh(ctx.ashId));
        this.registerTool('recruitAsh', (ctx) => this.recruitAsh(ctx));
    }

    recruitAsh(data) {
        const id = data.id || `ash_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const ash = {
            ashId: id,
            masterId: data.masterId || 'unknown_master',
            name: data.name || 'unnamed_ash',
            type: data.type || 'volcanic',
            warmth: data.warmth || this.config.baseWarmth,
            embers: data.embers || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.ashes.set(id, ash);
        this.stats.totalAshes++;
        this._triggerHook('ashRecruited', { ashId: id });
        return { success: true, ash };
    }

    getAsh(id) { return this.ashes.get(id) ? { ...this.ashes.get(id) } : null; }
    listAshes() { return Array.from(this.ashes.values()).map(a => ({ ...a })); }
    listByMaster(masterId) { return Array.from(this.ashes.values()).filter(a => a.masterId === masterId).map(a => ({ ...a })); }
    listLegendary() { return Array.from(this.ashes.values()).filter(a => a.status === 'legendary').map(a => ({ ...a })); }

    addEmber(ashId, ember) {
        const ash = this.ashes.get(ashId);
        if (!ash) return { success: false, error: 'ASH_NOT_FOUND' };
        ash.embers.push(ember);
        if (ash.embers.length >= 5) ash.status = 'veteran';
        this._triggerHook('emberAdded', { ashId, ember });
        return { success: true };
    }

    raiseWarmth(ashId, amount = 5) {
        const ash = this.ashes.get(ashId);
        if (!ash) return { success: false, error: 'ASH_NOT_FOUND' };
        ash.warmth += amount;
        this._triggerHook('warmthRaised', { ashId, newWarmth: ash.warmth });
        return { success: true };
    }

    levelUpAsh(ashId) {
        const ash = this.ashes.get(ashId);
        if (!ash) return { success: false, error: 'ASH_NOT_FOUND' };
        ash.level++;
        this._triggerHook('ashLeveledUp', { ashId, newLevel: ash.level });
        return { success: true };
    }

    legendAsh(ashId) {
        const ash = this.ashes.get(ashId);
        if (!ash) return { success: false, error: 'ASH_NOT_FOUND' };
        ash.status = 'legendary';
        this._triggerHook('ashLegendized', { ashId });
        return { success: true };
    }

    calculateAshValue(ashId) {
        const ash = this.ashes.get(ashId);
        if (!ash) return 0;
        return ash.level * 100 + ash.warmth * 2 + ash.embers.length * 30;
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
        if (this.stats.totalAshes < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxAshes += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { ashes: Array.from(this.ashes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.ashes) this.ashes = new Map(data.ashes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, ashCount: this.ashes.size }; }
}
