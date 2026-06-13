/**
 * CultivationMage.js - 修真法师系统
 * V599 Iteration 2/20 Round 25
 */
export class CultivationMage {
    constructor(config = {}) {
        this.config = { maxMages: config.maxMages || 50, baseMana: config.baseMana || 50, ...config };
        this.mages = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMages: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMage', (ctx) => this.getMage(ctx.mageId));
        this.registerTool('recruitMage', (ctx) => this.recruitMage(ctx));
    }

    recruitMage(data) {
        const id = data.mageId || `mage_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const mage = {
            mageId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Mage',
            type: data.type || 'fire',
            mana: data.mana || this.config.baseMana,
            spells: data.spells || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.mages.set(id, mage);
        this.stats.totalMages++;
        this._triggerHook('mageRecruited', { mageId: id });
        return { success: true, mage };
    }

    getMage(id) { return this.mages.get(id) ? { ...this.mages.get(id) } : null; }
    listMages() { return Array.from(this.mages.values()).map(m => ({ ...m })); }
    listByMaster(masterId) { return Array.from(this.mages.values()).filter(m => m.masterId === masterId).map(m => ({ ...m })); }
    listLegendary() { return Array.from(this.mages.values()).filter(m => m.status === 'legendary').map(m => ({ ...m })); }

    addSpell(mageId, spell) {
        const mage = this.mages.get(mageId);
        if (!mage) return { success: false, error: 'MAGE_NOT_FOUND' };
        mage.spells.push(spell);
        this._triggerHook('spellAdded', { mageId, spell });
        return { success: true };
    }

    recoverMana(mageId, amount = 5) {
        const mage = this.mages.get(mageId);
        if (!mage) return { success: false, error: 'MAGE_NOT_FOUND' };
        mage.mana += amount;
        this._triggerHook('manaRecovered', { mageId, newMana: mage.mana });
        return { success: true };
    }

    levelUpMage(mageId) {
        const mage = this.mages.get(mageId);
        if (!mage) return { success: false, error: 'MAGE_NOT_FOUND' };
        mage.level++;
        this._triggerHook('mageLeveledUp', { mageId, newLevel: mage.level });
        return { success: true };
    }

    legendMage(mageId) {
        const mage = this.mages.get(mageId);
        if (!mage) return { success: false, error: 'MAGE_NOT_FOUND' };
        mage.status = 'legendary';
        this._triggerHook('mageLegendized', { mageId });
        return { success: true };
    }

    calculateMageValue(mageId) {
        const mage = this.mages.get(mageId);
        if (!mage) return 0;
        return mage.level * 100 + mage.mana * 2 + mage.spells.length * 30;
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
        if (this.stats.totalMages < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMages += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { mages: Array.from(this.mages.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.mages) this.mages = new Map(data.mages);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, mageCount: this.mages.size }; }
}
