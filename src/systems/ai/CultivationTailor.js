/**
 * CultivationTailor.js - 修真裁缝
 * V710 Iteration 3/30 Round 29 - Cultivation Tailor
 *
 * 融合6大设计系统:
 * - generic-agent: 裁缝自循环
 * - chatdev: 裁缝角色协调
 * - nanobot: 衣物mesh
 * - claude-code: 裁缝分析工具
 * - thunderbolt: 裁缝持久化
 * - ruflo: 裁缝Hook
 */

export class CultivationTailor {
    constructor(config = {}) {
        this.config = { maxTailors: config.maxTailors || 30, baseTailoring: config.baseTailoring || 20, ...config };
        this.tailors = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalTailors: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getTailor', (ctx) => this.getTailor(ctx.tailorId));
        this.registerTool('recruitTailor', (ctx) => this.recruitTailor(ctx));
    }

    recruitTailor(data) {
        const id = data.id || `tlo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const tailor = {
            tailorId: id,
            masterId: data.masterId,
            name: data.name,
            type: data.type || 'silk',
            tailoring: data.tailoring || this.config.baseTailoring,
            garments: data.garments || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.tailors.set(id, tailor);
        this.stats.totalTailors++;
        this._triggerHook('tailorRecruited', { tailorId: id });
        return { success: true, tailor };
    }

    getTailor(id) { return this.tailors.get(id) ? { ...this.tailors.get(id) } : null; }
    listTailors() { return Array.from(this.tailors.values()).map(t => ({ ...t })); }
    listByMaster(masterId) { return Array.from(this.tailors.values()).filter(t => t.masterId === masterId).map(t => ({ ...t })); }
    listLegendary() { return Array.from(this.tailors.values()).filter(t => t.status === 'legendary').map(t => ({ ...t })); }

    addGarment(tailorId, garment) {
        const tailor = this.tailors.get(tailorId);
        if (!tailor) return { success: false, error: 'TAILOR_NOT_FOUND' };
        tailor.garments.push(garment);
        if (tailor.status === 'novice') tailor.status = 'veteran';
        this._triggerHook('garmentAdded', { tailorId, garment, garmentCount: tailor.garments.length });
        return { success: true };
    }

    raiseTailoring(tailorId, amount = 5) {
        const tailor = this.tailors.get(tailorId);
        if (!tailor) return { success: false, error: 'TAILOR_NOT_FOUND' };
        tailor.tailoring += amount;
        this._triggerHook('tailoringRaised', { tailorId, newTailoring: tailor.tailoring });
        return { success: true };
    }

    levelUpTailor(tailorId) {
        const tailor = this.tailors.get(tailorId);
        if (!tailor) return { success: false, error: 'TAILOR_NOT_FOUND' };
        tailor.level++;
        this._triggerHook('tailorLeveledUp', { tailorId, newLevel: tailor.level });
        return { success: true };
    }

    legendTailor(tailorId) {
        const tailor = this.tailors.get(tailorId);
        if (!tailor) return { success: false, error: 'TAILOR_NOT_FOUND' };
        tailor.status = 'legendary';
        this._triggerHook('tailorLegendized', { tailorId });
        return { success: true };
    }

    calculateTailorValue(tailorId) {
        const tailor = this.tailors.get(tailorId);
        if (!tailor) return 0;
        return tailor.level * 100 + tailor.tailoring * 2 + tailor.garments.length * 30;
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
        if (this.stats.totalTailors < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxTailors += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { tailors: Array.from(this.tailors.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.tailors) this.tailors = new Map(data.tailors);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, tailorCount: this.tailors.size }; }
}
