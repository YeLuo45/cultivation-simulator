/**
 * CultivationAncestor.js - 修真祖先
 * V667 Iteration 20/30 Round 27 - Cultivation Ancestor
 *
 * 融合6大设计系统:
 * - generic-agent: 祖先自循环
 * - chatdev: 祖先角色协调
 * - nanobot: 祖先mesh
 * - claude-code: 祖先分析工具
 * - thunderbolt: 祖先持久化
 * - ruflo: 祖先Hook
 */

export class CultivationAncestor {
    constructor(config = {}) {
        this.config = { maxAncestors: config.maxAncestors || 3, baseBloodline: config.baseBloodline || 20, ...config };
        this.ancestors = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalAncestors: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getAncestor', (ctx) => this.getAncestor(ctx.ancestorId));
        this.registerTool('recruitAncestor', (ctx) => this.recruitAncestor(ctx));
    }

    recruitAncestor(data) {
        const id = data.id || `anc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const ancestor = {
            ancestorId: id,
            lineageId: data.lineageId,
            name: data.name || 'Unnamed Ancestor',
            type: data.type || 'ancient',
            bloodline: data.bloodline !== undefined ? data.bloodline : this.config.baseBloodline,
            arts: data.arts ? [...data.arts] : [],
            level: data.level !== undefined ? data.level : 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.ancestors.set(id, ancestor);
        this.stats.totalAncestors++;
        this._triggerHook('ancestorRecruited', { ancestorId: id });
        return { success: true, ancestor };
    }

    getAncestor(id) {
        const ancestor = this.ancestors.get(id);
        if (!ancestor) return null;
        return { ...ancestor, arts: [...ancestor.arts] };
    }

    listAncestors() { return Array.from(this.ancestors.values()).map(a => ({ ...a, arts: [...a.arts] })); }
    listByLineage(lineageId) { return Array.from(this.ancestors.values()).filter(a => a.lineageId === lineageId).map(a => ({ ...a, arts: [...a.arts] })); }
    listByType(type) { return Array.from(this.ancestors.values()).filter(a => a.type === type).map(a => ({ ...a, arts: [...a.arts] })); }
    listLegendary() { return Array.from(this.ancestors.values()).filter(a => a.status === 'legendary').map(a => ({ ...a, arts: [...a.arts] })); }

    addArt(ancestorId, art) {
        const ancestor = this.ancestors.get(ancestorId);
        if (!ancestor) return { success: false, error: 'ANCESTOR_NOT_FOUND' };
        ancestor.arts.push(art);
        this._triggerHook('artAdded', { ancestorId, art, totalArts: ancestor.arts.length });
        return { success: true };
    }

    strengthenBloodline(ancestorId, amount = 5) {
        const ancestor = this.ancestors.get(ancestorId);
        if (!ancestor) return { success: false, error: 'ANCESTOR_NOT_FOUND' };
        ancestor.bloodline += amount;
        this._triggerHook('bloodlineStrengthened', { ancestorId, newBloodline: ancestor.bloodline });
        return { success: true };
    }

    levelUpAncestor(ancestorId) {
        const ancestor = this.ancestors.get(ancestorId);
        if (!ancestor) return { success: false, error: 'ANCESTOR_NOT_FOUND' };
        ancestor.level++;
        this._triggerHook('ancestorLeveledUp', { ancestorId, newLevel: ancestor.level });
        return { success: true };
    }

    legendAncestor(ancestorId) {
        const ancestor = this.ancestors.get(ancestorId);
        if (!ancestor) return { success: false, error: 'ANCESTOR_NOT_FOUND' };
        ancestor.status = 'legendary';
        this._triggerHook('ancestorLegendized', { ancestorId });
        return { success: true };
    }

    calculateAncestorValue(ancestorId) {
        const ancestor = this.ancestors.get(ancestorId);
        if (!ancestor) return 0;
        return ancestor.level * 100 + ancestor.bloodline * 2 + ancestor.arts.length * 30;
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
        if (this.stats.totalAncestors < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxAncestors += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { ancestors: Array.from(this.ancestors.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.ancestors) this.ancestors = new Map(data.ancestors);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, ancestorCount: this.ancestors.size }; }
}
