/**
 * CultivationGarden.js - 修真园系统
 * V562 Iteration 5/20 Round 23
 *
 * 融合6大设计系统:
 * - generic-agent: 园圃自循环
 * - chatdev: 园丁角色协调
 * - nanobot: 植物mesh
 * - claude-code: 园圃分析工具
 * - thunderbolt: 园圃持久化
 * - ruflo: 园圃Hook
 */

export class CultivationGarden {
    constructor(config = {}) {
        this.config = { maxGardens: config.maxGardens || 50, baseVitality: config.baseVitality || 20, ...config };
        this.gardens = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalGardens: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getGarden', (ctx) => this.getGarden(ctx.gardenId));
        this.registerTool('openGarden', (ctx) => this.openGarden(ctx));
    }

    openGarden(data) {
        const id = data.id || `grd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const garden = {
            gardenId: id,
            gardenerId: data.gardenerId,
            name: data.name,
            type: data.type || 'herb',
            vitality: data.vitality || this.config.baseVitality,
            plants: data.plants || [],
            level: 1,
            status: 'seeding',
            createdAt: Date.now()
        };
        this.gardens.set(id, garden);
        this.stats.totalGardens++;
        this._triggerHook('gardenOpened', { gardenId: id });
        return { success: true, garden };
    }

    getGarden(id) { return this.gardens.get(id) ? { ...this.gardens.get(id) } : null; }
    listGardens() { return Array.from(this.gardens.values()).map(g => ({ ...g })); }
    listByGardener(gardenerId) { return Array.from(this.gardens.values()).filter(g => g.gardenerId === gardenerId).map(g => ({ ...g })); }
    listParadise() { return Array.from(this.gardens.values()).filter(g => g.status === 'paradise').map(g => ({ ...g })); }

    addPlant(gardenId, plant) {
        const garden = this.gardens.get(gardenId);
        if (!garden) return { success: false, error: 'GARDEN_NOT_FOUND' };
        garden.plants.push(plant);
        if (garden.status === 'seeding') garden.status = 'growing';
        this._triggerHook('plantAdded', { gardenId, plant, plantCount: garden.plants.length });
        return { success: true };
    }

    increaseVitality(gardenId, amount = 5) {
        const garden = this.gardens.get(gardenId);
        if (!garden) return { success: false, error: 'GARDEN_NOT_FOUND' };
        garden.vitality += amount;
        this._triggerHook('vitalityIncreased', { gardenId, newVitality: garden.vitality });
        return { success: true };
    }

    levelUpGarden(gardenId) {
        const garden = this.gardens.get(gardenId);
        if (!garden) return { success: false, error: 'GARDEN_NOT_FOUND' };
        garden.level++;
        this._triggerHook('gardenLeveledUp', { gardenId, newLevel: garden.level });
        return { success: true };
    }

    paradiseGarden(gardenId) {
        const garden = this.gardens.get(gardenId);
        if (!garden) return { success: false, error: 'GARDEN_NOT_FOUND' };
        garden.status = 'paradise';
        this._triggerHook('gardenParadise', { gardenId });
        return { success: true };
    }

    calculateGardenValue(gardenId) {
        const garden = this.gardens.get(gardenId);
        if (!garden) return 0;
        return garden.level * 100 + garden.vitality * 2 + garden.plants.length * 30;
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
        if (this.stats.totalGardens < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxGardens += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { gardens: Array.from(this.gardens.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.gardens) this.gardens = new Map(data.gardens);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, gardenCount: this.gardens.size }; }
}
