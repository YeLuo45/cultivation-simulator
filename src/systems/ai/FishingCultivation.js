/**
 * FishingCultivation.js - 钓鱼修真
 * V446 Iteration 8/15 Round 16 - Fishing Cultivation
 *
 * 融合6大设计系统:
 * - generic-agent: 钓鱼自循环
 * - chatdev: 钓鱼角色协调
 * - nanobot: 钓鱼mesh
 * - claude-code: 钓鱼分析工具
 * - thunderbolt: 钓鱼持久化
 * - ruflo: 钓鱼Hook
 */

export class FishingCultivation {
    constructor(config = {}) {
        this.config = { maxCatches: config.maxCatches || 200, baseWeight: config.baseWeight || 5, ...config };
        this.catches = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCatches: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCatch', (ctx) => this.getCatch(ctx.catchId));
        this.registerTool('castRod', (ctx) => this.castRod(ctx));
    }

    castRod(data) {
        const id = data.id || `cat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const theCatch = { catchId: id, fisherId: data.fisherId, name: data.name || 'unnamed', fishType: data.fishType || 'common', weight: data.weight || this.config.baseWeight, rarity: data.rarity || 1, baits: data.baits || 0, status: 'hooked', createdAt: Date.now() };
        this.catches.set(id, theCatch);
        this.stats.totalCatches++;
        this._triggerHook('rodCast', { catchId: id });
        return { success: true, theCatch };
    }

    getCatch(id) { return this.catches.get(id) ? { ...this.catches.get(id) } : null; }
    listCatches() { return Array.from(this.catches.values()).map(c => ({ ...c })); }
    listByFisher(fisherId) { return Array.from(this.catches.values()).filter(c => c.fisherId === fisherId).map(c => ({ ...c })); }
    listByFishType(fishType) { return Array.from(this.catches.values()).filter(c => c.fishType === fishType).map(c => ({ ...c })); }

    hookFish(catchId, amount = 5) {
        const theCatch = this.catches.get(catchId);
        if (!theCatch) return { success: false, error: 'CATCH_NOT_FOUND' };
        theCatch.baits += amount;
        theCatch.status = 'hooked';
        this._triggerHook('fishHooked', { catchId, newBaits: theCatch.baits });
        return { success: true };
    }

    catchFish(catchId, amount = 10) {
        const theCatch = this.catches.get(catchId);
        if (!theCatch) return { success: false, error: 'CATCH_NOT_FOUND' };
        theCatch.weight += amount;
        theCatch.status = 'caught';
        this._triggerHook('fishCaught', { catchId, newWeight: theCatch.weight });
        return { success: true };
    }

    releaseFish(catchId) {
        const theCatch = this.catches.get(catchId);
        if (!theCatch) return { success: false, error: 'CATCH_NOT_FOUND' };
        theCatch.status = 'released';
        this._triggerHook('fishReleased', { catchId });
        return { success: true };
    }

    calculateCatchQuality(catchId) {
        const theCatch = this.catches.get(catchId);
        if (!theCatch) return 0;
        return theCatch.weight * (1 + theCatch.rarity / 10) + theCatch.baits * 2;
    }

    listCaught() { return Array.from(this.catches.values()).filter(c => c.status === 'caught').map(c => ({ ...c })); }

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
        if (this.stats.totalCatches < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCatches += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { catches: Array.from(this.catches.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.catches) this.catches = new Map(data.catches);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, catchCount: this.catches.size }; }
}
