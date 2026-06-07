/**
 * CultivationFox.js - 修真狐
 * V721 Iteration 14/30 Round 29
 */
export class CultivationFox {
    constructor(config = {}) {
        this.config = { maxFoxes: config.maxFoxes || 20, baseCunning: config.baseCunning || 20, ...config };
        this.foxes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalFoxes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getFox', (ctx) => this.getFox(ctx.foxId));
        this.registerTool('recruitFox', (ctx) => this.recruitFox(ctx));
    }

    recruitFox(data) {
        const id = data.id || `fox_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const fox = {
            foxId: id,
            masterId: data.masterId || 'unknown',
            name: data.name || 'Unnamed Fox',
            type: data.type || 'white',
            cunning: data.cunning || this.config.baseCunning,
            tails: data.tails || [],
            level: data.level || 1,
            status: data.status || 'novice',
            recruitedAt: Date.now()
        };
        this.foxes.set(id, fox);
        this.stats.totalFoxes++;
        this._triggerHook('foxRecruited', { foxId: id });
        return { success: true, fox };
    }

    getFox(id) { return this.foxes.get(id) ? { ...this.foxes.get(id) } : null; }
    listFoxes() { return Array.from(this.foxes.values()).map(f => ({ ...f })); }
    listByMaster(masterId) { return Array.from(this.foxes.values()).filter(f => f.masterId === masterId).map(f => ({ ...f })); }
    listByType(type) { return Array.from(this.foxes.values()).filter(f => f.type === type).map(f => ({ ...f })); }
    listLegendary() { return Array.from(this.foxes.values()).filter(f => f.status === 'legendary').map(f => ({ ...f })); }

    addTail(foxId, tail) {
        const fox = this.foxes.get(foxId);
        if (!fox) return { success: false, error: 'FOX_NOT_FOUND' };
        fox.tails.push(tail);
        this._triggerHook('tailAdded', { foxId, tail });
        return { success: true };
    }

    raiseCunning(foxId, amount = 5) {
        const fox = this.foxes.get(foxId);
        if (!fox) return { success: false, error: 'FOX_NOT_FOUND' };
        fox.cunning += amount;
        this._triggerHook('cunningRaised', { foxId, newCunning: fox.cunning });
        return { success: true };
    }

    levelUpFox(foxId) {
        const fox = this.foxes.get(foxId);
        if (!fox) return { success: false, error: 'FOX_NOT_FOUND' };
        fox.level++;
        this._triggerHook('foxLeveledUp', { foxId, newLevel: fox.level });
        return { success: true };
    }

    legendFox(foxId) {
        const fox = this.foxes.get(foxId);
        if (!fox) return { success: false, error: 'FOX_NOT_FOUND' };
        fox.status = 'legendary';
        this._triggerHook('foxLegendized', { foxId });
        return { success: true };
    }

    trainFox(foxId) {
        const fox = this.foxes.get(foxId);
        if (!fox) return { success: false, error: 'FOX_NOT_FOUND' };
        fox.status = 'veteran';
        this._triggerHook('foxTrained', { foxId });
        return { success: true };
    }

    calculateFoxValue(foxId) {
        const fox = this.foxes.get(foxId);
        if (!fox) return 0;
        return fox.level * 100 + fox.cunning * 2 + fox.tails.length * 30;
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
        if (this.stats.totalFoxes < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxFoxes += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { foxes: Array.from(this.foxes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.foxes) this.foxes = new Map(data.foxes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, foxCount: this.foxes.size }; }
}
