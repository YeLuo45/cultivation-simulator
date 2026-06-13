/**
 * CurseBreaking.js - 破咒系统
 * V457 Iteration 4/15 Round 17
 */
export class CurseBreaking {
    constructor(config = {}) {
        this.config = { maxCurses: config.maxCurses || 100, baseIntensity: config.baseIntensity || 20, ...config };
        this.curses = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalCurses: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getCurse', (ctx) => this.getCurse(ctx.curseId));
        this.registerTool('detectCurse', (ctx) => this.detectCurse(ctx));
    }

    detectCurse(data) {
        const id = data.curseId || `crs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const curse = {
            curseId: id,
            breakerId: data.breakerId,
            name: data.name,
            type: data.type || 'blood',
            intensity: data.intensity || this.config.baseIntensity,
            duration: data.duration || 100,
            victims: data.victims || [],
            status: 'active',
            createdAt: Date.now()
        };
        this.curses.set(id, curse);
        this.stats.totalCurses++;
        this._triggerHook('curseDetected', { curseId: id });
        return { success: true, curse };
    }

    getCurse(id) { return this.curses.get(id) ? { ...this.curses.get(id) } : null; }
    listCurses() { return Array.from(this.curses.values()).map(c => ({ ...c })); }
    listByBreaker(breakerId) { return Array.from(this.curses.values()).filter(c => c.breakerId === breakerId).map(c => ({ ...c })); }
    listByType(type) { return Array.from(this.curses.values()).filter(c => c.type === type).map(c => ({ ...c })); }

    weakenCurse(curseId, amount = 5) {
        const curse = this.curses.get(curseId);
        if (!curse) return { success: false, error: 'CURSE_NOT_FOUND' };
        curse.intensity = Math.max(0, curse.intensity - amount);
        curse.status = 'weakened';
        this._triggerHook('curseWeakened', { curseId, newIntensity: curse.intensity });
        return { success: true };
    }

    shortenCurse(curseId, amount = 10) {
        const curse = this.curses.get(curseId);
        if (!curse) return { success: false, error: 'CURSE_NOT_FOUND' };
        curse.duration = Math.max(0, curse.duration - amount);
        this._triggerHook('curseShortened', { curseId, newDuration: curse.duration });
        return { success: true };
    }

    addVictim(curseId, victim) {
        const curse = this.curses.get(curseId);
        if (!curse) return { success: false, error: 'CURSE_NOT_FOUND' };
        curse.victims.push(victim);
        return { success: true };
    }

    removeCurse(curseId) {
        const curse = this.curses.get(curseId);
        if (!curse) return { success: false, error: 'CURSE_NOT_FOUND' };
        curse.status = 'removed';
        this._triggerHook('curseRemoved', { curseId });
        return { success: true };
    }

    calculateCurseSeverity(curseId) {
        const curse = this.curses.get(curseId);
        if (!curse) return 0;
        return curse.intensity * (1 + curse.duration / 100) + curse.victims.length * 5;
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
