/**
 * CultivationHex.js - 修真邪术系统
 * V705 Iteration 10/30 Round 28
 */
export class CultivationHex {
    constructor(config = {}) {
        this.config = { maxHexes: config.maxHexes || 20, baseCorruption: config.baseCorruption || 20, ...config };
        this.hexes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalHexes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getHex', (ctx) => this.getHex(ctx.hexId));
        this.registerTool('recruitHex', (ctx) => this.recruitHex(ctx));
    }

    recruitHex(data) {
        if (this.hexes.size >= this.config.maxHexes) return { success: false, error: 'MAX_HEXES_REACHED' };
        const id = data.hexId || `hex_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const hex = {
            hexId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Hex',
            type: data.type || 'blood',
            corruption: data.corruption != null ? data.corruption : this.config.baseCorruption,
            victims: data.victims || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.hexes.set(id, hex);
        this.stats.totalHexes++;
        this._triggerHook('hexRecruited', { hexId: id, masterId: hex.masterId });
        return { success: true, hex };
    }

    getHex(id) { return this.hexes.get(id) ? { ...this.hexes.get(id) } : null; }
    listHexes() { return Array.from(this.hexes.values()).map(h => ({ ...h })); }
    listByMaster(masterId) { return Array.from(this.hexes.values()).filter(h => h.masterId === masterId).map(h => ({ ...h })); }
    listLegendary() { return Array.from(this.hexes.values()).filter(h => h.status === 'legendary').map(h => ({ ...h })); }

    addVictim(hexId, victim) {
        const hex = this.hexes.get(hexId);
        if (!hex) return { success: false, error: 'HEX_NOT_FOUND' };
        hex.victims.push(victim);
        this._triggerHook('victimAdded', { hexId, victim });
        return { success: true };
    }

    raiseCorruption(hexId, amount = 5) {
        const hex = this.hexes.get(hexId);
        if (!hex) return { success: false, error: 'HEX_NOT_FOUND' };
        hex.corruption += amount;
        this._triggerHook('corruptionRaised', { hexId, newCorruption: hex.corruption });
        return { success: true };
    }

    levelUpHex(hexId) {
        const hex = this.hexes.get(hexId);
        if (!hex) return { success: false, error: 'HEX_NOT_FOUND' };
        hex.level++;
        this._triggerHook('hexLeveledUp', { hexId, newLevel: hex.level });
        return { success: true };
    }

    legendHex(hexId) {
        const hex = this.hexes.get(hexId);
        if (!hex) return { success: false, error: 'HEX_NOT_FOUND' };
        hex.status = 'legendary';
        this._triggerHook('hexLegendized', { hexId });
        return { success: true };
    }

    calculateHexValue(hexId) {
        const hex = this.hexes.get(hexId);
        if (!hex) return 0;
        return hex.level * 100 + hex.corruption * 2 + hex.victims.length * 30;
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
        if (this.stats.totalHexes < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxHexes += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { hexes: Array.from(this.hexes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.hexes) this.hexes = new Map(data.hexes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, hexCount: this.hexes.size }; }
}
