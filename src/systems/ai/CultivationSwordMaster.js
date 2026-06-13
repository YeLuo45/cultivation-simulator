/**
 * CultivationSwordMaster.js - 修真剑圣
 * V633 Iteration 16/30 Round 26 - Cultivation Sword Master
 */
export class CultivationSwordMaster {
    constructor(config = {}) {
        this.config = { maxSwordMasters: config.maxSwordMasters || 30, baseSwordAura: config.baseSwordAura || 20, ...config };
        this.swordmasters = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSwordMasters: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSwordMaster', (ctx) => this.getSwordMaster(ctx.masterId));
        this.registerTool('recruitSwordMaster', (ctx) => this.recruitSwordMaster(ctx));
    }

    recruitSwordMaster(data) {
        const id = data.id || `sm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const master = {
            masterId: id,
            mentorId: data.mentorId || null,
            name: data.name || `SwordMaster-${id.slice(-5)}`,
            type: data.type || 'dual',
            swordAura: data.swordAura || this.config.baseSwordAura,
            swords: data.swords || [],
            level: 1,
            status: 'novice',
            recruitedAt: Date.now()
        };
        this.swordmasters.set(id, master);
        this.stats.totalSwordMasters++;
        this._triggerHook('swordMasterRecruited', { masterId: id });
        return { success: true, master };
    }

    getSwordMaster(id) { return this.swordmasters.get(id) ? { ...this.swordmasters.get(id) } : null; }
    listSwordMasters() { return Array.from(this.swordmasters.values()).map(m => ({ ...m })); }
    listByMentor(mentorId) { return Array.from(this.swordmasters.values()).filter(m => m.mentorId === mentorId).map(m => ({ ...m })); }
    listLegendary() { return Array.from(this.swordmasters.values()).filter(m => m.status === 'legendary').map(m => ({ ...m })); }

    addSword(masterId, sword) {
        const master = this.swordmasters.get(masterId);
        if (!master) return { success: false, error: 'SWORDMASTER_NOT_FOUND' };
        master.swords.push(sword);
        this._triggerHook('swordAdded', { masterId, swordCount: master.swords.length });
        return { success: true };
    }

    intensifyAura(masterId, amount = 5) {
        const master = this.swordmasters.get(masterId);
        if (!master) return { success: false, error: 'SWORDMASTER_NOT_FOUND' };
        master.swordAura += amount;
        this._triggerHook('auraIntensified', { masterId, newSwordAura: master.swordAura });
        return { success: true };
    }

    levelUpSwordMaster(masterId) {
        const master = this.swordmasters.get(masterId);
        if (!master) return { success: false, error: 'SWORDMASTER_NOT_FOUND' };
        master.level++;
        this._triggerHook('swordMasterLeveledUp', { masterId, newLevel: master.level });
        return { success: true };
    }

    legendSwordMaster(masterId) {
        const master = this.swordmasters.get(masterId);
        if (!master) return { success: false, error: 'SWORDMASTER_NOT_FOUND' };
        master.status = 'legendary';
        this._triggerHook('swordMasterLegendized', { masterId });
        return { success: true };
    }

    calculateSwordMasterValue(masterId) {
        const master = this.swordmasters.get(masterId);
        if (!master) return 0;
        return master.level * 100 + master.swordAura * 2 + master.swords.length * 30;
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
        if (this.stats.totalSwordMasters < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSwordMasters += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { swordmasters: Array.from(this.swordmasters.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.swordmasters) this.swordmasters = new Map(data.swordmasters);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, swordMasterCount: this.swordmasters.size }; }
}
