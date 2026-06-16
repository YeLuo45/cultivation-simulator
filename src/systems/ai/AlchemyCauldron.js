/**
 * AlchemyCauldron.js - 炼丹炉
 * V412 Iteration 4/15 Round 14
 */
export class AlchemyCauldron {
    constructor(config = {}) {
        this.config = { maxCauldrons: config.maxCauldrons || 50, baseCapacity: config.baseCapacity || 10, ...config };
        this.cauldrons = new Map();
        this.pills = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCauldrons: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCauldron', (ctx) => this.getCauldron(ctx.cauldronId));
        this.registerTool('forgeCauldron', (ctx) => this.forgeCauldron(ctx));
    }

    forgeCauldron(data) {
        const id = data.id || `cl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cauldron = { cauldronId: id, grade: data.grade || 'common', capacity: data.capacity || this.config.baseCapacity, durability: 100, temperature: 0, status: 'idle', forgedAt: Date.now() };
        this.cauldrons.set(id, cauldron);
        this.stats.totalCauldrons++;
        this._triggerHook('cauldronForged', { cauldronId: id });
        return { success: true, cauldron };
    }

    getCauldron(id) { return this.cauldrons.get(id) ? { ...this.cauldrons.get(id) } : null; }
    listCauldrons() { return Array.from(this.cauldrons.values()).map(c => ({ ...c })); }
    listByGrade(grade) { return Array.from(this.cauldrons.values()).filter(c => c.grade === grade).map(c => ({ ...c })); }

    heat(cauldronId, temp = 100) {
        const cauldron = this.cauldrons.get(cauldronId);
        if (!cauldron) return { success: false, error: 'CAULDRON_NOT_FOUND' };
        cauldron.temperature = temp;
        cauldron.status = 'heating';
        this._triggerHook('cauldronHeated', { cauldronId, temp });
        return { success: true };
    }

    refine(cauldronId, recipeName, quality) {
        const cauldron = this.cauldrons.get(cauldronId);
        if (!cauldron) return { success: false, error: 'CAULDRON_NOT_FOUND' };
        cauldron.durability = Math.max(0, cauldron.durability - 5);
        const id = `pl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const pill = { pillId: id, cauldronId, recipeName, quality: quality || 'normal', refinedAt: Date.now() };
        this.pills.set(id, pill);
        cauldron.status = 'idle';
        this._triggerHook('pillRefined', { cauldronId, pillId: id });
        return { success: true, pill };
    }

    repair(cauldronId, amount = 20) {
        const cauldron = this.cauldrons.get(cauldronId);
        if (!cauldron) return { success: false, error: 'CAULDRON_NOT_FOUND' };
        cauldron.durability = Math.min(100, cauldron.durability + amount);
        this._triggerHook('cauldronRepaired', { cauldronId });
        return { success: true };
    }

    getPill(id) { return this.pills.get(id) ? { ...this.pills.get(id) } : null; }
    listPills() { return Array.from(this.pills.values()).map(p => ({ ...p })); }
    listPillsByCauldron(cauldronId) { return Array.from(this.pills.values()).filter(p => p.cauldronId === cauldronId).map(p => ({ ...p })); }
    listPillsByQuality(quality) { return Array.from(this.pills.values()).filter(p => p.quality === quality).map(p => ({ ...p })); }

    listDamaged(threshold = 30) { return Array.from(this.cauldrons.values()).filter(c => c.durability <= threshold).map(c => ({ ...c })); }

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
        if (this.stats.totalCauldrons < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCauldrons += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { cauldrons: Array.from(this.cauldrons.entries()), pills: Array.from(this.pills.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.cauldrons) this.cauldrons = new Map(data.cauldrons);
        if (data.pills) this.pills = new Map(data.pills);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, cauldronCount: this.cauldrons.size }; }
}