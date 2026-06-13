/**
 * CultivationThunder.js - 修真雷系统
 * V810 Iteration 13/30 Round 32
 */
export class CultivationThunder {
    constructor(config = {}) {
        this.config = { maxThunders: config.maxThunders || 20, basePower: config.basePower || 20, ...config };
        this.thunders = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalThunders: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getThunder', (ctx) => this.getThunder(ctx.thunderId));
        this.registerTool('recruitThunder', (ctx) => this.recruitThunder(ctx));
    }

    recruitThunder(data) {
        const id = data.id || `thn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const thunder = { thunderId: id, masterId: data.masterId || null, name: data.name || 'Anonymous', type: data.type || 'rolling', power: data.power || this.config.basePower, booms: [], level: 1, status: 'novice', createdAt: Date.now() };
        this.thunders.set(id, thunder);
        this.stats.totalThunders++;
        this._triggerHook('thunderRecruited', { thunderId: id });
        return { success: true, thunder };
    }

    getThunder(id) { return this.thunders.get(id) ? { ...this.thunders.get(id) } : null; }
    listThunders() { return Array.from(this.thunders.values()).map(t => ({ ...t })); }
    listByMaster(masterId) { return Array.from(this.thunders.values()).filter(t => t.masterId === masterId).map(t => ({ ...t })); }
    listLegendary() { return Array.from(this.thunders.values()).filter(t => t.status === 'legendary').map(t => ({ ...t })); }

    addBoom(thunderId, boom) {
        const thunder = this.thunders.get(thunderId);
        if (!thunder) return { success: false, error: 'THUNDER_NOT_FOUND' };
        thunder.booms.push(boom);
        this._triggerHook('boomAdded', { thunderId, boom });
        return { success: true };
    }

    raisePower(thunderId, amount = 5) {
        const thunder = this.thunders.get(thunderId);
        if (!thunder) return { success: false, error: 'THUNDER_NOT_FOUND' };
        thunder.power += amount;
        this._triggerHook('powerRaised', { thunderId, newPower: thunder.power });
        return { success: true };
    }

    levelUpThunder(thunderId) {
        const thunder = this.thunders.get(thunderId);
        if (!thunder) return { success: false, error: 'THUNDER_NOT_FOUND' };
        thunder.level++;
        if (thunder.level >= 5 && thunder.status === 'novice') thunder.status = 'veteran';
        this._triggerHook('thunderLeveledUp', { thunderId, newLevel: thunder.level });
        return { success: true };
    }

    legendThunder(thunderId) {
        const thunder = this.thunders.get(thunderId);
        if (!thunder) return { success: false, error: 'THUNDER_NOT_FOUND' };
        thunder.status = 'legendary';
        this._triggerHook('thunderLegendized', { thunderId });
        return { success: true };
    }

    calculateThunderValue(thunderId) {
        const thunder = this.thunders.get(thunderId);
        if (!thunder) return 0;
        return thunder.level * 100 + thunder.power * 2 + thunder.booms.length * 30;
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
        if (this.stats.totalThunders < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxThunders += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { thunders: Array.from(this.thunders.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.thunders) this.thunders = new Map(data.thunders);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, thunderCount: this.thunders.size }; }
}
