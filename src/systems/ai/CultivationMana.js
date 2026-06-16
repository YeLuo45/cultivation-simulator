/**
 * CultivationMana.js - 修真法力系统
 * V724 Iteration 17/30 Round 29
 */
export class CultivationMana {
    constructor(config = {}) {
        this.config = { maxManas: config.maxManas || 30, basePower: config.basePower || 20, ...config };
        this.manas = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalManas: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMana', (ctx) => this.getMana(ctx.manaId));
        this.registerTool('recruitMana', (ctx) => this.recruitMana(ctx));
    }

    recruitMana(data) {
        const id = data.manaId || `mana_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const mana = {
            manaId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Mana',
            type: data.type || 'divine',
            power: data.power || this.config.basePower,
            spells: data.spells || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.manas.set(id, mana);
        this.stats.totalManas++;
        this._triggerHook('manaRecruited', { manaId: id });
        return { success: true, mana };
    }

    getMana(id) { return this.manas.get(id) ? { ...this.manas.get(id) } : null; }
    listManas() { return Array.from(this.manas.values()).map(m => ({ ...m })); }
    listByMaster(masterId) { return Array.from(this.manas.values()).filter(m => m.masterId === masterId).map(m => ({ ...m })); }
    listLegendary() { return Array.from(this.manas.values()).filter(m => m.status === 'legendary').map(m => ({ ...m })); }

    addSpell(manaId, spell) {
        const mana = this.manas.get(manaId);
        if (!mana) return { success: false, error: 'MANA_NOT_FOUND' };
        mana.spells.push(spell);
        this._triggerHook('spellAdded', { manaId, spell });
        return { success: true };
    }

    raisePower(manaId, amount = 5) {
        const mana = this.manas.get(manaId);
        if (!mana) return { success: false, error: 'MANA_NOT_FOUND' };
        mana.power += amount;
        this._triggerHook('powerRaised', { manaId, newPower: mana.power });
        return { success: true };
    }

    levelUpMana(manaId) {
        const mana = this.manas.get(manaId);
        if (!mana) return { success: false, error: 'MANA_NOT_FOUND' };
        mana.level++;
        this._triggerHook('manaLeveledUp', { manaId, newLevel: mana.level });
        return { success: true };
    }

    legendMana(manaId) {
        const mana = this.manas.get(manaId);
        if (!mana) return { success: false, error: 'MANA_NOT_FOUND' };
        mana.status = 'legendary';
        this._triggerHook('manaLegendized', { manaId });
        return { success: true };
    }

    calculateManaValue(manaId) {
        const mana = this.manas.get(manaId);
        if (!mana) return 0;
        return mana.level * 100 + mana.power * 2 + mana.spells.length * 30;
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
        if (this.stats.totalManas < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxManas += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { manas: Array.from(this.manas.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.manas) this.manas = new Map(data.manas);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, manaCount: this.manas.size }; }
}
