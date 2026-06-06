/**
 * ArmorSmithing.js - 护甲锻造系统
 * V501 Iteration 3/20 Round 20
 */
export class ArmorSmithing {
    constructor(config = {}) {
        this.config = { maxArmors: config.maxArmors || 200, baseDefense: config.baseDefense || 20, ...config };
        this.armors = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalArmors: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getArmor', (ctx) => this.getArmor(ctx.armorId));
        this.registerTool('forgeArmor', (ctx) => this.forgeArmor(ctx));
    }

    forgeArmor(data) {
        const id = data.id || `arm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const armor = {
            armorId: id,
            smithId: data.smithId,
            name: data.name || 'unnamed_armor',
            type: data.type || 'plate',
            defense: data.defense || this.config.baseDefense,
            durability: data.durability || 100,
            runes: data.runes || [],
            status: 'raw',
            forgedAt: Date.now()
        };
        this.armors.set(id, armor);
        this.stats.totalArmors++;
        this._triggerHook('armorForged', { armorId: id });
        return { success: true, armor };
    }

    getArmor(id) { return this.armors.get(id) ? { ...this.armors.get(id) } : null; }
    listArmors() { return Array.from(this.armors.values()).map(a => ({ ...a })); }
    listBySmith(smithId) { return Array.from(this.armors.values()).filter(a => a.smithId === smithId).map(a => ({ ...a })); }
    listMastered() { return Array.from(this.armors.values()).filter(a => a.status === 'mastered').map(a => ({ ...a })); }

    reinforceArmor(armorId, amount = 5) {
        const armor = this.armors.get(armorId);
        if (!armor) return { success: false, error: 'ARMOR_NOT_FOUND' };
        armor.defense += amount;
        this._triggerHook('armorReinforced', { armorId, newDefense: armor.defense });
        return { success: true };
    }

    addRune(armorId, rune) {
        const armor = this.armors.get(armorId);
        if (!armor) return { success: false, error: 'ARMOR_NOT_FOUND' };
        armor.runes.push(rune);
        this._triggerHook('runeAdded', { armorId, rune });
        return { success: true };
    }

    masterArmor(armorId) {
        const armor = this.armors.get(armorId);
        if (!armor) return { success: false, error: 'ARMOR_NOT_FOUND' };
        armor.status = 'mastered';
        this._triggerHook('armorMastered', { armorId });
        return { success: true };
    }

    calculateArmorValue(armorId) {
        const armor = this.armors.get(armorId);
        if (!armor) return 0;
        return armor.defense * 2 + armor.durability + armor.runes.length * 30;
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
        if (this.stats.totalArmors < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxArmors += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { armors: Array.from(this.armors.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.armors) this.armors = new Map(data.armors);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, armorCount: this.armors.size }; }
}
