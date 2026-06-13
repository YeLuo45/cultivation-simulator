/**
 * CultivationSmash.js - 修真重击
 * V733 Iteration 26/30 Round 29
 */
export class CultivationSmash {
    constructor(config = {}) {
        this.config = { maxSmashes: config.maxSmashes || 30, baseForce: config.baseForce || 20, ...config };
        this.smashes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSmashes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSmash', (ctx) => this.getSmash(ctx.smashId));
        this.registerTool('recruitSmash', (ctx) => this.recruitSmash(ctx));
    }

    recruitSmash(data) {
        const id = data.id || `sms_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const smash = {
            smashId: id,
            masterId: data.masterId || 'unknown',
            name: data.name || 'Unnamed Smash',
            type: data.type || 'ground',
            force: data.force || this.config.baseForce,
            impacts: data.impacts || [],
            level: data.level || 1,
            status: data.status || 'novice',
            recruitedAt: Date.now()
        };
        this.smashes.set(id, smash);
        this.stats.totalSmashes++;
        this._triggerHook('smashRecruited', { smashId: id });
        return { success: true, smash };
    }

    getSmash(id) { return this.smashes.get(id) ? { ...this.smashes.get(id) } : null; }
    listSmashes() { return Array.from(this.smashes.values()).map(s => ({ ...s })); }
    listByMaster(masterId) { return Array.from(this.smashes.values()).filter(s => s.masterId === masterId).map(s => ({ ...s })); }
    listLegendary() { return Array.from(this.smashes.values()).filter(s => s.status === 'legendary').map(s => ({ ...s })); }

    addImpact(smashId, impact) {
        const smash = this.smashes.get(smashId);
        if (!smash) return { success: false, error: 'SMASH_NOT_FOUND' };
        smash.impacts.push(impact);
        this._triggerHook('impactAdded', { smashId, impact });
        return { success: true };
    }

    raiseForce(smashId, amount = 5) {
        const smash = this.smashes.get(smashId);
        if (!smash) return { success: false, error: 'SMASH_NOT_FOUND' };
        smash.force += amount;
        this._triggerHook('forceRaised', { smashId, newForce: smash.force });
        return { success: true };
    }

    levelUpSmash(smashId) {
        const smash = this.smashes.get(smashId);
        if (!smash) return { success: false, error: 'SMASH_NOT_FOUND' };
        smash.level++;
        this._triggerHook('smashLeveledUp', { smashId, newLevel: smash.level });
        return { success: true };
    }

    legendSmash(smashId) {
        const smash = this.smashes.get(smashId);
        if (!smash) return { success: false, error: 'SMASH_NOT_FOUND' };
        smash.status = 'legendary';
        this._triggerHook('smashLegendized', { smashId });
        return { success: true };
    }

    calculateSmashValue(smashId) {
        const smash = this.smashes.get(smashId);
        if (!smash) return 0;
        return smash.level * 100 + smash.force * 2 + smash.impacts.length * 30;
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
        if (this.stats.totalSmashes < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSmashes += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { smashes: Array.from(this.smashes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.smashes) this.smashes = new Map(data.smashes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, smashCount: this.smashes.size }; }
}
