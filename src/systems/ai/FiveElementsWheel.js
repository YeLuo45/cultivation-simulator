/**
 * FiveElementsWheel.js - 五行相生相克
 * V360 Iteration 3/9 Round 9
 */
export class FiveElementsWheel {
    constructor(config = {}) {
        this.config = { ...config };
        this.elements = ['metal', 'wood', 'water', 'fire', 'earth'];
        this.generates = { metal: 'water', water: 'wood', wood: 'fire', fire: 'earth', earth: 'metal' };
        this.overcomes = { metal: 'wood', wood: 'earth', earth: 'water', water: 'fire', fire: 'metal' };
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalChecks: 0, evolutionCount: 0 };
        this._registerDefaultTools();
    }

    _registerDefaultTools() {
        this.registerTool('getRelation', (ctx) => this.getRelation(ctx.from, ctx.to));
        this.registerTool('listElements', () => [...this.elements]);
    }

    getRelation(from, to) {
        if (!this.elements.includes(from) || !this.elements.includes(to)) return null;
        if (this.generates[from] === to) return 'generates';
        if (this.overcomes[from] === to) return 'overcomes';
        if (this.generates[to] === from) return 'generated_by';
        if (this.overcomes[to] === from) return 'overcome_by';
        return 'neutral';
    }

    getGenerates(elem) { return this.elements.includes(elem) ? this.generates[elem] : null; }
    getOvercomes(elem) { return this.elements.includes(elem) ? this.overcomes[elem] : null; }
    listElements() { return [...this.elements]; }
    getGeneratedBy(elem) { return Object.keys(this.generates).find(k => this.generates[k] === elem) || null; }
    getOvercomeBy(elem) { return Object.keys(this.overcomes).find(k => this.overcomes[k] === elem) || null; }

    calculatePowerBonus(attacker, defender) {
        const relation = this.getRelation(attacker, defender);
        if (relation === 'overcomes') return 1.5;
        if (relation === 'overcome_by') return 0.5;
        if (relation === 'generates') return 1.2;
        if (relation === 'generated_by') return 0.8;
        return 1.0;
    }

    findStrongAgainst(elem) {
        if (!this.elements.includes(elem)) return null;
        return this.overcomes[elem];
    }

    findWeakTo(elem) {
        if (!this.elements.includes(elem)) return null;
        return this.generates[elem];
    }

    analyzeBalance(elementCounts) {
        const total = this.elements.reduce((s, e) => s + (elementCounts[e] || 0), 0);
        if (total === 0) return { balanced: false, dominant: null };
        const sorted = this.elements.map(e => ({ element: e, count: elementCounts[e] || 0, ratio: (elementCounts[e] || 0) / total })).sort((a, b) => b.count - a.count);
        return { balanced: sorted[0].ratio < 0.5, dominant: sorted[0].element, distribution: sorted };
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
        if (this.stats.totalChecks < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, elementCount: this.elements.length }; }
}