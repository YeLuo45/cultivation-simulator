/**
 * CultivationMurmur.js - 修真呢喃系统
 * V774 Iteration 7/30 Round 31
 */
export class CultivationMurmur {
    constructor(config = {}) {
        this.config = { maxMurmurs: config.maxMurmurs || 20, baseQuietness: config.baseQuietness || 20, ...config };
        this.murmurs = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMurmurs: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMurmur', (ctx) => this.getMurmur(ctx.murmurId));
        this.registerTool('recruitMurmur', (ctx) => this.recruitMurmur(ctx));
    }

    recruitMurmur(data) {
        const id = data.murmurId || `mur_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const murmur = {
            murmurId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Murmur',
            type: data.type || 'gentle',
            quietness: data.quietness || this.config.baseQuietness,
            echoes: data.echoes || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.murmurs.set(id, murmur);
        this.stats.totalMurmurs++;
        this._triggerHook('murmurRecruited', { murmurId: id });
        return { success: true, murmur };
    }

    getMurmur(id) { return this.murmurs.get(id) ? { ...this.murmurs.get(id) } : null; }
    listMurmurs() { return Array.from(this.murmurs.values()).map(m => ({ ...m })); }
    listByMaster(masterId) { return Array.from(this.murmurs.values()).filter(m => m.masterId === masterId).map(m => ({ ...m })); }
    listLegendary() { return Array.from(this.murmurs.values()).filter(m => m.status === 'legendary').map(m => ({ ...m })); }

    addEcho(murmurId, echo) {
        const murmur = this.murmurs.get(murmurId);
        if (!murmur) return { success: false, error: 'MURMUR_NOT_FOUND' };
        murmur.echoes.push(echo);
        this._triggerHook('echoAdded', { murmurId, echo });
        return { success: true };
    }

    raiseQuietness(murmurId, amount = 5) {
        const murmur = this.murmurs.get(murmurId);
        if (!murmur) return { success: false, error: 'MURMUR_NOT_FOUND' };
        murmur.quietness += amount;
        this._triggerHook('quietnessRaised', { murmurId, newQuietness: murmur.quietness });
        return { success: true };
    }

    levelUpMurmur(murmurId) {
        const murmur = this.murmurs.get(murmurId);
        if (!murmur) return { success: false, error: 'MURMUR_NOT_FOUND' };
        murmur.level++;
        this._triggerHook('murmurLeveledUp', { murmurId, newLevel: murmur.level });
        return { success: true };
    }

    legendMurmur(murmurId) {
        const murmur = this.murmurs.get(murmurId);
        if (!murmur) return { success: false, error: 'MURMUR_NOT_FOUND' };
        murmur.status = 'legendary';
        this._triggerHook('murmurLegendized', { murmurId });
        return { success: true };
    }

    calculateMurmurValue(murmurId) {
        const murmur = this.murmurs.get(murmurId);
        if (!murmur) return 0;
        return murmur.level * 100 + murmur.quietness * 2 + murmur.echoes.length * 30;
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
        if (this.stats.totalMurmurs < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMurmurs += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { murmurs: Array.from(this.murmurs.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.murmurs) this.murmurs = new Map(data.murmurs);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, murmurCount: this.murmurs.size }; }
}
