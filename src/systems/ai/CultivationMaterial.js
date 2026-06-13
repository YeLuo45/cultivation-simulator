/**
 * CultivationMaterial.js - 修真材料系统
 * V700 Iteration 23/30 Round 28 - Cultivation Material
 */

export class CultivationMaterial {
    constructor(config = {}) {
        this.config = { maxMaterials: config.maxMaterials || 100, basePurity: config.basePurity || 20, ...config };
        this.materials = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMaterials: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMaterial', (ctx) => this.getMaterial(ctx.materialId));
        this.registerTool('recruitMaterial', (ctx) => this.recruitMaterial(ctx));
    }

    recruitMaterial(data) {
        const id = data.materialId || `mat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const material = {
            materialId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Material',
            type: data.type || 'metal',
            purity: data.purity || this.config.basePurity,
            refinements: data.refinements || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.materials.set(id, material);
        this.stats.totalMaterials++;
        this._triggerHook('materialRecruited', { materialId: id });
        return { success: true, material };
    }

    getMaterial(id) { return this.materials.get(id) ? { ...this.materials.get(id) } : null; }
    listMaterials() { return Array.from(this.materials.values()).map(m => ({ ...m })); }
    listByMaster(masterId) { return Array.from(this.materials.values()).filter(m => m.masterId === masterId).map(m => ({ ...m })); }
    listLegendary() { return Array.from(this.materials.values()).filter(m => m.status === 'legendary').map(m => ({ ...m })); }

    addRefinement(materialId, refinement) {
        const material = this.materials.get(materialId);
        if (!material) return { success: false, error: 'MATERIAL_NOT_FOUND' };
        material.refinements.push(refinement);
        this._triggerHook('refinementAdded', { materialId, refinement });
        return { success: true, material: { ...material } };
    }

    raisePurity(materialId, amount = 5) {
        const material = this.materials.get(materialId);
        if (!material) return { success: false, error: 'MATERIAL_NOT_FOUND' };
        material.purity += amount;
        this._triggerHook('purityRaised', { materialId, newPurity: material.purity });
        return { success: true };
    }

    levelUpMaterial(materialId) {
        const material = this.materials.get(materialId);
        if (!material) return { success: false, error: 'MATERIAL_NOT_FOUND' };
        material.level++;
        this._triggerHook('materialLeveledUp', { materialId, newLevel: material.level });
        return { success: true };
    }

    legendMaterial(materialId) {
        const material = this.materials.get(materialId);
        if (!material) return { success: false, error: 'MATERIAL_NOT_FOUND' };
        material.status = 'legendary';
        this._triggerHook('materialLegendized', { materialId });
        return { success: true };
    }

    calculateMaterialValue(materialId) {
        const material = this.materials.get(materialId);
        if (!material) return 0;
        return material.level * 100 + material.purity * 2 + material.refinements.length * 30;
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
        if (this.stats.totalMaterials < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMaterials += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { materials: Array.from(this.materials.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.materials) this.materials = new Map(data.materials);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, materialCount: this.materials.size }; }
}
