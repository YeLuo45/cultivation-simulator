/**
 * CultivationCurse.js - 修真诅咒系统
 * V703 Iteration 26/30 Round 28
 */
export class CultivationCurse {
    constructor(config = {}) {
        this.config = { maxCurses: config.maxCurses || 20, baseSeverity: config.baseSeverity || 20, ...config };
        this.curses = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCurses: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCurse', (ctx) => this.getCurse(ctx.curseId));
        this.registerTool('recruitCurse', (ctx) => this.recruitCurse(ctx));
    }

    recruitCurse(data) {
        const id = data.curseId || `crs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const curse = {
            curseId: id,
            masterId: data.masterId,
            name: data.name,
            type: data.type || 'venom',
            severity: data.severity || this.config.baseSeverity,
            marks: data.marks || [],
            level: data.level || 1,
            status: data.status || 'novice',
            createdAt: Date.now()
        };
        this.curses.set(id, curse);
        this.stats.totalCurses++;
        this._triggerHook('curseRecruited', { curseId: id });
        return { success: true, curse };
    }

    getCurse(id) { return this.curses.get(id) ? { ...this.curses.get(id) } : null; }
    listCurses() { return Array.from(this.curses.values()).map(c => ({ ...c })); }
    listByMaster(masterId) { return Array.from(this.curses.values()).filter(c => c.masterId === masterId).map(c => ({ ...c })); }
    listLegendary() { return Array.from(this.curses.values()).filter(c => c.status === 'legendary').map(c => ({ ...c })); }

    addMark(curseId, mark) {
        const curse = this.curses.get(curseId);
        if (!curse) return { success: false, error: 'CURSE_NOT_FOUND' };
        curse.marks.push(mark);
        this._triggerHook('markAdded', { curseId, mark });
        return { success: true };
    }

    raiseSeverity(curseId, amount = 5) {
        const curse = this.curses.get(curseId);
        if (!curse) return { success: false, error: 'CURSE_NOT_FOUND' };
        curse.severity += amount;
        this._triggerHook('severityRaised', { curseId, newSeverity: curse.severity });
        return { success: true };
    }

    levelUpCurse(curseId) {
        const curse = this.curses.get(curseId);
        if (!curse) return { success: false, error: 'CURSE_NOT_FOUND' };
        curse.level++;
        this._triggerHook('curseLeveledUp', { curseId, newLevel: curse.level });
        return { success: true };
    }

    legendCurse(curseId) {
        const curse = this.curses.get(curseId);
        if (!curse) return { success: false, error: 'CURSE_NOT_FOUND' };
        curse.status = 'legendary';
        this._triggerHook('curseLegendized', { curseId });
        return { success: true };
    }

    calculateCurseValue(curseId) {
        const curse = this.curses.get(curseId);
        if (!curse) return 0;
        return curse.level * 100 + curse.severity * 2 + curse.marks.length * 30;
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
        if (this.stats.totalCurses < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxCurses += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { curses: Array.from(this.curses.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.curses) this.curses = new Map(data.curses);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, curseCount: this.curses.size }; }
}
