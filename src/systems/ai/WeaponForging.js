/**
 * WeaponForging.js - 武器锻造系统
 * V500 Iteration 2/20 Round 20
 */
export class WeaponForging {
    constructor(config = {}) {
        this.config = { maxWeapons: config.maxWeapons || 200, baseSharpness: config.baseSharpness || 20, baseDurability: config.baseDurability || 100, ...config };
        this.weapons = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalWeapons: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getWeapon', (ctx) => this.getWeapon(ctx.weaponId));
        this.registerTool('forgeWeapon', (ctx) => this.forgeWeapon(ctx));
    }

    forgeWeapon(data) {
        const id = data.id || `wpn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const weapon = {
            weaponId: id,
            smithId: data.smithId || 'unknown_smith',
            name: data.name || 'unnamed_weapon',
            type: data.type || 'sword',
            sharpness: data.sharpness || this.config.baseSharpness,
            durability: data.durability || this.config.baseDurability,
            enchantments: data.enchantments || [],
            status: 'raw',
            forgedAt: Date.now()
        };
        this.weapons.set(id, weapon);
        this.stats.totalWeapons++;
        this._triggerHook('weaponForged', { weaponId: id });
        return { success: true, weapon };
    }

    getWeapon(id) { return this.weapons.get(id) ? { ...this.weapons.get(id) } : null; }
    listWeapons() { return Array.from(this.weapons.values()).map(w => ({ ...w })); }
    listBySmith(smithId) { return Array.from(this.weapons.values()).filter(w => w.smithId === smithId).map(w => ({ ...w })); }
    listMastered() { return Array.from(this.weapons.values()).filter(w => w.status === 'mastered').map(w => ({ ...w })); }

    sharpenWeapon(weaponId, amount = 5) {
        const weapon = this.weapons.get(weaponId);
        if (!weapon) return { success: false, error: 'WEAPON_NOT_FOUND' };
        weapon.sharpness += amount;
        this._triggerHook('weaponSharpened', { weaponId, newSharpness: weapon.sharpness });
        return { success: true };
    }

    addEnchantment(weaponId, enchant) {
        const weapon = this.weapons.get(weaponId);
        if (!weapon) return { success: false, error: 'WEAPON_NOT_FOUND' };
        weapon.enchantments.push(enchant);
        this._triggerHook('enchantmentAdded', { weaponId, enchant });
        return { success: true };
    }

    masterWeapon(weaponId) {
        const weapon = this.weapons.get(weaponId);
        if (!weapon) return { success: false, error: 'WEAPON_NOT_FOUND' };
        weapon.status = 'mastered';
        this._triggerHook('weaponMastered', { weaponId });
        return { success: true };
    }

    calculateWeaponPower(weaponId) {
        const weapon = this.weapons.get(weaponId);
        if (!weapon) return 0;
        return weapon.sharpness * 2 + weapon.durability + weapon.enchantments.length * 50;
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
        if (this.stats.totalWeapons < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxWeapons += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { weapons: Array.from(this.weapons.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.weapons) this.weapons = new Map(data.weapons);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, weaponCount: this.weapons.size }; }
}
