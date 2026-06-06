/**
 * SectInfluence.js - 宗门影响力系统
 * V494 Iteration 11/15 Round 19 - Sect Influence System
 *
 * 融合6大设计系统:
 * - generic-agent: 宗门影响力循环
 * - chatdev: 宗门势力协调
 * - nanobot: 宗门影响力mesh
 * - claude-code: 宗门影响力分析工具
 * - thunderbolt: 宗门影响力持久化
 * - ruflo: 宗门影响力Hook
 */

export class SectInfluence {
    constructor(config = {}) {
        this.config = { maxInfluences: config.maxInfluences || 100, basePower: config.basePower || 10, ...config };
        this.influences = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalInfluences: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getInfluence', (ctx) => this.getInfluence(ctx.influenceId));
        this.registerTool('spreadInfluence', (ctx) => this.spreadInfluence(ctx));
    }

    spreadInfluence(data) {
        const id = data.influenceId || data.id || `inf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const subjects = Array.isArray(data.subjects) ? [...data.subjects] : [];
        const influence = {
            influenceId: id,
            sectId: data.sectId,
            name: data.name || 'Unnamed Influence',
            region: data.region || 'unknown',
            power: typeof data.power === 'number' ? data.power : this.config.basePower,
            subjects,
            status: data.status || 'expanding',
            createdAt: Date.now()
        };
        this.influences.set(id, influence);
        this.stats.totalInfluences++;
        this._triggerHook('influenceSpread', { influenceId: id });
        return { success: true, influence };
    }

    getInfluence(id) {
        const i = this.influences.get(id);
        return i ? { ...i, subjects: [...i.subjects] } : null;
    }

    listInfluences() {
        return Array.from(this.influences.values()).map(i => ({ ...i, subjects: [...i.subjects] }));
    }

    listBySect(sectId) {
        return Array.from(this.influences.values())
            .filter(i => i.sectId === sectId)
            .map(i => ({ ...i, subjects: [...i.subjects] }));
    }

    listDominant() {
        return Array.from(this.influences.values())
            .filter(i => i.status === 'dominant')
            .map(i => ({ ...i, subjects: [...i.subjects] }));
    }

    increasePower(influenceId, amount = 10) {
        const influence = this.influences.get(influenceId);
        if (!influence) return { success: false, error: 'INFLUENCE_NOT_FOUND' };
        influence.power += amount;
        this._triggerHook('powerIncreased', { influenceId, newPower: influence.power });
        return { success: true };
    }

    addSubject(influenceId, subject) {
        const influence = this.influences.get(influenceId);
        if (!influence) return { success: false, error: 'INFLUENCE_NOT_FOUND' };
        influence.subjects.push(subject);
        this._triggerHook('subjectAdded', { influenceId, subject });
        return { success: true };
    }

    weakenInfluence(influenceId) {
        const influence = this.influences.get(influenceId);
        if (!influence) return { success: false, error: 'INFLUENCE_NOT_FOUND' };
        influence.status = 'weakening';
        this._triggerHook('influenceWeakened', { influenceId });
        return { success: true };
    }

    calculateInfluenceValue(influenceId) {
        const influence = this.influences.get(influenceId);
        if (!influence) return 0;
        return influence.power * 2 + influence.subjects.length * 5;
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
        if (this.stats.totalInfluences < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxInfluences += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { influences: Array.from(this.influences.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.influences) this.influences = new Map(data.influences);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, influenceCount: this.influences.size }; }
}
