/**
 * SectDiplomacy.js - 宗门外交
 * V437 Iteration 14/15 Round 15 - Sect Diplomacy
 *
 * 融合6大设计系统:
 * - generic-agent: 外交自循环
 * - chatdev: 外交角色协调
 * - nanobot: 外交mesh
 * - claude-code: 外交分析工具
 * - thunderbolt: 外交持久化
 * - ruflo: 外交Hook
 */

export class SectDiplomacy {
    constructor(config = {}) {
        this.config = { maxRelations: config.maxRelations || 100, baseTrustLevel: config.baseTrustLevel || 50, ...config };
        this.relations = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalRelations: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRelation', (ctx) => this.getRelation(ctx.relationId));
        this.registerTool('establishRelation', (ctx) => this.establishRelation(ctx));
    }

    establishRelation(data) {
        const id = data.relationId || data.id || `rel_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const relation = {
            relationId: id,
            sect1: data.sect1,
            sect2: data.sect2,
            trustLevel: data.trustLevel || this.config.baseTrustLevel,
            treaties: 0,
            trade: data.trade || 0,
            status: data.status || 'neutral',
            treatiesList: data.treatiesList || [],
            createdAt: Date.now()
        };
        this.relations.set(id, relation);
        this.stats.totalRelations++;
        this._triggerHook('relationEstablished', { relationId: id });
        return { success: true, relation };
    }

    getRelation(id) { return this.relations.get(id) ? { ...this.relations.get(id) } : null; }
    listRelations() { return Array.from(this.relations.values()).map(r => ({ ...r })); }
    listBySect(sect) { return Array.from(this.relations.values()).filter(r => r.sect1 === sect || r.sect2 === sect).map(r => ({ ...r })); }
    listAllied() { return Array.from(this.relations.values()).filter(r => r.status === 'allied').map(r => ({ ...r })); }
    listHostile() { return Array.from(this.relations.values()).filter(r => r.status === 'hostile').map(r => ({ ...r })); }

    increaseTrust(relationId, amount = 5) {
        const relation = this.relations.get(relationId);
        if (!relation) return { success: false, error: 'RELATION_NOT_FOUND' };
        relation.trustLevel += amount;
        this._triggerHook('trustIncreased', { relationId, newTrustLevel: relation.trustLevel });
        return { success: true };
    }

    signTreaty(relationId, treaty) {
        const relation = this.relations.get(relationId);
        if (!relation) return { success: false, error: 'RELATION_NOT_FOUND' };
        relation.treatiesList.push(treaty);
        relation.treaties = relation.treatiesList.length;
        this._triggerHook('treatySigned', { relationId, treaty });
        return { success: true };
    }

    increaseTrade(relationId, amount = 10) {
        const relation = this.relations.get(relationId);
        if (!relation) return { success: false, error: 'RELATION_NOT_FOUND' };
        relation.trade += amount;
        return { success: true };
    }

    declareHostility(relationId) {
        const relation = this.relations.get(relationId);
        if (!relation) return { success: false, error: 'RELATION_NOT_FOUND' };
        relation.status = 'hostile';
        this._triggerHook('hostilityDeclared', { relationId });
        return { success: true };
    }

    calculateDiplomacyScore(relationId) {
        const relation = this.relations.get(relationId);
        if (!relation) return 0;
        return relation.trustLevel * 2 + relation.trade + relation.treatiesList.length * 50;
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
        if (this.stats.totalRelations < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxRelations += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { relations: Array.from(this.relations.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.relations) this.relations = new Map(data.relations);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, relationCount: this.relations.size }; }
}
