/**
 * SwordSharpening.js - 剑磨系统
 * V512 Iteration 14/20 Round 20
 */
export class SwordSharpening {
    constructor(config = {}) {
        this.config = { maxSharpenings: config.maxSharpenings || 200, baseSharpness: config.baseSharpness || 30, ...config };
        this.sharpenings = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalSharpenings: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getSharpening', (ctx) => this.getSharpening(ctx.sharpeningId));
        this.registerTool('startSharpening', (ctx) => this.startSharpening(ctx));
    }

    startSharpening(data) {
        const id = data.id || `shp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const sharpening = {
            sharpeningId: id,
            sharpenerId: data.sharpenerId || 'unknown_sharpener',
            swordName: data.swordName || 'unnamed_sword',
            sharpness: data.sharpness || this.config.baseSharpness,
            stones: data.stones || [],
            polishing: data.polishing || 0,
            status: data.status || 'initial',
            startedAt: Date.now()
        };
        this.sharpenings.set(id, sharpening);
        this.stats.totalSharpenings++;
        this._triggerHook('sharpeningStarted', { sharpeningId: id });
        return { success: true, sharpening };
    }

    getSharpening(id) { return this.sharpenings.get(id) ? { ...this.sharpenings.get(id) } : null; }
    listSharpenings() { return Array.from(this.sharpenings.values()).map(s => ({ ...s })); }
    listBySharpener(sharpenerId) { return Array.from(this.sharpenings.values()).filter(s => s.sharpenerId === sharpenerId).map(s => ({ ...s })); }
    listReady() { return Array.from(this.sharpenings.values()).filter(s => s.status === 'ready').map(s => ({ ...s })); }

    addStone(sharpeningId, stone) {
        const sharpening = this.sharpenings.get(sharpeningId);
        if (!sharpening) return { success: false, error: 'SHARPENING_NOT_FOUND' };
        sharpening.stones.push(stone);
        if (sharpening.stones.length >= 3) sharpening.status = 'rough';
        this._triggerHook('stoneAdded', { sharpeningId, stone });
        return { success: true };
    }

    refineSharpness(sharpeningId, amount = 5) {
        const sharpening = this.sharpenings.get(sharpeningId);
        if (!sharpening) return { success: false, error: 'SHARPENING_NOT_FOUND' };
        sharpening.sharpness += amount;
        this._triggerHook('sharpnessRefined', { sharpeningId, newSharpness: sharpening.sharpness });
        return { success: true };
    }

    polishBlade(sharpeningId, amount = 5) {
        const sharpening = this.sharpenings.get(sharpeningId);
        if (!sharpening) return { success: false, error: 'SHARPENING_NOT_FOUND' };
        sharpening.polishing += amount;
        this._triggerHook('bladePolished', { sharpeningId, newPolishing: sharpening.polishing });
        return { success: true };
    }

    markReady(sharpeningId) {
        const sharpening = this.sharpenings.get(sharpeningId);
        if (!sharpening) return { success: false, error: 'SHARPENING_NOT_FOUND' };
        sharpening.status = 'ready';
        this._triggerHook('sharpeningReady', { sharpeningId });
        return { success: true };
    }

    calculateBladeQuality(sharpeningId) {
        const sharpening = this.sharpenings.get(sharpeningId);
        if (!sharpening) return 0;
        return sharpening.sharpness * 2 + sharpening.polishing + sharpening.stones.length * 5;
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
        if (this.stats.totalSharpenings < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxSharpenings += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { sharpenings: Array.from(this.sharpenings.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.sharpenings) this.sharpenings = new Map(data.sharpenings);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, sharpeningCount: this.sharpenings.size }; }
}
