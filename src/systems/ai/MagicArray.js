/**
 * MagicArray.js - 法阵
 * V413 Iteration 5/15 Round 14
 */
export class MagicArray {
    constructor(config = {}) {
        this.config = { maxArrays: config.maxArrays || 100, basePower: config.basePower || 50, ...config };
        this.arrays = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalArrays: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getArray', (ctx) => this.getArray(ctx.arrayId));
        this.registerTool('drawArray', (ctx) => this.drawArray(ctx));
    }

    drawArray(data) {
        const id = data.id || `ar_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const arr = { arrayId: id, name: data.name || 'Magic Array', type: data.type || 'defense', power: data.power || this.config.basePower, range: data.range || 5, mana: data.mana || 100, status: 'drawn', drawnAt: Date.now() };
        this.arrays.set(id, arr);
        this.stats.totalArrays++;
        this._triggerHook('arrayDrawn', { arrayId: id });
        return { success: true, array: arr };
    }

    getArray(id) { return this.arrays.get(id) ? { ...this.arrays.get(id) } : null; }
    listArrays() { return Array.from(this.arrays.values()).map(a => ({ ...a })); }
    listByType(type) { return Array.from(this.arrays.values()).filter(a => a.type === type).map(a => ({ ...a })); }
    listActive() { return Array.from(this.arrays.values()).filter(a => a.status === 'active').map(a => ({ ...a })); }

    activate(arrayId) {
        const arr = this.arrays.get(arrayId);
        if (!arr) return { success: false, error: 'ARRAY_NOT_FOUND' };
        arr.status = 'active';
        this._triggerHook('arrayActivated', { arrayId });
        return { success: true };
    }

    deactivate(arrayId) {
        const arr = this.arrays.get(arrayId);
        if (!arr) return { success: false, error: 'ARRAY_NOT_FOUND' };
        arr.status = 'dormant';
        this._triggerHook('arrayDeactivated', { arrayId });
        return { success: true };
    }

    charge(arrayId, amount = 20) {
        const arr = this.arrays.get(arrayId);
        if (!arr) return { success: false, error: 'ARRAY_NOT_FOUND' };
        arr.mana = Math.min(100, arr.mana + amount);
        this._triggerHook('arrayCharged', { arrayId, mana: arr.mana });
        return { success: true };
    }

    consume(arrayId, amount) {
        const arr = this.arrays.get(arrayId);
        if (!arr) return { success: false, error: 'ARRAY_NOT_FOUND' };
        if (arr.mana < amount) return { success: false, error: 'INSUFFICIENT_MANA' };
        arr.mana -= amount;
        this._triggerHook('manaConsumed', { arrayId, amount });
        return { success: true };
    }

    calculatePower(arrayId) {
        const arr = this.arrays.get(arrayId);
        if (!arr) return 0;
        return arr.power * (arr.mana / 100) * arr.range;
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
        if (this.stats.totalArrays < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxArrays += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { arrays: Array.from(this.arrays.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.arrays) this.arrays = new Map(data.arrays);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, arrayCount: this.arrays.size }; }
}