/**
 * CultivationWitch.js - 修真女巫系统
 * V627 Iteration 10/30 Round 26
 */
export class CultivationWitch {
    constructor(config = {}) {
        this.config = { maxWitches: config.maxWitches || 50, baseMagic: config.baseMagic || 20, ...config };
        this.witches = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalWitches: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getWitch', (ctx) => this.getWitch(ctx.witchId));
        this.registerTool('recruitWitch', (ctx) => this.recruitWitch(ctx));
    }

    recruitWitch(data) {
        const id = data.witchId || `witch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const witch = {
            witchId: id,
            covenId: data.covenId,
            name: data.name || 'Unnamed Witch',
            type: data.type || 'familiar',
            magic: data.magic || this.config.baseMagic,
            familiars: data.familiars || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.witches.set(id, witch);
        this.stats.totalWitches++;
        this._triggerHook('witchRecruited', { witchId: id });
        return { success: true, witch };
    }

    getWitch(id) { return this.witches.get(id) ? { ...this.witches.get(id) } : null; }
    listWitches() { return Array.from(this.witches.values()).map(w => ({ ...w })); }
    listByCoven(covenId) { return Array.from(this.witches.values()).filter(w => w.covenId === covenId).map(w => ({ ...w })); }
    listLegendary() { return Array.from(this.witches.values()).filter(w => w.status === 'legendary').map(w => ({ ...w })); }

    addFamiliar(witchId, familiar) {
        const witch = this.witches.get(witchId);
        if (!witch) return { success: false, error: 'WITCH_NOT_FOUND' };
        witch.familiars.push(familiar);
        this._triggerHook('familiarAdded', { witchId, familiar });
        return { success: true };
    }

    buildMagic(witchId, amount = 5) {
        const witch = this.witches.get(witchId);
        if (!witch) return { success: false, error: 'WITCH_NOT_FOUND' };
        witch.magic += amount;
        this._triggerHook('magicBuilt', { witchId, newMagic: witch.magic });
        return { success: true };
    }

    levelUpWitch(witchId) {
        const witch = this.witches.get(witchId);
        if (!witch) return { success: false, error: 'WITCH_NOT_FOUND' };
        witch.level++;
        this._triggerHook('witchLeveledUp', { witchId, newLevel: witch.level });
        return { success: true };
    }

    legendWitch(witchId) {
        const witch = this.witches.get(witchId);
        if (!witch) return { success: false, error: 'WITCH_NOT_FOUND' };
        witch.status = 'legendary';
        this._triggerHook('witchLegendized', { witchId });
        return { success: true };
    }

    calculateWitchValue(witchId) {
        const witch = this.witches.get(witchId);
        if (!witch) return 0;
        return witch.level * 100 + witch.magic * 2 + witch.familiars.length * 30;
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
        if (this.stats.totalWitches < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxWitches += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { witches: Array.from(this.witches.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.witches) this.witches = new Map(data.witches);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, witchCount: this.witches.size }; }
}
