/**
 * CultivationFurniture.js - 修真器系统
 * V566 Iteration 9/20 Round 23
 */
export class CultivationFurniture {
    constructor(config = {}) {
        this.config = { maxFurnitures: config.maxFurnitures || 50, baseCraftsmanship: config.baseCraftsmanship || 20, ...config };
        this.furnitures = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalFurnitures: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getFurniture', (ctx) => this.getFurniture(ctx.furnitureId));
        this.registerTool('buildFurniture', (ctx) => this.buildFurniture(ctx));
    }

    buildFurniture(data) {
        const id = data.id || `fur_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const furniture = {
            furnitureId: id,
            craftsmanId: data.craftsmanId || 'unknown_craftsman',
            name: data.name || 'unnamed_furniture',
            type: data.type || 'table',
            craftsmanship: data.craftsmanship || this.config.baseCraftsmanship,
            woods: data.woods || [],
            level: data.level || 1,
            status: data.status || 'rough',
            createdAt: Date.now()
        };
        this.furnitures.set(id, furniture);
        this.stats.totalFurnitures++;
        this._triggerHook('furnitureBuilt', { furnitureId: id });
        return { success: true, furniture };
    }

    getFurniture(id) { return this.furnitures.get(id) ? { ...this.furnitures.get(id) } : null; }
    listFurnitures() { return Array.from(this.furnitures.values()).map(f => ({ ...f })); }
    listByCraftsman(craftsmanId) { return Array.from(this.furnitures.values()).filter(f => f.craftsmanId === craftsmanId).map(f => ({ ...f })); }
    listMasterwork() { return Array.from(this.furnitures.values()).filter(f => f.status === 'masterwork').map(f => ({ ...f })); }

    addWood(furnitureId, wood) {
        const furniture = this.furnitures.get(furnitureId);
        if (!furniture) return { success: false, error: 'FURNITURE_NOT_FOUND' };
        furniture.woods.push(wood);
        if (furniture.woods.length >= 2) furniture.status = 'polished';
        this._triggerHook('woodAdded', { furnitureId, wood });
        return { success: true };
    }

    increaseCraftsmanship(furnitureId, amount = 5) {
        const furniture = this.furnitures.get(furnitureId);
        if (!furniture) return { success: false, error: 'FURNITURE_NOT_FOUND' };
        furniture.craftsmanship += amount;
        this._triggerHook('craftsmanshipIncreased', { furnitureId, newCraftsmanship: furniture.craftsmanship });
        return { success: true };
    }

    levelUpFurniture(furnitureId) {
        const furniture = this.furnitures.get(furnitureId);
        if (!furniture) return { success: false, error: 'FURNITURE_NOT_FOUND' };
        furniture.level++;
        this._triggerHook('furnitureLeveledUp', { furnitureId, newLevel: furniture.level });
        return { success: true };
    }

    masterworkFurniture(furnitureId) {
        const furniture = this.furnitures.get(furnitureId);
        if (!furniture) return { success: false, error: 'FURNITURE_NOT_FOUND' };
        furniture.status = 'masterwork';
        this._triggerHook('furnitureMasterworked', { furnitureId });
        return { success: true };
    }

    calculateFurnitureValue(furnitureId) {
        const furniture = this.furnitures.get(furnitureId);
        if (!furniture) return 0;
        return furniture.level * 100 + furniture.craftsmanship * 2 + furniture.woods.length * 30;
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
        if (this.stats.totalFurnitures < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxFurnitures += 25;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { furnitures: Array.from(this.furnitures.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.furnitures) this.furnitures = new Map(data.furnitures);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, furnitureCount: this.furnitures.size }; }
}
