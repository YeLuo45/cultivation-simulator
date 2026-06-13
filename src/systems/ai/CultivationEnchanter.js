/**
 * CultivationEnchanter.js - 修真附魔师系统
 * V605 Iteration 8/20 Round 25
 */
export class CultivationEnchanter {
    constructor(config = {}) {
        this.config = { maxEnchanters: config.maxEnchanters || 50, baseEnchantment: config.baseEnchantment || 20, ...config };
        this.enchanters = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalEnchanters: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getEnchanter', (ctx) => this.getEnchanter(ctx.enchanterId));
        this.registerTool('recruitEnchanter', (ctx) => this.recruitEnchanter(ctx));
    }

    recruitEnchanter(data) {
        const id = data.enchanterId || `ench_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const enchanter = {
            enchanterId: id,
            teacherId: data.teacherId,
            name: data.name || 'Unnamed Enchanter',
            type: data.type || 'rune',
            enchantment: data.enchantment || this.config.baseEnchantment,
            runes: data.runes || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.enchanters.set(id, enchanter);
        this.stats.totalEnchanters++;
        this._triggerHook('enchanterRecruited', { enchanterId: id });
        return { success: true, enchanter };
    }

    getEnchanter(id) { return this.enchanters.get(id) ? { ...this.enchanters.get(id) } : null; }
    listEnchanters() { return Array.from(this.enchanters.values()).map(e => ({ ...e })); }
    listByTeacher(teacherId) { return Array.from(this.enchanters.values()).filter(e => e.teacherId === teacherId).map(e => ({ ...e })); }
    listLegendary() { return Array.from(this.enchanters.values()).filter(e => e.status === 'legendary').map(e => ({ ...e })); }

    addRune(enchanterId, rune) {
        const enchanter = this.enchanters.get(enchanterId);
        if (!enchanter) return { success: false, error: 'ENCHANTER_NOT_FOUND' };
        enchanter.runes.push(rune);
        this._triggerHook('runeAdded', { enchanterId, rune });
        return { success: true };
    }

    improveEnchantment(enchanterId, amount = 5) {
        const enchanter = this.enchanters.get(enchanterId);
        if (!enchanter) return { success: false, error: 'ENCHANTER_NOT_FOUND' };
        enchanter.enchantment += amount;
        this._triggerHook('enchantmentImproved', { enchanterId, newEnchantment: enchanter.enchantment });
        return { success: true };
    }

    levelUpEnchanter(enchanterId) {
        const enchanter = this.enchanters.get(enchanterId);
        if (!enchanter) return { success: false, error: 'ENCHANTER_NOT_FOUND' };
        enchanter.level++;
        this._triggerHook('enchanterLeveledUp', { enchanterId, newLevel: enchanter.level });
        return { success: true };
    }

    legendEnchanter(enchanterId) {
        const enchanter = this.enchanters.get(enchanterId);
        if (!enchanter) return { success: false, error: 'ENCHANTER_NOT_FOUND' };
        enchanter.status = 'legendary';
        this._triggerHook('enchanterLegendized', { enchanterId });
        return { success: true };
    }

    calculateEnchanterValue(enchanterId) {
        const enchanter = this.enchanters.get(enchanterId);
        if (!enchanter) return 0;
        return enchanter.level * 100 + enchanter.enchantment * 2 + enchanter.runes.length * 30;
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
        if (this.stats.totalEnchanters < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxEnchanters += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { enchanters: Array.from(this.enchanters.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.enchanters) this.enchanters = new Map(data.enchanters);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, enchanterCount: this.enchanters.size }; }
}
