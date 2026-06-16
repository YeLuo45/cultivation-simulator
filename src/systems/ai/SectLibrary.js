/**
 * SectLibrary.js - 宗门典籍
 * V479 Iteration 11/15 Round 18
 */
export class SectLibrary {
    constructor(config = {}) {
        this.config = { maxScrolls: config.maxScrolls || 200, baseLevel: config.baseLevel || 1, ...config };
        this.scrolls = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalScrolls: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getScroll', (ctx) => this.getScroll(ctx.scrollId));
        this.registerTool('archiveScroll', (ctx) => this.archiveScroll(ctx));
    }

    archiveScroll(data) {
        const id = data.id || `scr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const scroll = { scrollId: id, sectId: data.sectId, name: data.name || 'Mysterious Scroll', type: data.type || 'technique', level: data.level || this.config.baseLevel, mastery: data.mastery || 0, status: data.status || 'sealed', createdAt: Date.now() };
        this.scrolls.set(id, scroll);
        this.stats.totalScrolls++;
        this._triggerHook('scrollArchived', { scrollId: id });
        return { success: true, scroll };
    }

    getScroll(id) { return this.scrolls.get(id) ? { ...this.scrolls.get(id) } : null; }
    listScrolls() { return Array.from(this.scrolls.values()).map(s => ({ ...s })); }
    listBySect(sectId) { return Array.from(this.scrolls.values()).filter(s => s.sectId === sectId).map(s => ({ ...s })); }
    listByType(type) { return Array.from(this.scrolls.values()).filter(s => s.type === type).map(s => ({ ...s })); }

    readScroll(scrollId, amount = 5) {
        const scroll = this.scrolls.get(scrollId);
        if (!scroll) return { success: false, error: 'SCROLL_NOT_FOUND' };
        scroll.mastery += amount;
        scroll.status = 'reading';
        this._triggerHook('scrollRead', { scrollId, newMastery: scroll.mastery });
        return { success: true };
    }

    levelUpScroll(scrollId) {
        const scroll = this.scrolls.get(scrollId);
        if (!scroll) return { success: false, error: 'SCROLL_NOT_FOUND' };
        scroll.level++;
        this._triggerHook('scrollLeveled', { scrollId, newLevel: scroll.level });
        return { success: true };
    }

    sealScroll(scrollId) {
        const scroll = this.scrolls.get(scrollId);
        if (!scroll) return { success: false, error: 'SCROLL_NOT_FOUND' };
        scroll.status = 'sealed';
        this._triggerHook('scrollSealed', { scrollId });
        return { success: true };
    }

    masterScroll(scrollId) {
        const scroll = this.scrolls.get(scrollId);
        if (!scroll) return { success: false, error: 'SCROLL_NOT_FOUND' };
        scroll.status = 'mastered';
        this._triggerHook('scrollMastered', { scrollId });
        return { success: true };
    }

    calculateKnowledgeValue(scrollId) {
        const scroll = this.scrolls.get(scrollId);
        if (!scroll) return 0;
        return scroll.level * 100 + scroll.mastery;
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
