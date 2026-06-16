/**
 * ElementalShield.js - 元素护盾
 * V364 Iteration 7/9 Round 9
 */
export class ElementalShield {
    constructor(config = {}) {
        this.config = { maxShields: config.maxShields || 100, baseStrength: config.baseStrength || 50, ...config };
        this.shields = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalShields: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getShield', (ctx) => this.getShield(ctx.shieldId));
        this.registerTool('createShield', (ctx) => this.createShield(ctx));
    }

    createShield(data) {
        const validElements = ['metal', 'wood', 'water', 'fire', 'earth'];
        if (!validElements.includes(data.elementId)) return { success: false, error: 'INVALID_ELEMENT' };
        const id = data.id || `shd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const shield = { shieldId: id, name: data.name || 'Shield', elementId: data.elementId, strength: data.strength !== undefined ? data.strength : this.config.baseStrength, currentStrength: data.strength !== undefined ? data.strength : this.config.baseStrength, createdAt: Date.now() };
        this.shields.set(id, shield);
        this.stats.totalShields++;
        this._triggerHook('shieldCreated', { shieldId: id });
        return { success: true, shield };
    }

    getShield(id) { return this.shields.get(id) ? { ...this.shields.get(id) } : null; }
    listShields() { return Array.from(this.shields.values()).map(s => ({ ...s })); }
    listByElement(elementId) { return Array.from(this.shields.values()).filter(s => s.elementId === elementId).map(s => ({ ...s })); }
    listActive() { return Array.from(this.shields.values()).filter(s => s.currentStrength > 0).map(s => ({ ...s })); }

    absorbDamage(shieldId, amount) {
        const shield = this.shields.get(shieldId);
        if (!shield) return { success: false, error: 'SHIELD_NOT_FOUND' };
        const absorbed = Math.min(amount, shield.currentStrength);
        shield.currentStrength = Math.max(0, shield.currentStrength - amount);
        this._triggerHook('damageAbsorbed', { shieldId, absorbed });
        if (shield.currentStrength === 0) this._triggerHook('shieldBroken', { shieldId });
        return { success: true, absorbed, remaining: shield.currentStrength };
    }

    repairShield(shieldId, amount) {
        const shield = this.shields.get(shieldId);
        if (!shield) return { success: false, error: 'SHIELD_NOT_FOUND' };
        shield.currentStrength = Math.min(shield.strength, shield.currentStrength + amount);
        this._triggerHook('shieldRepaired', { shieldId, amount });
        return { success: true, currentStrength: shield.currentStrength };
    }

    destroyShield(shieldId) {
        if (!this.shields.has(shieldId)) return { success: false, error: 'SHIELD_NOT_FOUND' };
        this.shields.delete(shieldId);
        this._triggerHook('shieldDestroyed', { shieldId });
        return { success: true };
    }

    calculateTotalDefense() { return Array.from(this.shields.values()).reduce((s, x) => s + x.currentStrength, 0); }

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
        if (this.stats.totalShields < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.baseStrength += 10;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { shields: Array.from(this.shields.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.shields) this.shields = new Map(data.shields);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, shieldCount: this.shields.size }; }
}