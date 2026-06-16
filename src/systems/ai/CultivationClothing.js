/**
 * CultivationClothing.js - 修真衣
 * V564 Iteration 7/20 Round 23 - Cultivation Clothing
 *
 * 融合6大设计系统:
 * - generic-agent: 衣橱自循环
 * - chatdev: 裁缝角色协调
 * - nanobot: 面料mesh
 * - claude-code: 衣橱分析工具
 * - thunderbolt: 衣橱持久化
 * - ruflo: 衣橱Hook
 */

export class CultivationClothing {
    constructor(config = {}) {
        this.config = { maxClothings: config.maxClothings || 50, baseElegance: config.baseElegance || 20, ...config };
        this.clothings = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalClothings: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getClothing', (ctx) => this.getClothing(ctx.clothingId));
        this.registerTool('sewClothing', (ctx) => this.sewClothing(ctx));
    }

    sewClothing(data) {
        const id = data.id || `clo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const clothing = {
            clothingId: id,
            tailorId: data.tailorId,
            name: data.name,
            type: data.type || 'robe',
            elegance: data.elegance || this.config.baseElegance,
            fabrics: data.fabrics || [],
            level: 1,
            status: 'sewn',
            createdAt: Date.now()
        };
        this.clothings.set(id, clothing);
        this.stats.totalClothings++;
        this._triggerHook('clothingSewn', { clothingId: id });
        return { success: true, clothing };
    }

    getClothing(id) { return this.clothings.get(id) ? { ...this.clothings.get(id) } : null; }
    listClothings() { return Array.from(this.clothings.values()).map(c => ({ ...c })); }
    listByTailor(tailorId) { return Array.from(this.clothings.values()).filter(c => c.tailorId === tailorId).map(c => ({ ...c })); }
    listMasterpiece() { return Array.from(this.clothings.values()).filter(c => c.status === 'masterpiece').map(c => ({ ...c })); }

    addFabric(clothingId, fabric) {
        const clothing = this.clothings.get(clothingId);
        if (!clothing) return { success: false, error: 'CLOTHING_NOT_FOUND' };
        clothing.fabrics.push(fabric);
        if (clothing.status === 'sewn') clothing.status = 'worn';
        this._triggerHook('fabricAdded', { clothingId, fabric, fabricCount: clothing.fabrics.length });
        return { success: true };
    }

    increaseElegance(clothingId, amount = 5) {
        const clothing = this.clothings.get(clothingId);
        if (!clothing) return { success: false, error: 'CLOTHING_NOT_FOUND' };
        clothing.elegance += amount;
        this._triggerHook('eleganceIncreased', { clothingId, newElegance: clothing.elegance });
        return { success: true };
    }

    levelUpClothing(clothingId) {
        const clothing = this.clothings.get(clothingId);
        if (!clothing) return { success: false, error: 'CLOTHING_NOT_FOUND' };
        clothing.level++;
        this._triggerHook('clothingLeveledUp', { clothingId, newLevel: clothing.level });
        return { success: true };
    }

    masterClothing(clothingId) {
        const clothing = this.clothings.get(clothingId);
        if (!clothing) return { success: false, error: 'CLOTHING_NOT_FOUND' };
        clothing.status = 'masterpiece';
        this._triggerHook('clothingMastered', { clothingId });
        return { success: true };
    }

    calculateClothingValue(clothingId) {
        const clothing = this.clothings.get(clothingId);
        if (!clothing) return 0;
        return clothing.level * 100 + clothing.elegance * 2 + clothing.fabrics.length * 30;
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
        if (this.stats.totalClothings < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxClothings += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { clothings: Array.from(this.clothings.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.clothings) this.clothings = new Map(data.clothings);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, clothingCount: this.clothings.size }; }
}
