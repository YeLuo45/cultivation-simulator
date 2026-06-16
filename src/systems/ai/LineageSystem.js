/**
 * LineageSystem.js - 血脉传承
 * V435 Iteration 12/15 Round 15 - Lineage Heritage
 *
 * 融合6大设计系统:
 * - generic-agent: 血脉传承自循环
 * - chatdev: 血脉传承角色协调
 * - nanobot: 血脉传承mesh
 * - claude-code: 血脉传承分析工具
 * - thunderbolt: 血脉传承持久化
 * - ruflo: 血脉传承Hook
 */

export class LineageSystem {
    constructor(config = {}) {
        this.config = { maxLineages: config.maxLineages || 50, baseGenerations: config.baseGenerations || 1, ...config };
        this.lineages = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalLineages: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getLineage', (ctx) => this.getLineage(ctx.lineageId));
        this.registerTool('establishLineage', (ctx) => this.establishLineage(ctx));
    }

    establishLineage(data) {
        const id = data.id || `lng_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const lineage = {
            lineageId: id,
            ancestorId: data.ancestorId,
            name: data.name || 'Unnamed Lineage',
            generations: data.generations !== undefined ? data.generations : this.config.baseGenerations,
            members: data.members ? [...data.members] : [],
            strength: data.strength !== undefined ? data.strength : 10,
            purity: data.purity !== undefined ? data.purity : 50,
            status: data.status || 'growing',
            createdAt: Date.now()
        };
        this.lineages.set(id, lineage);
        this.stats.totalLineages++;
        this._triggerHook('lineageEstablished', { lineageId: id });
        return { success: true, lineage };
    }

    getLineage(id) {
        const lineage = this.lineages.get(id);
        if (!lineage) return null;
        return { ...lineage, members: [...lineage.members] };
    }

    listLineages() { return Array.from(this.lineages.values()).map(l => ({ ...l, members: [...l.members] })); }
    listByAncestor(ancestorId) { return Array.from(this.lineages.values()).filter(l => l.ancestorId === ancestorId).map(l => ({ ...l, members: [...l.members] })); }
    listByGeneration(min) { return Array.from(this.lineages.values()).filter(l => l.generations >= min).map(l => ({ ...l, members: [...l.members] })); }
    listByStatus(status) { return Array.from(this.lineages.values()).filter(l => l.status === status).map(l => ({ ...l, members: [...l.members] })); }

    addMember(lineageId, memberId) {
        const lineage = this.lineages.get(lineageId);
        if (!lineage) return { success: false, error: 'LINEAGE_NOT_FOUND' };
        lineage.members.push(memberId);
        this._triggerHook('memberAdded', { lineageId, memberId, totalMembers: lineage.members.length });
        return { success: true };
    }

    increaseStrength(lineageId, amount = 5) {
        const lineage = this.lineages.get(lineageId);
        if (!lineage) return { success: false, error: 'LINEAGE_NOT_FOUND' };
        lineage.strength += amount;
        this._triggerHook('strengthIncreased', { lineageId, newStrength: lineage.strength });
        return { success: true };
    }

    passBloodline(lineageId, amount = 5) {
        const lineage = this.lineages.get(lineageId);
        if (!lineage) return { success: false, error: 'LINEAGE_NOT_FOUND' };
        lineage.purity += amount;
        this._triggerHook('bloodlinePassed', { lineageId, newPurity: lineage.purity });
        return { success: true };
    }

    declineLineage(lineageId) {
        const lineage = this.lineages.get(lineageId);
        if (!lineage) return { success: false, error: 'LINEAGE_NOT_FOUND' };
        lineage.status = 'declining';
        return { success: true };
    }

    calculateLineagePower(lineageId) {
        const lineage = this.lineages.get(lineageId);
        if (!lineage) return 0;
        return lineage.generations * 100 + lineage.members.length * 10 + lineage.strength + lineage.purity;
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
        if (this.stats.totalLineages < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxLineages += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { lineages: Array.from(this.lineages.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.lineages) this.lineages = new Map(data.lineages);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, lineageCount: this.lineages.size }; }
}
