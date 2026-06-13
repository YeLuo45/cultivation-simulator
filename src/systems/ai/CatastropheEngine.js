/**
 * CatastropheEngine.js - 灾难引擎
 * V386 Iteration 2/9 Round 12
 */
export class CatastropheEngine {
    constructor(config = {}) {
        this.config = { maxCatastrophes: config.maxCatastrophes || 50, baseDestructivePower: config.baseDestructivePower || 100, ...config };
        this.catastrophes = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCatastrophes: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCatastrophe', (ctx) => this.getCatastrophe(ctx.catastropheId));
        this.registerTool('triggerCatastrophe', (ctx) => this.triggerCatastrophe(ctx));
    }

    triggerCatastrophe(data) {
        const id = data.id || `cat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const catastrophe = { catastropheId: id, name: data.name || 'Catastrophe', kind: data.kind || 'flood', destructivePower: data.destructivePower || this.config.baseDestructivePower, casualties: 0, status: 'ongoing', triggeredAt: Date.now() };
        this.catastrophes.set(id, catastrophe);
        this.stats.totalCatastrophes++;
        this._triggerHook('catastropheTriggered', { catastropheId: id });
        return { success: true, catastrophe };
    }

    getCatastrophe(id) { return this.catastrophes.get(id) ? { ...this.catastrophes.get(id) } : null; }
    listCatastrophes() { return Array.from(this.catastrophes.values()).map(c => ({ ...c })); }
    listOngoing() { return Array.from(this.catastrophes.values()).filter(c => c.status === 'ongoing').map(c => ({ ...c })); }
    listByKind(kind) { return Array.from(this.catastrophes.values()).filter(c => c.kind === kind).map(c => ({ ...c })); }

    recordCasualties(catastropheId, count) {
        const catastrophe = this.catastrophes.get(catastropheId);
        if (!catastrophe) return { success: false, error: 'CATASTROPHE_NOT_FOUND' };
        catastrophe.casualties += count;
        this._triggerHook('casualtiesRecorded', { catastropheId, count });
        return { success: true };
    }

    mitigate(catastropheId, reduction) {
        const catastrophe = this.catastrophes.get(catastropheId);
        if (!catastrophe) return { success: false, error: 'CATASTROPHE_NOT_FOUND' };
        catastrophe.destructivePower = Math.max(0, catastrophe.destructivePower - reduction);
        this._triggerHook('catastropheMitigated', { catastropheId, reduction });
        return { success: true };
    }

    endCatastrophe(catastropheId) {
        const catastrophe = this.catastrophes.get(catastropheId);
        if (!catastrophe) return { success: false, error: 'CATASTROPHE_NOT_FOUND' };
        catastrophe.status = 'ended';
        catastrophe.endedAt = Date.now();
        this._triggerHook('catastropheEnded', { catastropheId });
        return { success: true };
    }

    calculateTotalDestructivePower() { return Array.from(this.catastrophes.values()).reduce((s, c) => s + c.destructivePower, 0); }
    calculateTotalCasualties() { return Array.from(this.catastrophes.values()).reduce((s, c) => s + c.casualties, 0); }

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
        if (this.stats.totalCatastrophes < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCatastrophes += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { catastrophes: Array.from(this.catastrophes.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.catastrophes) this.catastrophes = new Map(data.catastrophes);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, catastropheCount: this.catastrophes.size }; }
}