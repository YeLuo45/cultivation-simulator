/**
 * SectArchitecture.js - 宗门建筑
 * V477 Iteration 9/15 Round 18
 *
 * 融合6大设计系统:
 * - generic-agent: 建筑自循环
 * - chatdev: 建筑角色协调
 * - nanobot: 建筑mesh
 * - claude-code: 建筑分析工具
 * - thunderbolt: 建筑持久化
 * - ruflo: 建筑Hook
 */

export class SectArchitecture {
    constructor(config = {}) {
        this.config = { maxBuildings: config.maxBuildings || 100, baseFloors: config.baseFloors || 1, ...config };
        this.buildings = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalBuildings: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getBuilding', (ctx) => this.getBuilding(ctx.buildingId));
        this.registerTool('designBuilding', (ctx) => this.designBuilding(ctx));
    }

    designBuilding(data) {
        const id = data.id || `bld_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const building = { buildingId: id, sectId: data.sectId, name: data.name, type: data.type || 'hall', floors: data.floors || this.config.baseFloors, defenses: data.defenses || 0, status: 'planning', createdAt: Date.now() };
        this.buildings.set(id, building);
        this.stats.totalBuildings++;
        this._triggerHook('buildingDesigned', { buildingId: id });
        return { success: true, building };
    }

    getBuilding(id) { return this.buildings.get(id) ? { ...this.buildings.get(id) } : null; }
    listBuildings() { return Array.from(this.buildings.values()).map(b => ({ ...b })); }
    listBySect(sectId) { return Array.from(this.buildings.values()).filter(b => b.sectId === sectId).map(b => ({ ...b })); }
    listByType(type) { return Array.from(this.buildings.values()).filter(b => b.type === type).map(b => ({ ...b })); }

    addFloor(buildingId) {
        const building = this.buildings.get(buildingId);
        if (!building) return { success: false, error: 'BUILDING_NOT_FOUND' };
        building.floors++;
        if (building.status === 'planning') building.status = 'built';
        this._triggerHook('floorAdded', { buildingId, newFloors: building.floors });
        return { success: true };
    }

    reinforceBuilding(buildingId, amount = 5) {
        const building = this.buildings.get(buildingId);
        if (!building) return { success: false, error: 'BUILDING_NOT_FOUND' };
        building.defenses += amount;
        if (building.status === 'planning') building.status = 'built';
        this._triggerHook('buildingReinforced', { buildingId, newDefenses: building.defenses });
        return { success: true };
    }

    damageBuilding(buildingId, amount = 10) {
        const building = this.buildings.get(buildingId);
        if (!building) return { success: false, error: 'BUILDING_NOT_FOUND' };
        building.defenses = Math.max(0, building.defenses - amount);
        if (building.defenses === 0) building.status = 'damaged';
        this._triggerHook('buildingDamaged', { buildingId, newDefenses: building.defenses });
        return { success: true };
    }

    demolishBuilding(buildingId) {
        const building = this.buildings.get(buildingId);
        if (!building) return { success: false, error: 'BUILDING_NOT_FOUND' };
        building.status = 'damaged';
        this._triggerHook('buildingDemolished', { buildingId });
        return { success: true };
    }

    calculateBuildingValue(buildingId) {
        const building = this.buildings.get(buildingId);
        if (!building) return 0;
        return building.floors * 100 + building.defenses * 2;
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
        if (this.stats.totalBuildings < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxBuildings += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { buildings: Array.from(this.buildings.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.buildings) this.buildings = new Map(data.buildings);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, buildingCount: this.buildings.size }; }
}
