/**
 * ElementalCore.js - 五行核心
 * V358 Iteration 1/9 Round 9 - Elemental Core
 *
 * 融合6大设计系统:
 * - generic-agent: 五行自循环
 * - chatdev: 元素协调
 * - nanobot: 五行mesh
 * - claude-code: 元素分析工具
 * - thunderbolt: 元素持久化
 * - ruflo: 元素Hook
 */

export class ElementalCore {
    constructor(config = {}) {
        this.config = { baseAffinity: config.baseAffinity || 0.5, maxLevel: config.maxLevel || 100, ...config };
        this.elements = new Map();
        this.cultivators = new Map();
        this.tools = new Map();
        this.hooks = new Map();
        this.stats = { totalElements: 0, evolutionCount: 0 };
        this._registerDefaults();
        this._registerDefaultTools();
    }

    _registerDefaults() {
        const defaults = [
            { elementId: 'metal', name: 'Metal (金)', color: '#FFD700' },
            { elementId: 'wood', name: 'Wood (木)', color: '#00AA00' },
            { elementId: 'water', name: 'Water (水)', color: '#0066CC' },
            { elementId: 'fire', name: 'Fire (火)', color: '#FF3300' },
            { elementId: 'earth', name: 'Earth (土)', color: '#8B4513' }
        ];
        for (const e of defaults) this.elements.set(e.elementId, e);
    }

    _registerDefaultTools() {
        this.registerTool('getElement', (ctx) => this.getElement(ctx.elementId));
        this.registerTool('listElements', () => Array.from(this.elements.values()).map(e => ({...e})));
    }

    registerCultivator(data) {
        const id = data.id || `cv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const cultivator = { cultivatorId: id, name: data.name || 'Anonymous', affinities: { metal: 0, wood: 0, water: 0, fire: 0, earth: 0 }, primaryElement: null };
        this.cultivators.set(id, cultivator);
        return { success: true, cultivator };
    }

    getCultivator(id) { return this.cultivators.get(id) ? { ...this.cultivators.get(id) } : null; }
    listCultivators() { return Array.from(this.cultivators.values()).map(c => ({ ...c })); }

    getElement(id) { return this.elements.get(id) ? { ...this.elements.get(id) } : null; }
    listElements() { return Array.from(this.elements.values()).map(e => ({ ...e })); }

    addElement(data) {
        const id = data.id || `el_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const element = { elementId: id, name: data.name || 'Element', color: data.color || '#FFFFFF' };
        this.elements.set(id, element);
        this.stats.totalElements++;
        this._triggerHook('elementAdded', { elementId: id });
        return { success: true, element };
    }

    setAffinity(cultivatorId, elementId, value) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return { success: false, error: 'CULTIVATOR_NOT_FOUND' };
        if (!this.elements.has(elementId)) return { success: false, error: 'ELEMENT_NOT_FOUND' };
        cultivator.affinities[elementId] = Math.max(0, Math.min(1, value));
        cultivator.primaryElement = this._findPrimary(cultivator);
        this._triggerHook('affinityChanged', { cultivatorId, elementId, value });
        return { success: true, cultivator: { ...cultivator } };
    }

    _findPrimary(cultivator) {
        let max = -1, primary = null;
        for (const [key, value] of Object.entries(cultivator.affinities)) {
            if (value > max) { max = value; primary = key; }
        }
        return max > 0 ? primary : null;
    }

    getAffinity(cultivatorId, elementId) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return null;
        return cultivator.affinities[elementId] || 0;
    }

    getPrimaryElement(cultivatorId) {
        const cultivator = this.cultivators.get(cultivatorId);
        if (!cultivator) return null;
        return cultivator.primaryElement;
    }

    listByElement(elementId) {
        return Array.from(this.cultivators.values()).filter(c => c.primaryElement === elementId).map(c => ({ ...c }));
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
        if (this.stats.totalElements < 5) return { evolved: false };
        if (this.stats.evolutionCount > 0) return { evolved: false, reason: 'ALREADY_EVOLVED' };
        this.config.maxLevel += 50;
        this.stats.evolutionCount++;
        this._triggerHook('systemEvolved', { generation: this.stats.evolutionCount });
        return { evolved: true, generation: this.stats.evolutionCount };
    }

    toJSON() { return { elements: Array.from(this.elements.entries()), cultivators: Array.from(this.cultivators.entries()), stats: this.stats, config: this.config }; }
    fromJSON(data) {
        if (data.elements) this.elements = new Map(data.elements);
        if (data.cultivators) this.cultivators = new Map(data.cultivators);
        if (data.stats) this.stats = data.stats;
        if (data.config) this.config = { ...this.config, ...data.config };
        return { success: true };
    }
    getStats() { return { ...this.stats, elementCount: this.elements.size, cultivatorCount: this.cultivators.size }; }
}