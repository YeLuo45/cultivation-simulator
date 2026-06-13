/**
 * CultivationDestiny.js - 修真天意
 * V742 Iteration 5/30 Round 30
 */
export class CultivationDestiny {
    constructor(config = {}) {
        this.config = { maxDestinies: config.maxDestinies || 20, baseFate: config.baseFate || 20, ...config };
        this.destinies = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalDestinies: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getDestiny', (ctx) => this.getDestiny(ctx.destinyId));
        this.registerTool('recruitDestiny', (ctx) => this.recruitDestiny(ctx));
    }

    recruitDestiny(data) {
        const id = data.id || `dst_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const destiny = {
            destinyId: id,
            masterId: data.masterId,
            name: data.name || 'unnamed',
            type: data.type || 'chosen',
            fate: data.fate || this.config.baseFate,
            omens: data.omens || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.destinies.set(id, destiny);
        this.stats.totalDestinies++;
        this._triggerHook('destinyRecruited', { destinyId: id });
        return { success: true, destiny };
    }

    getDestiny(id) { return this.destinies.get(id) ? { ...this.destinies.get(id) } : null; }
    listDestinies() { return Array.from(this.destinies.values()).map(d => ({ ...d })); }
    listByMaster(masterId) { return Array.from(this.destinies.values()).filter(d => d.masterId === masterId).map(d => ({ ...d })); }
    listLegendary() { return Array.from(this.destinies.values()).filter(d => d.status === 'legendary').map(d => ({ ...d })); }

    addOmen(destinyId, omen) {
        const destiny = this.destinies.get(destinyId);
        if (!destiny) return { success: false, error: 'DESTINY_NOT_FOUND' };
        destiny.omens.push(omen);
        if (destiny.omens.length >= 3 && destiny.status === 'novice') destiny.status = 'veteran';
        this._triggerHook('omenAdded', { destinyId, omen });
        return { success: true };
    }

    raiseFate(destinyId, amount = 5) {
        const destiny = this.destinies.get(destinyId);
        if (!destiny) return { success: false, error: 'DESTINY_NOT_FOUND' };
        destiny.fate += amount;
        this._triggerHook('fateRaised', { destinyId, newFate: destiny.fate });
        return { success: true };
    }

    levelUpDestiny(destinyId) {
        const destiny = this.destinies.get(destinyId);
        if (!destiny) return { success: false, error: 'DESTINY_NOT_FOUND' };
        destiny.level++;
        this._triggerHook('destinyLeveledUp', { destinyId, newLevel: destiny.level });
        return { success: true };
    }

    legendDestiny(destinyId) {
        const destiny = this.destinies.get(destinyId);
        if (!destiny) return { success: false, error: 'DESTINY_NOT_FOUND' };
        destiny.status = 'legendary';
        this._triggerHook('destinyLegendized', { destinyId });
        return { success: true };
    }

    calculateDestinyValue(destinyId) {
        const destiny = this.destinies.get(destinyId);
        if (!destiny) return 0;
        return destiny.level * 100 + destiny.fate * 2 + destiny.omens.length * 30;
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
        if (this.stats.totalDestinies < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxDestinies += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { destinies: Array.from(this.destinies.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.destinies) this.destinies = new Map(data.destinies);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, destinyCount: this.destinies.size }; }
}
