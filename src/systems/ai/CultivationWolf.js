/**
 * CultivationWolf.js - 修真狼系统
 * V718 Iteration 11/30 Round 29
 */
export class CultivationWolf {
    constructor(config = {}) {
        this.config = { maxWolves: config.maxWolves || 30, baseFerocity: config.baseFerocity || 20, ...config };
        this.wolves = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalWolves: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getWolf', (ctx) => this.getWolf(ctx.wolfId));
        this.registerTool('recruitWolf', (ctx) => this.recruitWolf(ctx));
    }

    recruitWolf(data) {
        const id = data.wolfId || `wlf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const wolf = {
            wolfId: id,
            masterId: data.masterId,
            name: data.name || 'Wild Wolf',
            type: data.type || 'gray',
            ferocity: data.ferocity || this.config.baseFerocity,
            pack: data.pack ? [...data.pack] : [],
            level: data.level || 1,
            status: data.status || 'novice',
            recruitedAt: Date.now()
        };
        this.wolves.set(id, wolf);
        this.stats.totalWolves++;
        this._triggerHook('wolfRecruited', { wolfId: id, masterId: data.masterId });
        return { success: true, wolf };
    }

    getWolf(id) { return this.wolves.get(id) ? { ...this.wolves.get(id) } : null; }
    listWolves() { return Array.from(this.wolves.values()).map(w => ({ ...w })); }
    listByMaster(masterId) { return Array.from(this.wolves.values()).filter(w => w.masterId === masterId).map(w => ({ ...w })); }
    listLegendary() { return Array.from(this.wolves.values()).filter(w => w.status === 'legendary').map(w => ({ ...w })); }

    addPackMember(wolfId, member) {
        const wolf = this.wolves.get(wolfId);
        if (!wolf) return { success: false, error: 'WOLF_NOT_FOUND' };
        wolf.pack.push(member);
        this._triggerHook('packAdded', { wolfId, member, packSize: wolf.pack.length });
        return { success: true };
    }

    raiseFerocity(wolfId, amount = 5) {
        const wolf = this.wolves.get(wolfId);
        if (!wolf) return { success: false, error: 'WOLF_NOT_FOUND' };
        wolf.ferocity += amount;
        this._triggerHook('ferocityRaised', { wolfId, newFerocity: wolf.ferocity });
        return { success: true };
    }

    levelUpWolf(wolfId) {
        const wolf = this.wolves.get(wolfId);
        if (!wolf) return { success: false, error: 'WOLF_NOT_FOUND' };
        wolf.level++;
        this._triggerHook('wolfLeveledUp', { wolfId, newLevel: wolf.level });
        return { success: true };
    }

    legendWolf(wolfId) {
        const wolf = this.wolves.get(wolfId);
        if (!wolf) return { success: false, error: 'WOLF_NOT_FOUND' };
        wolf.status = 'legendary';
        this._triggerHook('wolfLegendized', { wolfId });
        return { success: true };
    }

    calculateWolfValue(wolfId) {
        const wolf = this.wolves.get(wolfId);
        if (!wolf) return 0;
        return wolf.level * 100 + wolf.ferocity * 2 + wolf.pack.length * 30;
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
        if (this.stats.totalWolves < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxWolves += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { wolves: Array.from(this.wolves.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.wolves) this.wolves = new Map(data.wolves);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, wolfCount: this.wolves.size }; }
}
