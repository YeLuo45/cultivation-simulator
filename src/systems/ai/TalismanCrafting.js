/**
 * TalismanCrafting.js - 符箓制作
 * V440 Iteration 2/15 Round 16
 */
export class TalismanCrafting {
    constructor(config = {}) {
        this.config = { maxTalismans: config.maxTalismans || 300, basePower: config.basePower || 20, ...config };
        this.talismans = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTalismans: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTalisman', (ctx) => this.getTalisman(ctx.talismanId));
        this.registerTool('craftTalisman', (ctx) => this.craftTalisman(ctx));
    }

    craftTalisman(data) {
        const id = data.talismanId || `tlm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const talisman = { talismanId: id, crafterId: data.crafterId, name: data.name || 'Unnamed Talisman', type: data.type || 'attack', power: data.power || this.config.basePower, charges: data.charges || 1, target: data.target || null, status: 'draft', craftedAt: Date.now() };
        this.talismans.set(id, talisman);
        this.stats.totalTalismans++;
        this._triggerHook('talismanCrafted', { talismanId: id });
        return { success: true, talisman };
    }

    getTalisman(id) { return this.talismans.get(id) ? { ...this.talismans.get(id) } : null; }
    listTalismans() { return Array.from(this.talismans.values()).map(t => ({ ...t })); }
    listByType(type) { return Array.from(this.talismans.values()).filter(t => t.type === type).map(t => ({ ...t })); }
    listByCrafter(crafterId) { return Array.from(this.talismans.values()).filter(t => t.crafterId === crafterId).map(t => ({ ...t })); }

    empowerTalisman(talismanId, amount = 5) {
        const talisman = this.talismans.get(talismanId);
        if (!talisman) return { success: false, error: 'TALISMAN_NOT_FOUND' };
        talisman.power += amount;
        this._triggerHook('talismanEmpowered', { talismanId, newPower: talisman.power });
        return { success: true };
    }

    rechargeTalisman(talismanId, amount = 2) {
        const talisman = this.talismans.get(talismanId);
        if (!talisman) return { success: false, error: 'TALISMAN_NOT_FOUND' };
        talisman.charges += amount;
        this._triggerHook('talismanRecharged', { talismanId, newCharges: talisman.charges });
        return { success: true };
    }

    activateTalisman(talismanId) {
        const talisman = this.talismans.get(talismanId);
        if (!talisman) return { success: false, error: 'TALISMAN_NOT_FOUND' };
        talisman.status = 'active';
        this._triggerHook('talismanActivated', { talismanId });
        return { success: true };
    }

    calculateTalismanStrength(talismanId) {
        const talisman = this.talismans.get(talismanId);
        if (!talisman) return 0;
        return talisman.power * talisman.charges;
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
        if (this.stats.totalTalismans < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTalismans += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { talismans: Array.from(this.talismans.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.talismans) this.talismans = new Map(data.talismans);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, talismanCount: this.talismans.size }; }
}
