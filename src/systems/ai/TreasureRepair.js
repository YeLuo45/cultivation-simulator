/**
 * TreasureRepair.js - 宝物修复系统
 * V510 Iteration 12/20 Round 20
 */
export class TreasureRepair {
    constructor(config = {}) {
        this.config = { maxRepairs: config.maxRepairs || 100, baseDamage: config.baseDamage || 80, ...config };
        this.repairs = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRepairs: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRepair', (ctx) => this.getRepair(ctx.repairId));
        this.registerTool('startRepair', (ctx) => this.startRepair(ctx));
    }

    startRepair(data) {
        const id = data.id || `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const repair = {
            repairId: id,
            restorerId: data.restorerId || 'unknown',
            treasureName: data.treasureName || 'unnamed_treasure',
            damage: data.damage != null ? data.damage : this.config.baseDamage,
            materials: data.materials ? [...data.materials] : [],
            quality: data.quality || 0,
            status: 'intake',
            startedAt: Date.now()
        };
        this.repairs.set(id, repair);
        this.stats.totalRepairs++;
        this._triggerHook('repairStarted', { repairId: id });
        return { success: true, repair };
    }

    getRepair(id) { return this.repairs.get(id) ? { ...this.repairs.get(id), materials: [...(this.repairs.get(id).materials || [])] } : null; }
    listRepairs() { return Array.from(this.repairs.values()).map(r => ({ ...r, materials: [...(r.materials || [])] })); }
    listByRestorer(restorerId) { return Array.from(this.repairs.values()).filter(r => r.restorerId === restorerId).map(r => ({ ...r, materials: [...(r.materials || [])] })); }
    listRestored() { return Array.from(this.repairs.values()).filter(r => r.status === 'restored').map(r => ({ ...r, materials: [...(r.materials || [])] })); }

    addMaterial(repairId, material) {
        const repair = this.repairs.get(repairId);
        if (!repair) return { success: false, error: 'REPAIR_NOT_FOUND' };
        repair.materials.push(material);
        this._triggerHook('materialAdded', { repairId, material });
        return { success: true };
    }

    reduceDamage(repairId, amount = 5) {
        const repair = this.repairs.get(repairId);
        if (!repair) return { success: false, error: 'REPAIR_NOT_FOUND' };
        repair.damage = Math.max(0, repair.damage - amount);
        if (repair.status === 'intake') repair.status = 'repairing';
        this._triggerHook('damageReduced', { repairId, newDamage: repair.damage });
        return { success: true };
    }

    refineQuality(repairId, amount = 5) {
        const repair = this.repairs.get(repairId);
        if (!repair) return { success: false, error: 'REPAIR_NOT_FOUND' };
        repair.quality += amount;
        if (repair.status === 'intake') repair.status = 'repairing';
        this._triggerHook('qualityRefined', { repairId, newQuality: repair.quality });
        return { success: true };
    }

    completeRepair(repairId) {
        const repair = this.repairs.get(repairId);
        if (!repair) return { success: false, error: 'REPAIR_NOT_FOUND' };
        repair.status = 'restored';
        this._triggerHook('repairCompleted', { repairId });
        return { success: true };
    }

    calculateRepairValue(repairId) {
        const repair = this.repairs.get(repairId);
        if (!repair) return 0;
        return repair.quality * 10 + (100 - repair.damage) + repair.materials.length * 5;
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
        if (this.stats.totalRepairs < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxRepairs += 25;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { repairs: Array.from(this.repairs.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.repairs) this.repairs = new Map(data.repairs);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, repairCount: this.repairs.size }; }
}
