/**
 * CultivationBrand.js - 修真烙印系统
 * V760 Iteration 23/30 Round 30 - Cultivation Brand
 */

export class CultivationBrand {
    constructor(config = {}) {
        this.config = { maxBrands: config.maxBrands || 20, baseHeat: config.baseHeat || 20, ...config };
        this.brands = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBrands: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBrand', (ctx) => this.getBrand(ctx.brandId));
        this.registerTool('recruitBrand', (ctx) => this.recruitBrand(ctx));
    }

    recruitBrand(data) {
        const id = data.brandId || `brnd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const brand = {
            brandId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Brand',
            type: data.type || 'fire',
            heat: data.heat || this.config.baseHeat,
            scars: data.scars || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.brands.set(id, brand);
        this.stats.totalBrands++;
        this._triggerHook('brandRecruited', { brandId: id });
        return { success: true, brand };
    }

    getBrand(id) { return this.brands.get(id) ? { ...this.brands.get(id) } : null; }
    listBrands() { return Array.from(this.brands.values()).map(b => ({ ...b })); }
    listByMaster(masterId) { return Array.from(this.brands.values()).filter(b => b.masterId === masterId).map(b => ({ ...b })); }
    listLegendary() { return Array.from(this.brands.values()).filter(b => b.status === 'legendary').map(b => ({ ...b })); }

    addScar(brandId, scar) {
        const brand = this.brands.get(brandId);
        if (!brand) return { success: false, error: 'BRAND_NOT_FOUND' };
        brand.scars.push(scar);
        this._triggerHook('scarAdded', { brandId, scar });
        return { success: true, brand: { ...brand } };
    }

    raiseHeat(brandId, amount = 5) {
        const brand = this.brands.get(brandId);
        if (!brand) return { success: false, error: 'BRAND_NOT_FOUND' };
        brand.heat += amount;
        this._triggerHook('heatRaised', { brandId, newHeat: brand.heat });
        return { success: true };
    }

    levelUpBrand(brandId) {
        const brand = this.brands.get(brandId);
        if (!brand) return { success: false, error: 'BRAND_NOT_FOUND' };
        brand.level++;
        this._triggerHook('brandLeveledUp', { brandId, newLevel: brand.level });
        return { success: true };
    }

    legendBrand(brandId) {
        const brand = this.brands.get(brandId);
        if (!brand) return { success: false, error: 'BRAND_NOT_FOUND' };
        brand.status = 'legendary';
        this._triggerHook('brandLegendized', { brandId });
        return { success: true };
    }

    calculateBrandValue(brandId) {
        const brand = this.brands.get(brandId);
        if (!brand) return 0;
        return brand.level * 100 + brand.heat * 2 + brand.scars.length * 30;
    }

    listByType(type) { return Array.from(this.brands.values()).filter(b => b.type === type).map(b => ({ ...b })); }
    listVeteran() { return Array.from(this.brands.values()).filter(b => b.status === 'veteran').map(b => ({ ...b })); }

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
        if (this.stats.totalBrands < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBrands += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { brands: Array.from(this.brands.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.brands) this.brands = new Map(data.brands);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, brandCount: this.brands.size }; }
}
