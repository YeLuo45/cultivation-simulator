/**
 * CultivationMark.js - 修真标记系统
 * V765 Iteration 28/30 Round 30 - Cultivation Mark
 */

export class CultivationMark {
    constructor(config = {}) {
        this.config = { maxMarks: config.maxMarks || 20, baseSharpness: config.baseSharpness || 20, ...config };
        this.marks = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalMarks: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getMark', (ctx) => this.getMark(ctx.markId));
        this.registerTool('recruitMark', (ctx) => this.recruitMark(ctx));
    }

    recruitMark(data) {
        const id = data.markId || `mark_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const mark = {
            markId: id,
            masterId: data.masterId,
            name: data.name || 'Unnamed Mark',
            type: data.type || 'personal',
            sharpness: data.sharpness || this.config.baseSharpness,
            scars: data.scars || [],
            level: 1,
            status: 'novice',
            createdAt: Date.now()
        };
        this.marks.set(id, mark);
        this.stats.totalMarks++;
        this._triggerHook('markRecruited', { markId: id });
        return { success: true, mark };
    }

    getMark(id) { return this.marks.get(id) ? { ...this.marks.get(id) } : null; }
    listMarks() { return Array.from(this.marks.values()).map(m => ({ ...m })); }
    listByMaster(masterId) { return Array.from(this.marks.values()).filter(m => m.masterId === masterId).map(m => ({ ...m })); }
    listLegendary() { return Array.from(this.marks.values()).filter(m => m.status === 'legendary').map(m => ({ ...m })); }

    addScar(markId, scar) {
        const mark = this.marks.get(markId);
        if (!mark) return { success: false, error: 'MARK_NOT_FOUND' };
        mark.scars.push(scar);
        this._triggerHook('scarAdded', { markId, scar });
        return { success: true, mark: { ...mark } };
    }

    raiseSharpness(markId, amount = 5) {
        const mark = this.marks.get(markId);
        if (!mark) return { success: false, error: 'MARK_NOT_FOUND' };
        mark.sharpness += amount;
        this._triggerHook('sharpnessRaised', { markId, newSharpness: mark.sharpness });
        return { success: true };
    }

    levelUpMark(markId) {
        const mark = this.marks.get(markId);
        if (!mark) return { success: false, error: 'MARK_NOT_FOUND' };
        mark.level++;
        this._triggerHook('markLeveledUp', { markId, newLevel: mark.level });
        return { success: true };
    }

    legendMark(markId) {
        const mark = this.marks.get(markId);
        if (!mark) return { success: false, error: 'MARK_NOT_FOUND' };
        mark.status = 'legendary';
        this._triggerHook('markLegendized', { markId });
        return { success: true };
    }

    calculateMarkValue(markId) {
        const mark = this.marks.get(markId);
        if (!mark) return 0;
        return mark.level * 100 + mark.sharpness * 2 + mark.scars.length * 30;
    }

    listByType(type) { return Array.from(this.marks.values()).filter(m => m.type === type).map(m => ({ ...m })); }
    listVeteran() { return Array.from(this.marks.values()).filter(m => m.status === 'veteran').map(m => ({ ...m })); }

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
        if (this.stats.totalMarks < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxMarks += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { marks: Array.from(this.marks.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.marks) this.marks = new Map(data.marks);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, markCount: this.marks.size }; }
}
