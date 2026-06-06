/**
 * CultivationUnion.js - 修真联盟
 * V555 Iteration 18/20 Round 22
 */

export class CultivationUnion {
    constructor(config = {}) {
        this.config = { maxUnions: config.maxUnions || 20, baseStrength: config.baseStrength || 20, ...config };
        this.unions = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalUnions: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getUnion', (ctx) => this.getUnion(ctx.unionId));
        this.registerTool('openUnion', (ctx) => this.openUnion(ctx));
    }

    openUnion(data) {
        const id = data.id || `uni_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const union = {
            unionId: id,
            founderId: data.founderId,
            name: data.name || '无名联盟',
            type: data.type || 'alliance',
            strength: data.strength || this.config.baseStrength,
            members: data.members || [],
            level: data.level || 1,
            status: 'forming',
            createdAt: Date.now()
        };
        this.unions.set(id, union);
        this.stats.totalUnions++;
        this._triggerHook('unionOpened', { unionId: id });
        return { success: true, union };
    }

    getUnion(id) { return this.unions.get(id) ? { ...this.unions.get(id) } : null; }
    listUnions() { return Array.from(this.unions.values()).map(u => ({ ...u })); }
    listByFounder(founderId) { return Array.from(this.unions.values()).filter(u => u.founderId === founderId).map(u => ({ ...u })); }
    listStable() { return Array.from(this.unions.values()).filter(u => u.status === 'stable' || u.status === 'eternal').map(u => ({ ...u })); }

    addMember(unionId, member) {
        const union = this.unions.get(unionId);
        if (!union) return { success: false, error: 'UNION_NOT_FOUND' };
        union.members.push(member);
        this._triggerHook('memberAdded', { unionId, member });
        return { success: true };
    }

    increaseStrength(unionId, amount = 5) {
        const union = this.unions.get(unionId);
        if (!union) return { success: false, error: 'UNION_NOT_FOUND' };
        union.strength += amount;
        if (union.status === 'forming' && union.members.length > 0) union.status = 'stable';
        this._triggerHook('strengthIncreased', { unionId, newStrength: union.strength });
        return { success: true };
    }

    levelUpUnion(unionId) {
        const union = this.unions.get(unionId);
        if (!union) return { success: false, error: 'UNION_NOT_FOUND' };
        union.level++;
        this._triggerHook('unionLeveledUp', { unionId, newLevel: union.level });
        return { success: true };
    }

    eternizeUnion(unionId) {
        const union = this.unions.get(unionId);
        if (!union) return { success: false, error: 'UNION_NOT_FOUND' };
        union.status = 'eternal';
        this._triggerHook('unionEternalized', { unionId });
        return { success: true };
    }

    calculateUnionPower(unionId) {
        const union = this.unions.get(unionId);
        if (!union) return 0;
        return union.level * 100 + union.strength * 2 + union.members.length * 30;
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
        if (this.stats.totalUnions < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxUnions += 20;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { unions: Array.from(this.unions.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.unions) this.unions = new Map(data.unions);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, unionCount: this.unions.size }; }
}
