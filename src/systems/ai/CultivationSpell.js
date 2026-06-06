/**
 * CultivationSpell.js - 道咒系统
 * V532 Iteration 14/20 Round 21 - Cultivation Spell
 */

export class CultivationSpell {
    constructor(config = {}) {
        this.config = { maxSpells: config.maxSpells || 100, basePotency: config.basePotency || 20, ...config };
        this.spells = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSpells: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSpell', (ctx) => this.getSpell(ctx.spellId));
        this.registerTool('chantSpell', (ctx) => this.chantSpell(ctx));
    }

    chantSpell(data) {
        const id = data.spellId || `spl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const spell = {
            spellId: id,
            cultivatorId: data.cultivatorId,
            name: data.name || 'Unnamed Spell',
            type: data.type || 'fire',
            potency: data.potency || this.config.basePotency,
            words: data.words || [],
            level: 1,
            status: 'memorized',
            createdAt: Date.now()
        };
        this.spells.set(id, spell);
        this.stats.totalSpells++;
        this._triggerHook('spellChanted', { spellId: id });
        return { success: true, spell };
    }

    getSpell(id) { return this.spells.get(id) ? { ...this.spells.get(id) } : null; }
    listSpells() { return Array.from(this.spells.values()).map(s => ({ ...s })); }
    listByCultivator(cultivatorId) { return Array.from(this.spells.values()).filter(s => s.cultivatorId === cultivatorId).map(s => ({ ...s })); }
    listManifested() { return Array.from(this.spells.values()).filter(s => s.status === 'manifested').map(s => ({ ...s })); }

    addWord(spellId, word) {
        const spell = this.spells.get(spellId);
        if (!spell) return { success: false, error: 'SPELL_NOT_FOUND' };
        spell.words.push(word);
        this._triggerHook('wordAdded', { spellId, word });
        return { success: true, spell: { ...spell } };
    }

    increasePotency(spellId, amount = 5) {
        const spell = this.spells.get(spellId);
        if (!spell) return { success: false, error: 'SPELL_NOT_FOUND' };
        spell.potency += amount;
        this._triggerHook('potencyIncreased', { spellId, newPotency: spell.potency });
        return { success: true };
    }

    levelUpSpell(spellId) {
        const spell = this.spells.get(spellId);
        if (!spell) return { success: false, error: 'SPELL_NOT_FOUND' };
        spell.level++;
        this._triggerHook('spellLeveledUp', { spellId, newLevel: spell.level });
        return { success: true };
    }

    manifestSpell(spellId) {
        const spell = this.spells.get(spellId);
        if (!spell) return { success: false, error: 'SPELL_NOT_FOUND' };
        spell.status = 'manifested';
        this._triggerHook('spellManifested', { spellId });
        return { success: true };
    }

    calculateSpellPower(spellId) {
        const spell = this.spells.get(spellId);
        if (!spell) return 0;
        return spell.level * 100 + spell.potency * 2 + spell.words.length * 30;
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
        if (this.stats.totalSpells < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSpells += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { spells: Array.from(this.spells.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.spells) this.spells = new Map(data.spells);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, spellCount: this.spells.size }; }
}
