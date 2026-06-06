/**
 * CalligraphyCultivation.js - 书法修炼
 * V439 Iteration 1/15 Round 16 - Calligraphy Cultivation
 */
export class CalligraphyCultivation {
    constructor(config = {}) {
        this.config = { maxScrolls: config.maxScrolls || 200, baseStrokes: config.baseStrokes || 20, ...config };
        this.scrolls = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalScrolls: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getScroll', (ctx) => this.getScroll(ctx.scrollId));
        this.registerTool('writeScroll', (ctx) => this.writeScroll(ctx));
    }

    writeScroll(data) {
        const id = data.id || `scr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const scroll = { scrollId: id, writerId: data.writerId, name: data.name || 'Untitled Scroll', script: data.script || 'regular', strokes: data.strokes || this.config.baseStrokes, energy: data.energy || 0, mastery: 0, status: 'drafted', writtenAt: Date.now() };
        this.scrolls.set(id, scroll);
        this.stats.totalScrolls++;
        this._triggerHook('scrollWritten', { scrollId: id });
        return { success: true, scroll };
    }

    getScroll(id) { return this.scrolls.get(id) ? { ...this.scrolls.get(id) } : null; }
    listScrolls() { return Array.from(this.scrolls.values()).map(s => ({ ...s })); }
    listByScript(script) { return Array.from(this.scrolls.values()).filter(s => s.script === script).map(s => ({ ...s })); }
    listByWriter(writerId) { return Array.from(this.scrolls.values()).filter(s => s.writerId === writerId).map(s => ({ ...s })); }

    practiceScroll(scrollId, amount = 5) {
        const scroll = this.scrolls.get(scrollId);
        if (!scroll) return { success: false, error: 'SCROLL_NOT_FOUND' };
        scroll.mastery += amount;
        this._triggerHook('scrollPracticed', { scrollId, newMastery: scroll.mastery });
        return { success: true };
    }

    channelEnergy(scrollId, amount = 10) {
        const scroll = this.scrolls.get(scrollId);
        if (!scroll) return { success: false, error: 'SCROLL_NOT_FOUND' };
        scroll.energy += amount;
        this._triggerHook('energyChanneled', { scrollId, newEnergy: scroll.energy });
        return { success: true };
    }

    inkScroll(scrollId) {
        const scroll = this.scrolls.get(scrollId);
        if (!scroll) return { success: false, error: 'SCROLL_NOT_FOUND' };
        scroll.status = 'inked';
        this._triggerHook('scrollInked', { scrollId });
        return { success: true };
    }

    calculateCalligraphicPower(scrollId) {
        const scroll = this.scrolls.get(scrollId);
        if (!scroll) return 0;
        return scroll.strokes * (1 + scroll.mastery / 100) + scroll.energy;
    }

    listInked() { return Array.from(this.scrolls.values()).filter(s => s.status === 'inked').map(s => ({ ...s })); }

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
        if (this.stats.totalScrolls < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxScrolls += 30;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { scrolls: Array.from(this.scrolls.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.scrolls) this.scrolls = new Map(data.scrolls);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, scrollCount: this.scrolls.size }; }
}
