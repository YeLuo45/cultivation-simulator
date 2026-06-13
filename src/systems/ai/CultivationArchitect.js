/**
 * CultivationArchitect.js - 修真建筑师
 * V711 Iteration 4/30 Round 29 - Cultivation Architect
 *
 * 融合6大设计系统:
 * - generic-agent: 建筑师自循环
 * - chatdev: 建筑师角色协调
 * - nanobot: 建筑mesh
 * - claude-code: 建筑师分析工具
 * - thunderbolt: 建筑师持久化
 * - ruflo: 建筑师Hook
 */

export class CultivationArchitect {
    constructor(config = {}) {
        this.config = { maxArchitects: config.maxArchitects || 20, baseDesigning: config.baseDesigning || 20, ...config };
        this.architects = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalArchitects: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getArchitect', (ctx) => this.getArchitect(ctx.architectId));
        this.registerTool('recruitArchitect', (ctx) => this.recruitArchitect(ctx));
    }

    recruitArchitect(data) {
        const id = data.id || `arc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const architect = {
            architectId: id,
            masterId: data.masterId,
            name: data.name,
            type: data.type || 'jade',
            designing: data.designing || this.config.baseDesigning,
            structures: data.structures || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.architects.set(id, architect);
        this.stats.totalArchitects++;
        this._triggerHook('architectRecruited', { architectId: id });
        return { success: true, architect };
    }

    getArchitect(id) { return this.architects.get(id) ? { ...this.architects.get(id) } : null; }
    listArchitects() { return Array.from(this.architects.values()).map(a => ({ ...a })); }
    listByMaster(masterId) { return Array.from(this.architects.values()).filter(a => a.masterId === masterId).map(a => ({ ...a })); }
    listLegendary() { return Array.from(this.architects.values()).filter(a => a.status === 'legendary').map(a => ({ ...a })); }

    addStructure(architectId, structure) {
        const architect = this.architects.get(architectId);
        if (!architect) return { success: false, error: 'ARCHITECT_NOT_FOUND' };
        architect.structures.push(structure);
        if (architect.status === 'novice') architect.status = 'veteran';
        this._triggerHook('structureAdded', { architectId, structure, structureCount: architect.structures.length });
        return { success: true };
    }

    raiseDesigning(architectId, amount = 5) {
        const architect = this.architects.get(architectId);
        if (!architect) return { success: false, error: 'ARCHITECT_NOT_FOUND' };
        architect.designing += amount;
        this._triggerHook('designingRaised', { architectId, newDesigning: architect.designing });
        return { success: true };
    }

    levelUpArchitect(architectId) {
        const architect = this.architects.get(architectId);
        if (!architect) return { success: false, error: 'ARCHITECT_NOT_FOUND' };
        architect.level++;
        this._triggerHook('architectLeveledUp', { architectId, newLevel: architect.level });
        return { success: true };
    }

    legendArchitect(architectId) {
        const architect = this.architects.get(architectId);
        if (!architect) return { success: false, error: 'ARCHITECT_NOT_FOUND' };
        architect.status = 'legendary';
        this._triggerHook('architectLegendized', { architectId });
        return { success: true };
    }

    calculateArchitectValue(architectId) {
        const architect = this.architects.get(architectId);
        if (!architect) return 0;
        return architect.level * 100 + architect.designing * 2 + architect.structures.length * 30;
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
        if (this.stats.totalArchitects < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxArchitects += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { architects: Array.from(this.architects.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.architects) this.architects = new Map(data.architects);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, architectCount: this.architects.size }; }
}
