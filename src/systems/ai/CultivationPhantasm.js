/**
 * CultivationPhantasm.js - 修真幻影系统
 * V771 Iteration 4/30 Round 31
 */
export class CultivationPhantasm {
    constructor(config = {}) {
        this.config = { maxPhantasms: config.maxPhantasms || 20, baseStrength: config.baseStrength || 20, ...config };
        this.phantasms = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalPhantasms: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getPhantasm', (ctx) => this.getPhantasm(ctx.phantasmId));
        this.registerTool('recruitPhantasm', (ctx) => this.recruitPhantasm(ctx));
    }

    recruitPhantasm(data) {
        const id = data.phantasmId || `pha_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const phantasm = {
            phantasmId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Phantasm',
            type: data.type || 'ghost',
            strength: data.strength || this.config.baseStrength,
            shapes: data.shapes || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.phantasms.set(id, phantasm);
        this.stats.totalPhantasms++;
        this._triggerHook('phantasmRecruited', { phantasmId: id });
        return { success: true, phantasm };
    }

    getPhantasm(id) { return this.phantasms.get(id) ? { ...this.phantasms.get(id) } : null; }
    listPhantasms() { return Array.from(this.phantasms.values()).map(p => ({ ...p })); }
    listByMaster(masterId) { return Array.from(this.phantasms.values()).filter(p => p.masterId === masterId).map(p => ({ ...p })); }
    listLegendary() { return Array.from(this.phantasms.values()).filter(p => p.status === 'legendary').map(p => ({ ...p })); }

    addShape(phantasmId, shape) {
        const phantasm = this.phantasms.get(phantasmId);
        if (!phantasm) return { success: false, error: 'PHANTASM_NOT_FOUND' };
        phantasm.shapes.push(shape);
        this._triggerHook('shapeAdded', { phantasmId, shape });
        return { success: true };
    }

    raiseStrength(phantasmId, amount = 5) {
        const phantasm = this.phantasms.get(phantasmId);
        if (!phantasm) return { success: false, error: 'PHANTASM_NOT_FOUND' };
        phantasm.strength += amount;
        this._triggerHook('strengthRaised', { phantasmId, newStrength: phantasm.strength });
        return { success: true };
    }

    levelUpPhantasm(phantasmId) {
        const phantasm = this.phantasms.get(phantasmId);
        if (!phantasm) return { success: false, error: 'PHANTASM_NOT_FOUND' };
        phantasm.level++;
        this._triggerHook('phantasmLeveledUp', { phantasmId, newLevel: phantasm.level });
        return { success: true };
    }

    legendPhantasm(phantasmId) {
        const phantasm = this.phantasms.get(phantasmId);
        if (!phantasm) return { success: false, error: 'PHANTASM_NOT_FOUND' };
        phantasm.status = 'legendary';
        this._triggerHook('phantasmLegendized', { phantasmId });
        return { success: true };
    }

    calculatePhantasmValue(phantasmId) {
        const phantasm = this.phantasms.get(phantasmId);
        if (!phantasm) return 0;
        return phantasm.level * 100 + phantasm.strength * 2 + phantasm.shapes.length * 30;
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
        if (this.stats.totalPhantasms < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxPhantasms += 15;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { phantasms: Array.from(this.phantasms.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.phantasms) this.phantasms = new Map(data.phantasms);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, phantasmCount: this.phantasms.size }; }
}
